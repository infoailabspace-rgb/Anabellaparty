import type { Metadata } from "next";
import SectionHero from "@/components/section-hero";
import CategoryCard from "@/components/category-card";
import CtaSection from "@/components/cta-section";
import Reveal from "@/components/reveal";
import DepthBg from "@/components/depth-bg";
import { homeCategories } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Svinību inventāra noma | Anabella Party",
  description:
    "Foto kastes, piepūšamās atrakcijas, audio/video viesu grāmatas, specefekti, dekori un kubli svētkiem Latvijā. Viss Tavam pasākumam vienuviet. Piegāde Pierīgā bez maksas.",
};

export default function SvinibuInventarsPage() {
  return (
    <>
      <SectionHero
        title="Viss inventārs"
        tagline="No foto kastēm līdz kubliem — izvēlies kategoriju un atrodi īsto Tavam pasākumam."
      />
      <section className="anabella-navy-texture relative overflow-hidden bg-navy py-16">
        <DepthBg />
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {homeCategories.map((category, i) => (
              <Reveal key={category.id} delay={i * 0.06}>
                <CategoryCard category={category} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <CtaSection />
    </>
  );
}
