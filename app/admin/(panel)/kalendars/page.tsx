import { createClient } from "@/lib/supabase/server";
import type { Booking } from "@/lib/admin";
import Calendar from "./calendar";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function CalendarPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("booking_requests")
    .select("*, payments(amount, status)")
    .order("event_date", { ascending: true });

  const bookings: Booking[] = (data ?? []).map((r: any) => ({
    ...r,
    paid_sum: (r.payments ?? [])
      .filter((p: any) => p.status === "completed")
      .reduce((s: number, p: any) => s + Number(p.amount), 0),
  }));

  return <Calendar bookings={bookings} />;
}
