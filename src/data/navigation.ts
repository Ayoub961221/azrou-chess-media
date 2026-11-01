export type NavItem = {
  id: string;
  ar: string;
  fr: string;
};

export const navigation: NavItem[] = [
  { id: "accueil", ar: "الرئيسية", fr: "Accueil" },
  { id: "club", ar: "عن النادي", fr: "Le Club" },
  { id: "actualites", ar: "الأخبار", fr: "Actualités" },
  { id: "membres", ar: "أعضاء النادي", fr: "Membres" },
  { id: "tournois", ar: "البطولات والدورات", fr: "Tournois" },
  { id: "entrainements", ar: "التداريب", fr: "Entraînements" },
  { id: "galerie", ar: "المعرض", fr: "Galerie" },
  { id: "inscription", ar: "التسجيل في النادي", fr: "Inscription" },
  { id: "contact", ar: "اتصل بنا", fr: "Contact" },
];
