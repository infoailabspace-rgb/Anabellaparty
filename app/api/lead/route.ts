import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseServer } from "@/lib/supabase";

export const runtime = "nodejs";

// B2B pieprasījuma anketa (/kontakti/#pieprasijums). Atsevišķi no /api/contact
// (vienkārša ziņa) un /api/booking (B2C rezervācija). Iesniegums → leads tabula
// + iekšējais paziņojums + apstiprinājums pieprasītājam.

type LeadPayload = {
  company?: string;
  contact_person?: string;
  role?: string;
  email?: string;
  phone?: string;
  event_date?: string;
  event_location?: string;
  guest_count?: string;
  interests?: string[];
  needs_branding?: boolean;
  description?: string;
  institution?: string;
  procurement_id?: string;
  source?: string;
};

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v: unknown) => (v ?? "").toString().trim();

export async function POST(req: Request) {
  let body: LeadPayload;
  try {
    body = (await req.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Nederīgs pieprasījums." }, { status: 400 });
  }

  const company = str(body.company);
  const contactPerson = str(body.contact_person);
  const role = str(body.role);
  const email = str(body.email);
  const phone = str(body.phone);
  const eventDate = str(body.event_date);
  const eventLocation = str(body.event_location);
  const guestCount = str(body.guest_count);
  const description = str(body.description);
  const institution = str(body.institution);
  const procurementId = str(body.procurement_id);
  const source = str(body.source) || "b2b";
  const needsBranding = Boolean(body.needs_branding);
  const interests = Array.isArray(body.interests)
    ? body.interests.map((s) => str(s)).filter(Boolean).slice(0, 20)
    : [];

  // 1. Servera validācija (neuzticas klientam).
  if (!company) return NextResponse.json({ ok: false, error: "Trūkst uzņēmuma/iestādes." }, { status: 400 });
  if (!contactPerson) return NextResponse.json({ ok: false, error: "Trūkst kontaktpersonas." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: "Nederīgs e-pasts." }, { status: 400 });
  if (phone.length < 5) return NextResponse.json({ ok: false, error: "Trūkst tālruņa." }, { status: 400 });

  const supabase = getSupabaseServer();

  // 2. Rate-limit (5 / IP / 10 min) — tas pats RPC kā booking/contact.
  if (supabase) {
    const ip = clientIp(req);
    const { data: rateOk, error: rateErr } = await supabase.rpc("check_booking_rate", {
      p_ip: ip,
      p_limit: 5,
      p_window: "10 minutes",
    });
    if (!rateErr && rateOk === false) {
      return NextResponse.json(
        { ok: false, error: "Pārāk daudz pieprasījumu īsā laikā. Pamēģini pēc brīža vai zvani +371 29222761." },
        { status: 429 },
      );
    }
  }

  // 3. Ieraksts leads tabulā (nav fatāls, ja neizdodas — e-pasts tomēr aiziet).
  if (supabase) {
    const { error } = await supabase.from("leads").insert({
      company,
      contact_person: contactPerson,
      role: role || null,
      email,
      phone,
      event_date: eventDate || null,
      event_location: eventLocation || null,
      guest_count: guestCount || null,
      interests,
      needs_branding: needsBranding,
      description: description || null,
      institution: institution || null,
      procurement_id: procurementId || null,
      source,
    });
    if (error) {
      console.error("[lead] DB insert neizdevās:", error.message);
    }
  }

  // 4. E-pasti caur Resend — iekšējais paziņojums + apstiprinājums pieprasītājam.
  const resendKey = process.env.RESEND_API_KEY;
  const notify = process.env.BOOKING_NOTIFY_EMAIL || "info@anabellaparty.lv";
  const from = process.env.BOOKING_FROM_EMAIL || "Anabella Party <onboarding@resend.dev>";

  if (!resendKey) {
    // Ieraksts jau saglabāts; e-pasts nav konfigurēts lokāli — atgriež ok ar brīdinājumu.
    return NextResponse.json({ ok: true, warning: "email_not_configured" });
  }

  const resend = new Resend(resendKey);
  const interestsLine = interests.length ? interests.join(", ") : "—";
  const rows = [
    ["Uzņēmums / iestāde", company],
    ["Kontaktpersona", contactPerson],
    ["Amats", role],
    ["E-pasts", email],
    ["Tālrunis", phone],
    ["Pasākuma datums", eventDate],
    ["Vieta / pilsēta", eventLocation],
    ["Viesu skaits", guestCount],
    ["Interesē", interestsLine],
    ["Brendēšana ar logo", needsBranding ? "Jā" : "Nē"],
    ["Iestāde", institution],
    ["Iepirkuma ID", procurementId],
    ["Avots", source],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<p style="margin:2px 0"><b>${esc(k)}:</b> ${esc(v)}</p>`)
    .join("");

  try {
    // Iekšējais paziņojums.
    const internal = await resend.emails.send({
      from,
      to: notify,
      replyTo: email,
      subject: `B2B pieprasījums — ${company}`,
      html: `<meta charset="utf-8"><div style="font-family:Arial,sans-serif;color:#1A3A4A;">
        <p>Jauns <b>B2B pieprasījums</b> no anabellaparty.lv anketas:</p>
        ${rows}
        ${description ? `<p style="margin-top:8px"><b>Apraksts:</b><br>${esc(description).replace(/\n/g, "<br>")}</p>` : ""}
      </div>`,
    });
    if (internal.error) {
      console.error("[lead] Iekšējais e-pasts neizdevās:", JSON.stringify(internal.error));
    }
    // Apstiprinājums pieprasītājam (ja FROM != pieprasītāja e-pasts).
    await resend.emails.send({
      from,
      to: email,
      replyTo: notify,
      subject: "Saņēmām jūsu pieprasījumu — Anabella Party",
      html: `<meta charset="utf-8"><div style="font-family:Arial,sans-serif;color:#1A3A4A;line-height:1.6;">
        <p>Sveiki, ${esc(contactPerson)}!</p>
        <p>Paldies par pieprasījumu — saņēmām to un sagatavosim piedāvājumu. <b>Atbildēsim 1 darba dienas laikā.</b></p>
        <p>Ja vēlaties precizēt ātrāk, zvaniet <b>+371 29222761</b> vai rakstiet uz info@anabellaparty.lv.</p>
        <p style="color:#777">Anabella Party — SIA "AR DIMANTI", PVN maksātājs. Strādājam ar līgumu un rēķinu.</p>
      </div>`,
    });
  } catch (e) {
    console.error("[lead] E-pasta izņēmums:", e instanceof Error ? e.message : String(e));
    // Ieraksts jau saglabāts — neatgriež kļūdu klientam.
  }

  return NextResponse.json({ ok: true });
}
