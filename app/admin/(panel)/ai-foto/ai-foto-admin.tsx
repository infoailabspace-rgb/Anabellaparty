"use client";

import { useRef, useState, useTransition } from "react";
import { uploadImageSized } from "@/components/admin/image-uploader";
import {
  saveAifotoText,
  saveAifotoThemes,
  saveAifotoGallery,
} from "../site-actions";

type ML = { lv: string; en: string; ru: string };
const LANGS: (keyof ML)[] = ["lv", "en", "ru"];
const field =
  "w-full rounded-lg border border-gold/25 bg-bg/60 px-3 py-2 text-sm text-text outline-none focus:border-gold";

function MLBlock({
  title,
  hint,
  initial,
  textarea,
  onSave,
}: {
  title: string;
  hint?: string;
  initial: ML;
  textarea?: boolean;
  onSave: (v: ML) => Promise<{ error?: string } | { ok: true } | void>;
}) {
  const [v, setV] = useState<ML>(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const set = (l: keyof ML, s: string) => {
    setV((p) => ({ ...p, [l]: s }));
    setMsg("");
  };
  return (
    <div className="rounded-2xl border border-gold/25 bg-navy/30 p-5">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {hint && <p className="mt-1 text-xs text-text/50">{hint}</p>}
      <div className="mt-3 space-y-2">
        {LANGS.map((l) => (
          <div key={l} className="flex items-start gap-2">
            <span className="mt-2 w-8 shrink-0 font-mono text-xs uppercase text-text/40">
              {l}
            </span>
            {textarea ? (
              <textarea
                rows={3}
                value={v[l]}
                onChange={(e) => set(l, e.target.value)}
                className={field}
              />
            ) : (
              <input
                value={v[l]}
                onChange={(e) => set(l, e.target.value)}
                className={field}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={() =>
            start(async () => {
              const r = await onSave(v);
              setMsg(r && "error" in r && r.error ? r.error : "Saglabāts ✓");
            })
          }
          disabled={pending}
          className="rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-60"
        >
          {pending ? "Saglabā…" : "Saglabāt"}
        </button>
        {msg && <span className="text-xs text-gold">{msg}</span>}
      </div>
    </div>
  );
}

function ThemesBlock({ initial }: { initial: ML[] }) {
  const [items, setItems] = useState<ML[]>(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const upd = (i: number, l: keyof ML, s: string) => {
    setItems((a) => a.map((t, j) => (j === i ? { ...t, [l]: s } : t)));
    setMsg("");
  };
  const del = (i: number) => {
    setItems((a) => a.filter((_, j) => j !== i));
    setMsg("");
  };
  const move = (i: number, dir: number) => {
    setItems((a) => {
      const j = i + dir;
      if (j < 0 || j >= a.length) return a;
      const n = [...a];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
    setMsg("");
  };
  const add = () => {
    setItems((a) => [...a, { lv: "", en: "", ru: "" }]);
    setMsg("");
  };
  return (
    <div className="rounded-2xl border border-gold/25 bg-navy/30 p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Tēmas</h2>
        <button
          onClick={add}
          className="rounded-full border border-gold/40 px-3 py-1 text-xs text-gold"
        >
          + Pievienot
        </button>
      </div>
      <p className="mt-1 text-xs text-text/50">
        Katra tēma trīs valodās. Bultiņas maina secību. Tukšas tēmas netiek saglabātas.
      </p>
      <div className="mt-3 space-y-2">
        {items.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg border border-gold/15 bg-bg/30 p-2"
          >
            <div className="flex flex-col text-xs leading-none">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="text-text/40 hover:text-gold disabled:opacity-30"
              >
                ▲
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="text-text/40 hover:text-gold disabled:opacity-30"
              >
                ▼
              </button>
            </div>
            {LANGS.map((l) => (
              <input
                key={l}
                placeholder={l.toUpperCase()}
                value={t[l]}
                onChange={(e) => upd(i, l, e.target.value)}
                className={`${field} flex-1`}
              />
            ))}
            <button
              onClick={() => del(i)}
              className="rounded-full border border-red-500/50 px-2 py-1 text-xs text-red-300"
            >
              ✕
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-text/40">Nav tēmu.</p>}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={() =>
            start(async () => {
              const clean = items.filter(
                (t) => t.lv.trim() || t.en.trim() || t.ru.trim(),
              );
              const r = await saveAifotoThemes(clean);
              setMsg(r?.error ?? "Saglabāts ✓");
            })
          }
          disabled={pending}
          className="rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-60"
        >
          {pending ? "Saglabā…" : "Saglabāt tēmas"}
        </button>
        {msg && <span className="text-xs text-gold">{msg}</span>}
      </div>
    </div>
  );
}

function GalleryBlock({ initial }: { initial: string[] }) {
  const [images, setImages] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const dragIndex = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function persist(next: string[]) {
    setImages(next);
    const r = await saveAifotoGallery(next);
    setMsg(r?.error ?? "Saglabāts ✓");
  }
  async function addFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(true);
    setMsg("");
    const added: string[] = [];
    for (const f of Array.from(files)) {
      try {
        const { url } = await uploadImageSized(f, "site-images", "ai-foto", 1600);
        added.push(url);
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Augšupielādes kļūda.");
      }
    }
    if (added.length) await persist([...images, ...added]);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }
  function reorder(from: number, to: number) {
    if (from === to) return;
    const n = [...images];
    const [m] = n.splice(from, 1);
    n.splice(to, 0, m);
    persist(n);
  }

  return (
    <div className="rounded-2xl border border-gold/25 bg-navy/30 p-5">
      <h2 className="font-display text-lg font-semibold">Galerija</h2>
      <p className="mt-1 text-xs text-text/50">
        Saspiež līdz 1600px (JPEG 85). Velc, lai mainītu secību. Izmaiņas saglabājas uzreiz.
      </p>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className="mt-3 cursor-pointer rounded-xl border-2 border-dashed border-gold/30 bg-bg/20 p-6 text-center text-sm text-text/60 hover:border-gold/60"
      >
        {busy ? "Augšupielādē…" : "Velc attēlus šeit vai klikšķini (JPG/PNG/WEBP)"}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((url, i) => (
            <div
              key={url}
              draggable
              onDragStart={() => (dragIndex.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex.current !== null) reorder(dragIndex.current, i);
                dragIndex.current = null;
              }}
              className="group relative aspect-square cursor-move overflow-hidden rounded-lg border-2 border-gold/20"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => persist(images.filter((_, j) => j !== i))}
                className="absolute right-1 top-1 rounded-full bg-black/70 px-1.5 text-xs text-red-300 hover:text-red-200"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      {msg && <p className="mt-2 text-xs text-gold">{msg}</p>}
    </div>
  );
}

export default function AiFotoAdmin({
  intro,
  price,
  themes,
  gallery,
}: {
  intro: ML;
  price: ML;
  themes: ML[];
  gallery: string[];
}) {
  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-bold">AI foto lapa</h1>
      <p className="mb-6 text-xs text-text/50">
        Lapas <span className="font-mono">/foto-kaste/ai-foto</span> saturs. Virsraksts,
        tagline un hero medijs — sadaļā “Saturs”.
      </p>
      <div className="space-y-4">
        <MLBlock
          title="Ievadteksts"
          initial={intro}
          textarea
          onSave={(v) => saveAifotoText("aifoto.intro", v)}
        />
        <MLBlock
          title="Cenas teksts"
          hint="Piem. “+100 € papildus izvēlētās foto kastes cenai.”"
          initial={price}
          textarea
          onSave={(v) => saveAifotoText("aifoto.price", v)}
        />
        <ThemesBlock initial={themes} />
        <GalleryBlock initial={gallery} />
      </div>
    </div>
  );
}
