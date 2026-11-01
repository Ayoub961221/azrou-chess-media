import {
  json,
  corsHeaders,
  HttpError,
  verifyAdmin,
  r2Client,
  bucket,
  readJson,
  DeleteObjectCommand,
} from "./_shared.js";

const ALLOWED_PREFIX = "images/";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(event) };
  }
  if (event.httpMethod !== "POST") {
    return json(405, { error: "الطريقة غير مدعومة." }, event);
  }

  try {
    await verifyAdmin(event);

    const { key } = await readJson(event);

    if (typeof key !== "string" || !key.trim()) {
      return json(400, { error: "المفتاح (key) مفقود." }, event);
    }

    const clean = key.trim();
    if (clean.length > 500 || clean.includes("..") || clean.startsWith("/")) {
      return json(400, { error: "المفتاح غير صالح." }, event);
    }
    if (!clean.startsWith(ALLOWED_PREFIX)) {
      return json(403, { error: "غير مسموح بحذف مفاتيح خارج مجلد الصور." }, event);
    }

    const client = r2Client();
    await client.send(
      new DeleteObjectCommand({ Bucket: bucket(), Key: clean })
    );

    return json(200, { ok: true, deleted: true, key: clean }, event);
  } catch (error) {
    if (error?.name === "NoSuchKey" || error?.Code === "NoSuchKey") {
      return json(200, { ok: true, deleted: true, alreadyMissing: true }, event);
    }
    const status = error instanceof HttpError ? error.status : 500;
    return json(status, { error: error.message || "تعذّر حذف الملف." }, event);
  }
};
