"use client";

import { useState, useTransition } from "react";
import { saveContent } from "../site-actions";

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

type Item = { key: string; value: string; content_type: string };

function Row({ item }: { item: Item }) {
  const [v, setV] = useState(item.value);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const long = item.content_type === "richtext" || v.length > 60;

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
          onChange={(e) => { setV(e.target.value); setSaved(false); }}
          className="mt-2 w-full rounded-lg border border-gold/25 bg-bg/60 px-3 py-2 text-sm text-text outline-none focus:border-gold"
        />
      ) : (
        <input
          value={v}
          onChange={(e) => { setV(e.target.value); setSaved(false); }}
          className="mt-2 w-full rounded-lg border border-gold/25 bg-bg/60 px-3 py-2 text-sm text-text outline-none focus:border-gold"
        />
      )}
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={() => start(async () => { await saveContent(item.key, v); setSaved(true); })}
          disabled={pending}
          className="rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-60"
        >
          {pending ? "Saglabā…" : "Saglabāt"}
        </button>
        {saved && <span className="text-xs text-gold">✓ Saglabāts</span>}
      </div>
    </div>
  );
}

export default function ContentEditor({ items }: { items: Item[] }) {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold">Lapas teksti</h1>
      <div className="space-y-4">
        {items.map((it) => (<Row key={it.key} item={it} />))}
      </div>
    </div>
  );
}
