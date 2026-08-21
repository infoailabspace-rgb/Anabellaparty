import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BackButton from "@/components/admin/back-button";
import LeadDetail, { type LeadRow } from "./lead-detail";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const lead = data as any;

  // Atzīmē kā apskatītu
  if (!lead.viewed_at) {
    await supabase
      .from("leads")
      .update({ viewed_at: new Date().toISOString() })
      .eq("id", id)
      .is("viewed_at", null);
  }

  // Konvertētā rezervācija (ja ir) — saitei "Pārvērsts rezervācijā →".
  let converted: {
    id: string;
    name: string;
    event_date: string;
    status: string;
  } | null = null;
  if (lead.converted_booking_id) {
    const { data: b } = await supabase
      .from("booking_requests")
      .select("id, name, event_date, status")
      .eq("id", lead.converted_booking_id)
      .maybeSingle();
    if (b) converted = b as any;
  }

  const row: LeadRow = {
    id: lead.id,
    created_at: lead.created_at,
    source: lead.source ?? "b2b",
    company: lead.company ?? "",
    contact_person: lead.contact_person ?? "",
    role: lead.role ?? "",
    email: lead.email ?? "",
    phone: lead.phone ?? "",
    event_date: lead.event_date ?? "",
    event_location: lead.event_location ?? "",
    guest_count: lead.guest_count ?? "",
    interests: Array.isArray(lead.interests) ? lead.interests : [],
    needs_branding: Boolean(lead.needs_branding),
    description: lead.description ?? "",
    institution: lead.institution ?? "",
    procurement_id: lead.procurement_id ?? "",
    status: lead.status ?? "new",
    admin_notes: lead.admin_notes ?? "",
    converted_booking_id: lead.converted_booking_id ?? null,
  };

  return (
    <div>
      <BackButton fallback="/admin/leads" />
      <LeadDetail lead={row} converted={converted} />
    </div>
  );
}
