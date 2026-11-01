import type { ReactNode } from "react";
import { InfoIcon } from "@/components/icons";
import { cn } from "@/utils/cn";

/* ---------- Page container ---------- */

export function PageBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1560px] px-4 pb-14 pt-8 sm:px-6 sm:pt-10 lg:px-10 lg:pb-20 lg:pt-12 xl:px-14",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ---------- Section heading ---------- */

type SectionHeadingProps = {
  id?: string;
  titleAr: string;
  titleFr: string;
  note?: string;
  className?: string;
};

export function SectionHeading({
  id,
  titleAr,
  titleFr,
  note,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-royal/10 pb-3.5",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span aria-hidden="true" className="h-[7px] w-[7px] shrink-0 rotate-45 border border-gold bg-gold/15" />
        <h2
          id={id}
          className="font-arabic text-[1.05rem] font-bold text-royal-ink sm:text-[1.2rem]"
        >
          {titleAr}
        </h2>
        {note ? (
          <span className="rounded-full bg-royal/[0.06] px-2 py-[3px] font-arabic text-[10px] font-semibold text-royal/70 sm:text-[11px]">
            {note}
          </span>
        ) : null}
      </div>

      <p
        lang="fr"
        dir="ltr"
        className="font-sans text-[9.5px] font-semibold uppercase tracking-[0.22em] text-royal-ink/40 sm:text-[10.5px]"
      >
        {titleFr}
      </p>
    </div>
  );
}

/* ---------- Demo / placeholder badge ---------- */

export function DemoBadge({ label = "بيانات تجريبية" }: { label?: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gold/45 bg-[#fdf8ec] px-2 py-[3px] font-arabic text-[9.5px] font-semibold text-[#8a6d26] sm:text-[10px]">
      <span aria-hidden="true" className="h-[5px] w-[5px] rotate-45 bg-gold" />
      {label}
    </span>
  );
}

/* ---------- Inline notice ---------- */

export function Notice({
  children,
  tone = "gold",
}: {
  children: ReactNode;
  tone?: "gold" | "royal";
}) {
  if (tone === "royal") {
    return (
      <div className="relative overflow-hidden rounded-[18px] border border-royal/10 bg-royal-deep p-4 text-white sm:p-5">
        <div
          aria-hidden="true"
          className="drawer-chess-surface pointer-events-none absolute -bottom-10 -left-10 h-[170px] w-[210px] opacity-40 [mask-image:linear-gradient(to_top_right,black,transparent_72%)]"
        />
        <div className="relative flex items-start gap-3">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-gold-light">
            <InfoIcon className="h-[18px] w-[18px]" />
          </span>
          <p className="font-arabic text-[12px] leading-[2] text-white/75 sm:text-[12.5px]">
            {children}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-[18px] border border-gold/35 bg-[#fdf8ec] p-4 sm:p-5">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold/20 text-[#8a6d26]">
        <InfoIcon className="h-[18px] w-[18px]" />
      </span>
      <p className="font-arabic text-[12px] font-medium leading-[2] text-[#6f5720] sm:text-[13px]">
        {children}
      </p>
    </div>
  );
}

/* ---------- Generic white card ---------- */

export function Card({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] border border-royal/10 bg-white shadow-[0_18px_44px_-34px_rgba(7,31,66,0.5)]",
        hover &&
          "transition-all duration-500 hover:-translate-y-1 hover:border-gold/45 hover:shadow-[0_30px_58px_-32px_rgba(7,31,66,0.55)]",
        className
      )}
    >
      {children}
    </div>
  );
}
