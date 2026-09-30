import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Reveal from "@/components/reveal";
import { getAiPartyBanner } from "@/lib/ai-party-banner";

// AI Party sadaļa /foto-kaste/ai-foto lapā: digitālā alternatīva fiziskajai AI
// foto kastei. Saturs nāk no TĀ PAŠA DB ieraksta, ko lieto sākumlapas banneris
// (site_content 'aiparty.banner' -> title/text/url/cta), lai teksts būtu vienā
// vietā un pārvaldāms adminā; paskaidrojums, čipi un cena ir statiski
// (messages.aiParty). Nav aktīvs / DB tukšs / attēla nav -> sadaļa nerādās.
// JSON-LD šeit apzināti netiek pievienots - lapas aiFotoProductNode apraksta
// fizisko piedevu (+100 EUR), un otrs Product mezgls dotu pretrunīgas cenas.
export default async function AiPartySection() {
  const banner = await getAiPartyBanner();
  if (!banner) return null;

  const t = await getTranslations("aiParty");
  const live = banner.url.length > 0;
  const points = [t("point1"), t("point2"), t("point3"), t("point4")];

  return (
    <section className="mx-auto max-w-6xl px-6 pb-16">
      <Reveal>
        <div className="overflow-hidden rounded-2xl border-2 border-gold/25 bg-navy/25">
          <div className="grid md:grid-cols-2">
            {/* Attēls - tas pats bannera fona attēls no DB */}
            <div className="relative aspect-[4/3] w-full md:aspect-auto md:min-h-[440px]">
              <Image
                src={banner.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={60}
                loading="lazy"
                aria-hidden="true"
                className="object-cover"
              />
            </div>

            {/* Teksts */}
            <div className="p-6 sm:p-8">
              <h2 className="font-display text-2xl font-bold text-text sm:text-3xl">
                {t("sectionTitle")}
              </h2>
              <p className="mt-2 font-display text-lg font-semibold text-gold">
                {banner.title}
              </p>

              {banner.text && (
                <p className="mt-4 text-text/85">{banner.text}</p>
              )}
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
                {live ? (
                  <a
                    href={banner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full bg-gold px-8 py-3 font-semibold text-black transition-shadow hover:shadow-[0_0_25px_rgba(212,169,96,0.5)]"
                  >
                    {banner.cta || t("cta")} →
                  </a>
                ) : (
                  // Saite tukša -> neaktīvs, tāpat kā sākumlapas bannerī.
                  <span
                    className="inline-flex cursor-default items-center rounded-full border border-gold bg-gold/20 px-8 py-3 font-semibold text-gold"
                    aria-disabled="true"
                  >
                    {t("soon")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
