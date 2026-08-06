"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

// Globāli izseko kontaktu klikšķus (tel:, mailto:, wa.me) visā lapā.
export default function AnalyticsListener() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      let method = "";
      if (href.startsWith("tel:")) method = "phone";
      else if (href.startsWith("mailto:")) method = "email";
      else if (href.includes("wa.me")) method = "whatsapp";
      if (method) track("contact_click", { method });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
