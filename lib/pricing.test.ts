import { test } from "node:test";
import assert from "node:assert/strict";
import { computeTotals, computeDeposit } from "@/lib/pricing";

// Cenas bez PVN (PRICES_INCLUDE_VAT=false), VAT_RATE=0.21, avanss 50%.
const SUBTOTAL = 100;

test("computeTotals: piegāde null (nezināma) → izslēgta, kā bez piegādes", () => {
  const t = computeTotals(SUBTOTAL, null);
  assert.equal(t.net, 100);
  assert.equal(t.vat, 21);
  assert.equal(t.gross, 121);
  assert.equal(t.deposit, 60.5);
});

test("computeTotals: piegāde 0 (bezmaksas zona) → tāpat kā null", () => {
  const t = computeTotals(SUBTOTAL, 0);
  assert.equal(t.net, 100);
  assert.equal(t.vat, 21);
  assert.equal(t.gross, 121);
  assert.equal(t.deposit, 60.5);
});

test("computeTotals: null un 0 dod identisku rezultātu", () => {
  assert.deepEqual(computeTotals(SUBTOTAL, null), computeTotals(SUBTOTAL, 0));
});

test("computeTotals: piegāde 25 → pieskaita neto un pārrēķina PVN/avansu", () => {
  const t = computeTotals(SUBTOTAL, 25);
  assert.equal(t.net, 125);
  assert.equal(t.vat, 26.25);
  assert.equal(t.gross, 151.25);
  assert.equal(t.deposit, 75.63);
});

test("computeTotals: noklusējums (nav argumenta) = bez piegādes", () => {
  assert.deepEqual(computeTotals(SUBTOTAL), computeTotals(SUBTOTAL, 0));
});

test("computeDeposit: null/0/25 sakrīt ar computeTotals().deposit", () => {
  assert.equal(computeDeposit(SUBTOTAL, null), 60.5);
  assert.equal(computeDeposit(SUBTOTAL, 0), 60.5);
  assert.equal(computeDeposit(SUBTOTAL, 25), 75.63);
  assert.equal(computeDeposit(SUBTOTAL, 25), computeTotals(SUBTOTAL, 25).deposit);
});
