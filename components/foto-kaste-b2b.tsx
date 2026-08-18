import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/reveal";

// /foto-kaste B2B sekcijas (spec §5) — reklāmas galamērķis. Iekļauts cenā,
// brendēšana, dokumenti/norēķini, cenu orientieris, BUJ, CTA uz anketu.
export default async function FotoKasteB2b() {
  const t = await getTranslations("fkB2b");
  const included = [
    t("inc1"), t("inc2"), t("inc3"), t("inc4"), t("inc5"), t("inc6"), t("inc7"),
  ];
  const faq = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
    { q: t("q4"), a: t("a4") },
    { q: t("q5"), a: t("a5") },
    { q: t("q6"), a: t("a6") },
  ];

  return (
    <div className="mt-12 space-y-12">
      {/* Kas iekļauts cenā */}
      <Reveal>
        <div className="rounded-3xl border-2 border-gold/25 bg-navy/25 p-6 sm:p-10">
          <h2 className="font-display text-2xl font-bold">{t("includedTitle")}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-3 text-text/85">
                <span className="mt-0.5 text-gold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      {/* Brendēšana + Dokumenti/norēķini + Cenu orientieris */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal>
          <div className="h-full rounded-2xl border border-gold/25 bg-navy/30 p-6">
            <h3 className="font-display text-lg font-semibold text-gold">
              {t("brandingTitle")}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-text/80">
              {t("brandingText")}
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="h-full rounded-2xl border border-gold/25 bg-navy/30 p-6">
            <h3 className="font-display text-lg font-semibold text-gold">
              {t("docsTitle")}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-text/80">
              {t("docsText")}
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="h-full rounded-2xl border border-gold/25 bg-gold/10 p-6">
            <h3 className="font-display text-lg font-semibold text-gold">
              {t("priceTitle")}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-text/85">
              {t("priceText")}
            </p>
          </div>
        </Reveal>
      </div>

      {/* BUJ */}
      <Reveal>
        <div>
          <h2 className="font-display text-2xl font-bold">{t("faqTitle")}</h2>
          <div className="mt-6 space-y-3">
            {faq.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-gold/20 bg-navy/25 p-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-text/90">
                  {f.q}
                  <span className="ml-4 text-gold transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-text/75">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Reveal>

      {/* CTA uz B2B anketu */}
      <Reveal>
        <div className="rounded-3xl border-2 border-gold bg-gold/10 p-8 text-center sm:p-10">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            {t("ctaTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-text/80">{t("ctaText")}</p>
          <Link
            href="/kontakti/#pieprasijums"
            className="mt-6 inline-block rounded-full bg-gold px-8 py-3 font-semibold text-black transition-transform hover:scale-[1.03]"
          >
            {t("ctaButton")} →
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
