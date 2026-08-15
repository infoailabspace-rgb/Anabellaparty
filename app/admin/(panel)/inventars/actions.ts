"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Slug VIENMĒR ASCII-only (arī manuālai ievadei) — novērš diakritiku URL-os un
// nesakritības. Server-puse ir vienīgais patiesības avots.
function slugify(s: string) {
  const map: Record<string, string> = {
    ā: "a", č: "c", ē: "e", ģ: "g", ī: "i", ķ: "k", ļ: "l", ņ: "n",
    š: "s", ū: "u", ž: "z",
  };
  return (s ?? "")
    .toLowerCase()
    .replace(/[āčēģīķļņšūž]/g, (c) => map[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const CATEGORY_PATH: Record<string, string> = {
  "foto-kaste": "/foto-kaste",
  atrakcijas: "/piepusamas-atrakcijas",
  "audio-video": "/svinibu-inventars/audio-viesu-gramatas",
  specefekti: "/svinibu-inventars/specefekti",
  deco: "/svinibu-inventars/decomebeles",
  kubli: "/svinibu-inventars/kublsballa",
};

export type ML = { lv: string; en: string; ru: string };
export type MLArr = { lv: string[]; en: string[]; ru: string[] };

export type ProductInput = {
  slug: string;
  category: string;
  name: ML;
  tagline: ML;
  description: ML;
  includes: MLArr;
  tiers: { duration: ML; price: number; note?: ML }[];
  hourly_extra: number | null;
  add_ons: { name: ML; price: number; unit?: ML }[];
  contact_only: boolean;
  specs: { label: ML; value: ML }[];
  alt_phone: string | null;
  quantity: number;
  is_active: boolean;
  is_featured: boolean;
  is_special: boolean;
  cover_image: string;
  gallery: string[];
};

function revalidateAll(category: string) {
  if (CATEGORY_PATH[category]) revalidatePath(CATEGORY_PATH[category]);
  revalidatePath("/rezervet");
  revalidatePath("/svinibu-inventars");
}

async function audit(
  action: string,
  entityId: string | null,
  changes: unknown,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.from("content_audit").insert({
    user_email: user?.email ?? "?",
    action,
    entity: "product",
    entity_id: entityId,
    changes: changes as never,
  });
}

function cleanArr(a: string[]) {
  return (a ?? []).map((s) => s.trim()).filter(Boolean);
}
// ML ir "tukšs", ja visas valodas tukšas.
const mlEmpty = (m: ML) => !m.lv.trim() && !m.en.trim() && !m.ru.trim();

function toRow(p: ProductInput) {
  const inc = {
    lv: cleanArr(p.includes.lv),
    en: cleanArr(p.includes.en),
    ru: cleanArr(p.includes.ru),
  };
  const hasInc = inc.lv.length || inc.en.length || inc.ru.length;
  const tiers = p.tiers
    .filter((t) => !mlEmpty(t.duration))
    .map((t) => ({
      duration: t.duration,
      price: t.price,
      ...(t.note && !mlEmpty(t.note) ? { note: t.note } : {}),
    }));
  const addOns = p.add_ons
    .filter((a) => !mlEmpty(a.name))
    .map((a) => ({
      name: a.name,
      price: a.price,
      ...(a.unit && !mlEmpty(a.unit) ? { unit: a.unit } : {}),
    }));
  const specs = p.specs
    .filter((s) => !mlEmpty(s.label))
    .map((s) => ({ label: s.label, value: s.value }));
  return {
    slug: slugify(p.slug),
    category: p.category,
    name: p.name,
    tagline: { lv: p.tagline.lv, en: p.tagline.en, ru: p.tagline.ru },
    description: { lv: p.description.lv, en: p.description.en, ru: p.description.ru },
    includes: hasInc ? inc : null,
    tiers,
    hourly_extra: p.hourly_extra,
    add_ons: addOns.length ? addOns : null,
    contact_only: p.contact_only,
    specs: specs.length ? specs : null,
    alt_phone: p.alt_phone || null,
    quantity: Number.isFinite(p.quantity) && p.quantity > 0 ? Math.floor(p.quantity) : 1,
    is_active: p.is_active,
    is_featured: p.is_featured,
    is_special: p.is_special,
    cover_image: p.cover_image || null,
    gallery: p.gallery,
    updated_at: new Date().toISOString(),
  };
}

export async function saveProduct(id: string | null, data: ProductInput) {
  const supabase = await createClient();
  if (!data.slug.trim()) return { error: "Trūkst slug." };
  if (!data.name.lv.trim()) return { error: "Trūkst nosaukuma (LV)." };

  const row = toRow(data);

  if (id) {
    const { error } = await supabase.from("products").update(row).eq("id", id);
    if (error) return { error: error.message };
    await audit("update", id, row);
  } else {
    // slug unikalitāte
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", row.slug)
      .maybeSingle();
    if (existing) return { error: "Šāds slug jau eksistē." };
    const { error } = await supabase.from("products").insert(row);
    if (error) return { error: error.message };
    await audit("create", row.slug, row);
  }
  revalidateAll(data.category);
  revalidatePath("/admin/inventars");
  return { ok: true };
}

export async function toggleActive(id: string, active: boolean, category: string) {
  const supabase = await createClient();
  await supabase.from("products").update({ is_active: active }).eq("id", id);
  await audit("update", id, { is_active: active });
  revalidateAll(category);
  revalidatePath("/admin/inventars");
}

export async function deleteProduct(id: string, slug: string, category: string) {
  const supabase = await createClient();
  // Ja produkts ir kādā pieteikumā — nedzēš.
  const { count } = await supabase
    .from("booking_requests")
    .select("*", { count: "exact", head: true })
    .filter("items", "cs", JSON.stringify([{ slug }]));
  if ((count ?? 0) > 0) {
    return {
      error: `Šis produkts ir ${count} pieteikumos. Vari to deaktivizēt, bet ne dzēst.`,
    };
  }
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  await audit("delete", id, { slug });
  revalidateAll(category);
  revalidatePath("/admin/inventars");
  return { ok: true };
}
