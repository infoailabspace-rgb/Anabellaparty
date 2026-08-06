import type { Metadata } from "next";
import { getProductsByCategory, getProductBySlug } from "@/lib/catalog";
import SectionHero from "@/components/section-hero";
import ProductDetail from "@/components/product-detail";
import DeliveryNote from "@/components/delivery-note";
import CtaSection from "@/components/cta-section";

export const metadata: Metadata = {
  title: "Deco un mēbeles svētkiem | Anabella Party",
  description:
    "Šampanieša siena, LED uzraksti, dārza krēsli un dekori pasākumiem Latvijā. No €8. Piegāde Pierīgā bez maksas.",
};

export const revalidate = 300;

export default async function DecoMebelesPage() {
  const usb = await getProductBySlug("koka-usb");
  const items = [...(await getProductsByCategory("deco")), ...(usb ? [usb] : [])];

  return (
    <>
      <SectionHero
        title="Deco / mēbeles"
        tagline="Detaļas, kas veido noskaņu — no šampanieša sienas līdz LED uzrakstiem."
      />

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
