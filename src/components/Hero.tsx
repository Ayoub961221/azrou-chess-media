import { ChevronLeftIcon, KnightIcon, MapPinIcon } from "@/components/icons";
import { defaultContent, type HomeContent } from "@/lib/content-model";

export default function Hero({ home }: { home?: HomeContent } = {}) {
  const h = home ?? defaultContent.homePage;
  const heroImage = h.image?.url ?? null;
  const imgWidth = h.image?.width ?? 1200;
  const imgHeight = h.image?.height ?? 900;
  const CLUB_NAME_FR = h.titleFr;
  const CLUB_LOCATION_AR = defaultContent.siteSettings.locationAr;
  return (
    <section
      id="accueil"
      aria-labelledby="hero-title"
      className="relative isolate w-full overflow-hidden border-b border-royal/10 bg-[#fbf9f4]"
    >
      {/* Soft brand atmosphere */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_86%_8%,#e9f1fb_0%,rgba(251,249,244,0)_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_4%_92%,#f6eedb_0%,rgba(251,249,244,0)_46%)]" />

        <div className="chessboard-surface absolute -bottom-24 -left-20 h-[360px] w-[520px] opacity-50 [mask-image:linear-gradient(to_top_right,black,transparent_76%)]" />

        <span className="absolute -right-28 -top-20 hidden h-[300px] w-[300px] rounded-full border border-gold/15 lg:block" />
        <span className="absolute -right-16 top-[-32px] hidden h-[196px] w-[196px] rounded-full border border-royal/[0.06] lg:block" />
        <span className="absolute right-[9%] top-10 hidden h-[6px] w-[6px] rotate-45 border border-gold/50 lg:block" />

        <span className="absolute -bottom-[3.2rem] right-0 hidden select-none font-display text-[clamp(6rem,13vw,11rem)] font-semibold uppercase leading-none tracking-[0.06em] text-royal/[0.035] lg:block">
          Échecs
        </span>
      </div>

      <div className="mx-auto grid w-full max-w-[1560px] grid-cols-1 items-center gap-9 px-4 pb-11 pt-8 sm:gap-10 sm:px-6 sm:pb-14 sm:pt-10 lg:min-h-[calc(100svh-120px)] lg:grid-cols-[1.02fr_1fr] lg:gap-12 lg:px-10 lg:py-12 xl:gap-16 xl:px-14">
        {/* Text — right side in RTL */}
        <div className="min-w-0 max-w-[42rem] lg:justify-self-start">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-gold/30 bg-white/80 px-3.5 py-1.5 shadow-[0_4px_16px_-14px_rgba(7,31,66,0.5)] backdrop-blur-sm">
            <span
              aria-hidden="true"
              className="h-[6px] w-[6px] shrink-0 rotate-45 border border-gold bg-gold/10"
            />
            <span className="font-arabic text-[10.5px] font-medium leading-none tracking-wide text-royal/80 sm:text-[11.5px]">
              {h.badgeAr}
            </span>
          </div>

          <h1
            id="hero-title"
            className="mt-5 font-arabic text-[1.9rem] font-bold leading-[1.34] tracking-[-0.012em] text-royal-ink sm:mt-6 sm:text-[2.35rem] lg:text-[2.55rem] xl:text-[2.9rem]"
          >
            <span className="mb-1 block text-[0.6em] font-medium leading-[1.5] tracking-normal text-royal/65 sm:mb-1.5">
              {h.welcomeAr}
            </span>{" "}
            <span className="block text-balance">{h.titleAr}</span>
          </h1>

          <div className="mt-3 flex items-center gap-3 sm:mt-4">
            <span aria-hidden="true" className="h-px w-8 shrink-0 bg-gold/70 sm:w-10" />
            <p className="font-display text-[1.14rem] font-medium leading-snug tracking-[0.005em] text-royal sm:text-[1.38rem] lg:text-[1.5rem]">
              {CLUB_NAME_FR}
            </p>
          </div>

          <p className="mt-4 max-w-[34rem] font-arabic text-[13.5px] leading-[1.95] text-royal-ink/70 sm:mt-5 sm:text-[15px] sm:leading-[2]">
            {h.descriptionAr}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:mt-8 sm:gap-3">
            <a
              href={h.primaryCtaHref}
              className="group inline-flex h-[47px] items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-royal px-4 text-[13px] font-semibold text-white shadow-[0_16px_32px_-20px_rgba(7,31,66,0.95)] ring-1 ring-royal/20 transition-all duration-300 hover:-translate-y-px hover:bg-royal-deep hover:shadow-[0_20px_36px_-20px_rgba(7,31,66,0.9)] active:translate-y-0 sm:h-[50px] sm:gap-3 sm:px-6 sm:text-sm"
            >
              <span>{h.primaryCtaAr}</span>
              <span
                aria-hidden="true"
                className="grid h-[22px] w-[22px] place-items-center rounded-full bg-white/[0.08] text-gold-light ring-1 ring-gold-light/30 transition-colors duration-300 group-hover:bg-gold group-hover:text-royal-deep group-hover:ring-gold sm:h-6 sm:w-6"
              >
                <ChevronLeftIcon className="h-3.5 w-3.5" />
              </span>
            </a>

            <a
              href="#inscription"
              className="group inline-flex h-[47px] items-center justify-center gap-2.5 whitespace-nowrap rounded-full border border-gold bg-[#fdf8ec] px-4 text-[13px] font-bold text-[#7a6026] shadow-[0_12px_26px_-20px_rgba(122,96,38,0.9)] transition-all duration-300 hover:-translate-y-px hover:bg-gold hover:text-royal-deep active:translate-y-0 sm:h-[50px] sm:px-6 sm:text-sm"
            >
              <span aria-hidden="true" className="h-[6px] w-[6px] rotate-45 bg-current" />
              <span>سجّل الآن</span>
            </a>

            <a
              href={h.secondaryCtaHref}
              className="inline-flex h-[47px] items-center justify-center gap-2.5 whitespace-nowrap rounded-full border border-royal/15 bg-white px-4 text-[13px] font-semibold text-royal shadow-[0_10px_24px_-22px_rgba(7,31,66,0.8)] transition-all duration-300 hover:-translate-y-px hover:border-gold/70 hover:bg-[#fffdf8] active:translate-y-0 sm:h-[50px] sm:px-6 sm:text-sm"
            >
              <span aria-hidden="true" className="h-[6px] w-[6px] rotate-45 border border-gold bg-gold/15" />
              <span>{h.secondaryCtaAr}</span>
            </a>
          </div>
        </div>

        {/* Club activity photograph — left side in RTL */}
        <figure className="relative m-0 min-w-0 lg:justify-self-end">
          <span
            aria-hidden="true"
            className="absolute inset-0 hidden translate-x-3.5 translate-y-3.5 rounded-[26px] border border-gold/45 sm:block"
          />

          <div className="relative overflow-hidden rounded-[22px] bg-royal-deep shadow-[0_34px_70px_-38px_rgba(7,31,66,0.7)] ring-1 ring-royal/10 sm:rounded-[24px]">
            {heroImage ? (
              <img
                src={heroImage}
                alt={h.imageAlt}
                width={imgWidth}
                height={imgHeight}
                loading="eager"
                decoding="async"
                draggable={false}
                className="aspect-[4/3] w-full select-none object-cover object-center sm:aspect-[16/11] lg:aspect-[6/5] lg:max-h-[560px]"
              />
            ) : (
              <div className="chessboard-surface grid aspect-[4/3] w-full place-items-center bg-[linear-gradient(155deg,#0c3167_0%,#08244d_52%,#051a38_100%)] sm:aspect-[16/11] lg:aspect-[6/5] lg:max-h-[560px]">
                <div className="flex flex-col items-center gap-3 px-6 text-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full border border-gold/35 bg-white/[0.06] text-gold-light">
                    <KnightIcon className="h-9 w-9" />
                  </span>
                  <p className="font-arabic text-[13px] font-semibold text-white/80">
                    لم تُضَف صورة بعد
                  </p>
                  <p className="max-w-[18rem] font-arabic text-[11.5px] leading-relaxed text-white/45">
                    ارفع صورة القسم الرئيسي من لوحة الإدارة لتظهر هنا.
                  </p>
                </div>
              </div>
            )}

            {heroImage ? (
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#03132a]/80 via-[#04182f]/10 to-transparent"
              />
            ) : null}

            <div className="absolute inset-x-4 top-4 sm:inset-x-5 sm:top-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 font-sans text-[8px] font-bold uppercase tracking-[0.2em] text-royal shadow-sm backdrop-blur-sm sm:text-[9px]">
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-gold" />
                {h.badgeLatin}
              </span>
            </div>

            <figcaption className="absolute inset-x-0 bottom-0 p-3.5 sm:p-5">
              <div className="flex items-end justify-between gap-2.5">
                <div className="min-w-0">
                  <p className="font-arabic text-[12px] font-semibold leading-snug text-white sm:text-[14px]">
                    {h.captionAr}
                  </p>
                  <p className="mt-0.5 font-display text-[11px] tracking-wide text-white/65 sm:mt-1 sm:text-[12.5px]">
                    {h.captionFr}
                  </p>
                </div>

                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2 py-1 font-arabic text-[9.5px] font-medium text-white/90 backdrop-blur-md sm:gap-2 sm:px-3 sm:py-1.5 sm:text-[11px]">
                  <MapPinIcon className="h-[11px] w-[11px] text-gold-light sm:h-3 sm:w-3" />
                  {CLUB_LOCATION_AR}
                </span>
              </div>
            </figcaption>
          </div>

          <span
            aria-hidden="true"
            className="absolute -bottom-[7px] -left-[7px] h-8 w-8 rounded-bl-[18px] border-b-2 border-l-2 border-gold/70 sm:h-10 sm:w-10"
          />
        </figure>
      </div>
    </section>
  );
}
