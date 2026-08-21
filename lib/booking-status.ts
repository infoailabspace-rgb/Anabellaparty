// Vienota rezervācijas statusa + apmaksas krāsu shēma (visā CRM konsekventi).
// Apvieno booking_requests.status UN apmaksas stāvokli (payments summa pret kopējo).

export type BookingBadge = { key: string; label: string; cls: string };

function isPast(eventDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(eventDate);
  d.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
}

/** Rezervācijas summa: final_total, citādi estimated_total + delivery_cost. */
export function bookingAmount(b: {
  final_total?: number | null;
  estimated_total?: number | null;
  delivery_cost?: number | null;
}): number {
  if (b.final_total != null) return Number(b.final_total);
  return (Number(b.estimated_total) || 0) + (Number(b.delivery_cost) || 0);
}

/** Apmaksas stāvoklis (dropdown vērtība) no paid_sum + deferred karodziņa. */
export type PaymentState = "unpaid" | "partial" | "paid" | "deferred";

export function paymentState(
  paidSum: number,
  amount: number,
  deferred?: boolean | null,
): PaymentState {
  if (amount > 0 && paidSum >= amount) return "paid";
  if (paidSum > 0) return "partial";
  if (deferred) return "deferred";
  return "unpaid";
}

export const PAYMENT_STATE_LABEL: Record<PaymentState, string> = {
  unpaid: "Nav apmaksāts",
  partial: "Daļēji (avanss)",
  paid: "Apmaksāts",
  deferred: "Maksās pēc pasākuma",
};

// ── DARBPLŪSMAS statuss (atsevišķi no apmaksas) ──────────────────────────────
// Krāsas ATTURĪGAS (pelēks/zils/zaļš) un tikai kontūra (bez bg-pildījuma), lai
// NEKONKURĒ ar apmaksas uzlīmēm, kuras ir informatīvi svarīgākās (bg-pildījums).
const STATUS_META: Record<string, { label: string; cls: string }> = {
  new: { label: "Jauns", cls: "border-text/30 text-text/70" },
  contacted: { label: "Sazinājos", cls: "border-blue-400/40 text-blue-300/90" },
  quoted: { label: "Piedāvājums nosūtīts", cls: "border-blue-400/40 text-blue-300/90" },
  confirmed: { label: "Apstiprināts", cls: "border-green-500/40 text-green-300/90" },
  completed: { label: "Pabeigts", cls: "border-text/25 bg-text/5 text-text/70" },
  rejected: { label: "Atteicās", cls: "border-text/20 text-text/45" },
};

/** Darbplūsmas statuss: Jauns / Sazinājos / Piedāvāts / Apstiprināts / Pabeigts / Atteicās. */
export function statusBadge(status: string): BookingBadge {
  const m = STATUS_META[status] ?? {
    label: status,
    cls: "border-text/30 text-text/70",
  };
  return { key: status, label: m.label, cls: m.cls };
}

// ── APMAKSAS stāvoklis (atsevišķi no statusa) ────────────────────────────────
// `deferred` ir OBLIGĀTS arguments (ne optional), lai TypeScript noķer, ja kāds
// izsaukums to izlaiž (agrāk 3 skati to darīja → nekonsekventa krāsa).
/** Apmaksa: Apmaksāts / Daļēji / Maksās pēc / Kavēts / Nav apmaksāts. */
export function paymentBadge(
  paidSum: number,
  amount: number,
  eventDate: string,
  deferred: boolean | null,
): BookingBadge {
  // 🟢 Pilnībā apmaksāts (arī €0 rezervācijas — nav ko maksāt).
  if (amount <= 0 || paidSum >= amount)
    return {
      key: "paid",
      label: "Apmaksāts",
      cls: "border-green-500/40 bg-green-500/10 text-green-300",
    };

  // 🟠 Daļēji (avanss samaksāts).
  if (paidSum > 0)
    return {
      key: "partial",
      label: "Daļēji (avanss)",
      cls: "border-orange-500/50 bg-orange-500/10 text-orange-300",
    };

  // 🟣 Maksās pēc pasākuma — apzināta vienošanās (nevis vienkārši neapmaksāts/kavēts).
  if (deferred)
    return {
      key: "deferred",
      label: "Maksās pēc pasākuma",
      cls: "border-purple-400/40 bg-purple-500/10 text-purple-300",
    };

  // 🔴 Kavēts — nav apmaksāts un pasākuma datums pagājis.
  if (isPast(eventDate))
    return {
      key: "overdue",
      label: "Kavēts",
      cls: "border-red-500/50 bg-red-500/10 text-red-300",
    };

  // 🟡 Nav apmaksāts (gaidāms pasākums).
  return {
    key: "unpaid",
    label: "Nav apmaksāts",
    cls: "border-yellow-500/50 bg-yellow-500/10 text-yellow-300",
  };
}

/** Apmaksas punkta krāsa (šauriem skatiem, piem. kalendārs). */
export const PAYMENT_DOT: Record<string, string> = {
  paid: "bg-green-500",
  partial: "bg-orange-500",
  deferred: "bg-purple-500",
  overdue: "bg-red-500",
  unpaid: "bg-yellow-500",
};
