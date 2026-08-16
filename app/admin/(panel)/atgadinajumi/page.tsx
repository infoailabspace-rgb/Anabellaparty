import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  name: string | null;
  email: string | null;
  event_date: string;
  event_time: string | null;
  reminder_1day_sent: boolean;
  reminder_dayof_sent: boolean;
};

const fmt = (d: string) => {
  const m = String(d ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : String(d ?? "");
};
const minus1 = (d: string) => {
  const x = new Date(d + "T00:00:00");
  x.setDate(x.getDate() - 1);
  return x.toLocaleDateString("en-CA");
};

function Badge({
  state,
  fireDate,
}: {
  state: "sent" | "pending" | "na";
  fireDate?: string;
}) {
  if (state === "sent")
    return (
      <span className="rounded-full border border-green-500/40 bg-green-500/10 px-2 py-0.5 text-[11px] text-green-300">
        ✓ Nosūtīts
      </span>
    );
  if (state === "pending")
    return (
      <span className="rounded-full border border-amber-500/50 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-300">
        ⏳ Gaida{fireDate ? ` · ${fmt(fireDate)}` : ""}
      </span>
    );
  return <span className="text-[11px] text-text/30">—</span>;
}

export default async function AtgadinajumiPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("booking_requests")
    .select(
      "id, name, email, event_date, event_time, reminder_1day_sent, reminder_dayof_sent",
    )
    .eq("status", "confirmed")
    .order("event_date", { ascending: true });
  const rows = (data ?? []) as Row[];

  const today = new Date().toLocaleDateString("en-CA");
  const isUpcoming = (r: Row) => r.event_date >= today;
  const pending = (r: Row) =>
    isUpcoming(r) && (!r.reminder_1day_sent || !r.reminder_dayof_sent);

  const upcoming = rows.filter(pending);
  const handled = rows.filter((r) => !pending(r));

  const next = upcoming[0];

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-bold">Atgādinājumi</h1>
      <p className="mb-6 text-xs text-text/50">
        Automātiskie e-pasti apstiprinātām rezervācijām: 1 dienu iepriekš + pasākuma
        dienā (cron katru rītu). Šeit — kam jau nosūtīts un kam sūtīs nākamajam.
      </p>

      {/* Kopsavilkums */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gold/25 bg-navy/30 p-4 text-center">
          <div className="text-2xl font-bold text-gold">{upcoming.length}</div>
          <div className="mt-1 text-xs text-text/60">Gaida atgādinājumu</div>
        </div>
        <div className="rounded-xl border border-gold/25 bg-navy/30 p-4 text-center">
          <div className="text-2xl font-bold text-green-300">
            {rows.filter((r) => r.reminder_1day_sent || r.reminder_dayof_sent).length}
          </div>
          <div className="mt-1 text-xs text-text/60">Vismaz 1 nosūtīts</div>
        </div>
        <div className="rounded-xl border border-gold/25 bg-navy/30 p-4 text-center sm:col-span-1 col-span-2">
          <div className="truncate text-sm font-semibold text-text/90">
            {next ? `${fmt(next.event_date)} · ${next.name ?? "—"}` : "—"}
          </div>
          <div className="mt-1 text-xs text-text/60">Nākamais sūtāmais</div>
        </div>
      </div>

      {/* Gaidāmie */}
      <h2 className="mb-2 font-display text-lg font-semibold text-gold">
        Gaidāmie atgādinājumi ({upcoming.length})
      </h2>
      {upcoming.length === 0 ? (
        <p className="mb-8 rounded-2xl border border-gold/20 bg-navy/20 p-6 text-center text-sm text-text/50">
          Nav gaidāmu atgādinājumu.
        </p>
      ) : (
        <div className="mb-8 overflow-x-auto rounded-2xl border border-gold/25">
          <table className="w-full text-sm">
            <thead className="bg-navy/50 text-left text-xs uppercase tracking-wide text-text/50">
              <tr>
                <th className="px-4 py-3">Pasākums</th>
                <th className="px-4 py-3">Klients</th>
                <th className="px-4 py-3">1 diena iepriekš</th>
                <th className="px-4 py-3">Pasākuma dienā</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((r) => (
                <tr key={r.id} className="border-t border-gold/10 hover:bg-navy/30">
                  <td className="px-4 py-3">
                    <Link href={`/admin/${r.id}`} className="text-gold hover:underline">
                      {fmt(r.event_date)}
                      {r.event_time ? ` ${r.event_time.slice(0, 5)}` : ""}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-text/90">{r.name ?? "—"}</div>
                    <div className="text-xs text-text/40">{r.email || "nav e-pasta"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      state={
                        !r.email
                          ? "na"
                          : r.reminder_1day_sent
                            ? "sent"
                            : "pending"
                      }
                      fireDate={minus1(r.event_date)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      state={
                        !r.email
                          ? "na"
                          : r.reminder_dayof_sent
                            ? "sent"
                            : "pending"
                      }
                      fireDate={r.event_date}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Apstrādātie */}
      <h2 className="mb-2 font-display text-lg font-semibold text-text/70">
        Apstrādātie / pagājušie ({handled.length})
      </h2>
      {handled.length === 0 ? (
        <p className="text-sm text-text/40">Nav ierakstu.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gold/15">
          <table className="w-full text-sm">
            <thead className="bg-navy/40 text-left text-xs uppercase tracking-wide text-text/40">
              <tr>
                <th className="px-4 py-2">Pasākums</th>
                <th className="px-4 py-2">Klients</th>
                <th className="px-4 py-2">1 diena</th>
                <th className="px-4 py-2">Dienā</th>
              </tr>
            </thead>
            <tbody>
              {handled.map((r) => (
                <tr key={r.id} className="border-t border-gold/10 text-text/70">
                  <td className="px-4 py-2">
                    <Link href={`/admin/${r.id}`} className="hover:text-gold">
                      {fmt(r.event_date)}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{r.name ?? "—"}</td>
                  <td className="px-4 py-2">
                    <Badge state={r.reminder_1day_sent ? "sent" : "na"} />
                  </td>
                  <td className="px-4 py-2">
                    <Badge state={r.reminder_dayof_sent ? "sent" : "na"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
