"use client";

import { useState } from "react";
import { LangTabs } from "./content-editor";
import { uploadImageSized } from "@/components/admin/image-uploader";
import {
  saveAiPartyBanner,
  type ML,
  type AiPartyBannerData,
} from "../site-actions";

const LANGS = ["lv", "en", "ru"] as const;
type Lang = (typeof LANGS)[number];
const emptyML: ML = { lv: "", en: "", ru: "" };

const WARN = 500 * 1024;
const fmt = (b: number) =>
  b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;

// Norāde, kad attēla nav — TIKAI adminā (publiski banneris nerādās vispār).
const NO_IMAGE_NOTE = "Fona attēls nav pievienots · Ieteicams 1600×600 px, tumšs";

export type AiPartyBannerValue = {
  is_active: boolean;
  url: string;
  image: string;
  badge: ML;
  title: ML;
  text: ML;
  cta: ML;
};

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

// Tukšā/attēla priekšskatījuma kaste ar TIEM PAŠIEM pārklājumiem kā publiski.
function Overlays() {
  return (
    <>
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
    </>
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
  const [image, setImage] = useState(banner.image);
  const [badge, setBadge] = useState<ML>(banner.badge ?? emptyML);
  const [title, setTitle] = useState<ML>(banner.title ?? emptyML);
  const [text, setText] = useState<ML>(banner.text ?? emptyML);
  const [cta, setCta] = useState<ML>(banner.cta ?? emptyML);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);
  const [imgSize, setImgSize] = useState<number | null>(null);

  const touch = () => {
    setSaved(false);
    setError(null);
  };

  // Saglabā VISU banneri (ar overrides — piem. jaunu attēlu no augšupielādes).
  // await + error-check + "Saglabāts ✓" (ne fire-and-forget).
  async function saveAll(overrides: Partial<AiPartyBannerData> = {}) {
    const payload: AiPartyBannerData = {
      is_active: active,
      url,
      image,
      badge,
      title,
      text,
      cta,
      ...overrides,
    };
    setPending(true);
    setError(null);
    const res = await saveAiPartyBanner(payload);
    setPending(false);
    if (res?.error) {
      setError(res.error);
      setSaved(false);
      return false;
    }
    setSaved(true);
    return true;
  }

  async function pickImage(file: File | undefined) {
    if (!file) return;
    setImgBusy(true);
    setError(null);
    try {
      const { url: u, size } = await uploadImageSized(
        file,
        "site-images",
        "aiparty-banner",
        1600,
      );
      setImage(u);
      setImgSize(size);
      await saveAll({ image: u }); // auto-saglabā (tāpat kā citiem attēliem)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Augšupielādes kļūda.");
    }
    setImgBusy(false);
  }

  async function removeImage() {
    setImgBusy(true);
    setError(null);
    setImage("");
    setImgSize(null);
    await saveAll({ image: "" });
    setImgBusy(false);
  }

  const live = url.trim().length > 0;
  const over = imgSize != null && imgSize > WARN;
  const previewTitle = title[lang] || title.lv;

  return (
    <div className="mt-10 rounded-2xl border border-gold/25 bg-navy/30 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">AI Party banneris</h2>
          <p className="mt-1 text-xs text-text/50">
            Zem kategoriju režģa (sākumlapā un /svinibu-inventars). Bez fona attēla
            banneris publiski nerādās.{" "}
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
          <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-gold" : "bg-text/30"}`} />
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

      {/* Fona attēls */}
      <div className="mt-5">
        <span className="text-sm font-semibold text-text/90">Fona attēls</span>
        <p className="mt-1 text-xs text-text/50">
          Ieteicams 1600×600 px, tumšs vai ar tumšu pārklājumu. Saspiež līdz 1600px.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <label className="cursor-pointer rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-black">
            {imgBusy ? "Augšupielādē…" : image ? "Nomainīt" : "Augšupielādēt"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              disabled={imgBusy}
              onChange={(e) => pickImage(e.target.files?.[0])}
            />
          </label>
          {image && (
            <button
              onClick={removeImage}
              disabled={imgBusy}
              className="rounded-full border border-red-500/50 px-4 py-1.5 text-xs text-red-300 disabled:opacity-60"
            >
              Noņemt
            </button>
          )}
          {imgSize != null && (
            <span className={`text-xs ${over ? "text-amber-300" : "text-text/40"}`}>
              {fmt(imgSize)}
              {over ? " ⚠ virs 500 KB" : ""}
            </span>
          )}
        </div>
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

      {/* Priekšskatījums (aktīvā valoda) — tāds pats stils kā publiski */}
      <div className="mt-6">
        <p className="mb-2 text-xs uppercase tracking-wide text-text/40">
          Priekšskatījums ({lang})
          {!active && <span className="ml-2 text-text/30">· paslēpts, publiski nerādās</span>}
        </p>
        {image ? (
          <div className="relative h-[220px] w-full overflow-hidden rounded-2xl border border-gold/25">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <Overlays />
            <div className="relative flex h-full flex-col justify-end p-6">
              {(badge[lang] || badge.lv) && (
                <span className="inline-block w-fit rounded-full border border-gold/50 bg-black/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold">
                  {badge[lang] || badge.lv}
                </span>
              )}
              <h3 className="mt-2 font-display text-2xl font-bold text-text">
                {previewTitle || "AI Party"}
              </h3>
              {(text[lang] || text.lv) && (
                <p className="mt-1 max-w-2xl text-sm text-text/85">{text[lang] || text.lv}</p>
              )}
              <span
                className={`mt-3 inline-flex w-fit items-center rounded-full px-5 py-2 text-sm font-semibold ${
                  live ? "bg-gold text-black" : "border border-gold bg-gold/20 text-gold"
                }`}
              >
                {live ? `${cta[lang] || cta.lv || "Uzzināt vairāk"} →` : "Drīzumā"}
              </span>
            </div>
          </div>
        ) : (
          // Tukša kaste ar tiem pašiem pārklājumiem + apmali + pelēku norādi.
          <div className="relative flex h-[220px] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gold/30 bg-navy">
            <Overlays />
            <p className="relative whitespace-pre-line text-center text-sm text-text/50">
              {NO_IMAGE_NOTE}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={() => saveAll()}
          disabled={pending || imgBusy}
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
