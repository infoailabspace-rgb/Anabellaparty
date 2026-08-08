"use client";

import { useRef, useState, useTransition } from "react";
import { uploadImageSized } from "@/components/admin/image-uploader";
import { GALLERY_CATEGORIES, CATEGORY_LABEL } from "@/lib/gallery";
import { LangTabs } from "../saturs/content-editor";
import {
  insertGalleryImages,
  updateGalleryImage,
  deleteGalleryImage,
  bulkGalleryCategory,
  bulkGalleryActive,
  bulkGalleryDelete,
  reorderGallery,
} from "../site-actions";

type ML = { lv: string; en: string; ru: string };
type Lang = keyof ML;
export type GRow = {
  id: string;
  url: string;
  storage_path: string;
  category: string | null;
  caption: ML;
  alt: ML;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
};

const field =
  "w-full rounded border border-gold/25 bg-bg/60 px-2 py-1 text-xs text-text outline-none focus:border-gold";
const emptyML: ML = { lv: "", en: "", ru: "" };

function Card({
  row,
  lang,
  selected,
  onSelect,
  onChange,
  onDelete,
  onDragStart,
  onDrop,
  draggable,
}: {
  row: GRow;
  lang: Lang;
  selected: boolean;
  onSelect: (id: string, v: boolean) => void;
  onChange: (r: GRow) => void;
  onDelete: (id: string) => void;
  onDragStart: () => void;
  onDrop: () => void;
  draggable: boolean;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const set = (p: Partial<GRow>) => onChange({ ...row, ...p });

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={`rounded-xl border bg-navy/30 p-2 ${
        selected ? "border-gold" : "border-gold/20"
      } ${draggable ? "cursor-move" : ""}`}
    >
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={row.url} alt="" className="h-32 w-full rounded object-cover" />
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(row.id, e.target.checked)}
          className="absolute left-1.5 top-1.5 h-4 w-4 accent-[#D4A960]"
        />
        {!row.is_active && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] text-red-300">
            neaktīvs
          </span>
        )}
      </div>
      <select
        value={row.category ?? ""}
        onChange={(e) => set({ category: e.target.value || null })}
        className={`${field} mt-2`}
      >
        <option value="">Bez kategorijas (tikai sākumlapā)</option>
        {GALLERY_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {CATEGORY_LABEL[c]}
          </option>
        ))}
      </select>
      <input
        placeholder={`Paraksts (${lang})`}
        value={row.caption[lang]}
        onChange={(e) => set({ caption: { ...row.caption, [lang]: e.target.value } })}
        className={`${field} mt-1.5`}
      />
      <input
        placeholder={`Alt teksts (${lang})`}
        value={row.alt[lang]}
        onChange={(e) => set({ alt: { ...row.alt, [lang]: e.target.value } })}
        className={`${field} mt-1.5`}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={row.is_active} onChange={(e) => set({ is_active: e.target.checked })} className="accent-[#D4A960]" />
          Aktīvs
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={row.is_featured} onChange={(e) => set({ is_featured: e.target.checked })} className="accent-[#D4A960]" />
          Sākumlapā
        </label>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={() =>
            start(async () => {
              const r = await updateGalleryImage(row.id, {
                category: row.category,
                caption: row.caption,
                alt: row.alt,
                is_active: row.is_active,
                is_featured: row.is_featured,
              });
              setMsg(r?.error ?? "✓");
            })
          }
          disabled={pending}
          className="rounded-full bg-gold px-3 py-1 text-[11px] font-semibold text-black disabled:opacity-60"
        >
          Saglabāt
        </button>
        <button
          onClick={() => {
            if (confirm("Dzēst bildi?"))
              start(async () => {
                await deleteGalleryImage(row.id);
                onDelete(row.id);
              });
          }}
          className="rounded-full border border-red-500/50 px-2 py-1 text-[11px] text-red-300"
        >
          Dzēst
        </button>
        {msg && <span className="text-[11px] text-gold">{msg}</span>}
      </div>
    </div>
  );
}

export default function GalleryAdmin({ rows }: { rows: GRow[] }) {
  const [images, setImages] = useState<GRow[]>(rows);
  const [filter, setFilter] = useState<string>("all"); // all | <cat> | none
  const [lang, setLang] = useState<Lang>("lv");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [err, setErr] = useState("");
  const [, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragId = useRef<string | null>(null);

  const displayed = images.filter((im) =>
    filter === "all" ? true : filter === "none" ? im.category === null : im.category === filter,
  );

  async function upload(files: FileList | null) {
    if (!files || !files.length) return;
    setErr("");
    const arr = Array.from(files);
    setProgress({ done: 0, total: arr.length });
    const uploaded: { image_url: string; storage_path: string; category: string | null }[] = [];
    const cat = filter === "all" || filter === "none" ? null : filter;
    for (let i = 0; i < arr.length; i++) {
      try {
        const { url, path } = await uploadImageSized(arr[i], "site-images", "gallery", 1600, 0.82);
        uploaded.push({ image_url: url, storage_path: path, category: cat });
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Augšupielādes kļūda.");
      }
      setProgress({ done: i + 1, total: arr.length });
    }
    if (uploaded.length) {
      const res = await insertGalleryImages(uploaded);
      if (res?.error) setErr(res.error);
      else if (res.rows) {
        const newRows: GRow[] = (res.rows as any[]).map((r) => ({
          id: r.id,
          url: r.image_url,
          storage_path: r.storage_path,
          category: r.category ?? null,
          caption: { ...emptyML },
          alt: { ...emptyML },
          is_active: r.is_active,
          is_featured: r.is_featured,
          sort_order: r.sort_order ?? 0,
        }));
        setImages((l) => [...l, ...newRows]);
      }
    }
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const toggleSel = (id: string, v: boolean) =>
    setSelected((s) => {
      const n = new Set(s);
      if (v) n.add(id);
      else n.delete(id);
      return n;
    });
  const selAllShown = () =>
    setSelected(new Set(displayed.map((d) => d.id)));
  const clearSel = () => setSelected(new Set());
  const ids = () => [...selected];

  function onDrop(targetId: string) {
    const from = dragId.current;
    dragId.current = null;
    if (!from || from === targetId || filter !== "all") return;
    const next = [...images];
    const fi = next.findIndex((x) => x.id === from);
    const ti = next.findIndex((x) => x.id === targetId);
    if (fi < 0 || ti < 0) return;
    const [m] = next.splice(fi, 1);
    next.splice(ti, 0, m);
    setImages(next);
    start(async () => {
      await reorderGallery(next.map((x) => x.id));
    });
  }

  const TABS: { id: string; label: string }[] = [
    { id: "all", label: "Visas" },
    ...GALLERY_CATEGORIES.map((c) => ({ id: c, label: CATEGORY_LABEL[c] })),
    { id: "none", label: "Bez kategorijas" },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Galerija</h1>
        <LangTabs lang={lang} setLang={(l) => setLang(l as Lang)} />
      </div>

      {/* Augšupielāde */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          upload(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-xl border-2 border-dashed border-gold/30 bg-navy/20 p-6 text-center text-sm text-text/60 hover:border-gold/60"
      >
        {progress
          ? `Augšupielādē… ${progress.done}/${progress.total}`
          : "Velc bildes šeit vai klikšķini (vairākas vienlaikus, saspiež līdz 1600px)"}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => upload(e.target.files)}
        />
      </div>
      <p className="mt-1 text-xs text-text/40">
        Jaunās bildes saņem pašreiz izvēlēto kategoriju
        {filter === "all" || filter === "none" ? " (bez kategorijas)" : ` (${CATEGORY_LABEL[filter]})`}.
        Kārtību maini vilkšanā tikai skatā “Visas”.
      </p>
      {err && <p className="mt-2 text-sm text-red-300">{err}</p>}

      {/* Filtrs */}
      <div className="mt-5 flex flex-wrap gap-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              filter === tab.id ? "bg-gold text-black" : "border border-gold/30 text-text/60 hover:text-gold"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Masveida darbības */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <button onClick={selAllShown} className="rounded-full border border-gold/30 px-3 py-1 text-text/70 hover:text-gold">
          Atzīmēt visas ({displayed.length})
        </button>
        {selected.size > 0 && (
          <>
            <span className="text-gold">{selected.size} atzīmētas:</span>
            <select
              onChange={(e) => {
                const v = e.target.value;
                if (!v) return;
                const cat = v === "none" ? null : v;
                const idList = ids();
                start(async () => {
                  await bulkGalleryCategory(idList, cat);
                  setImages((l) => l.map((im) => (selected.has(im.id) ? { ...im, category: cat } : im)));
                  clearSel();
                });
                e.target.value = "";
              }}
              className="rounded border border-gold/25 bg-bg/60 px-2 py-1 text-text"
              defaultValue=""
            >
              <option value="">Piešķirt kategoriju…</option>
              <option value="none">Bez kategorijas</option>
              {GALLERY_CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
              ))}
            </select>
            <button
              onClick={() => {
                const idList = ids();
                start(async () => {
                  await bulkGalleryActive(idList, false);
                  setImages((l) => l.map((im) => (selected.has(im.id) ? { ...im, is_active: false } : im)));
                  clearSel();
                });
              }}
              className="rounded-full border border-gold/30 px-3 py-1 text-text/70 hover:text-gold"
            >
              Deaktivizēt
            </button>
            <button
              onClick={() => {
                if (!confirm(`Dzēst ${selected.size} bildes?`)) return;
                const idList = ids();
                start(async () => {
                  await bulkGalleryDelete(idList);
                  setImages((l) => l.filter((im) => !selected.has(im.id)));
                  clearSel();
                });
              }}
              className="rounded-full border border-red-500/50 px-3 py-1 text-red-300"
            >
              Dzēst
            </button>
            <button onClick={clearSel} className="text-text/50 hover:text-gold">Notīrīt</button>
          </>
        )}
      </div>

      {/* Režģis */}
      {displayed.length === 0 ? (
        <p className="mt-8 text-sm text-text/40">Nav bilžu šajā skatā.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {displayed.map((row) => (
            <Card
              key={row.id}
              row={row}
              lang={lang}
              selected={selected.has(row.id)}
              onSelect={toggleSel}
              onChange={(r) => setImages((l) => l.map((x) => (x.id === r.id ? r : x)))}
              onDelete={(id) => setImages((l) => l.filter((x) => x.id !== id))}
              onDragStart={() => (dragId.current = row.id)}
              onDrop={() => onDrop(row.id)}
              draggable={filter === "all"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
