export type ProductCategory =
  | "foto-kaste"
  | "atrakcijas"
  | "audio-video"
  | "specefekti"
  | "deco"
  | "kubli";

export type PriceTier = {
  duration: string; // "2h", "10h", "24h", "48h", "72h", "1 diena"
  price: number;
  note?: string;
};

export type AddOn = {
  name: string;
  price: number;
  unit?: string; // "gb", "1L", "100gr"
  single?: boolean; // true → jā/nē izvēle (checkbox), nevis ± skaitītājs
};

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: ProductCategory;
  tiers: PriceTier[];
  hourlyExtra?: number; // katra nākamā stunda
  addOns?: AddOn[];
  specs?: { label: string; value: string }[];
  includes?: string[];
  coverImage: string; // galvenais attēls kartītei
  gallery: string[]; // katram produktam sava galerija
  featured?: boolean;
  special?: boolean; // "īpašā piedāvājuma" bloks (foto-kaste lapā)
  contactOnly?: boolean; // cena tikai vienojoties
  altPhone?: string; // kubliem cits numurs
};

export const KUBLI_PHONE = "28286911";

const cover = (slug: string) => `/images/products/${slug}/cover.jpg`;
const gallery = (slug: string, n = 3) =>
  Array.from(
    { length: n },
    (_, i) => `/images/products/${slug}/${String(i + 1).padStart(2, "0")}.jpg`,
  );

const fotoKasteIncludes = [
  "Neierobežots foto izdruku skaits",
  "Profesionāls asistents",
  "Individuāla foto rāmīšu un sākumekrāna dizaina izstrāde",
  "Aksesuāri jautrākām bildēm",
];

const atrakcijasIncludes = [
  "Var izmantot gan telpās, gan ārā",
  "Tīrības garantija — katra atrakcija rūpīgi sagatavota, tīrīta un dezinficēta; bumbas tīrītas ar speciālu ierīci un dezinficētas pēc katras lietošanas reizes",
  "Piegādājam un uzstādām",
  "Iespējams izdekorēt ar baloniem, iepriekš vienojoties",
];

export const products: Product[] = [
  // ───────────────────────── FOTO KASTES ─────────────────────────
  {
    slug: "spogulis",
    name: "SPOGULIS",
    tagline: "Eleganta, stilīga foto kaste ar tūlītēju druku.",
    description:
      "Eleganta, stilīga foto kaste. Augstas kvalitātes attēli, tūlītēja druka, personalizēta pieredze. Piemērota kāzām, korporatīviem pasākumiem un ballītēm.",
    category: "foto-kaste",
    tiers: [
      { duration: "2h", price: 260 },
      { duration: "Uz visu pasākumu", price: 0, note: "cena vienojoties" },
    ],
    hourlyExtra: 110,
    addOns: [
      { name: "AI foto funkcija", price: 100, single: true },
      { name: "Sarkanais paklājs un stabiņi", price: 40, single: true },
    ],
    includes: fotoKasteIncludes,
    coverImage: cover("spogulis"),
    gallery: gallery("spogulis"),
    featured: true,
  },
  {
    slug: "ozols",
    name: "OZOLS",
    tagline: "Dabisks ozolkoka dizains, gaumīgs stils.",
    description:
      "Dabisks ozolkoka dizains, gaumīgs stils, viegla lietošana. Piemērota kāzām, svinībām un korporatīviem pasākumiem.",
    category: "foto-kaste",
    tiers: [
      { duration: "2h", price: 220 },
      { duration: "Uz visu pasākumu", price: 0, note: "cena vienojoties" },
    ],
    hourlyExtra: 100,
    addOns: [
      { name: "AI foto funkcija", price: 100, single: true },
      { name: "Sarkanais paklājs un stabiņi", price: 40, single: true },
    ],
    includes: fotoKasteIncludes,
    coverImage: cover("ozols"),
    gallery: gallery("ozols"),
    featured: true,
  },
  {
    slug: "instagram",
    name: "INSTAGRAM",
    tagline: "Balta un stilīga — neviltotas emocijas.",
    description:
      "Balta un stilīga. Neviltotas emocijas, skaistas bildes, vienkārša lietošana.",
    category: "foto-kaste",
    tiers: [
      { duration: "2h", price: 220 },
      { duration: "Uz visu pasākumu", price: 0, note: "cena vienojoties" },
    ],
    hourlyExtra: 100,
    addOns: [
      { name: "AI foto funkcija", price: 100, single: true },
      { name: "Sarkanais paklājs un stabiņi", price: 40, single: true },
    ],
    includes: fotoKasteIncludes,
    coverImage: cover("instagram"),
    gallery: gallery("instagram"),
    featured: true,
  },
  {
    slug: "foto-kaste-uz-visu-dienu",
    name: "Foto kaste uz visu dienu",
    tagline: "12h noma bez operatora — 350 €.",
    description:
      "Noma bez operatora, 12 stundas. Piemērojas tikai Instagram un Ozols kastēm. Saņemšana noliktavā ar apmācību VAI atbraucam, uzstādām un apmācām. Attālināts tehniskais atbalsts visa pasākuma laikā (telefoniski vai pieslēdzoties iekārtai).",
    category: "foto-kaste",
    tiers: [{ duration: "12h", price: 350, note: "bez operatora" }],
    addOns: [{ name: "Katrs nākamais foto papīra rullis", price: 70 }],
    specs: [
      { label: "Piemērojas", value: "tikai Instagram un Ozols kastēm" },
      { label: "Komplektā", value: "viens rullis (līdz 800 izdrukām)" },
    ],
    includes: [
      "Noma bez operatora, 12h",
      "Saņemšana noliktavā ar apmācību, VAI atbraucam, uzstādām, apmācām",
      "Attālināts tehniskais atbalsts visa pasākuma laikā",
      "Komplektā viens foto papīra rullis (līdz 800 izdrukām)",
    ],
    coverImage: cover("foto-kaste-uz-visu-dienu"),
    gallery: gallery("foto-kaste-uz-visu-dienu"),
    featured: true,
  },
  {
    slug: "foto-kaste-uz-periodu",
    name: "Foto kaste uz periodu",
    tagline: "Stacionāra foto kaste iestādēm un pasākumu vietām.",
    description:
      "Stacionāra foto kaste iestādēm un pasākumu vietām uz ilgstošu periodu. Piegāde, uzstādīšana, apmācības un konsultācijas nomas periodā. Standarta foto programma, iespējams uzstādīt AI funkcijas.",
    category: "foto-kaste",
    tiers: [],
    contactOnly: true,
    coverImage: cover("foto-kaste-uz-periodu"),
    gallery: gallery("foto-kaste-uz-periodu"),
  },
  {
    slug: "foto-kaste-masu-pasakumiem",
    name: "Masu pasākumiem — „Mēs maksājam Jums!”",
    tagline: "Foto kastes ar POS termināli — klients pelna no katras izdrukas.",
    description:
      "Foto kastes ar POS termināli. Klients pelna procentus no katras izdrukas. Varianti: autonoma foto kaste ar POS termināli; autonoma foto kaste ar drošu interneta maksājumu; foto kaste ar asistentu un nodrošinātu POS mobile. Piemērots: korporatīvie pasākumi un balles, festivāli un pilsētas svētki, skolu izlaidumi un studentu balles, tirdzniecības centru aktivitātes, sporta sacensības un fanu zonas, koncerti.",
    category: "foto-kaste",
    tiers: [],
    contactOnly: true,
    coverImage: cover("foto-kaste-masu-pasakumiem"),
    gallery: gallery("foto-kaste-masu-pasakumiem"),
  },

  // ─────────────────────── PIEPŪŠAMĀS ATRAKCIJAS ───────────────────────
  {
    slug: "mega-balta-pils",
    name: "MEGA Baltā pils",
    tagline: "Lēkāšana + 5 m slidkalniņš.",
    description: "Lēkāšana un 5 metru slidkalniņš — lielākā baltā pils.",
    category: "atrakcijas",
    tiers: [{ duration: "10h", price: 230 }],
    specs: [
      { label: "Izmēri (G×P×A)", value: "6 × 5 × 5 m" },
      { label: "Vecums", value: "2+" },
      { label: "Svars", value: "līdz 250 kg" },
    ],
    includes: atrakcijasIncludes,
    coverImage: cover("mega-balta-pils"),
    gallery: gallery("mega-balta-pils"),
    featured: true,
  },
  {
    slug: "balta-pils-xl",
    name: "Baltā pils XL",
    tagline: "Lēkāšana + slidkalniņš + bumbu vanna.",
    description: "Lēkāšana, slidkalniņš un bumbu vanna.",
    category: "atrakcijas",
    tiers: [{ duration: "10h", price: 180 }],
    addOns: [{ name: "Baltas bumbas (2500–3500 gb)", price: 30 }],
    specs: [
      { label: "Izmēri (G×P×A)", value: "5 × 4 × 4 m" },
      { label: "Vecums", value: "2+" },
      { label: "Svars", value: "līdz 200 kg" },
    ],
    includes: atrakcijasIncludes,
    coverImage: cover("balta-pils-xl"),
    gallery: gallery("balta-pils-xl"),
  },
  {
    slug: "baltie-pils-torni",
    name: "Baltie pils torņi",
    tagline: "Lēkāšana + slidkalniņš + bumbu vanna.",
    description: "Lēkāšana, slidkalniņš un bumbu vanna.",
    category: "atrakcijas",
    tiers: [{ duration: "10h", price: 170 }],
    addOns: [{ name: "Baltas bumbas (2500–3500 gb)", price: 20 }],
    specs: [
      { label: "Izmēri (G×P×A)", value: "4,5 × 4,5 × 3 m" },
      { label: "Vecums", value: "2+" },
      { label: "Svars", value: "līdz 200 kg" },
    ],
    includes: atrakcijasIncludes,
    coverImage: cover("baltie-pils-torni"),
    gallery: gallery("baltie-pils-torni"),
  },
  {
    slug: "baltais-pils-tornis-l",
    name: "Baltais pils tornis L",
    tagline: "Klasiskā baltā lēkāšanas pils, lielā izmēra.",
    description: "Baltais pils tornis lielā izmērā.",
    category: "atrakcijas",
    tiers: [{ duration: "10h", price: 150 }],
    specs: [
      { label: "Izmēri (G×P×A)", value: "4 × 4 × 4 m" },
      { label: "Vecums", value: "2+" },
      { label: "Svars", value: "līdz 200 kg" },
    ],
    includes: atrakcijasIncludes,
    coverImage: cover("baltais-pils-tornis-l"),
    gallery: gallery("baltais-pils-tornis-l"),
  },
  {
    slug: "mini-pilskalnins",
    name: "Mini pilskalniņš",
    tagline: "Kompakta baltā pils mazākajiem.",
    description: "Kompakta baltā lēkāšanas pils mazākiem laukumiem.",
    category: "atrakcijas",
    tiers: [{ duration: "10h", price: 100 }],
    specs: [
      { label: "Izmēri (G×P×A)", value: "2,5 × 2,5 × 2,5 m" },
      { label: "Vecums", value: "2+" },
      { label: "Svars", value: "līdz 200 kg" },
    ],
    includes: atrakcijasIncludes,
    coverImage: cover("mini-pilskalnins"),
    gallery: gallery("mini-pilskalnins"),
  },
  {
    slug: "baltais-pils-tornis-s",
    name: "Baltais pils tornis S",
    tagline: "Neliela baltā lēkāšanas pils.",
    description: "Baltais pils tornis mazā izmērā.",
    category: "atrakcijas",
    tiers: [{ duration: "10h", price: 100 }],
    specs: [
      { label: "Izmēri (G×P×A)", value: "2,5 × 2,5 × 2,5 m" },
      { label: "Vecums", value: "2+" },
      { label: "Svars", value: "līdz 200 kg" },
    ],
    includes: atrakcijasIncludes,
    coverImage: cover("baltais-pils-tornis-s"),
    gallery: gallery("baltais-pils-tornis-s"),
  },
  {
    slug: "balta-bumbu-vanna",
    name: "Baltā bumbu vanna",
    tagline: "Bumbu vanna mazākajiem — bumbas iekļautas.",
    description: "Baltā bumbu vanna; bumbas iekļautas cenā.",
    category: "atrakcijas",
    tiers: [{ duration: "10h", price: 120, note: "bumbas iekļautas" }],
    specs: [
      { label: "Izmēri (G×P×A)", value: "2,5 × 2 × 1 m" },
      { label: "Vecums", value: "1+" },
    ],
    includes: atrakcijasIncludes,
    coverImage: cover("balta-bumbu-vanna"),
    gallery: gallery("balta-bumbu-vanna"),
  },
  {
    slug: "baltais-komplekts-1",
    name: "Baltais komplekts 1",
    tagline: "Mini pilskalniņš + bumbu vanna.",
    description: "Mini pilskalniņš un bumbu vanna vienā komplektā.",
    category: "atrakcijas",
    tiers: [{ duration: "10h", price: 160, note: "bumbas iekļautas" }],
    specs: [
      { label: "Vecums", value: "1+" },
      { label: "Svars", value: "līdz 200 kg" },
    ],
    includes: atrakcijasIncludes,
    coverImage: cover("baltais-komplekts-1"),
    gallery: gallery("baltais-komplekts-1"),
  },
  {
    slug: "baltais-komplekts-2",
    name: "Baltais komplekts 2",
    tagline: "Baltais tornis S + bumbu vanna.",
    description: "Baltais tornis S un bumbu vanna vienā komplektā.",
    category: "atrakcijas",
    tiers: [{ duration: "10h", price: 160 }],
    specs: [
      { label: "Vecums", value: "1+" },
      { label: "Svars", value: "līdz 200 kg" },
    ],
    includes: atrakcijasIncludes,
    coverImage: cover("baltais-komplekts-2"),
    gallery: gallery("baltais-komplekts-2"),
  },
  {
    slug: "baltais-mega-komplekts",
    name: "Baltais Mega komplekts",
    tagline: "Baltie pils torņi L + bumbu vanna.",
    description: "Baltie pils torņi L un bumbu vanna vienā komplektā.",
    category: "atrakcijas",
    tiers: [{ duration: "10h", price: 200, note: "bumbas iekļautas" }],
    specs: [
      { label: "Vecums", value: "1+" },
      { label: "Svars", value: "līdz 200 kg" },
    ],
    includes: atrakcijasIncludes,
    coverImage: cover("baltais-mega-komplekts"),
    gallery: gallery("baltais-mega-komplekts"),
  },

  // ─────────────────── AUDIO/VIDEO VIESU GRĀMATAS ───────────────────
  {
    slug: "video-viesu-gramata-melns",
    name: "Video viesu grāmata — melns retro video telefons",
    tagline: "Viesu video sveicieni retro telefona stilā.",
    description:
      "Melns retro video telefons — viesi atstāj video sveicienus svētku gaviļniekiem.",
    category: "audio-video",
    tiers: [
      { duration: "24h", price: 150 },
      { duration: "48h", price: 250 },
      { duration: "72h", price: 350 },
    ],
    coverImage: cover("video-viesu-gramata-melns"),
    gallery: gallery("video-viesu-gramata-melns"),
    featured: true,
  },
  {
    slug: "audio-viesu-gramata-retro",
    name: "Audio viesu grāmata — retro telefons",
    tagline: "Balss sveicieni retro telefona klausulē (tikai kāzām).",
    description: "Retro telefons balss sveicieniem. Pieejams tikai kāzām.",
    category: "audio-video",
    tiers: [
      { duration: "24h", price: 50 },
      { duration: "48h", price: 80 },
      { duration: "72h", price: 120 },
    ],
    specs: [{ label: "Pieejamība", value: "tikai kāzām" }],
    coverImage: cover("audio-viesu-gramata-retro"),
    gallery: gallery("audio-viesu-gramata-retro"),
  },
  {
    slug: "audio-viesu-gramata-balts",
    name: "Audio viesu grāmata — balts telefons",
    tagline: "Balss sveicieni baltā telefona klausulē.",
    description: "Balts telefons viesu balss sveicieniem.",
    category: "audio-video",
    tiers: [
      { duration: "24h", price: 50 },
      { duration: "48h", price: 80 },
      { duration: "72h", price: 120 },
    ],
    coverImage: cover("audio-viesu-gramata-balts"),
    gallery: gallery("audio-viesu-gramata-balts"),
  },
  {
    slug: "audio-viesu-gramata-melns",
    name: "Audio viesu grāmata — melns telefons",
    tagline: "Balss sveicieni melnā telefona klausulē.",
    description: "Melns telefons viesu balss sveicieniem.",
    category: "audio-video",
    tiers: [
      { duration: "24h", price: 50 },
      { duration: "48h", price: 80 },
      { duration: "72h", price: 120 },
    ],
    coverImage: cover("audio-viesu-gramata-melns"),
    gallery: gallery("audio-viesu-gramata-melns"),
  },
  {
    slug: "audio-viesu-gramata-dzeltens",
    name: "Audio viesu grāmata — dzeltens telefons",
    tagline: "Balss sveicieni dzeltenā telefona klausulē.",
    description: "Dzeltens telefons viesu balss sveicieniem.",
    category: "audio-video",
    tiers: [
      { duration: "24h", price: 50 },
      { duration: "48h", price: 80 },
      { duration: "72h", price: 120 },
    ],
    coverImage: cover("audio-viesu-gramata-dzeltens"),
    gallery: gallery("audio-viesu-gramata-dzeltens"),
  },
  {
    slug: "dekorativa-budina-audio",
    name: "Dekoratīva būdiņa",
    tagline: "Būdiņa viesu grāmatai (grāmata nav iekļauta).",
    description:
      "Dekoratīva būdiņa. Viesu grāmata nav iekļauta, bet saderīga ar visām viesu grāmatām.",
    category: "audio-video",
    tiers: [
      { duration: "24h", price: 100 },
      { duration: "48h", price: 160 },
    ],
    coverImage: cover("dekorativa-budina-audio"),
    gallery: gallery("dekorativa-budina-audio"),
  },
  {
    slug: "dekorativa-siena-video",
    name: "Dekoratīva siena video telefonam",
    tagline: "LED gaisma, dekorējama siena video telefonam.",
    description: "Dekoratīva siena ar LED gaismu, dekorējama, video telefonam.",
    category: "audio-video",
    tiers: [
      { duration: "24h", price: 50 },
      { duration: "48h", price: 80 },
    ],
    coverImage: cover("dekorativa-siena-video"),
    gallery: gallery("dekorativa-siena-video"),
  },
  {
    slug: "koka-usb",
    name: "Personalizēts koka USB (5 GB)",
    tagline: "Koka USB ar personalizētu gravējumu — paliekoša piemiņa.",
    description:
      "Personalizēts koka USB, 5 GB, ar gravējumu. Ideāls, lai saglabātu pasākuma fotogrāfijas un video. Šis ir pārdošanas produkts (ne noma).",
    category: "audio-video",
    tiers: [{ duration: "gab.", price: 20, note: "+ piegāde (pārdošana)" }],
    specs: [
      { label: "Ietilpība", value: "5 GB" },
      { label: "Materiāls", value: "koks ar gravējumu" },
    ],
    coverImage: cover("koka-usb"),
    gallery: gallery("koka-usb"),
  },

  // ───────────────────────── SPECEFEKTI ─────────────────────────
  {
    slug: "auksto-dzirstelu-ierice",
    name: "Auksto dzirksteļu ierīce (salūts)",
    tagline: "Aukstās dzirksteles — ugunsdrošas iekštelpās, bērniem drošas.",
    description:
      "Tālvadības pults. Pilna uzpilde — līdz 8 min dzirksteļu. Ugunsdrošs iekštelpās, bērniem drošs. Dzirksteles 1–5 m. Saslēdzamas vienotā sistēmā ar DMX kabeļiem. Pieejamas 4 ierīces.",
    category: "specefekti",
    tiers: [{ duration: "24h", price: 35, note: "par 1 gb (uzpildīta, gatava)" }],
    addOns: [{ name: "Pulveris", price: 10, unit: "100 g" }],
    specs: [
      { label: "Pieejamas", value: "4 ierīces" },
      { label: "Darbība", value: "līdz 8 min dzirksteļu" },
      { label: "Augstums", value: "1–5 m" },
    ],
    includes: ["Instruktāža", "Bērniem droša"],
    coverImage: cover("auksto-dzirstelu-ierice"),
    gallery: gallery("auksto-dzirstelu-ierice"),
    featured: true,
  },
  {
    slug: "zemas-miglas-ierice",
    name: "Zemās miglas ierīce",
    tagline: "Blīva zemā migla apakšējā slānī.",
    description:
      "3000 W. Blīvi, aromātiski dūmi apakšējā slānī minūtes laikā. Aizpilda līdz 150 m².",
    category: "specefekti",
    tiers: [{ duration: "24h", price: 75, note: "uzpildīta 1h darbam" }],
    addOns: [{ name: "Šķidrums", price: 5, unit: "1 L" }],
    specs: [
      { label: "Jauda", value: "3000 W" },
      { label: "Pārklājums", value: "līdz 150 m²" },
    ],
    includes: ["Instruktāža", "Bērniem droša"],
    coverImage: cover("zemas-miglas-ierice"),
    gallery: gallery("zemas-miglas-ierice"),
  },
  {
    slug: "burbulu-ierice",
    name: "Burbuļu ierīce",
    tagline: "Simtiem burbuļu nepārtraukti.",
    description:
      "300 W. Simtiem burbuļu nepārtraukti. Aizpilda 30–40 m². Telpās un ārā.",
    category: "specefekti",
    tiers: [{ duration: "24h", price: 40, note: "uzpildīta 20 min darbam" }],
    addOns: [{ name: "Šķidrums", price: 5, unit: "1 L" }],
    specs: [
      { label: "Jauda", value: "300 W" },
      { label: "Pārklājums", value: "30–40 m²" },
    ],
    includes: ["Instruktāža", "Bērniem droša"],
    coverImage: cover("burbulu-ierice"),
    gallery: gallery("burbulu-ierice"),
  },

  // ───────────────────────── DECO / MĒBELES ─────────────────────────
  {
    slug: "sampaniesa-siena",
    name: "Šampanieša siena (50 glāzes)",
    tagline: "Viegli uzstādāma, stabila — papildināma ar LED uzrakstu.",
    description:
      "Viegli uzstādāma, stabila šampanieša siena 50 glāzēm. Papildināma ar LED uzrakstu.",
    category: "deco",
    tiers: [{ duration: "24h", price: 80 }],
    addOns: [{ name: "Glāzes", price: 1, unit: "gb" }],
    specs: [{ label: "Ietilpība", value: "50 glāzes" }],
    coverImage: cover("sampaniesa-siena"),
    gallery: gallery("sampaniesa-siena"),
    featured: true,
  },
  {
    slug: "dekorativa-budina-viesu",
    name: "Dekoratīva būdiņa viesu grāmatai",
    tagline: "Būdiņa viesu grāmatai (grāmata nav iekļauta).",
    description: "Dekoratīva būdiņa viesu grāmatai. Viesu grāmata nav iekļauta.",
    category: "deco",
    tiers: [
      { duration: "24h", price: 100 },
      { duration: "48h", price: 160 },
    ],
    coverImage: cover("dekorativa-budina-viesu"),
    gallery: gallery("dekorativa-budina-viesu"),
  },
  {
    slug: "darza-kresli",
    name: "Dārza krēsli",
    tagline: "Laikapstākļiem izturīgi krēsli.",
    description: "Laikapstākļiem izturīgi dārza krēsli. Pieejami 10 gb.",
    category: "deco",
    tiers: [{ duration: "24h", price: 8, note: "par 1 gb" }],
    specs: [{ label: "Pieejami", value: "10 gb" }],
    coverImage: cover("darza-kresli"),
    gallery: gallery("darza-kresli"),
  },
  {
    slug: "zelta-stabini-paklajs",
    name: "Zelta norobežojošie stabiņi + sarkanais paklājs",
    tagline: "Samta virve un sarkanais paklājs.",
    description: "Zelta norobežojošie stabiņi ar samta virvi un sarkanais paklājs.",
    category: "deco",
    tiers: [{ duration: "24h", price: 40 }],
    specs: [{ label: "Paklājs", value: "2 × 2,40 m" }],
    coverImage: cover("zelta-stabini-paklajs"),
    gallery: gallery("zelta-stabini-paklajs"),
  },
  {
    slug: "led-tikko-precejusies",
    name: "LED uzraksts „Tikko precējušies”",
    tagline: "Gaišs LED uzraksts kāzām.",
    description: "LED uzraksts „Tikko precējušies”.",
    category: "deco",
    tiers: [{ duration: "24h", price: 25 }],
    specs: [{ label: "Izmērs", value: "1018 × 199 mm" }],
    coverImage: cover("led-tikko-precejusies"),
    gallery: gallery("led-tikko-precejusies"),
  },
  {
    slug: "led-ballite",
    name: "LED uzraksts „Ballīte”",
    tagline: "Gaišs LED uzraksts ballītēm.",
    description: "LED uzraksts „Ballīte”.",
    category: "deco",
    tiers: [{ duration: "24h", price: 25 }],
    specs: [{ label: "Izmērs", value: "500 × 166 mm" }],
    coverImage: cover("led-ballite"),
    gallery: gallery("led-ballite"),
  },
  {
    slug: "led-svinam-dzivi",
    name: "LED uzraksts „Svinam dzīvi”",
    tagline: "Gaišs LED uzraksts svinībām.",
    description: "LED uzraksts „Svinam dzīvi”.",
    category: "deco",
    tiers: [{ duration: "24h", price: 25 }],
    specs: [{ label: "Izmērs", value: "787 × 157 mm" }],
    coverImage: cover("led-svinam-dzivi"),
    gallery: gallery("led-svinam-dzivi"),
  },

  // ───────────────────────── KUBLI / PIRTS (4 produkti) ─────────────────────────
  {
    slug: "vip-lux-kubls",
    name: "VIP / LUX kubls",
    tagline: "Līdz 6 cilvēkiem — hidromasāža, LED, termovāks.",
    description:
      "Līdz 6 cilvēkiem. Nav uz piekabes — novietojams pagalmā uz bruģa vai zālāja. Izmēri 2,20 × 2,20 m. Mūzikas sistēma, ūdens attīrīšanas filtrs, hidromasāža, gaisa burbuļu masāža, ūdens termometrs, krāsu mainošs LED iekšā un ārpusē, salokāms termovāks.",
    category: "kubli",
    tiers: [{ duration: "diena", price: 100 }],
    specs: [
      { label: "Ietilpība", value: "līdz 6 cilvēkiem" },
      { label: "Izmēri", value: "2,20 × 2,20 m" },
      { label: "Drošības nauda", value: "100 €" },
    ],
    coverImage: cover("vip-lux-kubls"),
    gallery: gallery("vip-lux-kubls"),
    altPhone: KUBLI_PHONE,
    featured: true,
  },
  {
    slug: "kubls-ar-terasi",
    name: "Kubls ar 13 m² terasi",
    tagline: "6–8 cilvēkiem — ar terasi, galdu un LED.",
    description:
      "6–8 cilvēkiem. Saliktā: 2,60 × 4,30 m (+1,5 m dīstele). Atvērtā: 3,50–4,70 × 5,70 m (+1,5 m). Komplektā: uzstādīšana un novākšana, saules/lietus sargs ar LED, galds ar krēsliem, 13 m pagarinātājs, 20 m ūdens šļūtene, 10 m noliešanas šļūtene. Hidromasāža, gaisa burbuļi, krāsu mainošs LED, salokāms termovāks (uzsilst 1,5–2h atkarībā no āra temperatūras).",
    category: "kubli",
    tiers: [{ duration: "diena", price: 80 }],
    specs: [
      { label: "Ietilpība", value: "6–8 cilvēkiem" },
      { label: "Drošības nauda", value: "100 €" },
    ],
    coverImage: cover("kubls-ar-terasi"),
    gallery: gallery("kubls-ar-terasi"),
    altPhone: KUBLI_PHONE,
  },
  {
    slug: "mobila-pirts",
    name: "Mobilā pirts",
    tagline: "Malkas krāsns, pirts + atpūtas telpa.",
    description:
      "Malkas krāsns. Iekšpuse dalīta: pirts telpa un atpūtas telpa. Ārpusē maza terase ar krēsliem, trepes, 10 m pagarinātājs, 4 atbalsta kājas. Izmēri: A 3,50 × P 2,50 × G 4,70 m (+1,4 m dīstele).",
    category: "kubli",
    tiers: [{ duration: "diena", price: 90 }],
    specs: [{ label: "Drošības nauda", value: "100 €" }],
    coverImage: cover("mobila-pirts"),
    gallery: gallery("mobila-pirts"),
    altPhone: KUBLI_PHONE,
  },
  {
    slug: "pirts-kubls-komplekts",
    name: "Pirts + kubls (komplekts)",
    tagline: "Divi varianti vienā komplektā.",
    description:
      "Komplekts ar diviem variantiem: Kubls ar terasi + Pirts, vai VIP/LUX kubls + Pirts.",
    category: "kubli",
    tiers: [
      { duration: "diena", price: 150, note: "Kubls ar terasi + Pirts" },
      { duration: "diena", price: 170, note: "VIP/LUX kubls + Pirts" },
    ],
    specs: [{ label: "Drošības nauda", value: "200 €" }],
    coverImage: cover("pirts-kubls-komplekts"),
    gallery: gallery("pirts-kubls-komplekts"),
    altPhone: KUBLI_PHONE,
  },
];

export function getProductsByCategory(category: ProductCategory): Product[] {
  return products.filter((p) => p.category === category);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}
