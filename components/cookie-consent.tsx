"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  applyConsent,
  initConsentDefaults,
  readConsent,
  saveConsent,
} from "@/lib/consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    initConsentDefaults();
    const existing = readConsent();
    if (existing) {
      applyConsent(existing);
    } else {
      setVisible(true);
    }
  }, []);

  function commit(a: boolean, m: boolean) {
    const consent = saveConsent(a, m);
    applyConsent(consent);
    setVisible(false);
    setSettingsOpen(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-4">
      <div className="mx-auto max-w-3xl rounded-2xl border-2 border-gold/40 bg-navy/95 p-6 shadow-2xl backdrop-blur">
        <h2 className="font-display text-lg font-semibold text-gold">
          Mēs izmantojam sīkdatnes
        </h2>
        <p className="mt-2 text-sm text-text/80">
          Nepieciešamās sīkdatnes nodrošina lapas darbību. Ar Tavu piekrišanu
          izmantojam arī analītiskās un mārketinga sīkdatnes. Vairāk —{" "}
          <Link href="/sikdatnu-politika" className="text-gold underline">
            sīkdatņu politikā
          </Link>
          .
        </p>

        {settingsOpen && (
          <div className="mt-4 space-y-3 border-t border-gold/15 pt-4">
            <Toggle checked disabled label="Nepieciešamās (vienmēr aktīvas)" onChange={() => {}} />
            <Toggle
              checked={analytics}
              label="Analītiskās (Google Tag Manager, GA4)"
              onChange={setAnalytics}
            />
            <Toggle
              checked={marketing}
              label="Mārketinga (Facebook Pixel)"
              onChange={setMarketing}
            />
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => commit(true, true)}
            className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-black transition-shadow hover:shadow-[0_0_20px_rgba(212,169,96,0.5)]"
          >
            Pieņemt visas
          </button>
          <button
            type="button"
            onClick={() => commit(false, false)}
            className="rounded-full border-2 border-gold/50 px-6 py-2.5 text-sm font-semibold text-text transition-colors hover:border-gold"
          >
            Tikai nepieciešamās
          </button>
          {settingsOpen ? (
            <button
              type="button"
              onClick={() => commit(analytics, marketing)}
              className="rounded-full border-2 border-gold px-6 py-2.5 text-sm font-semibold text-gold transition-colors hover:bg-gold/10"
            >
              Saglabāt izvēli
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="rounded-full border-2 border-gold/30 px-6 py-2.5 text-sm font-semibold text-text/80 transition-colors hover:border-gold/60"
            >
              Iestatījumi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex items-center justify-between gap-4 text-sm ${
        disabled ? "text-text/50" : "text-text/90 cursor-pointer"
      }`}
    >
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-gold" : "bg-text/20"
        } ${disabled ? "opacity-60" : ""}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-black transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
