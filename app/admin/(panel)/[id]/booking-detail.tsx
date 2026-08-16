"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { STATUSES, type Booking } from "@/lib/admin";
import {
  bookingBadge,
  bookingAmount,
  paymentState,
  PAYMENT_STATE_LABEL,
  type PaymentState,
} from "@/lib/booking-status";
import { setStatus, saveNotes, setPaymentState } from "../actions";

const PAY_STATES: PaymentState[] = ["unpaid", "partial", "paid", "deferred"];

export default function BookingDetail({ booking }: { booking: Booking }) {
  const [status, setStatusState] = useState(booking.status);
  const [notes, setNotes] = useState(booking.admin_notes ?? "");
  const [notesSaved, setNotesSaved] = useState(true);
  const [paidSum, setPaidSum] = useState(booking.paid_sum ?? 0);
  const [deferred, setDeferred] = useState(Boolean(booking.payment_deferred));
  const [, startTransition] = useTransition();
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const amount = bookingAmount(booking);

  // Piezīmju autosave (debounce)
  useEffect(() => {
    if (notesTimer.current) clearTimeout(notesTimer.current);
    if (notes === (booking.admin_notes ?? "")) {
      setNotesSaved(true);
      return;
    }
    setNotesSaved(false);
    notesTimer.current = setTimeout(() => {
      startTransition(async () => {
        await saveNotes(booking.id, notes);
        setNotesSaved(true);
      });
    }, 800);
    return () => {
      if (notesTimer.current) clearTimeout(notesTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  function onStatus(v: string) {
    setStatusState(v);
    startTransition(() => setStatus(booking.id, v));
  }

  function onPayment(next: PaymentState) {
    let avans: number | undefined;
    if (next === "partial") {
      const input = window.prompt("Avansa summa (€)?", "");
      if (input == null) return;
      avans = Number(input.replace(",", "."));
      if (!avans || avans <= 0) {
        alert("Nederīga summa.");
        return;
      }
    }
    setPaidSum(next === "paid" ? amount : next === "partial" ? (avans as number) : 0);
    setDeferred(next === "deferred");
    startTransition(() => {
      void setPaymentState(booking.id, next, avans);
    });
  }

  const field =
    "rounded-lg border border-gold/25 bg-navy/40 px-3 py-2 text-sm text-text outline-none focus:border-gold";

  return (
    <div className="space-y-5 rounded-2xl border border-gold/25 bg-navy/30 p-6">
      <div>
        <label className="text-xs uppercase tracking-wide text-text/50">
          Statuss
        </label>
        {(() => {
          const bg = bookingBadge(
            status,
            paidSum,
            amount,
            booking.event_date,
            deferred,
          );
          return (
            <span
              className={`ml-2 rounded-full border px-2 py-0.5 text-[11px] ${bg.cls}`}
            >
              {bg.label}
            </span>
          );
        })()}
        <select
          value={status}
          onChange={(e) => onStatus(e.target.value)}
          className={`mt-1 block w-full ${field}`}
        >
          {STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-text/50">
          Apmaksa
        </label>
        <select
          value={paymentState(paidSum, amount, deferred)}
          onChange={(e) => onPayment(e.target.value as PaymentState)}
          className={`mt-1 block w-full ${field}`}
        >
          {PAY_STATES.map((s) => (
            <option key={s} value={s}>
              {PAYMENT_STATE_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-text/50">
          Iekšējās piezīmes{" "}
          <span className="text-text/30">{notesSaved ? "· saglabāts" : "· saglabā…"}</span>
        </label>
        <textarea
          rows={5}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`mt-1 block w-full ${field}`}
        />
      </div>
    </div>
  );
}
