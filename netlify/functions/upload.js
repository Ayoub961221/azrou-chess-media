import {
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
} from "./_shared.js";

/**
 * POST /.netlify/functions/upload
 * مسار بديل للرفع المباشر عبر Netlify Function:
 * يعمل كبديل تلقائي عند مواجهة خطأ CORS في المتصفح أثناء محاولة PUT المباشرة إلى R2.
 */
export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(event) };
  }
  if (event.httpMethod !== "POST") {
    return json(405, { error: "الطريقة غير مدعومة." }, event);
  }

  try {
    await verifyAdmin(event);

    const { filename, type, base64 } = await readJson(event);

    if (!base64 || typeof base64 !== "string") {
      return json(400, { error: "محتوى الصورة مفقود." }, event);
    }

    const ext = ALLOWED_TYPES[type];
    if (!ext) {
      return json(
        415,
        { error: "صيغة غير مدعومة. المقبول: JPEG أو PNG أو WebP." },
        event
      );
    }

    const key = buildKey(filename).replace(/\.[a-z0-9]+$/, `.${ext}`);
    const buffer = Buffer.from(base64, "base64");

    const client = r2Client();
    const command = new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      ContentType: type,
      Body: buffer,
    });

    await client.send(command);

    return json(
      200,
      {
        ok: true,
        key,
        publicUrl: `${publicBase()}/${key}`,
        size: buffer.length,
      },
      event
    );
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    return json(
      status,
      { error: error.message || "خطأ غير متوقع في رفع الصورة." },
      event
    );
  }
};
