"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/components/admin/image-uploader";
import { saveHeroMedia, type HeroMediaInput } from "../site-actions";

const MP4_WARN = 5 * 1024 * 1024; // 5 MB
const IMG_WARN = 500 * 1024; // 500 KB

export type HeroPage = {
  key: string;
  path: string;
  video: boolean;
  media: HeroMediaInput;
};

const fmt = (b: number) =>
  b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;

// Neapstrādāts fails uz Storage (video/webm — bez saspiešanas).
async function uploadRaw(file: File, pageKey: string): Promise<string> {
  const sb = createClient();
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `hero/${pageKey}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage
    .from("site-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return sb.storage.from("site-images").getPublicUrl(path).data.publicUrl;
}

// Attēls/poster — canvas saspiešana (JPEG 2000px), atgriež URL + izmēru.
async function uploadImage(
  file: File,
  pageKey: string,
): Promise<{ url: string; size: number }> {
  const blob = await compressImage(file, 2000, 0.85);
  const sb = createClient();
  const path = `hero/${pageKey}/${crypto.randomUUID()}.jpg`;
  const { error } = await sb.storage
    .from("site-images")
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw new Error(error.message);
  return {
    url: sb.storage.from("site-images").getPublicUrl(path).data.publicUrl,
    size: blob.size,
  };
}

type Field = "mp4" | "webm" | "poster" | "image";

function HeroCard({ page }: { page: HeroPage }) {
  const [m, setM] = useState<HeroMediaInput>(page.media);
  const [sizes, setSizes] = useState<Partial<Record<Field, number>>>({});
  const [busy, setBusy] = useState<Field | null>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  async function pick(field: Field, file: File | undefined) {
    if (!file) return;
    setErr("");
    setMsg("");
    setBusy(field);
    try {
      if (field === "mp4" || field === "webm") {
        const url = await uploadRaw(file, page.key);
        setM((v) => ({ ...v, [field]: url }));
        setSizes((s) => ({ ...s, [field]: file.size }));
      } else {
        const { url, size } = await uploadImage(file, page.key);
        setM((v) => ({ ...v, [field]: url }));
        setSizes((s) => ({ ...s, [field]: size }));
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Augšupielādes kļūda.");
    } finally {
      setBusy(null);
    }
  }

  function save() {
    setErr("");
    setMsg("");
    // Klienta validācija (servera puse to pašu pārbauda vēlreiz).
    if (page.video && !m.mp4) return setErr("MP4 ir obligāts.");
    if (m.poster && !m.mp4) return setErr("Poster bez video nav atļauts.");
    if (page.video && m.mp4 && !m.poster) return setErr("Poster ir obligāts video lapai.");
    if (!page.video && !m.image) return setErr("Attēls ir obligāts.");
    start(async () => {
      const res = await saveHeroMedia(page.key, m);
      if (res?.error) setErr(res.error);
      else setMsg("Saglabāts ✓");
    });
  }

  const Slot = ({
    field,
    label,
    accept,
    warn,
    image,
  }: {
    field: Field;
    label: string;
    accept: string;
    warn?: number;
    image?: boolean;
  }) => {
    const url = m[field];
    const size = sizes[field];
    const over = warn && size && size > warn;
    return (
      <div className="rounded-lg border border-gold/20 bg-bg/40 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text/80">{label}</span>
          {url && (
            <button
              type="button"
              onClick={() => {
                setM((v) => ({ ...v, [field]: null }));
                setSizes((s) => ({ ...s, [field]: undefined }));
              }}
              className="text-[11px] text-red-300 hover:text-red-200"
            >
              Noņemt
            </button>
          )}
        </div>
        {url ? (
          image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="mt-2 h-20 w-full rounded object-cover" />
          ) : (
            <p className="mt-2 truncate text-[11px] text-gold/80">{url.split("/").pop()}</p>
          )
        ) : (
          <p className="mt-2 text-[11px] text-text/40">nav iestatīts</p>
        )}
        <label className="mt-2 block cursor-pointer text-[11px] text-text/60">
          {busy === field ? "Augšupielādē…" : "Izvēlēties failu"}
          <input
            type="file"
            accept={accept}
            hidden
            onChange={(e) => pick(field, e.target.files?.[0])}
          />
        </label>
        {size != null && (
          <p className={`text-[11px] ${over ? "text-amber-300" : "text-text/40"}`}>
            {fmt(size)}
            {over ? ` ⚠ virs ${field === "image" ? "500 KB" : "5 MB"}` : ""}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-gold/25 bg-navy/30 p-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-sm text-text/90">{page.path}</p>
        <span className="rounded-full border border-gold/30 px-2 py-0.5 text-[10px] uppercase text-gold/80">
          {page.video ? "video" : "attēls"}
        </span>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {page.video ? (
          <>
            <Slot field="mp4" label="MP4 *" accept="video/mp4" warn={MP4_WARN} />
            <Slot field="webm" label="WebM" accept="video/webm" />
            <Slot field="poster" label="Poster *" accept="image/*" warn={IMG_WARN} image />
          </>
        ) : (
          <Slot field="image" label="Attēls *" accept="image/*" warn={IMG_WARN} image />
        )}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={save}
          disabled={pending || busy !== null}
          className="rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-60"
        >
          {pending ? "Saglabā…" : "Saglabāt"}
        </button>
        {err && <span className="text-xs text-red-300">{err}</span>}
        {msg && <span className="text-xs text-gold">{msg}</span>}
      </div>
    </div>
  );
}

export default function HeroMediaAdmin({ pages }: { pages: HeroPage[] }) {
  return (
    <div className="mt-10">
      <h2 className="font-display text-xl font-bold">Hero mediji</h2>
      <p className="mb-4 mt-1 text-xs text-text/50">
        Video lapām: MP4 (obligāts) + WebM (neobligāts) + poster (obligāts).
        Attēla lapām: viens attēls. Tukšs → publiskais fallback vai navy gradients.
        Brīdinājums: MP4 &gt; 5 MB vai attēls &gt; 500 KB.
      </p>
      <div className="space-y-4">
        {pages.map((p) => (
          <HeroCard key={p.key} page={p} />
        ))}
      </div>
    </div>
  );
}
