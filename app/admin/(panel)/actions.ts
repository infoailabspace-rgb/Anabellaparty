"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function setStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("booking_requests").update({ status }).eq("id", id);
  revalidatePath("/admin");
  revalidatePath(`/admin/${id}`);
  revalidatePath("/admin/kalendars");
}

export async function saveNotes(id: string, notes: string) {
  const supabase = await createClient();
  await supabase
    .from("booking_requests")
    .update({ admin_notes: notes })
    .eq("id", id);
}

export async function setFinalTotal(id: string, final: number | null) {
  const supabase = await createClient();
  await supabase
    .from("booking_requests")
    .update({ final_total: final })
    .eq("id", id);
  revalidatePath(`/admin/${id}`);
}

export async function markViewed(id: string) {
  const supabase = await createClient();
  await supabase
    .from("booking_requests")
    .update({ viewed_at: new Date().toISOString() })
    .eq("id", id)
    .is("viewed_at", null);
}
