import PageShell from "@/components/common/PageShell";
import { Card, PageBody, SectionHeading } from "@/components/common/Section";
import { CalendarIcon, KingIcon, QueenIcon, RookIcon } from "@/components/icons";
import { defaultContent, type TournamentsContent } from "@/lib/content-model";
import { toArabicDigits } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  upcoming: "border-royal/20 bg-royal/[0.06] text-royal",
  ongoing: "border-gold/45 bg-[#fdf8ec] text-[#8a6d26]",
  done: "border-royal-ink/15 bg-[#f4f5f7] text-royal-ink/60",
};

const STATUS_LABEL: Record<string, string> = {
  upcoming: "قادمة",
  ongoing: "جارية",
  done: "منتهية",
};

export default function TournamentsPage({ data }: { data?: TournamentsContent } = {}) {
  const t = data ?? defaultContent.tournaments;
  const items = t.items.filter((item) => item.published);
  const standings = [...t.standings].sort((a, b) => a.rank - b.rank);

  return (
    <PageShell
      eyebrow={t.header.eyebrow}
      titleAr={t.header.titleAr}
      titleFr={t.header.titleFr}
      intro={t.header.intro}
      crumbs={[{ label: "البطولات والدورات" }]}
    >
      <PageBody>
        {/* ---------- Tournaments ---------- */}
        <section aria-labelledby="tournaments-list">
          <SectionHeading
            id="tournaments-list"
            titleAr={t.tournamentsTitleAr}
            titleFr={t.tournamentsTitleFr}
            note={items.length > 0 ? toArabicDigits(items.length) : undefined}
          />

          {items.length === 0 ? (
            <EmptyBlock
              icon={<RookIcon className="h-7 w-7" />}
              title="لا توجد دورات منشورة"
              text={t.emptyTournaments}
              fr="Aucun tournoi publié"
            />
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {items.map((tournament) => (
                <Card key={tournament.id} hover className="flex flex-col p-5">
                  <div className="flex items-start justify-between gap-2.5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/30 bg-[#fdf8ec] text-royal">
                      <RookIcon className="h-6 w-6" />
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-arabic text-[10px] font-semibold ${STATUS_STYLES[tournament.status]}`}
                    >
                      {STATUS_LABEL[tournament.status]}
                    </span>
                  </div>

                  <h3 className="mt-3.5 font-arabic text-[14.5px] font-bold leading-snug text-royal-ink sm:text-[15.5px]">
                    {tournament.titleAr}
                  </h3>
                  {tournament.titleFr ? (
                    <p lang="fr" dir="ltr" className="mt-0.5 font-display text-[12px] text-royal-ink/45">
                      {tournament.titleFr}
                    </p>
                  ) : null}

                  <dl className="mt-4 space-y-2 border-t border-royal/[0.08] pt-3.5">
                    {tournament.formatAr ? (
                      <Row label="النظام" value={tournament.formatAr} />
                    ) : null}
                    {tournament.roundsAr ? (
                      <Row label="الجولات" value={tournament.roundsAr} />
                    ) : null}
                    <div className="flex items-center justify-between gap-3">
                      <dt className="inline-flex items-center gap-1.5 font-arabic text-[11.5px] text-royal-ink/55">
                        <CalendarIcon className="h-[14px] w-[14px] text-gold" />
                        التاريخ
                      </dt>
                      <dd className="font-arabic text-[11.5px] font-medium text-royal-ink/70">
                        {tournament.dateAr || "لم يُحدَّد بعد"}
                      </dd>
                    </div>
                  </dl>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* ---------- Standings ---------- */}
        <section aria-labelledby="standings" className="mt-12 sm:mt-14">
          <SectionHeading
            id="standings"
            titleAr={t.standingsTitleAr}
            titleFr={t.standingsTitleFr}
            note={standings.length > 0 ? toArabicDigits(standings.length) : undefined}
          />

          {standings.length === 0 ? (
            <EmptyBlock
              icon={<KingIcon className="h-7 w-7" />}
              title="لا توجد نتائج منشورة"
              text={t.emptyStandings}
              fr="Aucun résultat officiel"
            />
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-7">
              <Card className="overflow-hidden">
                <div className="border-b border-royal/10 bg-[#f9fafc] px-4 py-3 sm:px-5">
                  <h3 className="font-arabic text-[13.5px] font-bold text-royal-ink sm:text-[14.5px]">
                    ترتيب المشاركين
                  </h3>
                </div>

                <div className="hidden sm:block">
                  <table className="w-full border-collapse text-right">
                    <caption className="sr-only">جدول ترتيب المشاركين</caption>
                    <thead>
                      <tr className="bg-royal-deep text-white">
                        {["الرتبة", "اللاعب", "المباريات", "النقط"].map((h) => (
                          <th key={h} scope="col" className="px-4 py-2.5 font-arabic text-[11.5px] font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-royal/[0.07] transition-colors duration-200 last:border-0 hover:bg-[#fdf8ec]/60"
                        >
                          <td className="px-4 py-3">
                            <RankBadge rank={row.rank} />
                          </td>
                          <td className="px-4 py-3 font-arabic text-[13px] font-medium text-royal-ink/85">
                            {row.playerAr}
                          </td>
                          <td className="px-4 py-3 font-arabic text-[12.5px] text-royal-ink/60">
                            {row.playedAr}
                          </td>
                          <td className="px-4 py-3 font-arabic text-[13px] font-bold text-royal">
                            {row.pointsAr}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <ul className="divide-y divide-royal/[0.07] sm:hidden">
                  {standings.map((row) => (
                    <li key={row.id} className="flex items-center gap-3 px-4 py-3">
                      <RankBadge rank={row.rank} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-arabic text-[13px] font-medium text-royal-ink/85">
                          {row.playerAr}
                        </span>
                        <span className="block font-arabic text-[11px] text-royal-ink/50">
                          المباريات: {row.playedAr}
                        </span>
                      </span>
                      <span className="shrink-0 font-arabic text-[13.5px] font-bold text-royal">
                        {row.pointsAr}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-5 sm:p-6">
                <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/30 bg-[#fdf8ec] text-royal">
                  <QueenIcon className="h-6 w-6" />
                </span>
                <h3 className="mt-3.5 font-arabic text-[14px] font-bold text-royal-ink sm:text-[15px]">
                  كيف تُحتسب النقط؟
                </h3>
                <ul className="mt-3 space-y-2">
                  {[
                    { label: "فوز", value: "١ نقطة" },
                    { label: "تعادل", value: "٠٫٥ نقطة" },
                    { label: "هزيمة", value: "٠ نقطة" },
                  ].map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center justify-between gap-3 rounded-xl bg-[#f9fafc] px-3 py-2"
                    >
                      <span className="font-arabic text-[12.5px] text-royal-ink/70">{item.label}</span>
                      <span className="font-arabic text-[12.5px] font-bold text-royal">{item.value}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 font-arabic text-[11.5px] leading-[1.9] text-royal-ink/55">
                  نظام احتساب عام معتمد في الشطرنج.
                </p>
              </Card>
            </div>
          )}
        </section>
      </PageBody>
    </PageShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="font-arabic text-[11.5px] text-royal-ink/55">{label}</dt>
      <dd className="font-arabic text-[12px] font-semibold text-royal-ink/85">{value}</dd>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={`inline-grid h-8 w-8 shrink-0 place-items-center rounded-full font-sans text-[12px] font-bold sm:h-7 sm:w-7 sm:text-[11.5px] ${
        rank === 1
          ? "bg-gold text-royal-deep"
          : rank <= 3
            ? "bg-royal/10 text-royal"
            : "bg-[#f1f3f6] text-royal-ink/55"
      }`}
    >
      {rank}
    </span>
  );
}

function EmptyBlock({
  icon,
  title,
  text,
  fr,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  fr: string;
}) {
  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-[22px] border border-dashed border-royal/20 bg-white/70 px-5 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full border border-gold/30 bg-[#fdf8ec] text-royal/70">
        {icon}
      </span>
      <p className="mt-4 font-arabic text-[14px] font-semibold text-royal-ink/80">{title}</p>
      <p className="mt-2 max-w-[28rem] font-arabic text-[12px] leading-[1.95] text-royal-ink/55">
        {text}
      </p>
      <span
        lang="fr"
        dir="ltr"
        className="mt-3 font-sans text-[8.5px] font-semibold uppercase tracking-[0.2em] text-royal-ink/30"
      >
        {fr}
      </span>
    </div>
  );
}
