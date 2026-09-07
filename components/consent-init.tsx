"use client";

import { useEffect } from "react";
import { initConsentMode } from "@/lib/consent";

// Consent Mode v2 "advanced": iestata noklusējumus (visu denied + wait_for_update
// + url_passthrough) un VIENMĒR ielādē gtag.js (GA4 G-717L3W9PNX) jau pirms
// piekrišanas bannera. GTM, Clarity un FB Pixel paliek aiz piekrišanas
// (skat. applyConsent lib/consent.ts). Renderēts publiskajā layout'ā pirms
// <CookieConsent /> — tāpēc noklusējumi ir iestatīti, pirms banneris kaut ko dara.
export default function ConsentInit() {
  useEffect(() => {
    initConsentMode();
  }, []);
  return null;
}
