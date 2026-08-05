import type { Variants } from "framer-motion";

// Vienota easing visā lapā — nekādu linear, nekādu lecošu atsperu.
export const EASE = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

export const stagger: Variants = {
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASE },
  },
};

// Vārdu (word-by-word) stagger hero virsrakstam.
export const wordStagger: Variants = {
  show: { transition: { staggerChildren: 0.06 } },
};

export const word: Variants = {
  hidden: { opacity: 0, y: "0.4em" },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

// Kopīgs viewport iestatījums — animē vienreiz, nedaudz pirms sekcija pilnībā redzama.
export const viewportOnce = { once: true, margin: "-100px" } as const;
