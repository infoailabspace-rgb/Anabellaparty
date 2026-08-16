"use client";

import { useRouter } from "next/navigation";

// Ved uz TIEŠI iepriekšējo lapu (no kuras lietotājs nāca). Ja nav vēstures
// (piem. atvērts tieši ar URL) — fallback uz norādīto lapu.
export default function BackButton({
  label = "Atpakaļ",
  fallback = "/admin",
}: {
  label?: string;
  fallback?: string;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1)
          router.back();
        else router.push(fallback);
      }}
      className="text-sm text-gold hover:underline"
    >
      ← {label}
    </button>
  );
}
