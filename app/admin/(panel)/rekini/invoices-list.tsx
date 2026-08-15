"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ListRow, InvoiceStatus } from "./types";
import { INVOICE_STATUSES, INVOICE_STATUS_LABEL, eur } from "./types";

const field =
  "rounded-lg border border-gold/25 bg-bg/60 px-3 py-2 text-sm text-text outline-none focus:border-gold";

const STATUS_COLOR: Record<InvoiceStatus, string> = {
  draft: "border-text/30 text-text/60",
  sent: "border-blue-400/40 text-blue-300",
  paid: "border-green-500/40 text-green-300",
  overdue: "border-red-500/50 text-red-300",
  cancelled: "border-text/20 text-text/40",
};

export default function InvoicesList({ rows }: { rows: ListRow[] }) {
  const [status, setStatus] = useState<"" | InvoiceStatus>("");

  const filtered = useMemo(
    () => rows.filter((r) => status === "" || r.status === status),
    [rows, status],
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Rēķini</h1>
        <Link
          href="/admin/rekini/jauns"
          className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black"
        >
          + Jauns rēķins
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "" | InvoiceStatus)}
          className={field}
        >
          <option value="">Visi statusi</option>
          {INVOICE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {INVOICE_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <span className="text-xs text-text/50">
          {filtered.length} / {rows.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-gold/20 bg-navy/20 p-8 text-center text-sm text-text/50">
          Nav rēķinu. Izveido ar “Jauns rēķins”.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gold/25">
          <table className="w-full text-sm">
            <thead className="bg-navy/50 text-left text-xs uppercase tracking-wide text-text/50">
              <tr>
                <th className="px-4 py-3">Numurs</th>
                <th className="px-4 py-3">Klients</th>
                <th className="px-4 py-3">Izrakstīts</th>
                <th className="px-4 py-3 text-right">Summa</th>
                <th className="px-4 py-3">Statuss</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-gold/10 hover:bg-navy/30"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/rekini/${r.id}`}
                      className="font-mono font-semibold text-gold hover:underline"
                    >
                      {r.invoice_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text/80">{r.client}</td>
                  <td className="px-4 py-3 text-text/60">{r.issue_date}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {eur(r.amount_total)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_COLOR[r.status]}`}
                    >
                      {INVOICE_STATUS_LABEL[r.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
