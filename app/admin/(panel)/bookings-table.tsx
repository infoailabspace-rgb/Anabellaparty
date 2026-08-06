"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { computeQuote } from "@/lib/pricing";
import { STATUSES, urgency, type Booking } from "@/lib/admin";
import { setStatus } from "./actions";

const URGENCY_RING: Record<string, string> = {
  red: "border-l-4 border-l-red-500",
  yellow: "border-l-4 border-l-yellow-500",
  none: "border-l-4 border-l-transparent",
};

function itemsSummary(b: Booking): string {
  try {
    const q = computeQuote(b.items || []);
    if (!q.lines.length) return "—";
    const names = q.lines.map((l) => l.name);
    return names.slice(0, 2).join(", ") + (names.length > 2 ? ` +${names.length - 2}` : "");
  } catch {
    return "—";
  }
}

export default function BookingsTable({ bookings }: { bookings: Booking[] }) {
  const [rows, setRows] = useState(bookings);
  const [statusFilter, setStatusFilter] = useState("all");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (from && b.event_date < from) return false;
      if (to && b.event_date > to) return false;
      if (needle) {
        const hay = `${b.name} ${b.phone} ${b.email}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [rows, statusFilter, q, from, to]);

  function changeStatus(id: string, status: string) {
    setRows((r) => r.map((b) => (b.id === id ? { ...b, status } : b)));
    startTransition(() => {
      setStatus(id, status);
    });
  }

  const field =
    "rounded-lg border border-gold/25 bg-navy/40 px-3 py-2 text-sm text-text outline-none focus:border-gold";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <h1 className="mr-auto font-display text-2xl font-bold">
          Pieteikumi{" "}
          <span className="text-sm font-normal text-text/50">
            ({filtered.length})
          </span>
        </h1>
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
          {STATUSES.map((s) => (
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
                  </td>
                  <td className="p-3 text-text/70">{itemsSummary(b)}</td>
                  <td className="p-3 text-right font-mono text-gold">
                    {total} €{b.final_total != null ? " ✓" : ""}
                  </td>
                  <td className="p-3">
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
