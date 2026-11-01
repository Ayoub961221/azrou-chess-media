import PageShell from "@/components/common/PageShell";
import { Card, Notice, PageBody, SectionHeading } from "@/components/common/Section";
import { BishopIcon, ChevronLeftIcon, KnightIcon, PawnIcon } from "@/components/icons";
import { defaultContent, type TrainingContent } from "@/lib/content-model";
import { splitList } from "@/lib/format";

export default function SchoolPage({ training }: { training?: TrainingContent } = {}) {
  const t = training ?? defaultContent.training;

  return (
    <PageShell
      eyebrow={t.header.eyebrow}
      titleAr={t.header.titleAr}
      titleFr={t.header.titleFr}
      intro={t.header.intro}
      crumbs={[{ label: "التداريب" }]}
    >
      <PageBody>
        {/* ---------- Approach ---------- */}
        <section aria-labelledby="school-intro">
          <SectionHeading id="school-intro" titleAr="منهجية التدريب" titleFr="Notre approche" />

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-7">
            <figure className="relative order-2 m-0 lg:order-1">
              <div className="relative h-full overflow-hidden rounded-[20px] bg-royal-deep shadow-[0_26px_58px_-36px_rgba(7,31,66,0.6)] ring-1 ring-royal/10">
                {t.photo?.url ? (
                  <img
                    src={t.photo.url}
                    alt={t.photoNote || "صورة من حصص التدريب"}
                    width={t.photo.width ?? 1100}
                    height={t.photo.height ?? 825}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="h-full min-h-[230px] w-full select-none object-cover object-center"
                  />
                ) : (
                  <div className="chessboard-surface grid h-full min-h-[230px] w-full place-items-center bg-[#0b2d5e]">
                    <span className="font-arabic text-[12px] text-white/50">
                      لم تُضَف صورة بعد
                    </span>
                  </div>
                )}
                {t.photo?.url ? (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#03132a]/70 via-transparent to-transparent"
                  />
                ) : null}
                {t.photoNote ? (
                  <figcaption className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-4">
                    <span aria-hidden="true" className="h-[5px] w-[5px] rotate-45 bg-gold" />
                    <span className="font-arabic text-[11px] text-white/80">{t.photoNote}</span>
                  </figcaption>
                ) : null}
              </div>
            </figure>

            <Card className="order-1 p-5 sm:p-6 lg:order-2 lg:p-7">
              <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/30 bg-[#fdf8ec] text-royal">
                <KnightIcon className="h-6 w-6" />
              </span>

              <h3 className="mt-3.5 font-arabic text-[1.05rem] font-bold leading-[1.6] text-royal-ink sm:text-[1.15rem]">
                {t.approachTitle}
              </h3>

              <p className="mt-3 font-arabic text-[13px] leading-[2.05] text-royal-ink/75 sm:text-[14px]">
                {t.approachText}
              </p>

              {t.approachPoints.length > 0 ? (
                <ul className="mt-4 space-y-2.5">
                  {t.approachPoints.filter(Boolean).map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-[7px] h-[6px] w-[6px] shrink-0 rotate-45 border border-gold bg-gold/20"
                      />
                      <span className="font-arabic text-[12.5px] leading-[1.95] text-royal-ink/75">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Card>
          </div>
        </section>

        {/* ---------- Levels ---------- */}
        {t.levels.length > 0 ? (
          <section aria-labelledby="school-levels" className="mt-12 sm:mt-14">
            <SectionHeading
              id="school-levels"
              titleAr={t.levelsTitleAr}
              titleFr={t.levelsTitleFr}
            />

            <ol className="mt-6 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {t.levels.map((level) => (
                <li key={level.id}>
                  <Card hover className="flex h-full flex-col p-5">
                    <span
                      aria-hidden="true"
                      className="absolute left-4 top-4 font-display text-[2.1rem] font-semibold leading-none text-royal/[0.07]"
                    >
                      {level.step}
                    </span>

                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-royal/[0.07] px-2.5 py-1 font-arabic text-[10px] font-bold text-royal">
                      <span aria-hidden="true" className="h-[5px] w-[5px] rotate-45 bg-gold" />
                      المرحلة {level.step}
                    </span>

                    <h3 className="mt-3 font-arabic text-[14.5px] font-bold text-royal-ink sm:text-[15px]">
                      {level.ar}
                    </h3>
                    <p
                      lang="fr"
                      dir="ltr"
                      className="mt-0.5 font-sans text-[8.5px] font-semibold uppercase tracking-[0.18em] text-royal-ink/35"
                    >
                      {level.fr}
                    </p>

                    <p className="mt-2.5 font-arabic text-[12.5px] leading-[1.95] text-royal-ink/70">
                      {level.text}
                    </p>

                    {splitList(level.points).length > 0 ? (
                      <ul className="mt-3.5 space-y-1.5 border-t border-royal/[0.08] pt-3">
                        {splitList(level.points).map((point) => (
                          <li
                            key={point}
                            className="flex items-center gap-2 font-arabic text-[11.5px] text-royal-ink/65"
                          >
                            <PawnIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-gold" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </Card>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {/* ---------- Programs ---------- */}
        {t.programs.length > 0 ? (
          <section aria-labelledby="school-programs" className="mt-12 sm:mt-14">
            <SectionHeading
              id="school-programs"
              titleAr={t.programsTitleAr}
              titleFr={t.programsTitleFr}
            />

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-5">
              {t.programs.map((program) => (
                <Card key={program.id} hover className="p-5">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/30 bg-[#fdf8ec] text-royal">
                    <BishopIcon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-3.5 font-arabic text-[14.5px] font-bold text-royal-ink sm:text-[15px]">
                    {program.ar}
                  </h3>
                  <p
                    lang="fr"
                    dir="ltr"
                    className="mt-0.5 font-sans text-[8.5px] font-semibold uppercase tracking-[0.18em] text-royal-ink/35"
                  >
                    {program.fr}
                  </p>
                  <p className="mt-2.5 font-arabic text-[12.5px] leading-[1.95] text-royal-ink/70">
                    {program.text}
                  </p>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        {/* ---------- Registration ---------- */}
        {t.registrationNotice ? (
          <section aria-labelledby="school-signup" className="mt-12 sm:mt-14">
            <SectionHeading
              id="school-signup"
              titleAr="التسجيل والانخراط"
              titleFr="Inscription"
            />

            <div className="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-7">
              <Notice>{t.registrationNotice}</Notice>

              <Card className="p-5 sm:p-6">
                <h3 className="font-arabic text-[14px] font-bold text-royal-ink sm:text-[15px]">
                  للاستفسار حول التكوين
                </h3>
                <p className="mt-2.5 font-arabic text-[12.5px] leading-[1.95] text-royal-ink/70">
                  يمكنكم مراسلة النادي للحصول على تفاصيل البرامج ومواعيد الحصص.
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <a
                    href="#inscription"
                    className="group inline-flex h-[44px] items-center justify-center gap-2.5 rounded-full bg-royal px-5 text-[12.5px] font-semibold text-white shadow-[0_14px_28px_-18px_rgba(7,31,66,0.95)] transition-all duration-300 hover:-translate-y-px hover:bg-royal-deep sm:text-[13px]"
                  >
                    <span>سجّل الآن</span>
                    <ChevronLeftIcon
                      aria-hidden="true"
                      className="h-4 w-4 text-gold-light transition-transform duration-300 group-hover:-translate-x-0.5"
                    />
                  </a>
                  <a
                    href="#contact"
                    className="inline-flex h-[44px] items-center justify-center rounded-full border border-royal/15 bg-white px-5 font-arabic text-[12.5px] font-semibold text-royal transition-all duration-300 hover:-translate-y-px hover:border-gold/70 hover:bg-[#fffdf8] sm:text-[13px]"
                  >
                    الاستفسار عبر صفحة التواصل
                  </a>
                </div>
              </Card>
            </div>
          </section>
        ) : null}
      </PageBody>
    </PageShell>
  );
}
