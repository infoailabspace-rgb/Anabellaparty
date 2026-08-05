"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { EASE } from "@/lib/motion";

/**
 * Produktu bloku ieslīdēšana — izteikta: bloks iznirst no ārpus ekrāna
 * (pilns platums) un nostājas vietā ar spēcīgu palēninājumu.
 * Desktopā pamīšus no kreisās/labās; mobilajā tikai fadeUp (nav horizontālas
 * kustības → nav pārplūdes). reduced-motion — statisks.
 *
 * `desktop` un platumu nolasa sinhroni pirmajā client renderā (lazy useState),
 * lai framer-motion `initial` uzreiz ir pareizs.
 */
export default function SlideReveal({
  children,
  index,
  className,
}: {
  children: ReactNode;
  index: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [env] = useState(() => {
    if (typeof window === "undefined") return { desktop: false, w: 1200 };
    return {
      desktop: window.matchMedia("(min-width: 768px)").matches,
      w: window.innerWidth,
    };
  });

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  // Pilns ekrāna platums + rezerve, lai bloks sākas pilnīgi ārpus skata.
  const x = env.desktop ? (index % 2 === 0 ? -1 : 1) * (env.w + 100) : 0;
  const y = env.desktop ? 0 : 28;

  return (
    <motion.div
      className={className}
      suppressHydrationWarning
      initial={{ opacity: 0, x, y, scale: env.desktop ? 0.94 : 1 }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
