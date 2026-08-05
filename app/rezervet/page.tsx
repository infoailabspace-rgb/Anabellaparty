import type { Metadata } from "next";
import Link from "next/link";
import SectionHero from "@/components/section-hero";
import Reveal from "@/components/reveal";

export const metadata: Metadata = {
  title: "Rezervēt | Anabella Party",
  description:
    "Rezervē pasākumu inventāru — foto kastes, atrakcijas un specefektus. Sazinies ar mums pa tālruni, WhatsApp vai e-pastu. Piegāde Pierīgā bez maksas.",
};

export default function RezervetPage() {
  return (
    <>
      <SectionHero
        title="Rezervēt"
        tagline="Tiešsaistes rezervāciju forma drīzumā — pagaidām sazinies ar mums tieši, atbildam ātri."
      />

      <Reveal className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-lg text-text/80">
          Pastāsti mums datumu, vietu un ko vēlies rezervēt — sagatavosim
          piedāvājumu un apstiprināsim brīvo laiku.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="https://wa.me/37129222761"
            className="rounded-full bg-gold px-8 py-3 font-semibold text-black transition-shadow hover:shadow-[0_0_25px_rgba(212,169,96,0.6)]"
          >
            Rakstīt WhatsApp
          </a>
          <a
            href="tel:+37129222761"
            className="rounded-full border-2 border-gold px-8 py-3 font-semibold text-gold transition-colors hover:bg-gold/10"
          >
            Zvanīt +371 29222761
          </a>
        </div>

        <p className="mt-8 text-sm text-text/60">
          Vai raksti uz{" "}
          <a
            href="mailto:info@anabellaparty.lv"
            className="text-gold hover:underline"
          >
            info@anabellaparty.lv
          </a>{" "}
          — vairāk kontaktu{" "}
          <Link href="/kontakti" className="text-gold hover:underline">
            kontaktu lapā
          </Link>
          .
        </p>
      </Reveal>
    </>
  );
}
