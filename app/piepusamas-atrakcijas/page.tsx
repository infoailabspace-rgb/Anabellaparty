import type { Metadata } from "next";
import { getProductsByCategory } from "@/lib/products";
import SectionHero from "@/components/section-hero";
import ProductDetail from "@/components/product-detail";
import DeliveryNote from "@/components/delivery-note";
import CtaSection from "@/components/cta-section";

export const metadata: Metadata = {
  title: "Piepūšamo atrakciju noma | Anabella Party",
  description:
    "Baltā piepūšamā pils bērnu ballītēm un svinīgiem pasākumiem Latvijā. Droša, izturīga, fotogēniska. €230/10h. Piegāde Pierīgā bez maksas.",
};

export default function PiepusamasAtrakcijasPage() {
  const items = getProductsByCategory("atrakcijas");

  return (
    <>
      <SectionHero
        title="Piepūšamās atrakcijas"
        tagline="Prieks bērniem un skaists kadrs pieaugušajiem — drošas atrakcijas ar piegādi un uzstādīšanu."
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
