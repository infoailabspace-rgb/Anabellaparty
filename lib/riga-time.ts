// Vienīgā vieta datuma/laika loģikai (Europe/Riga). Serveris (Vercel) strādā
// UTC, pārlūks - lietotāja zonā; tāpēc "šodiena" un formatējums VIENMĒR iet
// caur šo moduli ar skaidru timeZone, nevis new Date('YYYY-MM-DD') vai
// toLocaleString bez zonas.
//
// Date-only lauki (event_date) ir kalendāra datums bez zonas: tos NEKAD
// nepārvēršam par Date momentu, bet rēķinām kā {y,m,d} (aritmētika caur
// Date.UTC, kas nav pakļauta DST/zonas nobīdei).

export const RIGA_TZ = "Europe/Riga";

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})/;
const TIME_RE = /^(\d{1,2}):(\d{2})/;

const pad = (n: number) => String(n).padStart(2, "0");

/** "YYYY-MM-DD" (arī ar laika asti) → {y,m,d} vai null. */
export function parseDateOnly(
  s: string | null | undefined,
): { y: number; m: number; d: number } | null {
  const mt = String(s ?? "").match(DATE_RE);
  if (!mt) return null;
  const y = +mt[1];
  const m = +mt[2];
  const d = +mt[3];
  // Validē reālu kalendāra datumu (31.02 → null).
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d)
    return null;
  return { y, m, d };
}

/** Pievieno n dienas date-only virknei (zonas-neatkarīgi). */
export function addDays(date: string, n: number): string {
  const p = parseDateOnly(date);
  if (!p) return date;
  const dt = new Date(Date.UTC(p.y, p.m - 1, p.d + n));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

/** Šodienas datums Rīgā (YYYY-MM-DD) dotajā brīdī. */
export function rigaToday(now: Date = new Date()): string {
  // en-CA dod YYYY-MM-DD formātu.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: RIGA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Vai pasākuma datums ir pagātnē (stingri pirms šodienas Rīgā). */
export function isPastDate(eventDate: string | null | undefined, now: Date = new Date()): boolean {
  if (!parseDateOnly(eventDate)) return false;
  return String(eventDate).slice(0, 10) < rigaToday(now);
}

/** Dienu starpība eventDate - šodiena (Rīgā). */
export function daysUntil(eventDate: string, now: Date = new Date()): number {
  const a = parseDateOnly(eventDate);
  const b = parseDateOnly(rigaToday(now));
  if (!a || !b) return NaN;
  return Math.round(
    (Date.UTC(a.y, a.m - 1, a.d) - Date.UTC(b.y, b.m - 1, b.d)) / 86400000,
  );
}

/** "18:00" / "18:00:00" → "18:00"; tukšs/nederīgs → null. 00:00 ir derīgs laiks. */
export function normalizeTime(t: string | null | undefined): string | null {
  const mt = String(t ?? "").trim().match(TIME_RE);
  if (!mt) return null;
  const h = +mt[1];
  const mi = +mt[2];
  if (h > 23 || mi > 59) return null;
  return `${pad(h)}:${mi.toString().padStart(2, "0")}`;
}

/**
 * Admin formu laika lauks → DB vērtība. Tukšs = null (laiks nav zināms).
 * "00:00" arī = null: pārlūka time-input to iedod, kad lauks "notīrīts" līdz
 * nullēm, un pusnakts piegāde inventāra nomai nav reāls scenārijs - agrāk tas
 * radīja izdomātu "piegāde 23:00" e-pastā.
 */
export function eventTimeForDb(t: string | null | undefined): string | null {
  const n = normalizeTime(t);
  return n === null || n === "00:00" ? null : n;
}

/** YYYY-MM-DD → DD.MM.YYYY (date-only, bez zonas pārvēršanas). */
export function formatDateLv(date: string | null | undefined): string {
  const p = parseDateOnly(date);
  return p ? `${pad(p.d)}.${pad(p.m)}.${p.y}` : String(date ?? "");
}

/**
 * Pilns datetime (datums + laiks) mīnus `minutes`, ar dienas pārbīdi.
 * Laika nav → null (neizdomājam laiku).
 */
export function shiftDateTime(
  date: string,
  time: string | null | undefined,
  minutes: number,
): { date: string; time: string } | null {
  const t = normalizeTime(time);
  if (!t || !parseDateOnly(date)) return null;
  const [h, mi] = t.split(":").map(Number);
  let total = h * 60 + mi + minutes;
  const dayShift = Math.floor(total / 1440);
  total -= dayShift * 1440;
  return {
    date: addDays(date, dayShift),
    time: `${pad(Math.floor(total / 60))}:${pad(total % 60)}`,
  };
}

export const DELIVERY_LEAD_MINUTES = 60;
export const DELIVERY_TBD_TEXT = "piegādes laiks tiks saskaņots";

/** Piegādes/ierašanās brīdis = pasākuma sākums - 60 min. Bez laika → null. */
export function deliveryDateTime(
  eventDate: string,
  eventTime: string | null | undefined,
): { date: string; time: string } | null {
  return shiftDateTime(eventDate, eventTime, -DELIVERY_LEAD_MINUTES);
}

/** Cilvēklasāms piegādes teksts: "29.09.2026 plkst. 23:00" vai "piegādes laiks tiks saskaņots". */
export function deliveryText(
  eventDate: string,
  eventTime: string | null | undefined,
): string {
  const d = deliveryDateTime(eventDate, eventTime);
  return d ? `${formatDateLv(d.date)} plkst. ${d.time}` : DELIVERY_TBD_TEXT;
}

/** Pasākuma datums + laiks tekstā: "30.09.2026 plkst. 19:00" vai tikai datums. */
export function eventDateTimeText(
  eventDate: string,
  eventTime: string | null | undefined,
): string {
  const t = normalizeTime(eventTime);
  return t ? `${formatDateLv(eventDate)} plkst. ${t}` : formatDateLv(eventDate);
}

/** Laika zīmoga (timestamptz) formatējums Rīgas laikā. */
export function formatTimestampRiga(
  iso: string | Date | null | undefined,
  opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
): string {
  if (!iso) return "";
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("lv-LV", { ...opts, timeZone: RIGA_TZ });
}

/** Tikai datums no laika zīmoga (Rīgā), piem. bloga publicēšanas datums. */
export function formatTimestampDateRiga(iso: string | Date | null | undefined): string {
  return formatTimestampRiga(iso, { day: "2-digit", month: "2-digit", year: "numeric" });
}
