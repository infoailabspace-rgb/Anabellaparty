"use client";

import { useState, useTransition } from "react";
import { saveOverride, deleteOverride } from "../site-actions";
import { LangTabs } from "../saturs/content-editor";

type ML = { lv: string; en: string; ru: string };
type Lang = keyof ML;

export type EField = {
  key: string;
  label: string;
  multiline: boolean;
  hasOverride: boolean;
  def: ML;
  value: ML;
};
export type EGroup = { id: string; title: string; fields: EField[] };

const field =
  "w-full rounded-lg border border-gold/25 bg-bg/60 px-3 py-2 text-sm text-text outline-none focus:border-gold";

function Row({ f, lang }: { f: EField; lang: Lang }) {
  const [val, setVal] = useState<ML>(f.value);
  const [over, setOver] = useState(f.hasOverride);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const set = (s: string) => {
    setVal((v) => ({ ...v, [lang]: s }));
    setMsg("");
  };

  return (
    <div className="rounded-xl border border-gold/15 bg-navy/20 p-3">
      <div className="flex items-center justify-between">
        <label className="text-sm text-text/85">{f.label}</label>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] ${
            over
              ? "bg-gold/20 text-gold"
              : "border border-text/15 text-text/40"
          }`}
        >
          {over ? "pārrakstīts" : "noklusējums"}
        </span>
      </div>
      {f.multiline ? (
        <textarea
          rows={2}
          value={val[lang]}
          onChange={(e) => set(e.target.value)}
          placeholder={lang !== "lv" ? val.lv : ""}
          className={`${field} mt-2`}
        />
      ) : (
        <input
          value={val[lang]}
          onChange={(e) => set(e.target.value)}
          placeholder={lang !== "lv" ? val.lv : ""}
          className={`${field} mt-2`}
        />
      )}
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={() =>
            start(async () => {
              const r = await saveOverride(f.key, val);
              if (r?.error) setMsg(r.error);
              else {
                setOver(true);
                setMsg("Saglabāts ✓");
              }
            })
          }
          disabled={pending}
          className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-black disabled:opacity-60"
        >
          Saglabāt
        </button>
        {over && (
          <button
            onClick={() =>
              start(async () => {
                const r = await deleteOverride(f.key);
                if (r?.error) setMsg(r.error);
                else {
                  setVal({ ...f.def });
                  setOver(false);
                  setMsg("Atiestatīts uz noklusējumu");
                }
              })
            }
            disabled={pending}
            className="rounded-full border border-gold/30 px-3 py-1 text-xs text-text/70 hover:text-gold disabled:opacity-60"
          >
            Atiestatīt
          </button>
        )}
        {msg && <span className="text-xs text-gold">{msg}</span>}
      </div>
    </div>
  );
}

export default function LapasAdmin({ groups }: { groups: EGroup[] }) {
  const [lang, setLang] = useState<Lang>("lv");
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Lapu teksti</h1>
        <LangTabs lang={lang} setLang={(l) => setLang(l as Lang)} />
      </div>
      <p className="mb-6 text-xs text-text/50">
        Publisko lapu virsraksti, tagline un satura bloki. Tukšs EN/RU → rāda LV.
        “Atiestatīt” atgriež oriģinālo (messages) tekstu. AI-foto saturs — sadaļā “AI foto”.
      </p>
      <div className="space-y-3">
        {groups.map((g) => (
          <details
            key={g.id}
            className="rounded-2xl border border-gold/25 bg-navy/30 p-4"
          >
            <summary className="cursor-pointer select-none font-display text-sm font-semibold text-gold">
              {g.title}{" "}
              <span className="text-text/40">({g.fields.length})</span>
            </summary>
            <div className="mt-3 space-y-2">
              {g.fields.map((f) => (
                <Row key={f.key} f={f} lang={lang} />
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
