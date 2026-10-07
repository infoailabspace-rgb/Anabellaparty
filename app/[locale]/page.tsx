import Hero from "@/components/home/hero";
import TrustBar from "@/components/home-legacy/trust-bar";
import Steps from "@/components/home/steps";
import About from "@/components/home/about";
import ForBusiness from "@/components/home/for-business";
import ForMunicipal from "@/components/home/for-municipal";
import Testimonials from "@/components/home/testimonials";
import CategoryCard from "@/components/home-legacy/category-card";
import AiPartyBanner from "@/components/home-legacy/ai-party-banner";
import CtaSection from "@/components/home-legacy/cta-section";
import Reveal from "@/components/reveal";
import DepthBg from "@/components/home-legacy/depth-bg";
import { homeCategories } from "@/lib/categories";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getContentMap, getSiteImage } from "@/lib/site-content";
import { getClients, getFeaturedGallery } from "@/lib/site-data";
import EventGallery from "@/components/home-legacy/event-gallery";
import { getHeroMedia } from "@/lib/hero-media";
import { homeMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/json-ld";
import SiteTexture from "@/components/home-legacy/site-texture";
// Sākumlapas vecais izskats (pirms redizaina, 3abb664): efektu klases tikai šai lapai.
import "../home-legacy.css";

// Pirms redizaina sākumlapā virsraksti bija Space Grotesk un body rindstarpa 1.5
// (pārējā vietne lieto Playfair Display un 1.65). Kājene sākumlapā kā 3abb664:
// saites bez 44 px minimuma, saraksta atstarpes, sociālās ikonas bez 44 px laukuma.
// <style> eksistē tikai, kamēr atvērta sākumlapa, tāpēc citas lapas tas neietekmē.
const HOME_LEGACY_STYLE = [
  ":root{--font-heading:var(--font-space-grotesk)}body{line-height:inherit}",
  "footer ul a{display:inline!important;min-height:0!important;min-width:0!important}",
  "footer ul.text-sm>li+li{margin-top:.5rem}",
  "footer div:has(>a[aria-label=Instagram]){gap:1rem!important}",
  "footer div:has(>a[aria-label=Instagram])>a{display:inline!important;width:auto!important;height:auto!important}",
].join("");
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
  // STATISKAI/ISR renderēšanai — next-intl prasa setRequestLocale KATRĀ lapā/izkārtojumā,
  // citādi getTranslations lasa locale no headers → maršruts kļūst dinamisks.
  const { locale } = await params;
  setRequestLocale(locale);

  const [c, clients, t, heroMedia, aboutImage, featuredGallery] =
    await Promise.all([
      getContentMap(),
      getClients(),
      getTranslations("home"),
      getHeroMedia("home"),
      getSiteImage("about.photo"),
      getFeaturedGallery(),
    ]);
  const g = (k: string, f: string) => (c[k]?.trim() ? c[k] : f);
  // Fallback: ja admin nav iestatījis hero mediju → publiskais video + poster.
  const hero =
    heroMedia ??
    { mp4: "/videos/herovideo1.mp4", poster: "/videos/herovideo1.jpg" };

  return (
    <>
      <style>{HOME_LEGACY_STYLE}</style>
      {/* Vecā globālā fona tekstūra (agrāk izkārtojumā), tagad tikai sākumlapā */}
      <SiteTexture />
      <JsonLd data={graph(localBusinessNode())} />
      {/* Hero medijs (video/attēls no site_content vai fallback) */}
      <Hero
        media={hero}
        title={g("home.hero.title", "Neaizmirstamas ballītes sākas šeit")}
        accent={g("home.hero.accent", "ballītes")}
        subtitle={g(
          "home.hero.subtitle",
          "Foto kastes, AI foto un pasākumu inventārs korporatīvajiem pasākumiem un svinībām. Strādājam visā Latvijā.",
        )}
      />

      {/* Uzticamības josla (skaitļi + "Mums uzticas" + logo) — viens bloks (§4.2) */}
      <TrustBar
        statsEvents={g("about.stats.events", "500")}
        statsUnits={g("about.stats.units", "40")}
        statsSince={g("about.stats.since", "2022")}
        clients={clients}
      />

      {/* Mūsu piedāvājums / kategorijas — navy ar tekstūru + dziļuma fons.
          Pārcelts augšup: produktu rāda pirms procesa skaidrojuma. */}
      <section className="anabella-navy-texture relative overflow-hidden bg-navy/40 py-24 md:py-32">
        <DepthBg />
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="text-center font-display text-3xl font-bold tracking-tight md:text-4xl">
              {t("offerTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center leading-relaxed text-text/70">
              {t("offerSubtitle")}
            </p>
          </Reveal>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {homeCategories.map((category, i) => (
              <Reveal key={category.id} delay={i * 0.06}>
                <CategoryCard category={category} index={i} />
              </Reveal>
            ))}
          </div>
          {/* AI Party banneris — pilnā platumā zem kategoriju režģa (cits produkts).
              Saturs+slēdzis no DB (site_content); izslēgts → nerādās (bez atstarpes). */}
          <AiPartyBanner />
        </div>
      </section>

      {/* Pasākums uzņēmumam vai iestādei (§4.3) — pēc piedāvājuma */}
      <ForBusiness />

      {/* Kā tas notiek — pēc produkta: atbild uz jautājumu, kas rodas tikai
          pēc tam, kad apmeklētājs ir redzējis piedāvājumu. */}
      <Steps />

      {/* Par mums — bg */}
      <About image={aboutImage} />

      {/* Atsauksmes — no tulkojumu failiem (LV/EN/RU) */}
      <Testimonials />

      {/* No mūsu pasākumiem — featured galerija (tukša → nerādās) */}
      <EventGallery images={featuredGallery} mode="home" />

      {/* Pašvaldībām un valsts iestādēm (§4.6) — pirms noslēdzošā CTA */}
      <ForMunicipal />

      {/* CTA — zelta gradients; secondary = B2B poga (80% klientu) */}
      <CtaSection secondary />
    </>
  );
}
