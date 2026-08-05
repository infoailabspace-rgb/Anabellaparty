import type { Metadata } from "next";
import SectionHero from "@/components/section-hero";
import CategoryCard from "@/components/category-card";
import CtaSection from "@/components/cta-section";
import Reveal from "@/components/reveal";
import { inventarsSubcategories } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Svinību inventāra noma | Anabella Party",
  description:
    "Audio/video viesu grāmatas, specefekti, dekori un kubli svētkiem Latvijā. Viss Tavam pasākumam vienuviet. Piegāde Pierīgā bez maksas.",
};

export default function SvinibuInventarsPage() {
  return (
    <>
      <SectionHero
        title="Svinību inventārs"
        tagline="Detaļas, kas rada atmosfēru — izvēlies kategoriju un atrodi īsto Tavam pasākumam."
      />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {inventarsSubcategories.map((category, i) => (
            <Reveal key={category.id} delay={i * 0.06}>
              <CategoryCard category={category} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
      <CtaSection />
    </>
  );
}
