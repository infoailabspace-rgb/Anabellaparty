import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { getAllProducts } from "@/lib/catalog";
import type { CartItem } from "@/lib/pricing";
import { reminderHtml, sendReservationEmail } from "@/lib/reservation-emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Diennakts atgādinājumi: RĪT (1 diena iepriekš) + ŠODIEN (pasākuma dienā).
// Vercel Cron sauc GET ar Authorization: Bearer <CRON_SECRET> (ja iestatīts).
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  // ?dry=1 → droša testēšana: parāda, KO sūtītu, bet NEsūta un NEatzīmē.
  const dry = new URL(req.url).searchParams.get("dry") === "1";

  const hasServiceKey = Boolean(process.env.SB_SERVICE_ROLE_KEY);
  const hasResend = Boolean(process.env.RESEND_API_KEY);

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "DB nav konfigurēta" }, { status: 503 });
  }

  // Datumi UTC (cron 6:00 UTC = 9:00 EEST) — Latvijas datums tajā brīdī sakrīt ar UTC.
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const tomorrowStr = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);

  const products = await getAllProducts();

  async function run(
    kind: "tomorrow" | "today",
    dateStr: string,
    flagCol: "reminder_1day_sent" | "reminder_dayof_sent",
  ) {
    const { data, error } = await supabase!
      .from("booking_requests")
      .select("id, name, email, event_date, event_time, items")
      .eq("status", "confirmed")
      .eq(flagCol, false)
      .eq("event_date", dateStr);
    if (error) return { sent: 0, errors: [`query ${kind}: ${error.message}`] };

    let sent = 0;
    const errors: string[] = [];
    const would: string[] = [];
    for (const b of (data ?? []) as any[]) {
      if (!b.email) continue;
      if (dry) {
        would.push(`${b.name ?? "?"} <${b.email}> — ${b.event_date}`);
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
      const subject =
        kind === "tomorrow"
          ? `🎉 Tiekamies jau rīt! · Anabella Party`
          : `🎉 Tiekamies šodien! · Anabella Party`;
      const res = await sendReservationEmail({ to: b.email, subject, html, bccNotify: true });
      if (res.ok) {
        await supabase!.from("booking_requests").update({ [flagCol]: true }).eq("id", b.id);
        sent++;
      } else {
        errors.push(`${kind} ${b.id}: ${res.error}`);
      }
    }
    return { sent, errors, would };
  }

  const oneDay = await run("tomorrow", tomorrowStr, "reminder_1day_sent");
  const dayOf = await run("today", todayStr, "reminder_dayof_sent");

  return NextResponse.json({
    ok: true,
    dry,
    today: todayStr,
    tomorrow: tomorrowStr,
    sent_1day: oneDay.sent,
    sent_dayof: dayOf.sent,
    would_send: dry ? { tomorrow: oneDay.would, today: dayOf.would } : undefined,
    errors: [...oneDay.errors, ...dayOf.errors],
    diagnostics: { hasServiceKey, hasResend },
  });
}
