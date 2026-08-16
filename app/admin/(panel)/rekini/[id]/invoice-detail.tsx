"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/admin/back-button";
import { createClient } from "@/lib/supabase/client";
import { renderElementToPdfBlob } from "@/lib/invoice-pdf";
import { COMPANY } from "@/lib/company";
import type { Issuer } from "@/lib/invoice-issuer";
import {
  updateInvoice,
  deleteInvoice,
  addPayment,
  deletePayment,
  setInvoicePdfUrl,
} from "../actions";
import type {
  InvoiceRow,
  PaymentRow,
  InvoiceStatus,
  PaymentType,
  PaymentStatus,
} from "../types";
import {
  INVOICE_STATUSES,
  INVOICE_STATUS_LABEL,
  PAYMENT_TYPES,
  PAYMENT_TYPE_LABEL,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABEL,
  computeInvoiceAmounts,
  eur,
} from "../types";

const field =
  "w-full rounded-lg border border-gold/25 bg-navy/40 px-3 py-2 text-sm text-text outline-none focus:border-gold";
const label = "block text-xs uppercase tracking-wide text-text/50";

type Recipient = {
  name: string;
  address: string | null;
  regNr: string | null;
  vatNr: string | null;
  email: string | null;
};

export default function InvoiceDetail({
  invoice,
  client,
  payments,
  issuer,
  recipient,
  pdfSignedUrl,
}: {
  invoice: InvoiceRow;
  client: string | null;
  payments: PaymentRow[];
  issuer: Issuer;
  recipient: Recipient;
  pdfSignedUrl: string | null;
}) {
  const router = useRouter();
  const [inv, setInv] = useState<InvoiceRow>(invoice);
  const [msg, setMsg] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pending, start] = useTransition();
  const templateId = `inv-pdf-${inv.id}`;

  async function generatePdf() {
    if (!issuer.complete) {
      setMsg(
        "Izsniedzēja rekvizīti (IBAN) šim klienta tipam vēl nav ievadīti — nevar ģenerēt PDF.",
      );
      return;
    }
    setPdfBusy(true);
    setMsg("");
    try {
      const blob = await renderElementToPdfBlob(templateId);
      const sb = createClient();
      const path = `${inv.id}/${inv.invoice_number}.pdf`;
      const { error } = await sb.storage
        .from("invoices")
        .upload(path, blob, { contentType: "application/pdf", upsert: true });
      if (error) throw new Error(error.message);
      const res = await setInvoicePdfUrl(inv.id, path);
      if (res?.error) throw new Error(res.error);
      setMsg("PDF izveidots ✓");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "PDF ģenerēšanas kļūda");
    } finally {
      setPdfBusy(false);
    }
  }

  // Jauna maksājuma forma
  const paidSum = payments
    .filter((p) => p.status === "completed")
    .reduce((s, p) => s + p.amount, 0);
  const remaining = Math.round((inv.amount_total - paidSum) * 100) / 100;
  const [pAmount, setPAmount] = useState<number>(remaining > 0 ? remaining : 0);
  const [pType, setPType] = useState<PaymentType>("advance");
  const [pMethod, setPMethod] = useState("");
  const [pStatus, setPStatus] = useState<PaymentStatus>("completed");

  const amounts = computeInvoiceAmounts(inv.amount_net, inv.vat_rate);
  const set = (p: Partial<InvoiceRow>) => setInv((r) => ({ ...r, ...p }));

  function save() {
    setMsg("");
    start(async () => {
      const res = await updateInvoice(inv.id, {
        booking_request_id: inv.booking_request_id,
        issue_date: inv.issue_date,
        due_date: inv.due_date,
        amount_net: amounts.amount_net,
        vat_rate: inv.vat_rate,
        vat_amount: amounts.vat_amount,
        amount_total: amounts.amount_total,
        status: inv.status,
        notes: inv.notes,
      });
      setMsg(res?.error ?? "Saglabāts ✓");
    });
  }

  function remove() {
    if (!confirm("Dzēst rēķinu?")) return;
    start(async () => {
      const res = await deleteInvoice(inv.id);
      if (res?.error) {
        setMsg(res.error);
        return;
      }
      router.push("/admin/rekini");
    });
  }

  function submitPayment() {
    if (!(pAmount > 0)) {
      setMsg("Maksājuma summa jābūt > 0");
      return;
    }
    setMsg("");
    start(async () => {
      const res = await addPayment({
        invoice_id: inv.id,
        booking_request_id: inv.booking_request_id,
        amount: pAmount,
        type: pType,
        method: pMethod,
        status: pStatus,
      });
      if (res?.error) {
        setMsg(res.error);
        return;
      }
      setPMethod("");
      router.refresh();
    });
  }

  const amountsView = computeInvoiceAmounts(inv.amount_net, inv.vat_rate);

  return (
    <>
    <div>
      <BackButton fallback="/admin/rekini" />

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-2xl font-bold">
          Rēķins{" "}
          <span className="font-mono text-gold">{inv.invoice_number}</span>
        </h1>
        {client && <span className="text-sm text-text/60">{client}</span>}
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Rēķina lauki */}
        <section className="space-y-4 rounded-2xl border border-gold/25 bg-navy/30 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Izrakstīts</label>
              <input
                type="date"
                value={inv.issue_date}
                onChange={(e) => set({ issue_date: e.target.value })}
                className={`${field} mt-1`}
              />
            </div>
            <div>
              <label className={label}>Apmaksas termiņš</label>
              <input
                type="date"
                value={inv.due_date ?? ""}
                onChange={(e) => set({ due_date: e.target.value || null })}
                className={`${field} mt-1`}
              />
            </div>
            <div>
              <label className={label}>Summa bez PVN (€)</label>
              <input
                type="number"
                step="0.01"
                value={inv.amount_net}
                onChange={(e) => set({ amount_net: Number(e.target.value) })}
                className={`${field} mt-1`}
              />
            </div>
            <div>
              <label className={label}>PVN likme (%)</label>
              <input
                type="number"
                step="1"
                value={inv.vat_rate}
                onChange={(e) => set({ vat_rate: Number(e.target.value) })}
                className={`${field} mt-1`}
              />
            </div>
          </div>

          <div className="rounded-lg border border-gold/20 bg-bg/40 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text/60">Bez PVN</span>
              <span className="font-mono">{eur(amounts.amount_net)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text/60">PVN {inv.vat_rate}%</span>
              <span className="font-mono">{eur(amounts.vat_amount)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-gold/15 pt-1 font-semibold">
              <span>Kopā</span>
              <span className="font-mono text-gold">
                {eur(amounts.amount_total)}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Statuss</label>
              <select
                value={inv.status}
                onChange={(e) =>
                  set({ status: e.target.value as InvoiceStatus })
                }
                className={`${field} mt-1`}
              >
                {INVOICE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {INVOICE_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={label}>Piezīmes</label>
            <textarea
              rows={3}
              value={inv.notes}
              onChange={(e) => set({ notes: e.target.value })}
              className={`${field} mt-1`}
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={save}
              disabled={pending}
              className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black disabled:opacity-60"
            >
              {pending ? "Saglabā…" : "Saglabāt"}
            </button>
            <button
              onClick={remove}
              disabled={pending}
              className="rounded-full border border-red-500/50 px-4 py-2 text-sm text-red-300 disabled:opacity-60"
            >
              Dzēst
            </button>
            {inv.booking_request_id && (
              <Link
                href={`/admin/${inv.booking_request_id}`}
                className="text-xs text-gold hover:underline"
              >
                → Pieteikums
              </Link>
            )}
            {msg && <span className="text-xs text-gold">{msg}</span>}
          </div>

          {/* PDF ģenerēšana */}
          <div className="flex flex-wrap items-center gap-3 border-t border-gold/15 pt-3">
            <button
              onClick={generatePdf}
              disabled={pdfBusy || !issuer.complete}
              title={
                issuer.complete
                  ? undefined
                  : "Izsniedzēja rekvizīti šim klienta tipam nav ievadīti"
              }
              className="rounded-full border border-gold/40 px-4 py-1.5 text-xs font-semibold text-gold disabled:opacity-50"
            >
              {pdfBusy ? "Ģenerē…" : "Ģenerēt PDF"}
            </button>
            {pdfSignedUrl && (
              <a
                href={pdfSignedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gold hover:underline"
              >
                Atvērt PDF
              </a>
            )}
            <span className="text-[11px] text-text/40">
              Izsniedzējs: {issuer.legalName}
              {!issuer.complete ? " (rekvizīti nav ievadīti)" : ""}
            </span>
          </div>
        </section>

        {/* Maksājumi */}
        <section className="rounded-2xl border border-gold/25 bg-navy/30 p-6">
          <h2 className="font-display text-lg font-semibold text-gold">
            Maksājumi
          </h2>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-text/60">Saņemts</span>
            <span className="font-mono text-green-300">{eur(paidSum)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text/60">Atlikums</span>
            <span className="font-mono text-gold">{eur(remaining)}</span>
          </div>

          <ul className="mt-3 space-y-2">
            {payments.length === 0 && (
              <li className="text-sm text-text/40">Nav maksājumu.</li>
            )}
            {payments.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-gold/15 bg-bg/40 p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-text/90">{eur(p.amount)}</span>
                  <button
                    onClick={() =>
                      start(async () => {
                        await deletePayment(p.id, inv.id);
                        router.refresh();
                      })
                    }
                    className="text-[11px] text-red-300 hover:text-red-200"
                  >
                    Dzēst
                  </button>
                </div>
                <div className="mt-1 text-xs text-text/50">
                  {PAYMENT_TYPE_LABEL[p.type]} · {PAYMENT_STATUS_LABEL[p.status]}
                  {p.method ? ` · ${p.method}` : ""}
                </div>
              </li>
            ))}
          </ul>

          {/* Jauns maksājums */}
          <div className="mt-4 space-y-2 border-t border-gold/15 pt-4">
            <p className="text-xs uppercase tracking-wide text-text/50">
              Pievienot maksājumu
            </p>
            <input
              type="number"
              step="0.01"
              value={pAmount}
              onChange={(e) => setPAmount(Number(e.target.value))}
              placeholder="Summa €"
              className={field}
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={pType}
                onChange={(e) => setPType(e.target.value as PaymentType)}
                className={field}
              >
                {PAYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {PAYMENT_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
              <select
                value={pStatus}
                onChange={(e) => setPStatus(e.target.value as PaymentStatus)}
                className={field}
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {PAYMENT_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
            <input
              value={pMethod}
              onChange={(e) => setPMethod(e.target.value)}
              placeholder="Metode (banka, skaidra…)"
              className={field}
            />
            <button
              onClick={submitPayment}
              disabled={pending}
              className="w-full rounded-full bg-gold px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
            >
              Pievienot
            </button>
            <p className="text-[11px] text-text/40">
              Kad “Saņemts” maksājumu summa sasniedz kopsummu, rēķins automātiski
              kļūst “Apmaksāts”.
            </p>
          </div>
        </section>
      </div>
    </div>

    {/* Paslēptā PDF veidne (html2canvas renderē kā attēlu; balts fons, melns teksts). */}
    <div
      aria-hidden
      style={{ position: "absolute", left: "-9999px", top: 0 }}
    >
      <div
        id={templateId}
        style={{
          width: "760px",
          padding: "48px",
          background: "#ffffff",
          color: "#1A3A4A",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "13px",
          lineHeight: 1.5,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#B0842E" }}>
            {COMPANY.brandName}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "18px", fontWeight: 700 }}>RĒĶINS</div>
            <div style={{ fontFamily: "monospace" }}>{inv.invoice_number}</div>
          </div>
        </div>

        <div style={{ height: "3px", background: "#D4A960", margin: "16px 0 24px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", gap: "32px" }}>
          <div style={{ width: "50%" }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#888" }}>
              Izsniedzējs
            </div>
            <div style={{ fontWeight: 700 }}>{issuer.legalName}</div>
            {issuer.regNr && <div>{issuer.regLabel} {issuer.regNr}</div>}
            {issuer.vatNr && <div>PVN Nr. {issuer.vatNr}</div>}
            <div>{issuer.address}</div>
            <div>{issuer.phone}</div>
            <div>{issuer.email}</div>
          </div>
          <div style={{ width: "50%" }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#888" }}>
              Saņēmējs
            </div>
            <div style={{ fontWeight: 700 }}>{recipient.name}</div>
            {recipient.regNr && <div>Reģ. Nr. {recipient.regNr}</div>}
            {recipient.vatNr && <div>PVN Nr. {recipient.vatNr}</div>}
            {recipient.address && <div>{recipient.address}</div>}
            {recipient.email && <div>{recipient.email}</div>}
          </div>
        </div>

        <div style={{ display: "flex", gap: "32px", margin: "20px 0" }}>
          <div>
            <span style={{ color: "#888" }}>Izrakstīts: </span>
            {inv.issue_date}
          </div>
          {inv.due_date && (
            <div>
              <span style={{ color: "#888" }}>Apmaksas termiņš: </span>
              {inv.due_date}
            </div>
          )}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", margin: "8px 0" }}>
          <tbody>
            <tr>
              <td style={{ padding: "8px 0", borderBottom: "1px solid #e6e1d6" }}>
                Pakalpojumi{inv.booking_request_id ? " (pēc pieteikuma)" : ""}
              </td>
              <td style={{ padding: "8px 0", borderBottom: "1px solid #e6e1d6", textAlign: "right", fontFamily: "monospace" }}>
                {eur(amountsView.amount_net)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "6px 0", color: "#555" }}>PVN {inv.vat_rate}%</td>
              <td style={{ padding: "6px 0", textAlign: "right", fontFamily: "monospace" }}>
                {eur(amountsView.vat_amount)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", fontWeight: 700, borderTop: "2px solid #D4A960" }}>
                Kopā apmaksai
              </td>
              <td style={{ padding: "8px 0", fontWeight: 700, textAlign: "right", fontFamily: "monospace", borderTop: "2px solid #D4A960" }}>
                {eur(amountsView.amount_total)}
              </td>
            </tr>
          </tbody>
        </table>

        {issuer.iban && (
          <div style={{ marginTop: "20px", padding: "12px 16px", background: "#faf6ec", borderLeft: "3px solid #D4A960" }}>
            <div style={{ fontWeight: 700 }}>Apmaksas rekvizīti</div>
            <div>{issuer.bankName}</div>
            <div>IBAN: {issuer.iban}</div>
            {issuer.swift && <div>SWIFT: {issuer.swift}</div>}
          </div>
        )}

        {inv.notes && (
          <div style={{ marginTop: "16px", whiteSpace: "pre-wrap", color: "#555" }}>
            {inv.notes}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
