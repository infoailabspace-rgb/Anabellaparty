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

  // Aprīkojuma rezervācijas pastāv TIKAI kamēr status = 'confirmed'.
  // Vienmēr notīra esošās (idempotenti), pēc tam apstiprinātam booking izveido no jauna.
  await supabase.from("equipment_bookings").delete().eq("booking_request_id", id);
  if (status === "confirmed") {
    const { data: b } = await supabase
      .from("booking_requests")
      .select("event_date, items")
      .eq("id", id)
      .single();
    // CartItem = viens produkta eksemplārs (bez qty lauka) → quantity_reserved = 1.
    const items = (Array.isArray(b?.items) ? b?.items : []) as { slug?: string }[];
    const rows = items
      .filter((it) => it.slug)
      .map((it) => ({
        booking_request_id: id,
        product_slug: it.slug as string,
        quantity_reserved: 1,
        start_date: b!.event_date as string,
        end_date: b!.event_date as string,
      }));
    if (rows.length) await supabase.from("equipment_bookings").insert(rows);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/${id}`);
  revalidatePath("/admin/kalendars");
}

export async function deleteBooking(id: string) {
  const supabase = await createClient();
  // Papildu aizsardzība (RLS jau prasa is_admin, bet dzēšana ir neatgriezeniska).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nav autorizēts." };
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return { error: "Nav piekļuves." };

  const { error } = await supabase
    .from("booking_requests")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/kalendars");
  return { ok: true };
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
