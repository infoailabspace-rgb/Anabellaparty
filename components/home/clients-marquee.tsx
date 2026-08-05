"use client";

import { useState } from "react";
import { useReducedMotion } from "framer-motion";
import { clients } from "@/lib/clients";
import Reveal from "@/components/reveal";

function Logo({ name, logo }: { name: string; logo: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex h-12 w-36 shrink-0 items-center justify-center">
      {failed ? (
        <span className="flex h-12 w-full items-center justify-center rounded-lg border border-gold/40 px-3 text-center text-xs font-semibold text-gold/70">
          {name}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={name}
          className="h-12 w-full object-contain opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export default function ClientsMarquee() {
  const reduce = useReducedMotion();
  const maskStyle = {
    maskImage:
      "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
    WebkitMaskImage:
      "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
  } as const;

  return (
    <section className="bg-navy py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-bold tracking-tight md:text-4xl">
            Mums uzticas
          </h2>
        </Reveal>

        <div className="mt-14">
          {reduce ? (
            // Reduced-motion — statisks režģis, ne ritinājums.
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {clients.map((c) => (
                <div key={c.name} className="flex justify-center">
                  <Logo name={c.name} logo={c.logo} />
                </div>
              ))}
            </div>
          ) : (
            <div className="anabella-marquee overflow-hidden" style={maskStyle}>
              <div className="anabella-marquee-track gap-12">
                {[...clients, ...clients].map((c, i) => (
                  <Logo key={`${c.name}-${i}`} name={c.name} logo={c.logo} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
