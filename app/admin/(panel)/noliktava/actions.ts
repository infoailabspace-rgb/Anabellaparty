"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MaterialInput = {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  notes: string;
};

export async function upsertMaterial(id: string | null, d: MaterialInput) {
  const name = d.name.trim();
  if (!name) return { error: "Nosaukums ir obligāts" };
  const supabase = await createClient();
  const row = {
    name,
    category: d.category.trim() || null,
    quantity: Number.isFinite(d.quantity) ? d.quantity : 0,
    unit: d.unit.trim() || null,
    min_quantity: Number.isFinite(d.min_quantity) ? d.min_quantity : 0,
    notes: d.notes.trim() || null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = id
    ? await supabase
        .from("inventory_materials")
        .update(row)
        .eq("id", id)
        .select("id")
        .single()
    : await supabase
        .from("inventory_materials")
        .insert(row)
        .select("id")
        .single();
  if (error) return { error: error.message };
  revalidatePath("/admin/noliktava");
  return { ok: true, id: (data?.id ?? id) as string };
}

export async function deleteMaterial(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("inventory_materials")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/noliktava");
  return { ok: true };
}
