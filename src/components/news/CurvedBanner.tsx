import type { ReactNode } from "react";
import {
  BishopIcon,
  KingIcon,
  KnightIcon,
  PawnIcon,
  QueenIcon,
  RookIcon,
} from "@/components/icons";
import { cn } from "@/utils/cn";

type CurvedBannerProps = {
  children: ReactNode;
  /** Slightly reduced height, used on the article page. */
  dense?: boolean;
};

export default function CurvedBanner({ children, dense = false }: CurvedBannerProps) {
  return (
    <section
      className={cn(
        "relative isolate w-full overflow-hidden bg-royal-deep text-white",
        "rounded-b-[50%_44px] sm:rounded-b-[50%_66px] lg:rounded-b-[50%_92px]"
      )}
    >
      {/* ---------- Background layers ---------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(158deg,#0d3570_0%,#09264f_46%,#061c3b_100%)]" />

        {/* chessboard motifs */}
        <div className="drawer-chess-surface absolute -left-20 bottom-0 h-[300px] w-[420px] opacity-50 [mask-image:linear-gradient(to_top_right,black,transparent_72%)]" />
        <div className="drawer-chess-surface absolute -right-16 top-0 h-[240px] w-[340px] opacity-40 [mask-image:linear-gradient(to_bottom_left,black,transparent_70%)]" />

        {/* gold rings */}
        <div className="absolute -right-24 -top-28 h-[320px] w-[320px] rounded-full border border-gold/20" />
        <div className="absolute -right-10 -top-16 h-[200px] w-[200px] rounded-full border border-white/[0.07]" />
        <div className="absolute -left-28 top-6 hidden h-[260px] w-[260px] rounded-full border border-gold/15 lg:block" />

        {/* floating chess pieces */}
        <KnightIcon className="absolute left-[6%] top-[22%] hidden h-24 w-24 text-white/[0.07] lg:block xl:h-28 xl:w-28" />
        <QueenIcon className="absolute right-[7%] top-[16%] hidden h-20 w-20 text-gold/[0.14] lg:block xl:h-24 xl:w-24" />
        <RookIcon className="absolute bottom-[12%] right-[18%] hidden h-14 w-14 text-white/[0.06] xl:block" />
        <PawnIcon className="absolute bottom-[16%] left-[20%] hidden h-12 w-12 text-white/[0.06] xl:block" />

        {/* subtle sparks */}
        <span className="absolute left-[32%] top-[14%] h-[6px] w-[6px] rotate-45 border border-gold/40" />
        <span className="absolute right-[34%] bottom-[22%] hidden h-[5px] w-[5px] rotate-45 bg-gold/35 sm:block" />

        {/* top gold accent */}
        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-gold/55 to-transparent" />
      </div>

      {/* ---------- Content ---------- */}
      <div
        className={cn(
          "relative mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-10 xl:px-14",
          dense
            ? "pb-16 pt-6 sm:pb-20 sm:pt-8 lg:pb-24 lg:pt-10"
            : "pb-20 pt-7 sm:pb-24 sm:pt-9 lg:pb-32 lg:pt-12"
        )}
      >
        {children}
      </div>

      {/* ---------- Chess piece frieze along the curve ---------- */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 flex items-end justify-center gap-5 opacity-[0.17] sm:gap-8",
          dense ? "bottom-3 sm:bottom-4" : "bottom-4 sm:bottom-6"
        )}
      >
        <PawnIcon className="h-6 w-6 sm:h-7 sm:w-7" />
        <KnightIcon className="h-7 w-7 sm:h-9 sm:w-9" />
        <BishopIcon className="hidden h-8 w-8 sm:block sm:h-10 sm:w-10" />
        <KingIcon className="h-9 w-9 sm:h-11 sm:w-11" />
        <QueenIcon className="hidden h-8 w-8 sm:block sm:h-10 sm:w-10" />
        <RookIcon className="h-7 w-7 sm:h-9 sm:w-9" />
        <PawnIcon className="hidden h-6 w-6 sm:block sm:h-7 sm:w-7" />
      </div>
    </section>
  );
}
