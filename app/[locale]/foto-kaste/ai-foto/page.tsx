import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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

const themeKeys = [
  "afTheme1",
  "afTheme2",
  "afTheme3",
  "afTheme4",
  "afTheme5",
  "afTheme6",
  "afTheme7",
] as const;

export default async function AiFotoPage() {
  const [t, ts] = await Promise.all([
    getTranslations("pages"),
    getTranslations("sec"),
  ]);
  return (
    <>
      <SectionHero title={t("aiFotoTitle")} tagline={t("aiFotoTagline")} />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="text-text/85">{ts("afIntro")}</p>

            <h2 className="mt-8 font-display text-lg font-semibold text-gold">
              {ts("afThemesTitle")}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {themeKeys.map((k) => (
                <li
                  key={k}
                  className="rounded-full border border-gold/30 px-4 py-1.5 text-sm text-text/85"
                >
                  {ts(k)}
                </li>
              ))}
            </ul>

            <p className="mt-8 text-text/85">{ts("afPrice")}</p>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <a
                href="tel:+37129222761"
                className="rounded-full bg-gold px-8 py-3 text-center font-semibold text-black transition-shadow hover:shadow-[0_0_25px_rgba(212,169,96,0.5)]"
              >
                {ts("afCall")}
              </a>
              <Link
                href="/kontakti"
                className="rounded-full border-2 border-gold px-8 py-3 text-center font-semibold text-gold transition-colors hover:bg-gold/10"
              >
                {ts("afForm")}
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
