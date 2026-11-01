import { lazy, Suspense, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import NewsPage from "@/pages/NewsPage";
import NewsArticlePage from "@/pages/NewsArticlePage";
import ClubPage from "@/pages/ClubPage";
import MembersPage from "@/pages/MembersPage";
import TournamentsPage from "@/pages/TournamentsPage";
import SchoolPage from "@/pages/SchoolPage";
import GalleryPage from "@/pages/GalleryPage";
import ContactPage from "@/pages/ContactPage";
import RegistrationPage from "@/pages/RegistrationPage";
import {
  ContactSummarySection,
  GalleryStrip,
  LatestNewsSection,
  LatestStrip,
  StatsStrip,
  TeamCarouselSection,
  TournamentsHighlight,
  TrainingTeaser,
} from "@/components/home/HomeSections";
import { isAdminLocation, resolveRoute, useHashRoute } from "@/hooks/useHashRoute";
import { useSiteContent } from "@/lib/content";
import { configureMedia } from "@/lib/media";
import { initAnalytics } from "@/lib/firebase";

const AdminApp = lazy(() => import("@/admin/AdminApp"));

export default function App() {
  const hash = useHashRoute();
  const isAdmin = isAdminLocation(hash);
  const route = resolveRoute(hash);
  const { content, loading } = useSiteContent();

  useEffect(() => {
    void initAnalytics();
  }, []);

  // إعدادات الرفع تُقرأ وقت التشغيل — لا حاجة لإعادة بناء الموقع
  useEffect(() => {
    configureMedia(content.siteSettings);
  }, [content.siteSettings]);

  // الصفحات المستقلة تبدأ دائماً من أعلى الصفحة.
  useEffect(() => {
    if (isAdmin || route.name === "home") return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [route.name, hash, isAdmin]);

  if (isAdmin) {
    return (
      <Suspense
        fallback={
          <div dir="rtl" className="grid min-h-screen place-items-center bg-royal-deep font-arabic text-[13px] text-white/80">
            جاري فتح لوحة الإدارة…
          </div>
        }
      >
        <AdminApp />
      </Suspense>
    );
  }

  const article =
    route.name === "article"
      ? content.news.items.find((item) => item.id === route.id && item.published)
      : undefined;

  return (
    <div
      dir="rtl"
      className="flex min-h-screen flex-col bg-[#fbf9f4] font-arabic text-royal-ink"
    >
      <Header settings={content.siteSettings} />

      <main id="main" className="flex flex-1 flex-col">
        {route.name === "home" && (
          <>
            <LatestStrip news={content.news} tournaments={content.tournaments} />
            <Hero home={content.homePage} />
            <LatestNewsSection news={content.news} />
            <TournamentsHighlight data={content.tournaments} />
            <StatsStrip
              members={content.members}
              tournaments={content.tournaments}
              gallery={content.gallery}
              news={content.news}
            />
            <TrainingTeaser training={content.training} />
            <TeamCarouselSection members={content.members} />
            <GalleryStrip gallery={content.gallery} />
            <ContactSummarySection contact={content.contact} />
          </>
        )}
        {route.name === "club" && <ClubPage about={content.about} />}
        {route.name === "news" && <NewsPage news={content.news} loading={loading} />}
        {route.name === "members" && <MembersPage members={content.members} />}
        {route.name === "tournaments" && <TournamentsPage data={content.tournaments} />}
        {route.name === "school" && <SchoolPage training={content.training} />}
        {route.name === "gallery" && <GalleryPage gallery={content.gallery} />}
        {route.name === "contact" && <ContactPage contact={content.contact} settings={content.siteSettings} />}
        {route.name === "registration" && <RegistrationPage />}
        {route.name === "article" &&
          (article ? (
            <NewsArticlePage article={article} />
          ) : (
            <NewsPage news={content.news} loading={loading} />
          ))}
      </main>
    </div>
  );
}
