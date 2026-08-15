export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "cancelled";
export type PaymentType = "advance" | "remainder" | "full";
export type PaymentStatus = "pending" | "completed" | "failed";

export type InvoiceInput = {
  booking_request_id: string | null;
  issue_date: string;
  due_date: string | null;
  amount_net: number;
  vat_rate: number;
  vat_amount: number;
  amount_total: number;
  status: InvoiceStatus;
  notes: string;
};

export type InvoiceRow = InvoiceInput & {
  id: string;
  invoice_number: string;
  pdf_url: string | null;
};

export type ListRow = {
  id: string;
  invoice_number: string;
  issue_date: string;
  amount_total: number;
  status: InvoiceStatus;
  client: string;
};

export type PaymentRow = {
  id: string;
  amount: number;
  type: PaymentType;
  method: string | null;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
};

export type BookingOption = {
  id: string;
  label: string;
  amount_net: number; // final_total ?? estimated_total + delivery_cost
};

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
];
export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: "Melnraksts",
  sent: "Nosūtīts",
  paid: "Apmaksāts",
  overdue: "Nokavēts",
  cancelled: "Atcelts",
};

export const PAYMENT_TYPES: PaymentType[] = ["advance", "remainder", "full"];
export const PAYMENT_TYPE_LABEL: Record<PaymentType, string> = {
  advance: "Avanss",
  remainder: "Atlikums",
  full: "Pilna summa",
};

export const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "completed",
  "failed",
];
export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Gaida",
  completed: "Saņemts",
  failed: "Neizdevās",
};

// PVN aprēķins (2 zīmes aiz komata).
export function computeInvoiceAmounts(net: number, vatRate: number) {
  const n = Math.round((Number(net) || 0) * 100) / 100;
  const rate = Number(vatRate) || 0;
  const vat = Math.round(n * rate) / 100;
  const total = Math.round((n + vat) * 100) / 100;
  return { amount_net: n, vat_amount: vat, amount_total: total };
}

export function eur(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${Number(n).toFixed(2)} €`;
}
