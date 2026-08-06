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
  return pageMetadata(
    locale,
    "audioVideo",
    "/svinibu-inventars/audio-viesu-gramatas",
  );
}

const addOns = [
  { name: "Info statīvs (rāmītis)", price: "10 €" },
  { name: "USB koka kastīte ar personalizētu gravējumu", price: "20 €" },
  { name: "Video apsveikumu videomontāža (viens fails ar mūziku, tekstu)", price: "no 30 €" },
];

export const revalidate = 300;

export default async function AudioViesuGramatasPage() {
  const [items, t] = await Promise.all([
    getProductsByCategory("audio-video"),
    getTranslations("pages"),
  ]);

  return (
    <>
      <SectionHero
        title={t("audioVideoTitle")}
        tagline={t("audioVideoTagline")}
      />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <p className="mb-10 rounded-2xl border border-gold/25 bg-navy/25 p-5 text-center text-sm text-text/75">
            Faili no audio/video viesu grāmatām tiek glabāti{" "}
            <span className="font-semibold text-text">30 dienas</span>.
          </p>
        </Reveal>

        <div className="space-y-12">
          {items.map((product, i) => (
            <ProductDetail key={product.slug} product={product} index={i} />
          ))}
        </div>

        {/* Papildinājumi */}
        <Reveal>
          <div className="mt-12 rounded-3xl border-2 border-gold/25 bg-navy/25 p-6 sm:p-10">
            <h2 className="font-display text-2xl font-bold">Papildinājumi</h2>
            <ul className="mt-5 space-y-3">
              {addOns.map((a) => (
                <li
                  key={a.name}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-gold/10 pb-3 text-sm"
                >
                  <span className="text-text/85">{a.name}</span>
                  <span className="font-mono font-semibold text-gold">
                    {a.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Video pamācība */}
        <Reveal>
          <div className="mt-6 overflow-hidden rounded-3xl border-2 border-gold/25 bg-navy/25 p-6 sm:p-10">
            <h2 className="font-display text-2xl font-bold">Video pamācība</h2>
            <div className="mt-5 aspect-video w-full overflow-hidden rounded-xl">
              <iframe
                title="Video pamācība"
                src="https://www.youtube.com/embed/hIrsgkIkbnY"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
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
