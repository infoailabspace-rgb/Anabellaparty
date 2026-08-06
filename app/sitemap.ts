import type { MetadataRoute } from "next";

const base =
  process.env.NEXT_PUBLIC_SITE_URL || "https://anabellaparty.vercel.app";

const routes = [
  "",
  "/foto-kaste",
  "/foto-kaste/ai-foto",
  "/piepusamas-atrakcijas",
  "/svinibu-inventars",
  "/svinibu-inventars/audio-viesu-gramatas",
  "/svinibu-inventars/specefekti",
  "/svinibu-inventars/decomebeles",
  "/svinibu-inventars/kublsballa",
  "/rezervet",
  "/kontakti",
  "/faq",
  "/musu-draugi",
  "/noteikumi",
  "/privatuma-politika",
  "/sikdatnu-politika",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((r) => ({
    url: `${base}${r}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: r === "" ? 1 : 0.7,
  }));
}
