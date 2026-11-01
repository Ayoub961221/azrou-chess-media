# إعداد التخزين — Cloudflare R2 + Netlify Functions

الصور تُرفع مباشرة من المتصفح إلى **R2** عبر روابط PUT موقّعة
(60 ثانية)، وتُعرض من الرابط العام للحاوية. لا base64، لا تخزين محلي،
ولا صور في مجلد المشروع.

```
المتصفح (الأدمن)
  │  ضغط الصورة (1600px، WebP q0.8)
  │  POST /.netlify/functions/sign  + Firebase ID token
  ▼
Netlify Function sign.js
  │  accounts:lookup ← التحقق من الأدمن بالبريد
  │  توليد مفتاح فريد + رابط PUT موقّع (60s)
  ▼
المتصفح → PUT مباشر إلى R2
  ▼
URL العام (pub-…r2.dev) يُحفظ في قاعدة البيانات
```

---

## ١. متغيّرات البيئة في Netlify (Site settings ← Environment variables)

| المتغيّر | مثال | ملاحظة |
|---|---|---|
| `R2_ACCOUNT_ID` | من R2 ← Manage R2 API Tokens | سرّي |
| `R2_KEY` | Access Key ID | سرّي |
| `R2_SECRET` | Secret Access Key | سرّي |
| `R2_PUBLIC_URL` | `https://pub-xxxx.r2.dev` | عام (للقراءة) |
| `R2_BUCKET` | `images` | اختياري، الافتراضي `images` |
| `FIREBASE_WEB_API_KEY` | من firebaseConfig | **عام** by design |
| `ADMIN_EMAILS` | `you@mail.com` | virgule-séparés إن تعدد |
| `ADMIN_UIDS` | `uid…` | اختياري إضافي |

🔴 **لا تضع أيًا منها في الكود أو Git.** `.env` مستثنى من `.gitignore`،
و`.env.example` يحتوي أسماء المتغيّرات فقط.

---

## ٢. R2 CORS (إلزامي — بدونها يفشل PUT من المتصفح)

R2 Dashboard ← Bucket ← Settings ← **CORS**:

```json
[
  {
    "AllowedOrigins": ["https://comfy-cajeta-5a216e.netlify.app"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

أضف `http://localhost:4173` للتطوير المحلي إن أردت.

---

## ٣. Public access للحاوية

R2 ← Bucket ← Settings ← **Public access** ← فعّل، أو فعّل نطاق `r2.dev` — بدونها لا يعمل `publicUrl`.

---

## ٤. النشر

```bash
netlify deploy --prod    # أو Eddy push إلى GitHub
```

الـ functions تُبنى تلقائياً من `netlify/functions/` (انظر `netlify.toml`).

---

## ٥. ما تم التحقق منه

| الفحص | النتيجة |
|---|---|
| بناء الدالتين (`node --check`) | ✅ |
| 401 بدون/ بتوكن مزوّر (accounts:lookup حقيقي) | ✅ 2/2 |
| حراسة مفتاح الحذف (5 حالات) | ✅ 5/5 |
| حراسة الصيغ (4 حالات) | ✅ |
| أسرار في `dist` | ✅ صفر |
| `tsc --noEmit` + `vite build` | ✅ |
| الصفحات في المتصفح | ✅ صفر أخطاء |

**لم يُختبَر:** رفع فعلي إلى R2 — يحتاج values R2 الحقيقية في Netlify.

---

## ملاحظات

- المشروعchte фактически يستخدم **Realtime Database** وليس Firestore —
  السجلات تُحفظ في `content/media/{id}` مع الحقول `url` و`key` (مكافئ لـ image/imageKey).
- التوافق العكسي: الصور القديمة (Cloudinary/ImgBB/jsDelivr) ما زالت تُعرض.
- الحذف يحترم أن الملف قد يكون مستعملاً في أكثر من مكان (stripMedia قبل الحذف).
