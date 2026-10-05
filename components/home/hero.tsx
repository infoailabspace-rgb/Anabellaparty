// Servera komponente (nav "use client"): tikai useTranslations (server-saderīgs)
// un CSS animācijas (anabella-word/fade-up). Nav klienta JS → mazāks sākumlapas bundle.
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HeroMedia from "@/components/hero-media";
import CallButton from "@/components/call-button";
import type { HeroMedia as HeroMediaT } from "@/lib/hero-media";

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
  const HEADLINE = title.split(" ");
  const GOLD_WORD = accent;

  // Mobilajā pb-28: saturs paceļas virs sīkdatņu joslas (~84 px) arī īsos ekrānos.
  return (
    <section className="relative flex min-h-[92svh] items-center justify-center overflow-hidden pb-28 sm:pb-0">
      {/* Fons - hero medijs (video/attēls), citādi premium gradients + zelta glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-bg to-black" />
      {media && (media.mp4 || media.image) ? (
        <>
          <HeroMedia
            mp4={media.mp4}
            webm={media.webm}
            poster={media.poster}
            image={media.image}
            preloadMeta
          />
          <div className="absolute inset-0 bg-bg/60" />
        </>
      ) : (
        <>
          <div
            className="absolute left-1/2 top-[20%] h-[45vh] w-[70vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(var(--gold-rgb)/0.22),transparent_65%)] blur-2xl anabella-glow-pulse"
            aria-hidden
          />
          <div className="absolute inset-0 bg-bg/40" />
        </>
      )}

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <h1 className="font-display text-hero font-bold tracking-tight">
          {HEADLINE.map((w, i) => (
            <span
              key={`${w}-${i}`}
              className={`anabella-word ${w === GOLD_WORD ? "text-gold" : ""}`}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              {w}
              {i < HEADLINE.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>

        {/* Zelta hairline, kas ievelkas */}
        <div className="mx-auto mt-4 h-px w-20 bg-gold anabella-hairline sm:mt-6" />

        <p
          className="anabella-fade-up mx-auto mt-4 max-w-xl text-base leading-relaxed text-text/80 sm:mt-6 sm:text-lg"
          style={{ animationDelay: "0.4s" }}
        >
          {subtitle}
        </p>

        <div
          className="anabella-fade-up mt-6 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4"
          style={{ animationDelay: "0.55s" }}
        >
          <Link
            href="/rezervet"
            className="inline-flex min-h-12 items-center rounded-full bg-gold px-8 font-semibold text-on-gold shadow-cta transition-transform duration-(--duration-fast) hover:scale-[1.03]"
          >
            {tn("rezervet")}
          </Link>
          {/* B2B poga (§4.1) - TIKAI desktopā (mobilajā rāda Rezervēt + Zvanīt) */}
          <Link
            href="/kontakti/#pieprasijums"
            className="hidden min-h-12 items-center rounded-full border border-gold px-8 font-semibold text-gold transition-colors hover:bg-gold/10 sm:inline-flex"
          >
            {th("b2bCta")} →
          </Link>
          {/* Zvanīšana - sekundāra (outline), vienmēr redzama */}
          <CallButton source="hero" variant="outline" />
        </div>
        {/* Mobilajā B2B ceļš kā sekundāra teksta saite (80% klientu - uzņēmumi) */}
        <Link
          href="/kontakti/#pieprasijums"
          className="anabella-fade-up mt-4 inline-flex min-h-11 items-center font-semibold text-gold underline underline-offset-4 sm:hidden"
          style={{ animationDelay: "0.6s" }}
        >
          {th("b2bCta")} →
        </Link>
      </div>

      {/* Scroll indikators */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 anabella-scroll-hint"
        aria-hidden
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-gold"
        >
          <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}
