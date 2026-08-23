import { getTranslations } from "next-intl/server";
import Reveal from "@/components/reveal";
import { getAiPartyBanner } from "@/lib/ai-party-banner";

// AI Party — jauns pakalpojums, reklāmas banneris zem kategoriju režģa. Viss
// saturs + slēdzis + saite nāk no DB (site_content 'aiparty.banner'), pārvaldāms
// adminā. Ja banneris nav aktīvs / DB tukšs → nerādās (getAiPartyBanner → null).
// Saite tukša → poga neaktīva ("Drīzumā"); URL ieliekot adminā → kļūst aktīva.
export default async function AiPartyBanner() {
  const banner = await getAiPartyBanner();
  if (!banner) return null;

  const t = await getTranslations("aiParty");
  const url = banner.url;
  const live = url.length > 0;

  return (
    <Reveal className="mt-8">
      <div className="relative overflow-hidden rounded-3xl border-2 border-gold/40 bg-gradient-to-br from-[#22374e] via-[#152536] to-[#0f1419] p-6 sm:p-10">
        {/* Zelta glow — vizuāli atdala no kategoriju kartēm (cits produkts, ne kategorija). */}
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(212,169,96,0.20),transparent_65%)] blur-2xl"
          aria-hidden
        />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            {banner.badge && (
              <span className="inline-block rounded-full border border-gold/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold">
                {banner.badge}
              </span>
            )}
            <h3 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
              {banner.title}
            </h3>
            {banner.text && (
              <p className="mt-3 leading-relaxed text-text/80">{banner.text}</p>
            )}
          </div>

          <div className="shrink-0">
            {live ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-gold px-8 py-3 font-semibold text-black shadow-[0_20px_60px_-20px_rgba(212,169,96,0.5)] transition-transform hover:scale-[1.03]"
              >
                {banner.cta || t("cta")} →
              </a>
            ) : (
              // Saite tukša → neaktīvs, nav <a>, nav klikšķa, tikai "Drīzumā".
              <span
                className="inline-flex cursor-default items-center rounded-full border-2 border-gold/40 px-8 py-3 font-semibold text-gold/70"
                aria-disabled="true"
              >
                {t("soon")}
              </span>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
