import type { ProductCategory } from "@/lib/products";

export type CategoryMeta = {
  id: ProductCategory;
  name: string;
  short: string;
  description: string;
  href: string;
};

export const categoryMeta: Record<ProductCategory, CategoryMeta> = {
  "foto-kaste": {
    id: "foto-kaste",
    name: "Foto kastes",
    short: "Foto kastes",
    description:
      "SPOGULIS, OZOLS un INSTAGRAM foto kastes ar tūlītēju druku un asistentu.",
    href: "/foto-kaste",
  },
  atrakcijas: {
    id: "atrakcijas",
    name: "Piepūšamās atrakcijas",
    short: "Atrakcijas",
    description:
      "Baltās piepūšamās pilis un bumbu vannas — telpās un ārā, tīras un drošas.",
    href: "/piepusamas-atrakcijas",
  },
  "audio-video": {
    id: "audio-video",
    name: "Audio/video viesu grāmatas",
    short: "Audio/video viesu grāmatas",
    description:
      "Retro telefoni viesu balss un video sveicieniem — sirsnīga piemiņa.",
    href: "/svinibu-inventars/audio-viesu-gramatas",
  },
  specefekti: {
    id: "specefekti",
    name: "Specefekti",
    short: "Specefekti",
    description:
      "Aukstās dzirksteles, zemā migla un burbuļi — iespaidīgi un droši efekti.",
    href: "/svinibu-inventars/specefekti",
  },
  deco: {
    id: "deco",
    name: "Deco / mēbeles",
    short: "Deco / mēbeles",
    description:
      "Šampanieša siena, LED uzraksti, dārza krēsli un citi svētku dekori.",
    href: "/svinibu-inventars/decomebeles",
  },
  kubli: {
    id: "kubli",
    name: "Kubli / pirts",
    short: "Kubli / pirts",
    description:
      "VIP kubli un mobilā pirts (atrodas Jūrmalā, atsevišķs tālrunis).",
    href: "/svinibu-inventars/kublsballa",
  },
};

// Home page — 6 kategorijas.
export const homeCategories: CategoryMeta[] = [
  categoryMeta["foto-kaste"],
  categoryMeta.atrakcijas,
  categoryMeta["audio-video"],
  categoryMeta.specefekti,
  categoryMeta.deco,
  categoryMeta.kubli,
];

// /svinibu-inventars hub — 4 apakškategorijas.
export const inventarsSubcategories: CategoryMeta[] = [
  categoryMeta["audio-video"],
  categoryMeta.specefekti,
  categoryMeta.deco,
  categoryMeta.kubli,
];
