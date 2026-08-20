"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  setCleaningStatus,
  saveCleaningNotes,
  type CleaningStatus,
} from "./actions";

export type CleaningGroup =
  | "atrakcijas"
  | "bumbu-somas"
  | "dzirkstelu-ierices"
  | "burbulu-ierices";

export type CRow = {
  id: string;
  name: string;
  group: CleaningGroup;
  cleaning_status: CleaningStatus;
  cleaning_notes: string;
};

// Fiksēta grupu secība + virsraksti (ne jaukti).
const GROUP_ORDER: CleaningGroup[] = [
  "atrakcijas",
  "bumbu-somas",
  "dzirkstelu-ierices",
  "burbulu-ierices",
];
const GROUP_LABEL: Record<CleaningGroup, string> = {
  atrakcijas: "Atrakcijas",
  "bumbu-somas": "Bumbu somas",
  "dzirkstelu-ierices": "Dzirksteļu ierīces",
  "burbulu-ierices": "Burbuļu ierīces",
};

const STATUS_BTN: { id: Exclude<CleaningStatus, null>; label: string; on: string }[] =
  [
    { id: "cleaned", label: "🟢 Iztīrīts", on: "bg-green-500/20 border-green-500/60 text-green-200" },
    { id: "dirty", label: "🔴 Netīrs", on: "bg-red-500/20 border-red-500/60 text-red-200" },
    { id: "broken", label: "🟡 Nav darba kārtībā", on: "bg-amber-500/20 border-amber-500/60 text-amber-200" },
  ];

const field =
  "w-full rounded-lg border border-gold/25 bg-bg/60 px-3 py-2 text-sm text-text outline-none focus:border-gold";

type SaveState = "idle" | "saving" | "saved" | "error";

function Card({
  row,
  onStatus,
  onNotes,
}: {
  row: CRow;
  onStatus: (id: string, s: CleaningStatus) => void;
  onNotes: (id: string, notes: string) => void;
}) {
  const [notes, setNotes] = useState(row.cleaning_notes);
  const [pending, start] = useTransition();
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errMsg, setErrMsg] = useState("");
  const savedRef = useRef(row.cleaning_notes);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // "✓ saglabāts" pazūd pēc 2 sek. Notīra taimeri, ja komponents atmontējas.
  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  function flashSaved() {
    setSaveState("saved");
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaveState("idle"), 2000);
  }

  // Statuss: optimistiski + GAIDA serveri. Kļūdā atritina + sarkans ziņojums.
  function onStatusClick(next: CleaningStatus) {
    const prev = row.cleaning_status;
    setErrMsg("");
    setSaveState("saving");
    onStatus(row.id, next);
    start(async () => {
      const res = await setCleaningStatus(row.id, next);
      if (res?.error) {
        onStatus(row.id, prev);
        setSaveState("error");
        setErrMsg(res.error);
        return;
      }
      flashSaved();
    });
  }

  function blurNotes() {
    if (notes === savedRef.current) return;
    const prev = savedRef.current;
    savedRef.current = notes;
    onNotes(row.id, notes);
    setErrMsg("");
    setSaveState("saving");
    start(async () => {
      const res = await saveCleaningNotes(row.id, notes);
      if (res?.error) {
        savedRef.current = prev;
        onNotes(row.id, prev);
        setNotes(prev);
        setSaveState("error");
        setErrMsg(res.error);
        return;
      }
      flashSaved();
    });
  }

  return (
    <div className="rounded-xl border border-gold/20 bg-navy/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-semibold text-text/90">
          {row.name}
          {saveState === "saving" && (
            <span className="text-xs font-normal text-text/40">saglabā…</span>
          )}
          {saveState === "saved" && (
            <span className="text-xs font-normal text-green-300">
              ✓ saglabāts
            </span>
          )}
        </span>
        <div className="flex gap-1.5">
          {STATUS_BTN.map((b) => {
            const active = row.cleaning_status === b.id;
            return (
              <button
                key={b.id}
                disabled={pending}
                onClick={() => onStatusClick(active ? null : b.id)}
                className={`rounded-full border px-2.5 py-1 text-xs transition-colors disabled:opacity-60 ${
                  active
                    ? b.on
                    : "border-gold/20 text-text/50 hover:border-gold/50"
                }`}
              >
                {b.label}
              </button>
            );
          })}
        </div>
      </div>
      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={blurNotes}
        placeholder="Piezīmes (auto-saglabā)"
        className={`${field} mt-3`}
      />
      {saveState === "error" && errMsg && (
        <p className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300">
          {errMsg}
        </p>
      )}
    </div>
  );
}

export default function CleaningAdmin({ rows }: { rows: CRow[] }) {
  const [list, setList] = useState<CRow[]>(rows);

  const stats = useMemo(() => {
    const s = { cleaned: 0, dirty: 0, broken: 0, unset: 0 };
    for (const r of list) {
      if (r.cleaning_status === "cleaned") s.cleaned++;
      else if (r.cleaning_status === "dirty") s.dirty++;
      else if (r.cleaning_status === "broken") s.broken++;
      else s.unset++;
    }
    return s;
  }, [list]);

  const groups = useMemo(
    () =>
      GROUP_ORDER.map(
        (g) => [g, list.filter((r) => r.group === g)] as const,
      ).filter(([, items]) => items.length > 0),
    [list],
  );

  const setStatusLocal = (id: string, s: CleaningStatus) =>
    setList((l) => l.map((x) => (x.id === id ? { ...x, cleaning_status: s } : x)));
  const setNotesLocal = (id: string, notes: string) =>
    setList((l) => l.map((x) => (x.id === id ? { ...x, cleaning_notes: notes } : x)));

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold">Tīrība</h1>

      {/* Kopsavilkums */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="🟢 Iztīrīti" value={stats.cleaned} />
        <Stat label="🔴 Netīri" value={stats.dirty} />
        <Stat label="🟡 Nav d.k." value={stats.broken} />
        <Stat label="⚪ Nav norādīts" value={stats.unset} />
      </div>

      <div className="space-y-6">
        {groups.map(([grp, items]) => (
          <section key={grp}>
            <h2 className="mb-2 font-display text-lg font-semibold text-gold">
              {GROUP_LABEL[grp]}{" "}
              <span className="text-sm font-normal text-text/50">
                ({items.length})
              </span>
            </h2>
            <div className="space-y-2">
              {items.map((row) => (
                <Card
                  key={row.id}
                  row={row}
                  onStatus={setStatusLocal}
                  onNotes={setNotesLocal}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gold/25 bg-navy/30 p-4 text-center">
      <div className="text-2xl font-bold text-gold">{value}</div>
      <div className="mt-1 text-xs text-text/60">{label}</div>
    </div>
  );
}
