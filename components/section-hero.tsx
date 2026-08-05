import Reveal from "@/components/reveal";

export default function SectionHero({
  title,
  tagline,
}: {
  title: string;
  tagline: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-gold/20">
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-bg to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,169,96,0.15),transparent_60%)]" />
      <Reveal className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-center sm:py-28">
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-text/80">{tagline}</p>
      </Reveal>
    </section>
  );
}
