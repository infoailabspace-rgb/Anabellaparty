"use client";

import { useState, useTransition } from "react";
import { saveContent, type ML } from "../site-actions";

const LABELS: Record<string, string> = {
  "home.hero.title": "Sākumlapa — hero virsraksts",
  "home.hero.accent": "Sākumlapa — hero zelta vārds (akcents)",
  "home.hero.subtitle": "Sākumlapa — hero apakšvirsraksts",
  "about.body": "Par mums — teksts",
  "about.stats.events": "Par mums — pasākumu skaits",
  "about.stats.units": "Par mums — inventāra vienību skaits",
  "about.stats.since": "Par mums — dibināšanas gads",
  "delivery.note": "Piegādes piezīme",
  "contact.hours": "Kontakti — darba laiks",
};

const LANGS = ["lv", "en", "ru"] as const;
type Lang = (typeof LANGS)[number];

type Item = { key: string; value: ML; content_type: string };

function Row({ item, lang }: { item: Item; lang: Lang }) {
  const [val, setVal] = useState<ML>(item.value);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const v = val[lang];
  const long =
    item.content_type === "richtext" || item.value.lv.length > 60;
  const update = (s: string) => {
    setVal((prev) => ({ ...prev, [lang]: s }));
    setSaved(false);
  };

  return (
    <div className="rounded-2xl border border-gold/25 bg-navy/30 p-5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-text/90">
          {LABELS[item.key] ?? item.key}
        </label>
        <span className="font-mono text-xs text-text/30">{item.key}</span>
      </div>
      {long ? (
        <textarea
          rows={item.key === "about.body" ? 6 : 3}
          value={v}
          onChange={(e) => update(e.target.value)}
          placeholder={lang !== "lv" ? item.value.lv : ""}
          className="mt-2 w-full rounded-lg border border-gold/25 bg-bg/60 px-3 py-2 text-sm text-text outline-none focus:border-gold"
        />
      ) : (
        <input
          value={v}
          onChange={(e) => update(e.target.value)}
          placeholder={lang !== "lv" ? item.value.lv : ""}
          className="mt-2 w-full rounded-lg border border-gold/25 bg-bg/60 px-3 py-2 text-sm text-text outline-none focus:border-gold"
        />
      )}
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={() =>
            start(async () => {
              await saveContent(item.key, val);
              setSaved(true);
            })
          }
          disabled={pending}
          className="rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-60"
        >
          {pending ? "Saglabā…" : "Saglabāt"}
        </button>
        {saved && <span className="text-xs text-gold">✓ Saglabāts (visas valodas)</span>}
      </div>
    </div>
  );
}

export default function ContentEditor({ items }: { items: Item[] }) {
  const [lang, setLang] = useState<Lang>("lv");
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Lapas teksti</h1>
        <LangTabs lang={lang} setLang={setLang} />
      </div>
      <p className="mb-4 text-xs text-text/50">
        Tukšs EN/RU lauks → publiskajā lapā rāda latviešu versiju.
      </p>
      <div className="space-y-4">
        {items.map((it) => (
          <Row key={it.key} item={it} lang={lang} />
        ))}
      </div>
    </div>
  );
}

export function LangTabs({
  lang,
  setLang,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  return (
    <div className="flex gap-1 rounded-full border border-gold/30 p-1">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase transition-colors ${
            l === lang ? "bg-gold text-black" : "text-text/60 hover:text-gold"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
