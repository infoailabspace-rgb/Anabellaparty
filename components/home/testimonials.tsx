"use client";

import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { PublicTestimonial } from "@/lib/site-data";
import Reveal from "@/components/reveal";

function Stars({ n }: { n: number }) {
  return (
    <div
      className="flex gap-1 text-gold"
      role="img"
      aria-label={`${n} no 5 zvaigznēm`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} aria-hidden="true">
          {i < n ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

export default function Testimonials({
  testimonials,
}: {
  testimonials: PublicTestimonial[];
}) {
  const reduce = useReducedMotion();
  const [perView, setPerView] = useState(1);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const maxIndex = Math.max(0, testimonials.length - perView);

  // Cik kartītes redzamas — atkarībā no ekrāna platuma.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setPerView(mq.matches ? 3 : 1);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Turi index derīgā diapazonā, kad mainās perView.
  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const next = useCallback(
    () => setIndex((i) => (i >= maxIndex ? 0 : i + 1)),
    [maxIndex],
  );
  const prev = () => setIndex((i) => (i <= 0 ? maxIndex : i - 1));

  // Auto-ritinājums ik 6s (apstājas uz hover / reduced-motion).
  useEffect(() => {
    if (reduce || paused) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [reduce, paused, next]);

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-bold tracking-tight md:text-4xl">
            Ko saka klienti
          </h2>
        </Reveal>

        <div
          className="relative mt-14"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${index * (100 / perView)}%)` }}
            >
              {testimonials.map((t) => (
                <figure
                  key={t.author}
                  className="shrink-0 px-3"
                  style={{ width: `${100 / perView}%` }}
                >
                  <div className="flex h-full flex-col rounded-2xl border border-gold/20 bg-navy/30 p-8 shadow-[0_20px_60px_-30px_rgba(212,169,96,0.25)]">
                    <Stars n={t.rating} />
                    <blockquote className="mt-4 flex-1 leading-relaxed text-text/80">
                      “{t.text}”
                    </blockquote>
                    <figcaption className="mt-6">
                      <p className="font-display font-semibold text-gold">
                        {t.author}
                      </p>
                      <p className="text-sm text-text/50">{t.event}</p>
                    </figcaption>
                  </div>
                </figure>
              ))}
            </div>
          </div>

          {/* Bultiņas */}
          <button
            type="button"
            onClick={prev}
            aria-label="Iepriekšējā atsauksme"
            className="absolute -left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-bg/80 text-xl text-gold transition-colors hover:bg-gold/10 sm:-left-4"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Nākamā atsauksme"
            className="absolute -right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-bg/80 text-xl text-gold transition-colors hover:bg-gold/10 sm:-right-4"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
