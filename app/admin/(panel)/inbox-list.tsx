"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

// Vienots ienākošo saraksts — apvieno booking_requests un leads vienā skatā
// (apvienošana notiek servera vaicājumā; šis tikai attēlo + filtrē pēc tipa).
export type InboxItem = {
  kind: "booking" | "lead";
  id: string;
  created_at: string;
  status: string;
  title: string;
  subtitle: string;
  meta: string;
  href: string;
  amount: number | null;
  unopened: boolean; // viewed_at IS NULL — vēl nav atvērts
};

const KIND: Record<InboxItem["kind"], { icon: string; label: string }> = {
  booking: { icon: "🎪", label: "Rezervācija" },
  lead: { icon: "🏢", label: "B2B pieprasījums" },
};

const STATUS_LABEL: Record<string, string> = {
  new: "Jauns",
  contacted: "Sazinājos",
  quoted: "Piedāvāts",
};

function fmtDateTime(s: string): string {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  return (
    d.toLocaleDateString("lv-LV", { day: "2-digit", month: "2-digit" }) +
    " " +
    d.toLocaleTimeString("lv-LV", { hour: "2-digit", minute: "2-digit" })
  );
}

type KindFilter = "all" | "booking" | "lead";

export default function InboxList({ items }: { items: InboxItem[] }) {
  const [kind, setKind] = useState<KindFilter>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(
    () => ({
      all: items.length,
      booking: items.filter((i) => i.kind === "booking").length,
      lead: items.filter((i) => i.kind === "lead").length,
    }),
    [items],
  );

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return items.filter(
      (i) =>
        (kind === "all" || i.kind === kind) &&
        (!n || `${i.title} ${i.subtitle}`.toLowerCase().includes(n)),
    );
  }, [items, kind, q]);

  const Tab = ({ k, label }: { k: KindFilter; label: string }) => (
    <button
      type="button"
      onClick={() => setKind(k)}
      className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
        kind === k
          ? "bg-gold font-semibold text-black"
          : "border border-gold/30 text-text/70 hover:text-gold"
      }`}
    >
      {label} <span className="opacity-60">({counts[k]})</span>
    </button>
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto font-display text-2xl font-bold">
          Ienākošie{" "}
          <span className="text-sm font-normal text-text/50">
            ({filtered.length})
          </span>
        </h1>
        <input
          placeholder="Meklēt (vārds / uzņēmums / e-pasts)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-64 rounded-lg border border-gold/25 bg-navy/40 px-3 py-2 text-sm text-text outline-none focus:border-gold"
        />
      </div>

      {/* Tipa filtrs — pēc noklusējuma VISI */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Tab k="all" label="Visi" />
        <Tab k="booking" label="🎪 Rezervācijas" />
        <Tab k="lead" label="🏢 B2B" />
      </div>

      {/* Neatvērto (viewed_at IS NULL) leģenda — diskrēta, tikai ja ir tādi. */}
      {filtered.some((i) => i.unopened) && (
        <p className="mb-3 flex items-center gap-1.5 text-xs text-text/40">
          <span className="h-2 w-2 rounded-full bg-gold" aria-hidden="true" />
          Neatvērtie ieraksti iezīmēti ar zeltu
        </p>
      )}

      <div className="space-y-2">
        {filtered.map((i) => {
          const k = KIND[i.kind];
          const unopened = i.unopened; // vēl nav atvērts (viewed_at IS NULL)
          const statusNew = i.status === "new";
          return (
            <Link
              key={`${i.kind}-${i.id}`}
              href={i.href}
              className="block rounded-xl border border-gold/15 bg-navy/25 p-4 transition-colors hover:border-gold/40 hover:bg-navy/40"
            >
              <div className="flex flex-col gap-3 sm:grid sm:grid-cols-[auto_1.5fr_1.4fr_auto] sm:items-center sm:gap-4">
                {/* Tipa atzīme */}
                <span
                  className="inline-flex w-fit shrink-0 items-center gap-1 rounded-full border border-gold/25 px-2 py-0.5 text-[11px] text-text/70"
                  title={k.label}
                >
                  {k.icon} {k.label}
                </span>

                {/* Klients */}
                <div className="min-w-0">
                  <p
                    className={`flex items-center gap-1.5 font-semibold ${
                      unopened ? "text-gold" : "text-text"
                    }`}
                  >
                    {unopened && (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-gold"
                        title="Neatvērts"
                        aria-label="Neatvērts"
                      />
                    )}
                    <span className="truncate">{i.title}</span>
                  </p>
                  <p className="truncate text-xs text-text/50">{i.subtitle}</p>
                </div>

                {/* Meta + ienākšanas laiks */}
                <div className="min-w-0 text-sm">
                  <p className="truncate text-text/90">{i.meta}</p>
                  <p className="text-xs text-text/50">
                    {fmtDateTime(i.created_at)}
                  </p>
                </div>

                {/* Summa (rezervācijām) + statuss */}
                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                  {i.amount != null && (
                    <span className="font-mono text-gold">{i.amount} €</span>
                  )}
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${
                      statusNew
                        ? "border-gold/50 bg-gold/10 text-gold"
                        : "border-text/25 text-text/60"
                    }`}
                  >
                    {STATUS_LABEL[i.status] ?? i.status}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <p className="rounded-xl border border-gold/20 p-8 text-center text-text/40">
            Nav ienākošo.
          </p>
        )}
      </div>
    </div>
  );
}
