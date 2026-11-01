/**
 * نموذج محتوى الموقع.
 *
 * القاعدة: النصوص الثابتة التي تُعدّ جزءاً من التصميم لها قيم افتراضية هنا
 * (حتى لا تظهر الصفحة فارغة أثناء التحميل أو عند انقطاع الاتصال)،
 * أما كل البيانات الواقعية (أخبار، أعضاء، مدربون، بطولات، نتائج، صور
 * المعرض، معلومات التواصل) فتبدأ **فارغة** وتُملأ من لوحة الإدارة فقط.
 * لا توجد أي بيانات تجريبية أو أسماء وهمية في هذا الملف.
 */

/* ---------------- الوسائط ---------------- */

export type MediaRef = {
  /** الرابط العام للصورة (R2 public URL) */
  url: string;
  /** نسخ أصغر — R2 لا يولّدها، فهي نفس الرابط */
  thumbUrl?: string;
  mediumUrl?: string;
  /** مفتاح الملف في R2 (images/…) — يُستعمل للحذف */
  publicId?: string;
  /** alias صريح لمفتاح R2 في سجل الوسائط */
  imageKey?: string;
  /** صيغة الملف (webp، jpg…) */
  format?: string;
  fileName?: string;
  contentType?: string;
  width?: number;
  height?: number;
  size?: number;
  updatedAt?: number;

  /* ---- حقول قديمة: تبقى للتوافق مع الصور المحفوظة سابقاً ---- */
  /** @deprecated صفحة حذف ImgBB */
  deleteUrl?: string;
  /** @deprecated معرّف ImgBB */
  imgbbId?: string;
  /** @deprecated مسار Firebase Storage */
  storagePath?: string;
};

/** سجل وسيط في content/media */
export type MediaRecord = {
  id: string;
  provider: "github";
  url: string;
  path: string;
  repo: string;
  branch: string;
  fileName: string;
  contentType: string;
  size: number;
  folder: string;
  createdAt: number;
  updatedAt: number;
};

/* ---------------- الإعدادات العامة ---------------- */

export type SiteSettings = {
  nameAr: string;
  nameFr: string;
  tifinagh: string;
  tagline: string;
  locationAr: string;
  locationFr: string;
  /** اسم مستودع GitHub الذي تُحفظ فيه الصور */
  githubRepo: string;
  /** عنوان خدمة الرفع/الحذف (Cloudflare Worker) — يُقرأ وقت التشغيل */
  mediaDeleteEndpoint: string;
};

/* ---------------- الصفحة الرئيسية ---------------- */

export type HomeContent = {
  badgeAr: string;
  welcomeAr: string;
  titleAr: string;
  titleFr: string;
  descriptionAr: string;
  primaryCtaAr: string;
  primaryCtaHref: string;
  secondaryCtaAr: string;
  secondaryCtaHref: string;
  image: MediaRef | null;
  imageAlt: string;
  captionAr: string;
  captionFr: string;
  badgeLatin: string;
};

/* ---------------- ترويسة صفحة ---------------- */

export type PageHeader = {
  eyebrow: string;
  titleAr: string;
  titleFr: string;
  intro: string;
};

/* ---------------- صفحة من نحن ---------------- */

export type LabeledItem = {
  id: string;
  ar: string;
  fr: string;
  text: string;
};

export type AboutContent = {
  header: PageHeader;
  sectionTitleAr: string;
  sectionTitleFr: string;
  paragraph1: string;
  paragraph2: string;
  photo: MediaRef | null;
  photoCaptionAr: string;
  photoCaptionFr: string;
  objectives: LabeledItem[];
  activities: LabeledItem[];
  recordsNotice: string;
};

/* ---------------- الأخبار ---------------- */

/** صورة داخل ألبوم الخبر */
export type NewsPhoto = {
  id: string;
  media: MediaRef;
  captionAr: string;
};

/** أقصى عدد صور في ألبوم الخبر الواحد */
export const MAX_NEWS_PHOTOS = 5;

export type NewsItem = {
  id: string;
  titleAr: string;
  categoryAr: string;
  categoryFr: string;
  dateISO: string;
  excerptAr: string;
  bodyAr: string;
  /** الصورة الرئيسية — تظهر في البطاقات والصفحة الرئيسية */
  image: MediaRef | null;
  imageAlt: string;
  /** ألبوم صور إضافية (حتى ٥) يظهر داخل صفحة الخبر */
  gallery: NewsPhoto[];
  published: boolean;
  createdAt: number;
  updatedAt: number;
};

export type NewsContent = {
  header: PageHeader;
  listTitleAr: string;
  listTitleFr: string;
  emptyMessage: string;
  items: NewsItem[];
};

/* ---------------- الأعضاء والمدربون ---------------- */

export type TeamGroup = "president" | "bureau" | "coach" | "staff";

export type TeamPerson = {
  id: string;
  nameAr: string;
  nameFr: string;
  roleAr: string;
  roleFr: string;
  bioAr: string;
  photo: MediaRef | null;
  group: TeamGroup;
  order: number;
  published: boolean;
};

export type MembersContent = {
  header: PageHeader;
  presidencyTitleAr: string;
  presidencyTitleFr: string;
  presidencyIntro: string;
  presidencyTasks: string[];
  people: TeamPerson[];
};

/* ---------------- البطولات والنتائج ---------------- */

export type TournamentStatus = "upcoming" | "ongoing" | "done";

export type Tournament = {
  id: string;
  titleAr: string;
  titleFr: string;
  formatAr: string;
  roundsAr: string;
  dateAr: string;
  status: TournamentStatus;
  published: boolean;
  order: number;
};

export type StandingRow = {
  id: string;
  rank: number;
  playerAr: string;
  playedAr: string;
  pointsAr: string;
};

export type TournamentsContent = {
  header: PageHeader;
  tournamentsTitleAr: string;
  tournamentsTitleFr: string;
  standingsTitleAr: string;
  standingsTitleFr: string;
  emptyTournaments: string;
  emptyStandings: string;
  items: Tournament[];
  standings: StandingRow[];
};

/* ---------------- مدرسة الشطرنج ---------------- */

export type TrainingLevel = {
  id: string;
  step: string;
  ar: string;
  fr: string;
  text: string;
  points: string;
};

export type TrainingContent = {
  header: PageHeader;
  approachTitle: string;
  approachText: string;
  approachPoints: string[];
  photo: MediaRef | null;
  photoNote: string;
  levelsTitleAr: string;
  levelsTitleFr: string;
  levels: TrainingLevel[];
  programsTitleAr: string;
  programsTitleFr: string;
  programs: LabeledItem[];
  registrationNotice: string;
};

/* ---------------- المعرض ---------------- */

export type GalleryItem = {
  id: string;
  titleAr: string;
  titleFr: string;
  image: MediaRef | null;
  order: number;
  published: boolean;
};

export type GalleryContent = {
  header: PageHeader;
  sectionTitleAr: string;
  sectionTitleFr: string;
  emptyMessage: string;
  items: GalleryItem[];
};

/* ---------------- التواصل ---------------- */

export type SocialLink = {
  id: string;
  labelAr: string;
  labelFr: string;
  url: string;
};

/** صف واحد في جدول أوقات العمل */
export type OpeningHour = {
  id: string;
  dayAr: string;
  timeAr: string;
  closed: boolean;
};

export type ContactContent = {
  header: PageHeader;
  city: string;
  address: string;
  phone: string;
  email: string;
  aboutText: string;
  socials: SocialLink[];
  formEnabled: boolean;
  formNotice: string;
  /* ---- أوقات العمل والمكان ---- */
  hours: OpeningHour[];
  hoursNote: string;
  mapEmbedUrl: string;
  mapLinkUrl: string;
  addressDetails: string;
};

/* ---------------- المحتوى الكامل ---------------- */

export type SiteContent = {
  siteSettings: SiteSettings;
  homePage: HomeContent;
  about: AboutContent;
  news: NewsContent;
  members: MembersContent;
  tournaments: TournamentsContent;
  training: TrainingContent;
  gallery: GalleryContent;
  contact: ContactContent;
};

/* ════════════════ القيم الافتراضية ════════════════ */

export const defaultContent: SiteContent = {
  siteSettings: {
    nameAr: "النادي الرياضي لأزرو للشطرنج",
    nameFr: "Club Azrou Sportif d’Échecs",
    tifinagh: "ⴰⵣⵔⵓ",
    tagline: "Club d’échecs",
    locationAr: "أزرو · المغرب",
    locationFr: "AZROU · MAROC",
    githubRepo: "azrou-chess-media",
    mediaDeleteEndpoint: "",
  },

  homePage: {
    badgeAr: "نادٍ رياضي للشطرنج · أزرو، المغرب",
    welcomeAr: "مرحباً بكم في",
    titleAr: "النادي الرياضي لأزرو للشطرنج",
    titleFr: "Club Azrou Sportif d’Échecs",
    descriptionAr:
      "فضاء يحتفي بالشطرنج كلعبة فكر ورياضة: نتعلّم ونتبادل الخبرة، نتنافس بروح رياضية، ونرعى المواهب الصاعدة في قلب أزرو.",
    primaryCtaAr: "اكتشف النادي",
    primaryCtaHref: "#club",
    secondaryCtaAr: "آخر الأخبار",
    secondaryCtaHref: "#actualites",
    image: null,
    imageAlt: "صورة من أنشطة النادي الرياضي لأزرو للشطرنج",
    captionAr: "لعبة الفكر والانضباط",
    captionFr: "L’art de la stratégie",
    badgeLatin: "Chess Club",
  },

  about: {
    header: {
      eyebrow: "تعريف بالنادي",
      titleAr: "عن النادي الرياضي لأزرو للشطرنج",
      titleFr: "Le Club",
      intro: "جمعية رياضية تُعنى بلعبة الشطرنج في مدينة أزرو: تعلّم، تدريب، ومنافسة بروح رياضية.",
    },
    sectionTitleAr: "من نحن",
    sectionTitleFr: "Présentation",
    paragraph1:
      "النادي الرياضي لأزرو للشطرنج فضاء جمعوي يجمع محبي لعبة الشطرنج في مدينة أزرو، ويعمل على نشر اللعبة وتأطير ممارسيها من مختلف الأعمار. يقوم عمل النادي على ثلاثة محاور أساسية: التعلّم، والتنافس بروح رياضية، ورعاية المواهب الصاعدة.",
    paragraph2:
      "يعتبر النادي الشطرنج رياضة ذهنية وأداة تربوية في الوقت نفسه، إذ تساهم في تنمية التركيز والصبر والتفكير المنهجي واتخاذ القرار لدى ممارسيها.",
    photo: null,
    photoCaptionAr: "من أنشطة النادي",
    photoCaptionFr: "Activité du club",
    objectives: [],
    activities: [],
    recordsNotice:
      "لم تُضَف بعد أي إنجازات أو معطيات رسمية إلى الموقع. ستُحدَّث هذه الفقرة فور توفّر المعطيات الموثّقة من النادي.",
  },

  news: {
    header: {
      eyebrow: "مستجدات النادي",
      titleAr: "أخبار ومستجدات النادي",
      titleFr: "Actualités du club",
      intro:
        "تابعوا من هنا مستجدات النادي الرياضي لأزرو للشطرنج: الأنشطة، الدورات، وحصص التدريب.",
    },
    listTitleAr: "آخر ما نُشر",
    listTitleFr: "Dernières publications",
    emptyMessage: "لم تُنشر أي أخبار بعد. ستظهر هنا مستجدات النادي فور إضافتها.",
    items: [],
  },

  members: {
    header: {
      eyebrow: "المكتب والطاقم",
      titleAr: "أعضاء النادي ومسؤولوه",
      titleFr: "Membres & responsables",
      intro:
        "التعريف بمكتب النادي المسيّر، وبالمدربين والطاقم التقني المشرفين على أنشطة النادي.",
    },
    presidencyTitleAr: "رئاسة النادي",
    presidencyTitleFr: "Présidence",
    presidencyIntro: "على رأس المكتب المسيّر",
    presidencyTasks: [
      "الإشراف على التوجهات العامة للنادي",
      "تمثيل النادي لدى الشركاء والهيئات",
      "متابعة عمل المكتب المسيّر",
      "السهر على تنفيذ البرنامج السنوي",
    ],
    people: [],
  },

  tournaments: {
    header: {
      eyebrow: "المنافسات",
      titleAr: "البطولات والنتائج",
      titleFr: "Tournois & Résultats",
      intro: "دورات النادي ونتائجها وترتيب المشاركين.",
    },
    tournamentsTitleAr: "الدورات والبطولات",
    tournamentsTitleFr: "Tournois",
    standingsTitleAr: "النتائج والترتيب",
    standingsTitleFr: "Résultats & Classement",
    emptyTournaments: "لم تُضَف أي دورة بعد. ستظهر هنا دورات النادي فور الإعلان عنها.",
    emptyStandings: "لا توجد نتائج منشورة حالياً. ستُعرض هنا نتائج الدورات فور اعتمادها.",
    items: [],
    standings: [],
  },

  training: {
    header: {
      eyebrow: "التكوين والتأطير",
      titleAr: "مدرسة الشطرنج والتداريب",
      titleFr: "École d’échecs & Entraînements",
      intro: "مسار تعلّم متدرّج من الخطوات الأولى على الرقعة إلى التهيؤ للمنافسات الرسمية.",
    },
    approachTitle: "تعلّم متدرّج وممارسة منتظمة",
    approachText:
      "يعتمد التكوين داخل النادي على التدرّج: يبدأ المتدرب بالتعرف على القطع وقواعد اللعب، ثم ينتقل إلى المفاهيم التكتيكية، فدراسة الافتتاحيات ونهايات المباريات، وصولاً إلى التهيؤ لأجواء المنافسة.",
    approachPoints: [
      "حصص عملية على الرقعة بدل الشرح النظري فقط",
      "تمارين تكتيكية متدرجة الصعوبة",
      "تحليل المباريات واستخلاص الأخطاء",
      "مرافقة فردية حسب مستوى كل متدرب",
    ],
    photo: null,
    photoNote: "",
    levelsTitleAr: "مستويات التعلم",
    levelsTitleFr: "Niveaux d’apprentissage",
    levels: [],
    programsTitleAr: "برامج التكوين",
    programsTitleFr: "Programmes de formation",
    programs: [],
    registrationNotice:
      "لم تُنشر بعد مواعيد التسجيل أو واجبات الانخراط أو شروطه الرسمية. للاستفسار، يمكن استعمال صفحة التواصل.",
  },

  gallery: {
    header: {
      eyebrow: "صور وأنشطة",
      titleAr: "معرض الصور",
      titleFr: "Galerie",
      intro: "صور من أنشطة النادي الرياضي لأزرو للشطرنج.",
    },
    sectionTitleAr: "صور النادي",
    sectionTitleFr: "Photos du club",
    emptyMessage: "لم تُضَف أي صورة بعد. ستظهر هنا صور أنشطة النادي فور رفعها.",
    items: [],
  },

  contact: {
    header: {
      eyebrow: "ابقَ على تواصل",
      titleAr: "اتصل بالنادي",
      titleFr: "Contact",
      intro: "معلومات التواصل مع النادي الرياضي لأزرو للشطرنج.",
    },
    city: "أزرو، المغرب",
    address: "",
    phone: "",
    email: "",
    aboutText:
      "للاستفسار حول الأنشطة أو التكوين أو الانخراط، يمكنكم مراسلة النادي عبر قنوات التواصل الرسمية.",
    socials: [],
    formEnabled: false,
    formNotice:
      "هذا النموذج غير مربوط بخدمة إرسال، وهو معروض لعرض الواجهة فقط. لن تُرسَل أي رسالة عند الضغط على الزر.",
    hours: [],
    hoursNote: "",
    mapEmbedUrl: "",
    mapLinkUrl: "",
    addressDetails: "",
  },
};

/** دمج عميق بين القيم الافتراضية وما يأتي من Firebase (قد يكون جزئياً). */
export function mergeContent(remote: unknown): SiteContent {
  return deepMerge(defaultContent, remote) as SiteContent;
}

function deepMerge<T>(base: T, patch: unknown): T {
  if (patch === null || patch === undefined) return base;

  if (Array.isArray(base)) {
    return (Array.isArray(patch) ? patch : objectToArray(patch)) as unknown as T;
  }

  if (typeof base === "object" && typeof patch === "object") {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [key, value] of Object.entries(patch as Record<string, unknown>)) {
      const current = (base as Record<string, unknown>)[key];
      out[key] =
        current !== undefined && current !== null && typeof current === "object"
          ? deepMerge(current, value)
          : value;
    }
    return out as T;
  }

  return patch as T;
}

/** Firebase يحوّل بعض المصفوفات إلى كائنات — نعيدها مصفوفة. */
function objectToArray(value: unknown): unknown[] {
  if (!value || typeof value !== "object") return [];
  return Object.values(value as Record<string, unknown>).filter(Boolean);
}
