import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Reveal from "@/components/reveal";
import { COMPANY } from "@/lib/company";
import { getSiteImage } from "@/lib/site-content";

// "Par mums" (B2B spec §4.5) — B2B tonis + komandas bloks ar foto kartītēm.
// Augšējais lielais attēls = komandas kopbilde / pasākuma kadrs (NE atsevišķu
// personu foto — tie ir kartītēs). Kartīšu foto konfigurējami Supabase storage
// (site_content team.*), fallback uz iniciāļu apli.
export default async function About({ image }: { image?: string | null }) {
  const t = await getTranslations("about");
  const photo = image?.trim() ? image : null;
  const story = [t("story1"), t("story2"), t("story3")];
  const pluses = [t("plus1"), t("plus2"), t("plus3"), t("plus4")];

  const [imgAiva, imgRoberts, imgMatiss, imgSolvita] = await Promise.all([
    getSiteImage("team.aiva"),
    getSiteImage("team.roberts"),
    getSiteImage("team.matiss"),
    getSiteImage("team.solvita"),
  ]);

  // E-pastu kartītēs nerāda — visiem kopīgs info@; atstāj tikai tālruni (kur ir).
  const team = [
    {
      name: "Aiva Dimante",
      role: t("teamAivaRole"),
      phone: COMPANY.contact.phone,
      phoneDisplay: COMPANY.contact.phoneDisplay,
      initials: "AD",
      photo: imgAiva,
    },
    {
      name: "Roberts Dimants",
      role: t("teamRobertsRole"),
      phone: COMPANY.altContact.phone,
      phoneDisplay: COMPANY.altContact.phoneDisplay,
      initials: "RD",
      photo: imgRoberts,
    },
    {
      name: "Matīss Zeimulis",
      role: t("teamMatissRole"),
      phone: null,
      phoneDisplay: null,
      initials: "MZ",
      photo: imgMatiss,
    },
    {
      name: "Solvita Katiņa",
      role: t("teamSolvitaRole"),
      phone: null,
      phoneDisplay: null,
      initials: "SK",
      photo: imgSolvita,
    },
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Lielais attēls — komandas kopbilde / pasākuma kadrs */}
          <Reveal className="order-first lg:order-last" delay={0.1}>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-xl border border-gold/25 shadow-[0_20px_60px_-30px_rgba(212,169,96,0.35)]">
              {photo ? (
                <Image
                  src={photo}
                  alt="Anabella Party komanda"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1e4257] via-navy to-[#0a1a22]">
                  <span className="font-display text-6xl font-bold text-gold/40">
                    Anabella
                  </span>
                </div>
              )}
            </div>
          </Reveal>

          {/* Stāsts */}
          <Reveal>
            <div>
              <p className="font-mono text-sm uppercase tracking-[0.2em] text-gold">
                {t("eyebrow")}
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
                {t("heading")}
              </h2>
              <div className="mt-6 space-y-4 leading-relaxed text-text/80">
                {story.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Mūsu mazie lielie plusi */}
              <div className="mt-8 rounded-2xl border border-gold/30 bg-navy/25 p-6">
                <p className="font-display text-sm font-semibold uppercase tracking-wide text-gold">
                  {t("plusesTitle")}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {pluses.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-text/85">
                      <span
                        aria-hidden
                        className="mt-1.5 inline-block h-2 w-2 shrink-0 rotate-45 bg-gold"
                      />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Komandas bloks (§4.5) — 4 kartītes ar foto, vienāds augstums */}
        <Reveal delay={0.1}>
          <div className="mt-16">
            <h3 className="text-center font-display text-xl font-semibold text-gold">
              {t("teamTitle")}
            </h3>
            <div className="mx-auto mt-8 grid max-w-4xl items-stretch gap-6 sm:grid-cols-2">
              {team.map((m) => (
                <div
                  key={m.name}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-gold/25 bg-navy/25"
                >
                  <div className="relative aspect-[4/5] w-full">
                    {m.photo ? (
                      <Image
                        src={m.photo}
                        alt={m.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1e4257] via-navy to-[#0a1a22]">
                        <span className="flex h-20 w-20 items-center justify-center rounded-full border border-gold/40 bg-gold/10 font-display text-2xl font-bold text-gold">
                          {m.initials}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="font-display text-lg font-semibold text-text">
                      {m.name}
                    </p>
                    <p className="mt-1 text-sm text-text/60">{m.role}</p>
                    {m.phone && (
                      <a
                        href={`tel:${m.phone}`}
                        className="mt-3 text-sm font-semibold text-gold hover:underline"
                      >
                        {m.phoneDisplay}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
