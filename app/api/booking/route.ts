import { NextResponse } from "next/server";
import { Resend } from "resend";
import { computeQuote, computeDeposit, computeTotals } from "@/lib/pricing";
import { getAllProducts } from "@/lib/catalog";
import type { Product } from "@/lib/products";
import { getSupabaseServer } from "@/lib/supabase";
import {
  normalizePhone,
  validateBooking,
  type BookingPayload,
} from "@/lib/booking";

export const runtime = "nodejs";

const NAVY = "#1A3A4A";
const GOLD = "#D4A960";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://anabellaparty.vercel.app";

function eur(n: number) {
  return Number.isInteger(n) ? `${n} €` : `${n.toFixed(2)} €`;
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// HTML escaping — lietotāja ievade nedrīkst injicēt HTML e-pasta šablonā.
function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function summaryHtml(
  payload: BookingPayload,
  products: Product[],
  subtotal: number,
  deliveryCost: number,
  deposit: number,
) {
  const quote = computeQuote(payload.items, products);
  const rows = quote.lines
    .map(
      (l) =>
        `<tr><td style="padding:4px 8px;">${esc(l.name)} (${esc(l.tierLabel)})</td><td style="padding:4px 8px;text-align:right;">${
          l.contactOnly ? "vienojoties" : eur(l.lineTotal)
        }</td></tr>`,
    )
    .join("");
  const e = payload.event;
  const d = payload.delivery;
  const totals = computeTotals(subtotal, deliveryCost);
  return `
  <div style="font-family:Arial,sans-serif;background:${NAVY};color:#F5F5F0;padding:24px;border-radius:12px;max-width:600px;">
    <div style="text-align:center;margin-bottom:12px;"><img src="${SITE_URL}/logo/logo-full.png" width="200" alt="Anabella Party — Svētku inventārs" style="max-width:200px;height:auto;" /></div>
    <h2 style="color:${GOLD};margin:0 0 12px;">Anabella Party — pieteikuma kopsavilkums</h2>
    <p style="margin:4px 0;"><b>Datums:</b> ${esc(e.date)}${e.time ? " " + esc(e.time) : ""}</p>
    <p style="margin:4px 0;"><b>Veids:</b> ${esc(e.type)}</p>
    <p style="margin:4px 0;"><b>Vieta:</b> ${esc(e.location)}</p>
    ${d?.address ? `<p style="margin:4px 0;"><b>Piegādes adrese:</b> ${esc(d.address)}${d.km ? ` (~${esc(d.km)} km)` : ""}</p>` : ""}
    ${e.guestCount ? `<p style="margin:4px 0;"><b>Viesi:</b> ${esc(e.guestCount)}</p>` : ""}
    <table style="width:100%;border-collapse:collapse;margin-top:12px;border-top:1px solid ${GOLD};">${rows}</table>
    <p style="margin:12px 0 2px;text-align:right;">Inventārs: ${eur(subtotal)}</p>
    <p style="margin:0 0 2px;text-align:right;">Piegāde: ${deliveryCost > 0 ? eur(deliveryCost) : "bez maksas"}</p>
    <p style="margin:0 0 2px;text-align:right;">Kopā bez PVN: ${eur(totals.net)}</p>
    <p style="margin:0 0 2px;text-align:right;">PVN 21%: ${eur(totals.vat)}</p>
    <p style="margin:0 0 4px;text-align:right;"><b>Kopā ar PVN (orientējoši):</b> ${eur(totals.gross)}</p>
    <p style="margin:0;text-align:right;color:${GOLD};"><b>Avanss (50%):</b> ${eur(deposit)}</p>
    ${quote.hasContactOnly ? `<p style="font-size:12px;color:#E8A87C;">* Daži produkti — cena vienojoties, nav iekļauti summā.</p>` : ""}
    <p style="font-size:12px;color:#F5F5F0;opacity:.7;margin-top:12px;">Cenas norādītas bez PVN 21%. Aprēķins orientējošs — precīzu piedāvājumu nosūtīsim atsevišķi.</p>
  </div>`;
}

export async function POST(req: Request) {
  let payload: BookingPayload;
  try {
    payload = (await req.json()) as BookingPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Nederīgs pieprasījums." }, { status: 400 });
  }

  // 1. Servera validācija (neuzticas klientam)
  const errors = validateBooking(payload);
  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  // 2. Datubāze + rate-limit (pirms smaga darba). 5 pieteikumi / IP / 10 min.
  //    Aptur gan spam, gan biežu tiešo REST insert apiešanu (RLS insert=true).
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Datubāze nav konfigurēta. Lūdzu, sazinies telefoniski." },
      { status: 503 },
    );
  }
  const ip = clientIp(req);
  const { data: rateOk, error: rateErr } = await supabase.rpc(
    "check_booking_rate",
    { p_ip: ip, p_limit: 5, p_window: "10 minutes" },
  );
  if (!rateErr && rateOk === false) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Pārāk daudz pieteikumu īsā laikā. Pamēģini pēc brīža vai zvani +371 29222761.",
      },
      { status: 429 },
    );
  }

  // 3. Cenu pārrēķina servera pusē (produkti no DB)
  const products = await getAllProducts();
  const quote = computeQuote(payload.items, products);
  const phone = normalizePhone(payload.contact.phone);
  const deliveryCost = Math.max(0, Number(payload.delivery?.cost) || 0);
  const deliveryKm = Number(payload.delivery?.km) || null;
  const deposit = computeDeposit(quote.subtotal, deliveryCost);

  const guestCount =
    payload.event.guestCount != null && payload.event.guestCount !== ""
      ? Number(payload.event.guestCount)
      : null;

  // Bez .select() — anon lomai nav SELECT politikas, tāpēc INSERT…RETURNING
  // izgāztos. Insert-only (return=minimal) atbilst publiskās formas RLS.
  const { error } = await supabase.from("booking_requests").insert({
    name: payload.contact.name.trim(),
    phone,
    email: payload.contact.email.trim(),
    company: payload.contact.company?.trim() || null,
    reg_nr: payload.contact.regNr?.trim() || null,
    event_date: payload.event.date,
    event_time: payload.event.time || null,
    duration: payload.event.duration || null,
    event_type: payload.event.type,
    guest_count: Number.isFinite(guestCount) ? guestCount : null,
    location: payload.event.location.trim(),
    indoor_outdoor: payload.event.indoorOutdoor || null,
    description: payload.description?.trim() || null,
    items: payload.items,
    estimated_total: quote.subtotal,
    delivery_address: payload.delivery?.address?.trim() || null,
    delivery_distance_km: deliveryKm,
    delivery_cost: deliveryCost || null,
    delivery_geocoded: payload.delivery?.geocoded?.trim() || null,
    status: "new",
  });

  if (error) {
    return NextResponse.json(
      { ok: false, error: "Neizdevās saglabāt pieteikumu. Lūdzu, sazinies telefoniski." },
      { status: 500 },
    );
  }

  // 4. E-pasti caur Resend (ja konfigurēts — citādi izlaiž bez kļūdas)
  const resendKey = process.env.RESEND_API_KEY;
  const notify = process.env.BOOKING_NOTIFY_EMAIL || "info@anabellaparty.lv";
  const from = process.env.BOOKING_FROM_EMAIL || "Anabella Party <onboarding@resend.dev>";

  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      const html = summaryHtml(payload, products, quote.subtotal, deliveryCost, deposit);

      // Robertam
      await resend.emails.send({
        from,
        to: notify,
        replyTo: payload.contact.email.trim(),
        subject: `Jauns pieteikums — ${payload.event.date} — ${payload.contact.name}`,
        html: `<p style="font-family:Arial,sans-serif;">Jauns rezervācijas pieteikums no <b>${esc(payload.contact.name)}</b> (${esc(phone)}, ${esc(payload.contact.email)}).</p>${html}`,
      });

      // Klientam
      await resend.emails.send({
        from,
        to: payload.contact.email.trim(),
        subject: "Tavs pieteikums saņemts — Anabella Party",
        html: `<p style="font-family:Arial,sans-serif;">Paldies, ${esc(payload.contact.name)}! Tavs pieteikums saņemts. Atbildēsim 24 stundu laikā ar precīzu piedāvājumu. Ja steidz — zvani +371 29222761.</p>${html}`,
      });
    } catch {
      // E-pasta kļūme nedrīkst apturēt pieteikumu — tas jau saglabāts.
    }
  }

  return NextResponse.json({
    ok: true,
    subtotal: quote.subtotal,
    deliveryCost,
    deposit,
    emailsSent: Boolean(resendKey),
  });
}
