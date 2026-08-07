"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { EASE, word, wordStagger } from "@/lib/motion";
import HeroMedia from "@/components/hero-media";
import type { HeroMedia as HeroMediaT } from "@/lib/hero-media";

export default function Hero({
  media,
  title = "Neaizmirstamas ballītes sākas šeit",
  accent = "ballītes",
  subtitle = "Foto kastes, piepūšamās atrakcijas un specefekti Tavam pasākumam. Piegāde Pierīgā bez maksas.",
}: {
  media?: HeroMediaT | null;
  title?: string;
  accent?: string;
  subtitle?: string;
}) {
  const reduce = useReducedMotion();
  const tn = useTranslations("nav");
  const th = useTranslations("home");
  const HEADLINE = title.split(" ");
  const GOLD_WORD = accent;

  return (
    <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden">
      {/* Fons — hero medijs (video/attēls), citādi premium gradients + zelta glow */}
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
            className="absolute left-1/2 top-[20%] h-[45vh] w-[70vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,169,96,0.22),transparent_65%)] blur-2xl anabella-glow-pulse"
            aria-hidden
          />
          <div className="absolute inset-0 bg-bg/40" />
        </>
      )}

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.h1
          className="font-display font-bold leading-[0.95] tracking-tight text-[clamp(2.5rem,7vw,5.5rem)]"
          variants={reduce ? undefined : wordStagger}
          initial={reduce ? undefined : "hidden"}
          animate={reduce ? undefined : "show"}
        >
          {HEADLINE.map((w, i) => (
            <motion.span
              key={`${w}-${i}`}
              variants={reduce ? undefined : word}
              className={`inline-block ${w === GOLD_WORD ? "text-gold" : ""}`}
            >
              {w}
              {i < HEADLINE.length - 1 ? " " : ""}
            </motion.span>
          ))}
        </motion.h1>

        {/* Zelta hairline, kas ievelkas */}
        <div className="mx-auto mt-6 h-px w-20 bg-gold anabella-hairline" />

        <motion.p
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-text/80"
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={reduce ? undefined : { duration: 0.6, delay: 0.4, ease: EASE }}
        >
          {subtitle}
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={reduce ? undefined : { duration: 0.6, delay: 0.55, ease: EASE }}
        >
          <Link
            href="/rezervet"
            className="rounded-full bg-gold px-8 py-3 font-semibold text-black shadow-[0_20px_60px_-20px_rgba(212,169,96,0.5)] transition-transform hover:scale-[1.03]"
          >
            {tn("rezervet")}
          </Link>
          <Link
            href="/svinibu-inventars"
            className="rounded-full border border-gold px-8 py-3 font-semibold text-gold transition-colors hover:bg-gold/10"
          >
            {th("viewInventory")}
          </Link>
        </motion.div>
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
