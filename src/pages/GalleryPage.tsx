import { useEffect, useState } from "react";
import PageShell from "@/components/common/PageShell";
import { Card, PageBody, SectionHeading } from "@/components/common/Section";
import { CloseIcon, RookIcon } from "@/components/icons";
import { defaultContent, type GalleryItem, type GalleryContent } from "@/lib/content-model";
import { toArabicDigits } from "@/lib/format";

export default function GalleryPage({ gallery }: { gallery?: GalleryContent } = {}) {
  const g = gallery ?? defaultContent.gallery;
  const items = g.items
    .filter((item) => item.published && item.image?.url)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const [active, setActive] = useState<GalleryItem | null>(null);

  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [active]);

  return (
    <PageShell
      eyebrow={g.header.eyebrow}
      titleAr={g.header.titleAr}
      titleFr={g.header.titleFr}
      intro={g.header.intro}
      crumbs={[{ label: "المعرض" }]}
    >
      <PageBody>
        <SectionHeading
          titleAr={g.sectionTitleAr}
          titleFr={g.sectionTitleFr}
          note={items.length > 0 ? `${toArabicDigits(items.length)} صورة` : undefined}
        />

        {items.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-[22px] border border-dashed border-royal/20 bg-white/70 px-5 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full border border-gold/30 bg-[#fdf8ec] text-royal/70">
              <RookIcon className="h-7 w-7" />
            </span>
            <p className="mt-4 font-arabic text-[14px] font-semibold text-royal-ink/80">
              المعرض فارغ حالياً
            </p>
            <p className="mt-2 max-w-[28rem] font-arabic text-[12px] leading-[1.95] text-royal-ink/55">
              {g.emptyMessage}
            </p>
            <span
              lang="fr"
              dir="ltr"
              className="mt-3 font-sans text-[8.5px] font-semibold uppercase tracking-[0.2em] text-royal-ink/30"
            >
              Galerie vide
            </span>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {items.map((item, index) => (
              <Card key={item.id} hover className="group p-0">
                <button
                  type="button"
                  onClick={() => setActive(item)}
                  className="block w-full text-right"
                  aria-label={`تكبير الصورة: ${item.titleAr || `صورة ${index + 1}`}`}
                >
                  <span className="relative block overflow-hidden bg-[#e8edf4]">
                    <img
                      src={item.image!.url}
                      alt={item.titleAr || "صورة من أنشطة النادي"}
                      width={item.image!.width ?? 1200}
                      height={item.image!.height ?? 900}
                      loading={index < 4 ? "eager" : "lazy"}
                      decoding="async"
                      draggable={false}
                      className="aspect-[4/3] w-full select-none object-cover object-center transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-royal-deep/60 via-transparent to-transparent"
                    />
                  </span>

                  {item.titleAr || item.titleFr ? (
                    <span className="flex items-center justify-between gap-2 px-3.5 py-3">
                      <span className="min-w-0">
                        <span className="block font-arabic text-[12.5px] font-semibold text-royal-ink">
                          {item.titleAr}
                        </span>
                        {item.titleFr ? (
                          <span
                            lang="fr"
                            dir="ltr"
                            className="block font-sans text-[8.5px] uppercase tracking-[0.16em] text-royal-ink/35"
                          >
                            {item.titleFr}
                          </span>
                        ) : null}
                      </span>
                      <span
                        aria-hidden="true"
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-royal/12 text-royal/60 transition-colors duration-300 group-hover:border-gold/60 group-hover:text-gold"
                      >
                        +
                      </span>
                    </span>
                  ) : null}
                </button>
              </Card>
            ))}
          </div>
        )}
      </PageBody>

      {active?.image ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.titleAr || "صورة"}
          className="fixed inset-0 z-[95] flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <div aria-hidden="true" className="animate-overlay-in absolute inset-0 bg-[#04101f]/80 backdrop-blur-[3px]" />

          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-[20px] bg-royal-deep shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={active.image.url}
              alt={active.titleAr || "صورة من أنشطة النادي"}
              className="max-h-[70vh] w-full object-contain"
              draggable={false}
            />

            {active.titleAr || active.titleFr ? (
              <div className="border-t border-white/10 px-4 py-3">
                <p className="font-arabic text-[13px] font-semibold text-white">{active.titleAr}</p>
                {active.titleFr ? (
                  <p lang="fr" dir="ltr" className="font-display text-[11.5px] text-white/55">
                    {active.titleFr}
                  </p>
                ) : null}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="إغلاق الصورة"
              className="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/40 text-white/85 transition hover:border-gold/70 hover:text-gold-light"
            >
              <CloseIcon className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
