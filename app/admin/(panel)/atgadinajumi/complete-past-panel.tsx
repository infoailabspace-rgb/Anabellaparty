"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDateLv } from "@/lib/riga-time";
import { completePastBookings } from "../actions";

type Row = { id: string; name: string | null; event_date: string };

// Pagājušas rezervācijas ar statusu "Apstiprināts": admins redz sarakstu un
// apstiprina slēgšanu (confirmed → completed). Cron to dara automātiski katru
// rītu; šis ir manuālais ceļš + pārredzamība.
export default function CompletePastPanel({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(() => new Set(rows.map((r) => r.id)));
  const [msg, setMsg] = useState("");
  const [pending, startTransition] = useTransition();

  if (!rows.length) return null;

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  function onComplete() {
    const ids = rows.filter((r) => selected.has(r.id)).map((r) => r.id);
    if (!ids.length) return;
    if (!confirm(`Atzīmēt ${ids.length} pagājušas rezervācijas kā "Pabeigts"?`)) return;
    setMsg("");
    startTransition(async () => {
      const res = await completePastBookings(ids);
      if (res?.error) {
        setMsg(res.error);
        return;
      }
      setMsg(`Pabeigtas: ${res.completed}`);
      router.refresh();
    });
  }

  return (
    <section className="mb-8 rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4">
      <h2 className="font-display text-lg font-semibold text-amber-300">
        Pagājuši, bet joprojām &quot;Apstiprināts&quot; ({rows.length})
      </h2>
      <p className="mt-1 text-xs text-text/55">
        Šīm rezervācijām pasākums jau notika. Pēc pabeigšanas tās vairs nesaņem e-pastus
        un neaizņem inventāru. Tīrības statuss netiek mainīts (izņemot vakardienas pasākumus).
      </p>
      <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto text-sm">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.has(r.id)}
              onChange={() => toggle(r.id)}
              className="accent-[#D4A960]"
            />
            <Link href={`/admin/${r.id}`} className="font-mono text-gold hover:underline">
              {formatDateLv(r.event_date)}
            </Link>
            <span className="text-text/80">{r.name ?? "-"}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={onComplete}
          disabled={pending || selected.size === 0}
          className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {pending ? "Saglabā…" : `Pabeigt atzīmētās (${selected.size})`}
        </button>
        {msg && <span className="text-sm text-text/70">{msg}</span>}
      </div>
    </section>
  );
}
