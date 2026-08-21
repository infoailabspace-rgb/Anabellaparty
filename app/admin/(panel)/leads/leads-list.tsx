"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LEAD_STATUSES } from "./constants";

export type Lead = {
  id: string;
  created_at: string;
  source: string;
  company: string;
  contact_person: string;
  email: string;
  phone: string;
  status: string;
  converted_booking_id: string | null;
  viewed_at?: string | null;
};

const STATUS_CLS: Record<string, string> = {
  new: "border-yellow-500/50 bg-yellow-500/10 text-yellow-300",
  contacted: "border-blue-400/40 bg-blue-500/10 text-blue-300",
  quoted: "border-gold/40 bg-gold/10 text-gold",
  won: "border-green-500/40 bg-green-500/10 text-green-300",
  lost: "border-text/30 text-text/50",
};
const SOURCE_LABEL: Record<string, string> = {
  b2b: "Uzņēmums",
  pasvaldibam: "Pašvaldība",
  b2c: "Privātpersona",
};
const field =
  "rounded-lg border border-gold/25 bg-navy/40 px-3 py-2 text-sm text-text outline-none focus:border-gold";

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("lv-LV", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Klikšķināmas kartītes → detaļu lapa (rediģēšana notiek tur). Meklēšana +
// statusa filtrs; pārējā vadība pārcelta uz /admin/leads/[id].
export default function LeadsList({ leads }: { leads: Lead[] }) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (
        n &&
        !`${l.company} ${l.contact_person} ${l.email} ${l.phone}`
          .toLowerCase()
          .includes(n)
      )
        return false;
      return true;
    });
  }, [leads, q, statusFilter]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <h1 className="mr-auto font-display text-2xl font-bold">
          B2B pieprasījumi{" "}
          <span className="text-sm font-normal text-text/50">
            ({filtered.length})
          </span>
        </h1>
        <input
          placeholder="Meklēt (uzņēmums / persona / e-pasts)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={`${field} w-72`}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={field}
        >
          <option value="all">Visi statusi</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-gold/20 p-8 text-center text-text/40">
          Nav pieprasījumu.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((l) => {
            const isNew = !l.viewed_at || l.status === "new";
            return (
              <Link
                key={l.id}
                href={`/admin/leads/${l.id}`}
                className="block rounded-xl border border-gold/15 bg-navy/25 p-4 transition-colors hover:border-gold/40 hover:bg-navy/40"
              >
                <div className="flex flex-col gap-3 sm:grid sm:grid-cols-[1.6fr_1.4fr_auto] sm:items-center sm:gap-4">
                  <div className="min-w-0">
                    <p
                      className={`truncate font-semibold ${
                        isNew ? "text-gold" : "text-text"
                      }`}
                    >
                      {l.company}
                    </p>
                    <p className="truncate text-xs text-text/50">
                      {l.contact_person}
                      {l.phone ? ` · ${l.phone}` : ""}
                      {l.email ? ` · ${l.email}` : ""}
                    </p>
                  </div>
                  <div className="min-w-0 text-sm">
                    <p className="text-text/90">
                      {SOURCE_LABEL[l.source] ?? l.source}
                    </p>
                    <p className="text-xs text-text/50">
                      {fmtDate(l.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end sm:gap-1.5">
                    {l.converted_booking_id && (
                      <span className="text-[11px] text-green-300">
                        ✓ Rezervācijā
                      </span>
                    )}
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${
                        STATUS_CLS[l.status] ?? ""
                      }`}
                    >
                      {LEAD_STATUSES.find((s) => s.id === l.status)?.label ??
                        l.status}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
