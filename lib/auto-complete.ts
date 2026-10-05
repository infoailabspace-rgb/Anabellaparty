// Pagājušas apstiprinātas rezervācijas → 'completed'. Kopīgi izmanto cron
// (katru dienu) un admin darbība (manuāli, pēc saraksta apskates).
import type { SupabaseClient } from "@supabase/supabase-js";
import { addDays, rigaToday } from "@/lib/riga-time";

export type PastConfirmed = {
  id: string;
  name: string | null;
  event_date: string;
  email: string | null;
};

/** Apstiprinātas rezervācijas ar event_date < šodiena (Europe/Riga). */
export async function listPastConfirmed(
  supabase: SupabaseClient,
  now: Date = new Date(),
): Promise<{ rows: PastConfirmed[]; error?: string }> {
  const { data, error } = await supabase
    .from("booking_requests")
    .select("id, name, event_date, email")
    .eq("status", "confirmed")
    .lt("event_date", rigaToday(now))
    .order("event_date", { ascending: true });
  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as PastConfirmed[] };
}

/**
 * Pārvērš dotās rezervācijas par 'completed' (tikai ja vēl confirmed un pagātnē).
 * Aprīkojuma rezervācijas tiek atbrīvotas. Produkti tiek atzīmēti kā netīri
 * TIKAI vakardienas pasākumiem - vēsturiska atpalikuma (backlog) slēgšana
 * nedrīkst masveidā pārrakstīt pašreizējo tīrības stāvokli.
 * Google Calendar notikums paliek (vēsture).
 */
export async function completeBookings(
  supabase: SupabaseClient,
  ids: string[],
  now: Date = new Date(),
): Promise<{ completed: string[]; error?: string }> {
  if (!ids.length) return { completed: [] };
  const today = rigaToday(now);
  const { data, error } = await supabase
    .from("booking_requests")
    .update({ status: "completed" })
    .in("id", ids)
    .eq("status", "confirmed")
    .lt("event_date", today)
    .select("id, event_date, items");
  if (error) return { completed: [], error: error.message };
  const rows = (data ?? []) as { id: string; event_date: string; items: unknown }[];
  const done = rows.map((r) => r.id);
  if (!done.length) return { completed: [] };

  await supabase.from("equipment_bookings").delete().in("booking_request_id", done);

  const yesterday = addDays(today, -1);
  const slugs = rows
    .filter((r) => r.event_date === yesterday)
    .flatMap((r) => (Array.isArray(r.items) ? (r.items as { slug?: string }[]) : []))
    .map((it) => it.slug)
    .filter((s): s is string => Boolean(s));
  if (slugs.length)
    await supabase.from("products").update({ cleaning_status: "dirty" }).in("slug", slugs);

  return { completed: done };
}
