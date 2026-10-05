// Servera komponente: marquee ir tīrs CSS (anabella-clients-marquee), un
// prefers-reduced-motion to aptur caur CSS media query (globals.css) - nav
// vajadzīgs useReducedMotion/JS. Nav klienta JS.
import { getTranslations } from "next-intl/server";
import type { Client } from "@/lib/clients";
import { sbImage } from "@/lib/sb-image";

const FADE =
  "linear-gradient(to right, transparent, black 8%, black 92%, transparent)";

// Supabase attēlu transformācija: 240 px plats, q70 (mazāks logo fails).
const logoSrc = (url: string) => sbImage(url, 240, 70);

function Logo({ c, hidden = false }: { c: Client; hidden?: boolean }) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoSrc(c.logo)}
      alt={c.name}
      width={140}
      height={56}
      loading="lazy"
      decoding="async"
      className="h-14 w-auto object-contain transition-transform duration-(--duration-base) hover:scale-105"
    />
  );
  if (c.url) {
    return (
      <a
        href={c.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={c.name}
        // Dublētā (aria-hidden) lentes puse nav fokusējama.
        tabIndex={hidden ? -1 : undefined}
        className="shrink-0"
      >
        {img}
      </a>
    );
  }
  return <span className="shrink-0">{img}</span>;
}

// Tikai logo lente (bez sekcijas/virsraksta/fona) - iegulstama TrustBar sekcijā.
// prefers-reduced-motion aptur animāciju caur CSS (globals.css .anabella-clients-marquee).
function MarqueeBody({
  logos,
  pauseLabel,
}: {
  logos: Client[];
  pauseLabel: string;
}) {
  // Dublē masīvu, līdz vismaz 12 elementi vienā pusē → ekrāns pilns arī ar
  // dažiem logo, cilpa nemanāma. Katra puse tiek renderēta divreiz (2×) → -50%.
  const reps = Math.max(1, Math.ceil(12 / logos.length));
  const half = Array.from({ length: reps }).flatMap(() => logos);
  const duration = Math.max(30, half.length * 3);
  // WCAG 2.2.2: kustīgam saturam > 5 s vajag pauzi. Bez klienta JS - fokusējams
  // checkbox (atstarpe pārslēdz) + CSS animation-play-state (globals.css).
  return (
    <div className="anabella-marquee-wrap relative w-full">
      <label className="absolute -top-12 right-4 z-10 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-gold/30 text-gold transition-colors hover:border-gold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold sm:right-6">
        <input type="checkbox" className="anabella-marquee-toggle sr-only" aria-label={pauseLabel} />
        <svg viewBox="0 0 24 24" className="anabella-marquee-pause h-4 w-4" fill="currentColor" aria-hidden="true">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
        <svg viewBox="0 0 24 24" className="anabella-marquee-play hidden h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      </label>
      <div
        className="relative w-full overflow-hidden"
        style={{ maskImage: FADE, WebkitMaskImage: FADE }}
      >
        <div
          className="anabella-clients-marquee flex w-max"
          style={{ animationDuration: `${duration}s` }}
        >
          <div className="flex shrink-0 items-center gap-16 pr-16">
            {half.map((c, i) => (
              <Logo key={`a-${i}`} c={c} />
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-16 pr-16" aria-hidden="true">
            {half.map((c, i) => (
              <Logo key={`b-${i}`} c={c} hidden />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ClientsMarquee({
  clients,
  embedded = false,
}: {
  clients: Client[];
  embedded?: boolean;
}) {
  const logos = clients.filter((c) => c.logo);

  // Bez logo → nekas netiek renderēts.
  if (logos.length === 0) return null;
  const ta = await getTranslations("a11y");

  // Iegultā versija (TrustBar) - tikai lente, bez sava fona/virsraksta.
  if (embedded) return <MarqueeBody logos={logos} pauseLabel={ta("pauseLogos")} />;

  // Atsevišķā (mantotā) versija - pati sekcija ar virsrakstu.
  const t = await getTranslations("clients");
  return (
    <section className="border-t border-gold/10 bg-navy/20 py-16">
      <h2 className="mb-10 text-center font-display text-block font-bold tracking-tight">
        {t("heading")}
      </h2>
      <MarqueeBody logos={logos} pauseLabel={ta("pauseLogos")} />
    </section>
  );
}
