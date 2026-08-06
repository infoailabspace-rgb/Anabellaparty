import type { Metadata } from "next";
import SectionHero from "@/components/section-hero";
import Reveal from "@/components/reveal";
import { partners } from "@/lib/partners";

export const metadata: Metadata = {
  title: "Mūsu draugi | Anabella Party",
  description:
    "Uzticami sadarbības partneri un draugi, ko iesakām Tavam pasākumam Latvijā — no svinību organizēšanas līdz papildu pakalpojumiem.",
};

export default function MusuDraugiPage() {
  return (
    <>
      <SectionHero
        title="Mūsu draugi"
        tagline="Uzticami partneri, ar kuriem kopā radām neaizmirstamus pasākumus."
      />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <div className="flex h-full flex-col rounded-2xl border-2 border-gold/25 bg-navy/25 p-6">
                <h2 className="font-display text-lg font-semibold text-gold">
                  {p.name}
                </h2>
                <p className="mt-2 flex-1 text-sm text-text/75">
                  {p.description}
                </p>
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-sm font-semibold text-gold hover:underline"
                  >
                    Apmeklēt →
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
