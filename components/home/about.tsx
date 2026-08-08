import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Reveal from "@/components/reveal";
import CountUp from "@/components/count-up";

export default async function About({
  statsEvents = "500",
  statsUnits = "40",
  statsSince = "2022",
  image,
}: {
  statsEvents?: string;
  statsUnits?: string;
  statsSince?: string;
  image?: string | null;
}) {
  const t = await getTranslations("about");
  const photo = image?.trim() ? image : "/images/about/komanda.png";
  const story = [t("story1"), t("story2"), t("story3"), t("story4")];
  const pluses = [t("plus1"), t("plus2"), t("plus3"), t("plus4")];
  const stats = [
    { to: Number(statsEvents) || 0, suffix: "+", label: t("statEvents") },
    { to: Number(statsUnits) || 0, suffix: "+", label: t("statUnits") },
    { to: Number(statsSince) || 0, prefix: t("sincePrefix"), label: "" },
  ];
  return (
    <section className="bg-bg py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Foto — mobilajā virs teksta, desktopā pa labi */}
          <Reveal className="order-first lg:order-last" delay={0.1}>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-xl border border-gold/25 shadow-[0_20px_60px_-30px_rgba(212,169,96,0.35)]">
              <Image
                src={photo}
                alt="Aiva un Roberts Dimanti — Anabella Party"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          {/* Stāsts */}
          <Reveal>
            <div>
              <p className="font-mono text-sm uppercase tracking-[0.2em] text-gold">
                {t("eyebrow")}
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
                {t("heading")}
              </h2>
              <div className="mt-6 space-y-4 leading-relaxed text-text/80">
                {story.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Mūsu mazie lielie plusi */}
              <div className="mt-8 rounded-2xl border border-gold/30 bg-navy/25 p-6">
                <p className="font-display text-sm font-semibold uppercase tracking-wide text-gold">
                  {t("plusesTitle")}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {pluses.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-text/85">
                      <span
                        aria-hidden
                        className="mt-1.5 inline-block h-2 w-2 shrink-0 rotate-45 bg-gold"
                      />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-8 font-display text-2xl font-bold text-gold md:text-3xl">
                {t("closing")}
              </p>
            </div>
          </Reveal>
        </div>

        {/* Statistikas josla */}
        <Reveal delay={0.1}>
          <div className="mt-16 grid gap-6 rounded-2xl border border-gold/25 bg-navy/25 p-8 text-center shadow-[0_20px_60px_-30px_rgba(212,169,96,0.25)] sm:grid-cols-3">
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
