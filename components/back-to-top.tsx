"use client";

import dynamic from "next/dynamic";

// Tikai klientā (ssr:false) — poga ir atkarīga no scroll pozīcijas un nav
// vajadzīga sākotnējā servera HTML.
const BackToTopImpl = dynamic(() => import("@/components/back-to-top-impl"), {
  ssr: false,
});

export default function BackToTop() {
  return <BackToTopImpl />;
}
