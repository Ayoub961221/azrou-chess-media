import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { database } from "@/lib/firebase";
import { createId } from "@/lib/content";
import {
  deleteRegistration,
  setRegistrationStatus,
  toInternational,
  useRegistrations,
  type Registration,
} from "@/lib/registrations";
import type {
  GalleryItem,
  LabeledItem,
  MediaRef,
  NewsItem,
  OpeningHour,
  PageHeader,
  SiteContent,
  StandingRow,
  TeamGroup,
  TeamPerson,
  Tournament,
  TrainingLevel,
} from "@/lib/content-model";
import { MAX_NEWS_PHOTOS } from "@/lib/content-model";
import { deleteMediaFile } from "@/lib/media";
import type { MediaRecord } from "@/lib/content-model";
import { isUploadReady } from "@/lib/media";
import {
  Button,
  Field,
  ImageField,
  MultiImageField,
  Panel,
  Select,
  StringListEditor,
  TextArea,
  TextInput,
  Toggle,
  type AlbumPhoto,
} from "@/admin/ui";

export type SectionProps = {
  draft: SiteContent;
  patch: (updater: (d: SiteContent) => SiteContent) => void;
  tree: unknown;
  /** يحذف صورة من كل مواضعها في المحتوى */
  purgeMedia?: (media: MediaRef) => number;
};

/* ---------------- أدوات مشتركة ---------------- */

function HeaderEditor({
  header,
  onChange,
}: {
  header: PageHeader;
  onChange: (h: PageHeader) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="السطر التمهيدي (عربي)">
        <TextInput value={header.eyebrow} onChange={(v) => onChange({ ...header, eyebrow: v })} />
      </Field>
      <Field label="العنوان (عربي)">
        <TextInput value={header.titleAr} onChange={(v) => onChange({ ...header, titleAr: v })} />
      </Field>
      <Field label="العنوان (فرنسي)">
        <TextInput
          value={header.titleFr}
          dir="ltr"
          onChange={(v) => onChange({ ...header, titleFr: v })}
        />
      </Field>
      <Field label="المقدمة (عربي)">
        <TextArea rows={2} value={header.intro} onChange={(v) => onChange({ ...header, intro: v })} />
      </Field>
    </div>
  );
}

function ItemShell({
  title,
  badge,
  onUp,
  onDown,
  onDelete,
  children,
}: {
  title: string;
  badge?: string;
  onUp?: () => void;
  onDown?: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-royal/12 bg-[#fbfcfe]">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-2 text-right"
        >
          <span className="font-arabic text-[10px] text-royal/50">{open ? "▾" : "▸"}</span>
          <span className="truncate font-arabic text-[13px] font-semibold text-royal-ink">
            {title || "— بدون عنوان —"}
          </span>
          {badge ? (
            <span className="shrink-0 rounded-full bg-royal/[0.07] px-2 py-[2px] font-arabic text-[10px] text-royal/70">
              {badge}
            </span>
          ) : null}
        </button>
        <div className="flex shrink-0 gap-1">
          {onUp ? (
            <button type="button" onClick={onUp} aria-label="تحريك لأعلى" className="rounded-lg border border-royal/12 px-2 py-1 text-[11px] text-royal/70 hover:bg-white">↑</button>
          ) : null}
          {onDown ? (
            <button type="button" onClick={onDown} aria-label="تحريك لأسفل" className="rounded-lg border border-royal/12 px-2 py-1 text-[11px] text-royal/70 hover:bg-white">↓</button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              if (confirm("تأكيد حذف هذا العنصر؟")) onDelete();
            }}
            className="rounded-lg border border-red-200 px-2.5 py-1 font-arabic text-[11px] text-red-600 hover:bg-red-50"
          >
            حذف
          </button>
        </div>
      </div>
      {open ? <div className="space-y-4 border-t border-royal/[0.08] p-3.5">{children}</div> : null}
    </div>
  );
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function EmptyHint({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-royal/20 bg-[#f9fafc] px-4 py-5 text-center font-arabic text-[12px] text-royal-ink/55">
      {text}
    </p>
  );
}

/* ════════════ ١. لوحة التحكم ════════════ */

export function DashboardSection({
  draft,
  newRegistrations = 0,
}: SectionProps & { newRegistrations?: number }) {
  const [mediaCount, setMediaCount] = useState<number | null>(null);

  useEffect(() => {
    const unsub = onValue(
      ref(database, "media"),
      (snap) => setMediaCount(snap.exists() ? Object.keys(snap.val()).length : 0),
      () => setMediaCount(null)
    );
    return () => unsub();
  }, []);

  const published = draft.news.items.filter((n) => n.published).length;
  const stats = [
    { label: "الأخبار المنشورة", value: published, of: draft.news.items.length },
    { label: "أعضاء المكتب", value: draft.members.people.filter((p) => p.group === "bureau" || p.group === "president").length },
    { label: "المدربون", value: draft.members.people.filter((p) => p.group === "coach").length },
    { label: "الطاقم التقني", value: draft.members.people.filter((p) => p.group === "staff").length },
    { label: "البطولات", value: draft.tournaments.items.length },
    { label: "صور المعرض", value: draft.gallery.items.length },
    { label: "صفوف الترتيب", value: draft.tournaments.standings.length },
    { label: "ملفات الوسائط", value: mediaCount ?? 0 },
    { label: "طلبات تسجيل جديدة", value: newRegistrations },
  ];

  return (
    <div className="space-y-5">
      <Panel title="إحصائيات المحتوى" subtitle="أرقام محسوبة مباشرة من بياناتك في Firebase">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-royal/10 bg-[#f8fafd] p-3.5 text-center">
              <span className="block font-display text-[1.6rem] font-semibold leading-none text-royal">
                {s.value}
                {s.of !== undefined ? (
                  <span className="text-[0.9rem] text-royal-ink/35"> / {s.of}</span>
                ) : null}
              </span>
              <span className="mt-1.5 block font-arabic text-[11px] text-royal-ink/65">{s.label}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="كيف تعمل لوحة الإدارة" subtitle="خطوات سريعة">
        <ol className="space-y-2 font-arabic text-[12.5px] leading-[1.95] text-royal-ink/75">
          <li>١. اختر القسم من القائمة الجانبية.</li>
          <li>٢. عدّل النصوص أو ارفع الصور (الرفع يتم فوراً إلى Firebase Storage).</li>
          <li>٣. اضغط «حفظ التغييرات» — تُحفظ البيانات في Realtime Database.</li>
          <li>٤. تظهر التغييرات مباشرة في الصفحات العامة دون إعادة نشر الموقع.</li>
        </ol>
      </Panel>
    </div>
  );
}

/* ════════════ ٢. الصفحة الرئيسية ════════════ */

export function HomeSection({ draft, patch, tree, purgeMedia }: SectionProps) {
  const h = draft.homePage;
  const set = (v: Partial<typeof h>) =>
    patch((d) => ({ ...d, homePage: { ...d.homePage, ...v } }));

  return (
    <div className="space-y-5">
      <Panel title="نصوص القسم الرئيسي">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="الشارة العلوية"><TextInput value={h.badgeAr} onChange={(v) => set({ badgeAr: v })} /></Field>
          <Field label="سطر الترحيب"><TextInput value={h.welcomeAr} onChange={(v) => set({ welcomeAr: v })} /></Field>
          <Field label="العنوان الرئيسي (عربي)"><TextInput value={h.titleAr} onChange={(v) => set({ titleAr: v })} /></Field>
          <Field label="العنوان الفرعي (فرنسي)"><TextInput dir="ltr" value={h.titleFr} onChange={(v) => set({ titleFr: v })} /></Field>
        </div>
        <div className="mt-4">
          <Field label="الوصف القصير"><TextArea rows={3} value={h.descriptionAr} onChange={(v) => set({ descriptionAr: v })} /></Field>
        </div>
      </Panel>

      <Panel title="الأزرار">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="نص الزر الأول"><TextInput value={h.primaryCtaAr} onChange={(v) => set({ primaryCtaAr: v })} /></Field>
          <Field label="رابط الزر الأول" hint="مثال: ‎#club"><TextInput dir="ltr" value={h.primaryCtaHref} onChange={(v) => set({ primaryCtaHref: v })} /></Field>
          <Field label="نص الزر الثاني"><TextInput value={h.secondaryCtaAr} onChange={(v) => set({ secondaryCtaAr: v })} /></Field>
          <Field label="رابط الزر الثاني" hint="مثال: ‎#actualites"><TextInput dir="ltr" value={h.secondaryCtaHref} onChange={(v) => set({ secondaryCtaHref: v })} /></Field>
        </div>
      </Panel>

      <Panel title="صورة القسم الرئيسي">
        <ImageField
          label="الصورة الكبيرة"
          media={h.image}
          folder="home"
          contentTree={tree}
          onPurge={purgeMedia}
          maxWidth={1600}
          onChange={(m) => set({ image: m })}
        />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="النص البديل للصورة"><TextInput value={h.imageAlt} onChange={(v) => set({ imageAlt: v })} /></Field>
          <Field label="شارة الصورة (لاتيني)"><TextInput dir="ltr" value={h.badgeLatin} onChange={(v) => set({ badgeLatin: v })} /></Field>
          <Field label="تعليق الصورة (عربي)"><TextInput value={h.captionAr} onChange={(v) => set({ captionAr: v })} /></Field>
          <Field label="تعليق الصورة (فرنسي)"><TextInput dir="ltr" value={h.captionFr} onChange={(v) => set({ captionFr: v })} /></Field>
        </div>
      </Panel>
    </div>
  );
}

/* ════════════ ٣. الوسائط ════════════ */

/** يوضّح للمدير هل خادم الرفع/الحذف منشور فعلاً */
export function DeleteServerStatus() {
  const ready = isUploadReady();

  if (ready) {
    return (
      <p className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-3 font-arabic text-[11.5px] leading-[1.95] text-emerald-900">
        ✅ <strong>الرفع والحذف مفعَّلان.</strong> الصور تُحفظ في حاوية Cloudflare R2 وتُعرض من رابطها العام.
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-3">
      <p className="font-arabic text-[12px] font-bold leading-[1.9] text-amber-900">
        ⚠️ خادم الرفع غير منشور بعد
      </p>
      <p className="mt-1.5 font-arabic text-[11.5px] leading-[1.95] text-amber-900/85">
        رفع الصور وحذفها معطّلان حالياً. توكن GitHub يجب أن يبقى على الخادم —
        وضعه في كود الموقع يكشفه لكل زائر. انشر الـ Worker ثم الصق عنوانه في{" "}
        <span dir="ltr" className="font-sans font-semibold">src/lib/media.ts</span>.
      </p>
      <p className="mt-2 font-arabic text-[11px] leading-[1.9] text-amber-900/70">
        الخطوات في{" "}
        <span dir="ltr" className="font-sans font-semibold">DELETE-IMAGES-SETUP.md</span>
      </p>
    </div>
  );
}

/** صورة مستعملة فعلاً في المحتوى */
type UsedMedia = {
  media: MediaRef;
  places: string[];
};

/** يجمع كل الصور المستعملة في شجرة المحتوى مع أماكن استعمالها. */
function collectUsedMedia(content: SiteContent): UsedMedia[] {
  const map = new Map<string, UsedMedia>();

  const add = (node: MediaRef, place: string) => {
    const key = node.publicId || node.url;
    const found = map.get(key);
    if (found) {
      if (!found.places.includes(place)) found.places.push(place);
    } else {
      map.set(key, { media: node, places: [place] });
    }
  };

  const walk = (node: unknown, place: string) => {
    if (!node || typeof node !== "object") return;

    const candidate = node as Partial<MediaRef>;
    if (typeof candidate.url === "string" && candidate.url.startsWith("http")) {
      add(node as MediaRef, place);
      return;
    }

    if (Array.isArray(node)) {
      node.forEach((item) => walk(item, place));
      return;
    }

    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      walk(value, place);
      void key;
    }
  };

  const SECTIONS: [keyof SiteContent, string][] = [
    ["homePage", "الصفحة الرئيسية"],
    ["about", "عن النادي"],
    ["news", "الأخبار"],
    ["members", "الأعضاء والمدربون"],
    ["training", "مدرسة الشطرنج"],
    ["gallery", "معرض الصور"],
    ["tournaments", "البطولات"],
    ["contact", "التواصل"],
  ];

  for (const [key, label] of SECTIONS) walk(content[key], label);

  return [...map.values()];
}

export function MediaSection({ draft, purgeMedia }: SectionProps) {
  const used = collectUsedMedia(draft);
  const [records, setRecords] = useState<MediaRecord[] | null>(null);
  const [cleaning, setCleaning] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onValue(
      ref(database, "content/media"),
      (snap) => {
        const val = snap.val() as Record<string, MediaRecord> | null;
        setRecords(val ? Object.values(val) : []);
      },
      (e) => setError(e.message)
    );
    return () => unsub();
  }, []);

  const usedUrls = new Set(used.map((u) => u.media.url));
  const orphans = (records ?? []).filter((r) => !usedUrls.has(r.url));

  /** يحذف الملفات اليتيمة من GitHub ومن المكتبة */
  async function cleanOrphans() {
    if (orphans.length === 0) return;
    if (!confirm(`حذف ${orphans.length} صورة غير مستخدمة نهائياً من المستودع؟`)) return;

    setCleaning(true);
    setNote(null);
    setError(null);

    let ok = 0;
    const failed: string[] = [];

    for (const r of orphans) {
      const res = await deleteMediaFile({
        url: r.url,
        publicId: r.path,
      } as MediaRef).catch(() => null);
      if (res?.removed) ok += 1;
      else failed.push(r.fileName);
    }

    setCleaning(false);
    setNote(`حُذفت ${ok} صورة.`);
    if (failed.length) setError(`تعذّر حذف: ${failed.join("، ")}`);
  }

  return (
    <div className="space-y-5">
      <MediaLibraryPanel
        used={used}
        orphans={orphans}
        loading={records === null}
        cleaning={cleaning}
        onClean={cleanOrphans}
        note={note}
        error={error}
        onDelete={async (rec) => {
          if (!confirm(`حذف «${rec.fileName}» نهائياً من المستودع؟`)) return;
          const media = { url: rec.url, publicId: rec.path } as MediaRef;
          purgeMedia?.(media);
          const res = await deleteMediaFile(media).catch(() => null);
          setNote(res?.reason ?? "أُزيلت الصورة.");
        }}
      />
      <GithubBulkUploader onDone={(msg) => setNote(msg)} />
    </div>
  );
}

function MediaLibraryPanel({
  used,
  orphans,
  loading,
  cleaning,
  onClean,
  onDelete,
  note,
  error,
}: {
  used: UsedMedia[];
  orphans: MediaRecord[];
  loading: boolean;
  cleaning: boolean;
  onClean: () => void;
  onDelete: (rec: MediaRecord) => void;
  note: string | null;
  error: string | null;
}) {
  return (
    <Panel
      title={`مكتبة الوسائط (${used.length} مستعملة · ${orphans.length} غير مستعملة)`}
      subtitle="الصور محفوظة في مستودع GitHub وتُعرض عبر jsDelivr CDN"
      actions={
        orphans.length > 0 ? (
          <Button variant="danger" onClick={onClean} disabled={cleaning}>
            {cleaning ? "جاري التنظيف…" : `تنظيف ${orphans.length} صورة غير مستخدمة`}
          </Button>
        ) : null
      }
    >
      <DeleteServerStatus />

      {note ? (
        <p className="mt-3 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 font-arabic text-[11.5px] text-emerald-800">
          {note}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-xl border border-red-300 bg-red-50 px-3.5 py-2.5 font-arabic text-[11.5px] text-red-700">
          {error}
        </p>
      ) : null}

      {/* المستعملة */}
      <h3 className="mt-5 font-arabic text-[13px] font-bold text-royal-ink">
        مستعملة في الموقع
      </h3>
      {used.length === 0 ? (
        <EmptyHint text="لا توجد صور في الموقع. ارفع صوراً من أقسام المحتوى." />
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {used.map(({ media, places }) => (
            <MediaTile
              key={media.publicId || media.url}
              url={media.url}
              caption={places.join("، ")}
              meta={media.width ? `${media.width}×${media.height}` : undefined}
            />
          ))}
        </div>
      )}

      {/* غير المستعملة */}
      {loading ? null : orphans.length > 0 ? (
        <>
          <h3 className="mt-6 font-arabic text-[13px] font-bold text-royal-ink">
            غير مستعملة (يمكن حذفها)
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {orphans.map((rec) => (
              <MediaTile
                key={rec.id}
                url={rec.url}
                caption={rec.folder || "—"}
                meta={`${Math.round(rec.size / 1024)} KB`}
                onDelete={() => onDelete(rec)}
              />
            ))}
          </div>
        </>
      ) : null}
    </Panel>
  );
}

function MediaTile({
  url,
  caption,
  meta,
  onDelete,
}: {
  url: string;
  caption: string;
  meta?: string;
  onDelete?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <figure className="m-0 overflow-hidden rounded-xl border border-royal/12 bg-white">
      <img
        src={url}
        alt={caption}
        loading="lazy"
        className="aspect-[4/3] w-full bg-[#f2f5fa] object-cover"
      />
      <figcaption className="space-y-1.5 p-2.5">
        <p className="truncate font-arabic text-[10.5px] text-royal-ink/70">{caption}</p>
        {meta ? (
          <p dir="ltr" className="font-sans text-[9.5px] text-royal-ink/40">{meta}</p>
        ) : null}
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(url).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            }}
            className="flex-1 rounded-lg border border-royal/15 py-1 font-arabic text-[10px] font-semibold text-royal hover:bg-[#fffdf8]"
          >
            {copied ? "✓ نُسخ" : "نسخ الرابط"}
          </button>
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg border border-red-200 px-2 font-arabic text-[10px] text-red-600 hover:bg-red-50"
            >
              حذف
            </button>
          ) : null}
        </div>
      </figcaption>
    </figure>
  );
}

/** رفع متعدد مستقل داخل مكتبة الوسائط */
function GithubBulkUploader({ onDone }: { onDone: (msg: string) => void }) {
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);

  return (
    <Panel title="رفع صور جديدة" subtitle="اسحب عدة صور أو اضغط للاختيار">
      <MultiImageField
        label="صور للرفع"
        photos={photos}
        folder="library"
        contentTree={null}
        max={20}
        onChange={(next) => {
          setPhotos(next);
          if (next.length > photos.length) {
            onDone("✓ رُفعت الصور. انسخ روابطها من الأسفل أو استعملها في الأقسام.");
          }
        }}
      />
    </Panel>
  );
}

/* ════════════ ٤. الأخبار ════════════ */

export function NewsSection({ draft, patch, tree, purgeMedia }: SectionProps) {
  const items = draft.news.items;
  const setItems = (next: NewsItem[]) =>
    patch((d) => ({ ...d, news: { ...d.news, items: next } }));
  const setNews = (v: Partial<typeof draft.news>) =>
    patch((d) => ({ ...d, news: { ...d.news, ...v } }));

  const add = () => {
    const now = Date.now();
    setItems([
      {
        id: createId("news"),
        titleAr: "",
        categoryAr: "",
        categoryFr: "",
        dateISO: new Date().toISOString().slice(0, 10),
        excerptAr: "",
        bodyAr: "",
        image: null,
        imageAlt: "",
        gallery: [],
        published: false,
        createdAt: now,
        updatedAt: now,
      },
      ...items,
    ]);
  };

  return (
    <div className="space-y-5">
      <Panel title="ترويسة صفحة الأخبار">
        <HeaderEditor header={draft.news.header} onChange={(header) => setNews({ header })} />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="عنوان القائمة (عربي)"><TextInput value={draft.news.listTitleAr} onChange={(v) => setNews({ listTitleAr: v })} /></Field>
          <Field label="عنوان القائمة (فرنسي)"><TextInput dir="ltr" value={draft.news.listTitleFr} onChange={(v) => setNews({ listTitleFr: v })} /></Field>
        </div>
        <div className="mt-4">
          <Field label="نص حالة عدم وجود أخبار"><TextInput value={draft.news.emptyMessage} onChange={(v) => setNews({ emptyMessage: v })} /></Field>
        </div>
      </Panel>

      <Panel
        title={`الأخبار (${items.length})`}
        subtitle="أضف خبراً، ارفع صورته، ثم فعّل «منشور» ليظهر للزوار"
        actions={<Button onClick={add}>+ خبر جديد</Button>}
      >
        {items.length === 0 ? (
          <EmptyHint text="لا توجد أخبار. اضغط «خبر جديد» للإضافة." />
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <ItemShell
                key={item.id}
                title={item.titleAr}
                badge={item.published ? "منشور" : "مسودة"}
                onUp={index > 0 ? () => setItems(move(items, index, index - 1)) : undefined}
                onDown={index < items.length - 1 ? () => setItems(move(items, index, index + 1)) : undefined}
                onDelete={() => setItems(items.filter((n) => n.id !== item.id))}
              >
                {(() => {
                  const upd = (v: Partial<NewsItem>) =>
                    setItems(items.map((n) => (n.id === item.id ? { ...n, ...v, updatedAt: Date.now() } : n)));
                  return (
                    <>
                      <Field label="عنوان الخبر"><TextInput value={item.titleAr} onChange={(v) => upd({ titleAr: v })} /></Field>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Field label="التصنيف (عربي)"><TextInput value={item.categoryAr} onChange={(v) => upd({ categoryAr: v })} /></Field>
                        <Field label="التصنيف (فرنسي)"><TextInput dir="ltr" value={item.categoryFr} onChange={(v) => upd({ categoryFr: v })} /></Field>
                        <Field label="التاريخ"><TextInput type="date" dir="ltr" value={item.dateISO} onChange={(v) => upd({ dateISO: v })} /></Field>
                      </div>
                      <Field label="المقتطف"><TextArea rows={3} value={item.excerptAr} onChange={(v) => upd({ excerptAr: v })} /></Field>
                      <Field label="نص الخبر" hint="اترك سطراً فارغاً بين الفقرات">
                        <TextArea rows={7} value={item.bodyAr} onChange={(v) => upd({ bodyAr: v })} />
                      </Field>
                      <ImageField
                        label="الصورة الرئيسية (الغلاف)"
                        media={item.image}
                        folder="news"
                        contentTree={tree}
                        onPurge={purgeMedia}
                        maxWidth={1400}
                        hint="تظهر في بطاقة الخبر وفي الصفحة الرئيسية."
                        onChange={(m) => upd({ image: m })}
                      />
                      <Field label="النص البديل للصورة الرئيسية"><TextInput value={item.imageAlt} onChange={(v) => upd({ imageAlt: v })} /></Field>

                      <MultiImageField
                        label={`ألبوم صور الخبر (حتى ${MAX_NEWS_PHOTOS} صور)`}
                        photos={item.gallery ?? []}
                        folder="news"
                        contentTree={tree}
                        onPurge={purgeMedia}
                        max={MAX_NEWS_PHOTOS}
                        maxWidth={1600}
                        onChange={(gallery) => upd({ gallery })}
                      />
                      <Toggle checked={item.published} onChange={(v) => upd({ published: v })} label="منشور للزوار" />
                    </>
                  );
                })()}
              </ItemShell>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ════════════ ٥/٦. الأعضاء والمدربون ════════════ */

const GROUP_LABEL: Record<TeamGroup, string> = {
  president: "رئيس النادي",
  bureau: "المكتب المسيّر",
  coach: "مدرب",
  staff: "الطاقم التقني",
};

function PeopleEditor({
  draft,
  patch,
  tree,
  purgeMedia,
  groups,
  title,
  subtitle,
}: SectionProps & { groups: TeamGroup[]; title: string; subtitle: string }) {
  const all = draft.members.people;
  const visible = all.filter((p) => groups.includes(p.group));

  const setAll = (next: TeamPerson[]) =>
    patch((d) => ({ ...d, members: { ...d.members, people: next } }));

  const add = () =>
    setAll([
      ...all,
      {
        id: createId("person"),
        nameAr: "",
        nameFr: "",
        roleAr: groups[0] === "coach" ? "مدرب" : "",
        roleFr: "",
        bioAr: "",
        photo: null,
        group: groups[0],
        order: visible.length,
        published: true,
      },
    ]);

  return (
    <Panel
      title={`${title} (${visible.length})`}
      subtitle={subtitle}
      actions={<Button onClick={add}>+ إضافة</Button>}
    >
      {visible.length === 0 ? (
        <EmptyHint text="لا يوجد أشخاص في هذا القسم. اضغط «إضافة»." />
      ) : (
        <div className="space-y-3">
          {visible.map((person, index) => {
            const upd = (v: Partial<TeamPerson>) =>
              setAll(all.map((p) => (p.id === person.id ? { ...p, ...v } : p)));
            const reorder = (dir: -1 | 1) => {
              const ids = visible.map((p) => p.id);
              const reordered = move(ids, index, index + dir);
              setAll(
                all.map((p) =>
                  ids.includes(p.id) ? { ...p, order: reordered.indexOf(p.id) } : p
                )
              );
            };
            return (
              <ItemShell
                key={person.id}
                title={person.nameAr || person.roleAr}
                badge={GROUP_LABEL[person.group]}
                onUp={index > 0 ? () => reorder(-1) : undefined}
                onDown={index < visible.length - 1 ? () => reorder(1) : undefined}
                onDelete={() => setAll(all.filter((p) => p.id !== person.id))}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="الاسم الكامل (عربي)"><TextInput value={person.nameAr} onChange={(v) => upd({ nameAr: v })} /></Field>
                  <Field label="الاسم (لاتيني)"><TextInput dir="ltr" value={person.nameFr} onChange={(v) => upd({ nameFr: v })} /></Field>
                  <Field label="المنصب (عربي)"><TextInput value={person.roleAr} onChange={(v) => upd({ roleAr: v })} /></Field>
                  <Field label="المنصب (فرنسي)"><TextInput dir="ltr" value={person.roleFr} onChange={(v) => upd({ roleFr: v })} /></Field>
                </div>
                <Field label="نبذة قصيرة (اختيارية)">
                  <TextArea rows={2} value={person.bioAr} onChange={(v) => upd({ bioAr: v })} />
                </Field>
                <ImageField
                  label="الصورة الشخصية"
                  media={person.photo}
                  folder="team"
                  contentTree={tree}
                  onPurge={purgeMedia}
                  maxWidth={800}
                  onChange={(m) => upd({ photo: m })}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="القسم">
                    <Select
                      value={person.group}
                      onChange={(v) => upd({ group: v })}
                      options={[
                        { value: "president", label: "رئيس النادي" },
                        { value: "bureau", label: "المكتب المسيّر" },
                        { value: "coach", label: "المدربون" },
                        { value: "staff", label: "الطاقم التقني" },
                      ]}
                    />
                  </Field>
                  <div className="flex items-end pb-2">
                    <Toggle checked={person.published} onChange={(v) => upd({ published: v })} label="ظاهر في الموقع" />
                  </div>
                </div>
              </ItemShell>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

export function MembersSection(props: SectionProps) {
  const { draft, patch } = props;
  return (
    <div className="space-y-5">
      <Panel title="ترويسة صفحة الأعضاء">
        <HeaderEditor
          header={draft.members.header}
          onChange={(header) => patch((d) => ({ ...d, members: { ...d.members, header } }))}
        />
      </Panel>

      <Panel title="نصوص قسم الرئاسة">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="عنوان القسم (عربي)">
            <TextInput value={draft.members.presidencyTitleAr} onChange={(v) => patch((d) => ({ ...d, members: { ...d.members, presidencyTitleAr: v } }))} />
          </Field>
          <Field label="عنوان القسم (فرنسي)">
            <TextInput dir="ltr" value={draft.members.presidencyTitleFr} onChange={(v) => patch((d) => ({ ...d, members: { ...d.members, presidencyTitleFr: v } }))} />
          </Field>
        </div>
        <div className="mt-4 space-y-4">
          <Field label="عنوان بطاقة المهام">
            <TextInput value={draft.members.presidencyIntro} onChange={(v) => patch((d) => ({ ...d, members: { ...d.members, presidencyIntro: v } }))} />
          </Field>
          <StringListEditor
            label="قائمة المهام"
            values={draft.members.presidencyTasks}
            onChange={(presidencyTasks) => patch((d) => ({ ...d, members: { ...d.members, presidencyTasks } }))}
          />
        </div>
      </Panel>

      <PeopleEditor {...props} groups={["president"]} title="رئيس النادي" subtitle="بطاقة الرئيس تظهر في أعلى الصفحة" />
      <PeopleEditor {...props} groups={["bureau"]} title="المكتب المسيّر" subtitle="نائب الرئيس، الكاتب العام، أمين المال…" />
      <PeopleEditor {...props} groups={["staff"]} title="الطاقم التقني" subtitle="المسؤول التقني، الحكم، الإعلام…" />
    </div>
  );
}

export function CoachesSection(props: SectionProps) {
  return <PeopleEditor {...props} groups={["coach"]} title="المدربون" subtitle="المدربون المشرفون على التداريب" />;
}

/* ════════════ ٧. البطولات والنتائج ════════════ */

export function TournamentsSection({ draft, patch }: SectionProps) {
  const t = draft.tournaments;
  const set = (v: Partial<typeof t>) =>
    patch((d) => ({ ...d, tournaments: { ...d.tournaments, ...v } }));

  const addTournament = () =>
    set({
      items: [
        ...t.items,
        {
          id: createId("tournament"),
          titleAr: "",
          titleFr: "",
          formatAr: "",
          roundsAr: "",
          dateAr: "",
          status: "upcoming",
          published: true,
          order: t.items.length,
        },
      ],
    });

  const addRow = () =>
    set({
      standings: [
        ...t.standings,
        { id: createId("row"), rank: t.standings.length + 1, playerAr: "", playedAr: "", pointsAr: "" },
      ],
    });

  return (
    <div className="space-y-5">
      <Panel title="ترويسة الصفحة">
        <HeaderEditor header={t.header} onChange={(header) => set({ header })} />
      </Panel>

      <Panel
        title={`الدورات (${t.items.length})`}
        actions={<Button onClick={addTournament}>+ دورة</Button>}
      >
        {t.items.length === 0 ? (
          <EmptyHint text="لا توجد دورات. اضغط «دورة» للإضافة." />
        ) : (
          <div className="space-y-3">
            {t.items.map((item, index) => {
              const upd = (v: Partial<Tournament>) =>
                set({ items: t.items.map((x) => (x.id === item.id ? { ...x, ...v } : x)) });
              return (
                <ItemShell
                  key={item.id}
                  title={item.titleAr}
                  badge={item.published ? "منشورة" : "مخفية"}
                  onUp={index > 0 ? () => set({ items: move(t.items, index, index - 1) }) : undefined}
                  onDown={index < t.items.length - 1 ? () => set({ items: move(t.items, index, index + 1) }) : undefined}
                  onDelete={() => set({ items: t.items.filter((x) => x.id !== item.id) })}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="اسم الدورة (عربي)"><TextInput value={item.titleAr} onChange={(v) => upd({ titleAr: v })} /></Field>
                    <Field label="اسم الدورة (فرنسي)"><TextInput dir="ltr" value={item.titleFr} onChange={(v) => upd({ titleFr: v })} /></Field>
                    <Field label="النظام"><TextInput value={item.formatAr} onChange={(v) => upd({ formatAr: v })} /></Field>
                    <Field label="عدد الجولات"><TextInput value={item.roundsAr} onChange={(v) => upd({ roundsAr: v })} /></Field>
                    <Field label="التاريخ (نص حر)"><TextInput value={item.dateAr} onChange={(v) => upd({ dateAr: v })} /></Field>
                    <Field label="الحالة">
                      <Select
                        value={item.status}
                        onChange={(v) => upd({ status: v })}
                        options={[
                          { value: "upcoming", label: "قادمة" },
                          { value: "ongoing", label: "جارية" },
                          { value: "done", label: "منتهية" },
                        ]}
                      />
                    </Field>
                  </div>
                  <Toggle checked={item.published} onChange={(v) => upd({ published: v })} label="منشورة للزوار" />
                </ItemShell>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel
        title={`جدول الترتيب (${t.standings.length})`}
        subtitle="يظهر جدولاً على الحاسوب وقائمة على الهاتف"
        actions={<Button onClick={addRow}>+ صف</Button>}
      >
        {t.standings.length === 0 ? (
          <EmptyHint text="لا توجد نتائج. اضغط «صف» لإضافة لاعب." />
        ) : (
          <div className="space-y-2">
            {t.standings.map((row, index) => {
              const upd = (v: Partial<StandingRow>) =>
                set({ standings: t.standings.map((x) => (x.id === row.id ? { ...x, ...v } : x)) });
              return (
                <div key={row.id} className="grid grid-cols-[52px_1fr_72px_72px_auto] items-center gap-2">
                  <input
                    type="number"
                    value={row.rank}
                    onChange={(e) => upd({ rank: Number(e.target.value) })}
                    className="w-full rounded-lg border border-royal/15 px-2 py-2 text-center font-sans text-[12.5px]"
                  />
                  <input
                    value={row.playerAr}
                    placeholder="اسم اللاعب"
                    onChange={(e) => upd({ playerAr: e.target.value })}
                    className="w-full rounded-lg border border-royal/15 px-3 py-2 font-arabic text-[12.5px]"
                  />
                  <input
                    value={row.playedAr}
                    placeholder="مباريات"
                    onChange={(e) => upd({ playedAr: e.target.value })}
                    className="w-full rounded-lg border border-royal/15 px-2 py-2 text-center font-arabic text-[12.5px]"
                  />
                  <input
                    value={row.pointsAr}
                    placeholder="نقط"
                    onChange={(e) => upd({ pointsAr: e.target.value })}
                    className="w-full rounded-lg border border-royal/15 px-2 py-2 text-center font-arabic text-[12.5px]"
                  />
                  <button
                    type="button"
                    onClick={() => set({ standings: t.standings.filter((x) => x.id !== row.id) })}
                    className="rounded-lg border border-red-200 px-2.5 py-2 font-arabic text-[11px] text-red-600 hover:bg-red-50"
                  >
                    حذف
                  </button>
                  {index < 0 ? null : null}
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ════════════ ٨. المعرض ════════════ */

export function GallerySection({ draft, patch, tree, purgeMedia }: SectionProps) {
  const g = draft.gallery;
  const set = (v: Partial<typeof g>) =>
    patch((d) => ({ ...d, gallery: { ...d.gallery, ...v } }));

  const add = () =>
    set({
      items: [
        ...g.items,
        { id: createId("photo"), titleAr: "", titleFr: "", image: null, order: g.items.length, published: true },
      ],
    });

  return (
    <div className="space-y-5">
      <Panel title="ترويسة المعرض">
        <HeaderEditor header={g.header} onChange={(header) => set({ header })} />
        <div className="mt-4">
          <Field label="نص حالة المعرض الفارغ"><TextInput value={g.emptyMessage} onChange={(v) => set({ emptyMessage: v })} /></Field>
        </div>
      </Panel>

      <Panel
        title={`صور المعرض (${g.items.length})`}
        subtitle="استعمل الأسهم لإعادة الترتيب"
        actions={<Button onClick={add}>+ صورة</Button>}
      >
        {g.items.length === 0 ? (
          <EmptyHint text="المعرض فارغ. اضغط «صورة» لإضافة أول صورة." />
        ) : (
          <div className="space-y-3">
            {g.items.map((item, index) => {
              const upd = (v: Partial<GalleryItem>) =>
                set({ items: g.items.map((x) => (x.id === item.id ? { ...x, ...v } : x)) });
              return (
                <ItemShell
                  key={item.id}
                  title={item.titleAr || `صورة ${index + 1}`}
                  badge={item.published ? "ظاهرة" : "مخفية"}
                  onUp={index > 0 ? () => set({ items: move(g.items, index, index - 1) }) : undefined}
                  onDown={index < g.items.length - 1 ? () => set({ items: move(g.items, index, index + 1) }) : undefined}
                  onDelete={() => set({ items: g.items.filter((x) => x.id !== item.id) })}
                >
                  <ImageField
                    label="الصورة"
                    media={item.image}
                    folder="gallery"
                    contentTree={tree}
                    onPurge={purgeMedia}
                    maxWidth={1400}
                    onChange={(m) => upd({ image: m })}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="العنوان (عربي)"><TextInput value={item.titleAr} onChange={(v) => upd({ titleAr: v })} /></Field>
                    <Field label="العنوان (فرنسي)"><TextInput dir="ltr" value={item.titleFr} onChange={(v) => upd({ titleFr: v })} /></Field>
                  </div>
                  <Toggle checked={item.published} onChange={(v) => upd({ published: v })} label="ظاهرة في المعرض" />
                </ItemShell>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ════════════ ٩. من نحن ════════════ */

function LabeledListEditor({
  title,
  items,
  onChange,
}: {
  title: string;
  items: LabeledItem[];
  onChange: (items: LabeledItem[]) => void;
}) {
  return (
    <Panel
      title={`${title} (${items.length})`}
      actions={
        <Button onClick={() => onChange([...items, { id: createId("li"), ar: "", fr: "", text: "" }])}>
          + إضافة
        </Button>
      }
    >
      {items.length === 0 ? (
        <EmptyHint text="لا توجد عناصر." />
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const upd = (v: Partial<LabeledItem>) =>
              onChange(items.map((x) => (x.id === item.id ? { ...x, ...v } : x)));
            return (
              <ItemShell
                key={item.id}
                title={item.ar}
                onUp={index > 0 ? () => onChange(move(items, index, index - 1)) : undefined}
                onDown={index < items.length - 1 ? () => onChange(move(items, index, index + 1)) : undefined}
                onDelete={() => onChange(items.filter((x) => x.id !== item.id))}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="العنوان (عربي)"><TextInput value={item.ar} onChange={(v) => upd({ ar: v })} /></Field>
                  <Field label="العنوان (فرنسي)"><TextInput dir="ltr" value={item.fr} onChange={(v) => upd({ fr: v })} /></Field>
                </div>
                <Field label="الوصف"><TextArea rows={2} value={item.text} onChange={(v) => upd({ text: v })} /></Field>
              </ItemShell>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

export function AboutSection({ draft, patch, tree, purgeMedia }: SectionProps) {
  const a = draft.about;
  const set = (v: Partial<typeof a>) => patch((d) => ({ ...d, about: { ...d.about, ...v } }));

  return (
    <div className="space-y-5">
      <Panel title="ترويسة الصفحة">
        <HeaderEditor header={a.header} onChange={(header) => set({ header })} />
      </Panel>

      <Panel title="نص التعريف">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="عنوان القسم (عربي)"><TextInput value={a.sectionTitleAr} onChange={(v) => set({ sectionTitleAr: v })} /></Field>
          <Field label="عنوان القسم (فرنسي)"><TextInput dir="ltr" value={a.sectionTitleFr} onChange={(v) => set({ sectionTitleFr: v })} /></Field>
        </div>
        <div className="mt-4 space-y-4">
          <Field label="الفقرة الأولى"><TextArea rows={4} value={a.paragraph1} onChange={(v) => set({ paragraph1: v })} /></Field>
          <Field label="الفقرة الثانية"><TextArea rows={3} value={a.paragraph2} onChange={(v) => set({ paragraph2: v })} /></Field>
          <ImageField
            label="صورة الصفحة"
            media={a.photo}
            folder="about"
            contentTree={tree}
            onPurge={purgeMedia}
            maxWidth={1400}
            onChange={(m) => set({ photo: m })}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="تعليق الصورة (عربي)"><TextInput value={a.photoCaptionAr} onChange={(v) => set({ photoCaptionAr: v })} /></Field>
            <Field label="تعليق الصورة (فرنسي)"><TextInput dir="ltr" value={a.photoCaptionFr} onChange={(v) => set({ photoCaptionFr: v })} /></Field>
          </div>
          <Field label="نص فقرة الإنجازات"><TextArea rows={3} value={a.recordsNotice} onChange={(v) => set({ recordsNotice: v })} /></Field>
        </div>
      </Panel>

      <LabeledListEditor title="أهداف النادي" items={a.objectives} onChange={(objectives) => set({ objectives })} />
      <LabeledListEditor title="أنشطة النادي" items={a.activities} onChange={(activities) => set({ activities })} />
    </div>
  );
}

/* ════════════ ١٠. مدرسة الشطرنج ════════════ */

export function TrainingSection({ draft, patch, tree, purgeMedia }: SectionProps) {
  const t = draft.training;
  const set = (v: Partial<typeof t>) => patch((d) => ({ ...d, training: { ...d.training, ...v } }));

  return (
    <div className="space-y-5">
      <Panel title="ترويسة الصفحة">
        <HeaderEditor header={t.header} onChange={(header) => set({ header })} />
      </Panel>

      <Panel title="منهجية التدريب">
        <div className="space-y-4">
          <Field label="عنوان المنهجية"><TextInput value={t.approachTitle} onChange={(v) => set({ approachTitle: v })} /></Field>
          <Field label="نص المنهجية"><TextArea rows={4} value={t.approachText} onChange={(v) => set({ approachText: v })} /></Field>
          <StringListEditor label="نقاط المنهجية" values={t.approachPoints} onChange={(approachPoints) => set({ approachPoints })} />
          <ImageField
            label="صورة القسم"
            media={t.photo}
            folder="training"
            contentTree={tree}
            onPurge={purgeMedia}
            maxWidth={1200}
            onChange={(m) => set({ photo: m })}
          />
          <Field label="تعليق أسفل الصورة (اختياري)"><TextInput value={t.photoNote} onChange={(v) => set({ photoNote: v })} /></Field>
          <Field label="نص فقرة التسجيل"><TextArea rows={3} value={t.registrationNotice} onChange={(v) => set({ registrationNotice: v })} /></Field>
        </div>
      </Panel>

      <Panel
        title={`مستويات التعلم (${t.levels.length})`}
        actions={
          <Button
            onClick={() =>
              set({
                levels: [
                  ...t.levels,
                  { id: createId("level"), step: String(t.levels.length + 1).padStart(2, "٠"), ar: "", fr: "", text: "", points: "" },
                ],
              })
            }
          >
            + مستوى
          </Button>
        }
      >
        {t.levels.length === 0 ? (
          <EmptyHint text="لا توجد مستويات." />
        ) : (
          <div className="space-y-3">
            {t.levels.map((level, index) => {
              const upd = (v: Partial<TrainingLevel>) =>
                set({ levels: t.levels.map((x) => (x.id === level.id ? { ...x, ...v } : x)) });
              return (
                <ItemShell
                  key={level.id}
                  title={level.ar}
                  badge={level.step}
                  onUp={index > 0 ? () => set({ levels: move(t.levels, index, index - 1) }) : undefined}
                  onDown={index < t.levels.length - 1 ? () => set({ levels: move(t.levels, index, index + 1) }) : undefined}
                  onDelete={() => set({ levels: t.levels.filter((x) => x.id !== level.id) })}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label="رقم المرحلة"><TextInput value={level.step} onChange={(v) => upd({ step: v })} /></Field>
                    <Field label="الاسم (عربي)"><TextInput value={level.ar} onChange={(v) => upd({ ar: v })} /></Field>
                    <Field label="الاسم (فرنسي)"><TextInput dir="ltr" value={level.fr} onChange={(v) => upd({ fr: v })} /></Field>
                  </div>
                  <Field label="الوصف"><TextArea rows={2} value={level.text} onChange={(v) => upd({ text: v })} /></Field>
                  <Field label="المحاور" hint="افصل بينها بفاصلة ،">
                    <TextInput value={level.points} onChange={(v) => upd({ points: v })} />
                  </Field>
                </ItemShell>
              );
            })}
          </div>
        )}
      </Panel>

      <LabeledListEditor title="برامج التكوين" items={t.programs} onChange={(programs) => set({ programs })} />
    </div>
  );
}

/* ════════════ ١١. التواصل ════════════ */

export function ContactSection({ draft, patch }: SectionProps) {
  const c = draft.contact;
  const set = (v: Partial<typeof c>) => patch((d) => ({ ...d, contact: { ...d.contact, ...v } }));

  return (
    <div className="space-y-5">
      <Panel title="ترويسة الصفحة">
        <HeaderEditor header={c.header} onChange={(header) => set({ header })} />
      </Panel>

      <Panel title="معلومات التواصل" subtitle="اترك الحقل فارغاً ليظهر كـ «غير متوفر» بدل معلومة خاطئة">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="المدينة"><TextInput value={c.city} onChange={(v) => set({ city: v })} /></Field>
          <Field label="العنوان الكامل"><TextInput value={c.address} onChange={(v) => set({ address: v })} /></Field>
          <Field label="الهاتف"><TextInput dir="ltr" value={c.phone} onChange={(v) => set({ phone: v })} /></Field>
          <Field label="البريد الإلكتروني"><TextInput dir="ltr" value={c.email} onChange={(v) => set({ email: v })} /></Field>
        </div>
        <div className="mt-4">
          <Field label="نص تعريفي بجانب النموذج"><TextArea rows={3} value={c.aboutText} onChange={(v) => set({ aboutText: v })} /></Field>
        </div>
      </Panel>

      <Panel
        title={`شبكات التواصل (${c.socials.length})`}
        actions={
          <Button onClick={() => set({ socials: [...c.socials, { id: createId("social"), labelAr: "", labelFr: "", url: "" }] })}>
            + رابط
          </Button>
        }
      >
        {c.socials.length === 0 ? (
          <EmptyHint text="لا توجد روابط. الروابط الفارغة لا تظهر للزوار." />
        ) : (
          <div className="space-y-3">
            {c.socials.map((s, index) => {
              const upd = (v: Partial<typeof s>) =>
                set({ socials: c.socials.map((x) => (x.id === s.id ? { ...x, ...v } : x)) });
              return (
                <div key={s.id} className="grid grid-cols-1 gap-2 rounded-xl border border-royal/12 bg-[#fbfcfe] p-3 sm:grid-cols-[1fr_1fr_2fr_auto]">
                  <input value={s.labelAr} placeholder="الاسم بالعربية" onChange={(e) => upd({ labelAr: e.target.value })} className="rounded-lg border border-royal/15 px-3 py-2 font-arabic text-[12.5px]" />
                  <input value={s.labelFr} dir="ltr" placeholder="Nom" onChange={(e) => upd({ labelFr: e.target.value })} className="rounded-lg border border-royal/15 px-3 py-2 text-left font-sans text-[12.5px]" />
                  <input value={s.url} dir="ltr" placeholder="https://…" onChange={(e) => upd({ url: e.target.value })} className="rounded-lg border border-royal/15 px-3 py-2 text-left font-sans text-[12.5px]" />
                  <div className="flex gap-1">
                    {index > 0 ? (
                      <button type="button" onClick={() => set({ socials: move(c.socials, index, index - 1) })} className="rounded-lg border border-royal/12 px-2 text-[11px]">↑</button>
                    ) : null}
                    <button type="button" onClick={() => set({ socials: c.socials.filter((x) => x.id !== s.id) })} className="rounded-lg border border-red-200 px-2.5 font-arabic text-[11px] text-red-600 hover:bg-red-50">حذف</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel
        title={`أوقات الفتح (${c.hours?.length ?? 0})`}
        subtitle="صف لكل يوم — استعمل الأسهم للترتيب. لا يظهر الجدول للزوار إن كان فارغاً"
        actions={
          <Button
            onClick={() =>
              set({
                hours: [
                  ...(c.hours ?? []),
                  { id: createId("hour"), dayAr: "", timeAr: "", closed: false },
                ],
              })
            }
          >
            + يوم
          </Button>
        }
      >
        {(c.hours ?? []).length === 0 ? (
          <EmptyHint text="لم تُضَف أي أوقات. اضغط «يوم» للإضافة." />
        ) : (
          <div className="space-y-2">
            {(c.hours ?? []).map((row, index) => {
              const upd = (v: Partial<OpeningHour>) =>
                set({ hours: (c.hours ?? []).map((x) => (x.id === row.id ? { ...x, ...v } : x)) });
              return (
                <div
                  key={row.id}
                  className="grid grid-cols-1 items-center gap-2 rounded-xl border border-royal/12 bg-[#fbfcfe] p-3 sm:grid-cols-[1fr_1fr_auto_auto]"
                >
                  <input
                    value={row.dayAr}
                    placeholder="اليوم (مثال: الإثنين)"
                    onChange={(e) => upd({ dayAr: e.target.value })}
                    className="rounded-lg border border-royal/15 px-3 py-2 font-arabic text-[12.5px]"
                  />
                  <input
                    value={row.timeAr}
                    placeholder="الوقت (مثال: 16:00 – 20:00)"
                    disabled={row.closed}
                    onChange={(e) => upd({ timeAr: e.target.value })}
                    className="rounded-lg border border-royal/15 px-3 py-2 font-arabic text-[12.5px] disabled:bg-[#f1f3f6] disabled:text-royal-ink/40"
                  />
                  <Toggle
                    checked={row.closed}
                    onChange={(v) => upd({ closed: v })}
                    label="مغلق"
                  />
                  <div className="flex gap-1">
                    {index > 0 ? (
                      <button
                        type="button"
                        aria-label="تحريك لأعلى"
                        onClick={() => set({ hours: move(c.hours ?? [], index, index - 1) })}
                        className="rounded-lg border border-royal/12 px-2 text-[11px]"
                      >
                        ↑
                      </button>
                    ) : null}
                    {index < (c.hours ?? []).length - 1 ? (
                      <button
                        type="button"
                        aria-label="تحريك لأسفل"
                        onClick={() => set({ hours: move(c.hours ?? [], index, index + 1) })}
                        className="rounded-lg border border-royal/12 px-2 text-[11px]"
                      >
                        ↓
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => set({ hours: (c.hours ?? []).filter((x) => x.id !== row.id) })}
                      className="rounded-lg border border-red-200 px-2.5 font-arabic text-[11px] text-red-600 hover:bg-red-50"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4">
          <Field label="ملاحظة أسفل الجدول" hint="مثال: قد تتغير الأوقات خلال العطل.">
            <TextInput value={c.hoursNote ?? ""} onChange={(v) => set({ hoursNote: v })} />
          </Field>
        </div>
      </Panel>

      <Panel title="المكان والخريطة" subtitle="تُعرض الخريطة فقط إذا كان الرابط من خرائط Google">
        <div className="space-y-4">
          <Field label="تفاصيل العنوان" hint="يظهر فوق الخريطة.">
            <TextArea rows={2} value={c.addressDetails ?? ""} onChange={(v) => set({ addressDetails: v })} />
          </Field>
          <Field
            label="رابط تضمين الخريطة (iframe src)"
            hint="خرائط Google ← مشاركة ← تضمين خريطة ← نسخ HTML ← انسخ قيمة src فقط (تبدأ بـ /maps/embed?pb=)."
          >
            <TextInput dir="ltr" value={c.mapEmbedUrl ?? ""} onChange={(v) => set({ mapEmbedUrl: v })} />
          </Field>

          {(c.mapEmbedUrl ?? "").includes("output=embed") ? (
            <p className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 font-arabic text-[11.5px] leading-[1.95] text-amber-900">
              ⚠️ هذا الرابط من نوع <span dir="ltr" className="font-sans">output=embed</span> ولن تظهر
              الخريطة به، لأن Google يمنع تضمينه في المواقع الأخرى
              (<span dir="ltr" className="font-sans">X-Frame-Options</span>).
              الحل: في خرائط Google اضغط <strong>مشاركة ← تضمين خريطة ← نسخ HTML</strong>،
              ثم خذ قيمة <span dir="ltr" className="font-sans">src</span> التي تبدأ بـ{" "}
              <span dir="ltr" className="font-sans">https://www.google.com/maps/embed?pb=</span>
            </p>
          ) : null}
          <Field label="رابط «كيف تصل»" hint="رابط المكان العادي من خرائط Google.">
            <TextInput dir="ltr" value={c.mapLinkUrl ?? ""} onChange={(v) => set({ mapLinkUrl: v })} />
          </Field>
        </div>
      </Panel>

      <Panel title="نموذج المراسلة">
        <Toggle
          checked={c.formEnabled}
          onChange={(v) => set({ formEnabled: v })}
          label="النموذج مربوط فعلياً بخدمة إرسال"
        />
        <p className="mt-2 rounded-xl border border-gold/35 bg-[#fdf8ec] px-3.5 py-2.5 font-arabic text-[11.5px] leading-[1.9] text-[#6f5720]">
          لا تفعّل هذا الخيار إلا بعد ربط النموذج فعلاً بخدمة بريد. عند تعطيله يُعرض للزوار تنبيه صريح بأن الرسائل لا تُرسل.
        </p>
        <div className="mt-4">
          <Field label="نص التنبيه عند تعطيل الإرسال">
            <TextArea rows={2} value={c.formNotice} onChange={(v) => set({ formNotice: v })} />
          </Field>
        </div>
      </Panel>
    </div>
  );
}

/* ════════════ طلبات التسجيل ════════════ */

const LEVEL_LABEL: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

function levelLabel(level: string): string {
  return LEVEL_LABEL[level] ?? level;
}

function formatStamp(ms: number | null): string {
  if (!ms) return "—";
  try {
    const d = new Date(ms);
    const date = new Intl.DateTimeFormat("ar-MA-u-nu-arab", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
    const time = new Intl.DateTimeFormat("ar-MA-u-nu-arab", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
    return `${date} · ${time}`;
  } catch {
    return new Date(ms).toLocaleString("ar");
  }
}

/**
 * يصدّر طلبات التسجيل إلى ملف CSV يفتحه Excel مباشرة.
 * BOM في البداية ضروري ليقرأ Excel العربية بشكل صحيح.
 */
function exportRegistrationsCsv(items: Registration[]) {
  const headers = [
    "الاسم الكامل", "الهاتف", "البريد", "الميلاد/السن",
    "ولي الأمر", "المستوى", "الحالة", "الملاحظات", "تاريخ الطلب",
  ];

  const esc = (v: unknown) => {
    const t = String(v ?? "").replace(/"/g, '""');
    return `"${t}"`;
  };

  const rows = items.map((r) =>
    [
      r.fullName,
      // حرف ' يمنع Excel من حذف الصفر الأول في 06…
      r.phone ? `'${r.phone}` : "",
      r.email,
      r.birthInfo,
      r.guardianName,
      levelLabel(r.level),
      r.status === "new" ? "جديد" : "تمت المعالجة",
      (r.notes ?? "").replace(/\r?\n/g, " "),
      formatStamp(r.createdAt),
    ].map(esc).join(",")
  );

  const csv = "\uFEFF" + [headers.map(esc).join(","), ...rows].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const stamp = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `طلبات-التسجيل-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function RegistrationsSection() {
  const { items, loading, error } = useRegistrations();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const newCount = items.filter((r) => r.status === "new").length;

  async function run(id: string, fn: () => Promise<void>) {
    setBusyId(id);
    setActionError(null);
    try {
      await fn();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "تعذّر تنفيذ العملية.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Panel
      title={`طلبات التسجيل (${items.length})`}
      subtitle="الأحدث أولاً — تصل مباشرة من استمارة الموقع"
      actions={
        <div className="flex items-center gap-2">
          {newCount > 0 ? (
            <span className="rounded-full bg-gold px-2.5 py-1 font-arabic text-[11px] font-bold text-royal-deep">
              {newCount} جديد
            </span>
          ) : null}
          {items.length > 0 ? (
            <Button variant="ghost" onClick={() => exportRegistrationsCsv(items)}>
              ⬇ تصدير Excel
            </Button>
          ) : null}
        </div>
      }
    >
      {error ? (
        <p className="mb-4 rounded-xl border border-red-300 bg-red-50 px-3.5 py-2.5 font-arabic text-[12px] leading-[1.9] text-red-700">
          تعذّر قراءة الطلبات: {error} — تأكد من لصق قواعد مسار registrations في Firebase.
        </p>
      ) : null}

      {actionError ? (
        <p className="mb-4 rounded-xl border border-red-300 bg-red-50 px-3.5 py-2.5 font-arabic text-[12px] text-red-700">
          {actionError}
        </p>
      ) : null}

      {loading ? (
        <EmptyHint text="جاري التحميل…" />
      ) : items.length === 0 ? (
        <EmptyHint text="لا توجد طلبات تسجيل بعد. ستظهر هنا فور إرسالها من الموقع." />
      ) : (
        <ul className="m-0 list-none space-y-3 p-0">
          {items.map((reg) => (
            <RegistrationRow
              key={reg.id}
              reg={reg}
              busy={busyId === reg.id}
              onToggle={() =>
                run(reg.id, () =>
                  setRegistrationStatus(reg.id, reg.status === "new" ? "done" : "new")
                )
              }
              onDelete={() => {
                if (confirm(`حذف طلب «${reg.fullName}» نهائياً؟`)) {
                  void run(reg.id, () => deleteRegistration(reg.id));
                }
              }}
            />
          ))}
        </ul>
      )}
    </Panel>
  );
}

function RegistrationRow({
  reg,
  busy,
  onToggle,
  onDelete,
}: {
  reg: Registration;
  busy: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const intl = toInternational(reg.phone);
  const isNew = reg.status === "new";

  return (
    <li
      className={
        isNew
          ? "rounded-xl border border-gold/45 bg-[#fdf8ec] p-3.5"
          : "rounded-xl border border-royal/12 bg-white p-3.5"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-arabic text-[13.5px] font-bold text-royal-ink">
            {reg.fullName}
            {isNew ? (
              <span className="rounded-full bg-gold px-2 py-[2px] font-arabic text-[9.5px] font-bold text-royal-deep">
                جديد
              </span>
            ) : (
              <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-[2px] font-arabic text-[9.5px] font-semibold text-emerald-800">
                تمت المعالجة
              </span>
            )}
          </p>
          <p className="mt-1 font-arabic text-[11px] text-royal-ink/50">
            {formatStamp(reg.createdAt)}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-royal/[0.07] px-2.5 py-1 font-arabic text-[10.5px] font-semibold text-royal">
          {levelLabel(reg.level)}
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 border-t border-royal/[0.08] pt-3 sm:grid-cols-2">
        <Row label="الهاتف" value={reg.phone} ltr />
        {reg.birthInfo ? <Row label="الميلاد / السن" value={reg.birthInfo} /> : null}
        {reg.guardianName ? <Row label="ولي الأمر" value={reg.guardianName} /> : null}
        {reg.email ? <Row label="البريد" value={reg.email} ltr /> : null}
      </dl>

      {reg.notes ? (
        <p className="mt-2.5 rounded-lg bg-[#f9fafc] px-3 py-2 font-arabic text-[11.5px] leading-[1.9] text-royal-ink/70">
          {reg.notes}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2 border-t border-royal/[0.08] pt-3">
        <a
          href={`tel:${reg.phone}`}
          className="inline-flex h-[36px] items-center justify-center gap-1.5 rounded-full border border-royal/15 bg-white px-3.5 font-arabic text-[11.5px] font-semibold text-royal transition hover:border-gold/60 hover:bg-[#fffdf8]"
        >
          اتصال
        </a>
        {intl ? (
          <a
            href={`https://wa.me/${intl}`}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-[36px] items-center justify-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 font-arabic text-[11.5px] font-semibold text-emerald-800 transition hover:bg-emerald-100"
          >
            واتساب
          </a>
        ) : null}
        <button
          type="button"
          onClick={onToggle}
          disabled={busy}
          className="inline-flex h-[36px] items-center justify-center rounded-full bg-royal px-3.5 font-arabic text-[11.5px] font-semibold text-white transition hover:bg-royal-deep disabled:opacity-50"
        >
          {busy ? "…" : isNew ? "تمت المعالجة" : "إرجاع كجديد"}
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="inline-flex h-[36px] items-center justify-center rounded-full border border-red-200 bg-white px-3.5 font-arabic text-[11.5px] font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
        >
          حذف
        </button>
      </div>
    </li>
  );
}

function Row({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="font-arabic text-[11.5px] text-royal-ink/55">{label}</dt>
      <dd
        dir={ltr ? "ltr" : undefined}
        className={
          ltr
            ? "truncate font-sans text-[12px] font-semibold text-royal-ink/85"
            : "truncate font-arabic text-[12px] font-semibold text-royal-ink/85"
        }
      >
        {value}
      </dd>
    </div>
  );
}

/** معلومات خدمة الصور (R2 + Netlify Functions) — الإعداد يتم في Netlify */
function GithubSettingsPanel() {
  return (
    <Panel
      title="خدمة الصور (Cloudflare R2)"
      subtitle="الرفع يتم مباشرة من المتصفح إلى R2 عبر روابط موقّعة — لا يوجد إعداد هنا"
    >
      <ul className="m-0 list-none space-y-2 p-0 font-arabic text-[12px] leading-[2] text-royal-ink/75">
        <li>• التخزين: حاوية <span dir="ltr" className="font-sans font-semibold">R2</span> على Cloudflare</li>
        <li>• التوقيع: دالة <span dir="ltr" className="font-sans">/.netlify/functions/sign</span> على Netlify</li>
        <li>• الحذف: <span dir="ltr" className="font-sans">/.netlify/functions/delete</span></li>
        <li>• العرض: عبر الرابط العام للحاوية (public URL)</li>
      </ul>

      <p className="mt-4 rounded-xl border border-royal/15 bg-[#f7f9fc] px-3.5 py-3 font-arabic text-[11.5px] leading-[1.95] text-royal-ink/70">
        🔒 أسرار R2 (R2_ACCOUNT_ID، R2_KEY، R2_SECRET) و Firebase و ADMIN_EMAILS
        تُضبط فقط في <strong>Netlify ← Site settings ← Environment variables</strong>،
        ولا توجد أبداً في كود الموقع. Raja3 chi haja hna.
      </p>
    </Panel>
  );
}

/* ════════════ الإعدادات العامة ════════════ */

export function SettingsSection({ draft, patch }: SectionProps) {
  const s = draft.siteSettings;
  const set = (v: Partial<typeof s>) =>
    patch((d) => ({ ...d, siteSettings: { ...d.siteSettings, ...v } }));

  return (
    <div className="space-y-5">
      <GithubSettingsPanel />

      <Panel
        title="هوية النادي"
        subtitle="تظهر في القائمة الجانبية وتذييل الصفحات (الشعار والألوان جزء من التصميم ولا تُعدَّل هنا)"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="اسم النادي (عربي)"><TextInput value={s.nameAr} onChange={(v) => set({ nameAr: v })} /></Field>
          <Field label="اسم النادي (فرنسي)"><TextInput dir="ltr" value={s.nameFr} onChange={(v) => set({ nameFr: v })} /></Field>
          <Field label="تيفيناغ"><TextInput dir="ltr" value={s.tifinagh} onChange={(v) => set({ tifinagh: v })} /></Field>
          <Field label="الوصف اللاتيني"><TextInput dir="ltr" value={s.tagline} onChange={(v) => set({ tagline: v })} /></Field>
          <Field label="الموقع (عربي)"><TextInput value={s.locationAr} onChange={(v) => set({ locationAr: v })} /></Field>
          <Field label="الموقع (لاتيني)"><TextInput dir="ltr" value={s.locationFr} onChange={(v) => set({ locationFr: v })} /></Field>
        </div>
      </Panel>
    </div>
  );
}
