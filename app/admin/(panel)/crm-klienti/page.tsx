import { createClient } from "@/lib/supabase/server";
import CrmList from "./crm-list";
import type { ListRow } from "./types";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function CrmKlientiPage() {
  const supabase = await createClient();
  // Rezervāciju skaits caur FK embedded resursu (booking_requests.customer_id).
  const { data } = await supabase
    .from("customers")
    .select("*, booking_requests(count)")
    .order("created_at", { ascending: false });

  const rows: ListRow[] = (data ?? []).map((r: any) => ({
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
    created_at: r.created_at,
    booking_count: r.booking_requests?.[0]?.count ?? 0,
  }));

  return <CrmList rows={rows} />;
}
