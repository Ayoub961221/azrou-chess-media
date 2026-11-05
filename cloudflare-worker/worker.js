/**
 * ════════════════════════════════════════════════════════════════════
 *  Cloudflare Worker — رفع وحذف صور الموقع في مستودع GitHub
 *  Club Azrou Sportif d’Échecs
 * ════════════════════════════════════════════════════════════════════
 *
 *  ⚠️  لا تكتب GITHUB_TOKEN في هذا الملف إطلاقاً.
 *      يُضاف من: Settings ← Variables and Secrets ← Add (نوع Secret)
 *
 *  المسارات:
 *    GET  /github/status   فحص الاتصال وعرض المستودعات
 *    POST /github/upload   رفع صورة
 *    POST /github/delete   حذف صورة
 *
 *  الحماية (كلها على الخادم، لا يمكن تجاوزها من المتصفح):
 *    ١. التحقق الصارم من Firebase ID Token والتحقق من عقدة admins/{uid}
 *    ٢. CORS مقيّد بنطاق Netlify والنطاقات المصرحة
 *    ٣. حماية مشددة من Path Traversal بفك تشفير الرابط والتحقق الصارم
 *    ٤. تقييد المجلد والصيغ والحجم
 * ════════════════════════════════════════════════════════════════════
 */

/* ---------------- ثوابت عامة (ليست أسراراً) ---------------- */

const GITHUB_OWNER = "Ayoub961221";
const GITHUB_REPO_DEFAULT = "azrou-chess-media";
const GITHUB_BRANCH = "main";
const IMAGES_DIR = "public/images/";

const FIREBASE_API_KEY = "AIzaSyAvZTkX0dG-p5uHAO6IaU17Inl2GnLHY3E";
const DB_URL = "https://azrou-chess-club-default-rtdb.firebaseio.com";

/** معرّفات المدراء الاحتياطية */
const ADMIN_UIDS = ["NgL0Ahmn5KbfUCaUZaDpuVKp5uN2"];

/** النطاقات المصرح لها بالاتصال (CORS) */
const ALLOWED_ORIGINS = [
  "https://comfy-cajeta-5a216e.netlify.app",
  "https://azrou-chess-club.web.app",
  "https://azrou-chess-club.firebaseapp.com",
  "http://localhost:4173",
  "http://localhost:5173",
];

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

const EXT_MIME = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
};

/* ---------------- أدوات الرد و CORS ---------------- */

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // دعم نطاقات الفروع ومعاينات Netlify التابعة للموقع
  if (/^https:\/\/[a-z0-9-]+--comfy-cajeta-5a216e\.netlify\.app$/.test(origin)) {
    return true;
  }
  return false;
}

function corsHeaders(origin) {
  const allowed = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(origin),
    },
  });
}

/** خطأ يحمل رمز حالة HTTP */
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/* ---------------- المصادقة والتحقق الصارم من الصلاحيات ---------------- */

/**
 * يتحقق من توكن Firebase عبر accounts:lookup،
 * ثم يتحقق بشكل صارم جداً من صلاحية الأدمن عبر عقدة admins/{uid} في Realtime Database.
 */
async function verifyFirebaseToken(idToken) {
  if (!idToken || typeof idToken !== "string" || idToken.length < 10) {
    throw new HttpError(401, "توكن المصادقة مفقود أو غير صالح.");
  }

  let res;
  try {
    res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );
  } catch {
    throw new HttpError(503, "تعذّر الاتصال بخدمة المصادقة في Firebase.");
  }

  if (!res.ok) {
    throw new HttpError(401, "انتهت الجلسة أو أن التوكن غير صالح. سجّل الدخول من جديد.");
  }

  const data = await res.json();
  const user = data?.users?.[0];
  if (!user?.localId) {
    throw new HttpError(401, "جلسة غير صالحة.");
  }

  if (user.disabled) {
    throw new HttpError(403, "هذا الحساب معطّل من طرف الإدارة.");
  }

  const uid = user.localId;
  const email = (user.email || "").toLowerCase();

  // فحص 1: التحقق الصارم من عقدة admins/{uid} في Realtime Database
  let isDbAdmin = false;
  try {
    const adminRes = await fetch(
      `${DB_URL}/admins/${encodeURIComponent(uid)}.json?auth=${encodeURIComponent(idToken)}`
    );
    if (adminRes.ok) {
      const val = await adminRes.json();
      if (val === true) {
        isDbAdmin = true;
      }
    }
  } catch (err) {
    console.error("خطأ أثناء قراءة عقدة admins من قاعدة البيانات:", err);
  }

  // فحص 2: التحقق من القائمة الاحتياطية للمدير المصرح له
  const isFallbackAdmin = ADMIN_UIDS.includes(uid);

  // فحص 3: التحقق من custom attributes إن وجدت
  let isClaimAdmin = false;
  try {
    const claims = user.customAttributes ? JSON.parse(user.customAttributes) : {};
    if (claims.admin === true) isClaimAdmin = true;
  } catch {}

  // الفرض الصارم: يجب أن يكون مسجلاً في admins/{uid} أو القائمة المصرحة
  if (!isDbAdmin && !isFallbackAdmin && !isClaimAdmin) {
    throw new HttpError(
      403,
      `الحساب (${email || uid}) غير مُخوَّل كمسؤول في قاعدة البيانات (admins/${uid}).`
    );
  }

  return { uid, email, isAdmin: true };
}

/** استخراج التوكن والتأكد من الأدمن قبل أي عملية */
async function assertAdmin(request) {
  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) throw new HttpError(401, "يجب تسجيل الدخول أولاً.");

  return await verifyFirebaseToken(token);
}

/* ---------------- التحقق من المدخلات ومنع Path Traversal ---------------- */

function requireToken(env) {
  if (!env.GITHUB_TOKEN) {
    throw new HttpError(
      503,
      "لم يُضبط GITHUB_TOKEN على الخادم. أضفه من إعدادات الـ Worker (نوع Secret)."
    );
  }
  return env.GITHUB_TOKEN;
}

function pickRepo(env, requested) {
  const name = (requested || env.GITHUB_REPO || GITHUB_REPO_DEFAULT).trim();
  if (!/^[A-Za-z0-9._-]{1,100}$/.test(name)) {
    throw new HttpError(400, "اسم المستودع يحتوي رموزاً غير مسموحة.");
  }
  return name;
}

/** يستخرج امتداداً آمناً ويتحقق من الصيغة */
function safeExtension(fileName) {
  let name = String(fileName || "");
  try {
    name = decodeURIComponent(name);
  } catch {}

  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  if (!EXT_MIME[ext]) {
    throw new HttpError(
      415,
      "صيغة غير مدعومة. المقبول: JPG أو PNG أو WebP أو AVIF أو GIF أو SVG."
    );
  }
  return ext;
}

/** يبني مساراً آمناً للصور المرفوعة */
function buildImagePath(fileName) {
  const ext = safeExtension(fileName);
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return { path: `${IMAGES_DIR}img-${stamp}-${rand}.${ext}`, ext };
}

/**
 * يتحقق من مسار الملف ويمنع ثغرة Path Traversal وفك تشفير الروابط
 */
function assertImagePath(path) {
  if (typeof path !== "string" || !path.trim()) {
    throw new HttpError(400, "مسار الملف مفقود.");
  }

  let decodedPath = path.trim();

  // فك ترميز الرابط (URL Decode) قبل الفحص لمنع أي التفاف مشفّر مثل %2e%2e
  try {
    decodedPath = decodeURIComponent(decodedPath);
  } catch {
    throw new HttpError(400, "مسار الملف يحتوي على ترميز URL غير صالح.");
  }

  // فحص ومعالجة التشفير المزدوج أو المتكرر (مثل %252e%252e)
  try {
    while (decodedPath.includes("%")) {
      const next = decodeURIComponent(decodedPath);
      if (next === decodedPath) break;
      decodedPath = next;
    }
  } catch {}

  const p = decodedPath.trim();

  if (p.length > 300) {
    throw new HttpError(400, "مسار الملف طويل أكثر من اللازم.");
  }

  // فحص صارم لرموز التسلّق (..) ومحاولات كسر المسار
  if (p.includes("..") || p.startsWith("/") || p.includes("\\") || p.includes("//")) {
    throw new HttpError(400, "مسار الملف يحتوي تسلسلاً غير مسموح (Path Traversal).");
  }

  if (!/^[a-zA-Z0-9/._-]+$/.test(p)) {
    throw new HttpError(400, "مسار الملف يحتوي رموزاً غير مسموحة.");
  }

  if (!p.startsWith(IMAGES_DIR)) {
    throw new HttpError(403, `غير مسموح بالتعامل مع ملفات خارج ${IMAGES_DIR}`);
  }

  safeExtension(p);
  return p;
}

/** يتحقق من Base64 ويُعيد الحجم بالبايت */
function assertBase64(content) {
  if (typeof content !== "string" || !content) {
    throw new HttpError(400, "محتوى الملف مفقود.");
  }

  // نرفض data URL كاملاً — GitHub يقبل المحتوى الصافي فقط
  if (content.startsWith("data:")) {
    throw new HttpError(400, "أزل البادئة data:…;base64, قبل الإرسال.");
  }

  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(content)) {
    throw new HttpError(400, "محتوى الملف ليس Base64 صالحاً.");
  }

  const padding = content.endsWith("==") ? 2 : content.endsWith("=") ? 1 : 0;
  const size = Math.floor((content.length * 3) / 4) - padding;

  if (size > MAX_BYTES) {
    throw new HttpError(
      413,
      `حجم الملف ${(size / 1048576).toFixed(1)} ميغابايت. الحد الأقصى 5 ميغابايت.`
    );
  }

  return size;
}

/* ---------------- GitHub API ---------------- */

function ghHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "azrou-chess-club-worker",
  };
}

/** يترجم أخطاء GitHub إلى رسائل عربية واضحة */
function githubError(status, message) {
  if (status === 401) return new HttpError(401, "توكن GitHub غير صالح أو منتهي الصلاحية.");
  if (status === 403)
    return new HttpError(
      403,
      "صلاحيات التوكن لا تكفي. يحتاج إذن Contents: Read and write على المستودع."
    );
  if (status === 404)
    return new HttpError(
      404,
      `المستودع ${GITHUB_OWNER}/… غير موجود أو التوكن لا يصل إليه. تأكد أنه Public ومن صحة اسمه.`
    );
  if (status === 409 || status === 422)
    return new HttpError(409, "تعارض: ملف بنفس الاسم موجود مسبقاً.");
  return new HttpError(502, `رفض GitHub العملية: ${message || status}`);
}

async function githubPut(repo, path, contentBase64, token, fileName) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/${path}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: { ...ghHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `إضافة صورة: ${fileName || path.split("/").pop()}`,
      content: contentBase64,
      branch: GITHUB_BRANCH,
      committer: {
        name: "Azrou Chess Admin",
        email: "admin@azrou-chess-club.web.app",
      },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw githubError(res.status, data?.message);

  return {
    sha: data?.content?.sha ?? "",
    size: data?.content?.size ?? 0,
    path: data?.content?.path ?? path,
    htmlUrl: data?.content?.html_url ?? "",
    downloadUrl: data?.content?.download_url ?? "",
  };
}

async function githubDelete(repo, path, token) {
  const base = `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/${path}`;

  const getRes = await fetch(`${base}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders(token) });
  if (getRes.status === 404) return { deleted: true, alreadyMissing: true };
  if (!getRes.ok) {
    const e = await getRes.json().catch(() => ({}));
    throw githubError(getRes.status, e?.message);
  }

  const info = await getRes.json();

  const delRes = await fetch(base, {
    method: "DELETE",
    headers: { ...ghHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `حذف صورة: ${path.split("/").pop()}`,
      sha: info.sha,
      branch: GITHUB_BRANCH,
    }),
  });

  if (!delRes.ok) {
    const e = await delRes.json().catch(() => ({}));
    throw githubError(delRes.status, e?.message);
  }

  return { deleted: true, alreadyMissing: false };
}

/** يطلب من jsDelivr تحديث نسخته المخزَّنة فوراً */
async function purgeJsDelivr(repo, path) {
  await fetch(
    `https://purge.jsdelivr.net/gh/${GITHUB_OWNER}/${repo}@${GITHUB_BRANCH}/${path}`
  ).catch(() => {});
}

function cdnUrl(repo, path) {
  return `https://cdn.jsdelivr.net/gh/${GITHUB_OWNER}/${repo}@${GITHUB_BRANCH}/${path}`;
}

/* ---------------- معالجات المسارات ---------------- */

async function handleStatus(request, env, origin) {
  await assertAdmin(request);
  const token = requireToken(env);

  const meRes = await fetch("https://api.github.com/user", { headers: ghHeaders(token) });
  if (!meRes.ok) {
    const e = await meRes.json().catch(() => ({}));
    throw githubError(meRes.status, e?.message);
  }
  const me = await meRes.json();

  const reposRes = await fetch(
    "https://api.github.com/user/repos?per_page=100&sort=updated",
    { headers: ghHeaders(token) }
  );
  const repos = reposRes.ok ? await reposRes.json() : [];

  return json(
    {
      configured: true,
      login: me.login,
      owner: GITHUB_OWNER,
      repo: env.GITHUB_REPO || GITHUB_REPO_DEFAULT,
      branch: GITHUB_BRANCH,
      repos: (Array.isArray(repos) ? repos : [])
        .filter((r) => !r.private)
        .map((r) => ({ name: r.name, private: r.private, branch: r.default_branch })),
    },
    200,
    origin
  );
}

async function handleUpload(request, env, origin) {
  await assertAdmin(request);
  const token = requireToken(env);

  const body = await request.json().catch(() => ({}));
  const repo = pickRepo(env, body?.repo);
  const size = assertBase64(body?.contentBase64);
  const { path, ext } = buildImagePath(body?.fileName);

  const out = await githubPut(repo, path, body.contentBase64, token, body?.fileName);
  await purgeJsDelivr(repo, out.path);

  return json(
    {
      ok: true,
      owner: GITHUB_OWNER,
      repo,
      branch: GITHUB_BRANCH,
      path: out.path,
      fileName: out.path.split("/").pop(),
      size: out.size || size,
      contentType: EXT_MIME[ext],
      folder: body?.folder || "",
      htmlUrl: out.htmlUrl,
      downloadUrl: out.downloadUrl,
      url: cdnUrl(repo, out.path),
    },
    200,
    origin
  );
}

async function handleDelete(request, env, origin) {
  await assertAdmin(request);
  const token = requireToken(env);

  const body = await request.json().catch(() => ({}));
  const repo = pickRepo(env, body?.repo);
  const path = assertImagePath(body?.path);

  const out = await githubDelete(repo, path, token);
  await purgeJsDelivr(repo, path);

  return json(
    {
      ok: true,
      deleted: true,
      alreadyMissing: out.alreadyMissing,
      repo,
      path,
      reason: out.alreadyMissing
        ? "لم يُعثر على الملف في المستودع (ربما حُذف سابقاً)."
        : "حُذفت الصورة نهائياً من المستودع ومن الموقع.",
    },
    200,
    origin
  );
}

/* ---------------- نقطة الدخول الرئيسية ---------------- */

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (origin && !isAllowedOrigin(origin)) {
      return json({ error: "نطاق غير مصرّح به (CORS)." }, 403, origin);
    }

    const route = new URL(request.url).pathname.replace(/\/+$/, "");

    try {
      if (route.endsWith("/github/status") && request.method === "GET") {
        return await handleStatus(request, env, origin);
      }

      if (route.endsWith("/github/upload") && request.method === "POST") {
        return await handleUpload(request, env, origin);
      }

      if (route.endsWith("/github/delete") && request.method === "POST") {
        return await handleDelete(request, env, origin);
      }

      return json({ error: "المسار غير معروف." }, 404, origin);
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      return json({ error: error.message || "خطأ غير متوقع." }, status, origin);
    }
  },
};
