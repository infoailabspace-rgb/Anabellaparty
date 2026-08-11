import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { getProductsByCategory } from "@/lib/catalog";
import { KUBLI_PHONE } from "@/lib/products";
import JsonLd from "@/components/seo/json-ld";
import { graph, productNode, breadcrumbNode } from "@/lib/schema";
import SectionHero from "@/components/section-hero";
import ProductDetail from "@/components/product-detail";
import CtaSection from "@/components/cta-section";
import EventGallery from "@/components/event-gallery";
import { getGallery } from "@/lib/site-data";
import Reveal from "@/components/reveal";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "kubli", "/svinibu-inventars/kublsballa");
}

export const revalidate = 300;

export default async function KublsballaPage() {
  const [items, t, ts, locale, gallery] = await Promise.all([
    getProductsByCategory("kubli"),
    getTranslations("pages"),
    getTranslations("sec"),
    getLocale(),
    getGallery("kubli"),
  ]);
  const path = "/svinibu-inventars/kublsballa";

  return (
    <>
      <JsonLd
        data={graph(
          ...items.map((p) => productNode(p, locale, path)),
          breadcrumbNode(locale, [
            { name: t("inventarsTitle"), path: "/svinibu-inventars" },
            { name: t("kubliTitle"), path },
          ]),
        )}
      />
      <SectionHero title={t("kubliTitle")} tagline={t("kubliTagline")} heroKey="kubli" />

      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Svarīgā atzīme */}
        <Reveal>
          <div className="mb-12 rounded-2xl border-2 border-gold bg-gold/10 p-6">
            <p className="text-text/90">
              {ts("kbNotePre")}
              <a
                href={`tel:+371${KUBLI_PHONE}`}
                className="font-mono font-bold text-gold underline"
              >
                +371 {KUBLI_PHONE}
              </a>
              {ts("kbNotePost")}
            </p>
          </div>
        </Reveal>

        <div className="space-y-12">
          {items.map((product, i) => (
            <ProductDetail key={product.slug} product={product} index={i} />
          ))}
        </div>
      </div>

      <EventGallery images={gallery} />
      <CtaSection
        title={ts("kbCtaTitle")}
        text={ts("kbCtaText")}
        buttonLabel={ts("rCall") + " +371 " + KUBLI_PHONE}
        href={`tel:+371${KUBLI_PHONE}`}
      />
    </>
  );
}
