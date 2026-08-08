export const GALLERY_CATEGORIES = [
  "foto-kaste",
  "atrakcijas",
  "audio-video",
  "specefekti",
  "deco",
  "kubli",
  "ai-foto",
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export type GalleryImage = {
  id: string;
  url: string;
  caption: string;
  alt: string;
};

// Auto-alt pēc kategorijas, ja admin nav ievadījis (SEO + piekļūstamība).
const AUTO_ALT: Record<string, { lv: string; en: string; ru: string }> = {
  "foto-kaste": { lv: "Foto kaste pasākumā", en: "Photo booth at an event", ru: "Фотобудка на мероприятии" },
  atrakcijas: { lv: "Piepūšamā atrakcija pasākumā", en: "Inflatable attraction at an event", ru: "Надувной аттракцион на мероприятии" },
  "audio-video": { lv: "Audio viesu grāmata pasākumā", en: "Audio guest book at an event", ru: "Аудио гостевая книга на мероприятии" },
  specefekti: { lv: "Specefekti pasākumā", en: "Special effects at an event", ru: "Спецэффекты на мероприятии" },
  deco: { lv: "Dekori pasākumā", en: "Décor at an event", ru: "Декор на мероприятии" },
  kubli: { lv: "Kubls pasākumā", en: "Hot tub at an event", ru: "Купель на мероприятии" },
  "ai-foto": { lv: "AI foto kaste pasākumā", en: "AI photo booth at an event", ru: "AI-фотобудка на мероприятии" },
};

const GENERIC_ALT: Record<string, string> = {
  lv: "Anabella Party pasākumā",
  en: "Anabella Party at an event",
  ru: "Anabella Party на мероприятии",
};

export function autoAlt(category: string | null, locale: string): string {
  const l = (locale === "en" || locale === "ru" ? locale : "lv") as "lv" | "en" | "ru";
  if (category && AUTO_ALT[category]) return AUTO_ALT[category][l];
  return GENERIC_ALT[l];
}

export const CATEGORY_LABEL: Record<string, string> = {
  "foto-kaste": "Foto kaste",
  atrakcijas: "Atrakcijas",
  "audio-video": "Audio/video",
  specefekti: "Specefekti",
  deco: "Deco",
  kubli: "Kubli",
  "ai-foto": "AI foto",
};
