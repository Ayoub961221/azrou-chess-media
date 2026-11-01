import MembersCarousel from "@/components/home/MembersCarousel";
import { HoursTable, MapCard, OpenBadge, useOpenState } from "@/components/contact/OpeningHours";
import { Card, SectionHeading } from "@/components/common/Section";
import {
  BishopIcon,
  CalendarIcon,
  ChevronLeftIcon,
  KnightIcon,
  MailIcon,
  MapPinIcon,
  PawnIcon,
  PhoneIcon,
  QueenIcon,
  RookIcon,
} from "@/components/icons";
import type {
  ContactContent,
  GalleryContent,
  MembersContent,
  NewsContent,
  TournamentsContent,
  TrainingContent,
} from "@/lib/content-model";
import { NEWS_ROUTE } from "@/hooks/useHashRoute";
import { formatArabicDate, toArabicDigits } from "@/lib/format";
import { cn } from "@/utils/cn";

/* ════════════ ١. شريط آخر مستجد ════════════ */

export function LatestStrip({
  news,
  tournaments,
}: {
  news: NewsContent;
  tournaments: TournamentsContent;
}) {
  const latest = [...(news.items ?? [])]
    .filter((n) => n.published)
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))[0];

  const live = (tournaments.items ?? []).find(
    (t) => t.published && (t.status === "ongoing" || t.status === "upcoming")
  );

  if (!latest && !live) return null;

  return (
    <div className="w-full border-b border-royal/10 bg-royal-deep">
      <div className="mx-auto flex w-full max-w-[1560px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6 lg:px-10 xl:px-14">
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gold px-2.5 py-1 font-arabic text-[10px] font-bold text-royal-deep sm:text-[11px]">
          <span aria-hidden="true" className="h-[6px] w-[6px] animate-pulse rounded-full bg-royal-deep/70" />
          {live?.status === "ongoing" ? "جارٍ الآن" : "آخر مستجد"}
        </span>

        {live ? (
          <a
            href="#tournois"
            className="min-w-0 flex-1 truncate font-arabic text-[12px] font-medium text-white/90 transition-colors hover:text-gold-light sm:text-[13px]"
          >
            {live.titleAr}
            {live.dateAr ? (
              <span className="text-white/50"> — {live.dateAr}</span>
            ) : null}
          </a>
        ) : latest ? (
          <a
            href={`#${NEWS_ROUTE}/${latest.id}`}
            className="min-w-0 flex-1 truncate font-arabic text-[12px] font-medium text-white/90 transition-colors hover:text-gold-light sm:text-[13px]"
          >
            {latest.titleAr}
          </a>
        ) : null}

        <a
          href={`#${NEWS_ROUTE}`}
          className="shrink-0 font-arabic text-[11px] font-semibold text-gold-light underline decoration-gold/40 underline-offset-2 hover:decoration-gold"
        >
          كل الأخبار
        </a>
      </div>
    </div>
  );
}

/* ════════════ ٢. آخر الأخبار ════════════ */

export function LatestNewsSection({ news }: { news: NewsContent }) {
  const items = [...(news.items ?? [])]
    .filter((n) => n.published)
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    .slice(0, 3);

  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="home-news"
      className="w-full border-t border-royal/[0.08] bg-[#fbf9f4] py-12 sm:py-14 lg:py-16"
    >
      <div className="mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-10 xl:px-14">
        <SectionHeading
          id="home-news"
          titleAr="آخر الأخبار"
          titleFr="Dernières actualités"
          note={`${toArabicDigits(items.length)}`}
        />

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <article
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-[20px] border border-royal/10 bg-white shadow-[0_18px_44px_-34px_rgba(7,31,66,0.5)] transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/45 hover:shadow-[0_30px_58px_-32px_rgba(7,31,66,0.55)]"
            >
              <a href={`#${NEWS_ROUTE}/${item.id}`} className="flex h-full flex-col">
                <span className="relative block overflow-hidden bg-[#e8edf4]">
                  {item.image?.url ? (
                    <img
                      src={item.image.mediumUrl ?? item.image.url}
                      alt={item.imageAlt || item.titleAr}
                      width={item.image.width ?? 900}
                      height={item.image.height ?? 600}
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding="async"
                      className="aspect-[16/10] w-full object-cover object-center transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                    />
                  ) : (
                    <span className="chessboard-surface grid aspect-[16/10] w-full place-items-center bg-[#eef3fa]">
                      <RookIcon className="h-9 w-9 text-royal/25" />
                    </span>
                  )}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-royal-deep/45 via-transparent to-transparent"
                  />
                  {item.categoryAr ? (
                    <span className="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-1 font-arabic text-[10px] font-bold text-royal-deep shadow-sm">
                      {item.categoryAr}
                    </span>
                  ) : null}
                </span>

                <span className="flex flex-1 flex-col p-4">
                  {item.dateISO ? (
                    <span className="inline-flex items-center gap-1.5 font-arabic text-[11px] font-medium text-royal/70">
                      <CalendarIcon className="h-[14px] w-[14px] text-gold" />
                      {formatArabicDate(item.dateISO)}
                    </span>
                  ) : null}

                  <span className="mt-2 block font-arabic text-[14.5px] font-bold leading-[1.65] text-royal-ink transition-colors group-hover:text-royal sm:text-[15px]">
                    {item.titleAr}
                  </span>

                  {item.excerptAr ? (
                    <span className="mt-2 line-clamp-3 block font-arabic text-[12px] leading-[1.95] text-royal-ink/65">
                      {item.excerptAr}
                    </span>
                  ) : null}

                  <span className="mt-auto flex items-center gap-1.5 pt-3.5 font-arabic text-[12px] font-semibold text-royal">
                    اقرأ المزيد
                    <ChevronLeftIcon
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-gold transition-transform duration-300 group-hover:-translate-x-0.5"
                    />
                  </span>
                </span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════ ٣. البطولات والنتائج ════════════ */

const STATUS_LABEL: Record<string, string> = {
  upcoming: "قادمة",
  ongoing: "جارية",
  done: "منتهية",
};

const STATUS_STYLE: Record<string, string> = {
  upcoming: "border-royal/25 bg-white/10 text-white",
  ongoing: "border-gold bg-gold text-royal-deep",
  done: "border-white/15 bg-white/[0.06] text-white/55",
};

export function TournamentsHighlight({ data }: { data: TournamentsContent }) {
  const items = (data.items ?? []).filter((t) => t.published);
  const standings = [...(data.standings ?? [])].sort((a, b) => a.rank - b.rank).slice(0, 5);

  if (items.length === 0 && standings.length === 0) return null;

  return (
    <section
      aria-labelledby="home-tournaments"
      className="relative isolate w-full overflow-hidden bg-royal-deep py-12 text-white sm:py-14 lg:py-16"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(158deg,#0d3570_0%,#09264f_48%,#061c3b_100%)]" />
        <div className="drawer-chess-surface absolute -left-20 bottom-0 h-[300px] w-[420px] opacity-40 [mask-image:linear-gradient(to_top_right,black,transparent_72%)]" />
        <div className="absolute -right-24 -top-24 h-[320px] w-[320px] rounded-full border border-gold/15" />
        <QueenIcon className="absolute right-[6%] top-[18%] hidden h-24 w-24 text-gold/[0.12] lg:block" />
      </div>

      <div className="mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-10 xl:px-14">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-white/15 pb-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span aria-hidden="true" className="h-[7px] w-[7px] shrink-0 rotate-45 border border-gold bg-gold/25" />
            <h2 id="home-tournaments" className="font-arabic text-[1.05rem] font-bold text-white sm:text-[1.2rem]">
              البطولات والنتائج
            </h2>
          </div>
          <p lang="fr" dir="ltr" className="font-sans text-[9.5px] font-semibold uppercase tracking-[0.22em] text-white/40 sm:text-[10.5px]">
            Tournois &amp; Résultats
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-7">
          {/* الدورات */}
          {items.length > 0 ? (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {items.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col rounded-[18px] border border-white/12 bg-white/[0.05] p-4 backdrop-blur-sm transition-colors duration-300 hover:border-gold/45 hover:bg-white/[0.09]"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/35 bg-white/[0.08] text-gold-light">
                      <RookIcon className="h-5 w-5" />
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-1 font-arabic text-[10px] font-bold",
                        STATUS_STYLE[t.status]
                      )}
                    >
                      {STATUS_LABEL[t.status]}
                    </span>
                  </div>

                  <h3 className="mt-3 font-arabic text-[13.5px] font-bold leading-snug text-white sm:text-[14.5px]">
                    {t.titleAr}
                  </h3>

                  <dl className="mt-3 space-y-1.5 border-t border-white/10 pt-2.5">
                    {t.dateAr ? (
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="h-[13px] w-[13px] shrink-0 text-gold" />
                        <dd className="font-arabic text-[11.5px] text-white/75">{t.dateAr}</dd>
                      </div>
                    ) : null}
                    {t.formatAr ? (
                      <div className="flex items-center justify-between gap-2">
                        <dt className="font-arabic text-[11px] text-white/45">النظام</dt>
                        <dd className="font-arabic text-[11.5px] font-semibold text-white/85">{t.formatAr}</dd>
                      </div>
                    ) : null}
                    {t.roundsAr ? (
                      <div className="flex items-center justify-between gap-2">
                        <dt className="font-arabic text-[11px] text-white/45">الجولات</dt>
                        <dd className="font-arabic text-[11.5px] font-semibold text-white/85">{t.roundsAr}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
              ))}
            </div>
          ) : null}

          {/* الترتيب */}
          {standings.length > 0 ? (
            <div className="overflow-hidden rounded-[18px] border border-white/12 bg-white/[0.05] backdrop-blur-sm">
              <div className="border-b border-white/10 px-4 py-3">
                <h3 className="font-arabic text-[13.5px] font-bold text-white sm:text-[14.5px]">
                  صدارة الترتيب
                </h3>
              </div>
              <ul className="m-0 list-none divide-y divide-white/[0.07] p-0">
                {standings.map((row) => (
                  <li key={row.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full font-sans text-[11.5px] font-bold",
                        row.rank === 1
                          ? "bg-gold text-royal-deep"
                          : row.rank <= 3
                            ? "bg-white/15 text-gold-light"
                            : "bg-white/[0.07] text-white/55"
                      )}
                    >
                      {row.rank}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-arabic text-[12.5px] font-medium text-white/90">
                      {row.playerAr}
                    </span>
                    <span className="shrink-0 font-arabic text-[13px] font-bold text-gold-light">
                      {row.pointsAr}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-7 flex justify-center">
          <a
            href="#tournois"
            className="group inline-flex h-[46px] items-center justify-center gap-2.5 rounded-full border border-gold/50 bg-white/[0.06] px-5 font-arabic text-[13px] font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-px hover:border-gold hover:bg-gold hover:text-royal-deep"
          >
            <span>كل البطولات والنتائج</span>
            <ChevronLeftIcon
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5"
            />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ════════════ ٤. أرقام النادي ════════════ */

export function StatsStrip({
  members,
  tournaments,
  gallery,
  news,
}: {
  members: MembersContent;
  tournaments: TournamentsContent;
  gallery: GalleryContent;
  news: NewsContent;
}) {
  const stats = [
    { icon: KnightIcon, n: (members.people ?? []).filter((p) => p.published).length, ar: "عضواً ومسؤولاً", fr: "Membres" },
    { icon: RookIcon, n: (tournaments.items ?? []).filter((t) => t.published).length, ar: "دورة وبطولة", fr: "Tournois" },
    { icon: BishopIcon, n: (gallery.items ?? []).filter((g) => g.published && g.image?.url).length, ar: "صورة من أنشطتنا", fr: "Photos" },
    { icon: PawnIcon, n: (news.items ?? []).filter((n) => n.published).length, ar: "خبراً منشوراً", fr: "Actualités" },
  ].filter((s) => s.n > 0);

  if (stats.length === 0) return null;

  return (
    <section
      aria-label="أرقام النادي"
      className="w-full border-t border-royal/[0.08] bg-white py-9 sm:py-11"
    >
      <div className="mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-10 xl:px-14">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.ar}
                className="flex flex-col items-center rounded-[18px] border border-royal/10 bg-[#f8fafd] px-3 py-5 text-center"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/30 bg-[#fdf8ec] text-royal">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="mt-3 block font-arabic text-[1.65rem] font-bold leading-none text-royal">
                  {toArabicDigits(s.n)}
                </span>
                <span className="mt-1.5 block font-arabic text-[11.5px] font-medium text-royal-ink/70">
                  {s.ar}
                </span>
                <span
                  lang="fr"
                  dir="ltr"
                  className="mt-0.5 block font-sans text-[8px] font-semibold uppercase tracking-[0.18em] text-royal-ink/30"
                >
                  {s.fr}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ════════════ ٥. مدرسة الشطرنج ════════════ */

export function TrainingTeaser({ training }: { training: TrainingContent }) {
  const levels = (training.levels ?? []).slice(0, 4);
  if (levels.length === 0) return null;

  return (
    <section
      aria-labelledby="home-training"
      className="w-full border-t border-royal/[0.08] bg-[#fbf9f4] py-12 sm:py-14 lg:py-16"
    >
      <div className="mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-10 xl:px-14">
        <SectionHeading
          id="home-training"
          titleAr={training.levelsTitleAr || "مستويات التعلم"}
          titleFr={training.levelsTitleFr || "Niveaux"}
        />

        <ol className="mt-6 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {levels.map((level) => (
            <li key={level.id}>
              <Card hover className="flex h-full flex-col p-5">
                <span
                  aria-hidden="true"
                  className="absolute left-4 top-3 font-display text-[2rem] font-semibold leading-none text-royal/[0.07]"
                >
                  {level.step}
                </span>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-royal/[0.07] px-2.5 py-1 font-arabic text-[10px] font-bold text-royal">
                  <span aria-hidden="true" className="h-[5px] w-[5px] rotate-45 bg-gold" />
                  المرحلة {level.step}
                </span>
                <h3 className="mt-3 font-arabic text-[14.5px] font-bold text-royal-ink">
                  {level.ar}
                </h3>
                <p
                  lang="fr"
                  dir="ltr"
                  className="mt-0.5 font-sans text-[8.5px] font-semibold uppercase tracking-[0.18em] text-royal-ink/35"
                >
                  {level.fr}
                </p>
                <p className="mt-2.5 font-arabic text-[12px] leading-[1.9] text-royal-ink/70">
                  {level.text}
                </p>
              </Card>
            </li>
          ))}
        </ol>

        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <a
            href="#inscription"
            className="group inline-flex h-[46px] items-center justify-center gap-2.5 rounded-full bg-royal px-5 font-arabic text-[13px] font-bold text-white shadow-[0_16px_32px_-20px_rgba(7,31,66,0.95)] transition-all duration-300 hover:-translate-y-px hover:bg-royal-deep"
          >
            <span aria-hidden="true" className="h-[6px] w-[6px] rotate-45 bg-gold" />
            <span>سجّل الآن</span>
          </a>
          <a
            href="#entrainements"
            className="inline-flex h-[46px] items-center justify-center rounded-full border border-royal/15 bg-white px-5 font-arabic text-[13px] font-semibold text-royal transition-all duration-300 hover:-translate-y-px hover:border-gold/70 hover:bg-[#fffdf8]"
          >
            برامج التكوين
          </a>
        </div>
      </div>
    </section>
  );
}

/* ════════════ ٦. إطار الأعضاء المتحرك ════════════ */

export function TeamCarouselSection({ members }: { members: MembersContent }) {
  const published = (members.people ?? []).filter((p) => p.published);
  if (published.length === 0) return null;

  return (
    <section
      aria-labelledby="home-team"
      className="relative isolate w-full border-t border-royal/[0.08] bg-white py-12 sm:py-14 lg:py-16"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="chessboard-surface absolute inset-x-0 top-0 h-[160px] opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      </div>

      <div className="mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-10 xl:px-14">
        <SectionHeading
          id="home-team"
          titleAr="أعضاء النادي ومسؤولوه"
          titleFr="Notre équipe"
        />

        <div className="mt-7">
          <MembersCarousel members={members} />
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href="#membres"
            className="group inline-flex h-[46px] items-center justify-center gap-2.5 rounded-full border border-royal/15 bg-white px-5 text-[13px] font-semibold text-royal shadow-[0_10px_24px_-22px_rgba(7,31,66,0.8)] transition-all duration-300 hover:-translate-y-px hover:border-gold/70 hover:bg-[#fffdf8]"
          >
            <span>كل الأعضاء</span>
            <ChevronLeftIcon
              aria-hidden="true"
              className="h-4 w-4 text-gold transition-transform duration-300 group-hover:-translate-x-0.5"
            />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ════════════ ٧. شريط المعرض ════════════ */

export function GalleryStrip({ gallery }: { gallery: GalleryContent }) {
  const items = (gallery.items ?? [])
    .filter((g) => g.published && g.image?.url)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 6);

  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="home-gallery"
      className="w-full border-t border-royal/[0.08] bg-[#fbf9f4] py-12 sm:py-14 lg:py-16"
    >
      <div className="mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-10 xl:px-14">
        <SectionHeading
          id="home-gallery"
          titleAr={gallery.sectionTitleAr || "من أنشطة النادي"}
          titleFr={gallery.sectionTitleFr || "Galerie"}
        />

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {items.map((item, index) => (
            <a
              key={item.id}
              href="#galerie"
              className="group relative block overflow-hidden rounded-[16px] border border-royal/10 bg-[#e8edf4] shadow-[0_14px_34px_-30px_rgba(7,31,66,0.5)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/45"
            >
              <img
                src={item.image!.thumbUrl ?? item.image!.url}
                alt={item.titleAr || "صورة من أنشطة النادي"}
                width={item.image!.width ?? 400}
                height={item.image!.height ?? 300}
                loading={index < 3 ? "eager" : "lazy"}
                decoding="async"
                className="aspect-square w-full object-cover object-center transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-royal-deep/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              {item.titleAr ? (
                <span className="absolute inset-x-0 bottom-0 translate-y-full p-2 font-arabic text-[10.5px] font-semibold text-white transition-transform duration-300 group-hover:translate-y-0">
                  {item.titleAr}
                </span>
              ) : null}
            </a>
          ))}
        </div>

        <div className="mt-7 flex justify-center">
          <a
            href="#galerie"
            className="group inline-flex h-[46px] items-center justify-center gap-2.5 rounded-full border border-royal/15 bg-white px-5 font-arabic text-[13px] font-semibold text-royal transition-all duration-300 hover:-translate-y-px hover:border-gold/70 hover:bg-[#fffdf8]"
          >
            <span>كل الصور</span>
            <ChevronLeftIcon
              aria-hidden="true"
              className="h-4 w-4 text-gold transition-transform duration-300 group-hover:-translate-x-0.5"
            />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ════════════ ٨. أوقات ومكان النادي ════════════ */

export function ContactSummarySection({ contact }: { contact: ContactContent }) {
  const openState = useOpenState(contact);

  const hasHours = (contact.hours ?? []).length > 0;
  const hasMap = Boolean(contact.mapEmbedUrl || contact.mapLinkUrl || contact.addressDetails);
  const details = [
    { icon: MapPinIcon, value: contact.city, label: "المدينة" },
    { icon: PhoneIcon, value: contact.phone, label: "الهاتف", href: contact.phone ? `tel:${contact.phone}` : undefined },
    { icon: MailIcon, value: contact.email, label: "البريد", href: contact.email ? `mailto:${contact.email}` : undefined },
  ].filter((d) => d.value?.trim());

  if (!hasHours && !hasMap && details.length === 0) return null;

  return (
    <section
      aria-labelledby="home-contact"
      className="w-full border-t border-royal/[0.08] bg-white py-12 sm:py-14 lg:py-16"
    >
      <div className="mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-10 xl:px-14">
        <SectionHeading
          id="home-contact"
          titleAr="أوقات ومكان النادي"
          titleFr="Horaires & Accès"
        />

        <div className="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-7">
          <div className="flex flex-col gap-5">
            {hasHours ? (
              <Card className="p-5 sm:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-royal/[0.08] pb-3">
                  <h3 className="inline-flex items-center gap-2 font-arabic text-[14px] font-bold text-royal-ink sm:text-[15px]">
                    <CalendarIcon className="h-[17px] w-[17px] text-gold" />
                    أوقات الفتح
                  </h3>
                  <OpenBadge state={openState} />
                </div>
                <HoursTable contact={contact} compact />
              </Card>
            ) : null}

            {details.length > 0 ? (
              <Card className="p-5 sm:p-6">
                <ul className="m-0 list-none space-y-2.5 p-0">
                  {details.map((d) => {
                    const Icon = d.icon;
                    return (
                      <li key={d.label} className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold/30 bg-[#fdf8ec] text-royal">
                          <Icon className="h-4 w-4" />
                        </span>
                        {d.href ? (
                          <a
                            href={d.href}
                            dir="ltr"
                            className="min-w-0 flex-1 truncate text-right font-arabic text-[12.5px] font-semibold text-royal underline decoration-gold/50 underline-offset-2"
                          >
                            {d.value}
                          </a>
                        ) : (
                          <span className="min-w-0 flex-1 truncate font-arabic text-[12.5px] font-semibold text-royal-ink/80">
                            {d.value}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-4 flex flex-wrap gap-2.5 border-t border-royal/[0.08] pt-4">
                  <a
                    href="#inscription"
                    className="group inline-flex h-[44px] items-center justify-center gap-2.5 rounded-full bg-royal px-5 text-[12.5px] font-semibold text-white shadow-[0_14px_28px_-18px_rgba(7,31,66,0.95)] transition-all duration-300 hover:-translate-y-px hover:bg-royal-deep sm:text-[13px]"
                  >
                    <span>سجّل الآن</span>
                    <span
                      aria-hidden="true"
                      className="grid h-[21px] w-[21px] place-items-center rounded-full bg-white/[0.1] text-gold-light ring-1 ring-gold-light/30 transition-all duration-300 group-hover:bg-gold group-hover:text-royal-deep group-hover:ring-gold"
                    >
                      <ChevronLeftIcon className="h-3.5 w-3.5" />
                    </span>
                  </a>
                  <a
                    href="#contact"
                    className="inline-flex h-[44px] items-center justify-center rounded-full border border-royal/15 bg-white px-5 font-arabic text-[12.5px] font-semibold text-royal transition-all duration-300 hover:-translate-y-px hover:border-gold/70 hover:bg-[#fffdf8] sm:text-[13px]"
                  >
                    اتصل بنا
                  </a>
                </div>
              </Card>
            ) : null}
          </div>

          {hasMap ? <MapCard contact={contact} /> : null}
        </div>
      </div>
    </section>
  );
}
