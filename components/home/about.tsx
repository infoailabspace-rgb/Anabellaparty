import Image from "next/image";
import Reveal from "@/components/reveal";
import CountUp from "@/components/count-up";

// [JĀAPSTIPRINA] — Robertam: pasākumu skaits, dibināšanas gads.
// Inventāra vienību skaits atbilst katalogam (~40).
const stats = [
  { to: 500, suffix: "+", label: "pasākumi" },
  { to: 40, suffix: "+", label: "inventāra vienības" },
  { to: 2019, prefix: "kopš ", label: "" },
];

export default function About() {
  return (
    <section className="bg-bg py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <p className="font-mono text-sm uppercase tracking-[0.2em] text-gold">
                Par mums
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
                Jaunākie izklaižu risinājumi Taviem svētkiem
              </h2>
              <div className="mt-6 space-y-4 leading-relaxed text-text/80">
                <p>
                  Mūsu uzņēmums radīts ar mērķi sniegt klientiem jaunākos
                  izklaižu risinājumus. Piedāvājam plašu svētku inventāra
                  katalogu perfektam svinību noskaņojumam: piepūšamās atrakcijas
                  izmantošanai iekštelpās vai ārā, dažāda stila foto kastes,
                  viesugrāmata — audio novēlējumu telefons, un vairāki svētku
                  specefekti. Piedāvājam arī galdu klāšanu, servēšanu un
                  dekorēšanu (bez ēdināšanas), ideju druku.
                </p>
                <p>
                  Mūsu pakalpojumi seko līdzi mūsdienu ballīšu tendencēm, lai
                  sniegtu klientiem visaktuālākos ballīšu risinājumus. Piedāvājam
                  pakalpojumus gan privātpersonām, gan uzņēmumiem.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-xl border border-gold/25 shadow-[0_20px_60px_-30px_rgba(212,169,96,0.35)]">
              <Image
                src="/images/about/komanda.png"
                alt="Anabella Party komanda"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
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
