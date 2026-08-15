"use client";

import { useMemo, useState, useTransition } from "react";
import { upsertMaterial, deleteMaterial } from "./actions";

export type MRow = {
  id: string | null;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_quantity: number;
  notes: string;
};

type Row = MRow & { _key: string; _group: string };

const field =
  "rounded-lg border border-gold/25 bg-bg/60 px-3 py-2 text-sm text-text outline-none focus:border-gold";

const NO_CAT = "Bez kategorijas";
const NEW_GROUP = "Jauni materiāli";

const dataOf = (r: MRow) =>
  JSON.stringify({
    name: r.name,
    category: r.category,
    quantity: r.quantity,
    unit: r.unit,
    min_quantity: r.min_quantity,
    notes: r.notes,
  });

// Zems krājums: brīdina tikai, ja minimums iestatīts (>0).
const isLow = (r: MRow) => r.min_quantity > 0 && r.quantity <= r.min_quantity;

function MaterialCard({
  row,
  onChange,
  onSaved,
  onDelete,
  saved,
}: {
  row: Row;
  onChange: (key: string, patch: Partial<MRow>) => void;
  onSaved: (key: string, id: string) => void;
  onDelete: (key: string) => void;
  saved: string | undefined;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const dirty = !row.id || saved !== dataOf(row);
  const low = isLow(row);

  const set = (p: Partial<MRow>) => onChange(row._key, p);
  const bump = (d: number) =>
    set({ quantity: Math.max(0, Math.round((row.quantity + d) * 100) / 100) });

  function save() {
    if (!row.name.trim()) {
      setMsg("Nosaukums obligāts");
      return;
    }
    setMsg("");
    start(async () => {
      const res = await upsertMaterial(row.id, {
        name: row.name,
        category: row.category,
        quantity: row.quantity,
        unit: row.unit,
        min_quantity: row.min_quantity,
        notes: row.notes,
      });
      if (res?.error) {
        setMsg(res.error);
        return;
      }
      if (res?.id) onSaved(row._key, res.id);
      setMsg("✓");
    });
  }

  function remove() {
    if (row.id && !confirm("Dzēst materiālu?")) return;
    start(async () => {
      if (row.id) await deleteMaterial(row.id);
      onDelete(row._key);
    });
  }

  return (
    <div
      className={`rounded-xl border p-4 ${
        low ? "border-amber-500/60 bg-amber-500/10" : "border-gold/20 bg-navy/30"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={row.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="Nosaukums"
          className={`${field} w-48`}
        />
        <input
          value={row.category}
          onChange={(e) => set({ category: e.target.value })}
          placeholder="Kategorija"
          className={`${field} w-36`}
        />

        {/* Daudzums ar +/- pogām */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => bump(-1)}
            className="h-8 w-8 rounded-lg border border-gold/30 text-gold hover:border-gold"
          >
            −
          </button>
          <input
            type="number"
            step="0.01"
            value={row.quantity}
            onChange={(e) => set({ quantity: Number(e.target.value) })}
            className={`${field} w-20 text-center`}
          />
          <button
            onClick={() => bump(1)}
            className="h-8 w-8 rounded-lg border border-gold/30 text-gold hover:border-gold"
          >
            +
          </button>
        </div>

        <input
          value={row.unit}
          onChange={(e) => set({ unit: e.target.value })}
          placeholder="mērv."
          className={`${field} w-20`}
        />
        <label className="flex items-center gap-1 text-xs text-text/50">
          min
          <input
            type="number"
            step="0.01"
            value={row.min_quantity}
            onChange={(e) => set({ min_quantity: Number(e.target.value) })}
            className={`${field} w-16`}
          />
        </label>

        {low && (
          <span className="rounded-full border border-amber-500/60 px-2 py-0.5 text-[11px] text-amber-200">
            ⚠ zems krājums
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          value={row.notes}
          onChange={(e) => set({ notes: e.target.value })}
          placeholder="Piezīmes"
          className={`${field} flex-1`}
        />
        <button
          onClick={save}
          disabled={pending || !dirty}
          className="rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-40"
        >
          {pending ? "…" : dirty ? "Saglabāt" : "Saglabāts"}
        </button>
        <button
          onClick={remove}
          disabled={pending}
          className="rounded-full border border-red-500/50 px-3 py-1.5 text-xs text-red-300"
        >
          Dzēst
        </button>
        {msg && <span className="text-xs text-gold">{msg}</span>}
      </div>
    </div>
  );
}

export default function MaterialsAdmin({ rows }: { rows: MRow[] }) {
  const [list, setList] = useState<Row[]>(() =>
    rows.map((r) => ({
      ...r,
      _key: r.id ?? crypto.randomUUID(),
      _group: r.category || NO_CAT,
    })),
  );
  // Saglabātie snapshoti (netīrības noteikšanai), keyed by _key.
  const [savedMap, setSavedMap] = useState<Map<string, string>>(
    () => new Map(list.filter((r) => r.id).map((r) => [r._key, dataOf(r)])),
  );

  const change = (key: string, patch: Partial<MRow>) =>
    setList((l) => l.map((r) => (r._key === key ? { ...r, ...patch } : r)));

  const saved = (key: string, id: string) => {
    setList((l) => l.map((r) => (r._key === key ? { ...r, id } : r)));
    setSavedMap((m) => {
      const r = list.find((x) => x._key === key);
      const next = new Map(m);
      if (r) next.set(key, dataOf({ ...r, id }));
      return next;
    });
  };

  const del = (key: string) => {
    setSavedMap((m) => {
      const next = new Map(m);
      next.delete(key);
      return next;
    });
    setList((l) => l.filter((r) => r._key !== key));
  };

  const addNew = () =>
    setList((l) => [
      {
        id: null,
        name: "",
        category: "",
        quantity: 0,
        unit: "",
        min_quantity: 0,
        notes: "",
        _key: crypto.randomUUID(),
        _group: NEW_GROUP,
      },
      ...l,
    ]);

  const stats = useMemo(() => {
    const total = list.filter((r) => r.id).length;
    const low = list.filter((r) => r.id && isLow(r)).length;
    return { total, low };
  }, [list]);

  const groups = useMemo(() => {
    const m = new Map<string, Row[]>();
    for (const r of list) {
      const arr = m.get(r._group) ?? [];
      arr.push(r);
      m.set(r._group, arr);
    }
    // "Jauni materiāli" vienmēr augšā.
    return [...m.entries()].sort((a, b) =>
      a[0] === NEW_GROUP ? -1 : b[0] === NEW_GROUP ? 1 : a[0].localeCompare(b[0]),
    );
  }, [list]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Noliktava</h1>
        <button
          onClick={addNew}
          className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black"
        >
          + Jauns materiāls
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:max-w-md">
        <div className="rounded-xl border border-gold/25 bg-navy/30 p-4 text-center">
          <div className="text-2xl font-bold text-gold">{stats.total}</div>
          <div className="mt-1 text-xs text-text/60">Materiāli kopā</div>
        </div>
        <div
          className={`rounded-xl border p-4 text-center ${
            stats.low > 0
              ? "border-amber-500/60 bg-amber-500/10"
              : "border-gold/25 bg-navy/30"
          }`}
        >
          <div
            className={`text-2xl font-bold ${
              stats.low > 0 ? "text-amber-300" : "text-gold"
            }`}
          >
            {stats.low}
          </div>
          <div className="mt-1 text-xs text-text/60">Zem minimuma</div>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="rounded-2xl border border-gold/20 bg-navy/20 p-8 text-center text-sm text-text/50">
          Nav materiālu. Pievieno ar “Jauns materiāls”. Izmaiņas jāapstiprina ar
          “Saglabāt”.
        </p>
      ) : (
        <div className="space-y-6">
          {groups.map(([group, items]) => (
            <section key={group}>
              <h2 className="mb-2 font-display text-lg font-semibold text-gold">
                {group}
              </h2>
              <div className="space-y-2">
                {items.map((row) => (
                  <MaterialCard
                    key={row._key}
                    row={row}
                    onChange={change}
                    onSaved={saved}
                    onDelete={del}
                    saved={savedMap.get(row._key)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
