import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InvoiceDetail from "./invoice-detail";
import { pickIssuer } from "@/lib/invoice-issuer";
import type { InvoiceRow, PaymentRow } from "../types";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("invoices")
    .select(
      "*, booking_requests(name, email, phone, event_date, customers(name, type, address, company_reg_nr, company_vat_nr))",
    )
    .eq("id", id)
    .single();
  if (!data) notFound();
  const r = data as any;

  const invoice: InvoiceRow = {
    id: r.id,
    invoice_number: r.invoice_number,
    booking_request_id: r.booking_request_id,
    issue_date: r.issue_date,
    due_date: r.due_date,
    amount_net: Number(r.amount_net) || 0,
    vat_rate: Number(r.vat_rate) || 0,
    vat_amount: Number(r.vat_amount) || 0,
    amount_total: Number(r.amount_total) || 0,
    status: r.status ?? "draft",
    notes: r.notes ?? "",
    pdf_url: r.pdf_url ?? null,
  };

  const cust = r.booking_requests?.customers ?? null;
  const client = cust?.name || r.booking_requests?.name || null;

  // Izsniedzējs pēc klienta tipa (uzņēmums → SIA, privātpersona → Roberts).
  const issuer = pickIssuer(cust?.type ?? null);

  // Rēķina saņēmējs (klients) — prioritāte customers, citādi booking kontakti.
  const recipient = {
    name: client ?? "—",
    address: cust?.address ?? null,
    regNr: cust?.company_reg_nr ?? null,
    vatNr: cust?.company_vat_nr ?? null,
    email: cust ? null : (r.booking_requests?.email ?? null),
  };

  // Privāts PDF → signed URL (1h) tikai admina skatam.
  let pdfSignedUrl: string | null = null;
  if (r.pdf_url) {
    const { data: signed } = await supabase.storage
      .from("invoices")
      .createSignedUrl(r.pdf_url, 3600);
    pdfSignedUrl = signed?.signedUrl ?? null;
  }

  const { data: pData } = await supabase
    .from("payments")
    .select("id, amount, type, method, status, paid_at, created_at")
    .eq("invoice_id", id)
    .order("created_at", { ascending: false });
  const payments: PaymentRow[] = (pData ?? []).map((p: any) => ({
    id: p.id,
    amount: Number(p.amount) || 0,
    type: p.type,
    method: p.method,
    status: p.status ?? "pending",
    paid_at: p.paid_at,
    created_at: p.created_at,
  }));

  return (
    <InvoiceDetail
      invoice={invoice}
      client={client}
      payments={payments}
      issuer={issuer}
      recipient={recipient}
      pdfSignedUrl={pdfSignedUrl}
    />
  );
}
