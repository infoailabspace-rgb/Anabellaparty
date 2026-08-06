import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getProductsByCategory } from "@/lib/catalog";
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
  const [items, t] = await Promise.all([
    getProductsByCategory("specefekti"),
    getTranslations("pages"),
  ]);

  return (
    <>
      <SectionHero
        title={t("specefektiTitle")}
        tagline={t("specefektiTagline")}
      />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="space-y-12">
          {items.map((product, i) => (
            <ProductDetail key={product.slug} product={product} index={i} />
          ))}
        </div>

        <Reveal>
          <p className="mt-10 rounded-2xl border border-gold/25 bg-navy/25 p-5 text-center text-xs text-text/60">
            * Auksto dzirksteļu salūta laikā veidojas neliela putekļu nogulsne.
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
