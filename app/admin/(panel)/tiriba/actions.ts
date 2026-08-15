"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CleaningStatus = "cleaned" | "dirty" | "broken" | null;

export async function setCleaningStatus(id: string, status: CleaningStatus) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ cleaning_status: status })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/tiriba");
  return { ok: true };
}

export async function saveCleaningNotes(id: string, notes: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ cleaning_notes: notes.trim() || null })
    .eq("id", id);
  if (error) return { error: error.message };
  return { ok: true };
}
