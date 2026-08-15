// Vienota rezervācijas statusa + apmaksas krāsu shēma (visā CRM konsekventi).
// Apvieno booking_requests.status UN apmaksas stāvokli (payments summa pret kopējo).

export type BookingBadge = { key: string; label: string; cls: string };

const PRE_CONFIRMATION = new Set(["new", "contacted", "quoted"]);

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

export function bookingBadge(
  status: string,
  paidSum: number,
  amount: number,
  eventDate: string,
): BookingBadge {
  if (status === "rejected")
    return { key: "rejected", label: "Atteicās", cls: "border-text/30 text-text/50" };

  // 🔵 Pirms-apstiprināšanas — nosūtīts, gaida klienta apstiprinājumu.
  if (PRE_CONFIRMATION.has(status))
    return {
      key: "pending",
      label: "Gaida apstiprinājumu",
      cls: "border-blue-400/40 bg-blue-500/10 text-blue-300",
    };

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

  // 🔴 Kavēts — nav apmaksāts un pasākuma datums pagājis.
  if (isPast(eventDate))
    return {
      key: "overdue",
      label: "Kavēts",
      cls: "border-red-500/50 bg-red-500/10 text-red-300",
    };

  // 🟡 Apstiprināts, nav apmaksāts (gaidāms pasākums).
  return {
    key: "unpaid",
    label: "Nav apmaksāts",
    cls: "border-yellow-500/50 bg-yellow-500/10 text-yellow-300",
  };
}
