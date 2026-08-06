import { defineRouting } from "next-intl/routing";

export const locales = ["lv", "en", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "lv";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // LV paliek saknē (bez prefiksa), en/ru = /en, /ru.
  localePrefix: "as-needed",
});
