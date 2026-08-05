export type ProductCategory = "foto-kaste" | "atrakcijas" | "inventars";

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: { amount: number; unit: string; extra?: string };
  specs: { label: string; value: string }[];
  includes: string[];
  images: string[];
  category: ProductCategory;
};

export const products: Product[] = [
  {
    slug: "spogulis",
    name: "SPOGULIS foto kaste",
    tagline: "Pilna auguma spogulis, kas uzņem un izdrukā mirkļus uz vietas.",
    description:
      "Interaktīvs pilna auguma spogulis ar animētu skārienekrānu un profesionālu apgaismojumu. Viesi pieskaras ekrānam, pozē un dažu sekunžu laikā saņem izdrukātu foto. Ideāls kāzām, jubilejām un korporatīvajiem pasākumiem, kur gribas gan izklaidi, gan taustāmu piemiņu.",
    price: { amount: 260, unit: "2h", extra: "+€110 par katru nākamo stundu" },
    specs: [
      { label: "Noma", value: "2 stundas (pagarināma)" },
      { label: "Izdrukas", value: "Neierobežotas 2h laikā" },
      { label: "Formāts", value: "10×15 cm, uzreiz" },
      { label: "Uzstādīšana", value: "Iekļauta, ~45 min" },
    ],
    includes: [
      "Neierobežotas izdrukas visa pasākuma laikā",
      "Rekvizītu komplekts (cepures, brilles, tāfelītes)",
      "Operators visu nomas laiku",
      "Personalizēts izdruku dizains ar pasākuma vārdiem",
      "Digitālā fotogrāfiju kopija pēc pasākuma",
    ],
    images: [
      "/images/products/spogulis-1.jpg",
      "/images/products/spogulis-2.jpg",
      "/images/products/spogulis-3.jpg",
    ],
    category: "foto-kaste",
  },
  {
    slug: "instagram",
    name: "INSTAGRAM foto kaste",
    tagline: "Kompakta foto kaste ar tūlītējām izdrukām un GIF animācijām.",
    description:
      "Stilīga stāvā foto kaste ar kvalitatīvu kameru un gredzengaismu. Uzņem fotogrāfijas, bumerangus un GIF, kurus viesi uzreiz saņem izdrukas veidā vai saņem savā telefonā. Vienkārša lietošana, patīkams dizains — der jebkuram svētku formātam.",
    price: { amount: 220, unit: "2h" },
    specs: [
      { label: "Noma", value: "2 stundas" },
      { label: "Režīmi", value: "Foto, GIF, bumerangs" },
      { label: "Izdrukas", value: "Neierobežotas 2h laikā" },
      { label: "Uzstādīšana", value: "Iekļauta, ~30 min" },
    ],
    includes: [
      "Neierobežotas izdrukas 2 stundu laikā",
      "Rekvizītu komplekts",
      "Fona sistēma pēc izvēles",
      "Digitālā galerija pēc pasākuma",
    ],
    images: [
      "/images/products/instagram-1.jpg",
      "/images/products/instagram-2.jpg",
    ],
    category: "foto-kaste",
  },
  {
    slug: "piepusama-pils",
    name: "Piepūšamā pils (balta)",
    tagline: "Elegantā baltā atrakcija bērniem — droša un fotogēniska.",
    description:
      "Baltā piepūšamā pils iederas gan bērnu ballītēs, gan svinīgos pasākumos, kur svarīgs kopējais estētiskais tēls. Izturīgs materiāls, drošs tīkla nožogojums un mīksta pamatne. Piegādājam, uzstādām un savācam paši.",
    price: { amount: 230, unit: "10h" },
    specs: [
      { label: "Noma", value: "Līdz 10 stundām" },
      { label: "Krāsa", value: "Balta" },
      { label: "Vieta", value: "Nepieciešams ~4×4 m līdzens laukums" },
      { label: "Barošana", value: "230V, gaisa pūtējs iekļauts" },
    ],
    includes: [
      "Piegāde, uzstādīšana un savākšana",
      "Gaisa pūtējs un pagarinātājs",
      "Drošības instruktāža",
      "Pamatnes paklājs",
    ],
    images: [
      "/images/products/piepusama-pils-1.jpg",
      "/images/products/piepusama-pils-2.jpg",
    ],
    category: "atrakcijas",
  },
  {
    slug: "dzirksteles",
    name: "Specefekti — aukstās dzirksteles",
    tagline: "Iespaidīgs dzirksteļu efekts pirmajai dejai vai tostam.",
    description:
      "Aukstās dzirksteles (cold spark) rada 2–4 metrus augstu dzirksteļu strūklu bez uguns un dūmu smakas. Droši lietot arī iekštelpās. Perfekti kāzu pirmajai dejai, torša iznešanai vai svinīgam tosta brīdim — kadrs, kas paliek atmiņā.",
    price: { amount: 35, unit: "24h", extra: "cena par vienu iekārtu" },
    specs: [
      { label: "Noma", value: "24 stundas" },
      { label: "Augstums", value: "2–4 m regulējams" },
      { label: "Tips", value: "Aukstā dzirkstele, bez uguns" },
      { label: "Telpas", value: "Iekštelpām un ārā" },
    ],
    includes: [
      "Iekārta un pulveris vienam pasākumam",
      "Vadības pults",
      "Uzstādīšanas un lietošanas instruktāža",
    ],
    images: [
      "/images/products/dzirksteles-1.jpg",
      "/images/products/dzirksteles-2.jpg",
    ],
    category: "inventars",
  },
  {
    slug: "audio-gramata",
    name: "Audio grāmata",
    tagline: "Viesu balss sveicieni, ierakstīti telefona klausulē.",
    description:
      "Vintāžas telefona klausule, kurā viesi atstāj balss sveicienus svētku gaviļniekiem. Pēc pasākuma saņemat visus ierakstus kā digitālu audio kolekciju — sirsnīga un negaidīti aizkustinoša piemiņa, kas papildina jebkuru svinību.",
    price: { amount: 50, unit: "pasākums" },
    specs: [
      { label: "Noma", value: "Viss pasākums" },
      { label: "Stils", value: "Retro telefona klausule" },
      { label: "Rezultāts", value: "Digitāli audio ieraksti" },
      { label: "Uzstādīšana", value: "Iekļauta" },
    ],
    includes: [
      "Iekārta visam pasākumam",
      "Personalizēts sveiciena teksts",
      "Visi ieraksti digitālā formātā pēc pasākuma",
    ],
    images: [
      "/images/products/audio-gramata-1.jpg",
      "/images/products/audio-gramata-2.jpg",
    ],
    category: "inventars",
  },
];

export function getProductsByCategory(category: ProductCategory): Product[] {
  return products.filter((p) => p.category === category);
}

// Populārākie produkti home page sekcijai (secībā).
export const featuredSlugs = [
  "spogulis",
  "instagram",
  "piepusama-pils",
  "dzirksteles",
] as const;

export function getFeaturedProducts(): Product[] {
  return featuredSlugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));
}
