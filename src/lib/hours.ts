import type { OpeningHour } from "@/lib/content-model";

export const CLUB_TIMEZONE = "Africa/Casablanca";

/** أسماء الأيام بالعربية مرتّبة حسب getDay() (0 = الأحد) */
const DAY_NAMES = [
  ["الأحد"],
  ["الإثنين", "الاثنين"],
  ["الثلاثاء"],
  ["الأربعاء"],
  ["الخميس"],
  ["الجمعة"],
  ["السبت"],
];

/** رقم اليوم الحالي بتوقيت الدار البيضاء (0 = الأحد) */
export function currentDayIndex(now = new Date()): number {
  try {
    const name = new Intl.DateTimeFormat("en-US", {
      timeZone: CLUB_TIMEZONE,
      weekday: "short",
    }).format(now);
    const map: Record<string, number> = {
      Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
    };
    return map[name] ?? now.getDay();
  } catch {
    return now.getDay();
  }
}

/** الدقائق منذ منتصف الليل بتوقيت الدار البيضاء */
export function currentMinutes(now = new Date()): number {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: CLUB_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);
    const [h, m] = parts.split(":").map(Number);
    return h * 60 + m;
  } catch {
    return now.getHours() * 60 + now.getMinutes();
  }
}

/** هل يطابق نص اليوم اليومَ الحالي؟ */
export function isToday(dayAr: string, now = new Date()): boolean {
  const index = currentDayIndex(now);
  const needle = dayAr.trim();
  return DAY_NAMES[index].some((name) => needle.includes(name));
}

const ARABIC_DIGITS: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};

function toLatinDigits(text: string): string {
  return text.replace(/[٠-٩]/g, (d) => ARABIC_DIGITS[d] ?? d);
}

/**
 * يستخرج فترات زمنية من نص حر مثل:
 *  "16:00 – 20:00"  |  "١٦:٠٠ - ٢٠:٠٠"  |  "10:00-12:00 و 16:00-19:00"
 */
export function parseRanges(timeAr: string): { from: number; to: number }[] {
  const text = toLatinDigits(timeAr);
  const matches = text.matchAll(
    /(\d{1,2})\s*[:h.]\s*(\d{2})?\s*(?:-|–|—|إلى|الى|to)\s*(\d{1,2})\s*[:h.]\s*(\d{2})?/g
  );

  const ranges: { from: number; to: number }[] = [];
  for (const m of matches) {
    const from = Number(m[1]) * 60 + Number(m[2] ?? 0);
    const to = Number(m[3]) * 60 + Number(m[4] ?? 0);
    if (Number.isFinite(from) && Number.isFinite(to) && to > from) {
      ranges.push({ from, to });
    }
  }
  return ranges;
}

export type OpenState = "open" | "closed" | "unknown";

/**
 * يحسب هل النادي مفتوح الآن.
 * يُعيد "unknown" إذا لم تكن الأوقات قابلة للقراءة آلياً،
 * فلا نعرض شارة مضلِّلة.
 */
export function computeOpenState(hours: OpeningHour[], now = new Date()): OpenState {
  if (!hours || hours.length === 0) return "unknown";

  const today = hours.find((h) => isToday(h.dayAr, now));
  if (!today) return "unknown";
  if (today.closed) return "closed";

  const ranges = parseRanges(today.timeAr);
  if (ranges.length === 0) return "unknown";

  const minutes = currentMinutes(now);
  return ranges.some((r) => minutes >= r.from && minutes < r.to) ? "open" : "closed";
}

/** يقبل روابط خرائط Google فقط — حماية من تضمين أي موقع آخر */
export function isSafeMapEmbed(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    const allowed =
      host === "google.com" ||
      host === "www.google.com" ||
      host.endsWith(".google.com") ||
      host === "maps.google.com";
    return allowed && parsed.pathname.includes("/maps");
  } catch {
    return false;
  }
}

/** رابط "افتح في خرائط Google" — يقبل أيضاً روابط goo.gl/maps المختصرة */
export function isSafeMapLink(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    return (
      host === "goo.gl" ||
      host === "maps.app.goo.gl" ||
      host === "google.com" ||
      host === "www.google.com" ||
      host === "maps.google.com" ||
      host.endsWith(".google.com")
    );
  } catch {
    return false;
  }
}
