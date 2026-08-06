"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type Product } from "@/lib/products";
import { homeCategories } from "@/lib/categories";
import { computeQuote, formatEur, type CartItem } from "@/lib/pricing";
import { track, trackLead } from "@/lib/analytics";
import {
  isValidEmail,
  isValidPhone,
  normalizePhone,
  type BookingContact,
  type BookingEvent,
} from "@/lib/booking";
import PricePanel from "@/components/booking/price-panel";

const STORAGE_KEY = "anabella-booking";
const EVENT_TYPES = [
  "Kāzas",
  "Jubileja",
  "Bērnu ballīte",
  "Korporatīvais",
  "Kristības",
  "Cits",
];
const DURATIONS = ["2h", "4h", "6h", "10h", "12h", "Visa diena"];

const emptyContact: BookingContact = {
  name: "",
  phone: "",
  email: "",
  company: "",
  regNr: "",
};
const emptyEvent: BookingEvent = {
  date: "",
  time: "",
  duration: "",
  type: "",
  guestCount: "",
  location: "",
  indoorOutdoor: "",
};

function defaultTierIndex(p: Product) {
  const idx = p.tiers.findIndex((t) => t.price > 0);
  return idx >= 0 ? idx : 0;
}

export default function BookingForm({ products }: { products: Product[] }) {
  const reduce = useReducedMotion();
  const productsBySlug = useMemo(
    () => new Map(products.map((p) => [p.slug, p])),
    [products],
  );
  const bySlug = (slug: string) => productsBySlug.get(slug);
  const byCategory = (cat: string) =>
    products.filter((p) => p.category === cat);
  const [step, setStep] = useState(1);
  const [items, setItems] = useState<CartItem[]>([]);
  const [contact, setContact] = useState<BookingContact>(emptyContact);
  const [event, setEvent] = useState<BookingEvent>(emptyEvent);
  const [description, setDescription] = useState("");
  const [consent, setConsent] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [delivery, setDelivery] = useState<{ km: number; cost: number } | null>(
    null,
  );
  const [deliveryStatus, setDeliveryStatus] = useState<
    "idle" | "loading" | "ok" | "error"
  >("idle");
  const [deliveryError, setDeliveryError] = useState("");
  const [activeCat, setActiveCat] = useState(homeCategories[0].id);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Ielādē no sessionStorage vai deep link (?item=slug).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setStep(s.step ?? 1);
        setItems(s.items ?? []);
        setContact({ ...emptyContact, ...(s.contact ?? {}) });
        setEvent({ ...emptyEvent, ...(s.event ?? {}) });
        setDescription(s.description ?? "");
        setConsent(Boolean(s.consent));
        setDeliveryAddress(s.deliveryAddress ?? "");
        if (s.delivery) {
          setDelivery(s.delivery);
          setDeliveryStatus("ok");
        }
      } else {
        const param = new URLSearchParams(window.location.search).get("item");
        const p = param ? bySlug(param) : undefined;
        if (p) {
          setItems([
            { slug: p.slug, tierIndex: defaultTierIndex(p), extraHours: 0, addOns: {} },
          ]);
          setActiveCat(p.category);
        }
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
    track("booking_started");
  }, []);

  // Saglabā sessionStorage.
  useEffect(() => {
    if (!loaded) return;
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          step,
          items,
          contact,
          event,
          description,
          consent,
          deliveryAddress,
          delivery,
        }),
      );
    } catch {
      /* ignore */
    }
  }, [
    loaded,
    step,
    items,
    contact,
    event,
    description,
    consent,
    deliveryAddress,
    delivery,
  ]);

  async function computeDelivery(address: string) {
    const a = address.trim();
    if (!a) {
      setDelivery(null);
      setDeliveryStatus("idle");
      setDeliveryError("");
      return;
    }
    setDeliveryStatus("loading");
    setDeliveryError("");
    try {
      const res = await fetch("/api/distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: a }),
      });
      const data = await res.json();
      if (data.ok) {
        setDelivery({ km: data.km, cost: data.cost });
        setDeliveryStatus("ok");
      } else {
        setDelivery(null);
        setDeliveryStatus("error");
        setDeliveryError(data.error ?? "Neizdevās aprēķināt piegādi.");
      }
    } catch {
      setDelivery(null);
      setDeliveryStatus("error");
      setDeliveryError("Neizdevās aprēķināt piegādi. Norādīsim manuāli.");
    }
  }

  const has = (slug: string) => items.some((i) => i.slug === slug);
  const itemFor = (slug: string) => items.find((i) => i.slug === slug);

  function toggle(p: Product) {
    const adding = !items.some((i) => i.slug === p.slug);
    setItems((prev) =>
      prev.some((i) => i.slug === p.slug)
        ? prev.filter((i) => i.slug !== p.slug)
        : [
            ...prev,
            { slug: p.slug, tierIndex: defaultTierIndex(p), extraHours: 0, addOns: {} },
          ],
    );
    if (adding) {
      track("booking_item_added", {
        item_name: p.name,
        value: p.tiers.find((t) => t.price > 0)?.price ?? 0,
      });
    }
  }
  function patch(slug: string, partial: Partial<CartItem>) {
    setItems((prev) =>
      prev.map((i) => (i.slug === slug ? { ...i, ...partial } : i)),
    );
  }
  function setAddOn(slug: string, name: string, qty: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.slug === slug
          ? { ...i, addOns: { ...i.addOns, [name]: Math.max(0, qty) } }
          : i,
      ),
    );
  }

  const kubliSelected = items.some(
    (i) => bySlug(i.slug)?.category === "kubli",
  );

  function validateStep(s: number): string[] {
    const e: string[] = [];
    if (s === 1 && items.length === 0) e.push("Izvēlies vismaz vienu inventāra vienību.");
    if (s === 2) {
      if (!event.date) e.push("Norādi pasākuma datumu.");
      else if (new Date(event.date) < new Date(todayStr))
        e.push("Datums nedrīkst būt pagātnē.");
      if (!event.type) e.push("Izvēlies pasākuma veidu.");
      if (!event.location.trim()) e.push("Norādi norises vietu.");
    }
    if (s === 3) {
      if (!contact.name.trim()) e.push("Norādi vārdu.");
      if (!isValidPhone(contact.phone)) e.push("Norādi derīgu telefona numuru.");
      if (!isValidEmail(contact.email)) e.push("Norādi derīgu e-pastu.");
    }
    if (s === 4 && !consent) e.push("Jāpiekrīt noteikumiem un privātuma politikai.");
    return e;
  }

  function next() {
    const e = validateStep(step);
    setErrors(e);
    if (e.length === 0) {
      const nextStep = Math.min(4, step + 1);
      setStep(nextStep);
      track("booking_step", { step_number: nextStep });
    }
  }
  function back() {
    setErrors([]);
    setStep((s) => Math.max(1, s - 1));
  }

  async function submit() {
    const e = validateStep(4);
    setErrors(e);
    if (e.length > 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          contact: { ...contact, phone: normalizePhone(contact.phone) },
          event,
          description,
          consent,
          delivery: {
            address: deliveryAddress,
            km: delivery?.km,
            cost: delivery?.cost,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(
          data.errors ?? [data.error ?? "Neizdevās nosūtīt. Mēģini vēlreiz vai zvani mums."],
        );
        setSubmitting(false);
        return;
      }
      const value = computeQuote(items, products).subtotal + (delivery?.cost || 0);
      track("booking_submitted", { value });
      trackLead(value);
      sessionStorage.removeItem(STORAGE_KEY);
      setSubmitted(true);
    } catch {
      setErrors(["Neizdevās nosūtīt. Pārbaudi savienojumu vai zvani +371 29222761."]);
      setSubmitting(false);
    }
  }

  if (submitted) {
    return <SuccessScreen name={contact.name} />;
  }

  const dir = reduce ? 0 : 1;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        {/* Progresa josla */}
        <div className="mb-8 flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  n <= step ? "bg-gold" : "bg-text/15"
                }`}
              />
              <span
                className={`mt-2 block text-xs ${
                  n === step ? "text-gold" : "text-text/40"
                }`}
              >
                {["Inventārs", "Pasākums", "Kontakti", "Apstiprināt"][n - 1]}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reduce ? undefined : { opacity: 0, x: 24 * dir }}
            animate={reduce ? undefined : { opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -24 * dir }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && (
              <StepInventory
                byCategory={byCategory}
                activeCat={activeCat}
                setActiveCat={setActiveCat}
                has={has}
                itemFor={itemFor}
                toggle={toggle}
                patch={patch}
                setAddOn={setAddOn}
                kubliSelected={kubliSelected}
              />
            )}
            {step === 2 && (
              <StepEvent
                event={event}
                setEvent={setEvent}
                todayStr={todayStr}
                deliveryAddress={deliveryAddress}
                setDeliveryAddress={setDeliveryAddress}
                computeDelivery={computeDelivery}
                delivery={delivery}
                deliveryStatus={deliveryStatus}
                deliveryError={deliveryError}
              />
            )}
            {step === 3 && <StepContact contact={contact} setContact={setContact} />}
            {step === 4 && (
              <StepReview
                items={items}
                event={event}
                contact={contact}
                description={description}
                setDescription={setDescription}
                consent={consent}
                setConsent={setConsent}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {errors.length > 0 && (
          <ul className="mt-6 space-y-1 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
            {errors.map((e) => (
              <li key={e}>• {e}</li>
            ))}
          </ul>
        )}

        {/* Navigācija */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="rounded-full border border-gold/40 px-6 py-2.5 text-sm font-semibold text-text/80 transition-colors enabled:hover:border-gold disabled:opacity-30"
          >
            Atpakaļ
          </button>
          {step < 4 ? (
            <button
              type="button"
              onClick={next}
              className="rounded-full bg-gold px-8 py-2.5 font-semibold text-black transition-transform hover:scale-[1.03]"
            >
              Tālāk
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-2.5 font-semibold text-black transition-transform enabled:hover:scale-[1.03] disabled:opacity-60"
            >
              {submitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
              )}
              {submitting ? "Nosūta…" : "Nosūtīt pieteikumu"}
            </button>
          )}
        </div>
      </div>

      {/* Cenas panelis — sticky desktopā */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <PricePanel
          items={items}
          products={products}
          deliveryCost={delivery?.cost}
          deliveryKm={delivery?.km}
          deliveryComputed={deliveryStatus === "ok"}
        />
      </aside>
    </div>
  );
}

/* ─────────────── Solis 1 — Inventārs ─────────────── */
function StepInventory({
  byCategory,
  activeCat,
  setActiveCat,
  has,
  itemFor,
  toggle,
  patch,
  setAddOn,
  kubliSelected,
}: {
  byCategory: (cat: string) => Product[];
  activeCat: string;
  setActiveCat: (c: Product["category"]) => void;
  has: (slug: string) => boolean;
  itemFor: (slug: string) => CartItem | undefined;
  toggle: (p: Product) => void;
  patch: (slug: string, partial: Partial<CartItem>) => void;
  setAddOn: (slug: string, name: string, qty: number) => void;
  kubliSelected: boolean;
}) {
  const list = byCategory(activeCat);
  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Izvēlies inventāru</h2>
      <p className="mt-1 text-sm text-text/60">
        Vari kombinēt vairākus produktus no dažādām kategorijām.
      </p>

      {/* Kategoriju cilnes */}
      <div className="mt-5 flex flex-wrap gap-2">
        {homeCategories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveCat(c.id)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
              activeCat === c.id
                ? "border-gold bg-gold text-black"
                : "border-gold/30 text-text/80 hover:border-gold/60"
            }`}
          >
            {c.short}
          </button>
        ))}
      </div>

      {kubliSelected && (
        <p className="mt-5 rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-text/85">
          Kubli un pirts atrodas Jūrmalā, un tiem ir atsevišķs kontakttālrunis{" "}
          <a href="tel:+37128286911" className="font-semibold text-gold">
            28286911
          </a>
          . Piegādes cena pēc vienošanās.
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {list.map((p) => {
          const selected = has(p.slug);
          const item = itemFor(p.slug);
          const pricedTiers = p.tiers;
          return (
            <div
              key={p.slug}
              className={`rounded-2xl border bg-navy/30 p-5 transition-colors ${
                selected ? "border-gold" : "border-gold/20"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-semibold">{p.name}</h3>
                  <p className="mt-1 font-mono text-sm text-gold">
                    {p.contactOnly
                      ? "Cena vienojoties"
                      : `${pricedTiers.find((t) => t.price > 0)?.price ?? 0} €`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(p)}
                  aria-pressed={selected}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    selected
                      ? "bg-gold text-black"
                      : "border border-gold/40 text-gold hover:bg-gold/10"
                  }`}
                >
                  {selected ? "✓ Grozā" : "Pievienot"}
                </button>
              </div>

              {selected && item && (
                <div className="mt-4 space-y-3 border-t border-gold/15 pt-4">
                  {/* Tarifa izvēle */}
                  {pricedTiers.length > 1 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-text/50">
                        Tarifs
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {pricedTiers.map((t, ti) => (
                          <button
                            key={t.duration + ti}
                            type="button"
                            onClick={() => patch(p.slug, { tierIndex: ti })}
                            className={`rounded-lg border px-3 py-1 text-xs transition-colors ${
                              item.tierIndex === ti
                                ? "border-gold bg-gold/15 text-gold"
                                : "border-gold/25 text-text/70 hover:border-gold/50"
                            }`}
                          >
                            {t.duration} · {t.price > 0 ? `${t.price} €` : "vienojoties"}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Papildu stundas */}
                  {typeof p.hourlyExtra === "number" && (
                    <Counter
                      label={`Papildu stundas (+${p.hourlyExtra} €/h)`}
                      value={item.extraHours}
                      onChange={(v) => patch(p.slug, { extraHours: v })}
                    />
                  )}

                  {/* Papildinājumi */}
                  {p.addOns?.map((a) => (
                    <Counter
                      key={a.name}
                      label={`${a.name} (${a.price} €${a.unit ? "/" + a.unit : ""})`}
                      value={item.addOns[a.name] ?? 0}
                      onChange={(v) => setAddOn(p.slug, a.name, v)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Counter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-text/75">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          aria-label="Mazāk"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/40 text-gold hover:bg-gold/10"
        >
          −
        </button>
        <span className="w-6 text-center font-mono">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          aria-label="Vairāk"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/40 text-gold hover:bg-gold/10"
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ─────────────── Solis 2 — Pasākums ─────────────── */
function StepEvent({
  event,
  setEvent,
  todayStr,
  deliveryAddress,
  setDeliveryAddress,
  computeDelivery,
  delivery,
  deliveryStatus,
  deliveryError,
}: {
  event: BookingEvent;
  setEvent: (e: BookingEvent) => void;
  todayStr: string;
  deliveryAddress: string;
  setDeliveryAddress: (v: string) => void;
  computeDelivery: (address: string) => void;
  delivery: { km: number; cost: number } | null;
  deliveryStatus: "idle" | "loading" | "ok" | "error";
  deliveryError: string;
}) {
  const set = (patch: Partial<BookingEvent>) => setEvent({ ...event, ...patch });
  const field =
    "w-full rounded-lg border border-gold/25 bg-bg/60 px-4 py-2.5 text-text outline-none focus:border-gold";
  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Par pasākumu</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-text/70">Pasākuma datums *</span>
          <input
            type="date"
            min={todayStr}
            value={event.date}
            onChange={(e) => set({ date: e.target.value })}
            className={`mt-1 ${field}`}
          />
        </label>
        <label className="block">
          <span className="text-sm text-text/70">Sākuma laiks</span>
          <input
            type="time"
            value={event.time}
            onChange={(e) => set({ time: e.target.value })}
            className={`mt-1 ${field}`}
          />
        </label>
        <label className="block">
          <span className="text-sm text-text/70">Ilgums</span>
          <select
            value={event.duration}
            onChange={(e) => set({ duration: e.target.value })}
            className={`mt-1 ${field}`}
          >
            <option value="">Izvēlies…</option>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-text/70">Pasākuma veids *</span>
          <select
            value={event.type}
            onChange={(e) => set({ type: e.target.value })}
            className={`mt-1 ${field}`}
          >
            <option value="">Izvēlies…</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-text/70">Viesu skaits</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={event.guestCount}
            onChange={(e) => set({ guestCount: e.target.value })}
            className={`mt-1 ${field}`}
          />
        </label>
        <label className="block">
          <span className="text-sm text-text/70">Norises vieta *</span>
          <input
            type="text"
            placeholder="Pilsēta / novads / adrese"
            value={event.location}
            onChange={(e) => set({ location: e.target.value })}
            className={`mt-1 ${field}`}
          />
        </label>
      </div>

      <div className="mt-4">
        <span className="text-sm text-text/70">Telpās vai ārā?</span>
        <div className="mt-2 flex gap-4 text-sm">
          {["Telpās", "Ārā", "Vēl nezinu"].map((o) => (
            <label key={o} className="flex items-center gap-2">
              <input
                type="radio"
                name="io"
                checked={event.indoorOutdoor === o}
                onChange={() => set({ indoorOutdoor: o })}
                className="accent-[#D4A960]"
              />
              {o}
            </label>
          ))}
        </div>
      </div>

      {/* Piegādes adrese ar auto-aprēķinu */}
      <div className="mt-6">
        <label className="block">
          <span className="text-sm text-text/70">Piegādes adrese</span>
          <input
            type="text"
            placeholder="Iela, māja, pilsēta / novads"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            onBlur={(e) => computeDelivery(e.target.value)}
            className={`mt-1 ${field}`}
          />
        </label>

        <div className="mt-2 rounded-xl border border-gold/20 bg-navy/25 p-4 text-sm">
          {deliveryStatus === "loading" && (
            <span className="text-text/60">Aprēķina attālumu…</span>
          )}
          {deliveryStatus === "ok" && delivery && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-text/75">
                Attālums no Ķekavas: ~{delivery.km} km
              </span>
              <span className="font-mono font-semibold text-gold">
                Piegāde:{" "}
                {delivery.cost > 0 ? formatEur(delivery.cost) : "bez maksas"}
              </span>
            </div>
          )}
          {deliveryStatus === "error" && (
            <span className="text-rose-gold">{deliveryError}</span>
          )}
          {deliveryStatus === "idle" && (
            <span className="text-text/50">
              Ievadi piegādes adresi — automātiski aprēķināsim attālumu un cenu.
              Ķekavas novadā piegāde bez maksas, tālāk 25 € / 100 km (aprēķins
              turp-atpakaļ).
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Solis 3 — Kontakti ─────────────── */
function StepContact({
  contact,
  setContact,
}: {
  contact: BookingContact;
  setContact: (c: BookingContact) => void;
}) {
  const set = (patch: Partial<BookingContact>) =>
    setContact({ ...contact, ...patch });
  const field =
    "w-full rounded-lg border border-gold/25 bg-bg/60 px-4 py-2.5 text-text outline-none focus:border-gold";
  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Tavi kontakti</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm text-text/70">Vārds, uzvārds *</span>
          <input
            type="text"
            value={contact.name}
            onChange={(e) => set({ name: e.target.value })}
            className={`mt-1 ${field}`}
          />
        </label>
        <label className="block">
          <span className="text-sm text-text/70">Telefons *</span>
          <input
            type="tel"
            inputMode="tel"
            placeholder="+371 2X XXX XXX"
            value={contact.phone}
            onChange={(e) => set({ phone: e.target.value })}
            className={`mt-1 ${field}`}
          />
        </label>
        <label className="block">
          <span className="text-sm text-text/70">E-pasts *</span>
          <input
            type="email"
            inputMode="email"
            value={contact.email}
            onChange={(e) => set({ email: e.target.value })}
            className={`mt-1 ${field}`}
          />
        </label>
        <label className="block">
          <span className="text-sm text-text/70">Uzņēmums</span>
          <input
            type="text"
            value={contact.company}
            onChange={(e) => set({ company: e.target.value })}
            className={`mt-1 ${field}`}
          />
        </label>
        {contact.company?.trim() && (
          <label className="block">
            <span className="text-sm text-text/70">Reģ. nr. / PVN nr.</span>
            <input
              type="text"
              value={contact.regNr}
              onChange={(e) => set({ regNr: e.target.value })}
              className={`mt-1 ${field}`}
            />
          </label>
        )}
      </div>
    </div>
  );
}

/* ─────────────── Solis 4 — Apraksts + apstiprinājums ─────────────── */
function StepReview({
  items,
  event,
  contact,
  description,
  setDescription,
  consent,
  setConsent,
}: {
  items: CartItem[];
  event: BookingEvent;
  contact: BookingContact;
  description: string;
  setDescription: (v: string) => void;
  consent: boolean;
  setConsent: (v: boolean) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Apraksts un apstiprinājums</h2>

      <label className="mt-6 block">
        <span className="text-sm text-text/70">Pasākuma apraksts</span>
        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Pastāsti par pasākumu — tematika, īpašas vēlmes, kur tieši uzstādīt inventāru, vai vajadzīgs asistents…"
          className="mt-1 w-full rounded-lg border border-gold/25 bg-bg/60 px-4 py-2.5 text-text outline-none focus:border-gold"
        />
      </label>

      <div className="mt-6 rounded-xl border border-gold/20 bg-navy/25 p-5 text-sm">
        <h3 className="font-display font-semibold text-gold">Kopsavilkums</h3>
        <p className="mt-2 text-text/80">
          {items.length} inventāra vienība(s) · {event.date || "—"}
          {event.time ? " " + event.time : ""} · {event.type || "—"}
        </p>
        <p className="text-text/60">
          {event.location || "—"} · {contact.name || "—"} ·{" "}
          {contact.phone || "—"}
        </p>
      </div>

      <label className="mt-6 flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 accent-[#D4A960]"
        />
        <span className="text-text/80">
          Piekrītu{" "}
          <Link href="/noteikumi" className="text-gold underline">
            nomas noteikumiem
          </Link>{" "}
          un{" "}
          <Link href="/privatuma-politika" className="text-gold underline">
            privātuma politikai
          </Link>
          .
        </span>
      </label>
    </div>
  );
}

/* ─────────────── Veiksmes ekrāns ─────────────── */
function SuccessScreen({ name }: { name: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-gold/30 bg-navy/30 p-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold text-3xl text-black">
        ✓
      </div>
      <h2 className="mt-6 font-display text-2xl font-bold">
        Paldies{name ? `, ${name}` : ""}!
      </h2>
      <p className="mt-3 text-text/80">
        Tavs pieteikums ir saņemts. Atbildēsim <b>24 stundu laikā</b> ar precīzu
        piedāvājumu. Ja steidz — sazinies tieši:
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <a
          href="tel:+37129222761"
          className="rounded-full bg-gold px-7 py-3 font-semibold text-black"
        >
          Zvanīt +371 29222761
        </a>
        <a
          href="https://wa.me/37129222761"
          className="rounded-full border border-gold px-7 py-3 font-semibold text-gold hover:bg-gold/10"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}
