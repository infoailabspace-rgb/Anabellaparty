"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// LEAD_STATUSES pārcelts uz ./constants — konstanti nedrīkst eksportēt no
// "use server" faila (klientā tā salūst par action-referenci).

export async function setLeadStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin");
  return { ok: true };
}

export type LeadUpdateInput = {
  company: string;
  contact_person: string;
  role: string;
  email: string;
  phone: string;
  event_date: string;
  event_location: string;
  guest_count: string;
  interests: string[];
  needs_branding: boolean;
  description: string;
  institution: string;
  procurement_id: string;
  source: string;
};

// Pilna lead rediģēšana (detaļu lapa). company/contact_person/email/phone ir
// NOT NULL — validē. Pārējie tukši → null.
export async function updateLead(id: string, d: LeadUpdateInput) {
  const company = d.company.trim();
  const contact = d.contact_person.trim();
  const email = d.email.trim();
  const phone = d.phone.trim();
  if (!company) return { error: "Uzņēmums / iestāde ir obligāts." };
  if (!contact) return { error: "Kontaktpersona ir obligāta." };
  if (!email) return { error: "E-pasts ir obligāts." };
  if (!phone) return { error: "Tālrunis ir obligāts." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({
      company,
      contact_person: contact,
      role: d.role.trim() || null,
      email,
      phone,
      event_date: d.event_date.trim() || null,
      event_location: d.event_location.trim() || null,
      guest_count: d.guest_count.trim() || null,
      interests: d.interests ?? [],
      needs_branding: d.needs_branding,
      description: d.description.trim() || null,
      institution: d.institution.trim() || null,
      procurement_id: d.procurement_id.trim() || null,
      source: d.source,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function saveLeadNotes(id: string, notes: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ admin_notes: notes })
    .eq("id", id);
  if (error) return { error: error.message };
  return { ok: true };
}

export async function markLeadViewed(id: string) {
  const supabase = await createClient();
  await supabase
    .from("leads")
    .update({ viewed_at: new Date().toISOString() })
    .eq("id", id)
    .is("viewed_at", null);
}

export async function deleteLead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { ok: true };
}
