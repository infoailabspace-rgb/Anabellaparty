import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import SectionHero from "@/components/section-hero";
import FaqAccordion from "@/components/faq-accordion";
import CtaSection from "@/components/cta-section";
import { getFaqs } from "@/lib/site-data";
import { pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/json-ld";
import { graph, faqPageNode, breadcrumbNode } from "@/lib/schema";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "faq", "/faq");
}

export default async function FaqPage() {
  const [items, t, ts, locale] = await Promise.all([
    getFaqs(),
    getTranslations("pages"),
    getTranslations("sec"),
    getLocale(),
  ]);
  return (
    <>
      <JsonLd
        data={graph(
          faqPageNode(items),
          breadcrumbNode(locale, [{ name: t("faqTitle"), path: "/faq" }]),
        )}
      />
      <SectionHero title={t("faqTitle")} tagline={t("faqTagline")} heroKey="faq" />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <FaqAccordion items={items} />
      </div>
      <CtaSection
        title={ts("fqCtaTitle")}
        text={ts("fqCtaText")}
        buttonLabel={ts("fqCtaBtn")}
        href="/kontakti"
      />
    </>
  );
}
