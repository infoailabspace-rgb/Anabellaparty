import { getTranslations } from "next-intl/server";
import Reveal from "@/components/reveal";
import { clientGroups } from "@/lib/clients";

// "Mūsu klientu vidū" — tekstuāli, sagrupēti pa nozarēm. Bez logo (tie prasa
// atļauju; nosaukuma minēšana faktiskā apgalvojumā ir cita lieta).
export default async function ClientsSection() {
  const t = await getTranslations("clients");
  return (
    <section className="bg-navy py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-bold tracking-tight md:text-4xl">
            {t("heading")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center leading-relaxed text-text/70">
            {t("intro")}
          </p>
        </Reveal>

        <div className="mt-14 space-y-10">
          {clientGroups.map((group, gi) => (
            <Reveal key={group.sector} delay={gi * 0.08}>
              <div>
                <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-text/50">
                  {group.sector}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  {group.companies.map((name) => (
                    <span
                      key={name}
                      className="rounded-full border border-gold/40 px-4 py-1.5 text-sm font-medium text-gold/90"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
