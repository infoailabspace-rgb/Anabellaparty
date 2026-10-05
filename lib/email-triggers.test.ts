import { test } from "node:test";
import assert from "node:assert/strict";
import {
  shouldSendConfirmation,
  shouldSendReminder,
  shouldAutoComplete,
  reminderTargetDate,
  isDeliverableEmail,
} from "@/lib/email-triggers";

// 2026-10-05 10:00 Rīgā
const NOW = new Date("2026-10-05T07:00:00Z");
const base = {
  prevStatus: "new",
  newStatus: "confirmed",
  eventDate: "2026-10-20",
  email: "klients@example.lv",
  now: NOW,
};

test("apstiprinājums: pāreja new → confirmed nākotnes pasākumam = sūta", () => {
  assert.deepEqual(shouldSendConfirmation(base), { send: true, reason: "transition-to-confirmed" });
});

test("apstiprinājums: confirmed → confirmed (atkārtots klikšķis) = NEsūta", () => {
  assert.equal(shouldSendConfirmation({ ...base, prevStatus: "confirmed" }).send, false);
});

test("apstiprinājums: pagājis pasākums (6c1c52c7 gadījums, 30.09 apstiprināts 05.10) = NEsūta", () => {
  const d = shouldSendConfirmation({ ...base, eventDate: "2026-09-30" });
  assert.deepEqual(d, { send: false, reason: "event-in-past" });
});

test("apstiprinājums: pasākums šodien = sūta (vēl nav pagājis)", () => {
  assert.equal(shouldSendConfirmation({ ...base, eventDate: "2026-10-05" }).send, true);
});

test("apstiprinājums: robeža ap pusnakti - Rīgā jau 06.10, UTC vēl 05.10", () => {
  const lateNow = new Date("2026-10-05T21:30:00Z"); // 06.10 00:30 Rīgā
  assert.equal(
    shouldSendConfirmation({ ...base, eventDate: "2026-10-05", now: lateNow }).send,
    false,
  );
});

test("apstiprinājums: admins noņēma ķeksi = NEsūta", () => {
  assert.deepEqual(shouldSendConfirmation({ ...base, adminWantsEmail: false }), {
    send: false,
    reason: "admin-opt-out",
  });
});

test("apstiprinājums: e-pasts '-' vai tukšs = NEsūta", () => {
  assert.equal(shouldSendConfirmation({ ...base, email: "-" }).send, false);
  assert.equal(shouldSendConfirmation({ ...base, email: null }).send, false);
});

test("apstiprinājums: cits mērķa statuss = NEsūta", () => {
  assert.equal(shouldSendConfirmation({ ...base, newStatus: "completed" }).send, false);
});

test("atgādinājumu mērķa datumi pēc Rīgas kalendāra", () => {
  assert.equal(reminderTargetDate("today", NOW), "2026-10-05");
  assert.equal(reminderTargetDate("tomorrow", NOW), "2026-10-06");
  // 25.10 21:30Z = 25.10 23:30 EET → rīt = 26.10
  assert.equal(reminderTargetDate("tomorrow", new Date("2026-10-25T21:30:00Z")), "2026-10-26");
});

test("atgādinājums: rīt, apstiprināts, nesūtīts = sūta", () => {
  const d = shouldSendReminder({
    kind: "tomorrow",
    status: "confirmed",
    eventDate: "2026-10-06",
    alreadySent: false,
    email: "a@b.lv",
    now: NOW,
  });
  assert.equal(d.send, true);
});

test("atgādinājums: pagājis pasākums / jau nosūtīts / ne-confirmed / nav e-pasta = NEsūta", () => {
  const r = { kind: "today" as const, status: "confirmed", eventDate: "2026-10-05", alreadySent: false, email: "a@b.lv", now: NOW };
  assert.equal(shouldSendReminder(r).send, true);
  assert.equal(shouldSendReminder({ ...r, eventDate: "2026-10-03" }).reason, "event-in-past");
  assert.equal(shouldSendReminder({ ...r, alreadySent: true }).send, false);
  assert.equal(shouldSendReminder({ ...r, status: "new" }).send, false);
  assert.equal(shouldSendReminder({ ...r, email: "-" }).send, false);
  assert.equal(shouldSendReminder({ ...r, eventDate: "2026-10-09" }).reason, "not-target-date");
});

test("auto-complete: tikai confirmed ar pagājušu datumu", () => {
  assert.equal(shouldAutoComplete({ status: "confirmed", eventDate: "2026-10-04", now: NOW }), true);
  assert.equal(shouldAutoComplete({ status: "confirmed", eventDate: "2026-10-05", now: NOW }), false);
  assert.equal(shouldAutoComplete({ status: "new", eventDate: "2026-10-01", now: NOW }), false);
});

test("isDeliverableEmail", () => {
  assert.equal(isDeliverableEmail("Lasma.Malniece@rtu.lv"), true);
  assert.equal(isDeliverableEmail("-"), false);
  assert.equal(isDeliverableEmail(" "), false);
});
