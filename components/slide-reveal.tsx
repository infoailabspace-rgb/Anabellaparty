"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
import { EASE } from "@/lib/motion";

/**
 * Produktu bloku ieslīdēšana — izteikta: bloks iznirst no ārpus ekrāna
 * (pilns platums) un nostājas vietā.
 *
 * SVARĪGI: novērojam nekustīgu ārējo ietvaru ar `useInView`, nevis pašu
 * animēto elementu. `whileInView`/IntersectionObserver ņem vērā transformāciju,
 * tāpēc, ja animēto bloku pārvieto pilnīgi ārpus ekrāna, tas nekad "neienāk
 * skatā" un animācija nenostrādā (bloks paliek neredzams). Novērojot ārējo
 * ietvaru (kas paliek savā vietā), trigeris strādā vienmēr.
 *
 * Desktopā pamīšus no kreisās/labās; mobilajā tikai fadeUp (nav horizontālas
 * kustības → nav pārplūdes). reduced-motion — statisks.
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
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
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

  const x = env.desktop ? (index % 2 === 0 ? -1 : 1) * (env.w + 100) : 0;
  const y = env.desktop ? 0 : 28;

  const hidden = { opacity: 0, x, y, scale: env.desktop ? 0.94 : 1 };
  const visible = { opacity: 1, x: 0, y: 0, scale: 1 };

  return (
    <div ref={ref} className={className}>
      <motion.div
        suppressHydrationWarning
        initial={hidden}
        animate={inView ? visible : hidden}
        transition={{ duration: 0.9, ease: EASE }}
      >
        {children}
      </motion.div>
    </div>
  );
}
