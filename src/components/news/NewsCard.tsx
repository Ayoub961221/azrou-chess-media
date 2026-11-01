import { CalendarIcon, ChevronLeftIcon } from "@/components/icons";
import { NEWS_ROUTE } from "@/hooks/useHashRoute";
import type { NewsItem } from "@/lib/content-model";
import { formatArabicDate, formatFrenchDate, toArabicDigits } from "@/lib/format";

export default function NewsCard({ article }: { article: NewsItem }) {
  const href = `#${NEWS_ROUTE}/${article.id}`;
  const photoCount = (article.gallery ?? []).filter((p) => p?.media?.url).length;

  return (
    <article className="group relative overflow-hidden rounded-[22px] border border-royal/10 bg-white shadow-[0_20px_48px_-34px_rgba(7,31,66,0.55)] transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/45 hover:shadow-[0_34px_64px_-32px_rgba(7,31,66,0.6)] sm:rounded-[24px]">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-20 h-[3px] bg-gradient-to-l from-gold-light via-gold to-transparent opacity-80"
      />

      <div className="grid h-full grid-cols-1 sm:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        {/* Media */}
        <div className="relative overflow-hidden bg-[#e8edf4]">
          {article.image?.url ? (
            <img
              src={article.image.url}
              alt={article.imageAlt || article.titleAr}
              width={article.image.width ?? 1280}
              height={article.image.height ?? 800}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="aspect-[16/10] h-full w-full select-none object-cover object-center transition-transform duration-[900ms] ease-out group-hover:scale-[1.06] sm:aspect-auto sm:min-h-[270px]"
            />
          ) : (
            <div className="chessboard-surface grid aspect-[16/10] h-full w-full place-items-center bg-[#eef3fa] sm:aspect-auto sm:min-h-[270px]">
              <span className="font-arabic text-[11.5px] text-royal/40">بدون صورة</span>
            </div>
          )}

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-royal-deep/45 via-royal/5 to-transparent"
          />
          <div aria-hidden="true" className="absolute inset-0 ring-1 ring-inset ring-royal/10" />

          {article.categoryFr ? (
            <span className="absolute bottom-3.5 left-3.5 font-sans text-[8px] font-semibold uppercase tracking-[0.18em] text-white/70 sm:bottom-4 sm:left-4 sm:text-[8.5px]">
              {article.categoryFr}
            </span>
          ) : null}

          {photoCount > 0 ? (
            <span className="absolute right-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 font-arabic text-[10.5px] font-bold text-white backdrop-blur-sm sm:right-4 sm:top-4">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
                <rect x="3" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M7 6V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              {toArabicDigits(photoCount)} صور
            </span>
          ) : null}
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-col p-4 sm:p-5 lg:p-6">
          {article.categoryAr ? (
            <div className="mb-2.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-royal/[0.07] px-2.5 py-1 font-arabic text-[10px] font-semibold text-royal sm:text-[11px]">
                <span aria-hidden="true" className="h-[5px] w-[5px] rotate-45 bg-gold" />
                {article.categoryAr}
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-royal/[0.08]" />
            </div>
          ) : null}

          <h3 className="font-arabic text-[1.02rem] font-bold leading-[1.6] text-royal-ink sm:text-[1.12rem] lg:text-[1.22rem]">
            <a
              href={href}
              className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-right-bottom bg-no-repeat transition-[background-size] duration-500 hover:text-royal group-hover:bg-[length:100%_1px]"
            >
              {article.titleAr}
            </a>
          </h3>

          {article.dateISO ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <span className="inline-flex items-center gap-1.5 font-arabic text-[11.5px] font-medium text-royal/75 sm:text-[12.5px]">
                <CalendarIcon className="h-[15px] w-[15px] text-gold" />
                {formatArabicDate(article.dateISO)}
              </span>
              <span
                dir="ltr"
                className="font-sans text-[9.5px] font-medium tracking-wide text-royal-ink/35 sm:text-[10.5px]"
              >
                {formatFrenchDate(article.dateISO)}
              </span>
            </div>
          ) : null}

          {article.excerptAr ? (
            <p className="mt-3 font-arabic text-[12.5px] leading-[1.95] text-royal-ink/70 sm:text-[13.5px]">
              {article.excerptAr}
            </p>
          ) : null}

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-royal/[0.08] pt-4 sm:mt-auto sm:pt-5">
            <a
              href={href}
              className="inline-flex h-[42px] items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-royal px-4 text-[12.5px] font-semibold text-white shadow-[0_14px_28px_-18px_rgba(7,31,66,0.95)] transition-all duration-300 hover:bg-royal-deep sm:h-[45px] sm:px-5 sm:text-[13.5px]"
            >
              <span>اقرأ المزيد</span>
              <span
                aria-hidden="true"
                className="grid h-[21px] w-[21px] place-items-center rounded-full bg-white/[0.1] text-gold-light ring-1 ring-gold-light/30 transition-all duration-300 group-hover:bg-gold group-hover:text-royal-deep group-hover:ring-gold"
              >
                <ChevronLeftIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-[1px]" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
