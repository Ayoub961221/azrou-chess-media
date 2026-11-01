/**
 * POST /.netlify/functions/sign
 * Body: { filename, type }
 *
 * - يتحقق أن chiamante أدمن (Firebase ID token عبر accounts:lookup + email)
 * - يقبل فقط jpeg / png / webp
 * - يولّد مفتاحاً فريداً ويرجع رابط PUT موقّعاً لمدة 60 ثانية
 *
 * الرد: { url, key, publicUrl, expiresIn }
 */

const {
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
  getSignedUrl,
} = require("./_shared");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(event) };
  }
  if (event.httpMethod !== "POST") return json(405, { error: "الطريقة غير مدعومة." }, event, event);

  try {
    await verifyAdmin(event);

    const { filename, type } = await readJson(event);

    const ext = ALLOWED_TYPES[type];
    if (!ext) {
      return json(415, {
        error: "صيغة غير مدعومة. المقبول: JPEG أو PNG أو WebP.",
      }, event);
    }

    const key = buildKey(filename).replace(/\.[a-z0-9]+$/, `.${ext}`);
    const client = r2Client();

    const command = new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      ContentType: type,
    });

    const url = await getSignedUrl(client, command, { expiresIn: 60 });

    return json(200, {
      url,
      key,
      publicUrl: `${publicBase()}/${key}`,
      expiresIn: 60,
    });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    return json(status, { error: error.message || "خطأ غير متوقع." }, event);
  }
};
