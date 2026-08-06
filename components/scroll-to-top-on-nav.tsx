"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

// App Router ne vienmēr atiestata ritinājumu paredzami starp lapām.
// Šis pie katras ceļa maiņas pārliecinās, ka lapa atveras no augšas.
export default function ScrollToTopOnNav() {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
