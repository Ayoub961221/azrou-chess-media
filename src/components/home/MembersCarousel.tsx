import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import MemberPhoto from "@/components/team/MemberPhoto";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import type { MembersContent, TeamGroup, TeamPerson } from "@/lib/content-model";
import { cn } from "@/utils/cn";

const GROUP_ORDER: Record<TeamGroup, number> = {
  president: 0,
  bureau: 1,
  coach: 2,
  staff: 3,
};

const AUTOPLAY_MS = 4000;

function sortPeople(people: TeamPerson[]): TeamPerson[] {
  return people
    .filter((p) => p.published)
    .sort((a, b) => {
      const g = GROUP_ORDER[a.group] - GROUP_ORDER[b.group];
      if (g !== 0) return g;
      return (a.order ?? 0) - (b.order ?? 0);
    });
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function MembersCarousel({ members }: { members: MembersContent }) {
  const people = useMemo(() => sortPeople(members.people ?? []), [members.people]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [perView, setPerView] = useState(1);
  const [reduced, setReduced] = useState(false);
  const dragRef = useRef<{ x: number; active: boolean }>({ x: 0, active: false });

  /* عدد الشرائح حسب عرض الشاشة */
  useEffect(() => {
    const apply = () => setPerView(window.innerWidth >= 1024 ? 3 : 1);
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  /* احترام تفضيل تقليل الحركة */
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  const total = people.length;
  const canMove = total > 1;

  const go = useCallback(
    (delta: number) => {
      if (total === 0) return;
      setIndex((i) => (i + delta + total) % total);
    },
    [total]
  );

  /* التشغيل التلقائي */
  useEffect(() => {
    if (!canMove || paused || reduced || prefersReducedMotion()) return;
    const timer = window.setInterval(() => go(1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [canMove, paused, reduced, go]);

  if (total === 0) return null;

  /* ترتيب الشرائح الظاهرة: الأوسط هو الحالي على الشاشات الكبيرة */
  const visible: { person: TeamPerson; slot: number; key: string }[] = [];
  if (perView === 1) {
    visible.push({ person: people[index], slot: 0, key: `${people[index].id}-0` });
  } else {
    for (let offset = -1; offset <= 1; offset += 1) {
      const i = (index + offset + total) % total;
      visible.push({ person: people[i], slot: offset, key: `${people[i].id}-${offset}` });
    }
  }

  function onPointerDown(event: ReactPointerEvent) {
    dragRef.current = { x: event.clientX, active: true };
    setPaused(true);
  }

  function onPointerUp(event: ReactPointerEvent) {
    if (!dragRef.current.active) return;
    const dx = event.clientX - dragRef.current.x;
    dragRef.current.active = false;
    setPaused(false);
    if (Math.abs(dx) > 45 && canMove) {
      // RTL: السحب نحو اليمين يُظهر السابق
      go(dx > 0 ? -1 : 1);
    }
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        role="group"
        aria-roledescription="عرض متحرك"
        aria-label="أعضاء النادي ومسؤولوه"
        className="overflow-hidden px-1 py-2 touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          dragRef.current.active = false;
          setPaused(false);
        }}
      >
        <div
          className={cn(
            "flex items-center justify-center gap-4 sm:gap-5",
            perView === 3 && "lg:gap-7"
          )}
        >
          {visible.map(({ person, slot, key }) => (
            <Slide
              key={key}
              person={person}
              featured={perView === 1 || slot === 0}
              hidden={perView === 3 && slot !== 0}
            />
          ))}
        </div>
      </div>

      {/* أزرار التنقل */}
      {canMove ? (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="العضو السابق"
            className="grid h-10 w-10 place-items-center rounded-full border border-royal/15 bg-white text-royal shadow-[0_6px_16px_-12px_rgba(7,31,66,0.6)] transition-all duration-300 hover:-translate-y-px hover:border-gold/70 hover:bg-[#fffdf8]"
          >
            <ChevronRightIcon className="h-[18px] w-[18px]" />
          </button>

          <ul
            className="m-0 flex list-none items-center gap-1.5 p-0"
            aria-label="الانتقال بين الأعضاء"
          >
            {people.map((person, i) => (
              <li key={person.id}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`عرض ${person.nameAr || person.roleAr || `العضو ${i + 1}`}`}
                  aria-current={i === index ? "true" : undefined}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === index ? "w-5 bg-gold" : "w-2 bg-royal/20 hover:bg-royal/40"
                  )}
                />
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => go(1)}
            aria-label="العضو التالي"
            className="grid h-10 w-10 place-items-center rounded-full border border-royal/15 bg-white text-royal shadow-[0_6px_16px_-12px_rgba(7,31,66,0.6)] transition-all duration-300 hover:-translate-y-px hover:border-gold/70 hover:bg-[#fffdf8]"
          >
            <ChevronLeftIcon className="h-[18px] w-[18px]" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Slide({
  person,
  featured,
  hidden,
}: {
  person: TeamPerson;
  featured: boolean;
  hidden: boolean;
}) {
  return (
    <article
      aria-hidden={hidden ? undefined : undefined}
      className={cn(
        "relative flex shrink-0 flex-col overflow-hidden rounded-[20px] border bg-white transition-all duration-500 ease-out",
        featured
          ? "w-[270px] border-gold/40 shadow-[0_26px_54px_-30px_rgba(7,31,66,0.55)] sm:w-[300px]"
          : "hidden w-[220px] border-royal/10 opacity-60 shadow-[0_14px_34px_-28px_rgba(7,31,66,0.45)] lg:flex lg:scale-[0.92]"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-[3px] w-full bg-gradient-to-l from-gold-light via-gold to-transparent",
          featured ? "opacity-90" : "opacity-40"
        )}
      />

      <div className={cn("relative w-full overflow-hidden", featured ? "aspect-[4/5]" : "aspect-[4/5]")}>
        <MemberPhoto member={person} featured={featured} />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-royal/10"
        />
      </div>

      <div className="flex flex-1 flex-col p-4 text-center">
        <p
          className={cn(
            "font-arabic font-bold text-royal-ink",
            featured ? "text-[14.5px] sm:text-[15.5px]" : "text-[13px]"
          )}
        >
          {person.nameAr || "—"}
        </p>

        {person.nameFr ? (
          <p lang="fr" dir="ltr" className="mt-0.5 font-display text-[11.5px] text-royal-ink/45">
            {person.nameFr}
          </p>
        ) : null}

        {person.roleAr ? (
          <div className="mt-2.5 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-[#fdf8ec] px-3 py-1 font-arabic text-[11px] font-bold text-[#8a6d26]">
              <span aria-hidden="true" className="h-[5px] w-[5px] rotate-45 bg-gold" />
              {person.roleAr}
            </span>
          </div>
        ) : null}

        {featured && person.bioAr ? (
          <p className="mt-3 border-t border-royal/[0.08] pt-3 font-arabic text-[11.5px] leading-[1.9] text-royal-ink/65">
            {person.bioAr}
          </p>
        ) : null}
      </div>
    </article>
  );
}
