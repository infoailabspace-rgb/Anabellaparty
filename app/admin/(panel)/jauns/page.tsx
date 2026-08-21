import { createClient } from "@/lib/supabase/server";
import { getAllProducts } from "@/lib/catalog";
import NewBookingForm, { type Prefill } from "./new-booking-form";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
const SOURCE_LABEL: Record<string, string> = {
  b2b: "uzņēmums",
  pasvaldibam: "pašvaldība",
  b2c: "privātpersona",
};

// Strikts datuma parsings — NEKAD neuzmini. Tikai viennozīmīgs PILNS datums
// (YYYY-MM-DD vai DD.MM.YYYY / DD/MM/YYYY, kas ir reāls datums). Viss cits
// (diapazoni "22.-23.12", vārdi "decembra vidū", "vēl nezinām") → tukšs lauks +
// oriģināls redzams blakus. Nepareizs datums ir sliktāks par tukšu.
function parseLeadDate(raw: string): { date: string; original: string } {
  const s = (raw ?? "").trim();
  if (!s) return { date: "", original: "" };
  let iso = "";
  let m: RegExpMatchArray | null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) iso = s;
  else if ((m = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/))) {
    iso = `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  if (iso) {
    const dt = new Date(iso + "T00:00:00Z");
    if (!Number.isNaN(dt.getTime()) && dt.toISOString().slice(0, 10) === iso)
      return { date: iso, original: "" };
  }
  return { date: "", original: s };
}

// Viesu skaits — pirmais skaitlis (diapazonam zemākais: "150-200" → 150,
// "ap 150" → 150). Oriģinālu saglabā konteksta blokā, ja tas nav tīrs skaitlis.
function parseGuests(raw: string): { count: string; original: string } {
  const s = (raw ?? "").trim();
  if (!s) return { count: "", original: "" };
  const m = s.match(/\d+/);
  const count = m ? m[0] : "";
  return { count, original: count && count === s ? "" : s };
}

export default async function NewBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string }>;
}) {
  const { lead: leadId } = await searchParams;
  const supabase = await createClient();
  const products = await getAllProducts();
  const { data: cData } = await supabase
    .from("customers")
    .select("id, name, email, phone")
    .order("name", { ascending: true });
  const customers = (cData ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    email: c.email ?? "",
    phone: c.phone ?? "",
  }));

  let prefill: Prefill | undefined;
  if (leadId) {
    const { data: lead } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .maybeSingle();
    if (lead) {
      const dateInfo = parseLeadDate(lead.event_date ?? "");
      const guestInfo = parseGuests(lead.guest_count ?? "");
      const interests: string[] = Array.isArray(lead.interests)
        ? lead.interests
        : [];
      // Konteksta bloks aprakstā — nekas no lead nepazūd, arī lauki bez
      // tiešas booking atbilstības.
      const ctx: string[] = [
        `No B2B pieprasījuma (${SOURCE_LABEL[lead.source] ?? lead.source}).`,
      ];
      if (interests.length) ctx.push(`Interesē: ${interests.join(", ")}.`);
      if (lead.needs_branding) ctx.push("Brendēšana ar logo: jā.");
      if (lead.role) ctx.push(`Amats: ${lead.role}.`);
      if (lead.institution) ctx.push(`Iestāde: ${lead.institution}.`);
      if (lead.procurement_id) ctx.push(`Iepirkuma ID: ${lead.procurement_id}.`);
      if (dateInfo.original) ctx.push(`Datums (norādīts): ${dateInfo.original}.`);
      if (guestInfo.original)
        ctx.push(`Viesu skaits (norādīts): ${guestInfo.original}.`);
      const description = [lead.description, ctx.join(" ")]
        .filter(Boolean)
        .join("\n\n");

      prefill = {
        leadId,
        name: lead.contact_person ?? "",
        email: lead.email ?? "",
        phone: lead.phone ?? "",
        company: lead.company ?? "",
        eventDate: dateInfo.date,
        dateHint: dateInfo.original,
        guestCount: guestInfo.count,
        location: lead.event_location ?? "",
        description,
      };
    }
  }

  return (
    <NewBookingForm products={products} customers={customers} prefill={prefill} />
  );
}
