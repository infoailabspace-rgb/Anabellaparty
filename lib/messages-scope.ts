// Klienta puses tulkojumu telpas. SERVER komponentes lieto getTranslations
// (pilnās ziņas no request config), tāpēc te jāuzskaita TIKAI "use client"
// komponenšu telpas.
type Messages = Record<string, unknown>;

const CHROME = ["nav"]; // navbar (visos maršrutos)

// VISU publisko maršrutu klienta telpu apvienojums. Lieto [locale]/layout STATISKI
// (bez headers()) → publiskās lapas var būt ISR/statiskas, un tomēr klientam sūta
// tikai ~8 telpas, nevis visu lv.json (30+ telpas). Drošs: sedz katru "use client"
// komponenti neatkarīgi no maršruta.
export const CLIENT_NAMESPACES = [
  "nav",
  "testimonials",
  "gallery",
  "booking",
  "pricePanel",
  "contactForm",
  "b2bForm",
  "faqCat",
];

const ROUTE_NAMESPACES: Record<string, string[]> = {
  "/": [...CHROME, "testimonials", "gallery"],
  "/rezervet": [...CHROME, "booking", "pricePanel"],
  "/kontakti": [...CHROME, "contactForm", "b2bForm"],
  "/faq": [...CHROME, "faqCat"],
};

// Kategoriju/produktu lapas — event-gallery (gallery) + chrome.
const GALLERY_PREFIXES = [
  "/svinibu-inventars",
  "/foto-kaste",
  "/piepusamas-atrakcijas",
];

/** Telpas maršrutam vai null (=pilnās ziņas). Noņem locale prefiksu + beigu slīpsvītru. */
export function namespacesForPath(pathname: string): string[] | null {
  if (!pathname) return null;
  let p = pathname.replace(/^\/(en|ru)(?=\/|$)/, "");
  if (!p) p = "/";
  if (p.length > 1) p = p.replace(/\/$/, "");
  if (ROUTE_NAMESPACES[p]) return ROUTE_NAMESPACES[p];
  if (GALLERY_PREFIXES.some((r) => p === r || p.startsWith(r + "/")))
    return [...CHROME, "gallery"];
  return null;
}

/** Atlasa tikai norādītās telpas no pilnajām ziņām. */
export function pickMessages(messages: Messages, namespaces: string[]): Messages {
  const out: Messages = {};
  for (const ns of namespaces) if (messages[ns] != null) out[ns] = messages[ns];
  return out;
}
