import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { getTextOverrides } from "@/lib/text-overrides";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const base = (await import(`../messages/${locale}.json`)).default as Record<
    string,
    Record<string, string>
  >;
  // Klonē (importētais modulis ir koplietots) un pārklāj DB teksta pārrakstus.
  const messages: Record<string, Record<string, string>> = structuredClone(base);
  try {
    const overrides = await getTextOverrides();
    for (const [fullKey, ml] of overrides) {
      const i = fullKey.indexOf(".");
      const ns = fullKey.slice(0, i);
      const sub = fullKey.slice(i + 1);
      const val = ml[locale as keyof typeof ml] || ml.lv;
      if (!val) continue;
      (messages[ns] ??= {})[sub] = val;
    }
  } catch {
    /* bez pārrakstiem → tīri messages */
  }

  return { locale, messages };
});
