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

// Logo e-pastiem no kanoniskā domēna (sakrīt ar sūtītāja domēnu — labāk piegādei).
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.anabellaparty.lv";

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
  // Viegls teksta HTML (bez ārēja attēla, tumša fona un tabulas) — labākai
  // piegādei (smags HTML ar ārēju <img> nonāca spam/All Mail).
  const lines = quote.lines
    .map(
      (l) =>
        `${esc(l.name)} (${esc(l.tierLabel)}) — ${
          l.contactOnly ? "vienojoties" : eur(l.lineTotal)
        }`,
    )
    .join("<br>");
  const e = payload.event;
  const d = payload.delivery;
  const totals = computeTotals(subtotal, deliveryCost);
  return `
  <div style="font-family:Arial,sans-serif;background:#F5F5F0;padding:16px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e6e1d6;border-radius:12px;overflow:hidden;">
      <div style="background:#1A3A4A;padding:24px;text-align:center;">
        <img src="${SITE_URL}/logo/logo-full.png" width="170" alt="Anabella Party" style="max-width:170px;height:auto;" />
      </div>
      <div style="height:4px;background:#D4A960;"></div>
      <div style="padding:24px;color:#1A3A4A;">
        <h2 style="margin:0 0 16px;font-size:18px;color:#1A3A4A;">Pieteikuma kopsavilkums</h2>
        <p style="margin:0 0 12px;"><b>Datums:</b> ${esc(e.date)}${e.time ? " " + esc(e.time) : ""}<br>
           <b>Veids:</b> ${esc(e.type)}<br>
           <b>Norises un piegādes vieta:</b> ${esc(e.location)}${d?.km ? ` (~${esc(d.km)} km)` : ""}${e.guestCount ? `<br><b>Viesi:</b> ${esc(e.guestCount)}` : ""}</p>
        <p style="margin:0 0 12px;"><b>Inventārs:</b><br>${lines}</p>
        <div style="background:#faf6ec;border-left:3px solid #D4A960;padding:12px 16px;border-radius:4px;">
          <b>Inventārs kopā:</b> ${eur(subtotal)}<br>
          <b>Piegāde:</b> ${deliveryCost > 0 ? eur(deliveryCost) : "bez maksas"}<br>
          <b>Kopā bez PVN:</b> ${eur(totals.net)}<br>
          <b>PVN 21%:</b> ${eur(totals.vat)}<br>
          <b>Kopā ar PVN (orientējoši):</b> ${eur(totals.gross)}<br>
          <b style="color:#B0842E;">Avanss (50%): ${eur(deposit)}</b>
        </div>
        ${quote.hasContactOnly ? `<p style="font-size:12px;color:#777;margin-top:12px;">* Daži produkti — cena vienojoties, nav iekļauti summā.</p>` : ""}
        <p style="font-size:12px;color:#777;margin-top:12px;">Cenas norādītas bez PVN 21%. Aprēķins orientējošs — precīzu piedāvājumu nosūtīsim atsevišķi.</p>
      </div>
    </div>
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
    const resend = new Resend(resendKey);
    const html = summaryHtml(payload, products, quote.subtotal, deliveryCost, deposit);
    // Brīdinājums, ja FROM == NOTIFY (pašsūtīšana → spam/Sent risks).
    const fromAddr = (from.match(/<([^>]+)>/)?.[1] || from).trim().toLowerCase();
    if (fromAddr === notify.trim().toLowerCase()) {
      console.warn(
        `[booking] BRĪDINĀJUMS: FROM (${fromAddr}) == NOTIFY (${notify}) — pašsūtīšana var nonākt spam/Sent. Iestati BOOKING_NOTIFY_EMAIL != BOOKING_FROM_EMAIL.`,
      );
    }
    try {
      // Robertam — logo Resend atbildi (message ID vai kļūdu).
      const rNotify = await resend.emails.send({
        from,
        to: notify,
        replyTo: payload.contact.email.trim(),
        subject: `Jauns pieteikums — ${payload.event.date} — ${payload.contact.name}`,
        html: `<p style="font-family:Arial,sans-serif;">Jauns rezervācijas pieteikums no <b>${esc(payload.contact.name)}</b> (${esc(phone)}, ${esc(payload.contact.email)}).</p>${html}`,
      });
      if (rNotify.error)
        console.error(`[booking] Roberta e-pasts NEIZDEVĀS (to=${notify}):`, JSON.stringify(rNotify.error));
      else console.log(`[booking] Roberta e-pasts nosūtīts id=${rNotify.data?.id} to=${notify}`);

      // Klientam
      const rClient = await resend.emails.send({
        from,
        to: payload.contact.email.trim(),
        subject: "Tavs pieteikums saņemts — Anabella Party",
        html: `<p style="font-family:Arial,sans-serif;">Paldies, ${esc(payload.contact.name)}! Tavs pieteikums saņemts. Atbildēsim 24 stundu laikā ar precīzu piedāvājumu. Ja steidz — zvani +371 29222761.</p>${html}`,
      });
      if (rClient.error)
        console.error(`[booking] Klienta e-pasts NEIZDEVĀS:`, JSON.stringify(rClient.error));
      else console.log(`[booking] Klienta e-pasts nosūtīts id=${rClient.data?.id}`);
    } catch (e) {
      // Tīkla izņēmums — pieteikums jau saglabāts DB, tāpēc neatgriež kļūdu.
      console.error("[booking] E-pasta izņēmums:", e instanceof Error ? e.message : String(e));
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
