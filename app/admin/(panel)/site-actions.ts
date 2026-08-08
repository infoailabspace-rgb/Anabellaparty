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
const PAGE_IMAGE_KEYS = ["about.photo", "og.fallback"];

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
