"use client";

import { useState } from "react";

export default function ShareButtons() {
  const [copied, setCopied] = useState(false);
  const open = (u: string) => window.open(u, "_blank", "noopener");
  const cls =
    "rounded-full border border-gold/30 px-4 py-1.5 text-sm text-text/80 transition-colors hover:border-gold hover:text-gold";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-text/60">Dalies:</span>
      <button
        onClick={() =>
          open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}`)
        }
        className={cls}
      >
        Facebook
      </button>
      <button
        onClick={() => open(`https://wa.me/?text=${encodeURIComponent(document.title + " " + location.href)}`)}
        className={cls}
      >
        WhatsApp
      </button>
      <button
        onClick={() => {
          navigator.clipboard?.writeText(location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className={cls}
      >
        {copied ? "Nokopēts ✓" : "Kopēt saiti"}
      </button>
    </div>
  );
}
