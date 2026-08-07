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
      className="h-12 w-auto object-contain opacity-65 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
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

export default function ClientsMarquee({ clients }: { clients: Client[] }) {
  const reduce = useReducedMotion();
  const t = useTranslations("clients");
  const logos = clients.filter((c) => c.logo);

  // Bez logo → sadaļa netiek renderēta. Nekādu placeholderu.
  if (logos.length === 0) return null;

  // Reduced-motion vai < 6 logo → statiska centrēta rinda (ritinājums tukšs).
  const isStatic = reduce || logos.length < 6;
  const duration = Math.max(30, logos.length * 3);

  return (
    <section className="border-t border-gold/10 bg-navy/20 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-10 text-center font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("heading")}
        </h2>

        {isStatic ? (
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {logos.map((c, i) => (
              <Logo key={i} c={c} />
            ))}
          </div>
        ) : (
          <div
            className="group relative overflow-hidden"
            style={{ maskImage: FADE, WebkitMaskImage: FADE }}
          >
            <div
              className="anabella-clients-marquee flex w-max group-hover:[animation-play-state:paused]"
              style={{ animationDuration: `${duration}s` }}
            >
              {/* Logo masīvs divreiz → cilpa nemanāma. 2. kopija aria-hidden. */}
              <div className="flex shrink-0 items-center gap-12 pr-12">
                {logos.map((c, i) => (
                  <Logo key={`a-${i}`} c={c} />
                ))}
              </div>
              <div className="flex shrink-0 items-center gap-12 pr-12" aria-hidden="true">
                {logos.map((c, i) => (
                  <Logo key={`b-${i}`} c={c} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
