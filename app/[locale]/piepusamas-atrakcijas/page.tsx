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
  return pageMetadata(locale, "atrakcijas", "/piepusamas-atrakcijas");
}

export const revalidate = 300;

export default async function PiepusamasAtrakcijasPage() {
  const [items, t] = await Promise.all([
    getProductsByCategory("atrakcijas"),
    getTranslations("pages"),
  ]);

  return (
    <>
      <SectionHero
        title={t("atrakcijasTitle")}
        tagline={t("atrakcijasTagline")}
        video="/videos/herovideo2.mp4"
      />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="space-y-12">
          {items.map((product, i) => (
            <ProductDetail key={product.slug} product={product} index={i} />
          ))}
        </div>

        {/* Baltas bumbas */}
        <Reveal>
          <div className="mt-12 rounded-2xl border border-gold/25 bg-navy/25 p-6 text-center text-sm text-text/75">
            <span className="font-semibold text-text">Baltas bumbas</span> (2500–3500 gb):
            XL atrakcijām <span className="font-mono text-gold">30 €</span>, L atrakcijām{" "}
            <span className="font-mono text-gold">20 €</span>.
          </div>
        </Reveal>

        {/* Bumbu tīrīšanas ierīce — info */}
        <Reveal>
          <div className="mt-6 rounded-3xl border-2 border-gold/25 bg-navy/25 p-6 sm:p-10">
            <h2 className="font-display text-2xl font-bold">
              Bumbu tīrīšanas ierīce
            </h2>
            <p className="mt-4 max-w-2xl text-text/80">
              Ierīce iesūc bumbu, apmazgā to ar ekoloģisku, bērniem nekaitīgu
              līdzekli un izmet tīru un dezinficētu. Tā mēs nodrošinām, ka katra
              atrakcija ir higiēniski droša ikvienam mazajam viesim.
            </p>
          </div>
        </Reveal>

        <div className="mt-12">
          <DeliveryNote />
        </div>
      </div>

      <CtaSection />
    </>
  );
}
