"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function audit(action: string, entity: string, entityId: string | null, changes: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("content_audit").insert({
    user_email: user?.email ?? "?",
    action,
    entity,
    entity_id: entityId,
    changes: changes as never,
  });
}

// Daudzvalodu vērtība {lv,en,ru}.
export type ML = { lv: string; en: string; ru: string };

/* ── Saturs ── */
export async function saveContent(key: string, value: ML) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_content")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key);
  if (error) return { error: error.message };
  await audit("update", "content", key, { key });
  revalidatePath("/", "layout"); // atjauno visas valodas
  return { ok: true };
}

/* ── Lapas attēli (valodneitrāli {url}, glabāti site_content) ── */
const PAGE_IMAGE_KEYS = [
  "about.photo",
  "og.fallback",
  "category.foto-kaste",
  "category.atrakcijas",
  "category.audio-video",
  "category.specefekti",
  "category.deco",
  "category.izklaides-punkts",
  "foto-kaste.frames",
];

export async function saveSiteImage(key: string, url: string | null) {
  if (!PAGE_IMAGE_KEYS.includes(key)) return { error: "Nezināma attēla atslēga." };
  const supabase = await createClient();
  const value = { url: url || null };
  const { data: existing } = await supabase
    .from("site_content")
    .select("key")
    .eq("key", key)
    .maybeSingle();
  const { error } = existing
    ? await supabase
        .from("site_content")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key)
    : await supabase
        .from("site_content")
        .insert({ key, value, content_type: "image" });
  if (error) return { error: error.message };
  await audit("update", "content", key, { key });
  revalidatePath("/", "layout");
  return { ok: true };
}

/* ── AI-foto lapa (site_content aifoto.*) ── */
async function upsertContent(
  key: string,
  value: unknown,
  contentType: string,
) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("site_content")
    .select("key")
    .eq("key", key)
    .maybeSingle();
  const { error } = existing
    ? await supabase
        .from("site_content")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key)
    : await supabase
        .from("site_content")
        .insert({ key, value, content_type: contentType });
  if (error) return { error: error.message };
  await audit("update", "content", key, { key });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveAifotoText(key: string, value: ML) {
  if (key !== "aifoto.intro" && key !== "aifoto.price")
    return { error: "Nezināma atslēga." };
  return upsertContent(key, value, "text");
}

export async function saveAifotoThemes(items: ML[]) {
  return upsertContent("aifoto.themes", { items }, "json");
}

export async function saveAifotoGallery(images: string[]) {
  return upsertContent("aifoto.gallery", { images }, "json");
}

/* ── Atsauksmes ── */
export async function upsertTestimonial(
  id: string | null,
  d: { author: string; event_type: string; rating: number; text: string; is_published: boolean; sort_order: number },
) {
  const supabase = await createClient();
  const row = {
    author: d.author,
    event_type: d.event_type || null,
    rating: d.rating,
    text: { lv: d.text },
    is_published: d.is_published,
    sort_order: d.sort_order,
  };
  const { error } = id
    ? await supabase.from("site_testimonials").update(row).eq("id", id)
    : await supabase.from("site_testimonials").insert(row);
  if (error) return { error: error.message };
  await audit(id ? "update" : "create", "testimonial", id, row);
  revalidatePath("/", "layout");
  return { ok: true };
}
export async function deleteTestimonial(id: string) {
  const supabase = await createClient();
  await supabase.from("site_testimonials").delete().eq("id", id);
  await audit("delete", "testimonial", id, null);
  revalidatePath("/", "layout");
}

/* ── Klienti ── */
export async function upsertClient(
  id: string | null,
  d: { name: string; logo_url: string; website: string; sort_order: number; is_active: boolean },
) {
  const supabase = await createClient();
  const row = {
    name: d.name,
    logo_url: d.logo_url || null,
    website: d.website || null,
    sort_order: d.sort_order,
    is_active: d.is_active,
  };
  const { error } = id
    ? await supabase.from("site_clients").update(row).eq("id", id)
    : await supabase.from("site_clients").insert(row);
  if (error) return { error: error.message };
  await audit(id ? "update" : "create", "client", id, row);
  revalidatePath("/", "layout");
  return { ok: true };
}
export async function deleteClient(id: string) {
  const supabase = await createClient();
  await supabase.from("site_clients").delete().eq("id", id);
  await audit("delete", "client", id, null);
  revalidatePath("/", "layout");
}

/* ── Lapu teksti (DB pārraksti; site_content categories./pages./sec.) ── */
export async function saveOverride(key: string, value: ML) {
  const { ALLOWED_KEYS } = await import("@/lib/editable-catalog");
  if (!ALLOWED_KEYS.has(key)) return { error: "Nezināma atslēga." };
  return upsertContent(key, value, "text");
}

export async function deleteOverride(key: string) {
  const { ALLOWED_KEYS } = await import("@/lib/editable-catalog");
  if (!ALLOWED_KEYS.has(key)) return { error: "Nezināma atslēga." };
  const supabase = await createClient();
  const { error } = await supabase.from("site_content").delete().eq("key", key);
  if (error) return { error: error.message };
  await audit("delete", "content", key, { key });
  revalidatePath("/", "layout");
  return { ok: true };
}

/* ── Partneri (Mūsu draugi) ── */
export async function upsertPartner(
  id: string | null,
  d: { name: string; description: ML; url: string; sort_order: number; is_active: boolean },
) {
  const supabase = await createClient();
  const row = {
    name: d.name,
    description: d.description,
    url: d.url || null,
    sort_order: d.sort_order,
    is_active: d.is_active,
  };
  const { error } = id
    ? await supabase.from("site_partners").update(row).eq("id", id)
    : await supabase.from("site_partners").insert(row);
  if (error) return { error: error.message };
  await audit(id ? "update" : "create", "partner", id, row);
  revalidatePath("/", "layout");
  return { ok: true };
}
export async function deletePartner(id: string) {
  const supabase = await createClient();
  await supabase.from("site_partners").delete().eq("id", id);
  await audit("delete", "partner", id, null);
  revalidatePath("/", "layout");
}

/* ── Galerija (pasākumu bildes) ── */
export async function insertGalleryImages(
  items: { image_url: string; storage_path: string; category: string | null }[],
) {
  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("site_gallery")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  let n = (maxRow?.sort_order ?? -1) + 1;
  const rows = items.map((it) => ({
    image_url: it.image_url,
    storage_path: it.storage_path,
    category: it.category,
    sort_order: n++,
    is_active: true,
    is_featured: false,
  }));
  const { data, error } = await supabase.from("site_gallery").insert(rows).select("*");
  if (error) return { error: error.message };
  await audit("create", "gallery", null, { count: rows.length });
  revalidatePath("/", "layout");
  return { ok: true, rows: data };
}

export async function updateGalleryImage(
  id: string,
  d: { category: string | null; caption: ML; alt: ML; is_active: boolean; is_featured: boolean },
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_gallery")
    .update({
      category: d.category,
      caption: d.caption,
      alt: d.alt,
      is_active: d.is_active,
      is_featured: d.is_featured,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  await audit("update", "gallery", id, { id });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteGalleryImage(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_gallery")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (data?.storage_path)
    await supabase.storage.from("site-images").remove([data.storage_path]);
  await supabase.from("site_gallery").delete().eq("id", id);
  await audit("delete", "gallery", id, null);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function bulkGalleryCategory(ids: string[], category: string | null) {
  if (!ids.length) return { ok: true };
  const supabase = await createClient();
  const { error } = await supabase.from("site_gallery").update({ category }).in("id", ids);
  if (error) return { error: error.message };
  await audit("update", "gallery", null, { bulk: "category", count: ids.length });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function bulkGalleryActive(ids: string[], active: boolean) {
  if (!ids.length) return { ok: true };
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_gallery")
    .update({ is_active: active })
    .in("id", ids);
  if (error) return { error: error.message };
  await audit("update", "gallery", null, { bulk: "active", count: ids.length });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function bulkGalleryDelete(ids: string[]) {
  if (!ids.length) return { ok: true };
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_gallery")
    .select("storage_path")
    .in("id", ids);
  const paths = (data ?? [])
    .map((r: { storage_path: string }) => r.storage_path)
    .filter(Boolean);
  if (paths.length) await supabase.storage.from("site-images").remove(paths);
  await supabase.from("site_gallery").delete().in("id", ids);
  await audit("delete", "gallery", null, { bulk: "delete", count: ids.length });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function reorderGallery(ids: string[]) {
  const supabase = await createClient();
  for (let i = 0; i < ids.length; i++)
    await supabase.from("site_gallery").update({ sort_order: i }).eq("id", ids[i]);
  revalidatePath("/", "layout");
  return { ok: true };
}

/* ── Blogs ── */
export type BlogInput = {
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

export async function upsertBlogPost(id: string | null, d: BlogInput) {
  const supabase = await createClient();
  const ml = (s: string) => ({ lv: s ?? "" });
  if (!d.slug?.trim()) return { error: "Slug ir obligāts." };
  const row: Record<string, unknown> = {
    slug: d.slug.trim(),
    title: ml(d.title),
    excerpt: ml(d.excerpt),
    content: ml(d.content),
    meta_description: ml(d.meta_description),
    cover_url: d.cover_url || null,
    cover_alt: ml(d.cover_alt),
    gallery: d.gallery ?? [],
    category: d.category || null,
    tags: d.tags ?? [],
    related_products: d.related_products ?? [],
    social: d.social ?? null,
    status: d.status,
    ai_generated: d.ai_generated,
    edited_after_ai: d.edited_after_ai,
    updated_at: new Date().toISOString(),
  };
  if (d.status === "published") {
    if (d.published_at) {
      // Nākotnes datums = plānots (RLS rāda tikai, kad published_at <= now).
      row.published_at = d.published_at;
    } else if (id) {
      const { data: cur } = await supabase
        .from("blog_posts")
        .select("published_at")
        .eq("id", id)
        .maybeSingle();
      row.published_at = cur?.published_at ?? new Date().toISOString();
    } else {
      row.published_at = new Date().toISOString();
    }
  }
  const { data, error } = id
    ? await supabase.from("blog_posts").update(row).eq("id", id).select("id,slug").maybeSingle()
    : await supabase.from("blog_posts").insert(row).select("id,slug").maybeSingle();
  if (error) return { error: error.message };
  await audit(id ? "update" : "create", "blog", id, { slug: d.slug });
  revalidatePath("/", "layout");
  return { ok: true, id: data?.id as string, slug: data?.slug as string };
}

export async function deleteBlogPost(id: string) {
  const supabase = await createClient();
  await supabase.from("blog_posts").delete().eq("id", id);
  await audit("delete", "blog", id, null);
  revalidatePath("/", "layout");
  return { ok: true };
}

/* ── BUJ ── */
export async function upsertFaq(
  id: string | null,
  d: { category: string; question: ML; answer: ML; sort_order: number; is_published: boolean },
) {
  const supabase = await createClient();
  const row = {
    category: d.category,
    question: d.question,
    answer: d.answer,
    sort_order: d.sort_order,
    is_published: d.is_published,
  };
  const { error } = id
    ? await supabase.from("site_faqs").update(row).eq("id", id)
    : await supabase.from("site_faqs").insert(row);
  if (error) return { error: error.message };
  await audit(id ? "update" : "create", "faq", id, row);
  revalidatePath("/", "layout");
  return { ok: true };
}
export async function deleteFaq(id: string) {
  const supabase = await createClient();
  await supabase.from("site_faqs").delete().eq("id", id);
  await audit("delete", "faq", id, null);
  revalidatePath("/", "layout");
}

/* ── Hero mediji ── */
export type HeroMediaInput = {
  mp4?: string | null;
  webm?: string | null;
  poster?: string | null;
  image?: string | null;
};

export async function saveHeroMedia(pageKey: string, media: HeroMediaInput) {
  // Validācija: poster bez video nav atļauts.
  if (media.poster && !media.mp4) {
    return { error: "Poster bez video nav atļauts — pievieno MP4 vai noņem poster." };
  }
  const supabase = await createClient();
  const key = `hero.${pageKey}`;
  const value = {
    mp4: media.mp4 || null,
    webm: media.webm || null,
    poster: media.poster || null,
    image: media.image || null,
  };
  const { data: existing } = await supabase
    .from("site_content")
    .select("key")
    .eq("key", key)
    .maybeSingle();
  const { error } = existing
    ? await supabase
        .from("site_content")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key)
    : await supabase
        .from("site_content")
        .insert({ key, value, content_type: "media" });
  if (error) return { error: error.message };
  await audit("update", "hero", key, { key });
  revalidatePath("/", "layout");
  return { ok: true };
}
