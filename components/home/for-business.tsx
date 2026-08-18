import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/reveal";

// "Pasākums uzņēmumam vai iestādei" (B2B spec §4.3) — 4 kartītes + CTA uz anketu.
// Enkurs #uznemumiem (hero sekundārā poga ved šeit).
export default async function ForBusiness() {
  const t = await getTranslations("forBusiness");
  const cards = [
    { title: t("card1Title"), text: t("card1Text") },
    { title: t("card2Title"), text: t("card2Text") },
    { title: t("card3Title"), text: t("card3Text") },
    { title: t("card4Title"), text: t("card4Text") },
  ];
  return (
    <section id="uznemumiem" className="scroll-mt-28 py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-text/75">
            {t("intro")}
          </p>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.06}>
              <div className="flex h-full flex-col rounded-2xl border border-gold/25 bg-navy/30 p-6">
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
        <Reveal delay={0.1}>
          <div className="mt-10">
            <Link
              href="/kontakti/#pieprasijums"
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
