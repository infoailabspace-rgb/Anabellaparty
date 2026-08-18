import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/reveal";

// "Pašvaldībām un valsts iestādēm" (B2B spec §4.6) — vizuāli atdalīta (cits fons),
// 3 kolonnas + dokumentu pogas + CTA uz anketu ar source=pasvaldibam.
export default async function ForMunicipal() {
  const t = await getTranslations("forMunicipal");
  const cols = [
    { title: t("col1Title"), text: t("col1Text") },
    { title: t("col2Title"), text: t("col2Text") },
    { title: t("col3Title"), text: t("col3Text") },
  ];
  // Dokumentu PDF (ja fails ievietots public/docs/ — citādi "sagatavošanā").
  const docs = [
    { label: t("docReqs"), href: "/docs/rekviziti.pdf" },
    { label: t("docSpecs"), href: "/docs/tehniska-specifikacija.pdf" },
  ];
  return (
    <section
      id="pasvaldibam"
      className="scroll-mt-28 border-y border-gold/10 bg-navy/40 py-24 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-text/75">
            {t("intro")}
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cols.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-gold/25 bg-bg/40 p-6">
                <h3 className="font-display text-lg font-semibold text-gold">
                  {c.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text/80">
                  {c.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Dokumenti lejupielādei — pogas (PDF sagatavošanā, ja faila vēl nav) */}
        <Reveal delay={0.1}>
          <div className="mt-10">
            <p className="font-display text-sm font-semibold uppercase tracking-wide text-gold">
              {t("docsTitle")}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {docs.map((d) => (
                <a
                  key={d.href}
                  href={d.href}
                  className="rounded-full border border-gold/40 px-5 py-2 text-sm text-text/80 transition-colors hover:border-gold hover:text-gold"
                >
                  ⬇ {d.label}
                </a>
              ))}
            </div>
            <p className="mt-2 text-xs text-text/40">{t("docsSoon")}</p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-10">
            <Link
              href="/kontakti/#pieprasijums?source=pasvaldibam"
              className="inline-block rounded-full bg-gold px-8 py-3 font-semibold text-black transition-transform hover:scale-[1.03]"
            >
              {t("cta")} →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
