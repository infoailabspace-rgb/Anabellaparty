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
  return pageMetadata(locale, "atrakcijas", "/piepusamas-atrakcijas");
}

export const revalidate = 300;

export default async function PiepusamasAtrakcijasPage() {
  const [items, t, ts, locale, gallery] = await Promise.all([
    getProductsByCategory("atrakcijas"),
    getTranslations("pages"),
    getTranslations("sec"),
    getLocale(),
    getGallery("atrakcijas"),
  ]);

  return (
    <>
      <JsonLd
        data={graph(
          ...items.map((p) => productNode(p, locale, "/piepusamas-atrakcijas")),
          breadcrumbNode(locale, [
            { name: t("atrakcijasTitle"), path: "/piepusamas-atrakcijas" },
          ]),
        )}
      />
      <SectionHero
        title={t("atrakcijasTitle")}
        tagline={t("atrakcijasTagline")}
        heroKey="atrakcijas"
        video="/videos/herovideo2.mp4"
      />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="space-y-12">
          {items.map((product, i) => (
            <ProductDetail key={product.slug} product={product} index={i} />
          ))}
        </div>

        {/* Baltas bumbas */}
        <Reveal>
          <div className="mt-12 rounded-2xl border border-gold/25 bg-navy/25 p-6 text-center text-sm text-text/75">
            {ts("atrBalls")}
          </div>
        </Reveal>

        {/* Bumbu tīrīšanas ierīce — info */}
        <Reveal>
          <div className="mt-6 rounded-3xl border-2 border-gold/25 bg-navy/25 p-6 sm:p-10">
            <h2 className="font-display text-2xl font-bold">
              {ts("atrCleanTitle")}
            </h2>
            <p className="mt-4 max-w-2xl text-text/80">{ts("atrCleanText")}</p>
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
