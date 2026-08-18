import type { ProductCategory } from "@/lib/products";

export type CategoryMeta = {
  id: ProductCategory | "izklaides-punkts" | "ai-foto";
  name: string;
  short: string;
  description: string;
  href: string;
  /** Fona attēls (SOLIS1D). Rādīts tikai, ja fails reāli eksistē public/. */
  bgImage: string;
  /** "Drīzumā" kartīte — nav klikšķināma, luxury gradienta fons, DRĪZUMĀ uzlīme. */
  comingSoon?: boolean;
};

export const categoryMeta: Record<ProductCategory, CategoryMeta> = {
  "foto-kaste": {
    id: "foto-kaste",
    name: "Foto kastes",
    short: "Foto kastes",
    description:
      "SPOGULIS, OZOLS un INSTAGRAM foto kastes ar tūlītēju druku un asistentu.",
    href: "/foto-kaste",
    bgImage: "/images/categories/foto-kastes.jpg",
  },
  atrakcijas: {
    id: "atrakcijas",
    name: "Piepūšamās atrakcijas",
    short: "Atrakcijas",
    description:
      "Baltās piepūšamās pilis un bumbu vannas — telpās un ārā, tīras un drošas.",
    href: "/piepusamas-atrakcijas",
    bgImage: "/images/categories/atrakcijas.jpg",
  },
  "audio-video": {
    id: "audio-video",
    name: "Audio/video viesu grāmatas",
    short: "Audio/video viesu grāmatas",
    description:
      "Retro telefoni viesu balss un video sveicieniem — sirsnīga piemiņa.",
    href: "/svinibu-inventars/audio-viesu-gramatas",
    bgImage: "/images/categories/audio-video.jpg",
  },
  specefekti: {
    id: "specefekti",
    name: "Specefekti",
    short: "Specefekti",
    description:
      "Aukstās dzirksteles, zemā migla un burbuļi — iespaidīgi un droši efekti.",
    href: "/svinibu-inventars/specefekti",
    bgImage: "/images/categories/specefekti.jpg",
  },
  deco: {
    id: "deco",
    name: "Deco / mēbeles",
    short: "Deco / mēbeles",
    description:
      "Šampanieša siena, LED uzraksti, dārza krēsli un citi svētku dekori.",
    href: "/svinibu-inventars/decomebeles",
    bgImage: "/images/categories/deco.jpg",
  },
  kubli: {
    id: "kubli",
    name: "Kubli / pirts",
    short: "Kubli / pirts",
    description:
      "VIP kubli un mobilā pirts (atrodas Jūrmalā, atsevišķs tālrunis).",
    href: "/svinibu-inventars/kublsballa",
    bgImage: "/images/categories/kubli.jpg",
  },
};

// AI foto kaste — pilnvērtīga (pelnoša) sadaļa, saistīta ar /foto-kaste/ai-foto.
// Rādās sākumlapā līdzās foto kastēm (B2B specifikācija §3.1).
export const aiFotoCategory: CategoryMeta = {
  id: "ai-foto",
  name: "AI foto kaste",
  short: "AI foto",
  description:
    "Pārvērš viesus par supervaroņiem, kosmosa ceļotājiem vai retro zvaigznēm. Pielāgojam pasākuma tematikai un uzņēmuma identitātei.",
  href: "/foto-kaste/ai-foto",
  bgImage: "/images/categories/ai-foto.jpg",
};

// "Izklaides punkts" — drīzumā (AI foto + spēles). Nav produktu kategorija,
// nav klikšķināma; luxury gradienta fons + DRĪZUMĀ uzlīme.
// (Vairs netiek rādīts sākumlapā — aizvietots ar AI foto kasti.)
export const izklaidesPunkts: CategoryMeta = {
  id: "izklaides-punkts",
  name: "Izklaides punkts",
  short: "Izklaides punkts",
  description:
    "AI foto pārsteigumi un interaktīvas spēles jūsu pasākumam — drīzumā pieejams.",
  href: "#",
  bgImage: "",
  comingSoon: true,
};

// Kalkulators (/rezervet) — TIKAI pašapkalpošanās kategorijas (kubli izņemts:
// tos apkalpo partneris atsevišķi, jāzvana).
export const bookingCategories: CategoryMeta[] = [
  categoryMeta["foto-kaste"],
  categoryMeta.atrakcijas,
  categoryMeta["audio-video"],
  categoryMeta.specefekti,
  categoryMeta.deco,
];

// Home page — AI foto kaste līdzās foto kastēm (§3.1), tad pārējās kategorijas.
export const homeCategories: CategoryMeta[] = [
  categoryMeta["foto-kaste"],
  aiFotoCategory,
  categoryMeta.atrakcijas,
  categoryMeta["audio-video"],
  categoryMeta.specefekti,
  categoryMeta.deco,
];

// /svinibu-inventars hub — 3 apakškategorijas (kubli izņemts no galerijas).
export const inventarsSubcategories: CategoryMeta[] = [
  categoryMeta["audio-video"],
  categoryMeta.specefekti,
  categoryMeta.deco,
];
