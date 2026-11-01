# إعداد خدمة الصور — GitHub + jsDelivr

نظام رفع الصور يحفظ الملفات في مستودع GitHub ويعرضها عبر jsDelivr CDN.
**Cloudinary أُزيل نهائياً.**

---

## ✅ ما تم إنجازه فعلياً

| العنصر | الحالة |
|---|---|
| المستودع `Ayoub961221/azrou-chess-media` | ✅ **أُنشئ — Public، فرع `main`** |
| رفع حقيقي إلى GitHub (PUT) | ✅ HTTP 201 مُختبَر |
| رابط jsDelivr يعمل | ✅ HTTP 200 مُختبَر |
| الحذف من المستودع | ✅ HTTP 200 مُختبَر |
| كود الـ Worker والواجهة | ✅ جاهز |
| **نشر الـ Worker** | ⏳ **بانتظارك** |

---

## 🔴 خطوة ١ — توكن جديد (إلزامية)

التوكن الذي استعملتَه حتى الآن **مكشوف** — أُرسل عدة مرات في المحادثة،
وصلاحيته `repo` أي تحكم كامل في كل مستودعاتك.

1. [github.com/settings/tokens](https://github.com/settings/tokens) ← احذف القديم
2. **Generate new token** ← **Fine-grained**

| الحقل | القيمة |
|---|---|
| Token name | `azrou-media-upload` |
| Repository access | **Only select repositories** ← `azrou-chess-media` |
| Permissions → **Contents** | **Read and write** |

> Fine-grained محصور في مستودع الصور وحده. حتى لو تسرّب، أسوأ ضرر
> هو العبث بمجلد صور — لا بقية حسابك.

---

## خطوة ٢ — نشر الـ Worker

### عبر لوحة Cloudflare (بلا سطر أوامر)

1. [dash.cloudflare.com](https://dash.cloudflare.com) ← **Workers & Pages** ← **Create Worker**
2. الاسم: `azrou-media` ← **Deploy** ← **Edit code**
3. امسح الكود الموجود، والصق محتوى `cloudflare-worker/worker.js` ← **Deploy**
4. **Settings** ← **Variables and Secrets** ← **Add**:

| الاسم | النوع | القيمة |
|---|---|---|
| `GITHUB_TOKEN` | **Secret** | التوكن الجديد |
| `GITHUB_REPO` | Text | `azrou-chess-media` |

اضغط **Deploy** مجدداً.

### أو عبر wrangler

```bash
cd cloudflare-worker
wrangler login
wrangler secret put GITHUB_TOKEN     # يسألك عن القيمة بشكل مخفي
wrangler deploy
```

> اسم الـ Worker في `wrangler.toml` هو `azrou-media`، و`GITHUB_REPO`
> مضبوط فيه كمتغيّر عام. التوكن **سرّ** ولا يُكتب في الملف.

---

## خطوة ٣ — الربط من لوحة الإدارة

لا حاجة لإعادة بناء الموقع. افتح **لوحة الإدارة ← الإعدادات العامة**:

| الحقل | القيمة |
|---|---|
| اسم مستودع GitHub | `azrou-chess-media` |
| عنوان خدمة الرفع/الحذف | `https://azrou-media.<حسابك>.workers.dev` |

اضغط **«فحص الاتصال»** — يجب أن يظهر اسم حسابك والمستودعات المتاحة.
ثم **«حفظ التغييرات»**.

> ⚠️ المستودع **يجب أن يكون Public** — jsDelivr لا يقرأ المستودعات الخاصة.

---

## مسارات الـ API

| المسار | الطريقة | الوظيفة |
|---|---|---|
| `/github/status` | GET | فحص الاتصال والمستودعات |
| `/github/upload` | POST | رفع صورة |
| `/github/delete` | POST | حذف صورة |

جميعها تتطلب `Authorization: Bearer <Firebase ID Token>` لمدير مُخوَّل.

### مثال الرد من `/github/upload`

```json
{
  "ok": true,
  "owner": "Ayoub961221",
  "repo": "azrou-chess-media",
  "branch": "main",
  "path": "public/images/img-1793398494268-nkbitv.png",
  "fileName": "img-1793398494268-nkbitv.png",
  "size": 70,
  "url": "https://cdn.jsdelivr.net/gh/Ayoub961221/azrou-chess-media@main/public/images/img-1793398494268-nkbitv.png"
}
```

---

## كيف يعمل النظام

```
المتصفح
  │ ضغط الصورة (1600px، WebP) → Base64 بلا بادئة data:
  │ + Firebase ID Token
  ▼
Cloudflare Worker          ← GITHUB_TOKEN سرّ هنا فقط
  │ ١. accounts:lookup للتحقق من الجلسة
  │ ٢. ADMIN_UIDS / admin claim / admins/{uid}
  │ ٣. فحص المسار والصيغة والحجم
  ▼
GitHub Contents API (PUT)
  │
  ▼
jsDelivr CDN  ←  الرابط يُحفظ في content/media
```

**بنية السجل في `content/media/{id}`:**
`id, provider:"github", url, path, repo, branch, fileName, contentType,
size, folder, createdAt, updatedAt`

لا تُخزَّن بايتات الصور في قاعدة البيانات إطلاقاً.

---

## رسائل الخطأ

| الرمز | الرسالة |
|---|---|
| 401 | انتهت الجلسة. سجّل الدخول من جديد. |
| 403 | صلاحيات التوكن لا تكفي (Contents: Read and write). |
| 404 | المستودع غير موجود أو التوكن لا يصل إليه. |
| 409 | ملف بنفس الاسم موجود مسبقاً. |
| 413 | الحجم يتجاوز 5 ميغابايت. |
| 415 | صيغة غير مدعومة. |
| 503 | لم يُضبط `GITHUB_TOKEN` على الخادم. |

---

## قيود معروفة

- **jsDelivr يخزّن مؤقتاً**: قد تبقى الصورة ظاهرة دقائق بعد الحذف
  رغم استدعاء `purge.jsdelivr.net`.
- **لا نسخ مصغّرة**: jsDelivr لا يحوّل المقاسات، لذلك تُضغط الصورة
  في المتصفح قبل الرفع (1600px، WebP).
- **GIF و SVG** لا تُضغط (حفاظاً على الحركة والمتجهات).

---

## قواعد Firebase

الصق `firebase/database.rules.json` في **Realtime Database ← Rules ← Publish**.

| المسار | الزائر | المدير |
|---|---|---|
| `content`, `meta` | قراءة | قراءة + كتابة |
| `registrations` | إنشاء فقط | قراءة + تعديل + حذف |
| `admins/{uid}` | — | **كل مستخدم يقرأ سجلّه فقط** |

> قاعدة `admins` لم تعد تسمح بقراءة القائمة كاملة لأي مستخدم مسجّل.

---

## ملفات لا تُرفع إلى Git

`.gitignore` يستثني: `node_modules/`، `dist/`، **`backup/`** (قد تحتوي
بيانات شخصية كأرقام الهواتف)، و`.env*`، و`.wrangler/`.
