"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { computeQuote, type CartItem } from "@/lib/pricing";
import type { Product } from "@/lib/products";
import type { Booking } from "@/lib/admin";
import { updateBooking } from "../actions";

type Line = {
  slug: string;
  tierIndex: number;
  qty: number;
  extraHours: number;
  addOns: Record<string, number>;
};

const field =
  "w-full rounded-lg border border-gold/25 bg-navy/40 px-3 py-2 text-sm text-text outline-none focus:border-gold";
const label = "block text-xs uppercase tracking-wide text-text/50";
const eur = (n: number) => `${Number(n || 0).toFixed(0)} €`;
const clean = (v: string | null | undefined) => (v && v !== "-" ? v : "");

// Normalizē addOns → stabila atslēga (izmet 0-daudzumus, sakārto), lai grupē
// TIKAI patiešām identiskus item objektus (ieskaitot add-onus + papildstundas).
function addOnsKey(addOns: Record<string, number> | undefined): string {
  const entries = Object.entries(addOns ?? {})
    .filter(([, v]) => (Number(v) || 0) > 0)
    .sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(entries);
}

function itemsToLines(items: CartItem[]): Line[] {
  const map = new Map<string, Line>();
  for (const it of items || []) {
    if (!it?.slug) continue;
    const extraHours = Math.max(0, it.extraHours ?? 0);
    const addOns = it.addOns ?? {};
    // Atslēga ietver arī papildstundas + add-onus → dažādi papildinājumi
    // paliek atsevišķās rindās (nepazūd saglabājot).
    const key = `${it.slug}|${it.tierIndex ?? 0}|${extraHours}|${addOnsKey(addOns)}`;
    const ex = map.get(key);
    if (ex) ex.qty += 1;
    else
      map.set(key, {
        slug: it.slug,
        tierIndex: it.tierIndex ?? 0,
        qty: 1,
        extraHours,
        addOns,
      });
  }
  return [...map.values()];
}

// Skatīšanas režīma teksta rinda (label + vērtība).
function ViewRow({ label: lbl, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className={label}>{lbl}</p>
      <p className="mt-1 text-sm text-text/90">
        {value === "" || value == null ? "—" : value}
      </p>
    </div>
  );
}

export default function EditBookingForm({
  booking,
  products,
}: {
  booking: Booking;
  products: Product[];
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

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
              extraHours: l.extraHours || 0,
              addOns: l.addOns || {},
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

  const addLine = () =>
    setLines((l) => [
      ...l,
      { slug: "", tierIndex: 0, qty: 1, extraHours: 0, addOns: {} },
    ]);
  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((l) => l.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const removeLine = (i: number) => setLines((l) => l.filter((_, j) => j !== i));

  // Atmet nesaglabātās izmaiņas → sākotnējās vērtības.
  function resetForm() {
    setName(booking.name ?? "");
    setEmail(clean(booking.email));
    setPhone(clean(booking.phone));
    setCompany(booking.company ?? "");
    setRegNr(booking.reg_nr ?? "");
    setEventDate(booking.event_date ?? "");
    setEventTime(booking.event_time ? booking.event_time.slice(0, 5) : "");
    setDuration(booking.duration ?? "");
    setEventType(booking.event_type ?? "");
    setGuestCount(booking.guest_count != null ? String(booking.guest_count) : "");
    setLocation(clean(booking.location));
    setIndoorOutdoor(booking.indoor_outdoor ?? "");
    setDescription(booking.description ?? "");
    setLines(itemsToLines(booking.items || []));
    setDeliveryCost(booking.delivery_cost != null ? String(booking.delivery_cost) : "0");
    setDeliveryKm(
      booking.delivery_distance_km != null ? String(booking.delivery_distance_km) : "",
    );
    setFinalTotal(booking.final_total != null ? String(booking.final_total) : "");
  }

  function cancel() {
    resetForm();
    setMsg("");
    setIsEditing(false);
  }

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
      setIsEditing(false);
      router.refresh();
    });
  }

  const tierLabel = (l: Line): string => {
    const p = bySlug.get(l.slug);
    const t = p?.tiers?.[l.tierIndex];
    if (!t) return "";
    return `${t.duration}${t.price ? ` — ${t.price} €` : " — vienojoties"}`;
  };

  // Papildu stundas + add-oni cilvēklasāmi (saglabāti, arī ja formā nerediģējami).
  const extrasLabel = (l: Line): string => {
    const p = bySlug.get(l.slug);
    const parts: string[] = [];
    if (l.extraHours > 0) {
      const hp = p?.hourlyExtra ?? 0;
      parts.push(`+${l.extraHours}h${hp ? ` (${l.extraHours * hp} €)` : ""}`);
    }
    for (const [naam, qty] of Object.entries(l.addOns || {})) {
      if ((Number(qty) || 0) <= 0) continue;
      const a = p?.addOns?.find((x) => x.name === naam);
      const price = a ? a.price * qty : 0;
      parts.push(`${naam}${qty > 1 ? ` ×${qty}` : ""}${price ? ` (+${price} €)` : ""}`);
    }
    return parts.join(" · ");
  };

  return (
    <div className="space-y-4">
      {/* Galvenes josla ar režīma pogām */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-gold">
          Rezervācijas dati
        </h2>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={save}
              disabled={pending}
              className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black disabled:opacity-60"
            >
              {pending ? "Saglabā…" : "💾 Saglabāt"}
            </button>
            <button
              onClick={cancel}
              disabled={pending}
              className="rounded-full border border-gold/40 px-4 py-2 text-sm text-text/80 hover:border-gold disabled:opacity-60"
            >
              ✖️ Atcelt
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-full border border-gold/40 px-5 py-2 text-sm font-semibold text-gold hover:bg-gold/10"
          >
            ✏️ Rediģēt
          </button>
        )}
      </div>

      {/* Kontakts */}
      <section className="rounded-2xl border border-gold/25 bg-navy/30 p-6">
        <h3 className="mb-3 font-display text-base font-semibold text-gold">Kontakts</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {isEditing ? (
            <>
              <div><label className={label}>Vārds / uzņēmums *</label><input value={name} onChange={(e) => setName(e.target.value)} className={`${field} mt-1`} /></div>
              <div><label className={label}>E-pasts</label><input value={email} onChange={(e) => setEmail(e.target.value)} className={`${field} mt-1`} /></div>
              <div><label className={label}>Telefons</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className={`${field} mt-1`} /></div>
              <div><label className={label}>Uzņēmums</label><input value={company} onChange={(e) => setCompany(e.target.value)} className={`${field} mt-1`} /></div>
              <div><label className={label}>Reģ. Nr.</label><input value={regNr} onChange={(e) => setRegNr(e.target.value)} className={`${field} mt-1`} /></div>
            </>
          ) : (
            <>
              <ViewRow label="Vārds / uzņēmums" value={name} />
              <ViewRow label="E-pasts" value={email} />
              <ViewRow label="Telefons" value={phone} />
              <ViewRow label="Uzņēmums" value={company} />
              <ViewRow label="Reģ. Nr." value={regNr} />
            </>
          )}
        </div>
      </section>

      {/* Pasākums */}
      <section className="rounded-2xl border border-gold/25 bg-navy/30 p-6">
        <h3 className="mb-3 font-display text-base font-semibold text-gold">Pasākums</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {isEditing ? (
            <>
              <div><label className={label}>Datums *</label><input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={`${field} mt-1`} /></div>
              <div><label className={label}>Laiks</label><input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className={`${field} mt-1`} /></div>
              <div><label className={label}>Ilgums</label><input value={duration} onChange={(e) => setDuration(e.target.value)} className={`${field} mt-1`} /></div>
              <div><label className={label}>Veids</label><input value={eventType} onChange={(e) => setEventType(e.target.value)} className={`${field} mt-1`} /></div>
              <div><label className={label}>Viesu skaits</label><input type="number" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} className={`${field} mt-1`} /></div>
              <div><label className={label}>Telpās / ārā</label><select value={indoorOutdoor} onChange={(e) => setIndoorOutdoor(e.target.value)} className={`${field} mt-1`}><option value="">—</option><option value="telpās">Telpās</option><option value="ārā">Ārā</option></select></div>
              <div className="sm:col-span-2"><label className={label}>Norises / piegādes vieta</label><input value={location} onChange={(e) => setLocation(e.target.value)} className={`${field} mt-1`} /></div>
              <div className="sm:col-span-2"><label className={label}>Apraksts / piezīmes</label><textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={`${field} mt-1`} /></div>
            </>
          ) : (
            <>
              <ViewRow label="Datums" value={eventDate} />
              <ViewRow label="Laiks" value={eventTime} />
              <ViewRow label="Ilgums" value={duration} />
              <ViewRow label="Veids" value={eventType} />
              <ViewRow label="Viesu skaits" value={guestCount} />
              <ViewRow label="Telpās / ārā" value={indoorOutdoor} />
              <div className="sm:col-span-2"><ViewRow label="Norises / piegādes vieta" value={location} /></div>
              <div className="sm:col-span-2"><ViewRow label="Apraksts / piezīmes" value={description} /></div>
            </>
          )}
        </div>
      </section>

      {/* Inventārs + cena */}
      <section className="rounded-2xl border border-gold/25 bg-navy/30 p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-gold">Inventārs</h3>
          {isEditing && (
            <button type="button" onClick={addLine} className="rounded-full border border-gold/40 px-3 py-1 text-xs text-gold hover:border-gold">+ Pievienot</button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            {lines.map((l, i) => {
              const p = bySlug.get(l.slug);
              const extras = extrasLabel(l);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <select value={l.slug} onChange={(e) => setLine(i, { slug: e.target.value, tierIndex: 0, extraHours: 0, addOns: {} })} className={`${field} flex-1`}>
                      <option value="">— produkts —</option>
                      {products.map((pr) => (<option key={pr.slug} value={pr.slug}>{pr.name}</option>))}
                    </select>
                    <select value={l.tierIndex} onChange={(e) => setLine(i, { tierIndex: Number(e.target.value) })} disabled={!p} className={`${field} w-48`}>
                      {(p?.tiers ?? []).map((t, ti) => (<option key={ti} value={ti}>{t.duration} — {t.price ? `${t.price} €` : "vienojoties"}</option>))}
                    </select>
                    <input type="number" min={1} value={l.qty} onChange={(e) => setLine(i, { qty: Math.max(1, Number(e.target.value)) })} className={`${field} w-20`} />
                    <button type="button" onClick={() => removeLine(i)} className="rounded-lg border border-red-500/40 px-2 py-1.5 text-xs text-red-300">✕</button>
                  </div>
                  {extras && (
                    <p className="pl-1 text-xs text-gold/70">
                      + {extras}{" "}
                      <span className="text-text/40">(saglabāts no klienta izvēles)</span>
                    </p>
                  )}
                </div>
              );
            })}
            {lines.length === 0 && <p className="text-sm text-text/40">Nav produktu.</p>}
          </div>
        ) : (
          <ul className="space-y-1.5">
            {lines.filter((l) => l.slug).map((l, i) => {
              const extras = extrasLabel(l);
              return (
                <li key={i} className="text-sm">
                  <span className="text-text/90">
                    {bySlug.get(l.slug)?.name ?? l.slug}
                    <span className="text-text/50"> × {l.qty}</span>
                    <span className="ml-2 text-xs text-text/40">{tierLabel(l)}</span>
                  </span>
                  {extras && <span className="ml-1 block pl-1 text-xs text-gold/70">+ {extras}</span>}
                </li>
              );
            })}
            {lines.filter((l) => l.slug).length === 0 && (
              <li className="text-sm text-text/40">Nav produktu.</li>
            )}
          </ul>
        )}

        {isEditing ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div><label className={label}>Piegādes maksa (€)</label><input type="number" value={deliveryCost} onChange={(e) => setDeliveryCost(e.target.value)} className={`${field} mt-1`} /></div>
            <div><label className={label}>Piegādes attālums (km)</label><input type="number" value={deliveryKm} onChange={(e) => setDeliveryKm(e.target.value)} className={`${field} mt-1`} /></div>
            <div><label className={label}>Galīgā summa (€)</label><input type="number" value={finalTotal} onChange={(e) => setFinalTotal(e.target.value)} placeholder={`Auto: ${quote.subtotal}`} className={`${field} mt-1`} /></div>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <ViewRow label="Piegādes maksa" value={`${Number(deliveryCost) || 0} €`} />
            <ViewRow label="Piegādes attālums" value={deliveryKm.trim() ? `${deliveryKm} km` : "—"} />
            <ViewRow label="Galīgā summa" value={finalTotal.trim() ? `${finalTotal} €` : `Auto: ${quote.subtotal} €`} />
          </div>
        )}

        <div className="mt-3 rounded-lg border border-gold/20 bg-bg/40 p-3 text-sm">
          <div className="flex justify-between"><span className="text-text/60">Inventārs (auto)</span><span className="font-mono">{eur(quote.subtotal)}</span></div>
          <div className="mt-1 flex justify-between border-t border-gold/15 pt-1 font-semibold"><span>Kopā{finalTotal.trim() ? " (koriģēts)" : ""}</span><span className="font-mono text-gold">{eur(grandTotal)}</span></div>
        </div>
      </section>

      {msg && <p className="text-sm text-gold">{msg}</p>}
    </div>
  );
}
