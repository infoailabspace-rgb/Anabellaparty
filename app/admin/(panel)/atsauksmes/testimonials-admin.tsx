"use client";

import { useState, useTransition } from "react";
import { upsertTestimonial, deleteTestimonial } from "../site-actions";

export type TRow = {
  id: string | null;
  author: string;
  event_type: string;
  rating: number;
  text: string;
  is_published: boolean;
  sort_order: number;
};

const field =
  "w-full rounded-lg border border-gold/25 bg-bg/60 px-3 py-2 text-sm text-text outline-none focus:border-gold";

function Card({ row, onDelete }: { row: TRow; onDelete: (id: string) => void }) {
  const [r, setR] = useState(row);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const set = (p: Partial<TRow>) => setR((v) => ({ ...v, ...p }));

  return (
    <div className="space-y-3 rounded-2xl border border-gold/25 bg-navy/30 p-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <input placeholder="Autors" value={r.author} onChange={(e) => set({ author: e.target.value })} className={field} />
        <input placeholder="Pasākuma tips" value={r.event_type} onChange={(e) => set({ event_type: e.target.value })} className={field} />
        <select value={r.rating} onChange={(e) => set({ rating: Number(e.target.value) })} className={field}>
          {[5, 4, 3, 2, 1].map((n) => (<option key={n} value={n}>{n} ★</option>))}
        </select>
      </div>
      <textarea rows={3} placeholder="Atsauksmes teksts" value={r.text} onChange={(e) => set({ text: e.target.value })} className={field} />
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={r.is_published} onChange={(e) => set({ is_published: e.target.checked })} className="accent-[#D4A960]" />
          Publicēts
        </label>
        <label className="flex items-center gap-2 text-sm">
          Secība
          <input type="number" value={r.sort_order} onChange={(e) => set({ sort_order: Number(e.target.value) })} className={`${field} w-20`} />
        </label>
        <button
          onClick={() => start(async () => { const res = await upsertTestimonial(r.id, r); setMsg(res?.error ?? "Saglabāts ✓"); })}
          disabled={pending}
          className="ml-auto rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-60"
        >
          Saglabāt
        </button>
        {r.id && (
          <button
            onClick={() => { if (confirm("Dzēst atsauksmi?")) start(() => { deleteTestimonial(r.id!); onDelete(r.id!); }); }}
            className="rounded-full border border-red-500/50 px-4 py-1.5 text-xs text-red-300"
          >
            Dzēst
          </button>
        )}
        {msg && <span className="text-xs text-gold">{msg}</span>}
      </div>
    </div>
  );
}

export default function TestimonialsAdmin({ rows }: { rows: TRow[] }) {
  const [list, setList] = useState<TRow[]>(rows);
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Atsauksmes</h1>
        <button
          onClick={() => setList((l) => [...l, { id: null, author: "", event_type: "", rating: 5, text: "", is_published: false, sort_order: l.length }])}
          className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black"
        >
          + Jauna
        </button>
      </div>
      <div className="space-y-4">
        {list.map((row, i) => (
          <Card key={row.id ?? `new-${i}`} row={row} onDelete={(id) => setList((l) => l.filter((x) => x.id !== id))} />
        ))}
      </div>
    </div>
  );
}
