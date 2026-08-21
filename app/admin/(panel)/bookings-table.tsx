"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { computeQuote } from "@/lib/pricing";
import type { Product } from "@/lib/products";
import { STATUSES, urgency, type Booking } from "@/lib/admin";
import { statusBadge, paymentBadge, bookingAmount } from "@/lib/booking-status";

const URGENCY_RING: Record<string, string> = {
  red: "border-l-4 border-l-red-500",
  yellow: "border-l-4 border-l-yellow-500",
  none: "border-l-4 border-l-transparent",
};

function itemsSummary(b: Booking, products: Product[]): string {
  try {
    const q = computeQuote(b.items || [], products);
    if (!q.lines.length) return "—";
    const names = q.lines.map((l) => l.name);
    return names.slice(0, 2).join(", ") + (names.length > 2 ? ` +${names.length - 2}` : "");
  } catch {
    return "—";
  }
}

export default function BookingsTable({
  bookings,
  products,
  scope,
  title,
}: {
  bookings: Booking[];
  products: Product[];
  // Statusi, ko šī sadaļa rāda. Kad ieraksta statuss iziet ārpus scope,
  // tas automātiski pazūd no saraksta (piem. quoted → confirmed).
  scope: string[];
  title: string;
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const scopeStatuses = STATUSES.filter((s) => scope.includes(s.id));

  // Biznesa prioritātes grupa (mazāks = augstāk). Katrā grupā pēc event_date ASC.
  const PRE = ["new", "contacted", "quoted"];
  function priorityGroup(b: Booking, todayStr: string): number {
    if (b.status === "confirmed" && b.event_date >= todayStr) return 1;
    if (PRE.includes(b.status)) return 2;
    if (b.status === "completed") return 3;
    return 4;
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const todayStr = new Date().toLocaleDateString("en-CA");
    return bookings
      .filter((b) => {
        if (!scope.includes(b.status)) return false;
        if (statusFilter !== "all" && b.status !== statusFilter) return false;
        if (sourceFilter !== "all" && (b.source ?? "form") !== sourceFilter)
          return false;
        if (from && b.event_date < from) return false;
        if (to && b.event_date > to) return false;
        if (needle) {
          const hay = `${b.name} ${b.company ?? ""} ${b.phone} ${b.email}`.toLowerCase();
          if (!hay.includes(needle)) return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          priorityGroup(a, todayStr) - priorityGroup(b, todayStr) ||
          a.event_date.localeCompare(b.event_date),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, scope, statusFilter, sourceFilter, q, from, to]);

  const field =
    "rounded-lg border border-gold/25 bg-navy/40 px-3 py-2 text-sm text-text outline-none focus:border-gold";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <h1 className="mr-auto font-display text-2xl font-bold">
          {title}{" "}
          <span className="text-sm font-normal text-text/50">
            ({filtered.length})
          </span>
        </h1>
        <Link
          href="/admin/jauns"
          className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black"
        >
          + Jauns pieteikums
        </Link>
        <input
          placeholder="Meklēt (vārds/telefons/e-pasts)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={`${field} w-56`}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={field}
        >
          <option value="all">Visi statusi</option>
          {scopeStatuses.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        {/* Izcelsmes filtrs (Google Ads statistikai — cik nāk no formas/reklāmas) */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className={field}
          title="Izcelsme"
        >
          <option value="all">Visi avoti</option>
          <option value="form">Forma</option>
          <option value="manual">Manuāli</option>
          <option value="import">Imports</option>
          <option value="lead">No B2B</option>
        </select>
        <label className="text-xs text-text/50">
          No
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={`ml-1 ${field}`} />
        </label>
        <label className="text-xs text-text/50">
          Līdz
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={`ml-1 ${field}`} />
        </label>
      </div>

      {/* Neatvērto (viewed_at IS NULL) leģenda — diskrēta, tikai ja ir tādi. */}
      {filtered.some((b) => !b.viewed_at) && (
        <p className="mb-3 flex items-center gap-1.5 text-xs text-text/40">
          <span className="h-2 w-2 rounded-full bg-gold" aria-hidden="true" />
          Neatvērtās rezervācijas iezīmētas ar zeltu
        </p>
      )}

      {/* Kartīšu saraksts — visa rinda klikšķināma, bez horizontālās ritināšanas.
          Statusu/apmaksu maina detaļu skatā; sarakstā tikai badge. */}
      <div className="space-y-2">
        {filtered.map((b) => {
          const isNew = !b.viewed_at;
          const total = b.final_total ?? b.estimated_total ?? 0;
          const sb = statusBadge(b.status);
          const pb = paymentBadge(
            b.paid_sum ?? 0,
            bookingAmount(b),
            b.event_date,
            b.payment_deferred ?? false,
          );
          return (
            <Link
              key={b.id}
              href={`/admin/${b.id}`}
              className={`block rounded-xl border border-gold/15 bg-navy/25 p-4 transition-colors hover:border-gold/40 hover:bg-navy/40 ${URGENCY_RING[urgency(b.event_date, b.status)]}`}
            >
              <div className="flex flex-col gap-3 sm:grid sm:grid-cols-[1.6fr_1.4fr_auto] sm:items-center sm:gap-4">
                {/* Klients */}
                <div className="min-w-0">
                  <p className={`flex items-center gap-1.5 font-semibold ${isNew ? "text-gold" : "text-text"}`}>
                    {isNew && (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-gold"
                        title="Neatvērta rezervācija"
                        aria-label="Neatvērta"
                      />
                    )}
                    <span className="truncate">
                      {b.name}
                      {b.company ? ` · ${b.company}` : ""}
                    </span>
                  </p>
                  <p className="truncate text-xs text-text/50">
                    {b.phone}
                    {b.email ? ` · ${b.email}` : ""}
                  </p>
                </div>

                {/* Pasākums */}
                <div className="min-w-0 text-sm">
                  <p className="text-text/90">
                    {b.event_date}
                    {b.event_time ? ` ${b.event_time.slice(0, 5)}` : ""}
                  </p>
                  <p className="truncate text-xs text-text/50">
                    {itemsSummary(b, products)} · {b.event_type}
                  </p>
                </div>

                {/* Summa + statuss (darbplūsma) + apmaksa — divas atsevišķas uzlīmes */}
                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                  <span className="font-mono text-gold">{total} €</span>
                  <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${sb.cls}`}>
                      {sb.label}
                    </span>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${pb.cls}`}>
                      {pb.label}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <p className="rounded-xl border border-gold/20 p-8 text-center text-text/40">
            Nav pieteikumu.
          </p>
        )}
      </div>
    </div>
  );
}
