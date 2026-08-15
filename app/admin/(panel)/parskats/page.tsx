import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { statusLabel } from "@/lib/admin";

export const dynamic = "force-dynamic";

const eur = (n: number) =>
  `${Number(n || 0).toLocaleString("lv-LV", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;

type Summary = {
  active_reservations: number;
  active_products: number;
  available_equipment: number;
  awaiting_payment: number;
  month_received: number;
  month_planned: number;
  year_received: number;
  year_planned: number;
};

type ListItem = {
  id: string;
  name: string;
  product: string | null;
  date: string;
  amount: number;
};
type LatestItem = {
  id: string;
  name: string;
  date: string;
  status: string;
  amount: number;
};
type TopItem = { product: string; count: number };
type Extra = {
  paid_amount: number;
  total_amount: number;
  total_count: number;
  waiting_amount: number;
  waiting_count: number;
  inv_total_count: number;
  inv_total_sum: number;
  inv_paid_count: number;
  inv_paid_sum: number;
  inv_unpaid_count: number;
  inv_unpaid_sum: number;
  waiting_list: ListItem[];
  paid_list: ListItem[];
  top_products: TopItem[];
  latest: LatestItem[];
  equip_total: number;
  equip_maintenance: number;
  equip_reserved: number;
  equip_rented: number;
};

function Kpi({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-gold/25 bg-navy/30 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-text/50">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="mt-2 font-display text-3xl font-bold text-gold">{value}</div>
      {sub && <div className="mt-1 text-xs text-text/50">{sub}</div>}
    </div>
  );
}

function Bar({ pct, color = "bg-gold" }: { pct: number; color?: string }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-bg/60">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function RevenueCard({ title, received, planned }: { title: string; received: number; planned: number }) {
  const pct = planned > 0 ? Math.min(100, Math.round((received / planned) * 100)) : 0;
  return (
    <div className="rounded-2xl border border-gold/25 bg-navy/30 p-6">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <span className="text-sm text-text/50">{pct}%</span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-2xl font-bold text-gold">{eur(received)}</span>
        <span className="text-sm text-text/50">/ {eur(planned)}</span>
      </div>
      <div className="mt-3">
        <Bar pct={pct} />
      </div>
      <div className="mt-2 flex justify-between text-xs text-text/50">
        <span>Saņemts</span>
        <span>Plānots</span>
      </div>
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  new: "border-text/30 text-text/60",
  contacted: "border-blue-400/40 text-blue-300",
  quoted: "border-purple-400/40 text-purple-300",
  confirmed: "border-green-500/40 text-green-300",
  completed: "border-gold/40 text-gold",
  rejected: "border-red-500/50 text-red-300",
};

function BookingRow({ href, left, sub, right }: { href: string; left: string; sub?: string; right: string }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-3 rounded-lg border border-gold/10 bg-bg/40 px-3 py-2 hover:border-gold/40">
      <div className="min-w-0">
        <div className="truncate text-sm text-text/90">{left}</div>
        {sub && <div className="truncate text-xs text-text/50">{sub}</div>}
      </div>
      <span className="shrink-0 font-mono text-sm text-gold">{right}</span>
    </Link>
  );
}

export default async function ParskatsPage() {
  const supabase = await createClient();
  const [{ data: sData }, { data: eData }] = await Promise.all([
    supabase.rpc("dashboard_summary"),
    supabase.rpc("dashboard_extra"),
  ]);
  const s = (sData ?? {}) as Partial<Summary>;
  const e = (eData ?? {}) as Partial<Extra>;

  const today = new Date().toLocaleDateString("lv-LV", { day: "numeric", month: "long", year: "numeric" });

  const totalAmount = e.total_amount ?? 0;
  const paidAmount = e.paid_amount ?? 0;
  const paidPct = totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : 0;

  const top = e.top_products ?? [];
  const topMax = top.length ? Math.max(...top.map((t) => t.count)) : 1;

  const eqTotal = e.equip_total ?? 0;
  const eqMaint = e.equip_maintenance ?? 0;
  const eqReserved = e.equip_reserved ?? 0;
  const eqRented = e.equip_rented ?? 0;
  const eqAvail = Math.max(0, eqTotal - eqMaint - eqReserved - eqRented);
  const eqRow = (label: string, count: number, color: string) => (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-text/70">{label}</span>
        <span className="font-mono text-text/90">{count}</span>
      </div>
      <Bar pct={eqTotal > 0 ? (count / eqTotal) * 100 : 0} color={color} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-2xl font-bold">Pārskats</h1>
        <span className="text-sm text-text/50">{today}</span>
      </div>

      {/* 2. KPI */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Aktīvās rezervācijas" value={String(s.active_reservations ?? 0)} sub="Apstiprinātas, gaidāmas" icon="📅" />
        <Kpi label="Pieejams aprīkojums" value={`${s.available_equipment ?? 0} / ${s.active_products ?? 0}`} sub="Brīvs šodien" icon="📦" />
        <Kpi label="Gaida maksājumu" value={String(s.awaiting_payment ?? 0)} sub="gaidāmie pasākumi bez apmaksas" icon="⏳" />
      </div>

      {/* 3. Ieņēmumu progress */}
      <div className="grid gap-4 md:grid-cols-2">
        <RevenueCard title="Šī mēneša ieņēmumi" received={s.month_received ?? 0} planned={s.month_planned ?? 0} />
        <RevenueCard title="Šī gada ieņēmumi" received={s.year_received ?? 0} planned={s.year_planned ?? 0} />
      </div>

      {/* 4. Maksājumu kopsavilkums */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gold/25 bg-navy/30 p-5">
          <span className="text-xs uppercase tracking-wide text-text/50">Samaksāts</span>
          <div className="mt-2 font-display text-2xl font-bold text-green-300">{eur(paidAmount)}</div>
          <div className="mt-2"><Bar pct={paidPct} color="bg-green-500" /></div>
          <div className="mt-1 text-xs text-text/50">{paidPct}% no kopējā</div>
        </div>
        <div className="rounded-2xl border border-gold/25 bg-navy/30 p-5">
          <span className="text-xs uppercase tracking-wide text-text/50">Gaida apmaksu</span>
          <div className="mt-2 font-display text-2xl font-bold text-amber-300">{eur(e.waiting_amount ?? 0)}</div>
          <div className="mt-1 text-xs text-text/50">{e.waiting_count ?? 0} neapmaksātas</div>
        </div>
        <div className="rounded-2xl border border-gold/25 bg-navy/30 p-5">
          <span className="text-xs uppercase tracking-wide text-text/50">Kopējā summa</span>
          <div className="mt-2 font-display text-2xl font-bold text-gold">{eur(totalAmount)}</div>
          <div className="mt-1 text-xs text-text/50">{e.total_count ?? 0} rezervācijas</div>
        </div>
      </div>

      {/* 5. Divi saraksti */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gold/25 bg-navy/30 p-5">
          <h3 className="mb-3 font-display text-lg font-semibold">Kopā jāsaņem (visas nesamaksātās) <span className="text-sm text-text/40">({(e.waiting_list ?? []).length})</span></h3>
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {(e.waiting_list ?? []).length === 0 && <p className="text-sm text-text/40">Nav ierakstu.</p>}
            {(e.waiting_list ?? []).map((b) => (
              <BookingRow key={b.id} href={`/admin/${b.id}`} left={b.name} sub={`${b.product ?? "—"} · ${b.date}`} right={eur(b.amount)} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-gold/25 bg-navy/30 p-5">
          <h3 className="mb-3 font-display text-lg font-semibold">Pabeigto rezervāciju ieņēmumi <span className="text-sm text-text/40">({(e.paid_list ?? []).length})</span></h3>
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {(e.paid_list ?? []).length === 0 && <p className="text-sm text-text/40">Nav ierakstu.</p>}
            {(e.paid_list ?? []).map((b) => (
              <BookingRow key={b.id} href={`/admin/${b.id}`} left={b.name} sub={`${b.product ?? "—"} · ${b.date}`} right={eur(b.amount)} />
            ))}
          </div>
        </div>
      </div>

      {/* 6. Rēķinu kopsavilkums */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gold/25 bg-navy/30 p-5">
          <span className="text-xs uppercase tracking-wide text-text/50">Kopā rēķini</span>
          <div className="mt-2 font-display text-2xl font-bold text-gold">{eur(e.inv_total_sum ?? 0)}</div>
          <div className="mt-1 text-xs text-text/50">{e.inv_total_count ?? 0} rēķini</div>
        </div>
        <div className="rounded-2xl border border-gold/25 bg-navy/30 p-5">
          <span className="text-xs uppercase tracking-wide text-text/50">Apmaksāti</span>
          <div className="mt-2 font-display text-2xl font-bold text-green-300">{eur(e.inv_paid_sum ?? 0)}</div>
          <div className="mt-1 text-xs text-text/50">{e.inv_paid_count ?? 0} rēķini</div>
        </div>
        <div className="rounded-2xl border border-gold/25 bg-navy/30 p-5">
          <span className="text-xs uppercase tracking-wide text-text/50">Neapmaksāti</span>
          <div className="mt-2 font-display text-2xl font-bold text-amber-300">{eur(e.inv_unpaid_sum ?? 0)}</div>
          <div className="mt-1 text-xs text-text/50">{e.inv_unpaid_count ?? 0} rēķini</div>
        </div>
      </div>

      {/* 7. Top produkti */}
      <div className="rounded-2xl border border-gold/25 bg-navy/30 p-5">
        <h3 className="mb-3 font-display text-lg font-semibold">Top rezervētākie produkti</h3>
        <div className="space-y-2">
          {top.slice(0, 5).map((t) => (
            <div key={t.product}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-text/80">{t.product}</span>
                <span className="font-mono text-gold">{t.count}</span>
              </div>
              <Bar pct={(t.count / topMax) * 100} />
            </div>
          ))}
          {top.length === 0 && <p className="text-sm text-text/40">Nav datu.</p>}
        </div>
        {top.length > 5 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gold hover:underline">Skatīt visus ({top.length})</summary>
            <div className="mt-3 space-y-2">
              {top.slice(5).map((t) => (
                <div key={t.product} className="flex justify-between text-sm">
                  <span className="text-text/70">{t.product}</span>
                  <span className="font-mono text-text/60">{t.count}</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* 8. Jaunākās rezervācijas + Aprīkojuma statuss */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gold/25 bg-navy/30 p-5">
          <h3 className="mb-3 font-display text-lg font-semibold">Jaunākās rezervācijas</h3>
          <div className="space-y-2">
            {(e.latest ?? []).map((b) => (
              <Link key={b.id} href={`/admin/${b.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-gold/10 bg-bg/40 px-3 py-2 hover:border-gold/40">
                <div className="min-w-0">
                  <div className="truncate text-sm text-text/90">{b.name}</div>
                  <div className="text-xs text-text/50">{b.date}</div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] ${STATUS_COLOR[b.status] ?? "border-text/30 text-text/60"}`}>
                    {statusLabel(b.status)}
                  </span>
                  <span className="font-mono text-sm text-gold">{eur(b.amount)}</span>
                </div>
              </Link>
            ))}
            {(e.latest ?? []).length === 0 && <p className="text-sm text-text/40">Nav rezervāciju.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-gold/25 bg-navy/30 p-5">
          <h3 className="mb-3 font-display text-lg font-semibold">Aprīkojuma statuss <span className="text-sm text-text/40">({eqTotal})</span></h3>
          <div className="space-y-3">
            {eqRow("🟢 Pieejams", eqAvail, "bg-green-500")}
            {eqRow("🔵 Rezervēts", eqReserved, "bg-blue-500")}
            {eqRow("🟡 Iznomāts", eqRented, "bg-amber-500")}
            {eqRow("🔴 Apkopē", eqMaint, "bg-red-500")}
          </div>
        </div>
      </div>
    </div>
  );
}
