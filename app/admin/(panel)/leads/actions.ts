"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export const LEAD_STATUSES: { id: string; label: string }[] = [
  { id: "new", label: "Jauns" },
  { id: "contacted", label: "Sazinājos" },
  { id: "quoted", label: "Piedāvājums nosūtīts" },
  { id: "won", label: "Iegūts" },
  { id: "lost", label: "Zaudēts" },
];

export async function setLeadStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("leads").update({ status }).eq("id", id);
  revalidatePath("/admin/leads");
}

export async function saveLeadNotes(id: string, notes: string) {
  const supabase = await createClient();
  await supabase.from("leads").update({ admin_notes: notes }).eq("id", id);
}

export async function markLeadViewed(id: string) {
  const supabase = await createClient();
  await supabase
    .from("leads")
    .update({ viewed_at: new Date().toISOString() })
    .eq("id", id)
    .is("viewed_at", null);
}

export async function deleteLead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/leads");
  return { ok: true };
}
