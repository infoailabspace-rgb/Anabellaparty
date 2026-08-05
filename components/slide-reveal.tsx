"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { EASE } from "@/lib/motion";

/**
 * Produktu bloku ieslīdēšana, katrs atsevišķi skatā.
 * Desktopā — pamīšus no kreisās/labās (zigzags). Mobilajā — tikai fadeUp
 * (nav horizontālas kustības). reduced-motion — statisks.
 *
 * `desktop` nolasa sinhroni pirmajā client renderā (lazy useState), lai
 * framer-motion `initial` uzreiz ir pareizs — citādi initial paliek "mobilais".
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
  const [desktop] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches,
  );

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  const x = desktop ? (index % 2 === 0 ? -64 : 64) : 0;
  const y = desktop ? 0 : 24;

  return (
    <motion.div
      className={className}
      suppressHydrationWarning
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
