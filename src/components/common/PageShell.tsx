import type { ReactNode } from "react";
import CurvedBanner from "@/components/news/CurvedBanner";
import { ChevronLeftIcon } from "@/components/icons";

type Crumb = { label: string; href?: string };

type PageShellProps = {
  eyebrow: string;
  titleAr: string;
  titleFr: string;
  intro?: string;
  crumbs?: Crumb[];
  bannerExtra?: ReactNode;
  dense?: boolean;
  children: ReactNode;
};

/**
 * Shared page layout: reuses the existing curved blue banner, then renders
 * the page body on the site's parchment background.
 */
export default function PageShell({
  eyebrow,
  titleAr,
  titleFr,
  intro,
  crumbs = [],
  bannerExtra,
  dense = false,
  children,
}: PageShellProps) {
  return (
    <div className="flex flex-1 flex-col bg-[#fbf9f4]">
      <CurvedBanner dense={dense}>
        <div className="mx-auto max-w-3xl text-center">
          <nav
            aria-label="مسار التصفح"
            className="flex flex-wrap items-center justify-center gap-1.5 font-arabic text-[11px] text-white/55 sm:text-[12px]"
          >
            <a href="#accueil" className="transition-colors duration-300 hover:text-gold-light">
              الرئيسية
            </a>
            {crumbs.map((crumb) => (
              <span key={crumb.label} className="flex items-center gap-1.5">
                <ChevronLeftIcon aria-hidden="true" className="h-3.5 w-3.5 text-gold/70" />
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="transition-colors duration-300 hover:text-gold-light"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="font-medium text-white/85">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>

          <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/35 bg-white/[0.06] px-3.5 py-1.5 backdrop-blur-sm">
            <span aria-hidden="true" className="h-[6px] w-[6px] rotate-45 border border-gold bg-gold/20" />
            <span className="font-arabic text-[10.5px] font-medium tracking-wide text-gold-light sm:text-[11.5px]">
              {eyebrow}
            </span>
          </span>

          <h1 className="mt-4 text-balance font-arabic text-[1.7rem] font-bold leading-[1.42] tracking-[-0.01em] text-white sm:mt-5 sm:text-[2.15rem] lg:text-[2.45rem]">
            {titleAr}
          </h1>

          <div aria-hidden="true" className="mt-4 flex items-center justify-center gap-2.5">
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold/60 sm:w-16" />
            <span className="h-[6px] w-[6px] rotate-45 border border-gold bg-gold/25" />
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/60 sm:w-16" />
          </div>

          <p
            lang="fr"
            dir="ltr"
            className="mt-3.5 font-display text-[1.1rem] font-medium tracking-[0.01em] text-gold-light sm:text-[1.3rem] lg:text-[1.42rem]"
          >
            {titleFr}
          </p>

          {intro ? (
            <p className="mx-auto mt-3.5 max-w-xl font-arabic text-[12.5px] leading-[1.95] text-white/65 sm:mt-4 sm:text-[14px]">
              {intro}
            </p>
          ) : null}

          {bannerExtra}
        </div>
      </CurvedBanner>

      {children}
    </div>
  );
}
