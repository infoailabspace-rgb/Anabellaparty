import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/reveal";
import { getAiPartyBanner } from "@/lib/ai-party-banner";

// AI Party - jauns pakalpojums, reklāmas banneris zem kategoriju režģa. Stils =
// kategoriju kartes: fona attēls (object-cover) + tie paši tumšinājuma pārklājumi
// (bg-black/40 + gradients apakšā), teksts virsū apakšējā daļā. Viss saturs +
// slēdzis + saite + attēls nāk no DB (site_content 'aiparty.banner'), pārvaldāms
// adminā. Nav aktīvs / DB tukšs / attēla nav → nerādās (getAiPartyBanner → null).
export default async function AiPartyBanner() {
  const banner = await getAiPartyBanner();
  if (!banner) return null;

  const t = await getTranslations("aiParty");
  const live = banner.url.length > 0;
  // DB url var būt gan ārējs ("https://..."), gan iekšējs ceļš
  // ("/foto-kaste/ai-party"). Iekšējam lietojam next-intl Link, kas pieliek
  // valodas prefiksu (/en/..., /ru/...) un neatver jaunu cilni.
  const internal = banner.url.startsWith("/");
  const btnCls =
    "inline-flex items-center rounded-full bg-gold px-8 py-3 font-semibold text-black shadow-cta transition-colors";

  return (
    <Reveal className="mt-8">
      <div className="group relative isolate h-[280px] w-full overflow-hidden rounded-card border border-gold/25 shadow-lift md:h-[220px]">
        {/* Fona attēls - object-cover, kā kategoriju kartēs */}
        <Image
          src={banner.image}
          alt=""
          fill
          sizes="100vw"
          quality={60}
          loading="lazy"
          aria-hidden="true"
          className="-z-10 object-cover transition-colors duration-(--duration-slow)"
        />
        {/* Tie paši pārklājumi, kas kategoriju kartēm (konsekvents tumšinājums +
            gradients apakšā, kur teksts). */}
        <div className="absolute inset-0 -z-10 bg-black/40" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Zelta mirdzums - TIEŠI tas pats slānis, kas kategoriju kartēm
            (anabella-shimmer, pārslīd pāri), lai vizuāli saskan. */}

        {/* Teksts apakšējā daļā (kā kartēs) + poga */}
        <div className="flex h-full flex-col justify-end p-6 sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              {banner.badge && (
                <span className="inline-block rounded-full border border-gold/50 bg-black/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold">
                  {banner.badge}
                </span>
              )}
              <h3 className="mt-3 font-display text-2xl font-semibold text-text sm:text-3xl">
                {banner.title}
              </h3>
              {banner.text && (
                <p className="mt-2 text-sm leading-relaxed text-text/85 sm:text-base">
                  {banner.text}
                </p>
              )}
            </div>

            <div className="shrink-0">
              {live ? (
                internal ? (
                  <Link href={banner.url} className={btnCls}>
                    {banner.cta || t("cta")} →
                  </Link>
                ) : (
                  <a
                    href={banner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={btnCls}
                  >
                    {banner.cta || t("cta")} →
                  </a>
                )
              ) : (
                // Saite tukša → neaktīvs (nav <a>, nav klikšķa). Zeltains, ne
                // caurspīdīgs - banneris ir reklāma, poga jāizceļas.
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
  );
}
