import MemberPhoto from "@/components/team/MemberPhoto";
import { Card } from "@/components/common/Section";
import type { TeamPerson } from "@/lib/content-model";

/**
 * بطاقة موحّدة لكل أعضاء النادي:
 * صورة في الأعلى، ثم الاسم فالمنصب، ثم نبذة اختيارية.
 */
export default function MemberCard({ member }: { member: TeamPerson }) {
  return (
    <Card hover className="group mx-auto flex h-full w-full max-w-[290px] flex-col p-0">
      {/* الصورة */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <MemberPhoto
          member={member}
          className="transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-royal/10"
        />
      </div>

      {/* شريط ذهبي فاصل */}
      <span
        aria-hidden="true"
        className="h-[3px] w-full bg-gradient-to-l from-gold-light via-gold to-transparent opacity-80"
      />

      {/* المعلومات */}
      <div className="flex flex-1 flex-col p-4 text-center">
        {/* الاسم */}
        <p className="font-arabic text-[13.5px] font-bold text-royal-ink sm:text-[14.5px]">
          {member.nameAr || "—"}
        </p>

        {member.nameFr ? (
          <p lang="fr" dir="ltr" className="mt-0.5 font-display text-[12px] text-royal-ink/45">
            {member.nameFr}
          </p>
        ) : null}

        {/* المنصب */}
        <div className="mt-2.5 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-royal px-3 py-1 font-arabic text-[11px] font-bold text-white sm:text-[11.5px]">
            <span aria-hidden="true" className="h-[5px] w-[5px] rotate-45 bg-gold" />
            {member.roleAr}
          </span>
        </div>
        <p
          lang="fr"
          dir="ltr"
          className="mt-1.5 font-sans text-[8.5px] font-semibold uppercase tracking-[0.16em] text-royal-ink/40"
        >
          {member.roleFr}
        </p>

        {/* نبذة */}
        {member.bioAr ? (
          <p className="mt-3 border-t border-royal/[0.08] pt-3 font-arabic text-[11.5px] leading-[1.9] text-royal-ink/65">
            {member.bioAr}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
