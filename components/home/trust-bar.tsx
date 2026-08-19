import { getTranslations } from "next-intl/server";
import Reveal from "@/components/reveal";
import CountUp from "@/components/count-up";
import ClientsMarquee from "@/components/clients-marquee";
import type { Client } from "@/lib/clients";

// Uzticamības josla tūlīt zem hero (B2B spec §4.2) — VIENS bloks, viens fons:
// 1) skaitļi (bez virsraksta), 2) "Mums uzticas" + apakšrindiņa, 3) logo lente.
export default async function TrustBar({
  statsEvents = "500",
  statsUnits = "40",
  statsSince = "2022",
  clients = [],
}: {
  statsEvents?: string;
  statsUnits?: string;
  statsSince?: string;
  clients?: Client[];
}) {
  const t = await getTranslations("about");
  const tc = await getTranslations("clients");
  const stats = [
    { to: Number(statsEvents) || 0, suffix: "+", label: t("statEvents") },
    { to: Number(statsUnits) || 0, suffix: "+", label: t("statUnits") },
    { to: Number(statsSince) || 0, prefix: t("sincePrefix"), label: "" },
  ];
  const hasLogos = clients.some((c) => c.logo);

  return (
    <section className="border-t border-gold/10 bg-navy/20 py-16">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          {/* 1. Skaitļi — bez virsraksta virs tiem */}
          <div className="grid gap-6 text-center sm:grid-cols-3">
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

          {/* 2. Virsraksts + apakšrindiņa */}
          <h2 className="mt-12 text-center font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {tc("heading")}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-text/60">
            {tc("subline")}
          </p>
        </Reveal>
      </div>

      {/* 3. Logo lente — pilns platums, tajā pašā sekcijā (bez atdalošās līnijas) */}
      {hasLogos && (
        <div className="mt-10">
          <ClientsMarquee clients={clients} embedded />
        </div>
      )}
    </section>
  );
}
