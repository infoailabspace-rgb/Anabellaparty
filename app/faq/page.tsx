import type { Metadata } from "next";
import SectionHero from "@/components/section-hero";
import FaqAccordion from "@/components/faq-accordion";
import CtaSection from "@/components/cta-section";

export const metadata: Metadata = {
  title: "Biežāk uzdotie jautājumi (BUJ) | Anabella Party",
  description:
    "Atbildes par rezervāciju, piegādi, produktiem un maksājumiem. Foto kastes, atrakcijas un specefekti Latvijā. Piegāde Pierīgā bez maksas.",
};

export default function FaqPage() {
  return (
    <>
      <SectionHero
        title="Biežāk uzdotie jautājumi"
        tagline="Atbildes uz to, ko klienti jautā visbiežāk. Neatradi savu jautājumu? Sazinies ar mums."
      />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <FaqAccordion />
      </div>
      <CtaSection
        title="Vēl kāds jautājums?"
        text="Uzraksti vai piezvani — labprāt palīdzēsim izvēlēties Tavam pasākumam piemērotāko."
        buttonLabel="Sazināties"
        href="/kontakti"
      />
    </>
  );
}
