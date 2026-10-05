import { test } from "node:test";
import assert from "node:assert/strict";
import {
  rigaToday,
  isPastDate,
  addDays,
  daysUntil,
  normalizeTime,
  eventTimeForDb,
  formatDateLv,
  deliveryDateTime,
  deliveryText,
  shiftDateTime,
  formatTimestampRiga,
  parseDateOnly,
  DELIVERY_TBD_TEXT,
} from "@/lib/riga-time";

// --- Piegādes laiks = pasākums - 60 min, ar datuma pārbīdi -------------------

test("00:00 pasākums → piegāde iepriekšējā dienā 23:00 (bijušais bugs: tā pati diena)", () => {
  assert.deepEqual(deliveryDateTime("2026-09-30", "00:00"), { date: "2026-09-29", time: "23:00" });
  assert.equal(deliveryText("2026-09-30", "00:00:00"), "29.09.2026 plkst. 23:00");
});

test("00:30 pasākums → iepriekšējā diena 23:30", () => {
  assert.deepEqual(deliveryDateTime("2026-09-30", "00:30"), { date: "2026-09-29", time: "23:30" });
});

test("01:00 → tā pati diena 00:00; 19:00 → 18:00", () => {
  assert.deepEqual(deliveryDateTime("2026-09-30", "01:00"), { date: "2026-09-30", time: "00:00" });
  assert.deepEqual(deliveryDateTime("2026-09-24", "19:00:00"), { date: "2026-09-24", time: "18:00" });
});

test("mēneša un gada robeža", () => {
  assert.deepEqual(deliveryDateTime("2026-10-01", "00:15"), { date: "2026-09-30", time: "23:15" });
  assert.deepEqual(deliveryDateTime("2027-01-01", "00:00"), { date: "2026-12-31", time: "23:00" });
  assert.deepEqual(shiftDateTime("2026-12-31", "23:30", 60), { date: "2027-01-01", time: "00:30" });
});

test("bez laika → null un 'piegādes laiks tiks saskaņots' (nekad izdomāts laiks)", () => {
  assert.equal(deliveryDateTime("2026-09-30", null), null);
  assert.equal(deliveryDateTime("2026-09-30", ""), null);
  assert.equal(deliveryText("2026-09-30", undefined), DELIVERY_TBD_TEXT);
});

test("DST beigas 25.10.2026 (04:00 EEST → 03:00 EET): wall-clock aritmētika nemainās", () => {
  assert.deepEqual(deliveryDateTime("2026-10-25", "03:30"), { date: "2026-10-25", time: "02:30" });
  assert.deepEqual(deliveryDateTime("2026-10-26", "00:00"), { date: "2026-10-25", time: "23:00" });
  assert.equal(addDays("2026-10-25", 1), "2026-10-26");
  assert.equal(addDays("2026-03-29", -1), "2026-03-28"); // DST sākums
});

// --- Šodiena Rīgā ap pusnakti --------------------------------------------------

test("rigaToday: 21:30 UTC vasaras laikā jau ir nākamā diena Rīgā (UTC+3)", () => {
  assert.equal(rigaToday(new Date("2026-09-29T20:59:59Z")), "2026-09-29"); // 23:59:59
  assert.equal(rigaToday(new Date("2026-09-29T21:00:00Z")), "2026-09-30"); // 00:00
});

test("rigaToday: pusnakts ap DST maiņu 25.10.2026", () => {
  // 24.10 21:30Z = 25.10 00:30 EEST (+3)
  assert.equal(rigaToday(new Date("2026-10-24T21:30:00Z")), "2026-10-25");
  // 25.10 21:30Z = 25.10 23:30 EET (+2) - joprojām 25.
  assert.equal(rigaToday(new Date("2026-10-25T21:30:00Z")), "2026-10-25");
  // 25.10 22:00Z = 26.10 00:00 EET
  assert.equal(rigaToday(new Date("2026-10-25T22:00:00Z")), "2026-10-26");
});

test("isPastDate: salīdzina ar Rīgas šodienu, ne UTC", () => {
  // 01:00 Rīgā 01.10 = 30.09 22:00 UTC. UTC datums vēl 30.09, Rīgā jau 01.10.
  const now = new Date("2026-09-30T22:00:00Z");
  assert.equal(isPastDate("2026-09-30", now), true);
  assert.equal(isPastDate("2026-10-01", now), false);
  assert.equal(isPastDate(null, now), false);
});

test("daysUntil", () => {
  const now = new Date("2026-10-05T07:00:00Z");
  assert.equal(daysUntil("2026-10-05", now), 0);
  assert.equal(daysUntil("2026-10-06", now), 1);
  assert.equal(daysUntil("2026-09-30", now), -5);
});

// --- Laika/datuma normalizācija ------------------------------------------------

test("normalizeTime / eventTimeForDb: tukšs un 00:00 no admin formas = null", () => {
  assert.equal(normalizeTime("18:00:00"), "18:00");
  assert.equal(normalizeTime("7:05"), "07:05");
  assert.equal(normalizeTime("00:00"), "00:00");
  assert.equal(normalizeTime("25:00"), null);
  assert.equal(normalizeTime(""), null);
  assert.equal(eventTimeForDb(""), null);
  assert.equal(eventTimeForDb("00:00"), null);
  assert.equal(eventTimeForDb("00:00:00"), null);
  assert.equal(eventTimeForDb("00:30"), "00:30");
  assert.equal(eventTimeForDb("19:00"), "19:00");
});

test("formatDateLv / parseDateOnly: date-only bez UTC nobīdes", () => {
  assert.equal(formatDateLv("2026-09-30"), "30.09.2026");
  assert.equal(formatDateLv("2026-01-01"), "01.01.2026");
  assert.equal(parseDateOnly("2026-02-31"), null);
});

test("formatTimestampRiga: UTC zīmogs rādās Rīgas laikā", () => {
  // 2026-10-05 07:00:41Z = 10:00 EEST
  const s = formatTimestampRiga("2026-10-05T07:00:41Z");
  assert.match(s, /05\.10\.2026/);
  assert.match(s, /10:00/);
});
