import type { CartItem } from "@/lib/pricing";

export type Booking = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string;
  company: string | null;
  reg_nr: string | null;
  event_date: string;
  event_time: string | null;
  duration: string | null;
  event_type: string;
  guest_count: number | null;
  location: string;
  indoor_outdoor: string | null;
  description: string | null;
  items: CartItem[];
  estimated_total: number | null;
  final_total: number | null;
  delivery_address: string | null;
  delivery_distance_km: number | null;
  delivery_cost: number | null;
  delivery_geocoded: string | null;
  status: string;
  admin_notes: string | null;
  viewed_at: string | null;
  paid_sum?: number; // summēti completed maksājumi (apmaksas krāsu shēmai)
};

export const STATUSES: { id: string; label: string }[] = [
  { id: "new", label: "Jauns" },
  { id: "contacted", label: "Sazinājos" },
  { id: "quoted", label: "Piedāvājums nosūtīts" },
  { id: "confirmed", label: "Apstiprināts" },
  { id: "completed", label: "Pabeigts" },
  { id: "rejected", label: "Atteicās" },
];

export function statusLabel(id: string): string {
  return STATUSES.find((s) => s.id === id)?.label ?? id;
}

// Steidzamība pēc pasākuma datuma un statusa.
export function urgency(
  eventDate: string,
  status: string,
): "red" | "yellow" | "none" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(eventDate);
  const days = Math.ceil((d.getTime() - today.getTime()) / 86400000);
  if (days < 0) return "none";
  if (days < 7 && status === "new") return "red";
  if (days < 30 && (status === "new" || status === "contacted")) return "yellow";
  return "none";
}
