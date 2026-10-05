import { test } from "node:test";
import assert from "node:assert/strict";
import { bookingMoney, summarizeRevenue, type RevenueBooking } from "@/lib/revenue";

const TODAY = "2026-10-05";
const bk = (o: Partial<RevenueBooking> & { id: string }): RevenueBooking => ({
  event_date: "2026-10-10",
  status: "confirmed",
  final_total: null,
  estimated_total: 0,
  delivery_cost: 0,
  paid_sum: 0,
  ...o,
});

test("pilnībā apmaksāta (bruto 598,95) → ieņēmumi neto 495, PVN 103,95", () => {
  const m = bookingMoney(bk({ id: "a", estimated_total: 470, delivery_cost: 25, paid_sum: 598.95 }));
  assert.equal(m.paid, true);
  assert.deepEqual(m.received, { net: 495, vat: 103.95, gross: 598.95 });
  assert.deepEqual(m.outstanding, { net: 0, vat: 0, gross: 0 });
});

test("bruto maksājums netiek skaitīts kā neto ieņēmums (nav ×1,21 uzpūšanās)", () => {
  const s = summarizeRevenue(
    [bk({ id: "a", estimated_total: 470, delivery_cost: 25, paid_sum: 598.95 })],
    TODAY,
  );
  assert.equal(s.all.received.net, 495);
  assert.equal(s.all.received.gross, 598.95);
});

test("daļēja apmaksa (avanss 121 bruto) → 100 neto, atlikums neto/bruto", () => {
  const m = bookingMoney(bk({ id: "a", estimated_total: 400, paid_sum: 121 }));
  assert.equal(m.paid, false);
  assert.deepEqual(m.received, { net: 100, vat: 21, gross: 121 });
  assert.deepEqual(m.outstanding, { net: 300, vat: 63, gross: 363 });
});

test("vecā neto atzīme (maksājums = neto) NAV pilna apmaksa", () => {
  const m = bookingMoney(bk({ id: "a", estimated_total: 495, paid_sum: 495 }));
  assert.equal(m.paid, false);
});

test("kopsavilkums: mēnesis/gads pēc Rīgas datuma, atteiktās izslēgtas, PVN atsevišķi", () => {
  const rows = [
    bk({ id: "oct-paid", event_date: "2026-10-03", status: "completed", estimated_total: 100, paid_sum: 121 }),
    bk({ id: "oct-open", event_date: "2026-10-20", estimated_total: 200 }),
    bk({ id: "may-paid", event_date: "2026-05-01", status: "completed", estimated_total: 300, paid_sum: 363 }),
    bk({ id: "next-year", event_date: "2027-01-10", estimated_total: 50 }),
    bk({ id: "rej", event_date: "2026-10-04", status: "rejected", estimated_total: 999, paid_sum: 999 }),
  ];
  const s = summarizeRevenue(rows, TODAY);
  assert.deepEqual(s.month.received, { net: 100, vat: 21, gross: 121 });
  assert.deepEqual(s.month.planned, { net: 300, vat: 63, gross: 363 });
  assert.deepEqual(s.year.received, { net: 400, vat: 84, gross: 484 });
  assert.equal(s.year.planned.net, 600);
  assert.equal(s.all.total.net, 650);
  assert.equal(s.all.count, 4);
  assert.equal(s.all.waitingCount, 2);
  assert.equal(s.awaitingCount, 2); // confirmed + nav apmaksāts
  assert.equal(s.byId.has("rej"), false);
});

test("nezināma piegāde (null) netiek pieskaitīta plānotajam", () => {
  const s = summarizeRevenue([bk({ id: "a", estimated_total: 220, delivery_cost: null })], TODAY);
  assert.equal(s.all.total.net, 220);
});
