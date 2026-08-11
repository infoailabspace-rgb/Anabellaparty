import type { ProductCategory } from "@/lib/products";
import type { SVGProps, ReactNode } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/* ── Soļu ikonas ── */
export function IconBrowse(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}
export function IconCalendarCheck(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16M9.5 15l1.8 1.8L15 13" />
    </svg>
  );
}
export function IconTruck(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z" />
      <circle cx="7.5" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}

/* ── Kategoriju ikonas ── */
export function IconCamera(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  );
}
export function IconBalloons(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="9" cy="8" r="4.2" />
      <circle cx="15.5" cy="9.5" r="3.2" />
      <path d="M9 12.2v3M15.5 12.7v2.6M9 18.2c0-1 1.5-1 1.5-2" />
    </svg>
  );
}
export function IconMic(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="9" y="3" width="6" height="10" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" />
    </svg>
  );
}
export function IconSparkles(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" />
      <path d="M18 14.5l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6.6-1.7Z" />
    </svg>
  );
}
export function IconGlass(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M7 4h10l-1 5a4 4 0 0 1-8 0L7 4Z" />
      <path d="M12 13v5M9 21h6" />
    </svg>
  );
}
export function IconDroplet(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3s5 5.5 5 9a5 5 0 0 1-10 0c0-3.5 5-9 5-9Z" />
      <path d="M9.5 13a2.5 2.5 0 0 0 2.5 2.5" />
    </svg>
  );
}

// Izklaides punkts (AI foto + spēles) — spēļu kontroliera ikona.
export function IconGamepad(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M6 8h12a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4h-1l-2-2H9l-2 2H6a4 4 0 0 1-4-4v0a4 4 0 0 1 4-4Z" />
      <path d="M7 11v3M5.5 12.5h3M15.5 12h.01M18 13.5h.01" />
    </svg>
  );
}

export const categoryIcons: Record<
  ProductCategory | "izklaides-punkts",
  (p: IconProps) => ReactNode
> = {
  "foto-kaste": IconCamera,
  atrakcijas: IconBalloons,
  "audio-video": IconMic,
  specefekti: IconSparkles,
  deco: IconGlass,
  kubli: IconDroplet,
  "izklaides-punkts": IconGamepad,
};

/* ── Animēts badge ── */
export function IconBadge({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold transition-all duration-300 group-hover:scale-110 group-hover:border-gold/70 group-hover:bg-gold/20 ${className}`}
    >
      <span
        className="anabella-float inline-flex"
        style={{ animationDelay: `${delay}s` }}
      >
        {children}
      </span>
    </span>
  );
}
