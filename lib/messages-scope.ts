// Klienta puses tulkojumu telpas pa maršrutiem. SERVER komponentes lieto
// getTranslations (pilnās ziņas no request config), tāpēc te jāuzskaita TIKAI
// "use client" komponenšu telpas. Nezināms maršruts → null → pilnās ziņas (droši).
type Messages = Record<string, unknown>;

const CHROME = ["nav"]; // navbar (visos maršrutos)

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
