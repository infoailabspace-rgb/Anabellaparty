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
