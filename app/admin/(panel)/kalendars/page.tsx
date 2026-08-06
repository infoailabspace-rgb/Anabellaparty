import { createClient } from "@/lib/supabase/server";
import type { Booking } from "@/lib/admin";
import Calendar from "./calendar";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("booking_requests")
    .select("*")
    .order("event_date", { ascending: true });

  return <Calendar bookings={(data ?? []) as Booking[]} />;
}
