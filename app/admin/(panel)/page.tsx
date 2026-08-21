import { createClient } from "@/lib/supabase/server";
import InboxList, { type InboxItem } from "./inbox-list";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Aktīvie ienākošie (pirms-apstiprināšanas). Apstiprinātās rezervācijas →
// /admin/rezervacijas, arhīvs → /admin/arhivs; atrisinātie leadi (won/lost) →
// /admin/leads pilnajā skatā.
const SCOPE = ["new", "contacted", "quoted"];
const SOURCE_LABEL: Record<string, string> = {
  b2b: "Uzņēmums",
  pasvaldibam: "Pašvaldība",
  b2c: "Privātpersona",
};
const fmtDM = (d?: string | null) =>
  d ? `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(0, 4)}` : "";

export default async function AdminInboxPage() {
  const supabase = await createClient();

  // Apvienošana VAICĀJUMA līmenī — DB struktūra nemainās (divi select).
  const [{ data: bData }, { data: lData }] = await Promise.all([
    supabase
      .from("booking_requests")
      .select(
        "id, name, phone, email, event_date, event_type, status, created_at, estimated_total, final_total, delivery_cost",
      )
      .in("status", SCOPE)
      .order("created_at", { ascending: false }),
    supabase
      .from("leads")
      .select(
        "id, company, contact_person, email, phone, source, status, created_at, event_date",
      )
      .in("status", SCOPE)
      .order("created_at", { ascending: false }),
  ]);

  const bookings: InboxItem[] = (bData ?? []).map((r: any) => ({
    kind: "booking",
    id: r.id,
    created_at: r.created_at,
    status: r.status ?? "new",
    title: r.name,
    subtitle: [r.phone, r.email && r.email !== "-" ? r.email : null]
      .filter(Boolean)
      .join(" · "),
    meta: [fmtDM(r.event_date), r.event_type].filter(Boolean).join(" · "),
    href: `/admin/${r.id}`,
    amount: r.final_total ?? r.estimated_total ?? 0,
  }));

  const leads: InboxItem[] = (lData ?? []).map((r: any) => ({
    kind: "lead",
    id: r.id,
    created_at: r.created_at,
    status: r.status ?? "new",
    title: r.company,
    subtitle: [r.contact_person, r.phone].filter(Boolean).join(" · "),
    meta: [SOURCE_LABEL[r.source] ?? r.source, fmtDM(r.event_date)]
      .filter(Boolean)
      .join(" · "),
    href: `/admin/leads/${r.id}`,
    amount: null,
  }));

  // Apvieno + sakārto pēc created_at desc (neatkarīgi no tabulas).
  const items = [...bookings, ...leads].sort((a, b) =>
    a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0,
  );

  return <InboxList items={items} />;
}
