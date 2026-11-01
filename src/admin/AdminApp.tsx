import { useEffect, useMemo, useState } from "react";
import clubLogo from "@/assets/clubLogo";
import LoginPage from "@/admin/LoginPage";
import {
  AboutSection,
  CoachesSection,
  ContactSection,
  DashboardSection,
  GallerySection,
  HomeSection,
  MediaSection,
  MembersSection,
  NewsSection,
  RegistrationsSection,
  SettingsSection,
  TournamentsSection,
  TrainingSection,
  type SectionProps,
} from "@/admin/sections";
import { Button, StatusBar, type Status } from "@/admin/ui";
import { adminSignOut, saveSection, useAuthState, useSiteContent } from "@/lib/content";
import { useRegistrations } from "@/lib/registrations";
import { configureMedia, stripMedia } from "@/lib/media";
import type { MediaRef } from "@/lib/content-model";
import type { SiteContent } from "@/lib/content-model";
import { cn } from "@/utils/cn";

type SectionId =
  | "dashboard"
  | "home"
  | "media"
  | "news"
  | "members"
  | "coaches"
  | "tournaments"
  | "gallery"
  | "about"
  | "training"
  | "contact"
  | "registrations"
  | "settings";

type SectionDef = {
  id: SectionId;
  ar: string;
  fr: string;
  /** مسار الحفظ داخل content/ — undefined يعني قسم للعرض فقط */
  path?: keyof SiteContent;
};

const SECTIONS: SectionDef[] = [
  { id: "dashboard", ar: "لوحة التحكم والإحصائيات", fr: "Tableau de bord" },
  { id: "home", ar: "الصفحة الرئيسية", fr: "Accueil", path: "homePage" },
  { id: "media", ar: "الصور والوسائط", fr: "Médiathèque" },
  { id: "news", ar: "الأخبار والمقالات", fr: "Actualités", path: "news" },
  { id: "members", ar: "الأعضاء والمسؤولون", fr: "Membres", path: "members" },
  { id: "coaches", ar: "المدربون", fr: "Entraîneurs", path: "members" },
  { id: "tournaments", ar: "البطولات والنتائج", fr: "Tournois", path: "tournaments" },
  { id: "gallery", ar: "معرض الصور", fr: "Galerie", path: "gallery" },
  { id: "about", ar: "صفحة من نحن", fr: "Le Club", path: "about" },
  { id: "training", ar: "مدرسة الشطرنج", fr: "École d’échecs", path: "training" },
  { id: "contact", ar: "التواصل والشبكات", fr: "Contact", path: "contact" },
  { id: "registrations", ar: "طلبات التسجيل", fr: "Inscriptions" },
  { id: "settings", ar: "الإعدادات العامة", fr: "Paramètres", path: "siteSettings" },
];

export default function AdminApp() {
  const { user, isAdmin, checking, adminError } = useAuthState();
  const { content, loading, error } = useSiteContent();
  const registrations = useRegistrations(isAdmin);
  const newRegistrations = registrations.items.filter((r) => r.status === "new").length;

  const [active, setActive] = useState<SectionId>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState<SiteContent | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  // إعدادات الرفع تُقرأ وقت التشغيل
  useEffect(() => {
    configureMedia(content.siteSettings);
  }, [content.siteSettings]);

  // نحمّل المسودة مرة واحدة بعد وصول المحتوى، ولا نكتب فوق تعديلات جارية.
  useEffect(() => {
    if (!loading && draft === null) setDraft(content);
  }, [loading, content, draft]);

  const section = useMemo(() => SECTIONS.find((s) => s.id === active)!, [active]);

  if (checking && !user) {
    return <FullScreenNote text="جاري التحقق من الجلسة…" />;
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!isAdmin) {
    return (
      <div dir="rtl" className="flex min-h-screen flex-col items-center justify-center gap-4 bg-royal-deep p-6 font-arabic text-center">
        <div className="max-w-md rounded-2xl bg-white p-6">
          <h1 className="font-arabic text-[1.05rem] font-bold text-royal-ink">
            الحساب غير مخوَّل
          </h1>
          <p className="mt-3 font-arabic text-[12.5px] leading-[2] text-royal-ink/70">
            {adminError}
          </p>
          <p dir="ltr" className="mt-3 select-all rounded-lg bg-[#f4f7fb] px-3 py-2 font-sans text-[11.5px] text-royal">
            admins/{user.uid} = true
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="ghost" onClick={() => void adminSignOut()}>تسجيل الخروج</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!draft) return <FullScreenNote text="جاري تحميل المحتوى…" />;

  const patch: SectionProps["patch"] = (updater) => {
    setDraft((d) => (d ? updater(d) : d));
    setStatus({ kind: "idle" });
  };

  async function handleSave() {
    if (!section.path || !draft) return;
    setStatus({ kind: "saving" });
    try {
      await saveSection(section.path, draft[section.path]);
      setStatus({ kind: "ok", message: "تم الحفظ بنجاح. التغييرات ظاهرة الآن في الموقع." });
    } catch (err) {
      setStatus({
        kind: "error",
        message:
          "تعذّر الحفظ: " +
          (err instanceof Error ? err.message : "خطأ غير معروف") +
          " — تحقّق من قواعد قاعدة البيانات ومن صلاحيات الحساب.",
      });
    }
  }

  function handleReset() {
    setDraft(content);
    setStatus({ kind: "idle", message: undefined });
  }

  /** يحذف صورة من كل مواضعها في المحتوى، ويُعيد عدد المواضع المُزالة. */
  const purgeMedia = (media: MediaRef): number => {
    let count = 0;
    setDraft((d) => {
      if (!d) return d;
      const { tree, removed } = stripMedia(d, media);
      count = removed;
      return tree;
    });
    setStatus({ kind: "idle" });
    return count;
  };

  const props: SectionProps = { draft, patch, tree: draft, purgeMedia };

  const body = {
    dashboard: <DashboardSection {...props} newRegistrations={newRegistrations} />,
    home: <HomeSection {...props} />,
    media: <MediaSection {...props} />,
    news: <NewsSection {...props} />,
    members: <MembersSection {...props} />,
    coaches: <CoachesSection {...props} />,
    tournaments: <TournamentsSection {...props} />,
    gallery: <GallerySection {...props} />,
    about: <AboutSection {...props} />,
    training: <TrainingSection {...props} />,
    contact: <ContactSection {...props} />,
    registrations: <RegistrationsSection />,
    settings: <SettingsSection {...props} />,
  }[active];

  return (
    <div dir="rtl" className="flex min-h-screen bg-[#f3f6fa] font-arabic text-royal-ink">
      {/* ===== القائمة الجانبية ===== */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[272px] flex-col overflow-hidden bg-royal-deep text-white transition-transform duration-300 lg:static lg:translate-x-0",
          menuOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(165deg,#0d3570_0%,#09264f_52%,#061c3b_100%)]" />
          <div className="drawer-chess-surface absolute bottom-0 left-0 h-[220px] w-[280px] opacity-40 [mask-image:linear-gradient(to_top,black,transparent)]" />
        </div>

        <div className="relative flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <img src={clubLogo} alt="" width={42} height={52} className="h-[42px] w-auto object-contain" />
          <div className="min-w-0">
            <p className="truncate font-arabic text-[12.5px] font-bold">لوحة الإدارة</p>
            <p dir="ltr" className="truncate font-sans text-[8.5px] uppercase tracking-[0.18em] text-gold-light/80">
              Administration
            </p>
          </div>
        </div>

        <nav className="drawer-scroll relative flex-1 overflow-y-auto px-2.5 py-3">
          <ul className="m-0 list-none space-y-0.5 p-0">
            {SECTIONS.map((s, index) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActive(s.id);
                    setMenuOpen(false);
                    setStatus({ kind: "idle" });
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-right transition-colors duration-200",
                    active === s.id ? "bg-white/[0.13]" : "hover:bg-white/[0.06]"
                  )}
                >
                  <span className={cn("w-5 shrink-0 font-sans text-[9.5px] font-semibold", active === s.id ? "text-gold-light" : "text-white/25")}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-arabic text-[12.5px] font-medium text-white/90">{s.ar}</span>
                    <span dir="ltr" className="block truncate font-sans text-[8px] uppercase tracking-[0.16em] text-white/35">
                      {s.fr}
                    </span>
                  </span>
                  {s.id === "registrations" && newRegistrations > 0 ? (
                    <span className="shrink-0 rounded-full bg-gold px-1.5 py-[1px] font-sans text-[9.5px] font-bold text-royal-deep">
                      {newRegistrations}
                    </span>
                  ) : null}
                  {active === s.id ? <span className="h-5 w-[2px] shrink-0 rounded-full bg-gold" /> : null}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="relative border-t border-white/10 p-3">
          <p dir="ltr" className="mb-2 truncate font-sans text-[10px] text-white/45">{user.email}</p>
          <div className="flex gap-2">
            <a
              href="./#accueil"
              className="inline-flex h-[36px] flex-1 items-center justify-center rounded-full border border-white/20 font-arabic text-[11.5px] text-white/85 transition hover:border-gold/60 hover:text-gold-light"
            >
              عرض الموقع
            </a>
            <button
              type="button"
              onClick={() => void adminSignOut()}
              className="inline-flex h-[36px] flex-1 items-center justify-center rounded-full bg-white/[0.08] font-arabic text-[11.5px] text-white/85 transition hover:bg-white/[0.16]"
            >
              خروج
            </button>
          </div>
        </div>
      </aside>

      {menuOpen ? (
        <div
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      ) : null}

      {/* ===== المحتوى ===== */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-royal/10 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="فتح القائمة"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-royal/15 text-royal lg:hidden"
              >
                ☰
              </button>
              <div className="min-w-0">
                <h1 className="truncate font-arabic text-[14.5px] font-bold text-royal-ink sm:text-[16px]">
                  {section.ar}
                </h1>
                <p dir="ltr" className="truncate font-sans text-[8.5px] uppercase tracking-[0.2em] text-royal-ink/40">
                  {section.fr}
                </p>
              </div>
            </div>

            {section.path ? (
              <div className="flex shrink-0 gap-2">
                <Button variant="ghost" onClick={handleReset}>تراجع</Button>
                <Button onClick={handleSave} disabled={status.kind === "saving"}>
                  {status.kind === "saving" ? "جاري الحفظ…" : "حفظ التغييرات"}
                </Button>
              </div>
            ) : null}
          </div>

          {status.kind !== "idle" ? (
            <div className="px-4 pb-3 sm:px-6">
              <StatusBar status={status} />
            </div>
          ) : null}

          {error ? (
            <div className="px-4 pb-3 sm:px-6">
              <p className="rounded-xl border border-red-300 bg-red-50 px-3.5 py-2.5 font-arabic text-[11.5px] leading-[1.8] text-red-700">
                تعذّر الاتصال بقاعدة البيانات: {error}
              </p>
            </div>
          ) : null}
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="mx-auto w-full max-w-[1100px]">{body}</div>
        </main>
      </div>
    </div>
  );
}

function FullScreenNote({ text }: { text: string }) {
  return (
    <div dir="rtl" className="grid min-h-screen place-items-center bg-royal-deep font-arabic text-white/80">
      <p className="text-[13px]">{text}</p>
    </div>
  );
}
