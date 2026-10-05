import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Reveal from "@/components/reveal";
import { getAiPartyContent } from "@/lib/ai-party-banner";

// AI Party lapas (/foto-kaste/ai-party) galvenais bloks: digitālā alternatīva
// fiziskajai AI foto kastei.
//
// Lapa NAV piesieta bannera is_active slēdzim: getAiPartyContent() lasa to pašu
// site_content 'aiparty.banner' ierakstu, bet ignorē is_active un neprasa
// obligātu attēlu. Tukšie lauki -> fallback no messages.aiParty. is_active
// turpina kontrolēt TIKAI AiPartyBanner (sākumlapa, /svinibu-inventars).
//
// JSON-LD Product mezgls šeit apzināti netiek pievienots - cena ir ai-party.app
// pusē, ne mūsu katalogā.

// Lapas CTA VIENMĒR ved uz ārējo pakalpojumu, un tas ir apzināti hardkodēts, ne
// no DB: bannera url norāda uz ŠO lapu, tāpēc no DB ņemts url liktu CTA vest uz
// sevi pašu.
const AI_PARTY_URL = "https://ai-party.app";

// Statiska attēla fallback, ja DB attēla nav. Pagaidām repo nav piemērota faila
// (vienīgais kandidāts ir neizmantots 8 MB PNG), tāpēc null -> karte renderējas
// bez attēla, teksts pilnā platumā. Lai ieslēgtu: ieliec failu
// public/images/ai-party/ un norādi tā ceļu šeit.
const FALLBACK_IMAGE: string | null = null;

export default async function AiPartySection() {
  const [content, t] = await Promise.all([
    getAiPartyContent(),
    getTranslations("aiParty"),
  ]);

  const title = content.title ?? t("title");
  const text = content.text ?? t("text");
  const cta = content.cta ?? t("cta");
  const image = content.image ?? FALLBACK_IMAGE;
  const points = [t("point1"), t("point2"), t("point3"), t("point4")];

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <Reveal>
        <div className="overflow-hidden rounded-card border-2 border-gold/25 bg-navy/25">
          <div className={image ? "grid md:grid-cols-2" : ""}>
            {/* Attēls - tas pats bannera attēls no DB (ja ir) */}
            {image && (
              <div className="relative aspect-[4/3] w-full md:aspect-auto md:min-h-[440px]">
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={60}
                  loading="lazy"
                  aria-hidden="true"
                  className="object-cover"
                />
              </div>
            )}

            {/* Teksts */}
            <div className="p-6 sm:p-8">
              <h2 className="font-display text-block font-bold text-text">
                {t("sectionTitle")}
              </h2>
              <p className="mt-2 font-display text-lg font-semibold text-gold">
                {title}
              </p>

              {text && <p className="mt-4 text-text/85">{text}</p>}
              <p className="mt-4 text-text/85">{t("explain")}</p>

              <ul className="mt-6 flex flex-wrap gap-2">
                {points.map((point, i) => (
                  <li
                    key={i}
                    className="rounded-full border border-gold/30 px-4 py-1.5 text-sm text-text/85"
                  >
                    {point}
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-text/85">{t("price")}</p>

              <div className="mt-6">
                <a
                  href={AI_PARTY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full bg-gold px-8 py-3 font-semibold text-on-gold transition-shadow hover:shadow-glow"
                >
                  {cta} →
                </a>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
