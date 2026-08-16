// Rezervāciju e-pasti (apstiprinājums + atgādinājumi). Kopīgi izmanto
// admin setStatus (apstiprinājums) un cron (atgādinājumi).
import { Resend } from "resend";
import { computeQuote, type CartItem } from "@/lib/pricing";
import type { Product } from "@/lib/products";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.anabellaparty.lv";
const FROM =
  process.env.BOOKING_FROM_EMAIL || "Anabella Party <onboarding@resend.dev>";
const NOTIFY = process.env.BOOKING_NOTIFY_EMAIL || "info@anabellaparty.lv";

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Cilvēklasāms inventāra apraksts no items (vai godīgs fallback). */
export function itemsDescription(
  items: CartItem[] | null | undefined,
  products: Product[],
): string {
  try {
    const q = computeQuote(items || [], products);
    const names = q.lines.map((l) => l.name).filter(Boolean);
    if (names.length) return names.join(", ");
  } catch {
    /* fallback */
  }
  return "rezervēto inventāru";
}

/** Ierašanās laiks = pasākuma laiks mīnus 1 stunda (vai vispārīgs teksts). */
export function arrivalText(eventTime: string | null | undefined): string {
  const m = String(eventTime ?? "").match(/^(\d{1,2}):(\d{2})/);
  if (m) {
    let h = parseInt(m[1], 10) - 1;
    if (h < 0) h += 24;
    return `plkst. ${String(h).padStart(2, "0")}:${m[2]} (aptuveni stundu pirms sākuma)`;
  }
  return "aptuveni stundu pirms sākuma";
}

/** YYYY-MM-DD → DD.MM.YYYY (draudzīgākam izskatam). */
export function formatDate(d: string): string {
  const m = String(d ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : String(d ?? "");
}

// Zīmola HTML ietvars (navy galvene + logo, zelta akcents, balta karte).
function wrap(inner: string): string {
  return `
  <div style="font-family:Arial,sans-serif;background:#F5F5F0;padding:16px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e6e1d6;border-radius:12px;overflow:hidden;">
      <div style="background:#1A3A4A;padding:24px;text-align:center;">
        <img src="${SITE_URL}/logo/logo-full.png" width="170" alt="Anabella Party" style="max-width:170px;height:auto;" />
      </div>
      <div style="height:4px;background:#D4A960;"></div>
      <div style="padding:24px;color:#1A3A4A;font-size:15px;line-height:1.6;">
        ${inner}
        <p style="font-size:12px;color:#777;margin-top:20px;">Ja rodas jautājumi — atbildi uz šo e-pastu vai zvani +371 29222761.</p>
      </div>
    </div>
  </div>`;
}

type BookingLike = {
  name?: string | null;
  event_date: string;
  event_time?: string | null;
  items?: CartItem[] | null;
};

export function confirmationHtml(b: BookingLike, products: Product[]): string {
  const arrival = arrivalText(b.event_time);
  const items = itemsDescription(b.items, products);
  return wrap(`
    <h2 style="margin:0 0 12px;font-size:19px;">Rezervācija apstiprināta! 🎉</h2>
    <p style="margin:0 0 12px;">Sveiki${b.name ? ", " + esc(b.name) : ""}!</p>
    <p style="margin:0 0 12px;">Jūsu rezervācija ir apstiprināta. Būsim pie jums
      <b>${esc(formatDate(b.event_date))}</b> ${esc(arrival)}, lai piegādātu:
      <b>${esc(items)}</b>.</p>
    <p style="margin:0;">Paldies, ka izvēlējāties Anabella Party!</p>
  `);
}

export function reminderHtml(
  b: BookingLike,
  products: Product[],
  when: "tomorrow" | "today",
): string {
  const arrival = arrivalText(b.event_time);
  const items = itemsDescription(b.items, products);
  const lead =
    when === "tomorrow"
      ? `Sveiki${b.name ? ", " + esc(b.name) : ""}! <b>Rīt</b> (${esc(formatDate(b.event_date))}) mums ir rezervēts inventārs pie jums — <b>${esc(items)}</b>.`
      : `Sveiki${b.name ? ", " + esc(b.name) : ""}! <b>Šodien</b> (${esc(formatDate(b.event_date))}) mēs būsim pie jums ar rezervēto inventāru — <b>${esc(items)}</b>.`;
  const arriveLine =
    when === "tomorrow"
      ? `Būsim pie jums ${esc(arrival)}.`
      : `Būsim pie jums ${esc(arrival)}.`;
  return wrap(`
    <h2 style="margin:0 0 12px;font-size:19px;">Atgādinājums par pasākumu</h2>
    <p style="margin:0 0 12px;">${lead}</p>
    <p style="margin:0;">${arriveLine}</p>
  `);
}

/** Nosūta e-pastu caur Resend. bccNotify → kopija uz info@anabellaparty.lv. */
export async function sendReservationEmail(opts: {
  to: string;
  subject: string;
  html: string;
  bccNotify?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "RESEND_API_KEY nav iestatīts" };
  const resend = new Resend(key);
  try {
    const res = await resend.emails.send({
      from: FROM,
      to: opts.to,
      ...(opts.bccNotify ? { bcc: NOTIFY } : {}),
      subject: opts.subject,
      html: `<meta charset="utf-8">${opts.html}`,
    });
    if (res.error) return { ok: false, error: JSON.stringify(res.error) };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
