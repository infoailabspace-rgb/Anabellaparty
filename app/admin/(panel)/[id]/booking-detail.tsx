"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { STATUSES, type Booking } from "@/lib/admin";
import {
  bookingBadge,
  bookingAmount,
  paymentState,
  PAYMENT_STATE_LABEL,
  type PaymentState,
} from "@/lib/booking-status";
import { setStatus, saveNotes, setPaymentState, deleteBooking } from "../actions";

const PAY_STATES: PaymentState[] = ["unpaid", "partial", "paid", "deferred"];

export default function BookingDetail({ booking }: { booking: Booking }) {
  const router = useRouter();
  const [status, setStatusState] = useState(booking.status);
  const [notes, setNotes] = useState(booking.admin_notes ?? "");
  const [notesSaved, setNotesSaved] = useState(true);
  const [paidSum, setPaidSum] = useState(booking.paid_sum ?? 0);
  const [deferred, setDeferred] = useState(Boolean(booking.payment_deferred));
  const [payMsg, setPayMsg] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [avansModal, setAvansModal] = useState(false);
  const [avansInput, setAvansInput] = useState("");
  const [avansError, setAvansError] = useState("");
  const [pending, startTransition] = useTransition();
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const amount = bookingAmount(booking);

  // Re-sinhronizē lokālo stāvokli, kad propi mainās (pēc router.refresh() vai
  // navigācijas). `useState` nolasa propu tikai mount laikā, tāpēc bez šī UI
  // rādītu novecojušu optimistisko vērtību, kas "atgriežas" tikai pēc remounta.
  useEffect(() => {
    setStatusState(booking.status);
  }, [booking.status]);
  useEffect(() => {
    setPaidSum(booking.paid_sum ?? 0);
  }, [booking.paid_sum]);
  useEffect(() => {
    setDeferred(Boolean(booking.payment_deferred));
  }, [booking.payment_deferred]);

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

  // Statusa maiņa pēc apmaksas ceļa parauga: optimistiski + GAIDA servera
  // rezultātu. Kļūdas gadījumā atritina lokālo stāvokli un parāda ziņojumu;
  // veiksmē pārlādē datus. `disabled={pending}` neļauj dubultklikšķi vai
  // aiziešanu prom pirms saglabāšanas.
  function onStatus(v: string) {
    const prev = status;
    setStatusMsg("");
    setStatusState(v);
    startTransition(async () => {
      const res = await setStatus(booking.id, v);
      if (res?.error) {
        setStatusState(prev);
        setStatusMsg(res.error);
        return;
      }
      router.refresh();
    });
  }

  // "Daļēji (avanss)" → atver modāli (nevis pārlūka prompt). Pārējie stāvokļi
  // tiek piemēroti uzreiz.
  function onPayment(next: PaymentState) {
    if (next === "partial") {
      setAvansInput("");
      setAvansError("");
      setAvansModal(true);
      return;
    }
    applyPayment(next);
  }

  function confirmAvans() {
    const a = Number(avansInput.replace(",", "."));
    if (!a || a <= 0) {
      setAvansError("Nederīga summa.");
      return;
    }
    setAvansModal(false);
    applyPayment("partial", a);
  }

  // Piemēro apmaksas stāvokli: optimistiski + GAIDA servera rezultātu. Kļūdu
  // parāda (agrāk `void` to klusi ignorēja → "summa nesaglabājās"). Veiksmē
  // pārlādē datus, lai attēls vienmēr sakrīt ar DB.
  function applyPayment(next: PaymentState, avans?: number) {
    setPayMsg("");
    setPaidSum(next === "paid" ? amount : next === "partial" ? (avans as number) : 0);
    setDeferred(next === "deferred");
    startTransition(async () => {
      const res = await setPaymentState(booking.id, next, avans);
      if (res?.error) {
        setPayMsg(res.error);
        return;
      }
      router.refresh();
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
          disabled={pending}
          className={`mt-1 block w-full ${field} disabled:opacity-60`}
        >
          {STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        {statusMsg && (
          <p className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300">
            {statusMsg}
          </p>
        )}
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
        {payMsg && (
          <p className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300">
            {payMsg}
          </p>
        )}
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

      {/* Dzēšana — pārcelta no saraksta uz detaļu skatu */}
      <div className="border-t border-gold/15 pt-4">
        <button
          type="button"
          onClick={() => {
            if (!confirm(`Vai tiešām dzēst pieteikumu no ${booking.name}? Šo darbību nevar atsaukt.`)) return;
            startTransition(async () => {
              await deleteBooking(booking.id);
              router.push("/admin");
            });
          }}
          className="text-sm text-red-300 transition-colors hover:text-red-200"
        >
          Dzēst pieteikumu
        </button>
      </div>

      {/* Avansa summas modālis — sistēmas dizains (navy fons, zelta akcenti) */}
      {avansModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setAvansModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-gold/30 bg-navy p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-bold text-gold">
              Avansa summa
            </h3>
            <p className="mt-1 text-sm text-text/60">
              Norādi saņemto avansa summu (€) šai rezervācijai.
            </p>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              autoFocus
              value={avansInput}
              onChange={(e) => {
                setAvansInput(e.target.value);
                setAvansError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmAvans();
                if (e.key === "Escape") setAvansModal(false);
              }}
              placeholder="0"
              className={`mt-4 w-full ${field}`}
            />
            {avansError && (
              <p className="mt-2 text-xs text-red-300">{avansError}</p>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setAvansModal(false)}
                className="rounded-full border border-gold/40 px-4 py-2 text-sm text-text/80 hover:border-gold"
              >
                Atcelt
              </button>
              <button
                type="button"
                onClick={confirmAvans}
                disabled={pending}
                className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black disabled:opacity-60"
              >
                Apstiprināt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
