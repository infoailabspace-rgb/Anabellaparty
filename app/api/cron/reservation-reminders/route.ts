import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { getAllProducts } from "@/lib/catalog";
import type { CartItem } from "@/lib/pricing";
import {
  reminderHtml,
  reminderSubject,
  sendReservationEmail,
} from "@/lib/reservation-emails";
import {
  reminderTargetDate,
  shouldSendReminder,
  type ReminderKind,
} from "@/lib/email-triggers";
import { rigaToday } from "@/lib/riga-time";
import { completeBookings, listPastConfirmed } from "@/lib/auto-complete";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Diennakts darbs (vercel.json, 06:00 UTC = 08:00/09:00 Rīgā):
//  1) atgādinājumi RĪT (1 diena iepriekš) + ŠODIEN (pasākuma dienā);
//  2) pagājušas apstiprinātas rezervācijas → 'completed' (lai tās nekad
//     vairs nesaņem atgādinājumus/apstiprinājumus un neaizņem inventāru).
// Visi datumi - Rīgas kalendārā (lib/riga-time), nevis UTC.
// Vercel Cron sauc GET ar Authorization: Bearer <CRON_SECRET>.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  // Bez CRON_SECRET maršruts būtu publisks (un tagad maina statusus) → aizliegts.
  if (!secret) {
    console.error("[cron] CRON_SECRET nav iestatīts - atsakos darboties");
    return NextResponse.json({ ok: false, error: "CRON_SECRET missing" }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // ?dry=1 → droša testēšana: parāda, KO darītu, bet NEsūta un NEmaina.
  const dry = new URL(req.url).searchParams.get("dry") === "1";

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "DB nav konfigurēta" }, { status: 503 });
  }
  if (!process.env.SB_SERVICE_ROLE_KEY) {
    // Ar anon atslēgu RLS (admin-only) atgriež 0 rindas BEZ kļūdas → klusa neveiksme.
    console.error("[cron] SB_SERVICE_ROLE_KEY nav iestatīts - RLS paslēps rezervācijas");
  }

  const now = new Date();
  const today = rigaToday(now);
  const products = await getAllProducts();

  async function run(kind: ReminderKind, flagCol: "reminder_1day_sent" | "reminder_dayof_sent") {
    const target = reminderTargetDate(kind, now);
    const { data, error } = await supabase!
      .from("booking_requests")
      .select("id, name, email, status, event_date, event_time, items")
      .eq("status", "confirmed")
      .eq(flagCol, false)
      .eq("event_date", target);
    if (error) {
      console.error(`[cron] query ${kind}:`, error.message);
      return { sent: 0, skipped: [] as string[], errors: [`query ${kind}: ${error.message}`], would: [] as string[] };
    }

    let sent = 0;
    const errors: string[] = [];
    const would: string[] = [];
    const skipped: string[] = [];
    for (const b of (data ?? []) as any[]) {
      const decision = shouldSendReminder({
        kind,
        status: b.status,
        eventDate: b.event_date,
        alreadySent: false,
        email: b.email,
        now,
      });
      if (!decision.send) {
        skipped.push(`${b.id}: ${decision.reason}`);
        continue;
      }
      if (dry) {
        would.push(`${b.id} ${b.event_date}`);
        continue;
      }
      const html = reminderHtml(
        {
          name: b.name,
          event_date: b.event_date,
          event_time: b.event_time,
          items: (Array.isArray(b.items) ? b.items : []) as CartItem[],
        },
        products,
        kind,
      );
      const res = await sendReservationEmail({
        to: String(b.email).trim(),
        subject: reminderSubject(kind),
        html,
        bccNotify: true,
        log: {
          supabase: supabase!,
          bookingId: b.id,
          template: kind === "tomorrow" ? "reminder_1day" : "reminder_dayof",
          triggeredBy: "cron",
        },
      });
      if (res.ok) {
        await supabase!.from("booking_requests").update({ [flagCol]: true }).eq("id", b.id);
        sent++;
      } else {
        errors.push(`${kind} ${b.id}: ${res.error}`);
      }
    }
    return { sent, skipped, errors, would };
  }

  const oneDay = await run("tomorrow", "reminder_1day_sent");
  const dayOf = await run("today", "reminder_dayof_sent");

  // Auto-complete: pēc atgādinājumiem (šodienas pasākumi nav pagātne → netiek skarti).
  const past = await listPastConfirmed(supabase, now);
  let completed: string[] = [];
  let completeError: string | undefined = past.error;
  if (!dry && !past.error && past.rows.length) {
    const r = await completeBookings(supabase, past.rows.map((p) => p.id), now);
    completed = r.completed;
    completeError = r.error;
  }
  if (completeError) console.error("[cron] auto-complete:", completeError);

  const summary = {
    ok: true,
    dry,
    today,
    tomorrow: reminderTargetDate("tomorrow", now),
    sent_1day: oneDay.sent,
    sent_dayof: dayOf.sent,
    skipped: [...oneDay.skipped, ...dayOf.skipped],
    would_send: dry ? { tomorrow: oneDay.would, today: dayOf.would } : undefined,
    would_complete: dry ? past.rows.map((p) => `${p.id} ${p.event_date}`) : undefined,
    completed: completed.length,
    errors: [...oneDay.errors, ...dayOf.errors, ...(completeError ? [completeError] : [])],
  };
  // Logā redzams kopsavilkums (agrāk cron atgrieza tikai 200 bez jebkāda loga).
  console.log("[cron] reservation-reminders", JSON.stringify({ ...summary, would_send: undefined }));
  return NextResponse.json(summary);
}
