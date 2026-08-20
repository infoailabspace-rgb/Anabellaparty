import { COMPANY } from "@/lib/company";
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
    alternateName: [
      "Anabella Svētku inventārs",
      "Svētku inventārs Anabella",
      "Anabella",
    ],
    legalName: COMPANY.legalName,
    vatID: COMPANY.vatNr,
    taxID: COMPANY.regNr,
    telephone: COMPANY.contact.phone,
    email: COMPANY.contact.email,
    url: SITE_URL,
    image: abs("/logo/logo-full.png"),
    priceRange: "€€",
    currenciesAccepted: "EUR",
    paymentAccepted: "Bankas pārskaitījums, PVN rēķins ar pēcapmaksu",
    foundingDate: "2022",
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.address.street,
      addressLocality: COMPANY.address.city,
      addressRegion: COMPANY.address.region,
      postalCode: COMPANY.address.postalCode,
      addressCountry: COMPANY.address.country,
    },
    areaServed: { "@type": "Country", name: "Latvija" },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "56.810939",
      longitude: "24.208242",
    },
    sameAs: [
      COMPANY.social.instagram,
      COMPANY.social.facebook,
      "https://ligavam.lv/kazam/kazu-inventara-noma/svetku-inventars-anabella",
      "https://ligavam.lv/en/wedding/wedding-equipment-rental/festive-inventory-anabella",
    ],
  };
}

// Bāzes tarifa ilgums → schema.org referenceQuantity (2h → 2 HUR, diena → 1 DAY).
function refQuantity(duration: string) {
  const h = duration.match(/^(\d+)\s*h/i);
  if (h) return { "@type": "QuantitativeValue", value: h[1], unitCode: "HUR" };
  if (/dien|day|день/i.test(duration))
    return { "@type": "QuantitativeValue", value: "1", unitCode: "DAY" };
  return null;
}

// Product — cena bez PVN (zemākais tarifs); contactOnly bez Offer.
export function productNode(p: Product, locale: string, pagePath: string) {
  const pricedTiers = p.tiers.filter((t) => t.price > 0);
  const pageUrl = `${SITE_URL}${localizedPath(locale, pagePath)}`;
  const node: Record<string, unknown> = {
    "@type": "Product",
    name: p.name,
    description: p.description || p.tagline,
    category: p.category,
    brand: { "@type": "Brand", name: COMPANY.brandName },
    url: `${pageUrl}#${p.slug}`,
  };
  if (p.coverImage)
    node.image = p.coverImage.startsWith("http")
      ? p.coverImage
      : abs(p.coverImage);
  if (pricedTiers.length) {
    // Bāzes tarifs = zemākā cena; offers.price un priceSpecification.price sakrīt.
    const base = pricedTiers.reduce(
      (m, t) => (t.price < m.price ? t : m),
      pricedTiers[0],
    );
    const ref = refQuantity(base.duration);
    node.offers = {
      "@type": "Offer",
      price: base.price,
      priceCurrency: "EUR",
      priceValidUntil: "2026-12-31",
      availability: "https://schema.org/InStock",
      url: pageUrl,
      seller: { "@id": `${SITE_URL}/#business` },
      // Cenas ir BEZ PVN → valueAddedTaxIncluded: false.
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: base.price,
        priceCurrency: "EUR",
        valueAddedTaxIncluded: false,
        ...(ref ? { referenceQuantity: ref } : {}),
      },
      // Noma ar neatgriežamu avansu → atgriešana nav atļauta (atbilst noteikumiem).
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "LV",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      },
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

// Article — bloga raksts. Autors = uzņēmums (bez izdomātiem vārdiem).
export function articleNode(
  post: {
    title: string;
    excerpt: string;
    cover: string | null;
    publishedAt: string | null;
    slug: string;
  },
  locale: string,
) {
  const url = `${SITE_URL}${localizedPath(locale, `/blogs/${post.slug}`)}`;
  const node: Record<string, unknown> = {
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Organization", name: COMPANY.brandName },
    publisher: { "@id": `${SITE_URL}/#business` },
    mainEntityOfPage: url,
    url,
  };
  if (post.publishedAt) {
    node.datePublished = post.publishedAt;
    node.dateModified = post.publishedAt;
  }
  if (post.cover)
    node.image = post.cover.startsWith("http") ? post.cover : abs(post.cover);
  return node;
}

// Sapludina vairākus mezglus vienā @graph.
export function graph(...nodes: unknown[]) {
  return { "@context": "https://schema.org", "@graph": nodes.filter(Boolean) };
}
