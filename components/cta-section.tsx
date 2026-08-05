import Link from "next/link";
import Reveal from "@/components/reveal";

export default function CtaSection({
  title = "Gatavs svinēt?",
  text = "Rezervē inventāru jau šodien un padari savu pasākumu neaizmirstamu.",
  buttonLabel = "Rezervēt tagad",
  href = "/rezervet",
}: {
  title?: string;
  text?: string;
  buttonLabel?: string;
  href?: string;
}) {
  return (
    <section className="relative overflow-hidden py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,169,96,0.12),transparent_70%)]" />
      <Reveal className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <h2 className="font-display text-4xl font-bold tracking-tight">{title}</h2>
        <p className="mt-4 text-lg text-text/80">{text}</p>
        <Link
          href={href}
          className="mt-10 inline-block rounded-full bg-gold px-10 py-4 text-lg font-semibold text-black transition-shadow hover:shadow-[0_0_30px_rgba(212,169,96,0.6)]"
        >
          {buttonLabel}
        </Link>
      </Reveal>
    </section>
  );
}
