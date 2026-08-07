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
