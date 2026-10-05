// Rezervāciju e-pasti (apstiprinājums + atgādinājumi). Kopīgi izmanto
// admin setStatus (apstiprinājums) un cron (atgādinājumi). KAD sūtīt nosaka
// lib/email-triggers.ts; datumi/laiki - tikai caur lib/riga-time.ts.
import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";
import { computeQuote, type CartItem } from "@/lib/pricing";
import type { Product } from "@/lib/products";
import { emailShell } from "@/lib/email-layout";
import { deliveryText, formatDateLv } from "@/lib/riga-time";

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

// Zīmola HTML ietvars - kopīgais emailShell (viens patiesības avots visiem
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

export type ReservationTemplate = "confirmation" | "reminder_1day" | "reminder_dayof";

export function confirmationSubject(eventDate: string): string {
  return `Rezervācija apstiprināta - ${formatDateLv(eventDate)} · Anabella Party`;
}

export function reminderSubject(when: "tomorrow" | "today"): string {
  return when === "tomorrow"
    ? "🎉 Tiekamies jau rīt! · Anabella Party"
    : "🎉 Tiekamies šodien! · Anabella Party";
}

export function confirmationHtml(b: BookingLike, products: Product[]): string {
  const items = itemsDescription(b.items, products);
  const delivery = deliveryText(b.event_date, b.event_time);
  return wrap(`
    <h2 style="margin:0 0 12px;font-size:19px;">Rezervācija apstiprināta! 🎉</h2>
    <p style="margin:0 0 12px;">Sveiki${b.name ? ", " + esc(b.name) : ""}!</p>
    <p style="margin:0 0 12px;">Jūsu rezervācija <b>${esc(formatDateLv(b.event_date))}</b> ir apstiprināta.
      Piegādāsim: <b>${esc(items)}</b>.</p>
    <p style="margin:0 0 12px;padding:10px 14px;background:#FBF6EC;border-left:3px solid #D4A960;border-radius:6px;">
      📍 <b>Piegāde:</b> <b>${esc(delivery)}</b>
    </p>
    <p style="margin:0;">Paldies, ka izvēlējāties Anabella Party!</p>
  `);
}

export function reminderHtml(
  b: BookingLike,
  products: Product[],
  when: "tomorrow" | "today",
): string {
  const items = itemsDescription(b.items, products);
  const date = esc(formatDateLv(b.event_date));
  const delivery = esc(deliveryText(b.event_date, b.event_time));
  const hello = b.name ? `Sveiki, ${esc(b.name)}! 👋` : "Sveiki! 👋";
  const title = when === "tomorrow" ? "Tiekamies jau rīt!" : "Tiekamies šodien!";
  const dayWord = when === "tomorrow" ? "Rīt" : "Šodien";
  const closing = when === "tomorrow" ? "Uz tikšanos rīt! 🎉" : "Uz tikšanos šodien! 🎉";
  return wrap(
    `
    <h2 style="margin:0 0 16px;font-size:20px;color:#1A3A4A;">🎉 ${title}</h2>
    <p style="margin:0 0 14px;">${hello}</p>
    <p style="margin:0 0 14px;"><b>${dayWord}</b>, <b>${date}</b>, tiekamies pie Jums ar rezervēto inventāru (<b>${esc(items)}</b>).</p>
    <p style="margin:0 0 14px;padding:10px 14px;background:#FBF6EC;border-left:3px solid #D4A960;border-radius:6px;">
      📍 <b>Piegāde:</b> <b>${delivery}</b>
    </p>
    <p style="margin:0 0 14px;">Plānojam ierasties aptuveni stundu pirms pasākuma sākuma, lai visu nepieciešamo sagatavotu un uzstādītu.</p>
    <p style="margin:0 0 14px;">Ja rodas kādi jautājumi vai nepieciešams ko precizēt, droši atbildiet uz šo e-pastu vai zvaniet <b>+371 29222761</b>.</p>
    <p style="margin:0;font-size:16px;">${closing}</p>
  `,
    false,
  );
}

/**
 * Nosūta e-pastu caur Resend. bccNotify → kopija uz info@anabellaparty.lv.
 * Ja padots `log`, rezultāts (arī kļūda) tiek ierakstīts email_log tabulā.
 */
export async function sendReservationEmail(opts: {
  to: string;
  subject: string;
  html: string;
  bccNotify?: boolean;
  log?: {
    supabase: SupabaseClient;
    bookingId: string;
    template: ReservationTemplate;
    triggeredBy: string;
  };
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  let result: { ok: boolean; error?: string; id?: string };
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    result = { ok: false, error: "RESEND_API_KEY nav iestatīts" };
  } else {
    try {
      const res = await new Resend(key).emails.send({
        from: FROM,
        to: opts.to,
        // FROM=noreply@ ir nepārraudzīts → atbildes uz pārraudzīto info@ (NOTIFY).
        replyTo: NOTIFY,
        ...(opts.bccNotify ? { bcc: NOTIFY } : {}),
        subject: opts.subject,
        // emailShell jau iekļauj <meta charset="utf-8"> - nedublējam.
        html: opts.html,
      });
      result = res.error
        ? { ok: false, error: JSON.stringify(res.error) }
        : { ok: true, id: res.data?.id };
    } catch (e) {
      result = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  const tag = `[email:${opts.log?.template ?? "reservation"}]`;
  if (result.ok) console.log(`${tag} nosūtīts id=${result.id} to=${opts.to}`);
  else console.error(`${tag} NEIZDEVĀS to=${opts.to}:`, result.error);

  if (opts.log) {
    const { error } = await opts.log.supabase.from("email_log").insert({
      booking_request_id: opts.log.bookingId,
      template: opts.log.template,
      to_email: opts.to,
      subject: opts.subject,
      ok: result.ok,
      error: result.error ?? null,
      resend_id: result.id ?? null,
      triggered_by: opts.log.triggeredBy,
    });
    if (error) console.error(`${tag} email_log ieraksts neizdevās:`, error.message);
  }
  return result;
}
