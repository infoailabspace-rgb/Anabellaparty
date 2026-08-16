"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllProducts } from "@/lib/catalog";
import type { CartItem } from "@/lib/pricing";
import { confirmationHtml, sendReservationEmail } from "@/lib/reservation-emails";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

type BookingEmailRow = {
  event_date: string;
  event_time: string | null;
  items: unknown;
  name: string | null;
  email: string | null;
};

export async function setStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("booking_requests").update({ status }).eq("id", id);

  // Booking produktu slug'i (vajadzīgi gan rezervācijai, gan tīrības statusam).
  let slugs: string[] = [];
  let eventDate: string | null = null;
  let booking: BookingEmailRow | null = null;
  if (status === "confirmed" || status === "completed") {
    const { data: b } = await supabase
      .from("booking_requests")
      .select("event_date, event_time, items, name, email")
      .eq("id", id)
      .single();
    booking = (b as BookingEmailRow | null) ?? null;
    eventDate = (b?.event_date as string) ?? null;
    const items = (Array.isArray(b?.items) ? b?.items : []) as { slug?: string }[];
    slugs = items.map((it) => it.slug).filter((s): s is string => Boolean(s));
  }

  // Aprīkojuma rezervācijas pastāv TIKAI kamēr status = 'confirmed'.
  // Vienmēr notīra esošās (idempotenti), pēc tam apstiprinātam booking izveido no jauna.
  await supabase.from("equipment_bookings").delete().eq("booking_request_id", id);
  if (status === "confirmed" && eventDate) {
    // CartItem = viens produkta eksemplārs (bez qty lauka) → quantity_reserved = 1.
    const rows = slugs.map((slug) => ({
      booking_request_id: id,
      product_slug: slug,
      quantity_reserved: 1,
      start_date: eventDate as string,
      end_date: eventDate as string,
    }));
    if (rows.length) await supabase.from("equipment_bookings").insert(rows);
  }

  // Pabeigts pasākums → attiecīgie produkti jātīra (cleaning_status = 'dirty').
  if (status === "completed" && slugs.length) {
    await supabase
      .from("products")
      .update({ cleaning_status: "dirty" })
      .in("slug", slugs);
    revalidatePath("/admin/tiriba");
  }

  // TŪLĪTĒJS apstiprinājuma e-pasts klientam (nav fatāls, ja neizdodas).
  if (status === "confirmed" && booking?.email) {
    try {
      const products = await getAllProducts();
      const html = confirmationHtml(
        {
          name: booking.name,
          event_date: booking.event_date,
          event_time: booking.event_time,
          items: (Array.isArray(booking.items) ? booking.items : []) as CartItem[],
        },
        products,
      );
      const res = await sendReservationEmail({
        to: booking.email,
        subject: `Rezervācija apstiprināta — ${booking.event_date} · Anabella Party`,
        html,
      });
      if (!res.ok) console.error("[setStatus] apstiprinājuma e-pasts:", res.error);
    } catch (e) {
      console.error(
        "[setStatus] apstiprinājuma e-pasta izņēmums:",
        e instanceof Error ? e.message : String(e),
      );
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/rezervacijas");
  revalidatePath("/admin/arhivs");
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
