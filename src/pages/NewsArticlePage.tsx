import CurvedBanner from "@/components/news/CurvedBanner";
import NewsGallery from "@/components/news/NewsGallery";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PawnIcon,
} from "@/components/icons";
import { NEWS_ROUTE } from "@/hooks/useHashRoute";
import type { NewsItem } from "@/lib/content-model";
import { formatArabicDate, formatFrenchDate, toParagraphs } from "@/lib/format";

export default function NewsArticlePage({ article }: { article: NewsItem }) {
  const paragraphs = toParagraphs(article.bodyAr);

  return (
    <div className="flex flex-1 flex-col bg-[#fbf9f4]">
      <CurvedBanner dense>
        <div className="mx-auto max-w-3xl text-center">
          <nav
            aria-label="مسار التصفح"
            className="flex flex-wrap items-center justify-center gap-1.5 font-arabic text-[11px] text-white/55 sm:text-[12px]"
          >
            <a href="#accueil" className="transition-colors duration-300 hover:text-gold-light">
              الرئيسية
            </a>
            <ChevronLeftIcon aria-hidden="true" className="h-3.5 w-3.5 text-gold/70" />
            <a
              href={`#${NEWS_ROUTE}`}
              className="transition-colors duration-300 hover:text-gold-light"
            >
              الأخبار
            </a>
            <ChevronLeftIcon aria-hidden="true" className="h-3.5 w-3.5 text-gold/70" />
            <span className="font-medium text-white/85">تفاصيل الخبر</span>
          </nav>

          {article.categoryAr ? (
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 font-arabic text-[10.5px] font-bold text-royal-deep sm:text-[11.5px]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-royal-deep/70" />
              {article.categoryAr}
            </span>
          ) : null}

          <h1 className="mt-4 text-balance font-arabic text-[1.5rem] font-bold leading-[1.55] tracking-[-0.008em] text-white sm:text-[1.9rem] lg:text-[2.15rem]">
            {article.titleAr}
          </h1>

          {article.dateISO ? (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              <span className="inline-flex items-center gap-1.5 font-arabic text-[11.5px] font-medium text-white/75 sm:text-[12.5px]">
                <CalendarIcon className="h-[15px] w-[15px] text-gold-light" />
                {formatArabicDate(article.dateISO)}
              </span>
              <span
                lang="fr"
                dir="ltr"
                className="font-display text-[12px] text-white/45"
              >
                {formatFrenchDate(article.dateISO)}
              </span>
            </div>
          ) : null}
        </div>
      </CurvedBanner>

      <article className="mx-auto w-full max-w-[920px] px-4 pb-14 pt-8 sm:px-6 sm:pt-10 lg:pb-20">
        {article.image?.url ? (
          <figure className="relative m-0">
            <div className="relative overflow-hidden rounded-[20px] bg-royal-deep shadow-[0_26px_58px_-36px_rgba(7,31,66,0.65)] ring-1 ring-royal/10 sm:rounded-[22px]">
              <img
                src={article.image.url}
                alt={article.imageAlt || article.titleAr}
                width={article.image.width ?? 1280}
                height={article.image.height ?? 800}
                loading="eager"
                decoding="async"
                draggable={false}
                className="aspect-[16/10] w-full select-none object-cover object-center sm:aspect-[16/9]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-royal-deep/35 via-transparent to-transparent"
              />
            </div>
          </figure>
        ) : null}

        <div className={article.image?.url ? "mt-7" : ""}>
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className={
                index === 0
                  ? "mb-4 border-r-2 border-gold/60 pr-4 font-arabic text-[14px] font-medium leading-[2.15] text-royal-ink/85 sm:text-[15.5px]"
                  : "mb-4 font-arabic text-[13.5px] leading-[2.15] text-royal-ink/75 last:mb-0 sm:text-[15px]"
              }
            >
              {paragraph}
            </p>
          ))}
        </div>

        <NewsGallery photos={article.gallery ?? []} />

        <div className="mt-8 flex items-center gap-3 border-t border-royal/10 pt-5">
          <PawnIcon aria-hidden="true" className="h-5 w-5 shrink-0 text-gold" />
          <p className="font-arabic text-[11.5px] leading-relaxed text-royal-ink/55 sm:text-[12.5px]">
            النادي الرياضي لأزرو للشطرنج —{" "}
            <span lang="fr" dir="ltr" className="font-display">
              Club Azrou Sportif d’Échecs
            </span>
          </p>
        </div>

        <div className="mt-7">
          <a
            href={`#${NEWS_ROUTE}`}
            className="group inline-flex h-[46px] items-center justify-center gap-2.5 rounded-full border border-royal/15 bg-white px-5 text-[13px] font-semibold text-royal shadow-[0_10px_24px_-22px_rgba(7,31,66,0.8)] transition-all duration-300 hover:-translate-y-px hover:border-gold/70 hover:bg-[#fffdf8] sm:text-[13.5px]"
          >
            <ChevronRightIcon
              aria-hidden="true"
              className="h-4 w-4 text-gold transition-transform duration-300 group-hover:translate-x-[2px]"
            />
            <span>العودة إلى الأخبار</span>
          </a>
        </div>
      </article>
    </div>
  );
}
