"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { computeQuote, type CartItem } from "@/lib/pricing";
import type { Product } from "@/lib/products";
import type { Booking } from "@/lib/admin";
import { updateBooking } from "../actions";

type Line = { slug: string; tierIndex: number; qty: number };

const field =
  "w-full rounded-lg border border-gold/25 bg-navy/40 px-3 py-2 text-sm text-text outline-none focus:border-gold";
const label = "block text-xs uppercase tracking-wide text-text/50";
const eur = (n: number) => `${Number(n || 0).toFixed(0)} €`;
const clean = (v: string | null | undefined) => (v && v !== "-" ? v : "");

function itemsToLines(items: CartItem[]): Line[] {
  const map = new Map<string, Line>();
  for (const it of items || []) {
    if (!it?.slug) continue;
    const key = `${it.slug}|${it.tierIndex ?? 0}`;
    const ex = map.get(key);
    if (ex) ex.qty += 1;
    else map.set(key, { slug: it.slug, tierIndex: it.tierIndex ?? 0, qty: 1 });
  }
  return [...map.values()];
}

export default function EditBookingForm({
  booking,
  products,
}: {
  booking: Booking;
  products: Product[];
}) {
  const router = useRouter();

  const [name, setName] = useState(booking.name ?? "");
  const [email, setEmail] = useState(clean(booking.email));
  const [phone, setPhone] = useState(clean(booking.phone));
  const [company, setCompany] = useState(booking.company ?? "");
  const [regNr, setRegNr] = useState(booking.reg_nr ?? "");

  const [eventDate, setEventDate] = useState(booking.event_date ?? "");
  const [eventTime, setEventTime] = useState(
    booking.event_time ? booking.event_time.slice(0, 5) : "",
  );
  const [duration, setDuration] = useState(booking.duration ?? "");
  const [eventType, setEventType] = useState(booking.event_type ?? "");
  const [guestCount, setGuestCount] = useState(
    booking.guest_count != null ? String(booking.guest_count) : "",
  );
  const [location, setLocation] = useState(clean(booking.location));
  const [indoorOutdoor, setIndoorOutdoor] = useState(booking.indoor_outdoor ?? "");
  const [description, setDescription] = useState(booking.description ?? "");

  const [lines, setLines] = useState<Line[]>(itemsToLines(booking.items || []));
  const [deliveryCost, setDeliveryCost] = useState(
    booking.delivery_cost != null ? String(booking.delivery_cost) : "0",
  );
  const [deliveryKm, setDeliveryKm] = useState(
    booking.delivery_distance_km != null ? String(booking.delivery_distance_km) : "",
  );
  const [finalTotal, setFinalTotal] = useState(
    booking.final_total != null ? String(booking.final_total) : "",
  );

  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const bySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);

  const items: CartItem[] = useMemo(
    () =>
      lines.flatMap((l) =>
        l.slug
          ? Array.from({ length: Math.max(1, l.qty) }, () => ({
              slug: l.slug,
              tierIndex: l.tierIndex,
              extraHours: 0,
              addOns: {},
            }))
          : [],
      ),
    [lines],
  );
  const quote = useMemo(() => {
    try {
      return computeQuote(items, products);
    } catch {
      return computeQuote([], products);
    }
  }, [items, products]);
  const grandTotal =
    (finalTotal.trim() ? Number(finalTotal) : quote.subtotal) +
    (Number(deliveryCost) || 0);

  const addLine = () => setLines((l) => [...l, { slug: "", tierIndex: 0, qty: 1 }]);
  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((l) => l.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const removeLine = (i: number) => setLines((l) => l.filter((_, j) => j !== i));

  function save() {
    if (!name.trim()) return setMsg("Vārds/nosaukums ir obligāts");
    if (!eventDate) return setMsg("Pasākuma datums ir obligāts");
    setMsg("");
    start(async () => {
      const res = await updateBooking(booking.id, {
        name,
        phone,
        email,
        company,
        reg_nr: regNr,
        event_date: eventDate,
        event_time: eventTime,
        duration,
        event_type: eventType,
        guest_count: guestCount,
        location,
        indoor_outdoor: indoorOutdoor,
        description,
        items,
        final_total: finalTotal.trim() ? Number(finalTotal) : null,
        delivery_cost: Number(deliveryCost) || 0,
        delivery_distance_km: deliveryKm.trim() ? Number(deliveryKm) : null,
      });
      if (res?.error) return setMsg(res.error);
      setMsg("Saglabāts ✓");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Kontakts */}
      <section className="rounded-2xl border border-gold/25 bg-navy/30 p-6">
        <h2 className="mb-3 font-display text-lg font-semibold text-gold">Kontakts</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={label}>Vārds / uzņēmums *</label><input value={name} onChange={(e) => setName(e.target.value)} className={`${field} mt-1`} /></div>
          <div><label className={label}>E-pasts</label><input value={email} onChange={(e) => setEmail(e.target.value)} className={`${field} mt-1`} /></div>
          <div><label className={label}>Telefons</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className={`${field} mt-1`} /></div>
          <div><label className={label}>Uzņēmums</label><input value={company} onChange={(e) => setCompany(e.target.value)} className={`${field} mt-1`} /></div>
          <div><label className={label}>Reģ. Nr.</label><input value={regNr} onChange={(e) => setRegNr(e.target.value)} className={`${field} mt-1`} /></div>
        </div>
      </section>

      {/* Pasākums */}
      <section className="rounded-2xl border border-gold/25 bg-navy/30 p-6">
        <h2 className="mb-3 font-display text-lg font-semibold text-gold">Pasākums</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={label}>Datums *</label><input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={`${field} mt-1`} /></div>
          <div><label className={label}>Laiks</label><input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className={`${field} mt-1`} /></div>
          <div><label className={label}>Ilgums</label><input value={duration} onChange={(e) => setDuration(e.target.value)} className={`${field} mt-1`} /></div>
          <div><label className={label}>Veids</label><input value={eventType} onChange={(e) => setEventType(e.target.value)} className={`${field} mt-1`} /></div>
          <div><label className={label}>Viesu skaits</label><input type="number" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} className={`${field} mt-1`} /></div>
          <div><label className={label}>Telpās / ārā</label><select value={indoorOutdoor} onChange={(e) => setIndoorOutdoor(e.target.value)} className={`${field} mt-1`}><option value="">—</option><option value="telpās">Telpās</option><option value="ārā">Ārā</option></select></div>
          <div className="sm:col-span-2"><label className={label}>Norises / piegādes vieta</label><input value={location} onChange={(e) => setLocation(e.target.value)} className={`${field} mt-1`} /></div>
          <div className="sm:col-span-2"><label className={label}>Apraksts / piezīmes</label><textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={`${field} mt-1`} /></div>
        </div>
      </section>

      {/* Inventārs + cena */}
      <section className="rounded-2xl border border-gold/25 bg-navy/30 p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-gold">Inventārs</h2>
          <button type="button" onClick={addLine} className="rounded-full border border-gold/40 px-3 py-1 text-xs text-gold hover:border-gold">+ Pievienot</button>
        </div>
        <div className="space-y-2">
          {lines.map((l, i) => {
            const p = bySlug.get(l.slug);
            return (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <select value={l.slug} onChange={(e) => setLine(i, { slug: e.target.value, tierIndex: 0 })} className={`${field} flex-1`}>
                  <option value="">— produkts —</option>
                  {products.map((pr) => (<option key={pr.slug} value={pr.slug}>{pr.name}</option>))}
                </select>
                <select value={l.tierIndex} onChange={(e) => setLine(i, { tierIndex: Number(e.target.value) })} disabled={!p} className={`${field} w-48`}>
                  {(p?.tiers ?? []).map((t, ti) => (<option key={ti} value={ti}>{t.duration} — {t.price ? `${t.price} €` : "vienojoties"}</option>))}
                </select>
                <input type="number" min={1} value={l.qty} onChange={(e) => setLine(i, { qty: Math.max(1, Number(e.target.value)) })} className={`${field} w-20`} />
                <button type="button" onClick={() => removeLine(i)} className="rounded-lg border border-red-500/40 px-2 py-1.5 text-xs text-red-300">✕</button>
              </div>
            );
          })}
          {lines.length === 0 && <p className="text-sm text-text/40">Nav produktu.</p>}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div><label className={label}>Piegādes maksa (€)</label><input type="number" value={deliveryCost} onChange={(e) => setDeliveryCost(e.target.value)} className={`${field} mt-1`} /></div>
          <div><label className={label}>Piegādes attālums (km)</label><input type="number" value={deliveryKm} onChange={(e) => setDeliveryKm(e.target.value)} className={`${field} mt-1`} /></div>
          <div><label className={label}>Galīgā summa (€)</label><input type="number" value={finalTotal} onChange={(e) => setFinalTotal(e.target.value)} placeholder={`Auto: ${quote.subtotal}`} className={`${field} mt-1`} /></div>
        </div>
        <div className="mt-3 rounded-lg border border-gold/20 bg-bg/40 p-3 text-sm">
          <div className="flex justify-between"><span className="text-text/60">Inventārs (auto)</span><span className="font-mono">{eur(quote.subtotal)}</span></div>
          <div className="mt-1 flex justify-between border-t border-gold/15 pt-1 font-semibold"><span>Kopā{finalTotal.trim() ? " (koriģēts)" : ""}</span><span className="font-mono text-gold">{eur(grandTotal)}</span></div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={pending} className="rounded-full bg-gold px-6 py-2 text-sm font-semibold text-black disabled:opacity-60">
          {pending ? "Saglabā…" : "Saglabāt izmaiņas"}
        </button>
        {msg && <span className="text-sm text-gold">{msg}</span>}
      </div>
    </div>
  );
}
