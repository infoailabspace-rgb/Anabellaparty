import Link from "next/link";
import Reveal from "@/components/reveal";

const steps = [
  {
    n: "01",
    title: "Izvēlies",
    text: "Apskati inventāru un izvēlies, kas padarīs Tavu pasākumu īpašu.",
  },
  {
    n: "02",
    title: "Rezervē",
    text: "Aizpildi rezervāciju dažās minūtēs — mēs apstiprinām datumu.",
  },
  {
    n: "03",
    title: "Mēs atbraucam",
    text: "Piegādājam, uzstādām un savācam. Tev atliek tikai svinēt.",
  },
];

const products = [
  { name: "SPOGULIS foto kaste", price: "€260 / 2h", extra: "+€110/h" },
  { name: "INSTAGRAM foto kaste", price: "€220 / 2h", extra: "" },
  { name: "Piepūšamā pils (balta)", price: "€230 / 10h", extra: "" },
  { name: "Specefekti (dzirksteles)", price: "€35 / 24h", extra: "" },
];

const reviews = [
  {
    text: "Foto kaste bija mūsu kāzu ballītes highlight! Viesi to nemaz negribēja atstāt.",
    author: "Laura & Jānis",
  },
  {
    text: "Profesionāla komanda, viss laikā un skaisti. Bērni bija sajūsmā par piepūšamo pili.",
    author: "Kristīne",
  },
  {
    text: "Dzirksteles radīja neaizmirstamu momentu. Noteikti rezervēsim atkal!",
    author: "Artūrs",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-bg to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(212,169,96,0.15),transparent_60%)]" />
        <Reveal className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Neaizmirstamas ballītes sākas šeit
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-text/80">
            Foto kastes, piepūšamās atrakcijas un specefekti Tavam pasākumam.
            Piegāde Pierīgā bez maksas.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/rezervet"
              className="rounded-full bg-gold px-8 py-3 font-semibold text-black transition-shadow hover:shadow-[0_0_25px_rgba(212,169,96,0.6)]"
            >
              Rezervēt
            </Link>
            <Link
              href="/svinibu-inventars"
              className="rounded-full border-2 border-gold px-8 py-3 font-semibold text-gold transition-colors hover:bg-gold/10"
            >
              Apskatīt inventāru
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Kā tas notiek */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-bold tracking-tight">
            Kā tas notiek
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="rounded-2xl border-2 border-gold/30 bg-navy/30 p-8 transition-transform hover:-translate-y-1">
                <span className="font-mono text-3xl font-bold text-gold">
                  {s.n}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold">
                  {s.title}
                </h3>
                <p className="mt-2 text-text/70">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Produkti */}
      <section className="bg-navy/20 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="text-center font-display text-3xl font-bold tracking-tight">
              Populārākais inventārs
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.08}>
                <div className="flex h-full flex-col justify-between rounded-2xl border-2 border-gold/30 bg-bg/60 p-6 transition-transform hover:-translate-y-1">
                  <h3 className="font-display text-lg font-semibold">
                    {p.name}
                  </h3>
                  <div className="mt-6">
                    <p className="font-mono text-2xl font-bold text-gold">
                      {p.price}
                    </p>
                    {p.extra && (
                      <p className="font-mono text-sm text-rose-gold">
                        {p.extra}
                      </p>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Atsauksmes */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-bold tracking-tight">
            Ko saka klienti
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.author} delay={i * 0.1}>
              <figure className="rounded-2xl border-2 border-gold/20 bg-navy/30 p-8">
                <blockquote className="text-text/80">“{r.text}”</blockquote>
                <figcaption className="mt-4 font-display font-semibold text-gold">
                  {r.author}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,169,96,0.12),transparent_70%)]" />
        <Reveal className="relative z-10 mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight">
            Gatavs svinēt?
          </h2>
          <p className="mt-4 text-lg text-text/80">
            Rezervē inventāru jau šodien un padari savu pasākumu neaizmirstamu.
          </p>
          <Link
            href="/rezervet"
            className="mt-10 inline-block rounded-full bg-gold px-10 py-4 text-lg font-semibold text-black transition-shadow hover:shadow-[0_0_30px_rgba(212,169,96,0.6)]"
          >
            Rezervēt tagad
          </Link>
        </Reveal>
      </section>
    </>
  );
}
