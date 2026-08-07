import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import SectionHero from "@/components/section-hero";
import Reveal from "@/components/reveal";
import { partners } from "@/lib/partners";
import JsonLd from "@/components/seo/json-ld";
import { graph, breadcrumbNode } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { COMPANY } from "@/lib/company";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "musuDraugi", "/musu-draugi");
}

export default async function MusuDraugiPage() {
  const [t, ts, locale] = await Promise.all([
    getTranslations("pages"),
    getTranslations("sec"),
    getLocale(),
  ]);
  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbNode(locale, [
            { name: t("musuDraugiTitle"), path: "/musu-draugi" },
          ]),
        )}
      />
      <SectionHero
        title={t("musuDraugiTitle")}
        tagline={t("musuDraugiTagline")}
        heroKey="musu-draugi"
      />
      <div className="mx-auto max-w-6xl px-6 py-16">
        {partners.length === 0 ? (
          <Reveal>
            <div className="mx-auto max-w-2xl rounded-3xl border-2 border-gold/25 bg-navy/25 p-8 text-center sm:p-10">
              <p className="text-text/80">{ts("mdEmptyIntro")}</p>
              <p className="mt-4 text-text/70">
                {ts("mdEmptyInvite")}{" "}
                <a
                  href={`mailto:${COMPANY.contact.email}`}
                  className="font-semibold text-gold hover:underline"
                >
                  {COMPANY.contact.email}
                </a>
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-2xl border-2 border-gold/25 bg-navy/25 p-6">
                  <h2 className="font-display text-lg font-semibold text-gold">
                    {p.name}
                  </h2>
                  <p className="mt-2 flex-1 text-sm text-text/75">
                    {p.description}
                  </p>
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block text-sm font-semibold text-gold hover:underline"
                    >
                      {t("visitLink")}
                    </a>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
