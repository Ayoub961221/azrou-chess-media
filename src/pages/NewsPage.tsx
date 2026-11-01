import PageShell from "@/components/common/PageShell";
import { PageBody, SectionHeading } from "@/components/common/Section";
import NewsCard from "@/components/news/NewsCard";
import { KnightIcon, RookIcon } from "@/components/icons";
import { defaultContent, type NewsContent } from "@/lib/content-model";
import { toArabicDigits } from "@/lib/format";

export default function NewsPage({
  news,
  loading = false,
}: {
  news?: NewsContent;
  loading?: boolean;
}) {
  const data = news ?? defaultContent.news;
  const published = data.items.filter((item) => item.published);

  return (
    <PageShell
      eyebrow={data.header.eyebrow}
      titleAr={data.header.titleAr}
      titleFr={data.header.titleFr}
      intro={data.header.intro}
      crumbs={[{ label: "الأخبار" }]}
      bannerExtra={
        <div aria-hidden="true" className="mt-5 flex items-center justify-center gap-2.5">
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold/60 sm:w-16" />
          <KnightIcon className="h-[18px] w-[18px] text-gold sm:h-5 sm:w-5" />
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/60 sm:w-16" />
        </div>
      }
    >
      <PageBody>
        <SectionHeading
          id="news-list-title"
          titleAr={data.listTitleAr}
          titleFr={data.listTitleFr}
          note={published.length > 0 ? `${toArabicDigits(published.length)} خبر` : undefined}
        />

        {loading && published.length === 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-[240px] animate-pulse rounded-[22px] border border-royal/10 bg-white/70"
              />
            ))}
          </div>
        ) : published.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-[22px] border border-dashed border-royal/20 bg-white/70 px-5 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full border border-gold/30 bg-[#fdf8ec] text-royal/70">
              <RookIcon className="h-7 w-7" />
            </span>
            <p className="mt-4 font-arabic text-[14px] font-semibold text-royal-ink/80">
              لا توجد أخبار منشورة حالياً
            </p>
            <p className="mt-2 max-w-[28rem] font-arabic text-[12px] leading-[1.95] text-royal-ink/55">
              {data.emptyMessage}
            </p>
            <span
              lang="fr"
              dir="ltr"
              className="mt-3 font-sans text-[8.5px] font-semibold uppercase tracking-[0.2em] text-royal-ink/30"
            >
              Aucune actualité publiée
            </span>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-7">
            {published.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </PageBody>
    </PageShell>
  );
}
