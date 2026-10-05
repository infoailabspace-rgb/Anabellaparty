"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { COMPANY } from "@/lib/company";
import { trackPhoneClick } from "@/lib/analytics";

// Lapas slug avotam (GA4). Noņem valodas prefiksu; sakne → "home".
function slugFromPath(p: string | null): string {
  if (!p) return "unknown";
  const stripped = p.replace(/^\/(lv|en|ru)(?=\/|$)/, "").replace(/\/+$/, "");
  return stripped === "" ? "home" : stripped.replace(/^\//, "");
}

// Fiksēta zvanīšanas poga mobilajā - redzama visā lapā (kreisajā apakšā, lai
// nepārklājas ar čata pogu labajā). Desktopā slēpta (tur pietiek ar sekciju pogām).
export default function StickyCall() {
  const pathname = usePathname();
  const t = useTranslations("a11y");
  // Nerādās rezervācijas plūsmā - tur cits fokuss (kā čatam).
  if (pathname?.includes("/rezervet")) return null;

  return (
    <aside aria-label={t("quickContact")}>
      <a
        href={`tel:${COMPANY.contact.phone}`}
        onClick={() => trackPhoneClick(`sticky:${slugFromPath(pathname)}`)}
        aria-label={t("callAria", { phone: COMPANY.contact.phoneDisplay })}
        className="fixed bottom-5 left-5 z-[60] flex min-h-12 items-center gap-2 rounded-full bg-gold px-5 font-semibold text-on-gold shadow-cta-sm transition-transform duration-(--duration-fast) hover:scale-105 md:hidden menu-open:hidden cookie-open:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {t("call")}
      </a>
    </aside>
  );
}
