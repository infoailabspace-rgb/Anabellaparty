"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  once?: boolean; // pēc pirmās ienākšanas skatā atslēdz novērošanu (noklusējums)
  rootMargin?: string; // IntersectionObserver rootMargin (piem., "-100px")
  amount?: number; // threshold 0..1
};

// IntersectionObserver-balstīts "vai elements ir skatā" hook (aizstāj framer useInView).
// Atgriež `ref`, ko piestiprina novērojamajam elementam, un `inView` karodziņu.
// Ja IntersectionObserver nav pieejams (vecs pārlūks / SSR-nenostrāde) → uzreiz true,
// lai saturs nekad nepaliek slēpts.
export function useInView<T extends Element = HTMLDivElement>(
  options?: Options,
): { ref: React.RefObject<T | null>; inView: boolean } {
  const { once = true, rootMargin = "0px", amount = 0 } = options ?? {};
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold: amount },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once, rootMargin, amount]);

  return { ref, inView };
}
