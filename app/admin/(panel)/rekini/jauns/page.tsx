import { createClient } from "@/lib/supabase/server";
import InvoiceCreate from "./invoice-create";
import type { BookingOption } from "../types";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const { booking } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("booking_requests")
    .select(
      "id, event_date, event_type, name, estimated_total, final_total, delivery_cost, customers(name)",
    )
    .order("event_date", { ascending: false })
    .limit(300);

  const bookings: BookingOption[] = (data ?? []).map((b: any) => {
    // amount_net = final_total, citādi estimated_total + delivery_cost.
    const net =
      b.final_total != null
        ? Number(b.final_total)
        : (Number(b.estimated_total) || 0) + (Number(b.delivery_cost) || 0);
    const who = b.customers?.name || b.name || "—";
    return {
      id: b.id,
      label: `${b.event_date} · ${who} · ${b.event_type}`,
      amount_net: Math.round(net * 100) / 100,
    };
  });

  return <InvoiceCreate bookings={bookings} preselect={booking ?? null} />;
}
