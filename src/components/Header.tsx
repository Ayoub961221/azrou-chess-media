import { useCallback, useEffect, useRef, useState } from "react";
import clubLogo from "@/assets/clubLogo";
import { defaultContent, type SiteSettings } from "@/lib/content-model";
import { MenuIcon } from "@/components/icons";
import SideMenu from "@/components/SideMenu";
import { cn } from "@/utils/cn";

export default function Header({ settings }: { settings?: SiteSettings } = {}) {
  const s = settings ?? defaultContent.siteSettings;
  const CLUB_NAME_AR = s.nameAr;
  const CLUB_NAME_FR = s.nameFr;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openMenu = useCallback(() => setMenuOpen(true), []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    window.setTimeout(() => {
      menuButtonRef.current?.focus({ preventScroll: true });
    }, 80);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full bg-white transition-shadow duration-300",
          scrolled && "shadow-[0_16px_44px_-32px_rgba(7,31,66,0.65)]"
        )}
      >
        {/* Fine brand accent */}
        <div
          aria-hidden="true"
          className="relative h-[3px] w-full overflow-hidden bg-royal-deep"
        >
          <span className="absolute inset-y-0 right-0 w-[74px] bg-gradient-to-l from-gold-light via-gold to-[#ab8437] sm:w-[108px]" />
          <span className="absolute inset-y-0 right-[74px] w-px bg-white/20 sm:right-[108px]" />
        </div>

        <div className="mx-auto flex h-[88px] w-full max-w-[1560px] items-center justify-between gap-3 px-4 sm:h-[102px] sm:px-6 lg:h-[112px] lg:px-10 xl:px-14">
          {/* Identity — right side in RTL */}
          <a
            href="#accueil"
            aria-label={`${CLUB_NAME_AR} — ${CLUB_NAME_FR} — الصفحة الرئيسية`}
            className="group flex min-w-0 items-center gap-2.5 sm:gap-3.5 lg:gap-5"
          >
            <img
              src={clubLogo}
              alt={`شعار النادي — ${CLUB_NAME_AR}`}
              className="h-[52px] w-auto shrink-0 select-none object-contain drop-shadow-[0_3px_7px_rgba(10,43,92,0.10)] transition-transform duration-500 ease-out group-hover:scale-[1.035] sm:h-[66px] lg:h-[80px]"
              draggable={false}
            />

            <span
              aria-hidden="true"
              className="hidden h-9 w-px shrink-0 bg-gradient-to-b from-transparent via-gold/60 to-transparent sm:block lg:h-12"
            />

            <span className="flex min-w-0 flex-col items-start text-start leading-none">
              <span className="font-display text-[13.5px] font-semibold leading-[1.12] tracking-[0.004em] text-royal transition-colors duration-300 group-hover:text-royal-deep sm:text-[17px] lg:text-[21px] xl:text-[23px]">
                {CLUB_NAME_FR}
              </span>
              <span className="mt-[3px] whitespace-nowrap font-arabic text-[12px] font-semibold leading-[1.4] text-royal-ink sm:mt-1 sm:text-[13.5px] lg:text-[15.5px]">
                {CLUB_NAME_AR}
              </span>
              <span className="mt-[3px] flex items-center gap-1.5 whitespace-nowrap text-[#9a7b36] sm:mt-1.5 sm:gap-2">
                <span
                  lang="zgh"
                  dir="ltr"
                  className="font-tifinagh text-[10.5px] leading-none sm:text-[12px] lg:text-[13.5px]"
                  style={{ unicodeBidi: "isolate" }}
                >
                  {s.tifinagh}
                </span>
                <span
                  aria-hidden="true"
                  className="font-sans text-[9px] leading-none text-gold/80 sm:text-[10px]"
                >
                  —
                </span>
                <span className="font-sans text-[8px] font-semibold leading-none tracking-[0.07em] sm:text-[9px] lg:text-[10px]">
                  {s.tagline}
                </span>
              </span>
            </span>
          </a>

          {/* Menu control — left side in RTL */}
          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3.5">
            <span className="hidden select-none flex-col items-start lg:flex">
              <span className="font-arabic text-[12.5px] font-semibold leading-tight text-royal">
                القائمة
              </span>
              <span className="mt-0.5 font-sans text-[7.5px] font-bold uppercase tracking-[0.3em] text-[#a98a47]">
                Menu
              </span>
            </span>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={openMenu}
              aria-label="افتح قائمة أقسام الموقع"
              aria-haspopup="dialog"
              aria-controls="site-menu"
              aria-expanded={menuOpen}
              className="group relative grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full border border-[#dbe2ec] bg-white text-royal shadow-[0_3px_12px_-7px_rgba(7,31,66,0.55)] transition-all duration-300 hover:-translate-y-px hover:border-royal hover:bg-royal hover:text-white hover:shadow-[0_10px_22px_-12px_rgba(7,31,66,0.65)] active:translate-y-0 active:scale-[0.97] sm:h-[50px] sm:w-[50px] lg:h-[52px] lg:w-[52px]"
            >
              <MenuIcon className="h-[17px] w-[22px] sm:h-[18px] sm:w-[24px]" />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-[5px] rounded-full border border-gold/0 transition-colors duration-300 group-hover:border-gold/30"
              />
            </button>
          </div>
        </div>

        {/* Hairline base with a discreet gold mark */}
        <div
          aria-hidden="true"
          className="relative h-px w-full bg-gradient-to-l from-transparent via-[#e6dfd0] to-transparent"
        >
          <span className="absolute left-1/2 top-1/2 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gold/75 ring-2 ring-white" />
        </div>
      </header>

      <SideMenu open={menuOpen} onClose={closeMenu} settings={s} />
    </>
  );
}
