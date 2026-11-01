const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toArabicDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => AR_DIGITS[Number(d)]);
}

const AR_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "ماي",
  "يونيو",
  "يوليوز",
  "غشت",
  "شتنبر",
  "أكتوبر",
  "نونبر",
  "دجنبر",
];

export function formatArabicDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${toArabicDigits(date.getDate())} ${AR_MONTHS[date.getMonth()]} ${toArabicDigits(
    date.getFullYear()
  )}`;
}

export function formatFrenchDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return iso;
  }
}

/** يقسّم نصاً طويلاً إلى فقرات */
export function toParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** يقسّم نصاً مفصولاً بفواصل إلى عناصر */
export function splitList(text: string): string[] {
  return text
    .split(/[،,]/)
    .map((p) => p.trim())
    .filter(Boolean);
}
