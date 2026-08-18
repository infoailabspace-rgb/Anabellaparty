"use client";

import { useState, useTransition } from "react";
import {
  LEAD_STATUSES,
  setLeadStatus,
  saveLeadNotes,
  deleteLead,
} from "./actions";

export type Lead = {
  id: string;
  created_at: string;
  source: string;
  company: string;
  contact_person: string;
  role: string | null;
  email: string;
  phone: string;
  event_date: string | null;
  event_location: string | null;
  guest_count: string | null;
  interests: string[] | null;
  needs_branding: boolean;
  description: string | null;
  institution: string | null;
  procurement_id: string | null;
  status: string;
  admin_notes: string | null;
};

const STATUS_CLS: Record<string, string> = {
  new: "border-yellow-500/50 bg-yellow-500/10 text-yellow-300",
  contacted: "border-blue-400/40 bg-blue-500/10 text-blue-300",
  quoted: "border-gold/40 bg-gold/10 text-gold",
  won: "border-green-500/40 bg-green-500/10 text-green-300",
  lost: "border-text/30 text-text/50",
};

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("lv-LV", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function LeadsList({ leads }: { leads: Lead[] }) {
  const [rows, setRows] = useState(leads);
  const [q, setQ] = useState("");
  const [, start] = useTransition();

  const filtered = rows.filter((l) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return `${l.company} ${l.contact_person} ${l.email} ${l.phone}`
      .toLowerCase()
      .includes(needle);
  });

  function changeStatus(id: string, status: string) {
    setRows((r) => r.map((l) => (l.id === id ? { ...l, status } : l)));
    start(() => setLeadStatus(id, status));
  }

  function remove(l: Lead) {
    if (!confirm(`Dzēst pieprasījumu no ${l.company}?`)) return;
    setRows((r) => r.filter((x) => x.id !== l.id));
    start(() => {
      void deleteLead(l.id);
    });
  }

  const field =
    "rounded-lg border border-gold/25 bg-navy/40 px-3 py-2 text-sm text-text outline-none focus:border-gold";

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
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-gold/20 p-8 text-center text-text/40">
          Nav pieprasījumu.
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((l) => (
            <LeadCard key={l.id} lead={l} onStatus={changeStatus} onRemove={remove} />
          ))}
        </div>
      )}
    </div>
  );
}

function LeadCard({
  lead: l,
  onStatus,
  onRemove,
}: {
  lead: Lead;
  onStatus: (id: string, status: string) => void;
  onRemove: (l: Lead) => void;
}) {
  const [notes, setNotes] = useState(l.admin_notes ?? "");
  const [saved, setSaved] = useState(true);

  function onNotesBlur() {
    if (notes === (l.admin_notes ?? "")) return;
    saveLeadNotes(l.id, notes).then(() => setSaved(true));
  }

  const Row = ({ label, value }: { label: string; value?: string | null }) =>
    value ? (
      <div>
        <dt className="text-xs uppercase tracking-wide text-text/40">{label}</dt>
        <dd className="text-sm text-text/90">{value}</dd>
      </div>
    ) : null;

  return (
    <div className="rounded-2xl border border-gold/25 bg-navy/30 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">{l.company}</h2>
          <p className="text-sm text-text/60">
            {l.contact_person}
            {l.role ? ` · ${l.role}` : ""} · {fmtDate(l.created_at)}
            {l.source === "pasvaldibam" ? " · 🏛 pašvaldība" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 text-[11px] ${STATUS_CLS[l.status] ?? ""}`}
          >
            {LEAD_STATUSES.find((s) => s.id === l.status)?.label ?? l.status}
          </span>
          <select
            value={l.status}
            onChange={(e) => onStatus(l.id, e.target.value)}
            className="rounded-lg border border-gold/25 bg-navy/40 px-2 py-1 text-xs text-text outline-none focus:border-gold"
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => onRemove(l)}
            className="rounded-lg border border-red-500/40 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
          >
            Dzēst
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <a href={`tel:${l.phone}`} className="rounded-full bg-gold px-4 py-1.5 text-sm font-semibold text-black">
          Zvanīt {l.phone}
        </a>
        <a
          href={`https://www.commandoai.app/Emails?to=${encodeURIComponent(l.email)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-gold/40 px-4 py-1.5 text-sm text-text/80 hover:border-gold"
        >
          ✉ {l.email}
        </a>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <Row label="Datums" value={l.event_date} />
        <Row label="Vieta" value={l.event_location} />
        <Row label="Viesu skaits" value={l.guest_count} />
        <Row label="Interesē" value={l.interests?.length ? l.interests.join(", ") : null} />
        <Row label="Brendēšana" value={l.needs_branding ? "Jā" : null} />
        <Row label="Iestāde" value={l.institution} />
        <Row label="Iepirkuma ID" value={l.procurement_id} />
      </dl>

      {l.description && (
        <p className="mt-4 whitespace-pre-wrap rounded-lg border border-gold/15 bg-bg/40 p-3 text-sm text-text/85">
          {l.description}
        </p>
      )}

      <div className="mt-4">
        <label className="text-xs uppercase tracking-wide text-text/50">
          Iekšējās piezīmes{" "}
          <span className="text-text/30">{saved ? "· saglabāts" : ""}</span>
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setSaved(false);
          }}
          onBlur={onNotesBlur}
          className="mt-1 block w-full rounded-lg border border-gold/25 bg-navy/40 px-3 py-2 text-sm text-text outline-none focus:border-gold"
        />
      </div>
    </div>
  );
}
