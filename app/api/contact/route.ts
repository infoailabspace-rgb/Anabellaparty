import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseServer } from "@/lib/supabase";

export const runtime = "nodejs";

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: ContactPayload;
  try {
    body = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Nederīgs pieprasījums." }, { status: 400 });
  }

  const name = (body.name ?? "").toString().trim();
  const email = (body.email ?? "").toString().trim();
  const phone = (body.phone ?? "").toString().trim();
  const message = (body.message ?? "").toString().trim();

  // 1. Servera validācija (neuzticas klientam)
  if (!name) return NextResponse.json({ ok: false, error: "Trūkst vārda." }, { status: 400 });
  if (!EMAIL_RE.test(email))
    return NextResponse.json({ ok: false, error: "Nederīgs e-pasts." }, { status: 400 });
  if (message.length < 2)
    return NextResponse.json({ ok: false, error: "Trūkst ziņas." }, { status: 400 });

  // 2. Rate-limit (5 / IP / 10 min) — pret spamu. Dala grozu ar booking (tas pats RPC).
  const supabase = getSupabaseServer();
  if (supabase) {
    const ip = clientIp(req);
    const { data: rateOk, error: rateErr } = await supabase.rpc("check_booking_rate", {
      p_ip: ip,
      p_limit: 5,
      p_window: "10 minutes",
    });
    if (!rateErr && rateOk === false) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Pārāk daudz ziņu īsā laikā. Pamēģini pēc brīža vai zvani +371 29222761.",
        },
        { status: 429 },
      );
    }
  }

  // 3. E-pasts caur Resend — TAS PATS klients/atslēga kā /api/booking.
  const resendKey = process.env.RESEND_API_KEY;
  const notify = process.env.BOOKING_NOTIFY_EMAIL || "info@anabellaparty.lv";
  const from = process.env.BOOKING_FROM_EMAIL || "Anabella Party <onboarding@resend.dev>";

  if (!resendKey) {
    return NextResponse.json(
      { ok: false, error: "E-pasts pagaidām nav konfigurēts. Lūdzu, zvani vai raksti tieši." },
      { status: 503 },
    );
  }

  const resend = new Resend(resendKey);
  // Brīdinājums, ja FROM == NOTIFY (pašsūtīšana → spam risks).
  const fromAddr = (from.match(/<([^>]+)>/)?.[1] || from).trim().toLowerCase();
  if (fromAddr === notify.trim().toLowerCase()) {
    console.warn(
      `[contact] BRĪDINĀJUMS: FROM (${fromAddr}) == NOTIFY (${notify}) — pašsūtīšana var nonākt spam. Iestati BOOKING_NOTIFY_EMAIL != BOOKING_FROM_EMAIL.`,
    );
  }

  try {
    const r = await resend.emails.send({
      from,
      to: notify,
      replyTo: email, // Roberts var atbildēt tieši sūtītājam
      subject: `Jauns ziņojums no kontaktu formas — ${name}`,
      html: `<div style="font-family:Arial,sans-serif;color:#1A3A4A;">
        <p>Jauns ziņojums no kontaktu formas <b>anabellaparty.lv</b>:</p>
        <p><b>Vārds:</b> ${esc(name)}</p>
        <p><b>E-pasts:</b> ${esc(email)}</p>
        <p><b>Telefons:</b> ${phone ? esc(phone) : "—"}</p>
        <p><b>Ziņa:</b><br>${esc(message).replace(/\n/g, "<br>")}</p>
      </div>`,
    });
    // Resend API kļūda nāk `error` laukā (netiek mesta) — logo un atgriež kļūdu.
    if (r.error) {
      console.error(`[contact] E-pasts NEIZDEVĀS (to=${notify}):`, JSON.stringify(r.error));
      return NextResponse.json(
        { ok: false, error: "Neizdevās nosūtīt. Lūdzu, mēģini vēlreiz vai zvani." },
        { status: 502 },
      );
    }
    console.log(`[contact] E-pasts nosūtīts id=${r.data?.id} to=${notify}`);
  } catch (e) {
    console.error("[contact] E-pasta izņēmums:", e instanceof Error ? e.message : String(e));
    return NextResponse.json(
      { ok: false, error: "Neizdevās nosūtīt. Lūdzu, mēģini vēlreiz vai zvani." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
