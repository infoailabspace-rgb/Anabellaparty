"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { computeQuote, type CartItem } from "@/lib/pricing";
import type { Product } from "@/lib/products";
import { createManualBooking } from "../actions";
import BackButton from "@/components/admin/back-button";

type Cust = { id: string; name: string; email: string; phone: string };
type Line = { slug: string; tierIndex: number; qty: number };

const field =
  "w-full rounded-lg border border-gold/25 bg-navy/40 px-3 py-2 text-sm text-text outline-none focus:border-gold";
const label = "block text-xs uppercase tracking-wide text-text/50";
const eur = (n: number) => `${Number(n || 0).toFixed(0)} €`;

export type Prefill = {
  leadId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  eventDate: string;
  dateHint: string;
  guestCount: string;
  location: string;
  description: string;
};

export default function NewBookingForm({
  products,
  customers,
  prefill,
}: {
  products: Product[];
  customers: Cust[];
  prefill?: Prefill;
}) {
  const router = useRouter();

  // Kontakts (aizpildīts no B2B lead, ja konvertē)
  const [name, setName] = useState(prefill?.name ?? "");
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [phone, setPhone] = useState(prefill?.phone ?? "");
  const [company, setCompany] = useState(prefill?.company ?? "");
  const [regNr, setRegNr] = useState("");
  const [custQuery, setCustQuery] = useState("");
  const [showCust, setShowCust] = useState(false);

  // Pasākums
  const [eventDate, setEventDate] = useState(prefill?.eventDate ?? "");
  const [eventTime, setEventTime] = useState("");
  const [duration, setDuration] = useState("");
  const [eventType, setEventType] = useState("");
  const [guestCount, setGuestCount] = useState(prefill?.guestCount ?? "");
  const [location, setLocation] = useState(prefill?.location ?? "");
  const [indoorOutdoor, setIndoorOutdoor] = useState("");
  const [description, setDescription] = useState(prefill?.description ?? "");

  // Produkti + cena
  const [lines, setLines] = useState<Line[]>([]);
  const [deliveryCost, setDeliveryCost] = useState("0");
  const [finalTotal, setFinalTotal] = useState("");
  const [status, setStatus] = useState<"new" | "confirmed">("new");

  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const bySlug = useMemo(
    () => new Map(products.map((p) => [p.slug, p])),
    [products],
  );

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
    finalTotal.trim() ? Number(finalTotal) : quote.subtotal + (Number(deliveryCost) || 0);

  const custMatches = useMemo(() => {
    const q = custQuery.trim().toLowerCase();
    if (!q) return [];
    return customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [custQuery, customers]);

  function pickCust(c: Cust) {
    setName(c.name);
    setEmail(c.email);
    setPhone(c.phone);
    setCustQuery(c.name);
    setShowCust(false);
  }

  const addLine = () =>
    setLines((l) => [...l, { slug: "", tierIndex: 0, qty: 1 }]);
  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((l) => l.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const removeLine = (i: number) =>
    setLines((l) => l.filter((_, j) => j !== i));

  function save() {
    if (!name.trim()) {
      setMsg("Vārds/nosaukums ir obligāts");
      return;
    }
    if (!eventDate) {
      setMsg("Pasākuma datums ir obligāts");
      return;
    }
    setMsg("");
    start(async () => {
      const res = await createManualBooking({
        name,
        email,
        phone,
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
        delivery_cost: Number(deliveryCost) || 0,
        final_total: finalTotal.trim() ? Number(finalTotal) : null,
        status,
      }, prefill?.leadId);
      if (res?.error) {
        setMsg(res.error);
        return;
      }
      if (res?.id) router.push(`/admin/${res.id}`);
    });
  }

  return (
    <div className="max-w-3xl">
      <BackButton fallback="/admin" />
      <h1 className="mt-3 font-display text-2xl font-bold">
        {prefill ? "Rezervācija no B2B pieprasījuma" : "Jauns pieteikums"}
      </h1>
      <p className="mb-4 mt-1 text-xs text-text/50">
        Manuāla rezervācija (telefona/WhatsApp sarunām). Klientu meklē vai ievadi
        jaunu; cena aprēķinās automātiski, bet vari to pārrakstīt.
      </p>
      {prefill && (
        <p className="mb-4 rounded-lg border border-gold/30 bg-gold/5 p-3 text-sm text-gold">
          Aizpildīts no B2B pieprasījuma. Pārbaudi laukus un pievieno produktus —
          pēc saglabāšanas pieprasījums tiks atzīmēts kā “Iegūts”.
        </p>
      )}

      {/* Klients */}
      <section className="mb-4 rounded-2xl border border-gold/25 bg-navy/30 p-6">
        <h2 className="mb-3 font-display text-lg font-semibold text-gold">
          Klients
        </h2>
        <div className="relative mb-4">
          <label className={label}>Meklēt CRM klientu</label>
          <input
            value={custQuery}
            onChange={(e) => {
              setCustQuery(e.target.value);
              setShowCust(true);
            }}
            onFocus={() => setShowCust(true)}
            placeholder="Sāc rakstīt vārdu vai e-pastu…"
            className={`${field} mt-1`}
          />
          {showCust && custMatches.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gold/30 bg-navy shadow-xl">
              {custMatches.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => pickCust(c)}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-gold/10"
                  >
                    <span className="text-text/90">{c.name}</span>{" "}
                    <span className="text-text/40">
                      {c.email || c.phone || ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Vārds / uzņēmums *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={`${field} mt-1`} />
          </div>
          <div>
            <label className={label}>E-pasts</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className={`${field} mt-1`} />
          </div>
          <div>
            <label className={label}>Telefons</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={`${field} mt-1`} />
          </div>
          <div>
            <label className={label}>Uzņēmums (ja jurid.)</label>
            <input value={company} onChange={(e) => setCompany(e.target.value)} className={`${field} mt-1`} />
          </div>
          <div>
            <label className={label}>Reģ. Nr.</label>
            <input value={regNr} onChange={(e) => setRegNr(e.target.value)} className={`${field} mt-1`} />
          </div>
        </div>
      </section>

      {/* Pasākums */}
      <section className="mb-4 rounded-2xl border border-gold/25 bg-navy/30 p-6">
        <h2 className="mb-3 font-display text-lg font-semibold text-gold">
          Pasākums
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Datums *</label>
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={`${field} mt-1`} />
            {prefill?.dateHint && (
              <p className="mt-1 text-xs text-amber-300">
                Klients norādīja: {prefill.dateHint}
              </p>
            )}
          </div>
          <div>
            <label className={label}>Laiks</label>
            <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className={`${field} mt-1`} />
          </div>
          <div>
            <label className={label}>Ilgums</label>
            <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="piem. 2 stundas / 24h" className={`${field} mt-1`} />
          </div>
          <div>
            <label className={label}>Veids</label>
            <input value={eventType} onChange={(e) => setEventType(e.target.value)} placeholder="Kāzas, Dzimšanas diena…" className={`${field} mt-1`} />
          </div>
          <div>
            <label className={label}>Viesu skaits</label>
            <input type="number" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} className={`${field} mt-1`} />
          </div>
          <div>
            <label className={label}>Telpās / ārā</label>
            <select value={indoorOutdoor} onChange={(e) => setIndoorOutdoor(e.target.value)} className={`${field} mt-1`}>
              <option value="">—</option>
              <option value="telpās">Telpās</option>
              <option value="ārā">Ārā</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Norises / piegādes vieta</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className={`${field} mt-1`} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Piezīmes (sarunu detaļas)</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={`${field} mt-1`} />
          </div>
        </div>
      </section>

      {/* Inventārs */}
      <section className="mb-4 rounded-2xl border border-gold/25 bg-navy/30 p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-gold">Inventārs</h2>
          <button type="button" onClick={addLine} className="rounded-full border border-gold/40 px-3 py-1 text-xs text-gold hover:border-gold">+ Pievienot produktu</button>
        </div>
        <div className="space-y-2">
          {lines.map((l, i) => {
            const p = bySlug.get(l.slug);
            return (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <select value={l.slug} onChange={(e) => setLine(i, { slug: e.target.value, tierIndex: 0 })} className={`${field} flex-1`}>
                  <option value="">— izvēlies produktu —</option>
                  {products.map((pr) => (
                    <option key={pr.slug} value={pr.slug}>{pr.name}</option>
                  ))}
                </select>
                <select value={l.tierIndex} onChange={(e) => setLine(i, { tierIndex: Number(e.target.value) })} disabled={!p} className={`${field} w-48`}>
                  {(p?.tiers ?? []).map((t, ti) => (
                    <option key={ti} value={ti}>{t.duration} — {t.price ? `${t.price} €` : "vienojoties"}</option>
                  ))}
                </select>
                <input type="number" min={1} value={l.qty} onChange={(e) => setLine(i, { qty: Math.max(1, Number(e.target.value)) })} className={`${field} w-20`} />
                <button type="button" onClick={() => removeLine(i)} className="rounded-lg border border-red-500/40 px-2 py-1.5 text-xs text-red-300">✕</button>
              </div>
            );
          })}
          {lines.length === 0 && <p className="text-sm text-text/40">Nav pievienotu produktu.</p>}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Piegādes maksa (€)</label>
            <input type="number" value={deliveryCost} onChange={(e) => setDeliveryCost(e.target.value)} className={`${field} mt-1`} />
          </div>
          <div>
            <label className={label}>Galīgā summa (€) — pārraksta auto</label>
            <input type="number" value={finalTotal} onChange={(e) => setFinalTotal(e.target.value)} placeholder={`Auto: ${quote.subtotal}`} className={`${field} mt-1`} />
          </div>
        </div>
        <div className="mt-3 rounded-lg border border-gold/20 bg-bg/40 p-3 text-sm">
          <div className="flex justify-between"><span className="text-text/60">Inventārs (auto)</span><span className="font-mono">{eur(quote.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-text/60">Piegāde</span><span className="font-mono">{eur(Number(deliveryCost) || 0)}</span></div>
          <div className="mt-1 flex justify-between border-t border-gold/15 pt-1 font-semibold"><span>Kopā{finalTotal.trim() ? " (koriģēts)" : ""}</span><span className="font-mono text-gold">{eur(grandTotal)}</span></div>
        </div>
      </section>

      {/* Statuss + saglabāt */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <label className={label}>Statuss</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as "new" | "confirmed")} className={`${field} mt-1 w-56`}>
            <option value="new">Jauns pieteikums</option>
            <option value="confirmed">Apstiprināts (sūta e-pastu klientam)</option>
          </select>
        </div>
        <button onClick={save} disabled={pending} className="mt-5 rounded-full bg-gold px-6 py-2 text-sm font-semibold text-black disabled:opacity-60">
          {pending ? "Saglabā…" : "Izveidot rezervāciju"}
        </button>
        {msg && <span className="mt-5 text-sm text-red-300">{msg}</span>}
      </div>
    </div>
  );
}
