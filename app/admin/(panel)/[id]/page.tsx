import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeQuote, computeDeposit } from "@/lib/pricing";
import { getAllProducts } from "@/lib/catalog";
import type { Booking } from "@/lib/admin";
import BookingDetail from "./booking-detail";

export const dynamic = "force-dynamic";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("booking_requests")
    .select("*, payments(amount, status)")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const b = data as Booking;
  b.paid_sum = ((data as { payments?: { amount: number; status: string }[] })
    .payments ?? [])
    .filter((p) => p.status === "completed")
    .reduce((s, p) => s + Number(p.amount), 0);

  // Atzīmē kā apskatītu
  if (!b.viewed_at) {
    await supabase
      .from("booking_requests")
      .update({ viewed_at: new Date().toISOString() })
      .eq("id", id);
  }

  const quote = computeQuote(b.items || [], await getAllProducts());
  const delivery = Number(b.delivery_cost) || 0;
  const deposit = computeDeposit(quote.subtotal, delivery);

  // Aprīkojuma pieejamība: konflikti ar citu apstiprinātu bookingu rezervācijām
  // tajā pašā datumā (advisory — nebloķē statusa maiņu).
  type Conflict = {
    slug: string;
    requested: number;
    reserved: number;
    quantity: number;
    available: number;
  };
  const { data: conflictData } = await supabase.rpc(
    "check_booking_availability",
    { p_booking_id: id },
  );
  const conflicts = (conflictData as Conflict[] | null) ?? [];
  const nameBySlug = new Map(quote.lines.map((l) => [l.slug, l.name]));

  // Saistītie rēķini (Fāze 3).
  const { data: invData } = await supabase
    .from("invoices")
    .select("id, invoice_number, amount_total, status, issue_date")
    .eq("booking_request_id", id)
    .order("issue_date", { ascending: false });
  const invoices = (invData ?? []) as {
    id: string;
    invoice_number: string;
    amount_total: number;
    status: string;
    issue_date: string;
  }[];
  const INV_STATUS_LV: Record<string, string> = {
    draft: "Melnraksts",
    sent: "Nosūtīts",
    paid: "Apmaksāts",
    overdue: "Nokavēts",
    cancelled: "Atcelts",
  };

  // Vai klienta ievadītā adrese un ģeokodētā būtiski atšķiras (mismatch).
  // Heiristika: normalizē (bez diakritikas), izmet pieturas/īsos/skaitļus, salīdzina
  // vārdu 4-zīmju saknes; ja nav kopīgas → iezīmē.
  const STOP = new Set(["iela", "latvia", "latvija", "novads", "novada", "ciems"]);
  const tokens = (s?: string | null) =>
    new Set(
      (s ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3 && !/^\d+$/.test(w) && !STOP.has(w)),
    );
  const custTok = tokens(b.delivery_address);
  const geoStems = new Set(
    [...tokens(b.delivery_geocoded)].map((w) => w.slice(0, 4)),
  );
  const deliveryMismatch = Boolean(
    b.delivery_address &&
      b.delivery_geocoded &&
      custTok.size > 0 &&
      geoStems.size > 0 &&
      ![...custTok].some((w) => geoStems.has(w.slice(0, 4))),
  );
  const mailSubject = encodeURIComponent(`Anabella Party — pieteikums ${b.event_date}`);

  return (
    <div>
      <Link href="/admin" className="text-sm text-gold hover:underline">
        ← Pieteikumi
      </Link>

      {conflicts.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-500/60 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold text-amber-300">
            ⚠ Aprīkojuma pieejamības konflikts ({b.event_date})
          </p>
          <ul className="mt-2 space-y-1 text-sm text-amber-200/90">
            {conflicts.map((c) => (
              <li key={c.slug}>
                <span className="font-semibold">
                  {nameBySlug.get(c.slug) ?? c.slug}
                </span>{" "}
                — jau rezervēts {c.reserved}/{c.quantity}, pieejams{" "}
                {c.available}, šis pieprasa {c.requested}.
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-amber-200/60">
            Rezervāciju rēķina no citiem “Apstiprināts” pieteikumiem tajā pašā
            datumā. Šis brīdinājums nebloķē — pārbaudi manuāli pirms apstiprini.
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Kontakti + darbības */}
          <section className="rounded-2xl border border-gold/25 bg-navy/30 p-6">
            <h1 className="font-display text-2xl font-bold">{b.name}</h1>
            {b.company && (
              <p className="text-sm text-text/60">
                {b.company}
                {b.reg_nr ? ` · ${b.reg_nr}` : ""}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={`tel:${b.phone}`} className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black">
                Zvanīt {b.phone}
              </a>
              <a href={`https://wa.me/${b.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-gold px-5 py-2 text-sm font-semibold text-gold">
                WhatsApp
              </a>
              <a
                href={`https://commandoai.app/Emails?to=${encodeURIComponent(b.email)}&subject=${mailSubject}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Rakstīt e-pastu caur CommandoAI (AI rediģēšana + sūtīšana no info@anabellaparty.lv)"
                className="rounded-full border border-gold/40 px-5 py-2 text-sm font-semibold text-text/80 hover:border-gold"
              >
                ✉ {b.email}
              </a>
            </div>
          </section>

          {/* Pasākums */}
          <section className="rounded-2xl border border-gold/25 bg-navy/30 p-6">
            <h2 className="font-display text-lg font-semibold text-gold">Pasākums</h2>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Row label="Datums" value={`${b.event_date}${b.event_time ? " " + b.event_time.slice(0, 5) : ""}`} />
              <Row label="Veids" value={b.event_type} />
              <Row label="Ilgums" value={b.duration ?? "—"} />
              <Row label="Viesi" value={b.guest_count != null ? String(b.guest_count) : "—"} />
              <Row label="Vieta" value={b.location} />
              <Row label="Telpās/ārā" value={b.indoor_outdoor ?? "—"} />
            </dl>

            {b.delivery_address && (
              <div className="mt-4 border-t border-gold/15 pt-4">
                <p className="text-sm font-semibold text-gold">Piegādes adrese</p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-text/50">
                      Klienta ievadītā
                    </p>
                    <p className="mt-1 text-sm text-text/90">
                      {b.delivery_address}
                    </p>
                  </div>
                  <div
                    className={
                      deliveryMismatch
                        ? "rounded-lg border border-amber-500/60 bg-amber-500/10 p-2"
                        : ""
                    }
                  >
                    <p className="text-xs uppercase tracking-wide text-text/50">
                      Ģeokodētā (ORS){deliveryMismatch ? " — ⚠ neatbilst" : ""}
                    </p>
                    <p className="mt-1 text-sm text-text/90">
                      {b.delivery_geocoded ?? "—"}
                    </p>
                    <p className="mt-1 font-mono text-sm text-gold">
                      {b.delivery_distance_km != null
                        ? `~${b.delivery_distance_km} km`
                        : "—"}{" "}
                      · {delivery > 0 ? `${delivery} €` : "bez maksas"}
                    </p>
                  </div>
                </div>
                {deliveryMismatch && (
                  <p className="mt-2 text-xs text-amber-300">
                    Klienta teksts un ģeokodētā adrese būtiski atšķiras —
                    pārbaudi km un cenu manuāli pirms piedāvājuma.
                  </p>
                )}
              </div>
            )}
            {b.description && (
              <p className="mt-4 whitespace-pre-wrap border-t border-gold/15 pt-4 text-sm text-text/80">
                {b.description}
              </p>
            )}
          </section>

          {/* Inventārs + cena */}
          <section className="rounded-2xl border border-gold/25 bg-navy/30 p-6">
            <h2 className="font-display text-lg font-semibold text-gold">Inventārs</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {quote.lines.map((l) => (
                <li key={l.slug} className="flex justify-between">
                  <span className="text-text/85">
                    {l.name} <span className="text-text/40">({l.tierLabel})</span>
                  </span>
                  <span className="font-mono text-gold">
                    {l.contactOnly ? "vienojoties" : `${l.lineTotal} €`}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 border-t border-gold/15 pt-3 text-sm">
              <div className="flex justify-between"><span>Inventārs</span><span className="font-mono">{quote.subtotal} €</span></div>
              <div className="flex justify-between text-text/70"><span>Piegāde{b.delivery_distance_km ? ` (${b.delivery_distance_km} km)` : ""}</span><span className="font-mono">{delivery > 0 ? `${delivery} €` : "bez maksas"}</span></div>
              <div className="flex justify-between font-semibold"><span>Kopā</span><span className="font-mono text-gold">{quote.subtotal + delivery} €</span></div>
              <div className="flex justify-between"><span>Avanss (50%)</span><span className="font-mono text-gold">{deposit} €</span></div>
              {b.final_total != null && (
                <div className="flex justify-between border-t border-gold/15 pt-2 font-semibold"><span>Galīgā summa</span><span className="font-mono text-gold">{b.final_total} €</span></div>
              )}
            </div>
          </section>

          {/* Rēķini un maksājumi */}
          <section className="rounded-2xl border border-gold/25 bg-navy/30 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-gold">
                Rēķini un maksājumi
              </h2>
              <Link
                href={`/admin/rekini/jauns?booking=${b.id}`}
                className="rounded-full border border-gold/40 px-3 py-1 text-xs text-gold hover:border-gold"
              >
                + Jauns rēķins
              </Link>
            </div>
            {invoices.length === 0 ? (
              <p className="mt-3 text-sm text-text/40">
                Nav rēķinu šim pieteikumam.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {invoices.map((iv) => (
                  <li key={iv.id}>
                    <Link
                      href={`/admin/rekini/${iv.id}`}
                      className="flex items-center justify-between rounded-lg border border-gold/15 bg-bg/40 p-3 hover:border-gold/40"
                    >
                      <span className="font-mono text-sm text-gold">
                        {iv.invoice_number}
                      </span>
                      <span className="text-xs text-text/60">
                        {INV_STATUS_LV[iv.status] ?? iv.status}
                      </span>
                      <span className="font-mono text-sm text-text/90">
                        {Number(iv.amount_total).toFixed(2)} €
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Rediģēšana */}
        <BookingDetail booking={b} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-text/40">{label}</dt>
      <dd className="text-text/90">{value}</dd>
    </div>
  );
}
