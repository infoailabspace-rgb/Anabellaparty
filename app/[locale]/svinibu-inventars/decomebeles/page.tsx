import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getProductsByCategory, getProductBySlug } from "@/lib/catalog";
import SectionHero from "@/components/section-hero";
import ProductDetail from "@/components/product-detail";
import DeliveryNote from "@/components/delivery-note";
import CtaSection from "@/components/cta-section";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "deco", "/svinibu-inventars/decomebeles");
}

export const revalidate = 300;

export default async function DecoMebelesPage() {
  const [usb, deco, t] = await Promise.all([
    getProductBySlug("koka-usb"),
    getProductsByCategory("deco"),
    getTranslations("pages"),
  ]);
  const items = [...deco, ...(usb ? [usb] : [])];

  return (
    <>
      <SectionHero title={t("decoTitle")} tagline={t("decoTagline")} />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="space-y-12">
          {items.map((product, i) => (
            <ProductDetail key={product.slug} product={product} index={i} />
          ))}
        </div>

        <div className="mt-12">
          <DeliveryNote />
        </div>
      </div>

      <CtaSection />
    </>
  );
}
