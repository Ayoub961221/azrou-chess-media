import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/** مفتاح Firebase الويب العام */
const FIREBASE_WEB_API_KEY =
  process.env.FIREBASE_WEB_API_KEY || "AIzaSyAvZTkX0dG-p5uHAO6IaU17Inl2GnLHY3E";

const FIREBASE_DB_URL =
  process.env.FIREBASE_DB_URL ||
  "https://azrou-chess-club-default-rtdb.firebaseio.com";

function adminEmails() {
  return (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function adminUids() {
  return (process.env.ADMIN_UIDS || "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
}

function corsHeaders(event) {
  const origin = event?.headers?.origin || event?.headers?.Origin || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

function json(status, body, event) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(event),
    },
    body: JSON.stringify(body),
  };
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** يتحقق من توكن Firebase عبر accounts:lookup ويعيد المستخدم */
async function verifyAdmin(event) {
  const header = event?.headers?.authorization || event?.headers?.Authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) throw new HttpError(401, "يجب تسجيل الدخول أولاً.");

  let res;
  try {
    res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_WEB_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      }
    );
  } catch {
    throw new HttpError(503, "تعذّر الاتصال بخدمة المصادقة في Firebase.");
  }

  if (!res.ok) throw new HttpError(401, "انتهت الجلسة. سجّل الدخول من جديد.");

  const data = await res.json();
  const user = data?.users?.[0];
  if (!user?.localId) throw new HttpError(401, "جلسة غير صالحة.");

  const email = (user.email || "").toLowerCase();
  const allowedEmails = adminEmails();
  const allowedUids = adminUids();

  // فحص 1: هل يطابق UID أو البريد المسجّل
  let isAdmin =
    allowedUids.includes(user.localId) ||
    (email && allowedEmails.includes(email));

  // فحص 2: التحقق من عقدة admins في Realtime Database
  if (!isAdmin) {
    try {
      const dbRes = await fetch(
        `${FIREBASE_DB_URL}/admins/${user.localId}.json?auth=${encodeURIComponent(token)}`
      );
      if (dbRes.ok && (await dbRes.json()) === true) {
        isAdmin = true;
      }
    } catch {
      /* ignore */
    }
  }

  if (!isAdmin) {
    throw new HttpError(
      403,
      `الحساب (${email || user.localId}) غير مُخوَّل لإدارة الصور. يجب إضافة البريد إلى ADMIN_EMAILS في Netlify.`
    );
  }

  return { uid: user.localId, email };
}

function r2AccountId() {
  const accountId = (process.env.R2_ACCOUNT_ID || "").trim();
  if (!accountId) {
    throw new HttpError(
      503,
      "متغيّر R2_ACCOUNT_ID غير مضبوط على Netlify: يجب إضافته في Site configuration ← Environment variables."
    );
  }
  return accountId;
}

function r2Client() {
  const accountId = r2AccountId();
  const key = (process.env.R2_KEY || "").trim();
  const secret = (process.env.R2_SECRET || "").trim();

  if (!key) {
    throw new HttpError(
      503,
      "متغيّر R2_KEY غير مضبوط على Netlify: يجب إضافته في Site configuration ← Environment variables."
    );
  }
  if (!secret) {
    throw new HttpError(
      503,
      "متغيّر R2_SECRET غير مضبوط على Netlify: يجب إضافته في Site configuration ← Environment variables."
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: key, secretAccessKey: secret },
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

function bucket() {
  const name = (process.env.R2_BUCKET || "images").trim();
  if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(name)) {
    throw new HttpError(500, "اسم الحاوية غير صالح.");
  }
  return name;
}

function publicBase() {
  const base = (process.env.R2_PUBLIC_URL || "").trim().replace(/\/+$/, "");
  if (!base) {
    throw new HttpError(
      503,
      "متغيّر R2_PUBLIC_URL غير مضبوط على Netlify: يجب إضافته في Site configuration ← Environment variables."
    );
  }
  return base;
}

/** ينظّف اسم الملف ويولّد مفتاحاً فريداً */
function buildKey(filename) {
  const dot = String(filename || "").lastIndexOf(".");
  const base = dot > 0 ? filename.slice(0, dot) : "image";
  const ext = dot > 0 ? filename.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "bin";
  const clean =
    base
      .normalize("NFKD")
      .replace(/[^\w-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60)
      .toLowerCase() || "image";
  const rand = Math.random().toString(36).slice(2, 8);
  return `images/img-${Date.now()}-${rand}-${clean}.${ext || "bin"}`;
}

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function readJson(event) {
  try {
    return JSON.parse(event?.body || "{}");
  } catch {
    throw new HttpError(400, "جسم الطلب غير صالح.");
  }
}

export {
  json,
  corsHeaders,
  HttpError,
  verifyAdmin,
  r2Client,
  bucket,
  publicBase,
  buildKey,
  ALLOWED_TYPES,
  readJson,
  PutObjectCommand,
  DeleteObjectCommand,
  getSignedUrl,
};
