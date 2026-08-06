"use client";

import { useState, useTransition } from "react";
import { upsertFaq, deleteFaq } from "../site-actions";

export type FRow = {
  id: string | null;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
  is_published: boolean;
};

const CATS = [
  { id: "rezervacija", label: "Rezervācija" },
  { id: "piegade", label: "Piegāde" },
  { id: "produkti", label: "Produkti" },
  { id: "maksajumi", label: "Maksājumi" },
];

const field =
  "w-full rounded-lg border border-gold/25 bg-bg/60 px-3 py-2 text-sm text-text outline-none focus:border-gold";

function Card({ row, onDelete }: { row: FRow; onDelete: (id: string) => void }) {
  const [r, setR] = useState(row);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const set = (p: Partial<FRow>) => setR((v) => ({ ...v, ...p }));

  return (
    <div className="space-y-3 rounded-2xl border border-gold/25 bg-navy/30 p-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input placeholder="Jautājums" value={r.question} onChange={(e) => set({ question: e.target.value })} className={field} />
        <select value={r.category} onChange={(e) => set({ category: e.target.value })} className={field}>
          {CATS.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}
        </select>
        <input type="number" title="Secība" value={r.sort_order} onChange={(e) => set({ sort_order: Number(e.target.value) })} className={`${field} w-20`} />
      </div>
      <textarea rows={3} placeholder="Atbilde" value={r.answer} onChange={(e) => set({ answer: e.target.value })} className={field} />
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={r.is_published} onChange={(e) => set({ is_published: e.target.checked })} className="accent-[#D4A960]" /> Publicēts</label>
        <button onClick={() => start(async () => { const res = await upsertFaq(r.id, r); setMsg(res?.error ?? "Saglabāts ✓"); })} disabled={pending} className="ml-auto rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-black">Saglabāt</button>
        {r.id && <button onClick={() => { if (confirm("Dzēst?")) start(() => { deleteFaq(r.id!); onDelete(r.id!); }); }} className="rounded-full border border-red-500/50 px-3 py-1.5 text-xs text-red-300">Dzēst</button>}
        {msg && <span className="text-xs text-gold">{msg}</span>}
      </div>
    </div>
  );
}

export default function FaqAdmin({ rows }: { rows: FRow[] }) {
  const [list, setList] = useState<FRow[]>(rows);
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">BUJ</h1>
        <button onClick={() => setList((l) => [...l, { id: null, category: "rezervacija", question: "", answer: "", sort_order: l.length, is_published: true }])} className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black">+ Jauns</button>
      </div>
      <div className="space-y-4">
        {list.map((row, i) => (<Card key={row.id ?? `new-${i}`} row={row} onDelete={(id) => setList((l) => l.filter((x) => x.id !== id))} />))}
      </div>
    </div>
  );
}
