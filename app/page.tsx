import Hero from "@/components/home/hero";
import Steps from "@/components/home/steps";
import About from "@/components/home/about";
import ClientsMarquee from "@/components/home/clients-marquee";
import Testimonials from "@/components/home/testimonials";
import CategoryCard from "@/components/category-card";
import CtaSection from "@/components/cta-section";
import Reveal from "@/components/reveal";
import { homeCategories } from "@/lib/categories";

export default function Home() {
  return (
    <>
      {/* Hero — video/attēls (pagaidām gradients + glow) */}
      <Hero />

      {/* Kā tas notiek — bg */}
      <Steps />

      {/* Piedāvājums / kategorijas — navy ar smalku tekstūru */}
      <section className="anabella-navy-texture bg-navy py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
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
                <CategoryCard category={category} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Par mums — bg */}
      <About />

      {/* Klienti — navy */}
      <ClientsMarquee />

      {/* Atsauksmes — bg */}
      <Testimonials />

      {/* CTA — zelta gradients */}
      <CtaSection />
    </>
  );
}
