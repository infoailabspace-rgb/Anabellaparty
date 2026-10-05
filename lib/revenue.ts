// Paneļa (/admin/parskats) naudas rādītāji. Ieņēmumi = NETO (bez PVN) no
// rezervāciju neto summām; PVN un bruto - atsevišķi rādītāji. Maksājumi
// (payments.amount) ir BRUTO, tāpēc tos izmanto tikai statusam (apmaksāts?)
// un daļējai apmaksai pārrēķina uz neto (bruto / (1 + PVN)).
// PVN loģika - TĀ PATI bookingTotals/computeTotals, ko forma un e-pasti.
import { bookingTotals } from "@/lib/booking-status";
import { VAT_RATE, PRICES_INCLUDE_VAT } from "@/lib/company";

const round2 = (n: number) => Math.round(n * 100) / 100;

export type RevenueBooking = {
  id: string;
  event_date: string;
  status: string;
  final_total?: number | null;
  estimated_total?: number | null;
  delivery_cost?: number | null;
  paid_sum: number; // completed maksājumu summa (bruto)
};

export type MoneyTriple = { net: number; vat: number; gross: number };

export type BookingMoney = {
  id: string;
  net: number;
  gross: number;
  paid: boolean;
  received: MoneyTriple; // saņemtais (neto no rezervācijas summas vai bruto/1.21)
  outstanding: MoneyTriple; // vēl jāsaņem
};

const triple = (net: number, gross: number): MoneyTriple => ({
  net: round2(net),
  vat: round2(gross - net),
  gross: round2(gross),
});

/** Vienas rezervācijas naudas sadalījums. */
export function bookingMoney(b: RevenueBooking): BookingMoney {
  const t = bookingTotals(b);
  const paidSum = Number(b.paid_sum) || 0;
  const paid = t.gross <= 0 || paidSum >= t.gross;
  const received = paid
    ? triple(t.net, t.gross)
    : triple(PRICES_INCLUDE_VAT ? paidSum : paidSum / (1 + VAT_RATE), paidSum);
  return {
    id: b.id,
    net: t.net,
    gross: t.gross,
    paid,
    received,
    outstanding: triple(Math.max(0, t.net - received.net), Math.max(0, t.gross - received.gross)),
  };
}

function sum(list: MoneyTriple[]): MoneyTriple {
  const net = list.reduce((s, x) => s + x.net, 0);
  const gross = list.reduce((s, x) => s + x.gross, 0);
  return triple(net, gross);
}

export type RevenueSummary = {
  month: { received: MoneyTriple; planned: MoneyTriple };
  year: { received: MoneyTriple; planned: MoneyTriple };
  all: {
    received: MoneyTriple;
    outstanding: MoneyTriple;
    total: MoneyTriple;
    count: number;
    waitingCount: number;
  };
  awaitingCount: number; // apstiprinātas, nav pilnībā apmaksātas
  byId: Map<string, BookingMoney>;
};

/**
 * Kopsavilkums. `today` = Rīgas datums (YYYY-MM-DD). Atteiktās (rejected)
 * rezervācijas izslēdz izsaucējs vai šī funkcija (status === "rejected").
 */
export function summarizeRevenue(rows: RevenueBooking[], today: string): RevenueSummary {
  const list = rows.filter((r) => r.status !== "rejected");
  const money = list.map((r) => ({ r, m: bookingMoney(r) }));
  const month = today.slice(0, 7);
  const year = today.slice(0, 4);
  const inMonth = money.filter(({ r }) => r.event_date?.slice(0, 7) === month);
  const inYear = money.filter(({ r }) => r.event_date?.slice(0, 4) === year);
  const plannedOf = (xs: typeof money) => sum(xs.map(({ m }) => triple(m.net, m.gross)));
  return {
    month: { received: sum(inMonth.map(({ m }) => m.received)), planned: plannedOf(inMonth) },
    year: { received: sum(inYear.map(({ m }) => m.received)), planned: plannedOf(inYear) },
    all: {
      received: sum(money.map(({ m }) => m.received)),
      outstanding: sum(money.filter(({ m }) => !m.paid).map(({ m }) => m.outstanding)),
      total: plannedOf(money),
      count: money.length,
      waitingCount: money.filter(({ m }) => !m.paid).length,
    },
    awaitingCount: money.filter(({ r, m }) => r.status === "confirmed" && !m.paid).length,
    byId: new Map(money.map(({ m }) => [m.id, m])),
  };
}
