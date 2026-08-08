import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { getProductsByCategory } from "@/lib/catalog";
import JsonLd from "@/components/seo/json-ld";
import { graph, productNode, breadcrumbNode } from "@/lib/schema";
import SectionHero from "@/components/section-hero";
import ProductDetail from "@/components/product-detail";
import DeliveryNote from "@/components/delivery-note";
import CtaSection from "@/components/cta-section";
import EventGallery from "@/components/event-gallery";
import { getGallery } from "@/lib/site-data";
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
  { nameKey: "avAddOn1", price: "10 €" },
  { nameKey: "avAddOn2", price: "20 €" },
  { nameKey: "avAddOn3", priceKey: "avAddOn3Price" },
] as const;

export const revalidate = 300;

export default async function AudioViesuGramatasPage() {
  const [items, t, ts, locale, gallery] = await Promise.all([
    getProductsByCategory("audio-video"),
    getTranslations("pages"),
    getTranslations("sec"),
    getLocale(),
    getGallery("audio-video"),
  ]);
  const path = "/svinibu-inventars/audio-viesu-gramatas";

  return (
    <>
      <JsonLd
        data={graph(
          ...items.map((p) => productNode(p, locale, path)),
          breadcrumbNode(locale, [
            { name: t("inventarsTitle"), path: "/svinibu-inventars" },
            { name: t("audioVideoTitle"), path },
          ]),
        )}
      />
      <SectionHero
        title={t("audioVideoTitle")}
        tagline={t("audioVideoTagline")}
        heroKey="audio-video"
      />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <p className="mb-10 rounded-2xl border border-gold/25 bg-navy/25 p-5 text-center text-sm text-text/75">
            {ts("avRetention")}
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
            <h2 className="font-display text-2xl font-bold">
              {ts("avAddOnsTitle")}
            </h2>
            <ul className="mt-5 space-y-3">
              {addOns.map((a) => (
                <li
                  key={a.nameKey}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-gold/10 pb-3 text-sm"
                >
                  <span className="text-text/85">{ts(a.nameKey)}</span>
                  <span className="font-mono font-semibold text-gold">
                    {"priceKey" in a ? ts(a.priceKey) : a.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Video pamācība */}
        <Reveal>
          <div className="mt-6 overflow-hidden rounded-3xl border-2 border-gold/25 bg-navy/25 p-6 sm:p-10">
            <h2 className="font-display text-2xl font-bold">
              {ts("avTutorial")}
            </h2>
            <div className="mt-5 aspect-video w-full overflow-hidden rounded-xl">
              <iframe
                title={ts("avTutorial")}
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

      <EventGallery images={gallery} />
      <CtaSection />
    </>
  );
}
