// Rezervāciju e-pasti (apstiprinājums + atgādinājumi). Kopīgi izmanto
// admin setStatus (apstiprinājums) un cron (atgādinājumi).
import { Resend } from "resend";
import { computeQuote, type CartItem } from "@/lib/pricing";
import type { Product } from "@/lib/products";
import { emailShell } from "@/lib/email-layout";

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

/** Īss ierašanās laiks priekš "📍 Ierašanās laiks:" rindas. */
export function arrivalTimeShort(eventTime: string | null | undefined): string {
  const m = String(eventTime ?? "").match(/^(\d{1,2}):(\d{2})/);
  if (m) {
    let h = parseInt(m[1], 10) - 1;
    if (h < 0) h += 24;
    return `plkst. ${String(h).padStart(2, "0")}:${m[2]}`;
  }
  return "aptuveni stundu pirms pasākuma sākuma";
}

/** YYYY-MM-DD → DD.MM.YYYY (draudzīgākam izskatam). */
export function formatDate(d: string): string {
  const m = String(d ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : String(d ?? "");
}

// Zīmola HTML ietvars — kopīgais emailShell (viens patiesības avots visiem
// e-pastiem). showFooter=false, ja pamatteksts jau satur savu kontaktu rindu.
function wrap(inner: string, showFooter = true): string {
  return emailShell(inner, showFooter ? {} : { footer: "" });
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
  const items = itemsDescription(b.items, products);
  const date = esc(formatDate(b.event_date));
  const arrival = esc(arrivalTimeShort(b.event_time));
  const hello = b.name ? `Sveiki, ${esc(b.name)}! 👋` : "Sveiki! 👋";
  const title = when === "tomorrow" ? "Tiekamies jau rīt!" : "Tiekamies šodien!";
  const dayWord = when === "tomorrow" ? "Rīt" : "Šodien";
  const closing = when === "tomorrow" ? "Uz tikšanos rīt! 🎉" : "Uz tikšanos šodien! 🎉";
  return wrap(
    `
    <h2 style="margin:0 0 16px;font-size:20px;color:#1A3A4A;">🎉 ${title}</h2>
    <p style="margin:0 0 14px;">${hello}</p>
    <p style="margin:0 0 14px;"><b>${dayWord}</b>, <b>${date}</b>., tiekamies pie Jums ar rezervēto inventāru (<b>${esc(items)}</b>).</p>
    <p style="margin:0 0 14px;padding:10px 14px;background:#FBF6EC;border-left:3px solid #D4A960;border-radius:6px;">
      📍 <b>Ierašanās laiks:</b> <b>${arrival}</b>
    </p>
    <p style="margin:0 0 14px;">Plānojam ierasties aptuveni stundu pirms pasākuma sākuma, lai visu nepieciešamo sagatavotu un uzstādītu.</p>
    <p style="margin:0 0 14px;">Ja rodas kādi jautājumi vai nepieciešams ko precizēt, droši atbildiet uz šo e-pastu vai zvaniet <b>+371 29222761</b>.</p>
    <p style="margin:0;font-size:16px;">${closing}</p>
  `,
    false,
  );
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
      // emailShell jau iekļauj <meta charset="utf-8"> — nedublējam.
      html: opts.html,
    });
    if (res.error) return { ok: false, error: JSON.stringify(res.error) };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
