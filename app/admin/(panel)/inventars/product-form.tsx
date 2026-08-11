"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveProduct, deleteProduct, type ProductInput } from "./actions";
import ImageUploader from "@/components/admin/image-uploader";
import { LangTabs } from "../saturs/content-editor";

const LANGS = ["lv", "en", "ru"] as const;
type Lang = (typeof LANGS)[number];

const CATEGORIES = [
  { id: "foto-kaste", label: "Foto kastes" },
  { id: "atrakcijas", label: "Atrakcijas" },
  { id: "audio-video", label: "Audio/video" },
  { id: "specefekti", label: "Specefekti" },
  { id: "deco", label: "Deco / mēbeles" },
  { id: "kubli", label: "Kubli / pirts" },
];

const emptyML = { lv: "", en: "", ru: "" };
const empty: ProductInput = {
  slug: "",
  category: "foto-kaste",
  name: { ...emptyML },
  tagline: { ...emptyML },
  description: { ...emptyML },
  includes: { lv: [], en: [], ru: [] },
  tiers: [{ duration: { ...emptyML }, price: 0 }],
  hourly_extra: null,
  add_ons: [],
  contact_only: false,
  specs: [],
  alt_phone: null,
  is_active: true,
  is_featured: false,
  is_special: false,
  cover_image: "",
  gallery: [],
};

function slugify(s: string) {
  const map: Record<string, string> = {
    ā: "a", č: "c", ē: "e", ģ: "g", ī: "i", ķ: "k", ļ: "l", ņ: "n",
    š: "s", ū: "u", ž: "z",
  };
  return s
    .toLowerCase()
    .replace(/[āčēģīķļņšūž]/g, (c) => map[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const field =
  "w-full rounded-lg border border-gold/25 bg-navy/40 px-3 py-2 text-sm text-text outline-none focus:border-gold";

export default function ProductForm({
  id,
  initial,
}: {
  id: string | null;
  initial?: ProductInput;
}) {
  const router = useRouter();
  const [p, setP] = useState<ProductInput>(initial ?? empty);
  const [lang, setLang] = useState<Lang>("lv");
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const set = (patch: Partial<ProductInput>) => setP((v) => ({ ...v, ...patch }));

  function onName(v: string) {
    // Slug ģenerējas tikai no LV nosaukuma.
    set({
      name: { ...p.name, [lang]: v },
      ...(lang === "lv" && !slugTouched && !id ? { slug: slugify(v) } : {}),
    });
  }

  function save() {
    setError("");
    start(async () => {
      const res = await saveProduct(id, p);
      if (res?.error) setError(res.error);
      else router.push("/admin/inventars");
    });
  }

  function remove() {
    if (!id) return;
    if (!confirm(`Dzēst "${p.name}"? To nevar atsaukt.`)) return;
    setError("");
    start(async () => {
      const res = await deleteProduct(id, p.slug, p.category);
      if (res?.error) setError(res.error);
      else router.push("/admin/inventars");
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">
          {id ? "Rediģēt produktu" : "Jauns produkts"}
        </h1>
        <div className="flex gap-3">
          {id && (
            <button
              onClick={remove}
              disabled={pending}
              className="rounded-full border border-red-500/50 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10"
            >
              Dzēst
            </button>
          )}
          <button
            onClick={save}
            disabled={pending}
            className="rounded-full bg-gold px-6 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            {pending ? "Saglabā…" : "Saglabāt"}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {/* Pamatinfo */}
      <section className="grid gap-4 rounded-2xl border border-gold/25 bg-navy/30 p-6 sm:grid-cols-2">
        <div className="col-span-full flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-gold">
            Pamatinfo
          </h2>
          <LangTabs lang={lang} setLang={setLang} />
        </div>
        <label className="block text-sm text-text/70">
          Nosaukums ({lang.toUpperCase()})
          <input
            value={p.name[lang]}
            onChange={(e) => onName(e.target.value)}
            placeholder={lang !== "lv" ? p.name.lv : ""}
            className={`mt-1 ${field}`}
          />
        </label>
        <label className="block text-sm text-text/70">
          Slug
          <input
            value={p.slug}
            onChange={(e) => { setSlugTouched(true); set({ slug: e.target.value }); }}
            className={`mt-1 ${field}`}
          />
        </label>
        <label className="block text-sm text-text/70">
          Kategorija
          <select value={p.category} onChange={(e) => set({ category: e.target.value })} className={`mt-1 ${field}`}>
            {CATEGORIES.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}
          </select>
        </label>
        <label className="block text-sm text-text/70">
          Alternatīvais tālrunis (kubliem)
          <input value={p.alt_phone ?? ""} onChange={(e) => set({ alt_phone: e.target.value })} className={`mt-1 ${field}`} />
        </label>
        <label className="col-span-full block text-sm text-text/70">
          Tagline ({lang.toUpperCase()})
          <input
            value={p.tagline[lang]}
            onChange={(e) => set({ tagline: { ...p.tagline, [lang]: e.target.value } })}
            placeholder={lang !== "lv" ? p.tagline.lv : ""}
            className={`mt-1 ${field}`}
          />
        </label>
        <label className="col-span-full block text-sm text-text/70">
          Apraksts ({lang.toUpperCase()})
          <textarea
            rows={3}
            value={p.description[lang]}
            onChange={(e) => set({ description: { ...p.description, [lang]: e.target.value } })}
            placeholder={lang !== "lv" ? p.description.lv : ""}
            className={`mt-1 ${field}`}
          />
        </label>
        <label className="col-span-full block text-sm text-text/70">
          Nomā iekļauts ({lang.toUpperCase()}) — viens punkts rindā
          <textarea
            rows={4}
            value={p.includes[lang].join("\n")}
            onChange={(e) => set({ includes: { ...p.includes, [lang]: e.target.value.split("\n") } })}
            placeholder={lang !== "lv" ? p.includes.lv.join("\n") : ""}
            className={`mt-1 ${field}`}
          />
        </label>
        <div className="col-span-full flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={p.is_active} onChange={(e) => set({ is_active: e.target.checked })} className="accent-[#D4A960]" />
            Aktīvs (redzams publiski)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={p.is_featured} onChange={(e) => set({ is_featured: e.target.checked })} className="accent-[#D4A960]" />
            Izcelts
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={p.is_special} onChange={(e) => set({ is_special: e.target.checked })} className="accent-[#D4A960]" />
            Rādīt kā īpašo piedāvājumu
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={p.contact_only} onChange={(e) => set({ contact_only: e.target.checked })} className="accent-[#D4A960]" />
            Cena vienojoties
          </label>
        </div>
      </section>

      {/* Cenas */}
      <section className="rounded-2xl border border-gold/25 bg-navy/30 p-6">
        <h2 className="font-display text-lg font-semibold text-gold">Cenas</h2>
        <div className="mt-4 space-y-2">
          {p.tiers.map((t, i) => (
            <div key={i} className="flex gap-2">
              <input placeholder={`Ilgums ${lang.toUpperCase()} (2h, 10h…)`} value={t.duration[lang]} onChange={(e) => { const tiers = [...p.tiers]; tiers[i] = { ...t, duration: { ...t.duration, [lang]: e.target.value } }; set({ tiers }); }} className={field} />
              <input type="number" placeholder="€" value={t.price} onChange={(e) => { const tiers = [...p.tiers]; tiers[i] = { ...t, price: Number(e.target.value) }; set({ tiers }); }} className={`${field} w-28`} />
              <input placeholder={`piezīme ${lang.toUpperCase()}`} value={t.note?.[lang] ?? ""} onChange={(e) => { const tiers = [...p.tiers]; tiers[i] = { ...t, note: { ...(t.note ?? { lv: "", en: "", ru: "" }), [lang]: e.target.value } }; set({ tiers }); }} className={field} />
              <button onClick={() => set({ tiers: p.tiers.filter((_, j) => j !== i) })} className="shrink-0 rounded-lg border border-gold/30 px-3 text-gold">−</button>
            </div>
          ))}
          <button onClick={() => set({ tiers: [...p.tiers, { duration: { lv: "", en: "", ru: "" }, price: 0 }] })} className="rounded-lg border border-gold/30 px-3 py-1 text-sm text-gold">+ Tarifs</button>
        </div>
        <label className="mt-4 block text-sm text-text/70">
          Katras nākamās stundas piemaksa (€)
          <input type="number" value={p.hourly_extra ?? ""} onChange={(e) => set({ hourly_extra: e.target.value === "" ? null : Number(e.target.value) })} className={`mt-1 ${field} w-40`} />
        </label>

        <h3 className="mt-6 text-sm font-semibold text-text/80">Papildinājumi</h3>
        <div className="mt-2 space-y-2">
          {p.add_ons.map((a, i) => (
            <div key={i} className="flex gap-2">
              <input placeholder={`Nosaukums ${lang.toUpperCase()}`} value={a.name[lang]} onChange={(e) => { const add = [...p.add_ons]; add[i] = { ...a, name: { ...a.name, [lang]: e.target.value } }; set({ add_ons: add }); }} className={field} />
              <input type="number" placeholder="€" value={a.price} onChange={(e) => { const add = [...p.add_ons]; add[i] = { ...a, price: Number(e.target.value) }; set({ add_ons: add }); }} className={`${field} w-24`} />
              <input placeholder={`mērv. ${lang.toUpperCase()}`} value={a.unit?.[lang] ?? ""} onChange={(e) => { const add = [...p.add_ons]; add[i] = { ...a, unit: { ...(a.unit ?? { lv: "", en: "", ru: "" }), [lang]: e.target.value } }; set({ add_ons: add }); }} className={`${field} w-32`} />
              <button onClick={() => set({ add_ons: p.add_ons.filter((_, j) => j !== i) })} className="shrink-0 rounded-lg border border-gold/30 px-3 text-gold">−</button>
            </div>
          ))}
          <button onClick={() => set({ add_ons: [...p.add_ons, { name: { lv: "", en: "", ru: "" }, price: 0 }] })} className="rounded-lg border border-gold/30 px-3 py-1 text-sm text-gold">+ Papildinājums</button>
        </div>
      </section>

      {/* Specifikācijas */}
      <section className="rounded-2xl border border-gold/25 bg-navy/30 p-6">
        <h2 className="font-display text-lg font-semibold text-gold">Specifikācijas</h2>
        <div className="mt-4 space-y-2">
          {p.specs.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input placeholder={`Apzīmējums ${lang.toUpperCase()}`} value={s.label[lang]} onChange={(e) => { const sp = [...p.specs]; sp[i] = { ...s, label: { ...s.label, [lang]: e.target.value } }; set({ specs: sp }); }} className={field} />
              <input placeholder={`Vērtība ${lang.toUpperCase()}`} value={s.value[lang]} onChange={(e) => { const sp = [...p.specs]; sp[i] = { ...s, value: { ...s.value, [lang]: e.target.value } }; set({ specs: sp }); }} className={field} />
              <button onClick={() => set({ specs: p.specs.filter((_, j) => j !== i) })} className="shrink-0 rounded-lg border border-gold/30 px-3 text-gold">−</button>
            </div>
          ))}
          <button onClick={() => set({ specs: [...p.specs, { label: { lv: "", en: "", ru: "" }, value: { lv: "", en: "", ru: "" } }] })} className="rounded-lg border border-gold/30 px-3 py-1 text-sm text-gold">+ Specifikācija</button>
        </div>
      </section>

      {/* Attēli */}
      <section className="rounded-2xl border border-gold/25 bg-navy/30 p-6">
        <h2 className="font-display text-lg font-semibold text-gold">Attēli</h2>
        <div className="mt-4">
          <ImageUploader
            slug={p.slug}
            gallery={p.gallery}
            cover={p.cover_image}
            onChange={(gallery, cover) => set({ gallery, cover_image: cover })}
          />
        </div>
        <p className="mt-3 text-xs text-text/40">
          Tukšs EN/RU lauks → publiskajā lapā rāda latviešu versiju. Nosaukums
          netiek tulkots. Neaizmirsti nospiest &quot;Saglabāt&quot;.
        </p>
      </section>
    </div>
  );
}
