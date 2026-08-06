import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { localizedPath, SITE_URL } from "@/lib/seo";

const base = SITE_URL;

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

// LV saknē (bez prefiksa), en/ru ar prefiksu; trailingSlash.
function url(locale: string, route: string): string {
  return `${base}${localizedPath(locale, route)}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const route of routes) {
    const languages: Record<string, string> = {};
    for (const l of routing.locales) languages[l] = url(l, route);
    languages["x-default"] = url(routing.defaultLocale, route);

    for (const locale of routing.locales) {
      entries.push({
        url: url(locale, route),
        lastModified: now,
        changeFrequency: "weekly",
        priority: route === "" ? 1 : 0.7,
        alternates: { languages },
      });
    }
  }

  return entries;
}
