"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Booking } from "@/lib/admin";
import {
  statusBadge,
  paymentBadge,
  bookingAmount,
  PAYMENT_DOT,
} from "@/lib/booking-status";

const WD = ["P", "O", "T", "C", "Pk", "S", "Sv"];
const MONTHS = [
  "Janvāris", "Februāris", "Marts", "Aprīlis", "Maijs", "Jūnijs",
  "Jūlijs", "Augusts", "Septembris", "Oktobris", "Novembris", "Decembris",
];

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Calendar({ bookings }: { bookings: Booking[] }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const byDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      if (!map.has(b.event_date)) map.set(b.event_date, []);
      map.get(b.event_date)!.push(b);
    }
    return map;
  }, [bookings]);

  // Konflikts: viens inventāra slug 2+ confirmed pasākumos vienā datumā.
  function conflict(list: Booking[]): boolean {
    const counts = new Map<string, number>();
    for (const b of list) {
      if (b.status !== "confirmed") continue;
      for (const it of b.items || []) {
        counts.set(it.slug, (counts.get(it.slug) ?? 0) + 1);
      }
    }
    return [...counts.values()].some((c) => c > 1);
  }

  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // pirmdiena = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function shift(delta: number) {
    const m = month + delta;
    setYear((y) => y + Math.floor(m / 12));
    setMonth(((m % 12) + 12) % 12);
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <h1 className="mr-auto font-display text-2xl font-bold">
          {MONTHS[month]} {year}
        </h1>
        <button onClick={() => shift(-1)} className="rounded-full border border-gold/40 px-4 py-1.5 text-sm text-text/80 hover:border-gold">
          ‹ Iepriekšējais
        </button>
        <button onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()); }} className="rounded-full border border-gold/40 px-4 py-1.5 text-sm text-text/80 hover:border-gold">
          Šodien
        </button>
        <button onClick={() => shift(1)} className="rounded-full border border-gold/40 px-4 py-1.5 text-sm text-text/80 hover:border-gold">
          Nākamais ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-gold/20 bg-gold/10 text-sm">
        {WD.map((w) => (
          <div key={w} className="bg-navy/60 p-2 text-center text-xs uppercase text-text/50">
            {w}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="min-h-24 bg-bg/40" />;
          const date = ymd(new Date(year, month, day));
          const list = byDate.get(date) ?? [];
          const hasConflict = conflict(list);
          const confirmed = list.filter((b) => b.status === "confirmed").length;
          return (
            <div
              key={i}
              className={`min-h-24 bg-bg/60 p-2 ${hasConflict ? "ring-2 ring-inset ring-red-500" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-text/70">{day}</span>
                {confirmed > 0 && (
                  <span className="rounded-full bg-gold/20 px-1.5 text-[10px] text-gold">
                    {confirmed} apst.
                  </span>
                )}
              </div>
              {hasConflict && (
                <div className="mt-1 rounded bg-red-500/20 px-1 text-[10px] font-semibold text-red-300">
                  ⚠ Inventāra konflikts
                </div>
              )}
              <div className="mt-1 space-y-1">
                {list.slice(0, 3).map((b) => {
                  // Šaurs skats: statuss = uzlīme, apmaksa = mazs krāsains punkts.
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
                      className={`flex items-center gap-1 truncate rounded border px-1 text-[11px] ${sb.cls}`}
                      title={`${b.name} — ${b.event_type} · ${sb.label} · ${pb.label}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${PAYMENT_DOT[pb.key] ?? "bg-text/40"}`}
                      />
                      <span className="truncate">{b.name}</span>
                    </Link>
                  );
                })}
                {list.length > 3 && (
                  <span className="text-[10px] text-text/40">+{list.length - 3}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-text/40">
        Sarkans ietvars = viens inventārs vairākos <b>apstiprinātos</b> pasākumos
        vienā datumā. Pieteikumi (ne-apstiprināti) konfliktu nerada.
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-text/50">
        <span className="text-text/40">Uzlīme = statuss · punkts = apmaksa:</span>
        <span>🟢 Apmaksāts</span>
        <span>🟡 Nav apmaksāts</span>
        <span>🟠 Daļēji</span>
        <span>🟣 Maksās pēc</span>
        <span>🔴 Kavēts</span>
      </div>
    </div>
  );
}
