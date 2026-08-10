"use client";

import { useState } from "react";
import { uploadImageSized } from "@/components/admin/image-uploader";
import { saveSiteImage } from "../site-actions";

const WARN = 500 * 1024;
const fmt = (b: number) =>
  b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;

type Slot = { key: string; label: string; help: string; fallback: string | null };

function ImageSlot({ slot, initial }: { slot: Slot; initial: string | null }) {
  const [url, setUrl] = useState<string | null>(initial);
  const [size, setSize] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const shown = url ?? slot.fallback;
  const over = size != null && size > WARN;

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setMsg("");
    try {
      const { url: u, size: s } = await uploadImageSized(
        file,
        "site-images",
        slot.key.replace(/\./g, "-"),
        1600,
      );
      const res = await saveSiteImage(slot.key, u);
      if (res?.error) throw new Error(res.error);
      setUrl(u);
      setSize(s);
      setMsg("Saglabāts ✓");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Augšupielādes kļūda.");
    }
    setBusy(false);
  }

  async function remove() {
    setBusy(true);
    setMsg("");
    const res = await saveSiteImage(slot.key, null);
    if (res?.error) setMsg(res.error);
    else {
      setUrl(null);
      setSize(null);
      setMsg(slot.fallback ? "Noņemts — rāda noklusējumu." : "Noņemts.");
    }
    setBusy(false);
  }

  return (
    <div className="rounded-2xl border border-gold/25 bg-navy/30 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-text/90">{slot.label}</span>
        <span className="font-mono text-xs text-text/30">{slot.key}</span>
      </div>
      <p className="mt-1 text-xs text-text/50">{slot.help}</p>
      <div className="mt-3 flex items-center gap-4">
        <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-lg border border-gold/20 bg-navy">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-[10px] text-text/40">
              nav attēla
            </span>
          )}
          {!url && slot.fallback && (
            <span className="absolute inset-x-0 bottom-0 bg-navy/70 px-1 py-0.5 text-center text-[10px] text-text/60">
              noklusējums
            </span>
          )}
        </div>
        <div className="flex flex-col items-start gap-2">
          <label className="cursor-pointer rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-black">
            {busy ? "Augšupielādē…" : url ? "Nomainīt" : "Augšupielādēt"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              disabled={busy}
              onChange={(e) => pick(e.target.files?.[0])}
            />
          </label>
          {url && (
            <button
              onClick={remove}
              disabled={busy}
              className="rounded-full border border-red-500/50 px-4 py-1.5 text-xs text-red-300 disabled:opacity-60"
            >
              Noņemt
            </button>
          )}
          {size != null && (
            <span className={`text-xs ${over ? "text-amber-300" : "text-text/40"}`}>
              {fmt(size)}
              {over ? " ⚠ virs 500 KB" : ""}
            </span>
          )}
          {msg && <span className="text-xs text-gold">{msg}</span>}
        </div>
      </div>
    </div>
  );
}

export default function PageImagesAdmin({
  values,
}: {
  values: Record<string, string | null>;
}) {
  const slots: Slot[] = [
    {
      key: "about.photo",
      label: "Par mums — foto",
      help: "Aivas un Roberta foto sadaļā “Par mums”. Ieteicams portrets 4:5. Tukšs → noklusējuma foto.",
      fallback: "/images/about/komanda.png",
    },
    {
      key: "og.fallback",
      label: "OG rezerves attēls",
      help: "Rezerves sociālo tīklu priekšskatījums (neobligāts). Ieteicams 1200×630. Tukšs → dinamiskais OG attēls.",
      fallback: null,
    },
    { key: "category.foto-kaste", label: "Kategorija — Foto kastes", help: "Sākumlapas kartītes fona attēls. Tukšs → tīrs navy.", fallback: null },
    { key: "category.atrakcijas", label: "Kategorija — Atrakcijas", help: "Sākumlapas kartītes fona attēls. Tukšs → tīrs navy.", fallback: null },
    { key: "category.audio-video", label: "Kategorija — Audio/video", help: "Sākumlapas kartītes fona attēls. Tukšs → tīrs navy.", fallback: null },
    { key: "category.specefekti", label: "Kategorija — Specefekti", help: "Sākumlapas kartītes fona attēls. Tukšs → tīrs navy.", fallback: null },
    { key: "category.deco", label: "Kategorija — Deco", help: "Sākumlapas kartītes fona attēls. Tukšs → tīrs navy.", fallback: null },
    { key: "category.kubli", label: "Kategorija — Kubli", help: "Sākumlapas kartītes fona attēls. Tukšs → tīrs navy.", fallback: null },
  ];
  return (
    <div className="mt-10">
      <h2 className="font-display text-xl font-bold">Lapas attēli</h2>
      <p className="mb-4 mt-1 text-xs text-text/50">
        Attēli, kas nav hero, produkti vai klientu logo. Saspiež līdz 1600px (JPEG 85).
        Brīdinājums, ja &gt; 500 KB.
      </p>
      <div className="space-y-4">
        {slots.map((s) => (
          <ImageSlot key={s.key} slot={s} initial={values[s.key] ?? null} />
        ))}
      </div>
    </div>
  );
}
