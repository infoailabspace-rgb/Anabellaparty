import type { Metadata } from "next";
import { getProductsByCategory } from "@/lib/products";
import SectionHero from "@/components/section-hero";
import ProductDetail from "@/components/product-detail";
import DeliveryNote from "@/components/delivery-note";
import CtaSection from "@/components/cta-section";
import Reveal from "@/components/reveal";

export const metadata: Metadata = {
  title: "Specefekti — dzirksteles, migla, burbuļi | Anabella Party",
  description:
    "Aukstās dzirksteles, zemā migla un burbuļu ierīces svētkiem Latvijā. Ugunsdroši, bērniem droši efekti. No €35. Piegāde Pierīgā bez maksas.",
};

export default function SpecefektiPage() {
  const items = getProductsByCategory("specefekti");

  return (
    <>
      <SectionHero
        title="Specefekti"
        tagline="Iespaidīgi mirkļi — dzirksteles, migla un burbuļi. Visām ierīcēm instruktāža, visas bērniem drošas."
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
