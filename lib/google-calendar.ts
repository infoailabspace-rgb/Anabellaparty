import { google, type calendar_v3 } from "googleapis";

// Service Account credentials no env (viena rinda JSON). Privātā atslēga —
// aizsargājoši normalizē \n uz reāliem newline (dažādu env quirku dēļ).
function getCredentials(): { client_email: string; private_key: string } {
  const raw = process.env.GOOGLE_CALENDAR_CREDENTIALS;
  if (!raw) throw new Error("GOOGLE_CALENDAR_CREDENTIALS nav iestatīts");
  const c = JSON.parse(raw);
  return {
    client_email: c.client_email,
    private_key: String(c.private_key || "").replace(/\\n/g, "\n"),
  };
}

const CALENDAR_ID =
  process.env.GOOGLE_CALENDAR_ID || "anabellaatrakcijas@gmail.com";

export function getCalendar(): calendar_v3.Calendar {
  const creds = getCredentials();
  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  return google.calendar({ version: "v3", auth });
}

const RIGA = "Europe/Riga";
type EventTime = { dateTime?: string; date?: string; timeZone?: string };

export async function createEvent(input: {
  summary: string;
  description?: string;
  location?: string;
  start: EventTime;
  end: EventTime;
}): Promise<{ id?: string | null; htmlLink?: string | null }> {
  const calendar = getCalendar();
  const res = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: {
      summary: input.summary,
      description: input.description,
      location: input.location,
      start: input.start,
      end: input.end,
    },
  });
  return { id: res.data.id, htmlLink: res.data.htmlLink };
}

export async function deleteEvent(eventId: string): Promise<void> {
  const calendar = getCalendar();
  await calendar.events.delete({ calendarId: CALENDAR_ID, eventId });
}

// "18:00" / "18:00:00" → "18:00:00"; citādi null.
function normTime(t?: string | null): string | null {
  const m = String(t ?? "").match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  return `${m[1].padStart(2, "0")}:${m[2]}:${m[3] ?? "00"}`;
}
function plusHours(date: string, time: string, hours: number): string {
  const [h, mm] = time.split(":");
  let eh = parseInt(h, 10) + hours;
  let d = date;
  if (eh >= 24) {
    eh -= 24;
    const x = new Date(date + "T00:00:00");
    x.setDate(x.getDate() + 1);
    d = x.toLocaleDateString("en-CA");
  }
  return `${d}T${String(eh).padStart(2, "0")}:${mm}:00`;
}
function nextDay(date: string): string {
  const x = new Date(date + "T00:00:00");
  x.setDate(x.getDate() + 1);
  return x.toLocaleDateString("en-CA");
}

/** Izveido kalendāra notikumu no rezervācijas (wall-clock + Europe/Riga → DST korekti). */
export async function createEventForBooking(b: {
  name?: string | null;
  event_type?: string | null;
  event_date: string;
  event_time?: string | null;
  duration?: string | null;
  location?: string | null;
  itemsText?: string;
}): Promise<{ id?: string | null; htmlLink?: string | null }> {
  const summary = `Anabella Party — ${b.name || "rezervācija"}${b.event_type ? ` (${b.event_type})` : ""}`;
  const desc: string[] = [];
  if (b.itemsText) desc.push(`Inventārs: ${b.itemsText}`);
  if (b.duration) desc.push(`Ilgums: ${b.duration}`);

  const time = normTime(b.event_time);
  let start: EventTime;
  let end: EventTime;
  if (time) {
    start = { dateTime: `${b.event_date}T${time}`, timeZone: RIGA };
    end = { dateTime: plusHours(b.event_date, time, 2), timeZone: RIGA }; // noklusējums 2h
  } else {
    start = { date: b.event_date }; // visas dienas notikums
    end = { date: nextDay(b.event_date) };
  }
  return createEvent({
    summary,
    description: desc.join("\n") || undefined,
    location: b.location || undefined,
    start,
    end,
  });
}

/** Vienkāršs tests — izveido testa notikumu (+1h no tagad). */
export async function testEventCreate(): Promise<{
  id?: string | null;
  htmlLink?: string | null;
}> {
  const start = new Date(Date.now() + 60 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return createEvent({
    summary: "TESTS — Anabella Party kalendāra integrācija",
    description: "Automātisks tests. Šo notikumu var dzēst.",
    start: { dateTime: start.toISOString(), timeZone: RIGA },
    end: { dateTime: end.toISOString(), timeZone: RIGA },
  });
}
