import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import JsonLd from "@/components/seo/json-ld";
import { graph, breadcrumbNode } from "@/lib/schema";
import SectionHero from "@/components/section-hero";
import CategoryCard from "@/components/category-card";
import AiPartyBanner from "@/components/ai-party-banner";
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
  const [t, locale] = await Promise.all([
    getTranslations("pages"),
    getLocale(),
  ]);
  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbNode(locale, [
            { name: t("inventarsTitle"), path: "/svinibu-inventars" },
          ]),
        )}
      />
      <SectionHero
        title={t("inventarsTitle")}
        tagline={t("inventarsTagline")}
        heroKey="inventars"
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
          {/* AI Party banneris — pilnā platumā zem kategoriju režģa (cits produkts). */}
          <Reveal className="mt-8">
            <AiPartyBanner />
          </Reveal>
        </div>
      </section>
      <CtaSection />
    </>
  );
}
