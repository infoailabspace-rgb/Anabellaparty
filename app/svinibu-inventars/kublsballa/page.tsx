import type { Metadata } from "next";
import { getProductsByCategory, KUBLI_PHONE } from "@/lib/products";
import SectionHero from "@/components/section-hero";
import ProductDetail from "@/components/product-detail";
import CtaSection from "@/components/cta-section";
import Reveal from "@/components/reveal";

export const metadata: Metadata = {
  title: "Kublu un pirts noma | Anabella Party",
  description:
    "VIP kubli un mobilā pirts nomai (atrodas Jūrmalā). Hidromasāža, LED, termovāks. No €80/diena. Piegāde pēc vienošanās atkarībā no attāluma.",
};

export default function KublsballaPage() {
  const items = getProductsByCategory("kubli");

  return (
    <>
      <SectionHero
        title="Kubli / pirts"
        tagline="VIP kubli un mobilā pirts Tavai atpūtai — hidromasāža, LED un termovāks."
      />

      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Svarīgā atzīme */}
        <Reveal>
          <div className="mb-12 rounded-2xl border-2 border-gold bg-gold/10 p-6">
            <p className="text-text/90">
              <span className="font-semibold text-gold">Uzmanību:</span> kubliem
              un pirtij ir atsevišķs tālrunis{" "}
              <a
                href={`tel:+371${KUBLI_PHONE}`}
                className="font-mono font-bold text-gold underline"
              >
                {KUBLI_PHONE}
              </a>
              . Kubli atrodas <span className="font-semibold">Jūrmalā</span>;
              piegādes cena — pēc vienošanās atkarībā no attāluma. Svētku dienās
              cenas pēc vienošanās.
            </p>
          </div>
        </Reveal>

        <div className="space-y-12">
          {items.map((product) => (
            <ProductDetail key={product.slug} product={product} />
          ))}
        </div>
      </div>

      <CtaSection
        title="Ieinteresē kubls vai pirts?"
        text="Zvani vai raksti — pastāstīsim par pieejamību un piegādi."
        buttonLabel={`Zvanīt ${KUBLI_PHONE}`}
        href={`tel:+371${KUBLI_PHONE}`}
      />
    </>
  );
}
