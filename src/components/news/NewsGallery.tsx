import { useCallback, useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "@/components/icons";
import type { NewsPhoto } from "@/lib/content-model";
import { toArabicDigits } from "@/lib/format";
import { cn } from "@/utils/cn";

/**
 * ألبوم صور الخبر.
 * التخطيط يتكيّف مع عدد الصور (١ إلى ٥) ليبقى متوازناً دائماً،
 * مع عارض مكبّر يدعم لوحة المفاتيح واللمس.
 */
export default function NewsGallery({ photos }: { photos: NewsPhoto[] }) {
  const items = (photos ?? []).filter((p) => p?.media?.url);
  const [openAt, setOpenAt] = useState<number | null>(null);

  const close = useCallback(() => setOpenAt(null), []);
  const go = useCallback(
    (delta: number) =>
      setOpenAt((i) => (i === null ? i : (i + delta + items.length) % items.length)),
    [items.length]
  );

  useEffect(() => {
    if (openAt === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      // في RTL: السهم الأيمن يعني السابق
      else if (event.key === "ArrowRight") go(-1);
      else if (event.key === "ArrowLeft") go(1);
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [openAt, close, go]);

  if (items.length === 0) return null;

  /**
   * تخطيط يملأ المستطيل تماماً بلا فراغ، حسب عدد الصور:
   *  ١ → صورة واحدة عريضة
   *  ٢ → عمودان
   *  ٣ → ثلاثة أعمدة
   *  ٤ → مربع ٢×٢
   *  ٥ → صورة كبيرة (٢×٢) + أربع صغيرة تملأ الباقي بالضبط
   */
  const n = items.length;
  const gridClass =
    n === 1
      ? "grid-cols-1"
      : n === 2
        ? "grid-cols-2"
        : n === 3
          ? "grid-cols-2 sm:grid-cols-3"
          : n === 4
            ? "grid-cols-2"
            : "grid-cols-2 sm:grid-cols-4";

  /** الصورة الأولى تكبر فقط عند وجود ٥ صور (حيث تملأ الشبكة تماماً) */
  const heroFirst = n === 5;

  return (
    <section aria-label="ألبوم صور الخبر" className="mt-8">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-royal/10 pb-3">
        <h2 className="inline-flex items-center gap-2 font-arabic text-[14px] font-bold text-royal-ink sm:text-[15px]">
          <span aria-hidden="true" className="h-[7px] w-[7px] rotate-45 border border-gold bg-gold/20" />
          صور من الحدث
          <span className="rounded-full bg-royal/[0.07] px-2 py-[2px] font-arabic text-[10.5px] font-semibold text-royal/70">
            {toArabicDigits(items.length)}
          </span>
        </h2>
        <p
          lang="fr"
          dir="ltr"
          className="font-sans text-[9px] font-semibold uppercase tracking-[0.2em] text-royal-ink/35"
        >
          Galerie
        </p>
      </div>

      <div
        className={cn(
          "grid gap-2.5 sm:gap-3",
          gridClass,
          heroFirst && "sm:h-[430px] sm:grid-rows-2 lg:h-[480px]",
          n === 4 && "sm:h-[420px] sm:grid-rows-2"
        )}
      >
        {items.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setOpenAt(index)}
            aria-label={`تكبير الصورة ${toArabicDigits(index + 1)}${photo.captionAr ? `: ${photo.captionAr}` : ""}`}
            className={cn(
              "group relative block overflow-hidden rounded-[16px] border border-royal/10 bg-[#e8edf4] shadow-[0_14px_34px_-30px_rgba(7,31,66,0.5)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_22px_44px_-28px_rgba(7,31,66,0.55)]",
              // نسبة ثابتة على الهاتف، وملء كامل للخلية على الشاشات الكبيرة
              heroFirst && index === 0
                ? "col-span-2 row-span-2 aspect-[4/3] sm:aspect-auto sm:h-full"
                : heroFirst
                  ? "aspect-square sm:aspect-auto sm:h-full"
                  : n === 4
                    ? "aspect-[4/3] sm:aspect-auto sm:h-full"
                    : n === 1
                      ? "aspect-[16/9]"
                      : n === 2
                        ? "aspect-[4/3]"
                        : "aspect-square"
            )}
          >
            <img
              src={photo.media.mediumUrl ?? photo.media.url}
              alt={photo.captionAr || `صورة ${index + 1} من الخبر`}
              width={photo.media.width ?? 900}
              height={photo.media.height ?? 600}
              loading="eager"
              decoding="async"
              draggable={false}
              className="absolute inset-0 h-full w-full select-none object-cover object-center transition-transform duration-[900ms] ease-out group-hover:scale-[1.07]"
            />

            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-royal-deep/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />

            {/* أيقونة التكبير */}
            <span
              aria-hidden="true"
              className="absolute left-2.5 top-2.5 grid h-7 w-7 scale-90 place-items-center rounded-full border border-white/30 bg-black/35 text-[15px] leading-none text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
            >
              +
            </span>

            {photo.captionAr ? (
              <span className="absolute inset-x-0 bottom-0 translate-y-full p-2.5 text-right font-arabic text-[11px] font-medium leading-snug text-white transition-transform duration-300 group-hover:translate-y-0">
                {photo.captionAr}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* ---------- العارض المكبّر ---------- */}
      {openAt !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={items[openAt].captionAr || "عرض الصورة"}
          className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-6"
          onClick={close}
        >
          <div
            aria-hidden="true"
            className="animate-overlay-in absolute inset-0 bg-[#04101f]/88 backdrop-blur-[4px]"
          />

          <div
            className="relative flex w-full max-w-4xl flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-[18px] bg-royal-deep shadow-[0_40px_80px_-30px_rgba(0,0,0,0.85)]">
              <img
                src={items[openAt].media.url}
                alt={items[openAt].captionAr || `صورة ${openAt + 1}`}
                className="max-h-[72vh] w-full object-contain"
                draggable={false}
              />

              {/* سابق / تالي */}
              {items.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="الصورة السابقة"
                    className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-sm transition hover:border-gold/70 hover:bg-black/70 hover:text-gold-light sm:right-3"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="الصورة التالية"
                    className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-sm transition hover:border-gold/70 hover:bg-black/70 hover:text-gold-light sm:left-3"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                </>
              ) : null}

              <button
                type="button"
                onClick={close}
                aria-label="إغلاق الصورة"
                className="absolute left-2.5 top-2.5 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/45 text-white/85 backdrop-blur-sm transition hover:border-gold/70 hover:text-gold-light"
              >
                <CloseIcon className="h-[18px] w-[18px]" />
              </button>

              <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 font-arabic text-[11px] font-semibold text-white backdrop-blur-sm">
                {toArabicDigits(openAt + 1)} / {toArabicDigits(items.length)}
              </span>
            </div>

            {items[openAt].captionAr ? (
              <p className="mt-3 text-center font-arabic text-[12.5px] leading-relaxed text-white/85 sm:text-[13.5px]">
                {items[openAt].captionAr}
              </p>
            ) : null}

            {/* مصغّرات */}
            {items.length > 1 ? (
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {items.map((photo, index) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setOpenAt(index)}
                    aria-label={`عرض الصورة ${toArabicDigits(index + 1)}`}
                    aria-current={index === openAt ? "true" : undefined}
                    className={cn(
                      "h-11 w-14 overflow-hidden rounded-lg border-2 transition-all duration-300",
                      index === openAt
                        ? "border-gold opacity-100"
                        : "border-transparent opacity-50 hover:opacity-80"
                    )}
                  >
                    <img
                      src={photo.media.thumbUrl ?? photo.media.url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
