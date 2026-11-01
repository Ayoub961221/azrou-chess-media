import { useEffect, useState } from "react";
import { Card } from "@/components/common/Section";
import { CalendarIcon, ChevronLeftIcon, MapPinIcon } from "@/components/icons";
import type { ContactContent } from "@/lib/content-model";
import {
  computeOpenState,
  isSafeMapEmbed,
  isSafeMapLink,
  isToday,
  type OpenState,
} from "@/lib/hours";
import { cn } from "@/utils/cn";

/* ---------------- شارة مفتوح / مغلق ---------------- */

export function OpenBadge({ state }: { state: OpenState }) {
  if (state === "unknown") return null;

  const open = state === "open";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-arabic text-[10.5px] font-bold sm:text-[11px]",
        open
          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
          : "border-royal-ink/15 bg-[#f4f5f7] text-royal-ink/60"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-[7px] w-[7px] rounded-full",
          open ? "animate-pulse bg-emerald-500" : "bg-royal-ink/35"
        )}
      />
      {open ? "مفتوح الآن" : "مغلق الآن"}
    </span>
  );
}

/** يعيد حساب الحالة كل دقيقة */
export function useOpenState(contact: ContactContent): OpenState {
  const [state, setState] = useState<OpenState>(() => computeOpenState(contact.hours));

  useEffect(() => {
    const recompute = () => setState(computeOpenState(contact.hours));
    recompute();
    const timer = window.setInterval(recompute, 60_000);
    return () => window.clearInterval(timer);
  }, [contact.hours]);

  return state;
}

/* ---------------- جدول الأوقات ---------------- */

export function HoursTable({
  contact,
  compact = false,
}: {
  contact: ContactContent;
  compact?: boolean;
}) {
  const hours = contact.hours ?? [];
  if (hours.length === 0) return null;

  return (
    <div>
      <ul className="m-0 list-none space-y-1.5 p-0">
        {hours.map((row) => {
          const today = isToday(row.dayAr);
          return (
            <li
              key={row.id}
              aria-current={today ? "date" : undefined}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors",
                today
                  ? "border border-gold/45 bg-[#fdf8ec]"
                  : "border border-transparent bg-[#f9fafc]"
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                {today ? (
                  <span
                    aria-hidden="true"
                    className="h-[6px] w-[6px] shrink-0 rotate-45 bg-gold"
                  />
                ) : null}
                <span
                  className={cn(
                    "truncate font-arabic",
                    compact ? "text-[12px]" : "text-[12.5px] sm:text-[13px]",
                    today ? "font-bold text-royal" : "font-medium text-royal-ink/75"
                  )}
                >
                  {row.dayAr}
                </span>
                {today ? (
                  <span className="shrink-0 rounded-full bg-royal px-1.5 py-[1px] font-arabic text-[8.5px] font-bold text-white">
                    اليوم
                  </span>
                ) : null}
              </span>

              <span
                className={cn(
                  "shrink-0 font-arabic",
                  compact ? "text-[11.5px]" : "text-[12px] sm:text-[12.5px]",
                  row.closed
                    ? "font-semibold text-royal-ink/40"
                    : today
                      ? "font-bold text-royal"
                      : "font-medium text-royal-ink/70"
                )}
              >
                {row.closed ? "مغلق" : row.timeAr}
              </span>
            </li>
          );
        })}
      </ul>

      {contact.hoursNote ? (
        <p className="mt-3 font-arabic text-[11px] leading-[1.9] text-royal-ink/55">
          {contact.hoursNote}
        </p>
      ) : null}
    </div>
  );
}

/* ---------------- بطاقة الأوقات الكاملة ---------------- */

export function HoursCard({ contact }: { contact: ContactContent }) {
  const openState = useOpenState(contact);
  if (!contact.hours || contact.hours.length === 0) return null;

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-royal/[0.08] pb-3">
        <h3 className="inline-flex items-center gap-2 font-arabic text-[14px] font-bold text-royal-ink sm:text-[15px]">
          <CalendarIcon className="h-[17px] w-[17px] text-gold" />
          أوقات الفتح
        </h3>
        <OpenBadge state={openState} />
      </div>

      <HoursTable contact={contact} />
    </Card>
  );
}

/* ---------------- الخريطة ---------------- */

export function MapCard({ contact }: { contact: ContactContent }) {
  const embedOk = isSafeMapEmbed(contact.mapEmbedUrl ?? "");
  const linkOk = isSafeMapLink(contact.mapLinkUrl ?? "");
  const hasAddress = Boolean(contact.addressDetails?.trim());

  if (!embedOk && !linkOk && !hasAddress) return null;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-royal/[0.08] px-5 py-3.5">
        <h3 className="inline-flex items-center gap-2 font-arabic text-[14px] font-bold text-royal-ink sm:text-[15px]">
          <MapPinIcon className="h-[17px] w-[17px] text-gold" />
          مكان النادي
        </h3>
        {linkOk ? (
          <a
            href={contact.mapLinkUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex items-center gap-1.5 rounded-full bg-royal px-3.5 py-1.5 font-arabic text-[11.5px] font-semibold text-white transition-colors duration-300 hover:bg-royal-deep"
          >
            كيف تصل
            <ChevronLeftIcon
              aria-hidden="true"
              className="h-3.5 w-3.5 text-gold-light transition-transform duration-300 group-hover:-translate-x-0.5"
            />
          </a>
        ) : null}
      </div>

      {hasAddress ? (
        <p className="border-b border-royal/[0.08] px-5 py-3 font-arabic text-[12.5px] leading-[1.95] text-royal-ink/70">
          {contact.addressDetails}
        </p>
      ) : null}

      {embedOk ? (
        <iframe
          src={contact.mapEmbedUrl}
          title="خريطة موقع النادي"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="block h-[260px] w-full border-0 sm:h-[320px]"
        />
      ) : null}
    </Card>
  );
}
