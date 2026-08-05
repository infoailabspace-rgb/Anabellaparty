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
    <section className="relative overflow-hidden bg-gradient-to-br from-[#E8C079] via-gold to-[#C79A4E] py-24 md:py-32">
      {/* Lēna zelta gaismas pulsācija */}
      <div
        className="absolute left-1/2 top-1/2 h-[120%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.35),transparent_60%)] anabella-glow-pulse"
        aria-hidden
      />
      <Reveal className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <h2 className="font-display text-4xl font-bold tracking-tight text-[#0F1419] md:text-5xl">
          {title}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-[#0F1419]/80">{text}</p>
        <Link
          href={href}
          className="mt-10 inline-block rounded-full bg-bg px-10 py-4 text-lg font-semibold text-gold shadow-[0_20px_60px_-20px_rgba(15,20,25,0.6)] transition-transform hover:scale-[1.03]"
        >
          {buttonLabel}
        </Link>
      </Reveal>
    </section>
  );
}
