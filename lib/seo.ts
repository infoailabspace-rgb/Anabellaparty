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
  lv: "Pasākumu inventāra noma Latvijā",
  en: "Event equipment rental in Latvia",
  ru: "Аренда праздничного инвентаря в Латвии",
};
const HOME_DESC: Record<string, string> = {
  lv: "Foto kastes, piepūšamās atrakcijas, specefekti un audio grāmata Tavai neaizmirstamai ballītei. Piegāde visā Latvijā.",
  en: "Photo booths, inflatables, special effects and an audio guest book for your unforgettable party. Delivery across Latvia.",
  ru: "Фотобудки, надувные аттракционы, спецэффекты и аудио гостевая книга для вашей незабываемой вечеринки. Доставка по всей Латвии.",
};

// Sākumlapas metadata — zīmola virsraksts + OG (admin/statiskais attēls).
export async function homeMetadata(locale: string): Promise<Metadata> {
  const title = `Anabella Party — ${HOME_TITLE[locale] ?? HOME_TITLE.lv}`;
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
