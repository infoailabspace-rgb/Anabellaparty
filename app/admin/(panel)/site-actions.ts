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

/* ── Saturs ── */
export async function saveContent(key: string, valueLv: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_content")
    .update({ value: { lv: valueLv }, updated_at: new Date().toISOString() })
    .eq("key", key);
  if (error) return { error: error.message };
  await audit("update", "content", key, { key });
  revalidatePath("/");
  revalidatePath("/kontakti");
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
  revalidatePath("/");
  return { ok: true };
}
export async function deleteTestimonial(id: string) {
  const supabase = await createClient();
  await supabase.from("site_testimonials").delete().eq("id", id);
  await audit("delete", "testimonial", id, null);
  revalidatePath("/");
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
  revalidatePath("/");
  return { ok: true };
}
export async function deleteClient(id: string) {
  const supabase = await createClient();
  await supabase.from("site_clients").delete().eq("id", id);
  await audit("delete", "client", id, null);
  revalidatePath("/");
}

/* ── BUJ ── */
export async function upsertFaq(
  id: string | null,
  d: { category: string; question: string; answer: string; sort_order: number; is_published: boolean },
) {
  const supabase = await createClient();
  const row = {
    category: d.category,
    question: { lv: d.question },
    answer: { lv: d.answer },
    sort_order: d.sort_order,
    is_published: d.is_published,
  };
  const { error } = id
    ? await supabase.from("site_faqs").update(row).eq("id", id)
    : await supabase.from("site_faqs").insert(row);
  if (error) return { error: error.message };
  await audit(id ? "update" : "create", "faq", id, row);
  revalidatePath("/faq");
  return { ok: true };
}
export async function deleteFaq(id: string) {
  const supabase = await createClient();
  await supabase.from("site_faqs").delete().eq("id", id);
  await audit("delete", "faq", id, null);
  revalidatePath("/faq");
}
