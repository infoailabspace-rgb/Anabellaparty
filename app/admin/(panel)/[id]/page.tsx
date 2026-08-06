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
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const b = data as Booking;

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
  const mailSubject = encodeURIComponent(`Anabella Party — pieteikums ${b.event_date}`);

  return (
    <div>
      <Link href="/admin" className="text-sm text-gold hover:underline">
        ← Pieteikumi
      </Link>

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
              <a href={`mailto:${b.email}?subject=${mailSubject}`} className="rounded-full border border-gold/40 px-5 py-2 text-sm font-semibold text-text/80">
                {b.email}
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
              {b.delivery_address && (
                <Row label="Piegādes adrese" value={`${b.delivery_address}${b.delivery_distance_km ? ` (~${b.delivery_distance_km} km)` : ""}`} />
              )}
            </dl>
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
