"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { InvoiceInput, PaymentType, PaymentStatus } from "./types";

async function audit(
  action: string,
  entity: string,
  entityId: string | null,
  changes: unknown,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.from("content_audit").insert({
    user_email: user?.email ?? "?",
    action,
    entity,
    entity_id: entityId,
    changes: changes as never,
  });
}

function toRow(d: InvoiceInput) {
  return {
    booking_request_id: d.booking_request_id,
    issue_date: d.issue_date,
    due_date: d.due_date || null,
    amount_net: d.amount_net,
    vat_rate: d.vat_rate,
    vat_amount: d.vat_amount,
    amount_total: d.amount_total,
    status: d.status,
    notes: d.notes.trim() || null,
  };
}

export async function createInvoice(d: InvoiceInput) {
  const supabase = await createClient();
  // invoice_number aizpilda DB trigeris (secīgs "YYYY-NNN").
  const { data, error } = await supabase
    .from("invoices")
    .insert(toRow(d))
    .select("id, invoice_number")
    .single();
  if (error) return { error: error.message };
  await audit("create", "invoice", data.id, {
    invoice_number: data.invoice_number,
  });
  revalidatePath("/admin/rekini");
  return { ok: true, id: data.id as string, invoice_number: data.invoice_number as string };
}

export async function updateInvoice(id: string, d: InvoiceInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("invoices")
    .update({ ...toRow(d), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  await audit("update", "invoice", id, { status: d.status });
  revalidatePath("/admin/rekini");
  revalidatePath(`/admin/rekini/${id}`);
  return { ok: true };
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) return { error: error.message };
  await audit("delete", "invoice", id, null);
  revalidatePath("/admin/rekini");
  return { ok: true };
}

export async function addPayment(d: {
  invoice_id: string;
  booking_request_id: string | null;
  amount: number;
  type: PaymentType;
  method: string;
  status: PaymentStatus;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("payments").insert({
    invoice_id: d.invoice_id,
    booking_request_id: d.booking_request_id,
    amount: d.amount,
    type: d.type,
    method: d.method.trim() || null,
    status: d.status,
    paid_at: d.status === "completed" ? new Date().toISOString() : null,
  });
  if (error) return { error: error.message };

  // Auto-paid: ja saņemto (completed) maksājumu summa ≥ rēķina kopsumma → 'paid'.
  const { data: inv } = await supabase
    .from("invoices")
    .select("amount_total, status")
    .eq("id", d.invoice_id)
    .single();
  if (inv && inv.status !== "paid" && inv.status !== "cancelled") {
    const { data: pays } = await supabase
      .from("payments")
      .select("amount")
      .eq("invoice_id", d.invoice_id)
      .eq("status", "completed");
    const sum = (pays ?? []).reduce((s, p) => s + Number(p.amount), 0);
    if (sum >= Number(inv.amount_total)) {
      await supabase
        .from("invoices")
        .update({ status: "paid", updated_at: new Date().toISOString() })
        .eq("id", d.invoice_id);
    }
  }

  await audit("create", "payment", d.invoice_id, { amount: d.amount });
  revalidatePath(`/admin/rekini/${d.invoice_id}`);
  revalidatePath("/admin/rekini");
  return { ok: true };
}

export async function setInvoicePdfUrl(id: string, path: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("invoices")
    .update({ pdf_url: path, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  await audit("update", "invoice", id, { pdf: path });
  revalidatePath(`/admin/rekini/${id}`);
  return { ok: true };
}

export async function deletePayment(id: string, invoice_id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) return { error: error.message };
  await audit("delete", "payment", id, { invoice_id });
  revalidatePath(`/admin/rekini/${invoice_id}`);
  return { ok: true };
}
