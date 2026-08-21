import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseServer } from "@/lib/supabase";
import {
  emailShell,
  ctaButton,
  infoCard,
  infoRow,
  EMAIL_NAVY,
  EMAIL_GOLD_DARK,
} from "@/lib/email-layout";

export const runtime = "nodejs";

// B2B pieprasījuma anketa (/kontakti/#pieprasijums). Atsevišķi no /api/contact
// (vienkārša ziņa) un /api/booking (B2C rezervācija). Iesniegums → leads tabula
// + iekšējais paziņojums + apstiprinājums pieprasītājam.

type LeadPayload = {
  name?: string;
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

  const name = str(body.name);
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
  const isB2c = source === "b2c";
  const needsBranding = !isB2c && Boolean(body.needs_branding);
  const interests = Array.isArray(body.interests)
    ? body.interests.map((s) => str(s)).filter(Boolean).slice(0, 20)
    : [];

  // Privātpersonai company/kontaktpersona = vārds (leads.company/contact_person
  // ir NOT NULL). B2B — kā ievadīts.
  const companyF = isB2c ? name : company;
  const contactF = isB2c ? name : contactPerson;

  // 1. Servera validācija (neuzticas klientam).
  if (isB2c) {
    if (name.length < 2) return NextResponse.json({ ok: false, error: "Trūkst vārda." }, { status: 400 });
  } else {
    if (!company) return NextResponse.json({ ok: false, error: "Trūkst uzņēmuma/iestādes." }, { status: 400 });
    if (!contactPerson) return NextResponse.json({ ok: false, error: "Trūkst kontaktpersonas." }, { status: 400 });
  }
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

  // 3. Ieraksts leads tabulā — KRITISKI. Ja NEsaglabājas, klientam NESŪTĀM
  //    maldinošu apstiprinājumu; tā vietā brīdinām adminu (lai atgūst manuāli)
  //    un atgriežam kļūdu, ko forma parāda lietotājam.
  let saved = false;
  if (supabase) {
    const { error } = await supabase.from("leads").insert({
      company: companyF,
      contact_person: contactF,
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
    if (error) console.error("[lead] DB insert neizdevās:", error.message);
    else saved = true;
  } else {
    console.error("[lead] DB nav konfigurēta — pieprasījums nav saglabāts.");
  }

  // Resend konfigurācija + formas datu HTML (vajadzīgs gan paziņojumam, gan
  // brīdinājumam par nesaglabātu pieprasījumu).
  const resendKey = process.env.RESEND_API_KEY;
  const notify = process.env.BOOKING_NOTIFY_EMAIL || "info@anabellaparty.lv";
  const from = process.env.BOOKING_FROM_EMAIL || "Anabella Party <onboarding@resend.dev>";
  const interestsLine = interests.length ? interests.join(", ") : "—";
  const rows = [
    isB2c ? ["Vārds", name] : ["Uzņēmums / iestāde", company],
    isB2c ? ["", ""] : ["Kontaktpersona", contactPerson],
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
    .map(([k, v]) => infoRow(k, esc(v)))
    .join("");
  const descHtml = description
    ? `<p style="margin-top:8px"><b>Apraksts:</b><br>${esc(description).replace(/\n/g, "<br>")}</p>`
    : "";

  // 3a. NESAGLABĀJĀS → brīdini adminu ar visiem datiem (atgūt manuāli), atgriez
  //     kļūdu klientam un NESŪTI klientam apstiprinājumu (nemaldini).
  if (!saved) {
    if (resendKey) {
      try {
        await new Resend(resendKey).emails.send({
          from,
          to: notify,
          replyTo: email,
          subject: `⚠ NESAGLABĀJĀS ${isB2c ? "privātpersonas" : "B2B"} pieprasījums — ${companyF} (atgūt manuāli)`,
          html: emailShell(
            `<h2 style="margin:0 0 12px;font-size:18px;color:#b00020;">⚠ Pieprasījums NESAGLABĀJĀS</h2>
             <p style="margin:0 0 12px;">Pieprasījums no anketas <b>nenonāca datubāzē</b>. Sazinies ar klientu manuāli:</p>
             ${infoCard("", rows)}
             ${descHtml}`,
            { footer: "" },
          ),
        });
      } catch (e) {
        console.error("[lead] brīdinājuma e-pasts neizdevās:", e instanceof Error ? e.message : String(e));
      }
    }
    return NextResponse.json(
      {
        ok: false,
        error:
          "Kaut kas nogāja greizi un pieprasījums netika saglabāts. Lūdzu, zvaniet +371 29222761 vai rakstiet uz info@anabellaparty.lv.",
      },
      { status: 500 },
    );
  }

  // 4. SAGLABĀTS. E-pasts nav konfigurēts → ok ar brīdinājumu.
  if (!resendKey) {
    return NextResponse.json({ ok: true, warning: "email_not_configured" });
  }

  // 4a. Iekšējais paziņojums adminam + apstiprinājums pieprasītājam.
  const resend = new Resend(resendKey);
  try {
    const internal = await resend.emails.send({
      from,
      to: notify,
      replyTo: email,
      subject: `${isB2c ? "Privātpersonas pieprasījums" : "B2B pieprasījums"} — ${companyF}`,
      html: emailShell(
        `<h2 style="margin:0 0 12px;font-size:18px;color:${EMAIL_NAVY};">Jauns ${isB2c ? "privātpersonas" : "B2B"} pieprasījums</h2>
         <p style="margin:0 0 12px;">No anabellaparty.lv anketas${isB2c ? " (privātpersona)" : " (uzņēmums / iestāde)"}:</p>
         ${infoCard("", rows)}
         ${descHtml}`,
        { footer: "" },
      ),
    });
    if (internal.error) {
      console.error("[lead] Iekšējais e-pasts neizdevās:", JSON.stringify(internal.error));
    }
    // Apstiprinājums pieprasītājam (tikai tagad — kad DB ieraksts DROŠI ir).
    await resend.emails.send({
      from,
      to: email,
      replyTo: notify,
      subject: "Saņēmām jūsu pieprasījumu — Anabella Party",
      html: emailShell(
        `<h2 style="margin:0 0 12px;font-size:20px;color:${EMAIL_GOLD_DARK};">Paldies, ${esc(contactF)}! 🎉</h2>
         <p style="margin:0 0 12px;">Saņēmām jūsu pieprasījumu un jau sagatavojam piedāvājumu. <b>Atbildēsim 1 darba dienas laikā.</b></p>
         <p style="margin:0 0 12px;">Ja vēlaties precizēt ātrāk, zvaniet <b>+371 29222761</b> vai vienkārši atbildiet uz šo e-pastu.</p>
         ${ctaButton("https://www.anabellaparty.lv/foto-kaste", "Apskatīt piedāvājumu")}`,
        {
          preheader:
            "Saņēmām jūsu pieprasījumu — sagatavosim piedāvājumu 1 darba dienas laikā.",
        },
      ),
    });
  } catch (e) {
    console.error("[lead] E-pasta izņēmums:", e instanceof Error ? e.message : String(e));
    // Ieraksts jau saglabāts — neatgriež kļūdu klientam.
  }

  return NextResponse.json({ ok: true });
}
