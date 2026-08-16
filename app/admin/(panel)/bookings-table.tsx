"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { computeQuote } from "@/lib/pricing";
import type { Product } from "@/lib/products";
import { STATUSES, urgency, type Booking } from "@/lib/admin";
import { bookingBadge, bookingAmount } from "@/lib/booking-status";
import { setStatus, deleteBooking } from "./actions";

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6" />
    </svg>
  );
}

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
  const [rows, setRows] = useState(bookings);
  const [statusFilter, setStatusFilter] = useState("all");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [, startTransition] = useTransition();

  const scopeStatuses = STATUSES.filter((s) => scope.includes(s.id));

  // Biznesa prioritātes grupa (mazāks = augstāk). Katrā grupā pēc event_date ASC.
  const PRE = ["new", "contacted", "quoted"];
  function priorityGroup(b: Booking, todayStr: string): number {
    if (b.status === "confirmed" && b.event_date >= todayStr) return 1; // apstiprinātie, gaidāmie
    if (PRE.includes(b.status)) return 2; // jaunie pieteikumi
    if (b.status === "completed") return 3; // pabeigtie
    return 4; // rejected + confirmed pagājušie
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD (lokāli)
    return rows
      .filter((b) => {
        if (!scope.includes(b.status)) return false; // ārpus sadaļas → paslēpts
        if (statusFilter !== "all" && b.status !== statusFilter) return false;
        if (from && b.event_date < from) return false;
        if (to && b.event_date > to) return false;
        if (needle) {
          const hay = `${b.name} ${b.phone} ${b.email}`.toLowerCase();
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
  }, [rows, scope, statusFilter, q, from, to]);

  function changeStatus(id: string, status: string) {
    setRows((r) => r.map((b) => (b.id === id ? { ...b, status } : b)));
    startTransition(() => {
      setStatus(id, status);
    });
  }

  function remove(b: Booking) {
    if (
      !confirm(
        `Vai tiešām dzēst pieteikumu no ${b.name}? Šo darbību nevar atsaukt.`,
      )
    )
      return;
    setRows((r) => r.filter((x) => x.id !== b.id)); // optimistiski — pazūd uzreiz
    startTransition(() => {
      deleteBooking(b.id);
    });
  }

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
        <label className="text-xs text-text/50">
          No
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={`ml-1 ${field}`} />
        </label>
        <label className="text-xs text-text/50">
          Līdz
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={`ml-1 ${field}`} />
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gold/20">
        <table className="w-full text-sm">
          <thead className="bg-navy/50 text-left text-xs uppercase tracking-wide text-text/50">
            <tr>
              <th className="p-3">Pasākuma datums</th>
              <th className="p-3">Klients</th>
              <th className="p-3">Telefons</th>
              <th className="p-3">Inventārs</th>
              <th className="p-3 text-right">Summa</th>
              <th className="p-3">Statuss</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const isNew = !b.viewed_at;
              const total = b.final_total ?? b.estimated_total ?? 0;
              return (
                <tr
                  key={b.id}
                  className={`border-t border-gold/10 hover:bg-navy/30 ${URGENCY_RING[urgency(b.event_date, b.status)]}`}
                >
                  <td className="p-3">
                    <Link href={`/admin/${b.id}`} className={isNew ? "font-bold text-gold" : "text-text/90"}>
                      {b.event_date}
                      {b.event_time ? ` ${b.event_time.slice(0, 5)}` : ""}
                    </Link>
                    <div className="text-xs text-text/40">{b.event_type}</div>
                  </td>
                  <td className="p-3">
                    <Link href={`/admin/${b.id}`} className={isNew ? "font-bold" : ""}>
                      {b.name}
                    </Link>
                    <div className="text-xs text-text/40">{b.location}</div>
                  </td>
                  <td className="p-3">
                    <a href={`tel:${b.phone}`} className="text-text/80 hover:text-gold">
                      {b.phone}
                    </a>
                    {b.email && (
                      <a
                        href={`https://www.commandoai.app/Emails?to=${encodeURIComponent(b.email)}&subject=${encodeURIComponent(`Anabella Party — ${b.event_date}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Rakstīt e-pastu caur CommandoAI"
                        className="mt-0.5 block truncate text-xs text-text/50 hover:text-gold"
                      >
                        ✉ {b.email}
                      </a>
                    )}
                  </td>
                  <td className="p-3 text-text/70">{itemsSummary(b, products)}</td>
                  <td className="p-3 text-right font-mono text-gold">
                    {total} €{b.final_total != null ? " ✓" : ""}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const bg = bookingBadge(
                          b.status,
                          b.paid_sum ?? 0,
                          bookingAmount(b),
                          b.event_date,
                        );
                        return (
                          <span
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${bg.cls}`}
                          >
                            {bg.label}
                          </span>
                        );
                      })()}
                      <select
                        value={b.status}
                        onChange={(e) => changeStatus(b.id, e.target.value)}
                        className="rounded-lg border border-gold/25 bg-navy/40 px-2 py-1 text-xs text-text outline-none focus:border-gold"
                      >
                        {STATUSES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => remove(b)}
                        title="Dzēst pieteikumu"
                        aria-label={`Dzēst pieteikumu no ${b.name}`}
                        className="shrink-0 rounded-lg border border-red-500/40 p-1.5 text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-text/40">
                  Nav pieteikumu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
