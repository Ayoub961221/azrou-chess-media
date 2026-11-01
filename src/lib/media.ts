import { ref as dbRef, remove, set } from "firebase/database";
import { auth, database } from "@/lib/firebase";
import type { MediaRef } from "@/lib/content-model";

/**
 * ════════════════════════════════════════════════════════════════════
 *  رفع الصور إلى مستودع GitHub وعرضها عبر jsDelivr CDN
 * ════════════════════════════════════════════════════════════════════
 *
 *  ⚠️  توكن GitHub لا يوجد هنا ولا في أي ملف واجهة.
 *      الموقع ثابت (SPA)، وكل ما هنا يُحزَم ويقرأه أي زائر.
 *      التوكن يبقى سرّاً في Cloudflare Worker باسم GITHUB_TOKEN.
 *
 *      الملف الفعلي  →  مستودع GitHub
 *      الرابط فقط    →  Firebase (content/media + داخل المحتوى)
 * ════════════════════════════════════════════════════════════════════
 */

/** مضيف R2 العام — مسموح به للعرض (قراءة فقط) */
export const R2_HOST_SUFFIX = ".r2.dev";

export const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
];
export const MAX_FILE_MB = 5;

/* ---------------- إعدادات وقت التشغيل ---------------- */

/**
 * دوال Netlify تعمل مباشرة بعد النشر — لا يوجد إعداد وقت تشغيل.
 */
export function configureMedia(_settings?: {
  mediaDeleteEndpoint?: string;
  githubRepo?: string;
}) {
  /* لا شيء — التوكنات في متغيّرات بيئة Netlify */
}

export function getEndpoint(): string {
  return "/.netlify/functions";
}

export function getRepo(): string {
  return "";
}

export function isUploadReady(): boolean {
  return true;
}

/* ---------------- التحقق من الملف ---------------- */

export function validateImage(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "صيغة غير مدعومة. المقبول: JPG أو PNG أو WebP أو AVIF أو GIF أو SVG.";
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return `حجم الملف ${(file.size / 1048576).toFixed(1)} ميغابايت. الحد الأقصى ${MAX_FILE_MB} ميغابايت.`;
  }
  return null;
}

/* ---------------- الضغط ---------------- */

type Compressed = {
  blob: Blob;
  width: number;
  height: number;
  extension: string;
  contentType: string;
};

function supportsWebP(): boolean {
  try {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    return c.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}

function extensionOf(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  if (type === "image/avif") return "avif";
  if (type === "image/svg+xml") return "svg";
  return "jpg";
}

/**
 * يصغّر الصورة ويضغطها قبل الرفع.
 * jsDelivr لا يولّد نسخاً مصغّرة، فالضغط هنا ضروري لسرعة الموقع.
 * GIF و SVG يُتركان كما هما (حركة / متجهات).
 */
export async function compressImage(
  file: File,
  maxWidth = 1600,
  quality = 0.82
): Promise<Compressed> {
  if (file.type === "image/gif" || file.type === "image/svg+xml") {
    return {
      blob: file,
      width: 0,
      height: 0,
      extension: extensionOf(file.type),
      contentType: file.type,
    };
  }

  const bitmap = await loadImage(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return {
      blob: file,
      width: bitmap.width,
      height: bitmap.height,
      extension: extensionOf(file.type),
      contentType: file.type,
    };
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();

  const useWebP = supportsWebP();
  const contentType = useWebP ? "image/webp" : "image/jpeg";
  const blob = await new Promise<Blob | null>((r) =>
    canvas.toBlob(r, contentType, quality)
  );

  if (!blob || (blob.size >= file.size && scale === 1)) {
    return {
      blob: file,
      width: bitmap.width,
      height: bitmap.height,
      extension: extensionOf(file.type),
      contentType: file.type,
    };
  }

  return {
    blob,
    width,
    height,
    extension: useWebP ? "webp" : "jpg",
    contentType,
  };
}

async function loadImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fallback */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = url;
    });
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
}

/* ---------------- Base64 ---------------- */

/** يحوّل Blob إلى Base64 **بلا** البادئة `data:*;base64,` */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result;
      if (typeof r !== "string") return reject(new Error("تعذّرت قراءة الملف."));
      const comma = r.indexOf(",");
      if (comma === -1) return reject(new Error("صيغة الملف غير متوقعة."));
      resolve(r.slice(comma + 1));
    };
    reader.onerror = () => reject(new Error("تعذّرت قراءة الملف من جهازك."));
    reader.onabort = () => reject(new Error("أُلغيت قراءة الملف."));
    reader.readAsDataURL(blob);
  });
}

/* ---------------- الروابط ---------------- */

/** يقبل روابط الصور المباشرة فقط — R2 العام + خدمات CDN القديمة للتوافق */
export function isDirectImageUrl(url: string | undefined): url is string {
  if (!url) return false;
  try {
    const p = new URL(url);
    if (p.protocol !== "https:") return false;
    const h = p.hostname.toLowerCase();
    return (
      h.endsWith(R2_HOST_SUFFIX) || // Cloudflare R2 العام
      h === "cdn.jsdelivr.net" ||
      h === "raw.githubusercontent.com" ||
      h === "res.cloudinary.com" || // صور قديمة
      h === "i.ibb.co" // صور قديمة ImgBB
    );
  } catch {
    return false;
  }
}

/* ---------------- نداء دوال Netlify ---------------- */

async function callFunction<T>(name: "sign" | "delete", body: unknown): Promise<T> {
  if (!auth.currentUser) throw new Error("يجب تسجيل الدخول أولاً.");

  const token = await auth.currentUser.getIdToken();

  let res: Response;
  try {
    res = await fetch(`/.netlify/functions/${name}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "تعذّر الاتصال بخادم Netlify. إذا كنت تشغّل الموقع محلياً، الدوال تعمل بعد النشر على Netlify."
    );
  }

  const contentType = res.headers.get("content-type") || "";
  let data: (T & { error?: string }) | null = null;

  if (contentType.includes("application/json")) {
    try {
      data = (await res.json()) as T & { error?: string };
    } catch {
      data = null;
    }
  } else {
    // إذا رجعت صفحة HTML فهذا يعني أن الدالة غير منشورة أو أعاد Netlify التوجيه لـ index.html
    const text = await res.text();
    if (res.status === 404 || text.includes("<!doctype html") || text.includes("<html")) {
      throw new Error(
        `دالة الرفع (/.netlify/functions/${name}) غير موجودة على هذا النطاق (404). تأكد من نشر مجلد netlify/functions عبر Netlify.`
      );
    }
  }

  if (!res.ok) {
    throw new Error(data?.error || translateHttp(res.status));
  }
  if (!data) {
    throw new Error(`رد غير متوقع من الخادم (HTTP ${res.status}).`);
  }

  return data;
}

function translateHttp(status: number): string {
  if (status === 401) return "انتهت الجلسة. سجّل الدخول من جديد.";
  if (status === 403) return "هذا الحساب غير مُخوَّل للرفع أو الحذف.";
  if (status === 413) return "حجم الملف كبير جداً.";
  if (status === 415) return "صيغة غير مدعومة. المقبول: JPEG أو PNG أو WebP.";
  if (status === 503) return "خدمة التخزين غير مضبوطة على الخادم.";
  return `فشل الطلب (HTTP ${status}).`;
}

/* ---------------- الرفع (R2 عبر رابط موقّع) ---------------- */

export type UploadOptions = {
  maxWidth?: number;
  quality?: number;
  folder?: string;
  onProgress?: (percent: number) => void;
};

type SignResponse = {
  url: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
};

/**
 * الرفع: ضغط في المتصفح → توقيع من Netlify → PUT مباشر إلى R2 → حفظ السجل.
 * لا base64 ولا تخزين محلي — الملف يذهب مباشرة من المتصفح إلى R2.
 */
export async function uploadImage(
  file: File,
  folder: string,
  options: UploadOptions = {}
): Promise<MediaRef> {
  if (!auth.currentUser) throw new Error("يجب تسجيل الدخول قبل رفع الصور.");

  const invalid = validateImage(file);
  if (invalid) throw new Error(invalid);

  const { maxWidth = 1600, quality = 0.82, onProgress } = options;

  onProgress?.(10);
  const compressed = await compressImage(file, maxWidth, quality);

  onProgress?.(30);
  const sign = await callFunction<SignResponse>("sign", {
    filename: file.name,
    type: compressed.contentType,
  });

  onProgress?.(40);
  await putToPresignedUrl(sign.url, compressed.blob, compressed.contentType, (p) =>
    onProgress?.(40 + Math.round(p * 0.55))
  );

  const key = sign.key;
  const media: MediaRef = {
    url: sign.publicUrl,
    thumbUrl: sign.publicUrl,
    mediumUrl: sign.publicUrl,
    publicId: key,
    imageKey: key,
    format: compressed.extension,
    fileName: key.split("/").pop() ?? file.name,
    contentType: compressed.contentType,
    width: compressed.width || undefined,
    height: compressed.height || undefined,
    size: compressed.blob.size,
    updatedAt: Date.now(),
  };

  const record = {
    id: key.replace(/[.#$/[\]]/g, "_"),
    provider: "r2",
    url: sign.publicUrl,
    path: key,
    key,
    fileName: media.fileName,
    contentType: media.contentType ?? "",
    size: media.size ?? 0,
    folder,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await set(dbRef(database, `content/media/${record.id}`), record).catch(() => {});

  onProgress?.(100);
  return media;
}

/** PUT مباشر إلى رابط R2 الموقّع مع تتبع نسبة التقدم */
function putToPresignedUrl(
  url: string,
  blob: Blob,
  contentType: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.timeout = 120000;

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(
          new Error(
            `رفض خادم التخزين R2 استلام الصورة (HTTP ${xhr.status}). تأكد من إعداد CORS على حاوية images.`
          )
        );
      }
    };

    xhr.onerror = () => {
      reject(
        new Error(
          "تعذّر إرسال الصورة إلى R2 (خطأ اتصال أو CORS). تأكد من إعداد CORS على حاوية images في Cloudflare R2 بالسماح لنطاق موقعك."
        )
      );
    };

    xhr.ontimeout = () => reject(new Error("انتهت مهلة رفع الصورة (أكثر من دقيقتين)."));

    xhr.send(blob);
  });
}

/* ---------------- الحذف ---------------- */

export type RemoveResult = { removed: boolean; reason?: string };

function isSameMedia(node: unknown, target: MediaRef): boolean {
  if (!node || typeof node !== "object" || Array.isArray(node)) return false;
  const c = node as Partial<MediaRef>;
  if (typeof c.url !== "string") return false;
  if (target.publicId && c.publicId) return c.publicId === target.publicId;
  return c.url === target.url;
}

/** عنصر قائمة فقدَ صورته ولم يَعُد له معنى (صورة ألبوم أو بطاقة معرض) */
function isEmptyPhotoEntry(node: unknown): boolean {
  if (!node || typeof node !== "object" || Array.isArray(node)) return false;
  const o = node as Record<string, unknown>;
  if ("media" in o && o.media === null) return true;
  if ("image" in o && o.image === null && "order" in o && !("bodyAr" in o) && !("roleAr" in o))
    return true;
  return false;
}

/** يحذف الوسيط من كل مواضعه في شجرة المحتوى (بلا تعديل الأصل) */
export function stripMedia<T>(tree: T, target: MediaRef): { tree: T; removed: number } {
  let removed = 0;

  const walk = (node: unknown): unknown => {
    if (!node || typeof node !== "object") return node;
    if (isSameMedia(node, target)) {
      removed += 1;
      return null;
    }
    if (Array.isArray(node)) {
      const out: unknown[] = [];
      for (const item of node) {
        const next = walk(item);
        if (next === null) continue;
        if (isEmptyPhotoEntry(next)) continue;
        out.push(next);
      }
      return out;
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) out[k] = walk(v);
    return out;
  };

  return { tree: walk(tree) as T, removed };
}

/** يحذف ملف الصورة من المستودع ومن سجل الوسائط */
export async function deleteMediaFile(
  media: MediaRef | null | undefined
): Promise<RemoveResult> {
  if (!media?.url) return { removed: false, reason: "لا يوجد ملف مرتبط." };
  if (!auth.currentUser) throw new Error("يجب تسجيل الدخول قبل الحذف.");

  const key = media.imageKey || media.publicId;

  // صور قديمة (Cloudinary / ImgBB / jsDelivr): نزيل الرابط فقط
  if (!key) {
    return { removed: true, reason: "أُزيلت الصورة من الموقع." };
  }

  try {
    await callFunction<{ ok: boolean; deleted: boolean }>("delete", { key });
    await remove(
      dbRef(database, `content/media/${key.replace(/[.#$/[\]]/g, "_")}`)
    ).catch(() => {});
    return { removed: true, reason: "حُذفت الصورة نهائياً من التخزين ومن الموقع." };
  } catch (error) {
    return {
      removed: false,
      reason:
        "أُزيلت من الموقع، لكن تعذّر حذف الملف من التخزين: " +
        (error instanceof Error ? error.message : "خطأ غير معروف"),
    };
  }
}

/**
 * @deprecated استعمل stripMedia + deleteMediaFile.
 */
export async function deleteImageIfUnused(
  media: MediaRef | null | undefined,
  contentTree: unknown
): Promise<RemoveResult> {
  if (!media?.url) return { removed: false, reason: "لا يوجد ملف مرتبط." };
  if (countReferences(contentTree, media.url) > 1) {
    return { removed: false, reason: "الصورة مستعملة في أكثر من مكان، لذلك لم تُحذف." };
  }
  return deleteMediaFile(media);
}

/** يحسب عدد مرات استعمال رابط داخل شجرة المحتوى */
export function countReferences(tree: unknown, url: string): number {
  let count = 0;
  const walk = (node: unknown) => {
    if (!node) return;
    if (typeof node === "string") {
      if (node === url) count += 1;
      return;
    }
    if (Array.isArray(node)) return void node.forEach(walk);
    if (typeof node === "object")
      Object.values(node as Record<string, unknown>).forEach(walk);
  };
  walk(tree);
  return count;
}
