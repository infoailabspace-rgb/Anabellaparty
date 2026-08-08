// Publiski redzamie teksti, kas rediģējami /admin/lapas. Noklusējumi nāk no
// messages/*.json; DB (site_content) glabā tikai pārrakstus. Izslēgts: af*
// (jau /admin/ai-foto) un rekvizītu etiķetes (nāk no company.ts).

export type CatalogField = { key: string; label: string; multiline?: boolean };
export type CatalogGroup = { id: string; title: string; fields: CatalogField[] };

const pageTitle = (key: string, name: string): CatalogField[] => [
  { key: `pages.${key}Title`, label: `${name} — virsraksts` },
  { key: `pages.${key}Tagline`, label: `${name} — tagline`, multiline: true },
];

const catDesc = (id: string, name: string): CatalogField[] => [
  { key: `categories.${id}Name`, label: `${name} — nosaukums` },
  { key: `categories.${id}Desc`, label: `${name} — apraksts`, multiline: true },
];

export const CATALOG: CatalogGroup[] = [
  {
    id: "categories",
    title: "B — Kategorijas (kartītes + navbar)",
    fields: [
      ...catDesc("foto-kaste", "Foto kaste"),
      ...catDesc("atrakcijas", "Atrakcijas"),
      ...catDesc("audio-video", "Audio/video"),
      ...catDesc("specefekti", "Specefekti"),
      ...catDesc("deco", "Deco"),
      ...catDesc("kubli", "Kubli"),
    ],
  },
  {
    id: "pages",
    title: "E — Lapu virsraksti un tagline",
    fields: [
      ...pageTitle("fotoKaste", "Foto kaste"),
      ...pageTitle("aiFoto", "AI foto"),
      ...pageTitle("atrakcijas", "Atrakcijas"),
      ...pageTitle("inventars", "Svinību inventārs"),
      ...pageTitle("audioVideo", "Audio viesu grāmatas"),
      ...pageTitle("specefekti", "Specefekti"),
      ...pageTitle("deco", "Deco mēbeles"),
      ...pageTitle("kubli", "Kubls ballā"),
      ...pageTitle("rezervet", "Rezervēt"),
      ...pageTitle("kontakti", "Kontakti"),
      ...pageTitle("faq", "BUJ"),
      ...pageTitle("musuDraugi", "Mūsu draugi"),
    ],
  },
  {
    id: "foto-kaste",
    title: "F — Foto kaste (saturs)",
    fields: [
      { key: "sec.fkAiBlurb", label: "AI bloks — teksts", multiline: true },
      { key: "sec.fkLearnAi", label: "AI bloks — saites teksts" },
      { key: "sec.fkSpecial", label: "Īpašais piedāvājums — virsraksts" },
      { key: "sec.fkFramesTitle", label: "Rāmji — virsraksts" },
      { key: "sec.fkFramesText", label: "Rāmji — teksts", multiline: true },
    ],
  },
  {
    id: "atrakcijas",
    title: "F — Piepūšamās atrakcijas (saturs)",
    fields: [
      { key: "sec.atrBalls", label: "Baltās bumbas — teksts", multiline: true },
      { key: "sec.atrCleanTitle", label: "Tīrīšanas ierīce — virsraksts" },
      { key: "sec.atrCleanText", label: "Tīrīšanas ierīce — teksts", multiline: true },
    ],
  },
  {
    id: "specefekti",
    title: "F — Specefekti (saturs)",
    fields: [{ key: "sec.specNote", label: "Piezīme", multiline: true }],
  },
  {
    id: "audio-video",
    title: "F — Audio viesu grāmatas (saturs)",
    fields: [
      { key: "sec.avRetention", label: "Glabāšanas termiņš", multiline: true },
      { key: "sec.avAddOnsTitle", label: "Papildinājumi — virsraksts" },
      { key: "sec.avTutorial", label: "Pamācība — saite" },
      { key: "sec.avAddOn1", label: "Papildinājums 1" },
      { key: "sec.avAddOn2", label: "Papildinājums 2" },
      { key: "sec.avAddOn3", label: "Papildinājums 3" },
      { key: "sec.avAddOn3Price", label: "Papildinājums 3 — cena" },
    ],
  },
  {
    id: "kubli",
    title: "F — Kubls ballā (saturs)",
    fields: [
      { key: "sec.kbNotePre", label: "Piezīme (pirms)", multiline: true },
      { key: "sec.kbNotePost", label: "Piezīme (pēc)", multiline: true },
      { key: "sec.kbCtaTitle", label: "CTA — virsraksts" },
      { key: "sec.kbCtaText", label: "CTA — teksts", multiline: true },
    ],
  },
  {
    id: "faq",
    title: "F — BUJ (CTA)",
    fields: [
      { key: "sec.fqCtaTitle", label: "CTA — virsraksts" },
      { key: "sec.fqCtaText", label: "CTA — teksts", multiline: true },
      { key: "sec.fqCtaBtn", label: "CTA — pogas teksts" },
    ],
  },
  {
    id: "rezervet",
    title: "F — Rezervēt (saturs)",
    fields: [{ key: "sec.rOrForm", label: "Vai aizpildi formu — teksts", multiline: true }],
  },
  {
    id: "kontakti",
    title: "F — Kontakti (virsraksti)",
    fields: [
      { key: "sec.cReachUs", label: "Sazinies ar mums — virsraksts" },
      { key: "sec.cWriteUs", label: "Raksti mums — virsraksts" },
      { key: "sec.cMapTitle", label: "Karte — virsraksts" },
      { key: "sec.cFormHint", label: "Formas norāde", multiline: true },
    ],
  },
  {
    id: "musu-draugi",
    title: "F — Mūsu draugi (tukšais stāvoklis)",
    fields: [
      { key: "sec.mdEmptyIntro", label: "Ievads", multiline: true },
      { key: "sec.mdEmptyInvite", label: "Uzaicinājums", multiline: true },
    ],
  },
  {
    id: "404",
    title: "F — 404 lapa",
    fields: [
      { key: "sec.nfTitle", label: "Virsraksts" },
      { key: "sec.nfText", label: "Teksts", multiline: true },
    ],
  },
];

export const ALLOWED_KEYS = new Set(
  CATALOG.flatMap((g) => g.fields.map((f) => f.key)),
);
