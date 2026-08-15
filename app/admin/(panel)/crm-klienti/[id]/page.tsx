import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CrmDetail from "../crm-detail";
import type { CustomerRow, BookingLite } from "../types";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function CustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();
  if (!data) notFound();
  const r = data as any;

  const customer: CustomerRow = {
    id: r.id,
    name: r.name,
    type: r.type ?? "person",
    email: r.email ?? "",
    phone: r.phone ?? "",
    address: r.address ?? "",
    contact_person: r.contact_person ?? "",
    company_reg_nr: r.company_reg_nr ?? "",
    company_vat_nr: r.company_vat_nr ?? "",
    segment: r.segment ?? "new",
    discount_percent: Number(r.discount_percent) || 0,
    notes: r.notes ?? "",
  };

  const { data: bData } = await supabase
    .from("booking_requests")
    .select("id, event_date, event_type, status, estimated_total, final_total")
    .eq("customer_id", id)
    .order("event_date", { ascending: false });

  const bookings: BookingLite[] = (bData ?? []).map((b: any) => ({
    id: b.id,
    event_date: b.event_date,
    event_type: b.event_type,
    status: b.status ?? "new",
    estimated_total: b.estimated_total,
    final_total: b.final_total,
  }));

  return <CrmDetail customer={customer} bookings={bookings} />;
}
