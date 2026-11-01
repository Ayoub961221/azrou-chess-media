import { useEffect, useRef, type CSSProperties } from "react";
import clubLogo from "@/assets/club-logo.png?inline";
import { defaultContent, type SiteSettings } from "@/lib/content-model";
import { navigation } from "@/data/navigation";
import { ChevronLeftIcon, CloseIcon, LockIcon, MapPinIcon } from "@/components/icons";

type SideMenuProps = {
  open: boolean;
  onClose: () => void;
  settings?: SiteSettings;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function SideMenu({ open, onClose, settings }: SideMenuProps) {
  const s = settings ?? defaultContent.siteSettings;
  const CLUB_NAME_AR = s.nameAr;
  const CLUB_NAME_FR = s.nameFr;
  const CLUB_LOCATION_AR = s.locationAr;
  const CLUB_LOCATION_FR = s.locationFr;
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    }, 140);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panelRef.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]" role="presentation">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="animate-overlay-in absolute inset-0 bg-[#04101f]/60 backdrop-blur-[3px]"
      />

      <aside
        ref={panelRef}
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-menu-title"
        dir="rtl"
        className="animate-drawer-in absolute inset-y-0 left-0 flex w-[min(90vw,420px)] flex-col overflow-hidden bg-royal-deep text-white shadow-[24px_0_80px_-32px_rgba(3,14,30,0.85)] sm:w-[420px] sm:rounded-r-[28px]"
      >
        {/* Decorative background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[linear-gradient(155deg,#0c3167_0%,#08244d_48%,#051a38_100%)]" />
          <div className="drawer-chess-surface absolute -bottom-14 -left-16 h-[320px] w-[360px] opacity-40 [mask-image:linear-gradient(to_top,black,transparent)]" />
          <div className="absolute -right-24 -top-24 h-[300px] w-[300px] rounded-full border border-gold/20" />
          <div className="absolute -right-16 -top-16 h-[210px] w-[210px] rounded-full border border-white/[0.06]" />
          <div className="absolute bottom-32 left-8 h-16 w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-gold/60 via-gold/20 to-transparent" />
        </div>

        <div className="relative z-10 flex h-full min-h-0 flex-col">
          <div aria-hidden="true" className="h-[3px] w-full shrink-0 overflow-hidden bg-white/10">
            <span className="block h-full w-2/3 bg-gradient-to-l from-gold-light via-gold to-[#a98235]" />
          </div>

          {/* Drawer identity */}
          <div className="flex shrink-0 items-start justify-between gap-3 px-5 pb-5 pt-6 sm:px-7 sm:pt-7">
            <div className="flex min-w-0 items-center gap-3.5">
              <span className="grid h-[62px] w-[62px] shrink-0 place-items-center rounded-2xl bg-white p-1.5 shadow-[0_12px_30px_-14px_rgba(0,0,0,0.75)] ring-1 ring-white/40">
                <img
                  src={clubLogo}
                  alt="شعار النادي الرياضي لأزرو للشطرنج"
                  className="h-full w-full select-none object-contain"
                  draggable={false}
                />
              </span>
              <span className="flex min-w-0 flex-col">
                <span
                  id="site-menu-title"
                  className="font-arabic text-[14.5px] font-semibold leading-snug text-white"
                >
                  {CLUB_NAME_AR}
                </span>
                <span className="mt-1 font-sans text-[8.5px] font-semibold uppercase leading-relaxed tracking-[0.17em] text-gold-light/90">
                  {CLUB_NAME_FR}
                </span>
                <span className="mt-1.5 flex items-center gap-1.5 font-sans text-[9px] text-white/50">
                  <span
                    lang="zgh"
                    dir="ltr"
                    className="font-tifinagh text-[10.5px] text-white/65"
                    style={{ unicodeBidi: "isolate" }}
                  >
                    {s.tifinagh}
                  </span>
                  <span aria-hidden="true" className="text-gold/60">—</span>
                  <span className="tracking-[0.07em]">{s.tagline}</span>
                </span>
              </span>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="إغلاق القائمة"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/[0.04] text-white/80 transition duration-300 hover:border-gold/70 hover:bg-gold/10 hover:text-gold-light active:scale-95"
            >
              <CloseIcon className="h-[18px] w-[18px]" />
            </button>
          </div>

          <div aria-hidden="true" className="mx-5 h-px shrink-0 bg-gradient-to-l from-transparent via-white/15 to-transparent sm:mx-7" />

          <div className="flex shrink-0 items-center gap-2 px-5 pt-6 sm:px-7">
            <span aria-hidden="true" className="h-[5px] w-[5px] rotate-45 border border-gold/80" />
            <p className="font-arabic text-[10px] font-medium tracking-[0.16em] text-gold-light/90">
              أقسام الموقع
            </p>
            <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
            <p className="font-sans text-[7.5px] font-bold uppercase tracking-[0.28em] text-white/35">
              Navigation
            </p>
          </div>

          {/* Sections */}
          <nav
            aria-label="أقسام الموقع"
            className="drawer-scroll mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3 sm:px-4"
          >
            <ul className="m-0 list-none p-0">
              {navigation.map((item, index) => (
                <li
                  key={item.id}
                  className="drawer-item"
                  style={{ "--item-delay": `${170 + index * 45}ms` } as CSSProperties}
                >
                  <a
                    href={`#${item.id}`}
                    onClick={onClose}
                    className="group relative flex items-center gap-3 rounded-xl px-3 py-[11px] transition-colors duration-300 hover:bg-white/[0.06] sm:px-3.5"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-2 right-0 w-[2px] origin-center scale-y-0 rounded-full bg-gradient-to-b from-gold-light to-gold transition-transform duration-300 group-hover:scale-y-100 group-focus-visible:scale-y-100"
                    />
                    <span className="w-6 shrink-0 font-sans text-[9.5px] font-semibold tracking-[0.12em] text-white/25 transition-colors duration-300 group-hover:text-gold-light">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-arabic text-[15.5px] font-medium leading-snug text-white/90 transition-colors duration-300 group-hover:text-white">
                        {item.ar}
                      </span>
                      <span className="mt-0.5 font-sans text-[8.5px] font-medium uppercase tracking-[0.18em] text-white/30 transition-colors duration-300 group-hover:text-gold-light/80">
                        {item.fr}
                      </span>
                    </span>
                    <ChevronLeftIcon className="h-[17px] w-[17px] shrink-0 text-white/20 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:text-gold-light" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Drawer footer */}
          <div className="relative z-10 shrink-0 border-t border-white/10 px-5 py-4 sm:px-7 sm:py-5">
            {/* زر الدخول إلى لوحة الإدارة */}
            <a
              href="#admin"
              onClick={onClose}
              className="group mb-3 flex items-center justify-between gap-3 rounded-xl border border-gold/35 bg-white/[0.05] px-3.5 py-2.5 transition-colors duration-300 hover:border-gold/70 hover:bg-gold/10"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <LockIcon className="h-4 w-4 shrink-0 text-gold-light" />
                <span className="min-w-0">
                  <span className="block font-arabic text-[12.5px] font-semibold text-white/90">
                    لوحة الإدارة
                  </span>
                  <span
                    lang="fr"
                    dir="ltr"
                    className="block font-sans text-[8px] uppercase tracking-[0.18em] text-white/40"
                  >
                    Administration
                  </span>
                </span>
              </span>
              <ChevronLeftIcon className="h-4 w-4 shrink-0 text-white/35 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:text-gold-light" />
            </a>

            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-1.5 font-arabic text-[11px] font-medium text-white/60">
                <MapPinIcon className="h-3.5 w-3.5 text-gold/80" />
                {CLUB_LOCATION_AR}
              </span>
              <span className="font-sans text-[7.5px] font-semibold tracking-[0.26em] text-gold-light/55">
                {CLUB_LOCATION_FR}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
