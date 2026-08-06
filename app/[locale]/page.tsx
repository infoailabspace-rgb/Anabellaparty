import Hero from "@/components/home/hero";
import Steps from "@/components/home/steps";
import About from "@/components/home/about";
import ClientsSection from "@/components/home/clients-section";
import Testimonials from "@/components/home/testimonials";
import CategoryCard from "@/components/category-card";
import CtaSection from "@/components/cta-section";
import Reveal from "@/components/reveal";
import DepthBg from "@/components/depth-bg";
import { homeCategories } from "@/lib/categories";
import { getContentMap } from "@/lib/site-content";
import { getTestimonials } from "@/lib/site-data";

export const revalidate = 300;

export default async function Home() {
  const [c, testimonials] = await Promise.all([
    getContentMap(),
    getTestimonials(),
  ]);
  const g = (k: string, f: string) => (c[k]?.trim() ? c[k] : f);

  return (
    <>
      {/* Hero — abi video secīgi viens pēc otra */}
      <Hero
        videos={["/videos/herovideo1.mp4", "/videos/herovideo2.mp4"]}
        title={g("home.hero.title", "Neaizmirstamas ballītes sākas šeit")}
        accent={g("home.hero.accent", "ballītes")}
        subtitle={g(
          "home.hero.subtitle",
          "Foto kastes, piepūšamās atrakcijas un specefekti Tavam pasākumam. Piegāde Pierīgā bez maksas.",
        )}
      />

      {/* Kā tas notiek — bg */}
      <Steps />

      {/* Piedāvājums / kategorijas — navy ar tekstūru + dziļuma fons */}
      <section className="anabella-navy-texture relative overflow-hidden bg-navy py-24 md:py-32">
        <DepthBg />
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="text-center font-display text-3xl font-bold tracking-tight md:text-4xl">
              Mūsu piedāvājums
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center leading-relaxed text-text/70">
              No foto kastēm līdz kubliem — viss Tavam pasākumam vienuviet.
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

      {/* Par mums — bg */}
      <About
        statsEvents={g("about.stats.events", "500")}
        statsUnits={g("about.stats.units", "40")}
        statsSince={g("about.stats.since", "2022")}
      />

      {/* Mūsu klientu vidū — navy (tekstuāli, pa nozarēm) */}
      <ClientsSection />

      {/* Atsauksmes — tikai ja ir reāli citāti (bez izdomātiem) */}
      {testimonials.length > 0 && (
        <Testimonials testimonials={testimonials} />
      )}

      {/* CTA — zelta gradients */}
      <CtaSection />
    </>
  );
}
