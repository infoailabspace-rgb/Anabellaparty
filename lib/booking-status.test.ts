import { test } from "node:test";
import assert from "node:assert/strict";
import { bookingAmount, bookingTotals, paymentState, paymentBadge } from "@/lib/booking-status";
import { computeTotals } from "@/lib/pricing";

// Piemērs no audita: inventārs 470 + piegāde 25 = 495 neto.
const B = { estimated_total: 470, delivery_cost: 25, final_total: null };

test("495 neto → 598,95 bruto (PVN 103,95)", () => {
  const t = bookingTotals(B);
  assert.equal(t.net, 495);
  assert.equal(t.vat, 103.95);
  assert.equal(t.gross, 598.95);
  assert.equal(bookingAmount(B), 598.95);
});

test("bookingTotals = tā pati computeTotals, ko publiskā forma un e-pasts (bez dublēšanas)", () => {
  assert.deepEqual(bookingTotals(B), computeTotals(470, 25));
});

test("final_total (neto, ar piegādi) arī tiek pārvērsts bruto", () => {
  assert.equal(bookingAmount({ estimated_total: 0, delivery_cost: null, final_total: 495 }), 598.95);
});

test("nezināma piegāde (null) izslēgta, nevis 0 kā bezmaksas", () => {
  assert.equal(bookingTotals({ estimated_total: 470, delivery_cost: null }).net, 470);
  assert.equal(bookingTotals({ estimated_total: 470, delivery_cost: 0 }).net, 470);
});

test("'Apmaksāts' tikai pie maksājumu summas >= bruto", () => {
  const amount = bookingAmount(B); // 598,95
  assert.equal(paymentState(495, amount), "partial"); // neto summa NAV pilna apmaksa
  assert.equal(paymentState(598.94, amount), "partial");
  assert.equal(paymentState(598.95, amount), "paid");
  assert.equal(paymentState(600, amount), "paid");
  assert.equal(paymentBadge(495, amount, "2030-01-01", false).key, "partial");
  assert.equal(paymentBadge(598.95, amount, "2030-01-01", false).key, "paid");
});

test("avanss 50% no bruto", () => {
  const t = bookingTotals(B);
  assert.equal(t.deposit, 299.48); // 598,95 / 2 = 299,475 → 299,48
  assert.equal(t.deposit, Math.round(t.gross * 0.5 * 100) / 100);
});
