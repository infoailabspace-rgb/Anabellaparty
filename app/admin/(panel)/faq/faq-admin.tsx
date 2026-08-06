"use client";

import { useState, useTransition } from "react";
import { upsertFaq, deleteFaq, type ML } from "../site-actions";
import { LangTabs } from "../saturs/content-editor";

export type FRow = {
  id: string | null;
  category: string;
  question: ML;
  answer: ML;
  sort_order: number;
  is_published: boolean;
};

const CATS = [
  { id: "rezervacija", label: "Rezervācija" },
  { id: "piegade", label: "Piegāde" },
  { id: "produkti", label: "Produkti" },
  { id: "maksajumi", label: "Maksājumi" },
];

const LANGS = ["lv", "en", "ru"] as const;
type Lang = (typeof LANGS)[number];

const field =
  "w-full rounded-lg border border-gold/25 bg-bg/60 px-3 py-2 text-sm text-text outline-none focus:border-gold";

function Card({
  row,
  lang,
  onDelete,
}: {
  row: FRow;
  lang: Lang;
  onDelete: (id: string) => void;
}) {
  const [r, setR] = useState(row);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const setML = (f: "question" | "answer", s: string) =>
    setR((v) => ({ ...v, [f]: { ...v[f], [lang]: s } }));
  const ph = (f: "question" | "answer") => (lang !== "lv" ? r[f].lv : "");

  return (
    <div className="space-y-3 rounded-2xl border border-gold/25 bg-navy/30 p-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input
          placeholder={lang === "lv" ? "Jautājums" : ph("question")}
          value={r.question[lang]}
          onChange={(e) => setML("question", e.target.value)}
          className={field}
        />
        <select
          value={r.category}
          onChange={(e) => setR((v) => ({ ...v, category: e.target.value }))}
          className={field}
        >
          {CATS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          type="number"
          title="Secība"
          value={r.sort_order}
          onChange={(e) =>
            setR((v) => ({ ...v, sort_order: Number(e.target.value) }))
          }
          className={`${field} w-20`}
        />
      </div>
      <textarea
        rows={3}
        placeholder={lang === "lv" ? "Atbilde" : ph("answer")}
        value={r.answer[lang]}
        onChange={(e) => setML("answer", e.target.value)}
        className={field}
      />
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={r.is_published}
            onChange={(e) =>
              setR((v) => ({ ...v, is_published: e.target.checked }))
            }
            className="accent-[#D4A960]"
          />{" "}
          Publicēts
        </label>
        <button
          onClick={() =>
            start(async () => {
              const res = await upsertFaq(r.id, r);
              setMsg(res?.error ?? "Saglabāts ✓");
            })
          }
          disabled={pending}
          className="ml-auto rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-black"
        >
          Saglabāt
        </button>
        {r.id && (
          <button
            onClick={() => {
              if (confirm("Dzēst?"))
                start(() => {
                  deleteFaq(r.id!);
                  onDelete(r.id!);
                });
            }}
            className="rounded-full border border-red-500/50 px-3 py-1.5 text-xs text-red-300"
          >
            Dzēst
          </button>
        )}
        {msg && <span className="text-xs text-gold">{msg}</span>}
      </div>
    </div>
  );
}

const emptyML: ML = { lv: "", en: "", ru: "" };

export default function FaqAdmin({ rows }: { rows: FRow[] }) {
  const [list, setList] = useState<FRow[]>(rows);
  const [lang, setLang] = useState<Lang>("lv");
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">BUJ</h1>
        <div className="flex items-center gap-3">
          <LangTabs lang={lang} setLang={setLang} />
          <button
            onClick={() =>
              setList((l) => [
                ...l,
                {
                  id: null,
                  category: "rezervacija",
                  question: { ...emptyML },
                  answer: { ...emptyML },
                  sort_order: l.length,
                  is_published: true,
                },
              ])
            }
            className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black"
          >
            + Jauns
          </button>
        </div>
      </div>
      <p className="mb-4 text-xs text-text/50">
        Tukšs EN/RU lauks → publiskajā lapā rāda latviešu versiju.
      </p>
      <div className="space-y-4">
        {list.map((row, i) => (
          <Card
            key={row.id ?? `new-${i}`}
            row={row}
            lang={lang}
            onDelete={(id) => setList((l) => l.filter((x) => x.id !== id))}
          />
        ))}
      </div>
    </div>
  );
}
