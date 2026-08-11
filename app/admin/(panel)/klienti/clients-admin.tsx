"use client";

import { useRef, useState, useTransition } from "react";
import { upsertClient, deleteClient } from "../site-actions";
import { uploadLogo } from "@/components/admin/image-uploader";

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
const ACCEPT = "image/svg+xml,image/png,image/webp,image/jpeg";

function Card({
  row,
  index,
  onChange,
  onDelete,
  onDragStart,
  onDropCard,
}: {
  row: CRow;
  index: number;
  onChange: (r: CRow) => void;
  onDelete: (id: string) => void;
  onDragStart: (i: number) => void;
  onDropCard: (i: number) => void;
}) {
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const set = (p: Partial<CRow>) => onChange({ ...row, ...p });

  async function upload(file: File) {
    setBusy(true);
    setMsg("");
    try {
      const url = await uploadLogo(file, row.name.trim() || "logo");
      set({ logo_url: url });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Kļūda");
    }
    setBusy(false);
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDropCard(index)}
      className="flex flex-wrap items-center gap-3 rounded-2xl border border-gold/25 bg-navy/30 p-4"
    >
      <span
        draggable
        onDragStart={() => onDragStart(index)}
        title="Velc, lai mainītu secību"
        className="cursor-grab select-none px-1 text-lg text-text/40 hover:text-gold"
      >
        ⠿
      </span>
      {/* Priekšskatījums uz NAVY fona — tā redz, vai logo tur lasās */}
      <div className="flex h-14 w-28 items-center justify-center rounded border border-gold/20 bg-navy">
        {row.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={row.logo_url} alt="" className="max-h-12 max-w-full object-contain" />
        ) : (
          <span className="text-[10px] text-text/40">nav logo</span>
        )}
      </div>
      <input placeholder="Nosaukums" value={row.name} onChange={(e) => set({ name: e.target.value })} className={`${field} w-40`} />
      <input placeholder="Mājaslapa (URL)" value={row.website} onChange={(e) => set({ website: e.target.value })} className={`${field} w-52`} />
      <button onClick={() => inputRef.current?.click()} disabled={busy} className="rounded-lg border border-gold/40 px-3 py-2 text-xs text-gold disabled:opacity-60">
        {busy ? "…" : "Logo"}
      </button>
      <input ref={inputRef} type="file" accept={ACCEPT} hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={row.is_active} onChange={(e) => set({ is_active: e.target.checked })} className="accent-[#D4A960]" /> Aktīvs</label>
      <input type="number" value={row.sort_order} onChange={(e) => set({ sort_order: Number(e.target.value) })} className={`${field} w-16`} />
      <button onClick={() => start(async () => { const res = await upsertClient(row.id, row); setMsg(res?.error ?? "✓"); })} disabled={pending} className="rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-black">Saglabāt</button>
      {row.id && <button onClick={() => { if (confirm("Dzēst?")) start(() => { deleteClient(row.id!); onDelete(row.id!); }); }} className="rounded-full border border-red-500/50 px-3 py-1.5 text-xs text-red-300">Dzēst</button>}
      {msg && <span className="text-xs text-gold">{msg}</span>}
    </div>
  );
}

export default function ClientsAdmin({ rows }: { rows: CRow[] }) {
  const [list, setList] = useState<CRow[]>(rows);
  const dragFrom = useRef<number | null>(null);
  const [, start] = useTransition();

  function reorder(to: number) {
    const from = dragFrom.current;
    dragFrom.current = null;
    if (from === null || from === to) return;
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    // Pārrēķina sort_order pēc jaunās secības un saglabā esošos ierakstus.
    const renumbered = next.map((r, i) => ({ ...r, sort_order: i }));
    setList(renumbered);
    start(async () => {
      for (const r of renumbered) if (r.id) await upsertClient(r.id, r);
    });
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Klienti</h1>
        <button onClick={() => setList((l) => [{ id: null, name: "", logo_url: "", website: "", sort_order: 0, is_active: true }, ...l])} className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black">+ Jauns</button>
      </div>
      <p className="mb-6 text-xs text-text/50">
        Logo: PNG (caurspīdīgs) vai SVG, ne JPEG. Velc ⠿, lai mainītu secību. Priekšskatījums uz navy fona rāda, vai logo tur lasās.
      </p>
      <div className="space-y-3">
        {list.map((row, i) => (
          <Card
            key={row.id ?? `new-${i}`}
            row={row}
            index={i}
            onChange={(r) => setList((l) => l.map((x, j) => (j === i ? r : x)))}
            onDelete={(id) => setList((l) => l.filter((x) => x.id !== id))}
            onDragStart={(from) => (dragFrom.current = from)}
            onDropCard={reorder}
          />
        ))}
      </div>
    </div>
  );
}
