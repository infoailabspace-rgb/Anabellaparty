"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// Valodu pārslēdzējs. Divi režīmi:
//  - "dropdown" (noklusējums) — kompakta poga + izvēlne, desktop navbar.
//  - "inline" — visas valodas kā segmentētas pogas, skaidri redzamas telefonā.
// Patur to pašu ceļu, maina tikai valodu.
export default function LocaleSwitcher({
  className = "",
  variant = "dropdown",
}: {
  className?: string;
  variant?: "dropdown" | "inline";
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const switchTo = (l: string) => {
    setOpen(false);
    router.replace(pathname, { locale: l });
  };

  // Telefonam: visas trīs valodas redzamas uzreiz, bez ligzdotas izvēlnes.
  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {routing.locales.map((l) => {
          const active = l === locale;
          return (
            <button
              key={l}
              type="button"
              aria-current={active ? "true" : undefined}
              onClick={() => switchTo(l)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase transition-colors ${
                active
                  ? "border-gold bg-gold text-black"
                  : "border-gold/30 text-text/70 hover:border-gold hover:text-gold"
              }`}
            >
              {l}
            </button>
          );
        })}
      </div>
    );
  }

  const others = routing.locales.filter((l) => l !== locale);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Valoda"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-semibold uppercase text-gold transition-colors hover:text-gold"
      >
        {locale}
        <span aria-hidden className="text-[10px]">
          ▾
        </span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[3rem] rounded-lg border border-gold/25 bg-navy p-1 shadow-2xl shadow-black/50">
          {others.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => switchTo(l)}
              className="block w-full rounded px-3 py-1.5 text-center text-xs font-semibold uppercase text-text/70 transition-colors hover:bg-gold hover:text-black"
            >
              {l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
