"use client";

import { COMPANY } from "@/lib/company";
import { trackPhoneClick } from "@/lib/analytics";

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const VARIANTS: Record<string, string> = {
  primary: "bg-gold text-black hover:scale-[1.03]",
  outline: "border border-gold text-gold hover:bg-gold/10",
  ghost: "border border-gold/40 text-text/80 hover:border-gold hover:text-gold",
  // Uz gaišā (zelta) fona, piem. noslēdzošais CTA.
  dark: "border-2 border-[#0F1419]/70 text-[#0F1419] hover:border-[#0F1419]",
};

const SIZES: Record<string, string> = {
  md: "px-8 py-3",
  lg: "px-10 py-4 text-lg",
};

// Zvanīšanas poga — tel: saite + GA4 phone_click(lead_source=source). Numurs no
// COMPANY (viens patiesības avots). Noklusējuma teksts responsīvs: mobilajā
// "Zvanīt", desktopā ar numuru. Vizuāli sekundāra (outline), lai nekonkurē ar
// galveno "Rezervēt" pogu.
export default function CallButton({
  source,
  variant = "outline",
  size = "md",
  label,
  className = "",
}: {
  source: string;
  variant?: "primary" | "outline" | "ghost" | "dark";
  size?: "md" | "lg";
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={`tel:${COMPANY.contact.phone}`}
      onClick={() => trackPhoneClick(source)}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all ${
        SIZES[size] ?? SIZES.md
      } ${VARIANTS[variant] ?? VARIANTS.outline} ${className}`}
    >
      <PhoneIcon />
      {label ? (
        label
      ) : (
        <span>
          Zvanīt
          <span className="hidden sm:inline">
            &nbsp;{COMPANY.contact.phoneDisplay}
          </span>
        </span>
      )}
    </a>
  );
}
