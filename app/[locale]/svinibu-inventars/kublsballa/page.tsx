import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getProductsByCategory } from "@/lib/catalog";
import { KUBLI_PHONE } from "@/lib/products";
import SectionHero from "@/components/section-hero";
import ProductDetail from "@/components/product-detail";
import CtaSection from "@/components/cta-section";
import Reveal from "@/components/reveal";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "kubli", "/svinibu-inventars/kublsballa");
}

export const revalidate = 300;

export default async function KublsballaPage() {
  const [items, t] = await Promise.all([
    getProductsByCategory("kubli"),
    getTranslations("pages"),
  ]);

  return (
    <>
      <SectionHero title={t("kubliTitle")} tagline={t("kubliTagline")} />

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
              cenas pēc vienošanās. Visas cenas norādītas bez PVN 21%.
            </p>
          </div>
        </Reveal>

        <div className="space-y-12">
          {items.map((product, i) => (
            <ProductDetail key={product.slug} product={product} index={i} />
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
