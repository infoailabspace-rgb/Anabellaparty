"use client";

import { useRef, useState, useTransition } from "react";
import { upsertPartner, deletePartner } from "../site-actions";
import { uploadImage } from "@/components/admin/image-uploader";

type ML = { lv: string; en: string; ru: string };
export type PRow = {
  id: string | null;
  name: string;
  description: ML;
  url: string;
  logo_url: string;
  sort_order: number;
  is_active: boolean;
};

const LANGS: (keyof ML)[] = ["lv", "en", "ru"];
const ACCEPT = "image/png,image/webp,image/jpeg";
const field =
  "w-full rounded-lg border border-gold/25 bg-bg/60 px-3 py-2 text-sm text-text outline-none focus:border-gold";

function Card({
  row,
  index,
  count,
  onChange,
  onDelete,
  onMove,
}: {
  row: PRow;
  index: number;
  count: number;
  onChange: (r: PRow) => void;
  onDelete: (id: string) => void;
  onMove: (i: number, dir: number) => void;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const set = (p: Partial<PRow>) => onChange({ ...row, ...p });
  const setDesc = (l: keyof ML, s: string) =>
    onChange({ ...row, description: { ...row.description, [l]: s } });

  async function upload(file: File) {
    setBusy(true);
    setMsg("");
    try {
      // FOTO (ne logo): pilna izmēra augšupielāde (līdz 1600px), lai neizplūst
      // lielajā kartītes attēlā. uploadImage saspiež uz JPEG, saglabā kvalitāti.
      const slug =
        (row.name.trim() || "partner")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "partner";
      const url = await uploadImage(file, "product-images", `partners/${slug}`, 1600);
      set({ logo_url: url });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Kļūda");
    }
    setBusy(false);
  }

  return (
    <div className="rounded-2xl border border-gold/25 bg-navy/30 p-4">
      <div className="flex items-center gap-2">
        <div className="flex flex-col text-xs leading-none">
          <button onClick={() => onMove(index, -1)} disabled={index === 0} className="text-text/40 hover:text-gold disabled:opacity-30">▲</button>
          <button onClick={() => onMove(index, 1)} disabled={index === count - 1} className="text-text/40 hover:text-gold disabled:opacity-30">▼</button>
        </div>
        <input placeholder="Nosaukums (īpašvārds)" value={row.name} onChange={(e) => set({ name: e.target.value })} className={`${field} flex-1`} />
        <input placeholder="Saite (URL, neobligāta)" value={row.url} onChange={(e) => set({ url: e.target.value })} className={`${field} w-64`} />
        <label className="flex shrink-0 items-center gap-1 text-xs"><input type="checkbox" checked={row.is_active} onChange={(e) => set({ is_active: e.target.checked })} className="accent-[#D4A960]" /> Aktīvs</label>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="relative flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded border border-gold/20 bg-navy">
          {row.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={row.logo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] text-text/40">nav attēla</span>
          )}
        </div>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="rounded-lg border border-gold/40 px-3 py-2 text-xs text-gold disabled:opacity-60">
          {busy ? "…" : "Pievienot foto"}
        </button>
        <input ref={inputRef} type="file" accept={ACCEPT} hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        <span className="text-xs text-text/40">Foto — JPG/PNG/WEBP, augsta kvalitāte (līdz 10 MB)</span>
      </div>
      <div className="mt-3 space-y-2">
        {LANGS.map((l) => (
          <div key={l} className="flex items-start gap-2">
            <span className="mt-2 w-8 shrink-0 font-mono text-xs uppercase text-text/40">{l}</span>
            <textarea rows={2} placeholder={l !== "lv" ? row.description.lv : "Apraksts"} value={row.description[l]} onChange={(e) => setDesc(l, e.target.value)} className={field} />
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button onClick={() => {
          if (!row.name.trim()) { setMsg("Nosaukums ir obligāts"); return; }
          start(async () => {
            const res = await upsertPartner(row.id, row);
            if (res?.error) { setMsg(res.error); return; }
            if (!row.id && res?.id) onChange({ ...row, id: res.id });
            setMsg("Saglabāts ✓");
          });
        }} disabled={pending} className="rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-60">
          {pending ? "Saglabā…" : "Saglabāt"}
        </button>
        {row.id && <button onClick={() => { if (confirm("Dzēst partneri?")) start(() => { deletePartner(row.id!); onDelete(row.id!); }); }} className="rounded-full border border-red-500/50 px-3 py-1.5 text-xs text-red-300">Dzēst</button>}
        {msg && <span className="text-xs text-gold">{msg}</span>}
      </div>
    </div>
  );
}

export default function PartnersAdmin({ rows }: { rows: PRow[] }) {
  const [list, setList] = useState<PRow[]>(rows);
  const [, start] = useTransition();
  const savingRef = useRef(false);

  function move(i: number, dir: number) {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    const renumbered = next.map((r, k) => ({ ...r, sort_order: k }));
    setList(renumbered);
    if (savingRef.current) return;
    savingRef.current = true;
    start(async () => {
      for (const r of renumbered) if (r.id) await upsertPartner(r.id, r);
      savingRef.current = false;
    });
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Partneri (Mūsu draugi)</h1>
        <button onClick={() => setList((l) => [...l, { id: null, name: "", description: { lv: "", en: "", ru: "" }, url: "", logo_url: "", sort_order: l.length, is_active: true }])} className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black">+ Jauns</button>
      </div>
      <p className="mb-6 text-xs text-text/50">
        Nosaukums netiek tulkots (īpašvārds). Apraksts trīs valodās — tukšs EN/RU rāda LV. Bultiņas maina secību. Kamēr saraksts tukšs, lapa rāda godīgu tukšā stāvokļa paziņojumu.
      </p>
      <div className="space-y-3">
        {list.map((row, i) => (
          <Card
            key={row.id ?? `new-${i}`}
            row={row}
            index={i}
            count={list.length}
            onChange={(r) => setList((l) => l.map((x, j) => (j === i ? r : x)))}
            onDelete={(id) => setList((l) => l.filter((x) => x.id !== id))}
            onMove={move}
          />
        ))}
      </div>
    </div>
  );
}
