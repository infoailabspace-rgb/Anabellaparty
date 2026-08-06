import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionHero from "@/components/section-hero";
import FaqAccordion from "@/components/faq-accordion";
import CtaSection from "@/components/cta-section";
import { getFaqs } from "@/lib/site-data";
import { pageMetadata } from "@/lib/seo";

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
  const [items, t] = await Promise.all([getFaqs(), getTranslations("pages")]);
  return (
    <>
      <SectionHero title={t("faqTitle")} tagline={t("faqTagline")} />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <FaqAccordion items={items} />
      </div>
      <CtaSection
        title="Vēl kāds jautājums?"
        text="Uzraksti vai piezvani — labprāt palīdzēsim izvēlēties Tavam pasākumam piemērotāko."
        buttonLabel="Sazināties"
        href="/kontakti"
      />
    </>
  );
}
