import { defineRouting } from "next-intl/routing";

export const locales = ["lv", "en", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "lv";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // LV paliek saknē (bez prefiksa), en/ru = /en, /ru.
  localePrefix: "as-needed",
  // Neizmanto Accept-Language/cookie automātisko valodas noteikšanu: `/` vienmēr
  // pasniedz LV (noklusējumu), nevis 307-pāradresē uz /en/ (piem., robotiem/
  // PageSpeed ar Accept-Language: en). Valodu maina tikai skaidri caur /en, /ru.
  localeDetection: false,
});
