import { createClient } from "@/lib/supabase/server";
import { getAllProducts } from "@/lib/catalog";
import type { Booking } from "@/lib/admin";
import BookingsTable from "./bookings-table";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("booking_requests")
    .select("*")
    .order("event_date", { ascending: true });
  const products = await getAllProducts();

  return (
    <BookingsTable bookings={(data ?? []) as Booking[]} products={products} />
  );
}
