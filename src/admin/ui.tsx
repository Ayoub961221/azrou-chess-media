import { useRef, useState, type ReactNode } from "react";
import {
  countReferences,
  deleteImageIfUnused,
  deleteMediaFile,
  uploadImage,
  validateImage,
} from "@/lib/media";
import type { MediaRef } from "@/lib/content-model";
import { cn } from "@/utils/cn";

/* ---------------- حقول النص ---------------- */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-arabic text-[12.5px] font-semibold text-royal-ink/85">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="mt-1 block font-arabic text-[10.5px] leading-relaxed text-royal-ink/45">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-royal/15 bg-white px-3.5 py-2.5 font-arabic text-[13px] text-royal-ink outline-none transition focus:border-gold/70 focus:ring-2 focus:ring-gold/20";

export function TextInput({
  value,
  onChange,
  placeholder,
  dir,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  dir?: "rtl" | "ltr";
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      dir={dir}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputClass, dir === "ltr" && "text-left font-sans")}
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputClass, "resize-y leading-[1.9]")}
    />
  );
}

export function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={inputClass}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5"
    >
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300",
          checked ? "bg-royal" : "bg-royal-ink/20"
        )}
      >
        <span
          className={cn(
            "absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all duration-300",
            checked ? "right-[3px]" : "right-[23px]"
          )}
        />
      </span>
      <span className="font-arabic text-[12.5px] font-medium text-royal-ink/80">
        {label}
      </span>
    </button>
  );
}

/* ---------------- أزرار ---------------- */

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const styles = {
    primary:
      "bg-royal text-white hover:bg-royal-deep shadow-[0_12px_26px_-18px_rgba(7,31,66,0.95)]",
    ghost: "border border-royal/15 bg-white text-royal hover:border-gold/60 hover:bg-[#fffdf8]",
    danger: "border border-red-300 bg-white text-red-600 hover:bg-red-50",
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-[42px] items-center justify-center gap-2 rounded-full px-4 font-arabic text-[12.5px] font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50",
        styles
      )}
    >
      {children}
    </button>
  );
}

/* ---------------- رسائل الحالة ---------------- */

export type Status = { kind: "idle" | "saving" | "ok" | "error"; message?: string };

export function StatusBar({ status }: { status: Status }) {
  if (status.kind === "idle") return null;

  const tone =
    status.kind === "ok"
      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
      : status.kind === "error"
        ? "border-red-300 bg-red-50 text-red-700"
        : "border-royal/20 bg-[#f4f7fb] text-royal";

  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-xl border px-3.5 py-2.5 font-arabic text-[12px] leading-[1.8]",
        tone
      )}
    >
      {status.kind === "saving"
        ? status.message || "جاري الحفظ…"
        : status.message}
    </p>
  );
}

/* ---------------- بطاقة قسم ---------------- */

export function Panel({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="rounded-[18px] border border-royal/10 bg-white p-4 shadow-[0_14px_38px_-32px_rgba(7,31,66,0.5)] sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-royal/[0.08] pb-3">
        <div className="min-w-0">
          <h2 className="font-arabic text-[14.5px] font-bold text-royal-ink sm:text-[15.5px]">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 font-arabic text-[11px] text-royal-ink/50">{subtitle}</p>
          ) : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

/* ---------------- حقل الصورة (رفع حقيقي) ---------------- */

export function ImageField({
  label,
  media,
  folder,
  onChange,
  contentTree,
  onPurge,
  maxWidth = 1600,
  hint,
}: {
  label: string;
  media: MediaRef | null;
  folder: string;
  onChange: (media: MediaRef | null) => void;
  /** شجرة المحتوى كاملة — لمعرفة عدد مواضع استعمال الصورة */
  contentTree: unknown;
  /** يحذف الصورة من كل مواضعها في المحتوى (يوفّرها AdminApp) */
  onPurge?: (media: MediaRef) => number;
  maxWidth?: number;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "compressing" | "uploading" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);

  const busy = phase !== "idle";

  async function copyUrl() {
    if (!media?.url) return;
    try {
      await navigator.clipboard.writeText(media.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("تعذّر النسخ. انسخ الرابط يدوياً.");
    }
  }

  async function handleFile(file: File) {
    setError(null);
    setNote(null);

    const invalid = validateImage(file);
    if (invalid) {
      setError(invalid);
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setPhase("compressing");
    setProgress(null);

    const previous = media;

    try {
      // ١) ارفع الصورة الجديدة إلى GitHub أولاً
      const uploaded = await uploadImage(file, folder, {
        maxWidth,
        onProgress: (p) => {
          setPhase(p >= 100 ? "saving" : "uploading");
          setProgress(p);
        },
      });

      // ٢) بعد نجاح الرفع فقط، بدّل المرجع (الصورة القديمة تبقى سليمة لو فشل)
      onChange(uploaded);

      // ٣) ثم نظّف القديمة إن لم تَعُد مستعملة
      if (previous?.url && previous.url !== uploaded.url) {
        const result = await deleteImageIfUnused(previous, contentTree).catch(
          () => null
        );
        if (result && !result.removed && result.reason) setNote(result.reason);
      }

      setNote((n) => n ?? "✓ تم رفع الصورة بنجاح. اضغط «حفظ التغييرات» لنشرها.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر رفع الصورة.");
    } finally {
      setPhase("idle");
      setProgress(null);
      URL.revokeObjectURL(localPreview);
      setPreview(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setError(null);
    setNote(null);

    const previous = media;
    if (!previous) return;

    // كم موضعاً تستعمل هذه الصورة؟ (قبل أي تعديل)
    const uses = countReferences(contentTree, previous.url);
    if (uses > 1) {
      const ok = confirm(
        `هذه الصورة مستعملة في ${uses} مواضع بالموقع.\n\n` +
          `سيُحذف الملف نهائياً وتُزال الصورة من كل تلك المواضع.\n\nهل تريد المتابعة؟`
      );
      if (!ok) return;
    }

    // ١) أزلها من هذا الحقل
    onChange(null);
    // ٢) وأزلها من أي موضع آخر في المحتوى
    const purged = onPurge?.(previous) ?? 0;

    // ٣) ثم احذف الملف نفسه
    const result = await deleteMediaFile(previous).catch(() => null);

    const extra = purged > 1 ? ` (أُزيلت من ${purged} مواضع)` : "";
    setNote(
      (result?.reason ?? "أُزيلت الصورة.") + extra + " اضغط «حفظ التغييرات» لتثبيت ذلك."
    );
  }

  const phaseLabel =
    phase === "compressing"
      ? "جاري ضغط الصورة…"
      : phase === "saving"
        ? "جاري حفظ الرابط…"
        : "جاري الرفع إلى GitHub…";

  const shown = preview ?? media?.url ?? null;

  return (
    <div>
      <span className="mb-1.5 block font-arabic text-[12.5px] font-semibold text-royal-ink/85">
        {label}
      </span>

      <div className="flex flex-wrap items-start gap-3">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!busy) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (busy) return;
            const f = e.dataTransfer.files?.[0];
            if (f) void handleFile(f);
          }}
          onClick={() => !busy && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="اسحب صورة هنا أو اضغط للاختيار"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!busy) inputRef.current?.click();
            }
          }}
          className={cn(
            "relative h-[110px] w-[150px] shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-dashed bg-[#f2f5fa] transition-colors",
            dragOver
              ? "border-gold bg-[#fdf8ec]"
              : "border-royal/15 hover:border-gold/60"
          )}
        >
          {shown ? (
            <img
              src={shown}
              alt="معاينة الصورة"
              width={150}
              height={110}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="grid h-full w-full place-items-center px-2 text-center font-arabic text-[10.5px] leading-relaxed text-royal-ink/45">
              {dragOver ? "أفلت الصورة هنا" : "اسحب صورة هنا أو اضغط للاختيار"}
            </span>
          )}

          {busy ? (
            <div className="absolute inset-0 grid place-items-center bg-royal-deep/75 backdrop-blur-[1px]">
              <div className="w-[82%]">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/25">
                  <div
                    className={
                      progress === null
                        ? "h-full w-1/3 animate-pulse rounded-full bg-gold"
                        : "h-full rounded-full bg-gold transition-[width] duration-200"
                    }
                    style={progress === null ? undefined : { width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1.5 text-center font-arabic text-[10px] font-semibold leading-tight text-white">
                  {progress === null ? phaseLabel : `${phaseLabel} ${progress}%`}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {busy ? "جاري الرفع…" : media ? "تغيير الصورة" : "إضافة صورة"}
            </Button>
            {media ? (
              <Button variant="danger" onClick={handleRemove} disabled={busy}>
                حذف
              </Button>
            ) : null}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />

          <p className="font-arabic text-[10.5px] leading-relaxed text-royal-ink/45">
            {hint ?? "اسحب وأفلت أو اضغط للاختيار — JPEG أو PNG أو WebP أو GIF، تُضغط تلقائياً قبل الرفع."}
          </p>

          {media?.width ? (
            <p dir="ltr" className="font-sans text-[10px] text-royal-ink/40">
              {media.width}×{media.height} · {Math.round((media.size ?? 0) / 1024)} KB
            </p>
          ) : null}

          {media?.url ? (
            <div className="flex gap-1.5">
              <input
                readOnly
                dir="ltr"
                value={media.url}
                onFocus={(e) => e.currentTarget.select()}
                aria-label="رابط الصورة المباشر"
                className="min-w-0 flex-1 rounded-lg border border-royal/15 bg-[#fbfcfe] px-2 py-1.5 text-left font-sans text-[10px] text-royal-ink/70 outline-none focus:border-gold/70"
              />
              <button
                type="button"
                onClick={copyUrl}
                className={cn(
                  "shrink-0 rounded-lg px-2.5 font-arabic text-[10.5px] font-semibold transition",
                  copied
                    ? "bg-emerald-600 text-white"
                    : "border border-royal/15 bg-white text-royal hover:border-gold/60 hover:bg-[#fffdf8]"
                )}
              >
                {copied ? "✓ نُسخ" : "نسخ"}
              </button>
            </div>
          ) : null}

          {note ? (
            <p className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 font-arabic text-[11px] leading-relaxed text-emerald-800">
              {note}
            </p>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-red-300 bg-red-50 px-2.5 py-1.5 font-arabic text-[11px] leading-relaxed text-red-700"
            >
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}


/* ---------------- ألبوم صور (رفع متعدد) ---------------- */

export type AlbumPhoto = { id: string; media: MediaRef; captionAr: string };

export function MultiImageField({
  label,
  photos,
  folder,
  onChange,
  contentTree,
  onPurge,
  max = 5,
  maxWidth = 1600,
  hint,
}: {
  label: string;
  photos: AlbumPhoto[];
  folder: string;
  onChange: (photos: AlbumPhoto[]) => void;
  contentTree: unknown;
  onPurge?: (media: MediaRef) => number;
  max?: number;
  maxWidth?: number;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<{ done: number; total: number } | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const list = photos ?? [];
  const remaining = Math.max(0, max - list.length);
  const busy = queue !== null;

  async function handleFiles(files: FileList) {
    setError(null);
    setNote(null);

    const picked = Array.from(files).slice(0, remaining);
    if (picked.length === 0) {
      setError(`بلغتَ الحد الأقصى (${max} صور). احذف صورة قبل إضافة أخرى.`);
      return;
    }
    if (files.length > remaining) {
      setNote(`أُخذت أول ${picked.length} صور فقط — الحد الأقصى ${max}.`);
    }

    const added: AlbumPhoto[] = [];
    const failed: string[] = [];

    for (let i = 0; i < picked.length; i += 1) {
      const file = picked[i];
      setQueue({ done: i, total: picked.length });
      setProgress(0);

      const invalid = validateImage(file);
      if (invalid) {
        failed.push(`${file.name}: ${invalid}`);
        continue;
      }

      try {
        const media = await uploadImage(file, folder, { maxWidth, onProgress: setProgress });
        added.push({
          id: `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
          media,
          captionAr: "",
        });
      } catch (err) {
        failed.push(`${file.name}: ${err instanceof Error ? err.message : "فشل الرفع"}`);
      }
    }

    // نضيف ما نجح فقط — الصور السابقة تبقى سليمة مهما حدث.
    if (added.length > 0) onChange([...list, ...added]);

    setQueue(null);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";

    if (failed.length > 0) setError(failed.join(" · "));
    if (added.length > 0) {
      setNote(`✓ رُفعت ${added.length} صورة. اضغط «حفظ التغييرات» لنشرها.`);
    }
  }

  async function removeAt(index: number) {
    const photo = list[index];
    if (!photo) return;
    setNote(null);
    setError(null);

    const uses = countReferences(contentTree, photo.media.url);
    if (uses > 1) {
      const ok = confirm(
        `هذه الصورة مستعملة في ${uses} مواضع بالموقع.\n\n` +
          `سيُحذف الملف نهائياً وتُزال من كل تلك المواضع.\n\nهل تريد المتابعة؟`
      );
      if (!ok) return;
    }

    onChange(list.filter((_, i) => i !== index));
    onPurge?.(photo.media);

    const result = await deleteMediaFile(photo.media).catch(() => null);
    setNote(
      (result?.reason ?? "أُزيلت الصورة.") + " اضغط «حفظ التغييرات» لتثبيت ذلك."
    );
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= list.length) return;
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <span className="font-arabic text-[12.5px] font-semibold text-royal-ink/85">
          {label}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-[2px] font-arabic text-[10px] font-semibold",
            list.length >= max
              ? "bg-gold/20 text-[#8a6d26]"
              : "bg-royal/[0.07] text-royal/70"
          )}
        >
          {list.length} / {max}
        </span>
      </div>

      {list.length > 0 ? (
        <ul className="m-0 mb-3 grid list-none grid-cols-2 gap-2.5 p-0 sm:grid-cols-3 lg:grid-cols-5">
          {list.map((photo, index) => (
            <li
              key={photo.id}
              className="overflow-hidden rounded-xl border border-royal/15 bg-white"
            >
              <div className="relative aspect-[4/3] bg-[#f2f5fa]">
                <img
                  src={photo.media.thumbUrl ?? photo.media.url}
                  alt={photo.captionAr || `صورة ${index + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-royal/85 font-sans text-[10px] font-bold text-white">
                  {index + 1}
                </span>
              </div>

              <input
                value={photo.captionAr}
                placeholder="تعليق (اختياري)"
                onChange={(e) =>
                  onChange(
                    list.map((x, i) =>
                      i === index ? { ...x, captionAr: e.target.value } : x
                    )
                  )
                }
                className="w-full border-t border-royal/10 px-2 py-1.5 font-arabic text-[11px] outline-none focus:bg-[#fffdf8]"
              />

              <div className="flex items-center justify-between gap-1 border-t border-royal/10 px-1.5 py-1.5">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, index - 1)}
                    disabled={index === 0 || busy}
                    aria-label="تحريك لليمين"
                    className="rounded-md border border-royal/12 px-1.5 text-[10px] text-royal/70 disabled:opacity-30"
                  >
                    →
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, index + 1)}
                    disabled={index === list.length - 1 || busy}
                    aria-label="تحريك لليسار"
                    className="rounded-md border border-royal/12 px-1.5 text-[10px] text-royal/70 disabled:opacity-30"
                  >
                    ←
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => void removeAt(index)}
                  disabled={busy}
                  className="rounded-md border border-red-200 px-2 font-arabic text-[10.5px] text-red-600 hover:bg-red-50 disabled:opacity-40"
                >
                  حذف
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {busy ? (
        <div className="mb-2 rounded-xl border border-royal/15 bg-[#f7f9fc] p-3">
          <p className="mb-1.5 font-arabic text-[11.5px] font-semibold text-royal">
            جاري رفع الصورة {queue.done + 1} من {queue.total}…
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-royal/10">
            <div
              className={
                progress === null
                  ? "h-full w-1/3 animate-pulse rounded-full bg-gold"
                  : "h-full rounded-full bg-gold transition-[width] duration-200"
              }
              style={progress === null ? undefined : { width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy && remaining > 0) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (busy || remaining === 0) return;
          if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "mb-2 rounded-xl border-2 border-dashed px-3 py-2.5 text-center transition-colors",
          dragOver ? "border-gold bg-[#fdf8ec]" : "border-royal/15 bg-[#fbfcfe]"
        )}
      >
        <span className="font-arabic text-[11px] text-royal-ink/50">
          {dragOver
            ? "أفلت الصور هنا"
            : remaining === 0
              ? `بلغتَ الحد الأقصى (${max} صور)`
              : "اسحب عدة صور هنا دفعة واحدة"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          onClick={() => inputRef.current?.click()}
          disabled={busy || remaining === 0}
        >
          {busy
            ? "جاري الرفع…"
            : remaining === 0
              ? `بلغتَ الحد (${max})`
              : `+ إضافة صور (${remaining} متبقية)`}
        </Button>
        {list.length > 0 && !busy ? (
          <Button
            variant="danger"
            onClick={() => {
              if (confirm(`حذف كل الصور (${list.length}) نهائياً؟`)) {
                const all = [...list];
                onChange([]);
                all.forEach((photo) => {
                  onPurge?.(photo.media);
                  void deleteMediaFile(photo.media).catch(() => null);
                });
                setNote("حُذفت كل الصور. اضغط «حفظ التغييرات».");
              }
            }}
          >
            حذف الكل
          </Button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void handleFiles(e.target.files);
        }}
      />

      <p className="mt-1.5 font-arabic text-[10.5px] leading-relaxed text-royal-ink/45">
        {hint ??
          `يمكن اختيار عدة صور دفعة واحدة. الأولى تظهر كبيرة داخل الخبر. JPEG أو PNG أو WebP أو GIF.`}
      </p>

      {note ? (
        <p className="mt-2 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 font-arabic text-[11px] leading-relaxed text-emerald-800">
          {note}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="mt-2 rounded-lg border border-red-300 bg-red-50 px-2.5 py-1.5 font-arabic text-[11px] leading-relaxed text-red-700"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* ---------------- محرّر قائمة نصوص ---------------- */

export function StringListEditor({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <span className="mb-1.5 block font-arabic text-[12.5px] font-semibold text-royal-ink/85">
        {label}
      </span>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={value}
              placeholder={placeholder}
              onChange={(e) => {
                const next = [...values];
                next[index] = e.target.value;
                onChange(next);
              }}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              aria-label="حذف السطر"
              className="shrink-0 rounded-xl border border-red-200 px-3 font-arabic text-[12px] text-red-600 transition hover:bg-red-50"
            >
              حذف
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="mt-2 rounded-full border border-royal/15 px-3.5 py-1.5 font-arabic text-[11.5px] font-semibold text-royal transition hover:border-gold/60 hover:bg-[#fffdf8]"
      >
        + إضافة سطر
      </button>
    </div>
  );
}
