"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CustomerRow } from "./types";

async function audit(
  action: string,
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
    entity: "customer",
    entity_id: entityId,
    changes: changes as never,
  });
}

export async function upsertCustomer(
  id: string | null,
  d: Omit<CustomerRow, "id">,
) {
  const name = d.name.trim();
  if (!name) return { error: "Nosaukums ir obligāts" };

  const supabase = await createClient();
  const row = {
    name,
    type: d.type,
    email: d.email.trim() || null,
    phone: d.phone.trim() || null,
    address: d.address.trim() || null,
    contact_person: d.contact_person.trim() || null,
    company_reg_nr: d.company_reg_nr.trim() || null,
    company_vat_nr: d.company_vat_nr.trim() || null,
    segment: d.segment,
    discount_percent: Number.isFinite(d.discount_percent)
      ? d.discount_percent
      : 0,
    notes: d.notes.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = id
    ? await supabase.from("customers").update(row).eq("id", id).select("id").single()
    : await supabase.from("customers").insert(row).select("id").single();
  if (error) return { error: error.message };

  await audit(id ? "update" : "create", (data?.id ?? id) as string, { name });
  revalidatePath("/admin/crm-klienti");
  if (id) revalidatePath(`/admin/crm-klienti/${id}`);
  return { ok: true, id: (data?.id ?? id) as string };
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) return { error: error.message };
  await audit("delete", id, null);
  revalidatePath("/admin/crm-klienti");
  return { ok: true };
}
