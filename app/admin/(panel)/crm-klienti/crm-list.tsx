"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ListRow, Segment } from "./types";
import { SEGMENTS, SEGMENT_LABEL, TYPE_LABEL } from "./types";

const field =
  "rounded-lg border border-gold/25 bg-bg/60 px-3 py-2 text-sm text-text outline-none focus:border-gold";

export default function CrmList({ rows }: { rows: ListRow[] }) {
  const [q, setQ] = useState("");
  const [seg, setSeg] = useState<"" | Segment>("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (seg === "" || r.segment === seg) &&
        (s === "" ||
          r.name.toLowerCase().includes(s) ||
          r.email.toLowerCase().includes(s) ||
          r.contact_person.toLowerCase().includes(s) ||
          r.phone.toLowerCase().includes(s)),
    );
  }, [rows, q, seg]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">CRM Klienti</h1>
        <Link
          href="/admin/crm-klienti/jauns"
          className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black"
        >
          + Jauns klients
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          placeholder="Meklēt: vārds, e-pasts, telefons…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={`${field} w-72`}
        />
        <select
          value={seg}
          onChange={(e) => setSeg(e.target.value as "" | Segment)}
          className={field}
        >
          <option value="">Visi segmenti</option>
          {SEGMENTS.map((s) => (
            <option key={s} value={s}>
              {SEGMENT_LABEL[s]}
            </option>
          ))}
        </select>
        <span className="text-xs text-text/50">
          {filtered.length} / {rows.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-gold/20 bg-navy/20 p-8 text-center text-sm text-text/50">
          Nav klientu. Tie tiek izveidoti automātiski no rezervācijām vai manuāli
          ar “Jauns klients”.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gold/25">
          <table className="w-full text-sm">
            <thead className="bg-navy/50 text-left text-xs uppercase tracking-wide text-text/50">
              <tr>
                <th className="px-4 py-3">Vārds / uzņēmums</th>
                <th className="px-4 py-3">Tips</th>
                <th className="px-4 py-3">E-pasts</th>
                <th className="px-4 py-3">Telefons</th>
                <th className="px-4 py-3">Segments</th>
                <th className="px-4 py-3 text-right">Atlaide</th>
                <th className="px-4 py-3 text-right">Rezerv.</th>
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
                      href={`/admin/crm-klienti/${r.id}`}
                      className="font-semibold text-gold hover:underline"
                    >
                      {r.name}
                    </Link>
                    {r.contact_person && (
                      <span className="block text-xs text-text/50">
                        {r.contact_person}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text/70">
                    {TYPE_LABEL[r.type]}
                  </td>
                  <td className="px-4 py-3 text-text/70">{r.email || "—"}</td>
                  <td className="px-4 py-3 text-text/70">{r.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-gold/30 px-2 py-0.5 text-xs text-gold/80">
                      {SEGMENT_LABEL[r.segment]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {r.discount_percent ? `${r.discount_percent}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-text/80">
                    {r.booking_count}
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
