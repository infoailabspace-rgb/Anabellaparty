"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

// "Uz augšu" poga - parādās pēc 600px, virs čata widgeta. Vienmēr uzmontēta
// (šī komponente ielādējas tikai klientā caur next/dynamic ssr:false); redzamību
// kontrolē CSS pāreja (opacity + translate), lai būtu ienākšanas UN iziešanas
// animācija bez framer AnimatePresence.
export default function BackToTop() {
  const t = useTranslations("a11y");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label={t("backToTop")}
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-24 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-gold bg-navy text-gold shadow-lg transition-all duration-(--duration-base) hover:bg-gold hover:text-on-gold md:h-12 md:w-12 cookie-open:hidden ${
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-5 opacity-0"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="h-5 w-5"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}
