import type { Metadata } from "next";
import { getProductsByCategory } from "@/lib/products";
import SectionHero from "@/components/section-hero";
import ProductDetail from "@/components/product-detail";
import DeliveryNote from "@/components/delivery-note";
import CtaSection from "@/components/cta-section";

export const metadata: Metadata = {
  title: "Foto kastu noma | Anabella Party",
  description:
    "SPOGULIS un INSTAGRAM foto kastes ballītēm un kāzām Latvijā. Neierobežotas izdrukas, rekvizīti, operators. No €220. Piegāde Pierīgā bez maksas.",
};

export default function FotoKastePage() {
  const items = getProductsByCategory("foto-kaste");

  return (
    <>
      <SectionHero
        title="Foto kastes"
        tagline="Uztver mirkļus, kas paliek — tūlītējas izdrukas un digitāla galerija katram pasākumam."
      />
      <div className="mx-auto max-w-6xl space-y-12 px-6 py-16">
        {items.map((product) => (
          <ProductDetail key={product.slug} product={product} />
        ))}
        <DeliveryNote />
      </div>
      <CtaSection />
    </>
  );
}
