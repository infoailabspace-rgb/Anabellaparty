import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { getProductsByCategory } from "@/lib/catalog";
import JsonLd from "@/components/seo/json-ld";
import { graph, productNode, breadcrumbNode } from "@/lib/schema";
import SectionHero from "@/components/section-hero";
import ProductDetail from "@/components/product-detail";
import DeliveryNote from "@/components/delivery-note";
import CtaSection from "@/components/cta-section";
import Reveal from "@/components/reveal";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "specefekti", "/svinibu-inventars/specefekti");
}

export const revalidate = 300;

export default async function SpecefektiPage() {
  const [items, t, ts, locale] = await Promise.all([
    getProductsByCategory("specefekti"),
    getTranslations("pages"),
    getTranslations("sec"),
    getLocale(),
  ]);
  const path = "/svinibu-inventars/specefekti";

  return (
    <>
      <JsonLd
        data={graph(
          ...items.map((p) => productNode(p, locale, path)),
          breadcrumbNode(locale, [
            { name: t("inventarsTitle"), path: "/svinibu-inventars" },
            { name: t("specefektiTitle"), path },
          ]),
        )}
      />
      <SectionHero
        title={t("specefektiTitle")}
        tagline={t("specefektiTagline")}
        heroKey="specefekti"
      />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="space-y-12">
          {items.map((product, i) => (
            <ProductDetail key={product.slug} product={product} index={i} />
          ))}
        </div>

        <Reveal>
          <p className="mt-10 rounded-2xl border border-gold/25 bg-navy/25 p-5 text-center text-xs text-text/60">
            {ts("specNote")}
          </p>
        </Reveal>

        <div className="mt-6">
          <DeliveryNote />
        </div>
      </div>

      <CtaSection />
    </>
  );
}
