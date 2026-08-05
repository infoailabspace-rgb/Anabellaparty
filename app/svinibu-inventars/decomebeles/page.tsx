import type { Metadata } from "next";
import { getProductsByCategory } from "@/lib/products";
import SectionHero from "@/components/section-hero";
import ProductDetail from "@/components/product-detail";
import DeliveryNote from "@/components/delivery-note";
import CtaSection from "@/components/cta-section";

export const metadata: Metadata = {
  title: "Deco un mēbeles svētkiem | Anabella Party",
  description:
    "Šampanieša siena, LED uzraksti, dārza krēsli un dekori pasākumiem Latvijā. No €8. Piegāde Pierīgā bez maksas.",
};

export default function DecoMebelesPage() {
  const items = getProductsByCategory("deco");

  return (
    <>
      <SectionHero
        title="Deco / mēbeles"
        tagline="Detaļas, kas veido noskaņu — no šampanieša sienas līdz LED uzrakstiem."
      />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="space-y-12">
          {items.map((product) => (
            <ProductDetail key={product.slug} product={product} />
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
