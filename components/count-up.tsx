"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const easeFn = (t: number) => {
  // Mīksts iznāciens (cubic ease-out), saskan ar lapas easing sajūtu.
  return 1 - Math.pow(1 - t, 3);
};

export default function CountUp({
  to,
  duration = 1600,
  prefix = "",
  suffix = "",
  className = "",
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  // AEO KRITISKI: sākuma vērtība = GALA skaitlis, lai serverī renderētajā HTML
  // (crawler, no-JS, prefers-reduced-motion) ir reālais skaitlis, ne 0.
  // Animācija ir tikai progresīvs uzlabojums — nomet uz 0 un saskaita atpakaļ
  // TIKAI tad, kad JS reāli izpildās klienta pusē un elements nonāk skatā.
  const [value, setValue] = useState(to);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (animated || !inView) return;
    if (reduce) {
      setValue(to);
      setAnimated(true);
      return;
    }
    setAnimated(true);
    setValue(0);
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setValue(Math.round(easeFn(t) * to));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, to, duration, animated]);

  return (
    <span ref={ref} className={className} aria-label={`${prefix}${to}${suffix}`}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}
