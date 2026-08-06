"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// Valodu pārslēdzējs — patur to pašu ceļu, maina tikai valodu.
export default function LocaleSwitcher({
  className = "",
}: {
  className?: string;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className={`flex items-center gap-1 text-xs font-semibold ${className}`}>
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          aria-current={l === locale ? "true" : undefined}
          onClick={() => router.replace(pathname, { locale: l })}
          className={`rounded px-1.5 py-0.5 uppercase transition-colors ${
            l === locale
              ? "text-gold"
              : "text-text/50 hover:text-gold"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
