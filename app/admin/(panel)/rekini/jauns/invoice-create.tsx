"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createInvoice } from "../actions";
import BackButton from "@/components/admin/back-button";
import type { BookingOption, InvoiceStatus } from "../types";
import {
  INVOICE_STATUSES,
  INVOICE_STATUS_LABEL,
  computeInvoiceAmounts,
  eur,
} from "../types";

const field =
  "w-full rounded-lg border border-gold/25 bg-navy/40 px-3 py-2 text-sm text-text outline-none focus:border-gold";
const label = "block text-xs uppercase tracking-wide text-text/50";

const today = () => new Date().toISOString().slice(0, 10);

export default function InvoiceCreate({
  bookings,
  preselect,
}: {
  bookings: BookingOption[];
  preselect: string | null;
}) {
  const router = useRouter();
  const preBooking = bookings.find((b) => b.id === preselect) ?? null;

  const [bookingId, setBookingId] = useState<string>(preBooking?.id ?? "");
  const [issueDate, setIssueDate] = useState(today());
  const [dueDate, setDueDate] = useState("");
  const [net, setNet] = useState<number>(preBooking?.amount_net ?? 0);
  const [vatRate, setVatRate] = useState<number>(21);
  const [status, setStatus] = useState<InvoiceStatus>("draft");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const amounts = computeInvoiceAmounts(net, vatRate);

  function onPickBooking(id: string) {
    setBookingId(id);
    const b = bookings.find((x) => x.id === id);
    if (b) setNet(b.amount_net); // auto-aizpilda summu
  }

  function save() {
    if (!(net > 0)) {
      setMsg("Summa (bez PVN) jābūt lielākai par 0");
      return;
    }
    setMsg("");
    start(async () => {
      const res = await createInvoice({
        booking_request_id: bookingId || null,
        issue_date: issueDate,
        due_date: dueDate || null,
        amount_net: amounts.amount_net,
        vat_rate: vatRate,
        vat_amount: amounts.vat_amount,
        amount_total: amounts.amount_total,
        status,
        notes,
      });
      if (res?.error) {
        setMsg(res.error);
        return;
      }
      if (res?.id) router.push(`/admin/rekini/${res.id}`);
    });
  }

  return (
    <div className="max-w-2xl">
      <BackButton fallback="/admin/rekini" />
      <h1 className="mt-4 font-display text-2xl font-bold">Jauns rēķins</h1>
      <p className="mb-4 mt-1 text-xs text-text/50">
        Numuru piešķir automātiski (YYYY-NNN) pēc saglabāšanas.
      </p>

      <div className="space-y-4 rounded-2xl border border-gold/25 bg-navy/30 p-6">
        <div>
          <label className={label}>Pieteikums (neobligāts)</label>
          <select
            value={bookingId}
            onChange={(e) => onPickBooking(e.target.value)}
            className={`${field} mt-1`}
          >
            <option value="">— bez pieteikuma (manuāls) —</option>
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label} · {eur(b.amount_net)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Izrakstīšanas datums</label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className={`${field} mt-1`}
            />
          </div>
          <div>
            <label className={label}>Apmaksas termiņš</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`${field} mt-1`}
            />
          </div>
          <div>
            <label className={label}>Summa bez PVN (€)</label>
            <input
              type="number"
              step="0.01"
              value={net}
              onChange={(e) => setNet(Number(e.target.value))}
              className={`${field} mt-1`}
            />
          </div>
          <div>
            <label className={label}>PVN likme (%)</label>
            <input
              type="number"
              step="1"
              value={vatRate}
              onChange={(e) => setVatRate(Number(e.target.value))}
              className={`${field} mt-1`}
            />
          </div>
        </div>

        <div className="rounded-lg border border-gold/20 bg-bg/40 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-text/60">Bez PVN</span>
            <span className="font-mono">{eur(amounts.amount_net)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text/60">PVN {vatRate}%</span>
            <span className="font-mono">{eur(amounts.vat_amount)}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-gold/15 pt-1 font-semibold">
            <span>Kopā</span>
            <span className="font-mono text-gold">
              {eur(amounts.amount_total)}
            </span>
          </div>
        </div>

        <div>
          <label className={label}>Statuss</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
            className={`${field} mt-1`}
          >
            {INVOICE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {INVOICE_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label}>Piezīmes</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${field} mt-1`}
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={save}
            disabled={pending}
            className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            {pending ? "Saglabā…" : "Izveidot rēķinu"}
          </button>
          {msg && <span className="text-xs text-red-300">{msg}</span>}
        </div>
      </div>
    </div>
  );
}
