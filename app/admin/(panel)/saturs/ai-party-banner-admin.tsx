"use client";

import { useState, useTransition } from "react";
import { LangTabs } from "./content-editor";
import {
  saveAiPartyBanner,
  type ML,
  type AiPartyBannerData,
} from "../site-actions";

const LANGS = ["lv", "en", "ru"] as const;
type Lang = (typeof LANGS)[number];

const emptyML: ML = { lv: "", en: "", ru: "" };

export type AiPartyBannerValue = {
  is_active: boolean;
  url: string;
  badge: ML;
  title: ML;
  text: ML;
  cta: ML;
};

// Viena ML lauka rinda (aktīvajā valodā), ar LV placeholder kā fallback norādi.
function Field({
  label,
  value,
  lang,
  onChange,
  textarea = false,
}: {
  label: string;
  value: ML;
  lang: Lang;
  onChange: (ml: ML) => void;
  textarea?: boolean;
}) {
  const set = (s: string) => onChange({ ...value, [lang]: s });
  const common =
    "mt-1 w-full rounded-lg border border-gold/25 bg-bg/60 px-3 py-2 text-sm text-text outline-none focus:border-gold";
  return (
    <label className="block">
      <span className="text-sm font-semibold text-text/90">{label}</span>
      {textarea ? (
        <textarea
          rows={3}
          value={value[lang]}
          onChange={(e) => set(e.target.value)}
          placeholder={lang !== "lv" ? value.lv : ""}
          className={common}
        />
      ) : (
        <input
          value={value[lang]}
          onChange={(e) => set(e.target.value)}
          placeholder={lang !== "lv" ? value.lv : ""}
          className={common}
        />
      )}
    </label>
  );
}

export default function AiPartyBannerAdmin({
  banner,
}: {
  banner: AiPartyBannerValue;
}) {
  const [lang, setLang] = useState<Lang>("lv");
  const [active, setActive] = useState(banner.is_active);
  const [url, setUrl] = useState(banner.url);
  const [badge, setBadge] = useState<ML>(banner.badge ?? emptyML);
  const [title, setTitle] = useState<ML>(banner.title ?? emptyML);
  const [text, setText] = useState<ML>(banner.text ?? emptyML);
  const [cta, setCta] = useState<ML>(banner.cta ?? emptyML);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const touch = () => {
    setSaved(false);
    setError(null);
  };

  const save = () => {
    setError(null);
    start(async () => {
      const payload: AiPartyBannerData = { is_active: active, url, badge, title, text, cta };
      const res = await saveAiPartyBanner(payload);
      if (res?.error) {
        setError(res.error);
        setSaved(false);
      } else {
        setSaved(true);
      }
    });
  };

  const live = url.trim().length > 0;

  return (
    <div className="mt-10 rounded-2xl border border-gold/25 bg-navy/30 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">AI Party banneris</h2>
          <p className="mt-1 text-xs text-text/50">
            Zem kategoriju režģa (sākumlapā un /svinibu-inventars).{" "}
            <span className="font-mono text-text/30">aiparty.banner</span>
          </p>
        </div>
        <LangTabs lang={lang} setLang={setLang} />
      </div>

      {/* Slēdzis + saite (valodneitrāli) */}
      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <button
          type="button"
          onClick={() => {
            setActive((a) => !a);
            touch();
          }}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
            active
              ? "border-gold bg-gold/15 text-gold"
              : "border-text/25 text-text/60 hover:border-text/40"
          }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${active ? "bg-gold" : "bg-text/30"}`}
          />
          {active ? "Redzams lapā" : "Paslēpts"}
        </button>

        <label className="block">
          <span className="text-sm font-semibold text-text/90">
            Saite (URL) — tukšs = poga neaktīva ar “Drīzumā”
          </span>
          <input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              touch();
            }}
            placeholder="https://ai-party.app"
            className="mt-1 w-full rounded-lg border border-gold/25 bg-bg/60 px-3 py-2 text-sm text-text outline-none focus:border-gold"
          />
        </label>
      </div>

      {/* Teksti (aktīvajā valodā) */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Uzlīme (badge)" value={badge} lang={lang} onChange={(v) => { setBadge(v); touch(); }} />
        <Field label="Poga (cta)" value={cta} lang={lang} onChange={(v) => { setCta(v); touch(); }} />
      </div>
      <div className="mt-4">
        <Field label="Virsraksts" value={title} lang={lang} onChange={(v) => { setTitle(v); touch(); }} />
      </div>
      <div className="mt-4">
        <Field label="Teksts" value={text} lang={lang} onChange={(v) => { setText(v); touch(); }} textarea />
      </div>

      {/* Priekšskatījums (aktīvā valoda) */}
      <div className="mt-6">
        <p className="mb-2 text-xs uppercase tracking-wide text-text/40">
          Priekšskatījums ({lang})
        </p>
        {active && (title[lang] || title.lv) ? (
          <div className="relative overflow-hidden rounded-3xl border-2 border-gold/40 bg-gradient-to-br from-[#22374e] via-[#152536] to-[#0f1419] p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                {(badge[lang] || badge.lv) && (
                  <span className="inline-block rounded-full border border-gold/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold">
                    {badge[lang] || badge.lv}
                  </span>
                )}
                <h3 className="mt-3 font-display text-2xl font-bold text-text">
                  {title[lang] || title.lv}
                </h3>
                {(text[lang] || text.lv) && (
                  <p className="mt-2 text-sm leading-relaxed text-text/80">
                    {text[lang] || text.lv}
                  </p>
                )}
              </div>
              <span
                className={`inline-flex shrink-0 items-center rounded-full px-6 py-2.5 text-sm font-semibold ${
                  live
                    ? "bg-gold text-black"
                    : "border-2 border-gold/40 text-gold/70"
                }`}
              >
                {live ? `${cta[lang] || cta.lv || "Uzzināt vairāk"} →` : "Drīzumā"}
              </span>
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-text/20 p-6 text-sm text-text/40">
            {active
              ? "Aizpildi virsrakstu — banneris nerādās bez tā."
              : "Paslēpts — banneris lapā nerādās."}
          </p>
        )}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={save}
          disabled={pending}
          className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black disabled:opacity-60"
        >
          {pending ? "Saglabā…" : "Saglabāt"}
        </button>
        {saved && <span className="text-sm text-gold">Saglabāts ✓</span>}
        {error && <span className="text-sm text-red-400">Kļūda: {error}</span>}
      </div>
    </div>
  );
}
