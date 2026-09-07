"use client";

import { type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useInView } from "@/lib/use-in-view";

/**
 * Produktu bloku ieslīdēšana — izteikta: bloks iznirst no ārpus ekrāna
 * (pilns platums) un nostājas vietā.
 *
 * SVARĪGI: novērojam nekustīgu ārējo ietvaru ar IntersectionObserver, nevis pašu
 * animēto elementu. Ja novērotu animēto bloku, kas pārvietots pilnīgi ārpus
 * ekrāna, tas nekad "neienāktu skatā" un animācija nenostrādātu. Novērojot ārējo
 * ietvaru (kas paliek savā vietā), trigeris strādā vienmēr.
 *
 * Desktopā pamīšus no kreisās/labās (--slide-x), mobilajā tikai fadeUp (nav
 * horizontālas kustības → nav pārplūdes). reduced-motion — statisks.
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
  const { ref, inView } = useInView<HTMLDivElement>({
    once: true,
    rootMargin: "-120px",
  });

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  // Desktopā slīde no kreisās (pāra) vai labās (nepāra) malas ārpus ekrāna.
  // Mobilajā --slide-x netiek lietots (CSS media query < 768px izmanto translateY).
  const style: CSSProperties = {
    "--slide-x": index % 2 === 0 ? "-100vw" : "100vw",
  } as CSSProperties;

  return (
    <div ref={ref} className={className}>
      <div className={`slide-reveal${inView ? " is-visible" : ""}`} style={style}>
        {children}
      </div>
    </div>
  );
}
