/**
 * ════════════════════════════════════════════════════════════════════
 *  أدوات مشتركة لدوال Netlify — التحقق من الأدمن واتصال R2
 *
 *  🔴 كل الأسرار تُقرأ من متغيّرات البيئة فقط. لا تُكتب أبداً في الكود.
 * ════════════════════════════════════════════════════════════════════
 */

const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

/** مفتاح Firebase الويب — عام by design، ويُقرأ من البيئة إن وُجد */
const FIREBASE_WEB_API_KEY =
  process.env.FIREBASE_WEB_API_KEY || "AIzaSyAvZTkX0dG-p5uHAO6IaU17Inl2GnLHY3E";

/** بريد(ات) الأدمن المسموح — مفصولة بفواصل */
function adminEmails() {
  return (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** معرّفات الأدمن الإضافية (اختياري) */
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
  const header = event.headers?.authorization || event.headers?.Authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) throw new HttpError(401, "يجب تسجيل الدخول.");

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
    throw new HttpError(503, "تعذّر الاتصال بخدمة المصادقة.");
  }

  if (!res.ok) throw new HttpError(401, "انتهت الجلسة. سجّل الدخول من جديد.");

  const data = await res.json();
  const user = data?.users?.[0];
  if (!user?.localId) throw new HttpError(401, "جلسة غير صالحة.");

  const email = (user.email || "").toLowerCase();
  const allowedEmails = adminEmails();
  const allowedUids = adminUids();

  if (allowedEmails.length === 0 && allowedUids.length === 0) {
    throw new HttpError(503, "لم يُضبط ADMIN_EMAILS على الخادم.");
  }

  const isAdmin =
    (email && allowedEmails.includes(email)) || allowedUids.includes(user.localId);

  if (!isAdmin) throw new HttpError(403, "هذا الحساب غير مُخوَّل لإدارة الصور.");

  return { uid: user.localId, email };
}

function r2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const key = process.env.R2_KEY;
  const secret = process.env.R2_SECRET;
  if (!accountId || !key || !secret) {
    throw new HttpError(503, "أسرار R2 غير مضبوطة على الخادم (R2_ACCOUNT_ID/R2_KEY/R2_SECRET).");
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
  // اسم الحاوية الافتراضي "images" — можно переопределить عبر R2_BUCKET
  const name = (process.env.R2_BUCKET || "images").trim();
  if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(name)) {
    throw new HttpError(500, "اسم الحاوية غير صالح.");
  }
  return name;
}

function publicBase() {
  const base = (process.env.R2_PUBLIC_URL || "").trim().replace(/\/+$/, "");
  if (!base) throw new HttpError(503, "R2_PUBLIC_URL غير مضبوط على الخادم.");
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
    return JSON.parse(event.body || "{}");
  } catch {
    throw new HttpError(400, "جسم الطلب غير صالح.");
  }
}

module.exports = {
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
