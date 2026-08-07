"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const OK_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

// Klienta puses saspiešana ar canvas → JPEG.
export async function compressImage(
  file: File,
  maxW = 2000,
  quality = 0.85,
): Promise<Blob> {
  const img = await createImageBitmap(file);
  let { width, height } = img;
  if (width > maxW) {
    height = Math.round((height * maxW) / width);
    width = maxW;
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);
  return await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/jpeg", quality),
  );
}

export async function uploadImage(
  file: File,
  bucket: string,
  pathPrefix: string,
  maxW = 2000,
): Promise<string> {
  if (!OK_TYPES.includes(file.type)) throw new Error("Tikai JPG/PNG/WEBP.");
  if (file.size > MAX_BYTES) throw new Error("Fails pārāk liels (max 10 MB).");
  const blob = await compressImage(file, maxW);
  const supabase = createClient();
  const path = `${pathPrefix}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

const LOGO_MAX = 200 * 1024; // 200 KB pēc apstrādes

// Logo augšupielāde, kas SAGLABĀ caurspīdīgumu (atšķirībā no uploadImage → JPEG).
// SVG → augšupielādē neapstrādātu. Raster (PNG/WEBP/JPG) → pārmēro uz augstumu
// 96px (2× retina no rādīšanas 48px), izvada PNG (caurspīdīgums paliek).
export async function uploadLogo(file: File, name: string): Promise<string> {
  const supabase = createClient();
  const isSvg =
    file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");

  let blob: Blob;
  let ext: string;
  let contentType: string;

  if (isSvg) {
    if (file.size > LOGO_MAX)
      throw new Error(`SVG pārāk liels (${Math.round(file.size / 1024)} KB > 200 KB).`);
    blob = file;
    ext = "svg";
    contentType = "image/svg+xml";
  } else {
    if (!OK_TYPES.includes(file.type))
      throw new Error("Tikai SVG / PNG / WEBP / JPG.");
    const img = await createImageBitmap(file);
    const targetH = 96;
    const width = Math.max(1, Math.round((img.width * targetH) / img.height));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d")!;
    // Bez fona zīmēšanas → PNG saglabā caurspīdīgumu (nav balta fona uz navy).
    ctx.drawImage(img, 0, 0, width, targetH);
    blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png"),
    );
    if (blob.size > LOGO_MAX)
      throw new Error(
        `Logo pārāk liels pēc apstrādes (${Math.round(blob.size / 1024)} KB > 200 KB). Izmanto vienkāršāku logo vai SVG.`,
      );
    ext = "png";
    contentType = "image/png";
  }

  const slug =
    (name || "logo")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "logo";
  const path = `${slug}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("client-logos")
    .upload(path, blob, { contentType, upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from("client-logos").getPublicUrl(path).data.publicUrl;
}

// Kā uploadImage, bet atgriež arī apstrādāto izmēru (baitos) — brīdinājumiem.
export async function uploadImageSized(
  file: File,
  bucket: string,
  pathPrefix: string,
  maxW = 1600,
): Promise<{ url: string; size: number }> {
  if (!OK_TYPES.includes(file.type)) throw new Error("Tikai JPG/PNG/WEBP.");
  if (file.size > MAX_BYTES) throw new Error("Fails pārāk liels (max 10 MB).");
  const blob = await compressImage(file, maxW, 0.85);
  const supabase = createClient();
  const path = `${pathPrefix}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw new Error(error.message);
  return {
    url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl,
    size: blob.size,
  };
}

async function removeFromStorage(url: string) {
  const marker = "/storage/v1/object/public/product-images/";
  const i = url.indexOf(marker);
  if (i === -1) return; // statisks fails, nav Storage
  const path = url.slice(i + marker.length);
  try {
    await createClient().storage.from("product-images").remove([path]);
  } catch {
    /* ignore */
  }
}

export default function ImageUploader({
  slug,
  gallery,
  cover,
  onChange,
}: {
  slug: string;
  gallery: string[];
  cover: string;
  onChange: (gallery: string[], cover: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dragIndex = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    if (!slug.trim()) {
      setError("Vispirms ieraksti slug (Pamatinfo), tad augšupielādē attēlus.");
      return;
    }
    setBusy(true);
    setError("");
    const added: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const url = await uploadImage(file, "product-images", slug);
        added.push(url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Augšupielādes kļūda.");
      }
    }
    const next = [...gallery, ...added];
    onChange(next, cover || next[0] || "");
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function reorder(from: number, to: number) {
    if (from === to) return;
    const next = [...gallery];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next, cover);
  }

  async function remove(url: string) {
    const next = gallery.filter((g) => g !== url);
    onChange(next, cover === url ? next[0] ?? "" : cover);
    await removeFromStorage(url);
  }

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-xl border-2 border-dashed border-gold/30 bg-navy/20 p-6 text-center text-sm text-text/60 hover:border-gold/60"
      >
        {busy ? "Augšupielādē…" : "Velc attēlus šeit vai klikšķini (JPG/PNG/WEBP, saspiež līdz 2000px)"}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}

      {gallery.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {gallery.map((url, i) => (
            <div
              key={url}
              draggable
              onDragStart={() => (dragIndex.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex.current !== null) reorder(dragIndex.current, i);
                dragIndex.current = null;
              }}
              className={`group relative aspect-square cursor-move overflow-hidden rounded-lg border-2 ${
                cover === url ? "border-gold" : "border-gold/20"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-1.5 py-1 text-[10px]">
                <label className="flex items-center gap-1 text-text/90">
                  <input
                    type="radio"
                    checked={cover === url}
                    onChange={() => onChange(gallery, url)}
                    className="accent-[#D4A960]"
                  />
                  Vāks
                </label>
                <button
                  type="button"
                  onClick={() => remove(url)}
                  className="text-red-300 hover:text-red-200"
                >
                  Dzēst
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-text/40">
        Velc, lai mainītu secību. Pirmais / atzīmētais = vāka attēls.
      </p>
    </div>
  );
}
