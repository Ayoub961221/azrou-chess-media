import { useEffect, useState } from "react";

function readHash(): string {
  if (typeof window === "undefined") return "";
  return decodeURIComponent(window.location.hash.replace(/^#\/?/, ""));
}

/**
 * Minimal hash based router.
 * Keeps every existing in-page anchor working (#accueil, #club, …)
 * while allowing dedicated pages such as #actualites.
 */
export function useHashRoute(): string {
  const [route, setRoute] = useState<string>(readHash);

  useEffect(() => {
    const onHashChange = () => setRoute(readHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}

export const NEWS_ROUTE = "actualites";

export type PageName =
  | "home"
  | "club"
  | "news"
  | "members"
  | "tournaments"
  | "school"
  | "gallery"
  | "contact"
  | "registration";

export type ResolvedRoute =
  | { name: PageName }
  | { name: "admin" }
  | { name: "article"; id: string };

/**
 * لوحة الإدارة تُفتح عبر المسار /admin أو عبر #admin
 * (الثاني يضمن العمل على أي استضافة ثابتة بدون إعادة توجيه).
 */
export function isAdminLocation(hash: string): boolean {
  if (hash === "admin" || hash.startsWith("admin/")) return true;
  if (typeof window === "undefined") return false;
  return /(^|\/)admin\/?$/.test(window.location.pathname);
}

const PAGE_BY_HASH: Record<string, PageName> = {
  "": "home",
  accueil: "home",
  club: "club",
  [NEWS_ROUTE]: "news",
  membres: "members",
  tournois: "tournaments",
  entrainements: "school",
  galerie: "gallery",
  contact: "contact",
  inscription: "registration",
};

export function resolveRoute(route: string): ResolvedRoute {
  if (route.startsWith(`${NEWS_ROUTE}/`)) {
    const id = route.slice(NEWS_ROUTE.length + 1);
    return id ? { name: "article", id } : { name: "news" };
  }

  return { name: PAGE_BY_HASH[route] ?? "home" };
}
