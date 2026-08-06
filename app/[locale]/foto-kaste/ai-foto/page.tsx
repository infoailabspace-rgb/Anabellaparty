import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import SectionHero from "@/components/section-hero";
import ImageGallery from "@/components/image-gallery";
import Reveal from "@/components/reveal";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale, "aiFoto", "/foto-kaste/ai-foto");
}

// AI foto galerija — dažādas tēmas (faili nāk vēlāk, galerija krīt uz placeholder).
const aiGallery = [
  "/images/ai-foto/cover.jpg",
  "/images/ai-foto/01.jpg",
  "/images/ai-foto/02.jpg",
  "/images/ai-foto/03.jpg",
  "/images/ai-foto/04.jpg",
];

const themes = [
  "Gatsby retro",
  "Supervaroņi",
  "Kosmosa iekarotāji",
  "Harija Potera burvji",
  "Elegantas profesijas",
  "Senie laiki",
  "Klienta paša ideja",
];

export default async function AiFotoPage() {
  const t = await getTranslations("pages");
  return (
    <>
      <SectionHero title={t("aiFotoTitle")} tagline={t("aiFotoTagline")} />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="text-text/85">
              AI foto kaste pārvērš viesus par supervaroņiem, kosmosa
              ceļotājiem, retro gangsteriem un Holivudas zvaigznēm. Efektu
              pielāgojam pasākuma tematikai — no elegantām kāzām līdz
              korporatīvai tēmu ballītei.
            </p>

            <h2 className="mt-8 font-display text-lg font-semibold text-gold">
              Populārākās tēmas
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {themes.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-gold/30 px-4 py-1.5 text-sm text-text/85"
                >
                  {t}
                </li>
              ))}
            </ul>

            <p className="mt-8 text-text/85">
              AI funkciju iespējams pievienot jebkurai foto kastei —{" "}
              <span className="font-mono font-semibold text-gold">+100 €</span>{" "}
              papildus izvēlētās foto kastes cenai.
            </p>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <a
                href="tel:+37129222761"
                className="rounded-full bg-gold px-8 py-3 text-center font-semibold text-black transition-shadow hover:shadow-[0_0_25px_rgba(212,169,96,0.5)]"
              >
                Zvanīt +371 29222761
              </a>
              <Link
                href="/kontakti"
                className="rounded-full border-2 border-gold px-8 py-3 text-center font-semibold text-gold transition-colors hover:bg-gold/10"
              >
                Aizpildīt anketu
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ImageGallery images={aiGallery} alt="AI foto kaste" />
          </Reveal>
        </div>
      </div>
    </>
  );
}
