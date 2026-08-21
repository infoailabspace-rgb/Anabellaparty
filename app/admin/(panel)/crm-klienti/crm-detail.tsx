"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { upsertCustomer, deleteCustomer } from "./actions";
import { statusBadge, paymentBadge, bookingAmount } from "@/lib/booking-status";
import BackButton from "@/components/admin/back-button";
import type { CustomerRow, BookingLite, Segment, CustomerType } from "./types";
import { SEGMENTS, SEGMENT_LABEL } from "./types";

const field =
  "w-full rounded-lg border border-gold/25 bg-bg/60 px-3 py-2 text-sm text-text outline-none focus:border-gold";
const label = "block text-xs uppercase tracking-wide text-text/50";

function eur(n: number | null): string {
  if (n == null) return "—";
  return Number.isInteger(n) ? `${n} €` : `${n.toFixed(2)} €`;
}

// Skatīšanas režīma teksta rinda.
function ViewRow({ label: lbl, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className={label}>{lbl}</p>
      <p className="mt-1 text-sm text-text/90">
        {value === "" || value == null ? "—" : value}
      </p>
    </div>
  );
}

export default function CrmDetail({
  customer,
  bookings,
}: {
  customer: CustomerRow;
  bookings: BookingLite[];
}) {
  const router = useRouter();
  const [row, setRow] = useState<CustomerRow>(customer);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const isNew = !row.id;
  // Jauns klients uzreiz rediģēšanas režīmā; esošs — skatīšanas.
  const [isEditing, setIsEditing] = useState(isNew);

  const set = (p: Partial<CustomerRow>) => setRow((r) => ({ ...r, ...p }));

  function cancel() {
    if (isNew) {
      router.push("/admin/crm-klienti");
      return;
    }
    setRow(customer);
    setMsg("");
    setIsEditing(false);
  }

  function save() {
    if (!row.name.trim()) {
      setMsg("Nosaukums ir obligāts");
      return;
    }
    setMsg("");
    start(async () => {
      const { id: _id, ...input } = row;
      void _id;
      const res = await upsertCustomer(row.id, input);
      if (res?.error) {
        setMsg(res.error);
        return;
      }
      if (isNew && res?.id) {
        router.push(`/admin/crm-klienti/${res.id}`);
        return;
      }
      setMsg("Saglabāts ✓");
      setIsEditing(false);
      router.refresh();
    });
  }

  function remove() {
    if (!row.id) return;
    if (!confirm("Dzēst klientu? Rezervācijas paliks, tikai atsaistīsies.")) return;
    start(async () => {
      const res = await deleteCustomer(row.id!);
      if (res?.error) {
        setMsg(res.error);
        return;
      }
      router.push("/admin/crm-klienti");
    });
  }

  return (
    <div>
      <BackButton fallback="/admin/crm-klienti" />

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Rediģēšana / skatīšana */}
        <section className="space-y-4 rounded-2xl border border-gold/25 bg-navy/30 p-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display text-2xl font-bold">
              {isNew ? "Jauns klients" : row.name}
            </h1>
            {isEditing ? (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={save}
                  disabled={pending}
                  className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black disabled:opacity-60"
                >
                  {pending ? "Saglabā…" : "💾 Saglabāt"}
                </button>
                <button
                  onClick={cancel}
                  disabled={pending}
                  className="rounded-full border border-gold/40 px-4 py-2 text-sm text-text/80 hover:border-gold disabled:opacity-60"
                >
                  ✖️ Atcelt
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="shrink-0 rounded-full border border-gold/40 px-5 py-2 text-sm font-semibold text-gold hover:bg-gold/10"
              >
                ✏️ Rediģēt
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={label}>
                  {row.type === "company" ? "Uzņēmuma nosaukums *" : "Vārds *"}
                </label>
                <input
                  value={row.name}
                  onChange={(e) => set({ name: e.target.value })}
                  className={`${field} mt-1`}
                />
              </div>

              <div>
                <label className={label}>Tips</label>
                <select
                  value={row.type}
                  onChange={(e) => set({ type: e.target.value as CustomerType })}
                  className={`${field} mt-1`}
                >
                  <option value="person">Privātpersona</option>
                  <option value="company">Uzņēmums</option>
                </select>
              </div>

              <div>
                <label className={label}>Kontaktpersona</label>
                <input
                  value={row.contact_person}
                  onChange={(e) => set({ contact_person: e.target.value })}
                  placeholder={row.type === "company" ? "Vārds Uzvārds" : "—"}
                  className={`${field} mt-1`}
                />
              </div>

              <div>
                <label className={label}>E-pasts</label>
                <input
                  value={row.email}
                  onChange={(e) => set({ email: e.target.value })}
                  className={`${field} mt-1`}
                />
              </div>

              <div>
                <label className={label}>Telefons</label>
                <input
                  value={row.phone}
                  onChange={(e) => set({ phone: e.target.value })}
                  className={`${field} mt-1`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={label}>Adrese</label>
                <input
                  value={row.address}
                  onChange={(e) => set({ address: e.target.value })}
                  className={`${field} mt-1`}
                />
              </div>

              {row.type === "company" && (
                <>
                  <div>
                    <label className={label}>Reģ. Nr.</label>
                    <input
                      value={row.company_reg_nr}
                      onChange={(e) => set({ company_reg_nr: e.target.value })}
                      className={`${field} mt-1`}
                    />
                  </div>
                  <div>
                    <label className={label}>PVN Nr.</label>
                    <input
                      value={row.company_vat_nr}
                      onChange={(e) => set({ company_vat_nr: e.target.value })}
                      className={`${field} mt-1`}
                    />
                  </div>
                </>
              )}

              <div>
                <label className={label}>Segments</label>
                <select
                  value={row.segment}
                  onChange={(e) => set({ segment: e.target.value as Segment })}
                  className={`${field} mt-1`}
                >
                  {SEGMENTS.map((s) => (
                    <option key={s} value={s}>
                      {SEGMENT_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={label}>Atlaide (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={row.discount_percent}
                  onChange={(e) =>
                    set({ discount_percent: Number(e.target.value) })
                  }
                  className={`${field} mt-1`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={label}>Piezīmes</label>
                <textarea
                  rows={4}
                  value={row.notes}
                  onChange={(e) => set({ notes: e.target.value })}
                  className={`${field} mt-1`}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <ViewRow label="Tips" value={row.type === "company" ? "Uzņēmums" : "Privātpersona"} />
              <ViewRow label="Kontaktpersona" value={row.contact_person} />
              <ViewRow label="E-pasts" value={row.email} />
              <ViewRow label="Telefons" value={row.phone} />
              <div className="sm:col-span-2"><ViewRow label="Adrese" value={row.address} /></div>
              {row.type === "company" && (
                <>
                  <ViewRow label="Reģ. Nr." value={row.company_reg_nr} />
                  <ViewRow label="PVN Nr." value={row.company_vat_nr} />
                </>
              )}
              <ViewRow label="Segments" value={SEGMENT_LABEL[row.segment]} />
              <ViewRow label="Atlaide (%)" value={`${row.discount_percent || 0}%`} />
              <div className="sm:col-span-2"><ViewRow label="Piezīmes" value={row.notes} /></div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            {isEditing && !isNew && (
              <button
                onClick={remove}
                disabled={pending}
                className="rounded-full border border-red-500/50 px-4 py-2 text-sm text-red-300 disabled:opacity-60"
              >
                Dzēst
              </button>
            )}
            {msg && <span className="text-xs text-gold">{msg}</span>}
          </div>
        </section>

        {/* Vēsture */}
        <section className="rounded-2xl border border-gold/25 bg-navy/30 p-6">
          <h2 className="font-display text-lg font-semibold text-gold">
            Rezervāciju vēsture
          </h2>
          {isNew ? (
            <p className="mt-3 text-sm text-text/50">
              Vēsture būs pieejama pēc saglabāšanas.
            </p>
          ) : bookings.length === 0 ? (
            <p className="mt-3 text-sm text-text/50">Nav rezervāciju.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {bookings.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/admin/${b.id}`}
                    className="block rounded-lg border border-gold/15 bg-bg/40 p-3 hover:border-gold/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-text/90">
                        {b.event_date}
                      </span>
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {(() => {
                          const sb = statusBadge(b.status);
                          const pb = paymentBadge(
                            b.paid_sum,
                            bookingAmount(b),
                            b.event_date,
                            b.payment_deferred ?? false,
                          );
                          return (
                            <>
                              <span
                                className={`rounded-full border px-2 py-0.5 text-[11px] ${sb.cls}`}
                              >
                                {sb.label}
                              </span>
                              <span
                                className={`rounded-full border px-2 py-0.5 text-[11px] ${pb.cls}`}
                              >
                                {pb.label}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-text/60">
                      <span>{b.event_type}</span>
                      <span className="font-mono">
                        {eur(b.final_total ?? b.estimated_total)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
