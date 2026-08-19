import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/seo/json-ld";
import { graph, productNode, breadcrumbNode, faqPageNode } from "@/lib/schema";
import { getAllProducts } from "@/lib/catalog";
import SectionHero from "@/components/section-hero";
import ProductDetail from "@/components/product-detail";
import ImageGallery from "@/components/image-gallery";
import Image from "next/image";
import SlideReveal from "@/components/slide-reveal";
import PriceBlock from "@/components/price-block";
import ImagePlaceholder from "@/components/image-placeholder";
import DeliveryNote from "@/components/delivery-note";
import CtaSection from "@/components/cta-section";
import EventGallery from "@/components/event-gallery";
import TrustBar from "@/components/home/trust-bar";
import FotoKasteB2b from "@/components/foto-kaste-b2b";
import { getGallery, getClients } from "@/lib/site-data";
import { getSiteImage } from "@/lib/site-content";
import Reveal from "@/components/reveal";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "fotoKaste", "/foto-kaste");
}

export const revalidate = 300;

export default async function FotoKastePage() {
  const [products, t, ts, tfk, locale, gallery, framesImage, clients] =
    await Promise.all([
      getAllProducts(),
      getTranslations("pages"),
      getTranslations("sec"),
      getTranslations("fkB2b"),
      getLocale(),
      getGallery("foto-kaste"),
      getSiteImage("foto-kaste.frames"),
      getClients(),
    ]);
  // FAQPage JSON-LD no B2B BUJ (§7 strukturētie dati).
  const fkFaqs = [1, 2, 3, 4, 5, 6].map((n) => ({
    question: tfk(`q${n}`),
    answer: tfk(`a${n}`),
    category: "produkti" as const,
  }));
  const fkProducts = products.filter((p) => p.category === "foto-kaste");
  // Datu-vadīti (bez hardkodētiem slug — nosaukuma/slug maiņa nekad nesalauž):
  //  - galvenās kastes = nav "īpašais" un nav "cena vienojoties"
  //  - īpašais piedāvājums = special (is_special karogs)
  //  - contact bloki = contactOnly
  const boxes = fkProducts.filter((p) => !p.special && !p.contactOnly);
  const visuDienu = fkProducts.find((p) => p.special);
  const contactBlocks = fkProducts.filter((p) => p.contactOnly);

  return (
    <>
      <JsonLd
        data={graph(
          ...fkProducts.map((p) => productNode(p, locale, "/foto-kaste")),
          faqPageNode(fkFaqs),
          breadcrumbNode(locale, [
            { name: t("fotoKasteTitle"), path: "/foto-kaste" },
          ]),
        )}
      />
      <SectionHero
        title={t("fotoKasteTitle")}
        tagline={t("fotoKasteTagline")}
        heroKey="foto-kaste"
        video="/videos/herovideo1.mp4"
      />

      {/* Uzticamības josla (skaitļi + "Mums uzticas" + logo) — viens bloks (§5) */}
      <TrustBar clients={clients} />

      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* AI funkcija */}
        <Reveal>
          <div className="mb-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-gold/30 bg-navy/30 p-6">
            <p className="text-text/85">{ts("fkAiBlurb")}</p>
            <Link
              href="/foto-kaste/ai-foto"
              className="rounded-full border-2 border-gold px-5 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold/10"
            >
              {ts("fkLearnAi")}
            </Link>
          </div>
        </Reveal>

        {/* 3 kastes */}
        <div className="space-y-12">
          {boxes.map((product, i) => (
            <ProductDetail key={product!.slug} product={product!} index={i} />
          ))}
        </div>

        {/* Foto kaste uz visu dienu — izcelts bloks */}
        {visuDienu && (
          <SlideReveal index={3}>
            <div className="mt-12 rounded-3xl border-2 border-gold bg-gold/10 p-6 sm:p-10">
              <div
                className={`grid gap-8 ${
                  visuDienu.coverImage ? "lg:grid-cols-2 lg:items-center" : ""
                }`}
              >
                {visuDienu.coverImage && (
                  <ImageGallery
                    images={[
                      visuDienu.coverImage,
                      ...visuDienu.gallery.filter(
                        (g) => g && g !== visuDienu.coverImage,
                      ),
                    ]}
                    alt={visuDienu.name}
                  />
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wide text-black">
                      {ts("fkSpecial")}
                    </span>
                    <h2 className="font-display text-2xl font-bold sm:text-3xl">
                      {visuDienu.name}
                      {visuDienu.tiers[0]?.price
                        ? ` — ${visuDienu.tiers[0].price} €`
                        : ""}
                    </h2>
                  </div>
                  <p className="mt-4 max-w-2xl text-text/80">
                    {visuDienu.description}
                  </p>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {visuDienu.includes?.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-text/85">
                        <span className="text-gold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 border-t border-gold/25 pt-6">
                    <PriceBlock product={visuDienu} />
                  </div>
                </div>
              </div>
            </div>
          </SlideReveal>
        )}

        {/* Uz periodu + masu pasākumiem */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {contactBlocks.map((product, i) => (
            <SlideReveal key={product.slug} index={4 + i}>
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-gold/25 bg-navy/25">
                {product.coverImage && (
                  <div className="relative aspect-[16/10] w-full">
                    <Image
                      src={product.coverImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-8">
                  <h3 className="font-display text-xl font-semibold">
                    {product.name}
                  </h3>
                  <p className="mt-3 flex-1 text-sm text-text/75">
                    {product.description}
                  </p>
                  <div className="mt-6">
                    <PriceBlock product={product} />
                  </div>
                </div>
              </div>
            </SlideReveal>
          ))}
        </div>

        {/* Foto rāmīšu dizaini */}
        <SlideReveal index={6}>
          <div className="mt-12 grid items-center gap-8 rounded-3xl border-2 border-gold/25 bg-navy/25 p-6 sm:p-10 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-bold">
                {ts("fkFramesTitle")}
              </h2>
              <p className="mt-4 text-text/80">{ts("fkFramesText")}</p>
            </div>
            {framesImage ? (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-gold/15">
                <Image
                  src={framesImage}
                  alt={ts("fkFramesTitle")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <ImagePlaceholder
                label={ts("fkFramesTitle")}
                className="aspect-[4/3] w-full"
              />
            )}
          </div>
        </SlideReveal>

        {/* B2B sekcijas (§5): iekļauts, brendēšana, dokumenti, cena, BUJ, CTA */}
        <FotoKasteB2b />

        <div className="mt-12">
          <DeliveryNote />
        </div>
      </div>

      <EventGallery images={gallery} />
      <CtaSection />
    </>
  );
}
