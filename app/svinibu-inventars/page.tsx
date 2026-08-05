import type { Metadata } from "next";
import { getProductsByCategory } from "@/lib/products";
import SectionHero from "@/components/section-hero";
import ProductDetail from "@/components/product-detail";
import DeliveryNote from "@/components/delivery-note";
import CtaSection from "@/components/cta-section";

export const metadata: Metadata = {
  title: "Svinību inventāra noma | Anabella Party",
  description:
    "Aukstās dzirksteles un audio grāmata svētkiem Latvijā. Iespaidīgi specefekti un sirsnīga piemiņa. No €35. Piegāde Pierīgā bez maksas.",
};

export default function SvinibuInventarsPage() {
  const items = getProductsByCategory("inventars");

  return (
    <>
      <SectionHero
        title="Svinību inventārs"
        tagline="Detaļas, kas rada atmosfēru — specefekti un piemiņas, kas papildina Tavu pasākumu."
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
