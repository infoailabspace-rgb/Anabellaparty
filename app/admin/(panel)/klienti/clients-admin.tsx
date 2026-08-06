"use client";

import { useRef, useState, useTransition } from "react";
import { upsertClient, deleteClient } from "../site-actions";
import { uploadImage } from "@/components/admin/image-uploader";

export type CRow = {
  id: string | null;
  name: string;
  logo_url: string;
  website: string;
  sort_order: number;
  is_active: boolean;
};

const field =
  "w-full rounded-lg border border-gold/25 bg-bg/60 px-3 py-2 text-sm text-text outline-none focus:border-gold";

function Card({ row, onDelete }: { row: CRow; onDelete: (id: string) => void }) {
  const [r, setR] = useState(row);
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const set = (p: Partial<CRow>) => setR((v) => ({ ...v, ...p }));

  async function upload(file: File) {
    setBusy(true);
    setMsg("");
    try {
      const url = await uploadImage(file, "client-logos", r.name.trim() || "logo", 400);
      set({ logo_url: url });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Kļūda");
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gold/25 bg-navy/30 p-4">
      <div className="flex h-12 w-24 items-center justify-center rounded border border-gold/20 bg-bg/40">
        {r.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.logo_url} alt="" className="max-h-10 max-w-full object-contain" />
        ) : (
          <span className="text-[10px] text-text/40">nav logo</span>
        )}
      </div>
      <input placeholder="Nosaukums" value={r.name} onChange={(e) => set({ name: e.target.value })} className={`${field} w-40`} />
      <input placeholder="Mājaslapa (URL)" value={r.website} onChange={(e) => set({ website: e.target.value })} className={`${field} w-52`} />
      <button onClick={() => inputRef.current?.click()} disabled={busy} className="rounded-lg border border-gold/40 px-3 py-2 text-xs text-gold">
        {busy ? "…" : "Logo"}
      </button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={r.is_active} onChange={(e) => set({ is_active: e.target.checked })} className="accent-[#D4A960]" /> Aktīvs</label>
      <input type="number" value={r.sort_order} onChange={(e) => set({ sort_order: Number(e.target.value) })} className={`${field} w-16`} />
      <button onClick={() => start(async () => { const res = await upsertClient(r.id, r); setMsg(res?.error ?? "✓"); })} disabled={pending} className="rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-black">Saglabāt</button>
      {r.id && <button onClick={() => { if (confirm("Dzēst?")) start(() => { deleteClient(r.id!); onDelete(r.id!); }); }} className="rounded-full border border-red-500/50 px-3 py-1.5 text-xs text-red-300">Dzēst</button>}
      {msg && <span className="text-xs text-gold">{msg}</span>}
    </div>
  );
}

export default function ClientsAdmin({ rows }: { rows: CRow[] }) {
  const [list, setList] = useState<CRow[]>(rows);
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Klienti</h1>
        <button onClick={() => setList((l) => [...l, { id: null, name: "", logo_url: "", website: "", sort_order: l.length, is_active: true }])} className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black">+ Jauns</button>
      </div>
      <div className="space-y-3">
        {list.map((row, i) => (<Card key={row.id ?? `new-${i}`} row={row} onDelete={(id) => setList((l) => l.filter((x) => x.id !== id))} />))}
      </div>
    </div>
  );
}
