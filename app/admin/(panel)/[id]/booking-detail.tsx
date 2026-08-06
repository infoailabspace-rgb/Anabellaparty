"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { STATUSES, type Booking } from "@/lib/admin";
import { setStatus, saveNotes, setFinalTotal } from "../actions";

export default function BookingDetail({ booking }: { booking: Booking }) {
  const [status, setStatusState] = useState(booking.status);
  const [notes, setNotes] = useState(booking.admin_notes ?? "");
  const [notesSaved, setNotesSaved] = useState(true);
  const [finalTotal, setFinalTotalState] = useState(
    booking.final_total != null ? String(booking.final_total) : "",
  );
  const [, startTransition] = useTransition();
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  function onFinalBlur() {
    const val = finalTotal.trim() === "" ? null : Number(finalTotal);
    startTransition(() => setFinalTotal(booking.id, Number.isFinite(val as number) ? val : null));
  }

  const field =
    "rounded-lg border border-gold/25 bg-navy/40 px-3 py-2 text-sm text-text outline-none focus:border-gold";

  return (
    <div className="space-y-5 rounded-2xl border border-gold/25 bg-navy/30 p-6">
      <div>
        <label className="text-xs uppercase tracking-wide text-text/50">
          Statuss
        </label>
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
          Cenas korekcija (galīgā summa €)
        </label>
        <input
          type="number"
          value={finalTotal}
          onChange={(e) => setFinalTotalState(e.target.value)}
          onBlur={onFinalBlur}
          placeholder={`Aprēķināts: ${booking.estimated_total ?? 0} €`}
          className={`mt-1 block w-full ${field}`}
        />
        <p className="mt-1 text-xs text-text/40">
          Aprēķinātā summa: {booking.estimated_total ?? 0} €. Ieraksti galīgo, ja
          atšķiras.
        </p>
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
