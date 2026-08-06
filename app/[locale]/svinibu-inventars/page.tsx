import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionHero from "@/components/section-hero";
import CategoryCard from "@/components/category-card";
import CtaSection from "@/components/cta-section";
import Reveal from "@/components/reveal";
import DepthBg from "@/components/depth-bg";
import { homeCategories } from "@/lib/categories";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "inventars", "/svinibu-inventars");
}

export default async function SvinibuInventarsPage() {
  const t = await getTranslations("pages");
  return (
    <>
      <SectionHero
        title={t("inventarsTitle")}
        tagline={t("inventarsTagline")}
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
