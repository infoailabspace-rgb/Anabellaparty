"use client";

import { useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { Client } from "@/lib/clients";

const FADE =
  "linear-gradient(to right, transparent, black 8%, black 92%, transparent)";

function Logo({ c }: { c: Client }) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={c.logo}
      alt={c.name}
      loading="lazy"
      className="h-14 w-auto object-contain transition-transform duration-300 hover:scale-105"
    />
  );
  if (c.url) {
    return (
      <a
        href={c.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={c.name}
        className="shrink-0"
      >
        {img}
      </a>
    );
  }
  return <span className="shrink-0">{img}</span>;
}

// Tikai logo lente (bez sekcijas/virsraksta/fona) — iegulstama TrustBar sekcijā.
function MarqueeBody({
  logos,
  reduce,
}: {
  logos: Client[];
  reduce: boolean | null;
}) {
  // prefers-reduced-motion → statisks centrēts režģis (ritinājums izslēgts).
  if (reduce) {
    return (
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-16 gap-y-8 px-6">
        {logos.map((c, i) => (
          <Logo key={i} c={c} />
        ))}
      </div>
    );
  }
  // Dublē masīvu, līdz vismaz 12 elementi vienā pusē → ekrāns pilns arī ar
  // dažiem logo, cilpa nemanāma. Katra puse tiek renderēta divreiz (2×) → -50%.
  const reps = Math.max(1, Math.ceil(12 / logos.length));
  const half = Array.from({ length: reps }).flatMap(() => logos);
  const duration = Math.max(30, half.length * 3);
  return (
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
            <Logo key={`b-${i}`} c={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ClientsMarquee({
  clients,
  embedded = false,
}: {
  clients: Client[];
  embedded?: boolean;
}) {
  const reduce = useReducedMotion();
  const t = useTranslations("clients");
  const logos = clients.filter((c) => c.logo);

  // Bez logo → nekas netiek renderēts.
  if (logos.length === 0) return null;

  // Iegultā versija (TrustBar) — tikai lente, bez sava fona/virsraksta.
  if (embedded) return <MarqueeBody logos={logos} reduce={reduce} />;

  // Atsevišķā (mantotā) versija — pati sekcija ar virsrakstu.
  return (
    <section className="border-t border-gold/10 bg-navy/20 py-16">
      <h2 className="mb-10 text-center font-display text-2xl font-bold tracking-tight sm:text-3xl">
        {t("heading")}
      </h2>
      <MarqueeBody logos={logos} reduce={reduce} />
    </section>
  );
}
