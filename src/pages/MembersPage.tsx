import PageShell from "@/components/common/PageShell";
import { Card, PageBody, SectionHeading } from "@/components/common/Section";
import MemberCard from "@/components/team/MemberCard";
import MemberPhoto from "@/components/team/MemberPhoto";
import { ChevronLeftIcon, KingIcon } from "@/components/icons";
import {
  defaultContent,
  type MembersContent,
  type TeamGroup,
  type TeamPerson,
} from "@/lib/content-model";
import { toArabicDigits } from "@/lib/format";

export default function MembersPage({ members }: { members?: MembersContent } = {}) {
  const m = members ?? defaultContent.members;
  const people = m.people.filter((p) => p.published);

  const byGroup = (group: TeamGroup) =>
    people.filter((p) => p.group === group).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const president = byGroup("president")[0] ?? null;
  const bureau = byGroup("bureau");
  const coaches = byGroup("coach");
  const staff = byGroup("staff");

  const nothingYet = !president && bureau.length === 0 && coaches.length === 0 && staff.length === 0;

  return (
    <PageShell
      eyebrow={m.header.eyebrow}
      titleAr={m.header.titleAr}
      titleFr={m.header.titleFr}
      intro={m.header.intro}
      crumbs={[{ label: "أعضاء النادي" }]}
    >
      <PageBody>
        {nothingYet ? (
          <div className="flex flex-col items-center justify-center rounded-[22px] border border-dashed border-royal/20 bg-white/70 px-5 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full border border-gold/30 bg-[#fdf8ec] text-royal/70">
              <KingIcon className="h-7 w-7" />
            </span>
            <p className="mt-4 font-arabic text-[14px] font-semibold text-royal-ink/80">
              لم تُنشر بعد لائحة المسؤولين
            </p>
            <p className="mt-2 max-w-[28rem] font-arabic text-[12px] leading-[1.95] text-royal-ink/55">
              ستظهر هنا بطاقات رئيس النادي والمكتب المسيّر والمدربين والطاقم التقني فور
              إضافتها من طرف النادي.
            </p>
            <span
              lang="fr"
              dir="ltr"
              className="mt-3 font-sans text-[8.5px] font-semibold uppercase tracking-[0.2em] text-royal-ink/30"
            >
              Liste non publiée
            </span>
          </div>
        ) : null}

        {/* ---------- الرئاسة ---------- */}
        {president ? (
          <section aria-labelledby="club-president">
            <SectionHeading
              id="club-president"
              titleAr={m.presidencyTitleAr}
              titleFr={m.presidencyTitleFr}
            />

            <Card className="mt-6 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
                <div className="relative border-b border-royal/10 bg-[#f8fafd] p-5 text-center sm:p-7 lg:border-b-0 lg:border-l lg:border-royal/10">
                  <div className="relative mx-auto aspect-[4/5] w-full max-w-[300px] overflow-hidden rounded-[18px] shadow-[0_26px_54px_-28px_rgba(7,31,66,0.65)] ring-1 ring-royal/12 sm:max-w-[360px]">
                    <MemberPhoto member={president} featured />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-[18px] ring-1 ring-inset ring-gold/25"
                    />
                  </div>

                  <p className="mt-4 font-arabic text-[1.05rem] font-bold text-royal-ink sm:text-[1.15rem]">
                    {president.nameAr || "—"}
                  </p>

                  {president.nameFr ? (
                    <p lang="fr" dir="ltr" className="mt-1 font-display text-[14px] text-royal-ink/45">
                      {president.nameFr}
                    </p>
                  ) : null}

                  <div className="mt-3.5 flex justify-center">
                    <span className="inline-flex items-center gap-2 rounded-full bg-royal px-4 py-1.5 font-arabic text-[12.5px] font-bold text-white shadow-[0_12px_26px_-18px_rgba(7,31,66,0.95)] sm:text-[13.5px]">
                      <KingIcon aria-hidden="true" className="h-4 w-4 text-gold-light" />
                      {president.roleAr || "رئيس النادي"}
                    </span>
                  </div>
                  {president.roleFr ? (
                    <p
                      lang="fr"
                      dir="ltr"
                      className="mt-2 font-sans text-[9px] font-semibold uppercase tracking-[0.2em] text-royal-ink/40"
                    >
                      {president.roleFr}
                    </p>
                  ) : null}
                </div>

                <div className="relative flex flex-col justify-center p-5 sm:p-7 lg:p-9">
                  <div
                    aria-hidden="true"
                    className="chessboard-surface pointer-events-none absolute -left-10 -top-10 h-[200px] w-[260px] opacity-40 [mask-image:linear-gradient(to_bottom_right,black,transparent_72%)]"
                  />

                  <div className="relative">
                    <span className="inline-flex items-center gap-2 rounded-full bg-royal/[0.07] px-3 py-1 font-arabic text-[10.5px] font-semibold text-royal">
                      <span aria-hidden="true" className="h-[5px] w-[5px] rotate-45 bg-gold" />
                      مهام الرئاسة
                    </span>

                    <h3 className="mt-3.5 font-arabic text-[1.1rem] font-bold leading-[1.6] text-royal-ink sm:text-[1.2rem]">
                      {m.presidencyIntro}
                    </h3>

                    {president.bioAr ? (
                      <p className="mt-3 font-arabic text-[13px] leading-[2.05] text-royal-ink/75 sm:text-[13.5px]">
                        {president.bioAr}
                      </p>
                    ) : null}

                    {m.presidencyTasks.length > 0 ? (
                      <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {m.presidencyTasks.map((task) => (
                          <li key={task} className="flex items-start gap-2.5">
                            <span
                              aria-hidden="true"
                              className="mt-[7px] h-[6px] w-[6px] shrink-0 rotate-45 border border-gold bg-gold/20"
                            />
                            <span className="font-arabic text-[12.5px] leading-[1.9] text-royal-ink/70">
                              {task}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <div className="mt-5 grid grid-cols-3 gap-2.5 border-t border-royal/[0.08] pt-4">
                      {[
                        { n: bureau.length, ar: "المكتب المسيّر", fr: "Bureau" },
                        { n: coaches.length, ar: "المدربون", fr: "Entraîneurs" },
                        { n: staff.length, ar: "الطاقم التقني", fr: "Staff" },
                      ].map((stat) => (
                        <div
                          key={stat.ar}
                          className="rounded-xl border border-royal/[0.08] bg-[#f8fafd] px-2.5 py-3 text-center"
                        >
                          <span className="block font-arabic text-[1.25rem] font-bold leading-none text-royal">
                            {toArabicDigits(stat.n)}
                          </span>
                          <span className="mt-1.5 block font-arabic text-[11px] font-medium text-royal-ink/70">
                            {stat.ar}
                          </span>
                          <span
                            lang="fr"
                            dir="ltr"
                            className="mt-0.5 block font-sans text-[7.5px] font-semibold uppercase tracking-[0.16em] text-royal-ink/35"
                          >
                            {stat.fr}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        ) : null}

        <PeopleGrid title="المكتب المسيّر" titleFr="Bureau dirigeant" people={bureau} top={Boolean(president)} />
        <PeopleGrid title="المدربون" titleFr="Entraîneurs" people={coaches} top />
        <PeopleGrid title="الطاقم التقني" titleFr="Staff technique" people={staff} top />

        {/* ---------- كيف تنخرط ---------- */}
        <section aria-labelledby="member-join" className="mt-12 sm:mt-14">
          <SectionHeading
            id="member-join"
            titleAr="كيف تنخرط في النادي؟"
            titleFr="Nous rejoindre"
          />

          <Card className="mt-6 p-5 sm:p-6 lg:p-7">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {[
                { step: "٠١", ar: "التعرف على النادي", text: "الاطلاع على أنشطة النادي وبرامج التكوين المتاحة." },
                { step: "٠٢", ar: "التواصل مع النادي", text: "إرسال استفسار عبر صفحة التواصل لمعرفة المستجدات." },
                { step: "٠٣", ar: "استكمال الانخراط", text: "تبقى شروط الانخراط ووثائقه رهينة بإعلان النادي عنها." },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <span className="font-display text-[1.6rem] font-semibold leading-none text-royal/25">
                    {item.step}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-arabic text-[13.5px] font-bold text-royal-ink">
                      {item.ar}
                    </span>
                    <span className="mt-1 block font-arabic text-[12px] leading-[1.9] text-royal-ink/65">
                      {item.text}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            <a
              href="#contact"
              className="group mt-6 inline-flex h-[44px] items-center justify-center gap-2.5 rounded-full bg-royal px-5 text-[12.5px] font-semibold text-white transition-all duration-300 hover:-translate-y-px hover:bg-royal-deep sm:text-[13px]"
            >
              <span>تواصل مع النادي</span>
              <ChevronLeftIcon
                aria-hidden="true"
                className="h-4 w-4 text-gold-light transition-transform duration-300 group-hover:-translate-x-0.5"
              />
            </a>
          </Card>
        </section>
      </PageBody>
    </PageShell>
  );
}

function PeopleGrid({
  title,
  titleFr,
  people,
  top,
}: {
  title: string;
  titleFr: string;
  people: TeamPerson[];
  top: boolean;
}) {
  if (people.length === 0) return null;

  return (
    <section className={top ? "mt-12 sm:mt-14" : ""}>
      <SectionHeading titleAr={title} titleFr={titleFr} note={`${toArabicDigits(people.length)}`} />
      <div className="mx-auto mt-6 grid max-w-[1100px] grid-cols-2 justify-items-center gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
        {people.map((person) => (
          <MemberCard key={person.id} member={person} />
        ))}
      </div>
    </section>
  );
}
