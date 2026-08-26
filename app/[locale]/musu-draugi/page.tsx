import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import SectionHero from "@/components/section-hero";
import Reveal from "@/components/reveal";
import { getPartners } from "@/lib/site-data";
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
  const [t, ts, locale, partners] = await Promise.all([
    getTranslations("pages"),
    getTranslations("sec"),
    getLocale(),
    getPartners(),
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
          <div className="mx-auto max-w-4xl space-y-6">
            {partners.map((p, i) => (
              <Reveal key={p.id ?? p.name} delay={i * 0.08}>
                <div
                  className={`grid overflow-hidden rounded-2xl border-2 border-gold/25 bg-navy/25 ${
                    p.logoUrl ? "md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" : ""
                  }`}
                >
                  {/* Attēls: mobilajā virs teksta (aspect 4:3), desktopā kreisajā
                      pusē pilnā kartītes augstumā (object-cover, bez izstiepšanas) */}
                  {p.logoUrl && (
                    <div className="relative aspect-[4/3] w-full md:aspect-auto md:min-h-[15rem]">
                      {p.url ? (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0"
                        >
                          <Image
                            src={p.logoUrl}
                            alt={p.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 40vw"
                            className="object-cover"
                          />
                        </a>
                      ) : (
                        <Image
                          src={p.logoUrl}
                          alt={p.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 40vw"
                          className="object-cover"
                        />
                      )}
                    </div>
                  )}
                  <div className="flex flex-col p-6 sm:p-8">
                    <h2 className="font-display text-xl font-semibold text-gold">
                      {p.name}
                    </h2>
                    <p className="mt-3 flex-1 whitespace-pre-line text-sm leading-relaxed text-text/75">
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
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
