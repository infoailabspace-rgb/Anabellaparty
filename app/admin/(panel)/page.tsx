import { createClient } from "@/lib/supabase/server";
import { getAllProducts } from "@/lib/catalog";
import type { Booking } from "@/lib/admin";
import BookingsTable from "./bookings-table";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function AdminBookingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("booking_requests")
    .select("*, payments(amount, status)")
    .order("event_date", { ascending: true });
  const products = await getAllProducts();

  const bookings: Booking[] = (data ?? []).map((r: any) => ({
    ...r,
    paid_sum: (r.payments ?? [])
      .filter((p: any) => p.status === "completed")
      .reduce((s: number, p: any) => s + Number(p.amount), 0),
  }));

  return <BookingsTable bookings={bookings} products={products} />;
}
