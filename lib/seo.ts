import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://anabellaparty.vercel.app";

// Ceļš ar valodas prefiksu (LV saknē, en/ru ar prefiksu).
export function localizedPath(locale: string, path = ""): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${prefix}${path}` || "/";
}

// alternates bloks generateMetadata vajadzībām (canonical + hreflang).
// Ceļi relatīvi — metadataBase (root layout) tos padara absolūtus.
export function alternatesFor(locale: string, path = "") {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = localizedPath(l, path);
  languages["x-default"] = localizedPath(routing.defaultLocale, path);
  return { canonical: localizedPath(locale, path), languages };
}

// Lapas metadata no `pages` namespace (title+tagline) + hreflang alternates.
export async function pageMetadata(
  locale: string,
  key: string,
  path: string,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "pages" });
  return {
    title: `${t(`${key}Title`)} | Anabella Party`,
    description: t(`${key}Tagline`),
    alternates: alternatesFor(locale, path),
  };
}
