import Hero from "@/components/home/hero";
import TrustBar from "@/components/home/trust-bar";
import Steps from "@/components/home/steps";
import About from "@/components/home/about";
import ForBusiness from "@/components/home/for-business";
import ForMunicipal from "@/components/home/for-municipal";
import Testimonials from "@/components/home/testimonials";
import CategoryCard from "@/components/category-card";
import CtaSection from "@/components/cta-section";
import Reveal from "@/components/reveal";
import DepthBg from "@/components/depth-bg";
import { homeCategories } from "@/lib/categories";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getContentMap, getSiteImage } from "@/lib/site-content";
import { getTestimonials, getClients, getFeaturedGallery } from "@/lib/site-data";
import EventGallery from "@/components/event-gallery";
import { getHeroMedia } from "@/lib/hero-media";
import { homeMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/json-ld";
import { graph, localBusinessNode } from "@/lib/schema";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return homeMetadata(locale);
}

export default async function Home() {
  const [c, testimonials, clients, t, heroMedia, aboutImage, featuredGallery] =
    await Promise.all([
      getContentMap(),
      getTestimonials(),
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
      <JsonLd data={graph(localBusinessNode())} />
      {/* Hero medijs (video/attēls no site_content vai fallback) */}
      <Hero
        media={hero}
        title={g("home.hero.title", "Neaizmirstamas ballītes sākas šeit")}
        accent={g("home.hero.accent", "ballītes")}
        subtitle={g(
          "home.hero.subtitle",
          "Foto kastes, piepūšamās atrakcijas un specefekti Tavam pasākumam. Piegāde visā Latvijā.",
        )}
      />

      {/* Uzticamības josla (skaitļi + "Mums uzticas" + logo) — viens bloks (§4.2) */}
      <TrustBar
        statsEvents={g("about.stats.events", "500")}
        statsUnits={g("about.stats.units", "40")}
        statsSince={g("about.stats.since", "2022")}
        clients={clients}
      />

      {/* Kā tas notiek — bg */}
      <Steps />

      {/* Piedāvājums / kategorijas — navy ar tekstūru + dziļuma fons */}
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
        </div>
      </section>

      {/* Pasākums uzņēmumam vai iestādei (§4.3) — pēc piedāvājuma, pirms atsauksmēm */}
      <ForBusiness />

      {/* Par mums — bg */}
      <About image={aboutImage} />

      {/* Atsauksmes — tikai ja ir reāli citāti (bez izdomātiem) */}
      {testimonials.length > 0 && (
        <Testimonials testimonials={testimonials} />
      )}

      {/* No mūsu pasākumiem — featured galerija (tukša → nerādās) */}
      <EventGallery images={featuredGallery} mode="home" />

      {/* Pašvaldībām un valsts iestādēm (§4.6) — pirms noslēdzošā CTA */}
      <ForMunicipal />

      {/* CTA — zelta gradients */}
      <CtaSection />
    </>
  );
}
