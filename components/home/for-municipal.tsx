import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/reveal";
import CallButton from "@/components/call-button";

// "Pašvaldībām un valsts iestādēm" (B2B spec §4.6) — vizuāli atdalīta (cits fons),
// 3 kolonnas + dokumentu pogas + CTA uz anketu ar source=pasvaldibam.
export default async function ForMunicipal() {
  const t = await getTranslations("forMunicipal");
  const cols = [
    { title: t("col1Title"), text: t("col1Text") },
    { title: t("col2Title"), text: t("col2Text") },
    { title: t("col3Title"), text: t("col3Text") },
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

        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/kontakti/?source=pasvaldibam#pieprasijums"
              className="inline-flex items-center rounded-full bg-gold px-8 py-3 font-semibold text-black transition-transform hover:scale-[1.03]"
            >
              {t("cta")} →
            </Link>
            <CallButton source="pasvaldibam" variant="outline" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
