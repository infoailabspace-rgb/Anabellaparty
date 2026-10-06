import Hero from "@/components/home/hero";
import TrustBar from "@/components/home/trust-bar";
import About from "@/components/home/about";
import ForBusiness from "@/components/home/for-business";
import ForMunicipal from "@/components/home/for-municipal";
import Testimonials from "@/components/home/testimonials";
import FeaturedProducts from "@/components/home/featured-products";
import HomeFaq from "@/components/home/home-faq";
import { getAllProducts } from "@/lib/catalog";
import AiPartyBanner from "@/components/ai-party-banner";
import CtaSection from "@/components/cta-section";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getContentMap, getSiteImage } from "@/lib/site-content";
import { getClients, getFaqs, getFeaturedGallery } from "@/lib/site-data";
import EventGallery from "@/components/event-gallery";
import { getHeroMedia } from "@/lib/hero-media";
import { homeMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/json-ld";
import { graph, localBusinessNode } from "@/lib/schema";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return homeMetadata(locale);
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // STATISKAI/ISR renderēšanai - next-intl prasa setRequestLocale KATRĀ lapā/izkārtojumā,
  // citādi getTranslations lasa locale no headers → maršruts kļūst dinamisks.
  const { locale } = await params;
  setRequestLocale(locale);

  const [c, clients, heroMedia, aboutImage, featuredGallery, products, faqs] =
    await Promise.all([
      getContentMap(),
      getClients(),
      getHeroMedia("home"),
      getSiteImage("about.photo"),
      getFeaturedGallery(),
      getAllProducts(),
      getFaqs(),
    ]);
  const g = (k: string, f: string) => (c[k]?.trim() ? c[k] : f);

  return (
    <>
      <JsonLd data={graph(localBusinessNode())} />
      {/* Hero medijs (video/attēls no site_content vai fallback) */}
      <Hero
        media={heroMedia}
        title={g("home.hero.title", "Neaizmirstamas ballītes sākas šeit")}
        accent={g("home.hero.accent", "ballītes")}
        subtitle={g(
          "home.hero.subtitle",
          "Foto kastes, AI foto un pasākumu inventārs korporatīvajiem pasākumiem un svinībām. Strādājam visā Latvijā.",
        )}
      />

      {/* Uzticamības josla (skaitļi + "Mums uzticas" + logo) - viens bloks (§4.2) */}
      <TrustBar
        statsEvents={g("about.stats.events", "500")}
        statsUnits={g("about.stats.units", "40")}
        statsSince={g("about.stats.since", "2022")}
        clients={clients}
      />

      {/* Galvenie produkti: foto kastes (cena + PVN, priekšrocības, ?item= CTA) */}
      <FeaturedProducts products={products} />

      {/* AI Party banneris (DB vadīts; izslēgts → nerādās) */}
      <div className="container-site">
        <AiPartyBanner />
      </div>

      {/* Uzņēmumiem: sadarbības process + B2B priekšrocības */}
      <ForBusiness />

      {/* Pašvaldībām un valsts iestādēm - B2B bloka turpinājums */}
      <ForMunicipal />

      {/* Galerija - reāli pasākumi */}
      <EventGallery images={featuredGallery} mode="home" />

      {/* Atsauksmes */}
      <Testimonials />

      {/* Par mums (stāsts + komanda; AEO/GEO teksts saglabāts) */}
      <About image={aboutImage} />

      {/* Biežāk uzdotie jautājumi (bez JSON-LD; FAQPage paliek /faq) */}
      <HomeFaq items={faqs} />

      {/* CTA - zelta gradients; secondary = B2B poga (80% klientu) */}
      <CtaSection secondary />
    </>
  );
}
