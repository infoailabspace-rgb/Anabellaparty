"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import { uploadImageSized } from "@/components/admin/image-uploader";
import { BLOG_CATEGORIES, CATEGORY_LABEL } from "@/lib/blog";
import { upsertBlogPost, type BlogInput } from "../site-actions";

marked.use({ breaks: true, gfm: true, renderer: { html: () => "" } });

const EVENT_TYPES = ["Kāzas", "Bērnu ballīte", "Korporatīvais", "Jubileja", "Cits"];
const ARTICLE_TYPES = ["Pasākuma stāsts", "Padomi", "Jaunums"];

const field =
  "w-full rounded-lg border border-gold/25 bg-bg/60 px-3 py-2 text-sm text-text outline-none focus:border-gold";

const LV_MAP: Record<string, string> = {
  ā: "a", č: "c", ē: "e", ģ: "g", ī: "i", ķ: "k", ļ: "l", ņ: "n", š: "s", ū: "u", ž: "z",
};
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[āčēģīķļņšūž]/g, (c) => LV_MAP[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export type BlogProduct = { slug: string; name: string };

export type EditPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  meta_description: string;
  cover_url: string | null;
  cover_alt: string;
  gallery: string[];
  category: string | null;
  tags: string[];
  related_products: string[];
  social: { facebook: string; instagram: string; whatsapp: string } | null;
  status: string;
  published_at?: string | null;
  ai_generated: boolean;
  edited_after_ai: boolean;
};

export default function BlogEditor({
  products,
  post,
}: {
  products: BlogProduct[];
  post?: EditPost;
}) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(post?.id ?? null);
  const [phase, setPhase] = useState<"input" | "edit">(post ? "edit" : "input");

  // Ģenerēšanas ievade
  const [eventType, setEventType] = useState("Kāzas");
  const [articleType, setArticleType] = useState("Pasākuma stāsts");
  const [place, setPlace] = useState("");
  const [guests, setGuests] = useState("");
  const [notes, setNotes] = useState("");
  const [genProducts, setGenProducts] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [genErr, setGenErr] = useState("");

  // Raksta lauki
  const [titleVariants, setTitleVariants] = useState<string[]>([]);
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.meta_description ?? "");
  const [category, setCategory] = useState<string>(post?.category ?? "");
  const [tags, setTags] = useState((post?.tags ?? []).join(", "));
  const [gallery, setGallery] = useState<string[]>(post?.gallery ?? []);
  const [coverUrl, setCoverUrl] = useState<string | null>(post?.cover_url ?? null);
  const [coverAlt, setCoverAlt] = useState(post?.cover_alt ?? "");
  const [related, setRelated] = useState<Set<string>>(new Set(post?.related_products ?? []));
  const [social, setSocial] = useState(
    post?.social ?? { facebook: "", instagram: "", whatsapp: "" },
  );
  const [status, setStatus] = useState(post?.status ?? "draft");
  const [publishedAt, setPublishedAt] = useState(
    post?.published_at ? post.published_at.slice(0, 16) : "",
  );
  const [aiGenerated, setAiGenerated] = useState(post?.ai_generated ?? false);
  const [edited, setEdited] = useState(post?.edited_after_ai ?? false);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [regenInstr, setRegenInstr] = useState("");
  const [regenBusy, setRegenBusy] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [, start] = useTransition();

  async function regenSection() {
    const ta = contentRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const sel = content.slice(s, e);
    if (sel.trim().length < 3) {
      setMsg("Atlasi saturā tekstu, ko pārģenerēt.");
      return;
    }
    setRegenBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/blog/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: "section", sectionText: sel, instruction: regenInstr }),
      });
      const data = await res.json();
      if (!res.ok) setMsg(data.error ?? "Pārģenerēšana neizdevās.");
      else if (data.text) {
        setContent((c) => c.slice(0, s) + data.text + c.slice(e));
        touch();
        setMsg("Fragments pārģenerēts ✓");
      }
    } catch {
      setMsg("Tīkla kļūda.");
    }
    setRegenBusy(false);
  }

  // Jebkura AI lauka izmaiņa → edited_after_ai = true
  const touch = () => {
    if (aiGenerated && !edited) setEdited(true);
  };

  const words = useMemo(
    () => content.trim().split(/\s+/).filter(Boolean).length,
    [content],
  );
  const readMin = Math.max(1, Math.round(words / 200));
  const previewHtml = useMemo(
    () => marked.parse(content || "", { async: false }) as string,
    [content],
  );

  function toggle(set: React.Dispatch<React.SetStateAction<Set<string>>>, v: string) {
    set((s) => {
      const n = new Set(s);
      if (n.has(v)) n.delete(v);
      else n.add(v);
      return n;
    });
  }

  async function generate() {
    setGenErr("");
    if (notes.trim().length < 20) return setGenErr("Piezīmes obligātas — vismaz 20 zīmes.");
    if (genProducts.size === 0) return setGenErr("Izvēlies vismaz vienu inventāra vienību.");
    setGenerating(true);
    try {
      const res = await fetch("/api/blog/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          notes,
          eventType,
          articleType,
          place,
          guests,
          products: [...genProducts],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenErr(data.error ?? "Ģenerēšana neizdevās.");
        setGenerating(false);
        return;
      }
      const tv: string[] = Array.isArray(data.title) ? data.title : [String(data.title ?? "")];
      setTitleVariants(tv);
      setTitle(tv[0] ?? "");
      setSlug(slugify(tv[0] ?? ""));
      setExcerpt(data.excerpt ?? "");
      setContent(data.content ?? "");
      setMetaDescription(data.metaDescription ?? "");
      setTags((data.suggestedTags ?? []).join(", "));
      setCoverAlt(tv[0] ?? "");
      setRelated(new Set(genProducts));
      if (data.social)
        setSocial({
          facebook: data.social.facebook ?? "",
          instagram: data.social.instagram ?? "",
          whatsapp: data.social.whatsapp ?? "",
        });
      setAiGenerated(true);
      setEdited(false);
      setPhase("edit");
    } catch {
      setGenErr("Tīkla kļūda ģenerēšanā.");
    }
    setGenerating(false);
  }

  async function uploadImages(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(true);
    const added: string[] = [];
    for (const f of Array.from(files)) {
      try {
        const { url } = await uploadImageSized(f, "site-images", "blog", 1600, 0.82);
        added.push(url);
      } catch {
        /* ignore single failure */
      }
    }
    if (added.length) {
      setGallery((g) => [...g, ...added]);
      if (!coverUrl) setCoverUrl(added[0]);
    }
    setBusy(false);
  }

  function save() {
    setMsg("");
    if (!slug.trim()) return setMsg("Slug ir obligāts.");
    if (!title.trim()) return setMsg("Virsraksts ir obligāts.");
    if (
      status === "published" &&
      aiGenerated &&
      !edited &&
      !confirm(
        "Šis teksts nav rediģēts. AI melnraksti bez cilvēka pieskāriena parasti izklausās tukši. Vai tiešām publicēt?",
      )
    )
      return;

    const input: BlogInput = {
      slug: slug.trim(),
      title,
      excerpt,
      content,
      meta_description: metaDescription,
      cover_url: coverUrl,
      cover_alt: coverAlt,
      gallery,
      category: category || null,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      related_products: [...related],
      social,
      status,
      published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
      ai_generated: aiGenerated,
      edited_after_ai: edited,
    };
    start(async () => {
      const res = await upsertBlogPost(id, input);
      if (res?.error) setMsg(res.error);
      else {
        setMsg("Saglabāts ✓");
        if (!id && res.id) {
          setId(res.id);
          router.replace(`/admin/blogs/${res.id}`);
        }
      }
    });
  }

  /* ---------- INPUT PHASE ---------- */
  if (phase === "input") {
    return (
      <div className="max-w-3xl">
        <h1 className="mb-1 font-display text-2xl font-bold">Jauns raksts</h1>
        <p className="mb-6 text-xs text-text/50">
          Ievadi datus un piezīmes → AI uzraksta melnrakstu → tu izlabo un publicē.
        </p>
        <div className="space-y-4 rounded-2xl border border-gold/25 bg-navy/30 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              Pasākuma veids *
              <select value={eventType} onChange={(e) => setEventType(e.target.value)} className={`${field} mt-1`}>
                {EVENT_TYPES.map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
            <label className="text-sm">
              Raksta tips *
              <select value={articleType} onChange={(e) => setArticleType(e.target.value)} className={`${field} mt-1`}>
                {ARTICLE_TYPES.map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
            <label className="text-sm">
              Vieta
              <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Cēsu pils" className={`${field} mt-1`} />
            </label>
            <label className="text-sm">
              Viesu skaits
              <input value={guests} onChange={(e) => setGuests(e.target.value)} placeholder="80" className={`${field} mt-1`} />
            </label>
          </div>

          <div>
            <p className="text-sm">Izmantotais inventārs * ({genProducts.size})</p>
            <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-gold/15 bg-bg/30 p-2">
              <div className="grid gap-1 sm:grid-cols-2">
                {products.map((p) => (
                  <label key={p.slug} className="flex items-center gap-2 text-xs text-text/85">
                    <input type="checkbox" checked={genProducts.has(p.slug)} onChange={() => toggle(setGenProducts, p.slug)} className="accent-[#D4A960]" />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <label className="block text-sm">
            Tavas piezīmes * (min 20 zīmes, {notes.trim().length})
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Zelta rāmis, 340 izdrukas līdz pusnaktij, līgava gribēja retro filtru…"
              className={`${field} mt-1`}
            />
          </label>

          {genErr && <p className="text-sm text-red-300">{genErr}</p>}
          <button
            onClick={generate}
            disabled={generating}
            className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-black disabled:opacity-60"
          >
            {generating ? "AI ģenerē… (~15 s)" : "Ģenerēt melnrakstu"}
          </button>
        </div>
      </div>
    );
  }

  /* ---------- EDIT PHASE ---------- */
  const metaLen = metaDescription.length;
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{id ? "Rediģēt rakstu" : "Melnraksts"}</h1>
        <div className="flex items-center gap-2 text-xs">
          {aiGenerated && (
            <span className={`rounded-full px-2 py-0.5 ${edited ? "bg-gold/20 text-gold" : "bg-red-500/20 text-red-300"}`}>
              {edited ? "rediģēts" : "AI, nerediģēts"}
            </span>
          )}
          <span className="text-text/50">{words} vārdi · {readMin} min</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Kreisā: lauki */}
        <div className="space-y-4">
          {titleVariants.length > 1 && (
            <div className="rounded-xl border border-gold/15 bg-navy/20 p-3 text-xs">
              <p className="mb-1 text-text/60">Virsraksta varianti:</p>
              <div className="space-y-1">
                {titleVariants.map((tv, i) => (
                  <button key={i} onClick={() => { setTitle(tv); if (!slug || slug === slugify(title)) setSlug(slugify(tv)); touch(); }} className="block text-left text-gold hover:underline">
                    {tv}
                  </button>
                ))}
              </div>
            </div>
          )}
          <label className="block text-sm">Virsraksts *
            <input value={title} onChange={(e) => { setTitle(e.target.value); touch(); }} className={`${field} mt-1`} />
          </label>
          <label className="block text-sm">Slug *
            <div className="mt-1 flex gap-2">
              <input value={slug} onChange={(e) => setSlug(e.target.value)} className={field} />
              <button onClick={() => setSlug(slugify(title))} className="shrink-0 rounded-lg border border-gold/30 px-3 text-xs text-gold">No virsraksta</button>
            </div>
          </label>
          <label className="block text-sm">Izvilkums (excerpt)
            <textarea rows={2} value={excerpt} onChange={(e) => { setExcerpt(e.target.value); touch(); }} className={`${field} mt-1`} />
          </label>
          <label className="block text-sm">Saturs (markdown)
            <textarea ref={contentRef} rows={16} value={content} onChange={(e) => { setContent(e.target.value); touch(); }} className={`${field} mt-1 font-mono text-xs`} />
          </label>
          <div className="rounded-lg border border-gold/15 bg-navy/20 p-2">
            <p className="mb-1 text-[11px] text-text/50">Pārģenerēt sadaļu: atlasi saturā tekstu, ievadi norādi, pārraksta tikai to.</p>
            <div className="flex gap-2">
              <input value={regenInstr} onChange={(e) => setRegenInstr(e.target.value)} placeholder="konkrētāk / īsāk / siltāk" className={`${field} text-xs`} />
              <button onClick={regenSection} disabled={regenBusy} className="shrink-0 rounded-full border border-gold/40 px-3 py-1 text-xs text-gold disabled:opacity-60">
                {regenBusy ? "…" : "Pārģenerēt atlasīto"}
              </button>
            </div>
          </div>
        </div>

        {/* Labā: priekšskatījums + meta */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gold/20 bg-bg/40 p-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-text/40">Priekšskatījums</p>
            <div className="prose-blog max-w-none text-sm" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>

          <label className="block text-sm">Meta apraksts ({metaLen}/160)
            <textarea rows={2} value={metaDescription} onChange={(e) => { setMetaDescription(e.target.value); touch(); }} className={`${field} mt-1 ${metaLen > 165 ? "border-amber-400/60" : ""}`} />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">Kategorija
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${field} mt-1`}>
                <option value="">—</option>
                {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
              </select>
            </label>
            <label className="text-sm">Statuss
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${field} mt-1`}>
                <option value="draft">Melnraksts</option>
                <option value="published">Publicēts</option>
              </select>
            </label>
          </div>
          {status === "published" && (
            <label className="block text-sm">Publicēšanas datums (tukšs = tagad; nākotne = plānots)
              <input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className={`${field} mt-1`} />
            </label>
          )}
          <label className="block text-sm">Tagi (ar komatu)
            <input value={tags} onChange={(e) => setTags(e.target.value)} className={`${field} mt-1`} />
          </label>
        </div>
      </div>

      {/* Bildes */}
      <div className="mt-6 rounded-2xl border border-gold/25 bg-navy/30 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Bildes</h2>
          <label className="cursor-pointer rounded-full bg-gold px-3 py-1 text-xs font-semibold text-black">
            {busy ? "Augšupielādē…" : "Augšupielādēt"}
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => uploadImages(e.target.files)} />
          </label>
        </div>
        {gallery.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {gallery.map((url) => (
              <div key={url} className={`overflow-hidden rounded-lg border-2 ${coverUrl === url ? "border-gold" : "border-gold/20"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-20 w-full object-cover" />
                <div className="flex items-center justify-between bg-black/50 px-1 py-0.5 text-[10px]">
                  <label className="flex items-center gap-1">
                    <input type="radio" checked={coverUrl === url} onChange={() => setCoverUrl(url)} className="accent-[#D4A960]" /> Vāks
                  </label>
                  <button onClick={() => { setContent((c) => `${c}\n\n![${coverAlt || ""}](${url})\n`); touch(); }} className="text-gold">Tekstā</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <label className="mt-3 block text-xs">Vāka alt teksts
          <input value={coverAlt} onChange={(e) => setCoverAlt(e.target.value)} className={`${field} mt-1`} />
        </label>
      </div>

      {/* Saistītie produkti */}
      <div className="mt-4 rounded-2xl border border-gold/25 bg-navy/30 p-4">
        <h2 className="mb-2 text-sm font-semibold">Saistītie produkti ({related.size})</h2>
        <div className="grid gap-1 sm:grid-cols-3">
          {products.map((p) => (
            <label key={p.slug} className="flex items-center gap-2 text-xs text-text/85">
              <input type="checkbox" checked={related.has(p.slug)} onChange={() => toggle(setRelated, p.slug)} className="accent-[#D4A960]" />
              {p.name}
            </label>
          ))}
        </div>
      </div>

      {/* Soc. tīklu teksti */}
      {(social.facebook || social.instagram || social.whatsapp) && (
        <div className="mt-4 rounded-2xl border border-gold/25 bg-navy/30 p-4">
          <h2 className="mb-2 text-sm font-semibold">Sociālo tīklu teksti</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["facebook", "instagram", "whatsapp"] as const).map((k) => (
              <div key={k}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="uppercase text-text/60">{k}</span>
                  <button onClick={() => navigator.clipboard?.writeText(social[k])} className="text-gold hover:underline">Kopēt</button>
                </div>
                <textarea rows={4} value={social[k]} onChange={(e) => setSocial((s) => ({ ...s, [k]: e.target.value }))} className={`${field} text-xs`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saglabāt */}
      <div className="sticky bottom-0 mt-6 flex items-center gap-3 border-t border-gold/20 bg-bg/95 py-3">
        <button onClick={save} disabled={busy} className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-black disabled:opacity-60">
          Saglabāt {status === "published" ? "un publicēt" : "melnrakstu"}
        </button>
        {id && status === "published" && (
          <a href={`/blogs/${slug}/`} target="_blank" rel="noreferrer" className="text-sm text-gold hover:underline">Skatīt →</a>
        )}
        {msg && <span className="text-sm text-gold">{msg}</span>}
      </div>
    </div>
  );
}
