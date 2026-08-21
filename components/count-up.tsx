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
  // DROŠĪBA (publiskā lapa NEDRĪKST rādīt 0): sākotnējā vērtība = GALA skaitlis.
  // SSR, no-JS, crawler, prefers-reduced-motion, useInView-nenostrāde, rAF-trūkums
  // vai jebkura animācijas neizdošanās → rāda REĀLO skaitli, nekad 0.
  const [value, setValue] = useState(to);
  // Vienreizes karodziņš kā ref (NE state) — mainot to, efekts NEPĀRSTARTĒJAS,
  // tāpēc cleanup neatceļ tikko ieplānoto rAF. (Agrāk `animated` bija state UN
  // efekta atkarībās → efekts restartējās, cleanup atcēla animāciju uzreiz pēc
  // setValue(0), un skaitītājs iesala uz 0. Regresija no 7e9be0f.)
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current || !inView) return;
    startedRef.current = true;

    // Reduced motion — animācija nav vēlama; vērtība jau ir `to`.
    if (reduce) {
      setValue(to);
      return;
    }

    // Animē no 0 uz `to`. Skaitli iestata TIKAI animācijas kadri; nav atsevišķa
    // setValue(0), ko varētu atstāt iesaldētu. rAF ķēde iet līdz galam, jo
    // efekts vairs nepārstartējas (karodziņš ir ref).
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setValue(Math.round(easeFn(t) * to));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, to, duration]);

  return (
    <span ref={ref} className={className} aria-label={`${prefix}${to}${suffix}`}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}
