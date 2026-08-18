import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getSiteImage } from "@/lib/site-content";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.anabellaparty.lv";

// Ceļš ar valodas prefiksu (LV saknē, en/ru ar prefiksu) + trailingSlash.
export function localizedPath(locale: string, path = ""): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const p = `${prefix}${path}`;
  if (!p) return "/";
  return p.endsWith("/") ? p : `${p}/`;
}

// Statiskais rezerves OG attēls (public/) — vienmēr pieejams, ja admin nav iestatījis.
const OG_STATIC_FALLBACK = "/og-image.jpg";

// OG attēls: admin panelī iestatītais (site_content 'og.fallback', Supabase URL),
// citādi statiskais /og-image.jpg. metadataBase padara relatīvo absolūtu.
// (Dinamiskais /og route vairs netiek lietots — tas 404 produkcijā.)
async function ogImages(): Promise<NonNullable<Metadata["openGraph"]>["images"]> {
  const admin = await getSiteImage("og.fallback");
  return [{ url: admin || OG_STATIC_FALLBACK, width: 1200, height: 630 }];
}

// alternates bloks generateMetadata vajadzībām (canonical + hreflang).
// Ceļi relatīvi — metadataBase (root layout) tos padara absolūtus.
export function alternatesFor(locale: string, path = "") {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = localizedPath(l, path);
  languages["x-default"] = localizedPath(routing.defaultLocale, path);
  return { canonical: localizedPath(locale, path), languages };
}

// OpenGraph + Twitter bloks (kopīgs). Attēls = admin OG vai statiskais fallback.
export async function ogMetadata(
  locale: string,
  path: string,
  title: string,
  description: string,
): Promise<Metadata> {
  const images = await ogImages();
  return {
    openGraph: {
      title,
      description,
      url: localizedPath(locale, path),
      siteName: "Anabella Party",
      locale,
      type: "website",
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

const HOME_TITLE: Record<string, string> = {
  lv: "Foto kastes, AI foto un pasākumu inventārs",
  en: "Photo booths, AI photo and event equipment",
  ru: "Фотобудки, AI-фото и праздничный инвентарь",
};
const HOME_DESC: Record<string, string> = {
  lv: "Foto kastes, AI foto kaste un pasākumu inventārs. Korporatīvie pasākumi, Ziemassvētku ballītes un privātie svētki. Rēķins ar pēcapmaksu. 500+ pasākumi kopš 2022.",
  en: "Photo booths, AI photo booth and event equipment. Corporate events, Christmas parties and private celebrations. Invoice with deferred payment. 500+ events since 2022.",
  ru: "Фотобудки, AI-фотобудка и праздничный инвентарь. Корпоративы, новогодние вечеринки и частные праздники. Счёт с постоплатой. 500+ мероприятий с 2022 года.",
};

// Sākumlapas metadata — B2B virsraksts + OG (admin/statiskais attēls).
export async function homeMetadata(locale: string): Promise<Metadata> {
  const title = `${HOME_TITLE[locale] ?? HOME_TITLE.lv} | Anabella Party`;
  const description = HOME_DESC[locale] ?? HOME_DESC.lv;
  return {
    title,
    description,
    alternates: alternatesFor(locale, ""),
    ...(await ogMetadata(locale, "", title, description)),
  };
}

// Lapas metadata no `pages` namespace (title+tagline) + hreflang + OG/Twitter.
export async function pageMetadata(
  locale: string,
  key: string,
  path: string,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "pages" });
  const pageTitle = t(`${key}Title`);
  const title = `${pageTitle} | Anabella Party`;
  const description = t(`${key}Tagline`);
  return {
    title,
    description,
    alternates: alternatesFor(locale, path),
    ...(await ogMetadata(locale, path, title, description)),
  };
}
