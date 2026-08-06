import type { Metadata } from "next";
import SectionHero from "@/components/section-hero";
import ContactForm from "@/components/contact-form";
import Reveal from "@/components/reveal";
import { getContent } from "@/lib/site-content";

export const revalidate = 300;

const HOURS_FALLBACK =
  "Pirmdiena–Piektdiena: 9:00–20:00\nSestdiena–Svētdiena: 10:00–18:00\nPasākumi tiek apkalpoti arī ārpus darba laika pēc vienošanās.";

export const metadata: Metadata = {
  title: "Kontakti | Anabella Party",
  description:
    "Sazinies ar Anabella Party — pasākumu inventāra noma Ķekavā un Pierīgā. Tālrunis +371 29222761, info@anabellaparty.lv, WhatsApp. Piegāde Pierīgā bez maksas.",
};

export default async function KontaktiPage() {
  const hours = await getContent("contact.hours", HOURS_FALLBACK);
  const hoursLines = hours.split("\n").filter(Boolean);
  return (
    <>
      <SectionHero
        title="Kontakti"
        tagline="Pastāsti par savu pasākumu — atbildēsim ātri un ieteiksim labāko risinājumu."
      />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Kontaktinfo */}
          <Reveal className="space-y-8">
            <div>
              <h2 className="font-display text-xl font-semibold text-gold">
                Sazinies ar mums
              </h2>
              <ul className="mt-4 space-y-3 text-text/85">
                <li>
                  <a
                    href="tel:+37129222761"
                    className="transition-colors hover:text-gold"
                  >
                    📞 +371 29222761
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/37129222761"
                    className="transition-colors hover:text-gold"
                  >
                    💬 WhatsApp: +371 29222761
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@anabellaparty.lv"
                    className="transition-colors hover:text-gold"
                  >
                    ✉️ info@anabellaparty.lv
                  </a>
                </li>
                <li>📍 Vecozolu iela 14, Ķekava, Latvija</li>
              </ul>
            </div>

            <div>
              <h3 className="font-display text-sm font-semibold text-text">
                Darba laiks
              </h3>
              <ul className="mt-3 space-y-1 text-sm text-text/70">
                {hoursLines.map((line, i) => (
                  <li key={i} className={i === hoursLines.length - 1 ? "text-text/50" : ""}>
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            {/* Karte */}
            <div className="overflow-hidden rounded-2xl border-2 border-gold/25">
              <iframe
                title="Ķekava kartē"
                src="https://www.google.com/maps?q=Vecozolu+iela+14,+%C4%B6ekava,+Latvija&output=embed"
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>

          {/* Forma */}
          <Reveal delay={0.1}>
            <div className="rounded-2xl border-2 border-gold/25 bg-navy/25 p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold">
                Uzraksti mums
              </h2>
              <p className="mt-2 text-sm text-text/60">
                Aizpildi formu, un mēs sazināsimies ar Tevi.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
