"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllProducts } from "@/lib/catalog";
import { computeQuote, type CartItem } from "@/lib/pricing";
import {
  confirmationHtml,
  sendReservationEmail,
  itemsDescription,
} from "@/lib/reservation-emails";
import { createEventForBooking, deleteEvent } from "@/lib/google-calendar";

export type ManualBookingInput = {
  name: string;
  email: string;
  phone: string;
  company: string;
  reg_nr: string;
  event_date: string;
  event_time: string;
  duration: string;
  event_type: string;
  guest_count: string;
  location: string;
  indoor_outdoor: string;
  description: string;
  items: CartItem[];
  delivery_cost: number;
  final_total: number | null;
  status: "new" | "confirmed";
};

export async function createManualBooking(d: ManualBookingInput) {
  const name = d.name.trim();
  if (!name) return { error: "Vārds/nosaukums ir obligāts" };
  if (!d.event_date) return { error: "Pasākuma datums ir obligāts" };

  const supabase = await createClient();
  // Cenu rēķina servera pusē (neuzticas klientam).
  const products = await getAllProducts();
  const quote = computeQuote(d.items || [], products);

  // Klienta sasaiste caur esošo SECURITY DEFINER RPC (dedup pēc e-pasta).
  let customerId: string | null = null;
  const email = d.email.trim();
  if (email) {
    const { data: cid } = await supabase.rpc("booking_link_customer", {
      p_email: email,
      p_name: name,
      p_phone: d.phone.trim() || null,
      p_company: d.company.trim() || null,
      p_reg_nr: d.reg_nr.trim() || null,
    });
    customerId = (cid as string | null) ?? null;
  }

  const guest = d.guest_count.trim() ? Number(d.guest_count) : null;
  const { data: inserted, error } = await supabase
    .from("booking_requests")
    .insert({
      name,
      phone: d.phone.trim() || "-",
      email: email || "-",
      company: d.company.trim() || null,
      reg_nr: d.reg_nr.trim() || null,
      event_date: d.event_date,
      event_time: d.event_time || null,
      duration: d.duration.trim() || null,
      event_type: d.event_type.trim() || "Pasākums",
      guest_count: Number.isFinite(guest as number) ? guest : null,
      location: d.location.trim() || "-",
      indoor_outdoor: d.indoor_outdoor || null,
      description: d.description.trim() || null,
      items: d.items ?? [],
      estimated_total: quote.subtotal,
      final_total: d.final_total,
      delivery_cost: d.delivery_cost || null,
      customer_id: customerId,
      status: "new",
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  const id = inserted.id as string;

  // Ja admin izvēlas 'confirmed' — izmanto setStatus (equipment_bookings +
  // apstiprinājuma e-pasts) konsekvencei.
  if (d.status === "confirmed") await setStatus(id, "confirmed");

  revalidatePath("/admin");
  revalidatePath("/admin/rezervacijas");
  return { ok: true, id };
}

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
  location: string | null;
  event_type: string | null;
  duration: string | null;
  google_event_id: string | null;
};

export async function setStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("booking_requests").update({ status }).eq("id", id);

  // Booking dati (vajadzīgi rezervācijai, tīrībai, e-pastam, kalendāram).
  const { data: b } = await supabase
    .from("booking_requests")
    .select(
      "event_date, event_time, items, name, email, location, event_type, duration, google_event_id",
    )
    .eq("id", id)
    .single();
  const booking = (b as BookingEmailRow | null) ?? null;
  const eventDate = booking?.event_date ?? null;
  const itemsArr = (Array.isArray(booking?.items) ? booking?.items : []) as {
    slug?: string;
  }[];
  const slugs = itemsArr
    .map((it) => it.slug)
    .filter((s): s is string => Boolean(s));

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

  // Google Calendar sinhronizācija (nav fatāla):
  //  - apstiprināts un vēl nav notikuma → izveido + saglabā google_event_id
  //  - vairs nav apstiprināts, bet notikums ir → dzēš + notīra id
  try {
    if (status === "confirmed" && booking && !booking.google_event_id) {
      const products = await getAllProducts();
      const ev = await createEventForBooking({
        name: booking.name,
        event_type: booking.event_type,
        event_date: booking.event_date,
        event_time: booking.event_time,
        duration: booking.duration,
        location: booking.location,
        itemsText: itemsDescription(itemsArr as CartItem[], products),
      });
      if (ev.id)
        await supabase
          .from("booking_requests")
          .update({ google_event_id: ev.id })
          .eq("id", id);
    } else if (status !== "confirmed" && booking?.google_event_id) {
      await deleteEvent(booking.google_event_id);
      await supabase
        .from("booking_requests")
        .update({ google_event_id: null })
        .eq("id", id);
    }
  } catch (e) {
    console.error(
      "[setStatus] kalendāra izņēmums:",
      e instanceof Error ? e.message : String(e),
    );
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
