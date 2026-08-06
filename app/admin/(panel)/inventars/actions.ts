"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
  name: string; // nosaukums netulko (SPOGULIS/OZOLS u.c.)
  tagline: ML;
  description: ML;
  includes: MLArr;
  tiers: { duration: string; price: number; note?: string }[];
  hourly_extra: number | null;
  add_ons: { name: string; price: number; unit?: string }[];
  contact_only: boolean;
  specs: { label: string; value: string }[];
  alt_phone: string | null;
  is_active: boolean;
  is_featured: boolean;
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

function toRow(p: ProductInput) {
  const inc = {
    lv: cleanArr(p.includes.lv),
    en: cleanArr(p.includes.en),
    ru: cleanArr(p.includes.ru),
  };
  const hasInc = inc.lv.length || inc.en.length || inc.ru.length;
  return {
    slug: p.slug.trim(),
    category: p.category,
    name: { lv: p.name },
    tagline: { lv: p.tagline.lv, en: p.tagline.en, ru: p.tagline.ru },
    description: { lv: p.description.lv, en: p.description.en, ru: p.description.ru },
    includes: hasInc ? inc : null,
    tiers: p.tiers.filter((t) => t.duration),
    hourly_extra: p.hourly_extra,
    add_ons: p.add_ons.filter((a) => a.name).length
      ? p.add_ons.filter((a) => a.name)
      : null,
    contact_only: p.contact_only,
    specs: p.specs.filter((s) => s.label).length
      ? p.specs.filter((s) => s.label)
      : null,
    alt_phone: p.alt_phone || null,
    is_active: p.is_active,
    is_featured: p.is_featured,
    cover_image: p.cover_image || null,
    gallery: p.gallery,
    updated_at: new Date().toISOString(),
  };
}

export async function saveProduct(id: string | null, data: ProductInput) {
  const supabase = await createClient();
  if (!data.slug.trim()) return { error: "Trūkst slug." };
  if (!data.name.trim()) return { error: "Trūkst nosaukuma." };

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
