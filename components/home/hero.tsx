// Servera komponente. Redizains: foto vadīts hero - reāls foto no galerijas
// (foto kaste korporatīvā pasākumā), viens primārais CTA + sekundāra B2B saite.
// Bez fona video un dekoratīviem efektiem; ieeja tikai ar īsu fade (reduced-motion
// to atslēdz globals.css).
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { HeroMedia as HeroMediaT } from "@/lib/hero-media";

// Noklusējuma foto: Ozola foto kaste korporatīvā vakarā (site_gallery). Ja admins
// iestata hero.home attēlu, tas ir prioritārs.
export const HOME_HERO_IMAGE =
  "https://uewpetpyckpuzqywtcmf.supabase.co/storage/v1/object/public/site-images/gallery/96053b9c-acc8-41af-beb0-9440a0e0bef4.jpg";

export default function Hero({
  media,
  title = "Neaizmirstamas ballītes sākas šeit",
  accent = "ballītes",
  subtitle = "Foto kastes, AI foto un pasākumu inventārs korporatīvajiem pasākumiem un svinībām. Strādājam visā Latvijā.",
}: {
  media?: HeroMediaT | null;
  title?: string;
  accent?: string;
  subtitle?: string;
}) {
  const tn = useTranslations("nav");
  const th = useTranslations("home");
  const image = media?.image || HOME_HERO_IMAGE;
  // Akcenta vārds - kursīvā zeltā (virsraksta teksts pats nemainās, nāk no DB).
  const words = title.split(" ");

  return (
    <section className="relative overflow-hidden border-b border-gold/15">
      <div className="container-site grid items-center gap-8 pb-12 pt-6 sm:pt-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
        {/* Foto - mobilajā zem teksta (CTA paliek pirmajā ekrānā virs sīkdatņu joslas),
            desktopā labajā kolonnā */}
        <div className="relative order-last aspect-[16/11] overflow-hidden rounded-panel border border-gold/25 lg:aspect-[4/5]">
          <Image
            src={image}
            alt={th("heroAlt")}
            fill
            priority
            fetchPriority="high"
            quality={70}
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover object-[30%_50%]"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg/40 via-transparent to-transparent" />
        </div>

        <div className="anabella-fade-up">
          {/* Īsos ekrānos (≤700 px augstums) eyebrow paslēpts, lai CTA paliek virs sīkdatņu joslas */}
          <p className="eyebrow [@media(max-height:700px)]:hidden">{th("heroEyebrow")}</p>
          <h1 className="mt-4 font-display [@media(max-height:700px)]:mt-0 text-hero font-semibold tracking-tight text-text">
            {words.map((w, i) => (
              <span key={`${w}-${i}`} className={w === accent ? "italic text-gold" : undefined}>
                {w}
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-text/80 sm:mt-5 sm:text-lead">{subtitle}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 sm:mt-8">
            <Link
              href="/rezervet"
              className="inline-flex min-h-12 items-center rounded-full bg-gold px-8 font-semibold text-on-gold transition-colors duration-(--duration-fast) hover:bg-gold/90"
            >
              {tn("rezervet")}
            </Link>
            <Link
              href="/kontakti/#pieprasijums"
              className="inline-flex min-h-11 items-center font-semibold text-gold underline decoration-gold/40 underline-offset-[6px] transition-colors hover:decoration-gold"
            >
              {th("b2bCta")} →
            </Link>
          </div>

          {/* Uzticības rinda: B2B pamatnosacījumi vienā skatienā */}
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-gold/15 pt-6 text-sm text-text-muted">
            {[th("heroTrust1"), th("heroTrust2"), th("heroTrust3")].map((x) => (
              <li key={x} className="flex items-center gap-2">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gold" />
                {x}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
