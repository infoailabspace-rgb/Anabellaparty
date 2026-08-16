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

/** Izveido notikumu kalendārā. Atgriež id + saiti. */
export async function createEvent(input: {
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
}): Promise<{ id?: string | null; htmlLink?: string | null }> {
  const calendar = getCalendar();
  const res = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: {
      summary: input.summary,
      description: input.description,
      location: input.location,
      start: { dateTime: input.start.toISOString(), timeZone: "Europe/Riga" },
      end: { dateTime: input.end.toISOString(), timeZone: "Europe/Riga" },
    },
  });
  return { id: res.data.id, htmlLink: res.data.htmlLink };
}

/** Vienkāršs tests — izveido testa notikumu (+1h no tagad), lai apstiprinātu, ka credentials strādā. */
export async function testEventCreate(): Promise<{
  id?: string | null;
  htmlLink?: string | null;
}> {
  const start = new Date(Date.now() + 60 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return createEvent({
    summary: "TESTS — Anabella Party kalendāra integrācija",
    description:
      "Automātisks tests, ka Service Account credentials strādā. Šo notikumu var dzēst.",
    start,
    end,
  });
}
