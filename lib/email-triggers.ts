// Tīri (bez I/O) noteikumi, KAD drīkst sūtīt automātiskās rezervāciju vēstules.
// Atsevišķi no sūtīšanas, lai tos var pārbaudīt ar unit testiem.
import { isPastDate, rigaToday, addDays } from "@/lib/riga-time";

export type TriggerDecision = { send: boolean; reason: string };

/** Derīga klienta e-pasta adrese (manuālās rezervācijas glabā "-" kā tukšu). */
export function isDeliverableEmail(email: string | null | undefined): boolean {
  const e = String(email ?? "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

/**
 * Apstiprinājuma vēstule: TIKAI pārejā uz 'confirmed' (iepriekš != confirmed),
 * NEKAD pagājušam pasākumam (Europe/Riga), un tikai ja admins nav atteicies.
 */
export function shouldSendConfirmation(p: {
  prevStatus: string | null | undefined;
  newStatus: string;
  eventDate: string | null | undefined;
  email: string | null | undefined;
  adminWantsEmail?: boolean;
  now?: Date;
}): TriggerDecision {
  if (p.newStatus !== "confirmed") return { send: false, reason: "not-confirmed" };
  if (p.prevStatus === "confirmed") return { send: false, reason: "already-confirmed" };
  if (p.adminWantsEmail === false) return { send: false, reason: "admin-opt-out" };
  if (!p.eventDate) return { send: false, reason: "no-event-date" };
  if (isPastDate(p.eventDate, p.now)) return { send: false, reason: "event-in-past" };
  if (!isDeliverableEmail(p.email)) return { send: false, reason: "no-email" };
  return { send: true, reason: "transition-to-confirmed" };
}

export type ReminderKind = "tomorrow" | "today";

/** Datums, kuram šodienas cron sūta doto atgādinājumu (Rīgas kalendārs). */
export function reminderTargetDate(kind: ReminderKind, now: Date = new Date()): string {
  const today = rigaToday(now);
  return kind === "tomorrow" ? addDays(today, 1) : today;
}

/** Atgādinājums: tikai apstiprinātam, nenosūtītam, tieši mērķa datumā, ar e-pastu. */
export function shouldSendReminder(p: {
  kind: ReminderKind;
  status: string;
  eventDate: string;
  alreadySent: boolean;
  email: string | null | undefined;
  now?: Date;
}): TriggerDecision {
  if (p.status !== "confirmed") return { send: false, reason: "not-confirmed" };
  if (p.alreadySent) return { send: false, reason: "already-sent" };
  if (isPastDate(p.eventDate, p.now)) return { send: false, reason: "event-in-past" };
  if (p.eventDate !== reminderTargetDate(p.kind, p.now))
    return { send: false, reason: "not-target-date" };
  if (!isDeliverableEmail(p.email)) return { send: false, reason: "no-email" };
  return { send: true, reason: `reminder-${p.kind}` };
}

/** Vai apstiprināta rezervācija jāpārvērš par 'completed' (pasākums pagājis). */
export function shouldAutoComplete(p: {
  status: string;
  eventDate: string;
  now?: Date;
}): boolean {
  return p.status === "confirmed" && isPastDate(p.eventDate, p.now);
}
