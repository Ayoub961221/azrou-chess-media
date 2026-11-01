import PageShell from "@/components/common/PageShell";
import { Card, Notice, PageBody, SectionHeading } from "@/components/common/Section";
import {
  BishopIcon,
  ChevronLeftIcon,
  KingIcon,
  KnightIcon,
  MapPinIcon,
  PawnIcon,
  QueenIcon,
  RookIcon,
} from "@/components/icons";
import { defaultContent, type AboutContent } from "@/lib/content-model";

const ICONS = [PawnIcon, KnightIcon, RookIcon, QueenIcon, BishopIcon, KingIcon];

export default function ClubPage({ about }: { about?: AboutContent } = {}) {
  const a = about ?? defaultContent.about;

  return (
    <PageShell
      eyebrow={a.header.eyebrow}
      titleAr={a.header.titleAr}
      titleFr={a.header.titleFr}
      intro={a.header.intro}
      crumbs={[{ label: "عن النادي" }]}
    >
      <PageBody>
        {/* ---------- Identity ---------- */}
        <section aria-labelledby="club-identity">
          <SectionHeading
            id="club-identity"
            titleAr={a.sectionTitleAr}
            titleFr={a.sectionTitleFr}
          />

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-7">
            <Card className="p-5 sm:p-6 lg:p-7">
              <span className="inline-flex items-center gap-2 rounded-full bg-royal/[0.07] px-3 py-1 font-arabic text-[10.5px] font-semibold text-royal sm:text-[11px]">
                <span aria-hidden="true" className="h-[5px] w-[5px] rotate-45 bg-gold" />
                الهوية
              </span>

              <h3 className="mt-3.5 font-arabic text-[1.1rem] font-bold leading-[1.6] text-royal-ink sm:text-[1.22rem]">
                {defaultContent.siteSettings.nameAr}
              </h3>
              <p lang="fr" dir="ltr" className="mt-1 font-display text-[1.05rem] text-royal/80">
                {defaultContent.siteSettings.nameFr}
              </p>

              {a.paragraph1 ? (
                <p className="mt-4 font-arabic text-[13px] leading-[2.05] text-royal-ink/75 sm:text-[14px]">
                  {a.paragraph1}
                </p>
              ) : null}
              {a.paragraph2 ? (
                <p className="mt-3 font-arabic text-[13px] leading-[2.05] text-royal-ink/75 sm:text-[14px]">
                  {a.paragraph2}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-2.5 border-t border-royal/[0.08] pt-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-royal/12 bg-[#f7f9fc] px-3 py-1.5 font-arabic text-[11px] font-medium text-royal/80">
                  <MapPinIcon className="h-3.5 w-3.5 text-gold" />
                  {defaultContent.siteSettings.locationAr}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-royal/12 bg-[#f7f9fc] px-3 py-1.5 font-arabic text-[11px] font-medium text-royal/80">
                  <PawnIcon className="h-3.5 w-3.5 text-gold" />
                  رياضة ذهنية
                </span>
                <span
                  lang="zgh"
                  dir="ltr"
                  style={{ unicodeBidi: "isolate" }}
                  className="inline-flex items-center rounded-full border border-gold/35 bg-[#fdf8ec] px-3 py-1.5 font-tifinagh text-[12px] text-[#8a6d26]"
                >
                  {defaultContent.siteSettings.tifinagh}
                </span>
              </div>
            </Card>

            {/* Photo */}
            <figure className="relative m-0">
              <div className="relative h-full overflow-hidden rounded-[20px] bg-royal-deep shadow-[0_26px_58px_-36px_rgba(7,31,66,0.65)] ring-1 ring-royal/10">
                {a.photo?.url ? (
                  <img
                    src={a.photo.url}
                    alt={a.photoCaptionAr || "صورة من أنشطة النادي"}
                    width={a.photo.width ?? 640}
                    height={a.photo.height ?? 424}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="h-full min-h-[240px] w-full select-none object-cover object-center"
                  />
                ) : (
                  <div className="chessboard-surface grid h-full min-h-[240px] w-full place-items-center bg-[#0b2d5e]">
                    <span className="font-arabic text-[12px] text-white/50">
                      لم تُضَف صورة بعد
                    </span>
                  </div>
                )}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#03132a]/80 via-[#04182f]/10 to-transparent"
                />
                <figcaption className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <p className="font-arabic text-[12.5px] font-semibold text-white sm:text-[13.5px]">
                    {a.photoCaptionAr}
                  </p>
                  <p lang="fr" dir="ltr" className="mt-1 font-display text-[11.5px] text-white/65">
                    {a.photoCaptionFr}
                  </p>
                </figcaption>
              </div>
            </figure>
          </div>
        </section>

        {/* ---------- Objectives ---------- */}
        {a.objectives.length > 0 ? (
          <section aria-labelledby="club-goals" className="mt-12 sm:mt-14">
            <SectionHeading id="club-goals" titleAr="أهداف النادي" titleFr="Nos objectifs" />

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {a.objectives.map((goal, index) => {
                const Icon = ICONS[index % ICONS.length];
                return (
                  <Card key={goal.id} hover className="p-5">
                    <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/30 bg-[#fdf8ec] text-royal">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-3.5 font-arabic text-[14.5px] font-bold text-royal-ink sm:text-[15.5px]">
                      {goal.ar}
                    </h3>
                    <p
                      lang="fr"
                      dir="ltr"
                      className="mt-0.5 font-sans text-[8.5px] font-semibold uppercase tracking-[0.18em] text-royal-ink/35"
                    >
                      {goal.fr}
                    </p>
                    <p className="mt-2.5 font-arabic text-[12.5px] leading-[1.95] text-royal-ink/70">
                      {goal.text}
                    </p>
                  </Card>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* ---------- Activities ---------- */}
        {a.activities.length > 0 ? (
          <section aria-labelledby="club-activities" className="mt-12 sm:mt-14">
            <SectionHeading
              id="club-activities"
              titleAr="أنشطة النادي"
              titleFr="Nos activités"
            />

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {a.activities.map((activity, index) => (
                <Card key={activity.id} hover className="flex flex-col p-5">
                  <span className="font-sans text-[10px] font-bold tracking-[0.12em] text-gold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-arabic text-[14px] font-bold text-royal-ink sm:text-[15px]">
                    {activity.ar}
                  </h3>
                  <p
                    lang="fr"
                    dir="ltr"
                    className="mt-0.5 font-sans text-[8.5px] font-semibold uppercase tracking-[0.18em] text-royal-ink/35"
                  >
                    {activity.fr}
                  </p>
                  <p className="mt-2.5 font-arabic text-[12.5px] leading-[1.95] text-royal-ink/70">
                    {activity.text}
                  </p>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        {/* ---------- Records ---------- */}
        {a.recordsNotice ? (
          <section aria-labelledby="club-records" className="mt-12 sm:mt-14">
            <SectionHeading
              id="club-records"
              titleAr="الإنجازات والمعطيات الرسمية"
              titleFr="Palmarès & informations officielles"
            />

            <div className="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-7">
              <Notice tone="royal">{a.recordsNotice}</Notice>

              <Card className="p-5 sm:p-6">
                <h3 className="font-arabic text-[14px] font-bold text-royal-ink sm:text-[15px]">
                  هل لديكم معطيات لإضافتها؟
                </h3>
                <p className="mt-2.5 font-arabic text-[12.5px] leading-[1.95] text-royal-ink/70">
                  يمكن تزويد النادي بالمعلومات الرسمية ليتم نشرها على الموقع بعد اعتمادها.
                </p>
                <a
                  href="#contact"
                  className="group mt-5 inline-flex h-[44px] items-center justify-center gap-2.5 rounded-full bg-royal px-5 text-[12.5px] font-semibold text-white transition-all duration-300 hover:-translate-y-px hover:bg-royal-deep sm:text-[13px]"
                >
                  <span>تزويد النادي بالمعلومات</span>
                  <ChevronLeftIcon
                    aria-hidden="true"
                    className="h-4 w-4 text-gold-light transition-transform duration-300 group-hover:-translate-x-0.5"
                  />
                </a>
              </Card>
            </div>
          </section>
        ) : null}
      </PageBody>
    </PageShell>
  );
}
