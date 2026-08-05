"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { fadeUp, slideInLeft, slideInRight } from "@/lib/motion";

/**
 * Produktu bloku ieslīdēšana, katrs atsevišķi skatā.
 * Desktopā — pamīšus no kreisās/labās (zigzags). Mobilajā — tikai fadeUp
 * (nav horizontālas kustības, lai nerodas pārplūde). reduced-motion — statisks.
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
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  const variants = desktop
    ? index % 2 === 0
      ? slideInLeft
      : slideInRight
    : fadeUp;

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}
