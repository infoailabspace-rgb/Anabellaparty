"use client";

import { useEffect, useState } from "react";

// prefers-reduced-motion lasītājs bez framer-motion (matchMedia).
// Sākotnēji false (SSR/pirms hidratācijas) — pilnās animācijas noklusējums;
// pēc hidratācijas atspoguļo lietotāja sistēmas izvēli un seko izmaiņām.
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
