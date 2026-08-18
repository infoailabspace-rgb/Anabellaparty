import { getTranslations } from "next-intl/server";
import Reveal from "@/components/reveal";
import CountUp from "@/components/count-up";

// Uzticamības josla tūlīt zem hero (B2B spec §4.2) — skaitļi + "Mums uzticas"
// apakšrindiņa. Klientu logo lente (ClientsMarquee) seko uzreiz aiz šīs.
export default async function TrustBar({
  statsEvents = "500",
  statsUnits = "40",
  statsSince = "2022",
}: {
  statsEvents?: string;
  statsUnits?: string;
  statsSince?: string;
}) {
  const t = await getTranslations("about");
  const tc = await getTranslations("clients");
  const stats = [
    { to: Number(statsEvents) || 0, suffix: "+", label: t("statEvents") },
    { to: Number(statsUnits) || 0, suffix: "+", label: t("statUnits") },
    { to: Number(statsSince) || 0, prefix: t("sincePrefix"), label: "" },
  ];
  return (
    <section className="border-t border-gold/10 bg-navy/20 py-12">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <p className="text-center font-display text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            {tc("heading")}
          </p>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-text/60">
            {tc("subline")}
          </p>
          <div className="mt-8 grid gap-6 text-center sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label || "gads"}>
                <CountUp
                  to={s.to}
                  prefix={s.prefix}
                  suffix={s.suffix}
                  className="font-mono text-3xl font-bold text-gold md:text-4xl"
                />
                {s.label && (
                  <p className="mt-2 text-sm uppercase tracking-wide text-text/60">
                    {s.label}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
