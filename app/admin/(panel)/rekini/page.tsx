import { createClient } from "@/lib/supabase/server";
import InvoicesList from "./invoices-list";
import type { ListRow } from "./types";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function RekiniPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, issue_date, amount_total, status, booking_requests(name, customers(name))",
    )
    .order("issue_date", { ascending: false });

  const rows: ListRow[] = (data ?? []).map((r: any) => ({
    id: r.id,
    invoice_number: r.invoice_number,
    issue_date: r.issue_date,
    amount_total: Number(r.amount_total) || 0,
    status: r.status ?? "draft",
    client:
      r.booking_requests?.customers?.name ||
      r.booking_requests?.name ||
      "—",
  }));

  return <InvoicesList rows={rows} />;
}
