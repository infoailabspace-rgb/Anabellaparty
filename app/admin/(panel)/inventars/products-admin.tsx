"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toggleActive } from "./actions";

export type AdminProductRow = {
  id: string;
  slug: string;
  category: string;
  name: string;
  price: number;
  is_active: boolean;
};

const CATS = [
  "foto-kaste", "atrakcijas", "audio-video", "specefekti", "deco", "kubli",
];

export default function ProductsAdmin({ rows }: { rows: AdminProductRow[] }) {
  const [list, setList] = useState(rows);
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [, start] = useTransition();

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return list.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (!n || p.name.toLowerCase().includes(n) || p.slug.includes(n)),
    );
  }, [list, cat, q]);

  function toggle(p: AdminProductRow) {
    const next = !p.is_active;
    setList((l) => l.map((x) => (x.id === p.id ? { ...x, is_active: next } : x)));
    start(() => toggleActive(p.id, next, p.category));
  }

  const field =
    "rounded-lg border border-gold/25 bg-navy/40 px-3 py-2 text-sm text-text outline-none focus:border-gold";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto font-display text-2xl font-bold">
          Inventārs <span className="text-sm font-normal text-text/50">({filtered.length})</span>
        </h1>
        <input placeholder="Meklēt" value={q} onChange={(e) => setQ(e.target.value)} className={`${field} w-48`} />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className={field}>
          <option value="all">Visas kategorijas</option>
          {CATS.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
        <Link href="/admin/inventars/jauns" className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black">
          + Jauns produkts
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gold/20">
        <table className="w-full text-sm">
          <thead className="bg-navy/50 text-left text-xs uppercase text-text/50">
            <tr>
              <th className="p-3">Nosaukums</th>
              <th className="p-3">Kategorija</th>
              <th className="p-3 text-right">Cena</th>
              <th className="p-3">Aktīvs</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className={`border-t border-gold/10 ${p.is_active ? "" : "opacity-50"}`}>
                <td className="p-3">
                  <Link href={`/admin/inventars/${p.id}`} className="font-semibold hover:text-gold">
                    {p.name}
                  </Link>
                  <div className="text-xs text-text/40">{p.slug}</div>
                </td>
                <td className="p-3 text-text/70">{p.category}</td>
                <td className="p-3 text-right font-mono text-gold">{p.price ? `${p.price} €` : "—"}</td>
                <td className="p-3">
                  <button
                    onClick={() => toggle(p)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${p.is_active ? "bg-gold" : "bg-text/20"}`}
                    aria-pressed={p.is_active}
                    aria-label="Aktīvs"
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-black transition-transform ${p.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </td>
                <td className="p-3">
                  <Link href={`/admin/inventars/${p.id}`} className="text-sm text-gold hover:underline">
                    Rediģēt
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
