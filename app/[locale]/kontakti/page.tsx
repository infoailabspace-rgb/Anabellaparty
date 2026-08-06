import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import SectionHero from "@/components/section-hero";
import ContactForm from "@/components/contact-form";
import Reveal from "@/components/reveal";
import { getContent } from "@/lib/site-content";
import { COMPANY, fullAddress } from "@/lib/company";
import { pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/json-ld";
import { graph, localBusinessNode, breadcrumbNode } from "@/lib/schema";

export const revalidate = 300;

const HOURS_FALLBACK =
  "Pirmdiena–Piektdiena: 9:00–20:00\nSestdiena–Svētdiena: 10:00–18:00\nPasākumi tiek apkalpoti arī ārpus darba laika pēc vienošanās.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "kontakti", "/kontakti");
}

export default async function KontaktiPage() {
  const [hours, t, ts, locale] = await Promise.all([
    getContent("contact.hours", HOURS_FALLBACK),
    getTranslations("pages"),
    getTranslations("sec"),
    getLocale(),
  ]);
  const hoursLines = hours.split("\n").filter(Boolean);

  return (
    <>
      <JsonLd
        data={graph(
          localBusinessNode(),
          breadcrumbNode(locale, [
            { name: t("kontaktiTitle"), path: "/kontakti" },
          ]),
        )}
      />
      <SectionHero title={t("kontaktiTitle")} tagline={t("kontaktiTagline")} />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Kontaktinfo */}
          <Reveal className="space-y-8">
            <div>
              <h2 className="font-display text-xl font-semibold text-gold">
                {ts("cReachUs")}
              </h2>
              <ul className="mt-4 space-y-3 text-text/85">
                <li>
                  <a
                    href={`tel:${COMPANY.contact.phone}`}
                    className="transition-colors hover:text-gold"
                  >
                    📞 {COMPANY.contact.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={COMPANY.contact.whatsapp}
                    className="transition-colors hover:text-gold"
                  >
                    💬 WhatsApp: {COMPANY.contact.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${COMPANY.contact.email}`}
                    className="transition-colors hover:text-gold"
                  >
                    ✉️ {COMPANY.contact.email}
                  </a>
                </li>
                <li>📍 {fullAddress}</li>
              </ul>
            </div>

            {/* Rekvizīti */}
            <div>
              <h3 className="font-display text-sm font-semibold text-text">
                {ts("cRequisites")}
              </h3>
              <ul className="mt-3 space-y-1 text-sm text-text/70">
                <li>{COMPANY.legalName}</li>
                <li>{ts("cRegNr")} {COMPANY.regNr}</li>
                <li>{ts("cVatNr")} {COMPANY.vatNr}</li>
                <li>{ts("cLegalAddr")}: {fullAddress}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-display text-sm font-semibold text-text">
                {ts("cHours")}
              </h3>
              <ul className="mt-3 space-y-1 text-sm text-text/70">
                {hoursLines.map((line, i) => (
                  <li key={i} className={i === hoursLines.length - 1 ? "text-text/50" : ""}>
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            {/* Karte */}
            <div className="overflow-hidden rounded-2xl border-2 border-gold/25">
              <iframe
                title={ts("cMapTitle")}
                src="https://www.google.com/maps?q=Vecozolu+iela+14,+%C4%B6ekava,+Latvija&output=embed"
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>

          {/* Forma */}
          <Reveal delay={0.1}>
            <div className="rounded-2xl border-2 border-gold/25 bg-navy/25 p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold">
                {ts("cWriteUs")}
              </h2>
              <p className="mt-2 text-sm text-text/60">{ts("cFormHint")}</p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
