import Image from "next/image";
import Reveal from "@/components/reveal";
import CountUp from "@/components/count-up";

// Reālais Aivas un Roberta teksts no anabellaparty.lv — formulējumus nemaina.
const STORY = [
  "Tie esam mēs — Aiva un Roberts Dimanti.",
  "Mēs esam vīrs un sieva, kuri vienu dienu vienkārši izlēma darīt to, kas patīk. Atstājām stabilos darbus un sākām dzīvot pa īstam. Tagad mēs radām svētkus — tādus, kas paliek atmiņā ne tikai bildēs, bet arī sirdī.",
  "Mūsu foto kastes ķer īstus smieklus, nevis pozas. Mūsu baltās atrakcijas iepriecina bērnus un uzjautrina pieaugušos. Mēs ierodamies ar prieku un aizbraucam ar sajūtu, ka esam kādam dienu padarījuši īpašu.",
  "Šis nav vienkārši pakalpojums. Šī ir mūsu sirdslieta. Mēs paši — ar visu savu enerģiju, radošumu un vēlmi, lai jūsu pasākums būtu tas, par ko runā vēl ilgi.",
];

const PLUSES = [
  "Mēs darām ar sirdi, ne pēc šablona",
  "Katrs klients mums nav „klients” — jūs esat kā draugi",
  "Pozitīva enerģija, ko nevar nepamanīt",
  "Svētku sajūta garantēta",
];

export default function About({
  statsEvents = "500",
  statsUnits = "40",
  statsSince = "2022",
}: {
  statsEvents?: string;
  statsUnits?: string;
  statsSince?: string;
}) {
  const stats = [
    { to: Number(statsEvents) || 0, suffix: "+", label: "pasākumi" },
    { to: Number(statsUnits) || 0, suffix: "+", label: "inventāra vienības" },
    { to: Number(statsSince) || 0, prefix: "kopš ", label: "" },
  ];
  return (
    <section className="bg-bg py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Foto — mobilajā virs teksta, desktopā pa labi */}
          <Reveal className="order-first lg:order-last" delay={0.1}>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-xl border border-gold/25 shadow-[0_20px_60px_-30px_rgba(212,169,96,0.35)]">
              <Image
                src="/images/about/komanda.png"
                alt="Aiva un Roberts Dimanti — Anabella Party"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <span className="absolute inset-x-0 bottom-0 bg-navy/70 px-3 py-1.5 text-center text-xs text-text/70 backdrop-blur">
                [VAJAG: Aivas un Roberta kopīgs foto]
              </span>
            </div>
          </Reveal>

          {/* Stāsts */}
          <Reveal>
            <div>
              <p className="font-mono text-sm uppercase tracking-[0.2em] text-gold">
                Iepazīsimies?
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
                Kas ir Svētku inventārs Anabella?
              </h2>
              <div className="mt-6 space-y-4 leading-relaxed text-text/80">
                {STORY.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Mūsu mazie lielie plusi */}
              <div className="mt-8 rounded-2xl border border-gold/30 bg-navy/25 p-6">
                <p className="font-display text-sm font-semibold uppercase tracking-wide text-gold">
                  Mūsu mazie lielie plusi
                </p>
                <ul className="mt-4 space-y-2.5">
                  {PLUSES.map((p) => (
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
                Uz tikšanos pasākumos!
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
