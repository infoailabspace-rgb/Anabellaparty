import type { Metadata } from "next";
import { getTranslations, getLocale, setRequestLocale } from "next-intl/server";
import SectionHero from "@/components/section-hero";
import AiPartySection from "@/components/ai-party-section";
import { pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/json-ld";
import { graph, breadcrumbNode, localBusinessNode } from "@/lib/schema";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "aiParty", "/foto-kaste/ai-party");
}

export default async function AiPartyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: _locale } = await params;
  setRequestLocale(_locale);
  const [t, locale] = await Promise.all([getTranslations("pages"), getLocale()]);

  return (
    <>
      {/* Bez Product mezgla: AI Party ir ārējs digitāls pakalpojums (ai-party.app),
          cena tur, nevis mūsu katalogā. */}
      <JsonLd
        data={graph(
          localBusinessNode(),
          breadcrumbNode(locale, [
            { name: t("fotoKasteTitle"), path: "/foto-kaste" },
            { name: t("aiPartyTitle"), path: "/foto-kaste/ai-party" },
          ]),
        )}
      />
      <SectionHero
        title={t("aiPartyTitle")}
        tagline={t("aiPartyTagline")}
        heroKey="ai-party"
      />

      <AiPartySection />
    </>
  );
}
