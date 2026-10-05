"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  applyConsent,
  initConsentDefaults,
  readConsent,
  saveConsent,
} from "@/lib/consent";

// Sīkdatņu paziņojums: kompakta josla ekrāna apakšā (mobilajā ~120 px), lai
// neaizsedz hero CTA. Kamēr redzams, <body data-cookie-open> paslēpj peldošās
// pogas (zvans/čats/uz augšu), lai tās nepārklājas ar joslu.
export default function CookieConsent() {
  const t = useTranslations("cookies");
  const ta = useTranslations("a11y");
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    initConsentDefaults();
    // localStorage atslēga (anabella-cookie-consent) ir kopīga visām valodām -
    // piekrišana /en/ vai /ru/ derīga arī saknē. Nerenderē, kamēr nezinām.
    const existing = readConsent();
    if (existing) applyConsent(existing);
    setVisible(!existing);
    setReady(true);
  }, []);

  useEffect(() => {
    document.body.toggleAttribute("data-cookie-open", ready && visible);
    return () => document.body.removeAttribute("data-cookie-open");
  }, [ready, visible]);

  function commit(a: boolean, m: boolean) {
    const consent = saveConsent(a, m);
    applyConsent(consent);
    setVisible(false);
    setSettingsOpen(false);
  }

  if (!ready || !visible) return null;

  // Abām izvēlēm IDENTISKS vizuālais svars (stils + izmērs) - pieņemšana netiek
  // izcelta (godīga izvēle, bez "dark pattern").
  const btn =
    "inline-flex min-h-11 items-center justify-center rounded-full border-2 border-gold/60 px-3 text-xs font-semibold text-text sm:px-5 sm:text-sm transition-colors duration-(--duration-fast) hover:border-gold hover:bg-gold/10";

  return (
    <section
      aria-label={ta("cookieRegion")}
      className="fixed inset-x-0 bottom-0 z-[75] border-t-2 border-gold/40 bg-navy/95 shadow-depth backdrop-blur sm:inset-x-4 sm:bottom-4 sm:rounded-card sm:border-2"
    >
      {/* Mobilajā ~84 px (1 teksta rinda + pogu rinda), lai neaizsedz hero CTA. */}
      <div className="mx-auto max-w-5xl px-4 py-2 sm:flex sm:items-center sm:gap-6 sm:px-6 sm:py-4">
        <div className="min-w-0 flex-1">
          <h2 className="sr-only sm:not-sr-only sm:font-display sm:text-base sm:font-semibold sm:text-gold">
            {t("title")}
          </h2>
          <p className="text-xs leading-snug text-text/85 sm:mt-1 sm:text-sm">
            <span className="sm:hidden">{t("textShort")}</span>
            <span className="hidden sm:inline">{t("text")}</span>{" "}
            <Link href="/sikdatnu-politika" className="text-gold underline underline-offset-2">
              {t("policy")}
            </Link>
            {" · "}
            <button
              type="button"
              aria-expanded={settingsOpen}
              onClick={() => setSettingsOpen((v) => !v)}
              className="text-gold underline underline-offset-2"
            >
              {t("settings")}
            </button>
          </p>

          {settingsOpen && (
            <div className="mt-3 space-y-1 border-t border-gold/15 pt-2">
              <Toggle checked disabled label={t("necessary")} onChange={() => {}} />
              <Toggle checked={analytics} label={t("analytics")} onChange={setAnalytics} />
              <Toggle checked={marketing} label={t("marketing")} onChange={setMarketing} />
            </div>
          )}
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-0 sm:flex sm:shrink-0">
          <button
            type="button"
            onClick={() => (settingsOpen ? commit(analytics, marketing) : commit(false, false))}
            className={btn}
          >
            {settingsOpen ? t("save") : t("necessaryOnly")}
          </button>
          <button
            type="button"
            onClick={() => commit(true, true)}
            className={btn}
          >
            {t("acceptAll")}
          </button>
        </div>
      </div>
    </section>
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
      className={`flex min-h-11 items-center justify-between gap-4 text-xs sm:text-sm ${
        disabled ? "text-text-muted" : "cursor-pointer text-text/90"
      }`}
    >
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
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
