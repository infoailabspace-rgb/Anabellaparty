import { COMPANY, fullAddress } from "@/lib/company";
import { SITE_URL, localizedPath } from "@/lib/seo";
import type { Product } from "@/lib/products";
import type { FaqItem } from "@/lib/faq";

const abs = (path: string) => `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

// LocalBusiness — uzņēmuma dati (rekvizīti no company.ts).
export function localBusinessNode() {
  return {
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#business`,
    name: COMPANY.brandName,
    legalName: COMPANY.legalName,
    vatID: COMPANY.vatNr,
    taxID: COMPANY.regNr,
    telephone: COMPANY.contact.phone,
    email: COMPANY.contact.email,
    url: SITE_URL,
    image: abs("/logo/logo-full.png"),
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.address.street,
      addressLocality: COMPANY.address.city,
      addressRegion: COMPANY.address.region,
      postalCode: COMPANY.address.postalCode,
      addressCountry: COMPANY.address.country,
    },
    areaServed: fullAddress,
    sameAs: [COMPANY.social.instagram, COMPANY.social.facebook],
  };
}

// Product — cena bez PVN (zemākais tarifs); contactOnly bez Offer.
export function productNode(p: Product, locale: string, pagePath: string) {
  const priced = p.tiers.filter((t) => t.price > 0).map((t) => t.price);
  const pageUrl = `${SITE_URL}${localizedPath(locale, pagePath)}`;
  const node: Record<string, unknown> = {
    "@type": "Product",
    name: p.name,
    description: p.description || p.tagline,
    category: p.category,
    brand: { "@type": "Brand", name: COMPANY.brandName },
    url: `${pageUrl}#${p.slug}`,
  };
  if (p.coverImage) node.image = abs(p.coverImage);
  if (priced.length) {
    node.offers = {
      "@type": "Offer",
      price: Math.min(...priced),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: pageUrl,
      seller: { "@id": `${SITE_URL}/#business` },
    };
  }
  return node;
}

// FAQPage — no getFaqs() (izvēlētajā valodā).
export function faqPageNode(faqs: FaqItem[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

// BreadcrumbList — automātiski pievieno sākumu (zīmols) kā pirmo posmu.
export function breadcrumbNode(
  locale: string,
  trail: { name: string; path: string }[],
) {
  const items = [{ name: COMPANY.brandName, path: "" }, ...trail];
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${localizedPath(locale, it.path)}`,
    })),
  };
}

// Sapludina vairākus mezglus vienā @graph.
export function graph(...nodes: unknown[]) {
  return { "@context": "https://schema.org", "@graph": nodes.filter(Boolean) };
}
