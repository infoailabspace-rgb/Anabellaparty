import type { CartItem } from "@/lib/pricing";

export type BookingContact = {
  name: string;
  phone: string;
  email: string;
  company?: string;
  regNr?: string;
};

export type BookingEvent = {
  date: string; // YYYY-MM-DD
  time?: string;
  duration?: string;
  type: string;
  guestCount?: number | string;
  location: string;
  indoorOutdoor?: string;
};

export type BookingDelivery = {
  address?: string;
  km?: number;
  cost?: number;
  geocoded?: string | null; // ORS atrastais adreses teksts (mismatch pārbaudei)
};

export type BookingPayload = {
  items: CartItem[];
  contact: BookingContact;
  event: BookingEvent;
  description?: string;
  consent?: boolean;
  delivery?: BookingDelivery;
};

// Normalizē LV telefonu uz +371XXXXXXXX. Pieņem "+371 2X XX XX XX", "2XXXXXXX" utt.
export function normalizePhone(raw: string): string {
  const digits = (raw || "").replace(/[^\d+]/g, "");
  let d = digits.replace(/^\+/, "");
  if (d.startsWith("371")) d = d.slice(3);
  // atmet vadošās nulles gadījumam
  d = d.replace(/^0+/, "");
  return d.length === 8 ? `+371${d}` : (raw || "").trim();
}

export function isValidPhone(raw: string): boolean {
  return /^\+371\d{8}$/.test(normalizePhone(raw));
}

export function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((raw || "").trim());
}

// Servera puses validācija — atgriež kļūdu ziņojumus (tukšs = OK).
export function validateBooking(payload: BookingPayload): string[] {
  const errors: string[] = [];
  const c = payload.contact ?? ({} as BookingContact);
  const e = payload.event ?? ({} as BookingEvent);

  if (!c.name?.trim()) errors.push("Trūkst vārda.");
  if (!isValidPhone(c.phone || "")) errors.push("Nederīgs telefona numurs.");
  if (!isValidEmail(c.email || "")) errors.push("Nederīgs e-pasts.");
  if (!e.date) errors.push("Trūkst pasākuma datuma.");
  else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(e.date) < today) errors.push("Datums nedrīkst būt pagātnē.");
  }
  if (!e.type?.trim()) errors.push("Trūkst pasākuma veida.");
  if (!e.location?.trim()) errors.push("Trūkst norises vietas.");
  if (!payload.delivery?.address?.trim())
    errors.push("Trūkst piegādes adreses (iela un pilsēta).");
  if (!Array.isArray(payload.items) || payload.items.length === 0)
    errors.push("Nav izvēlēts inventārs.");
  if (!payload.consent) errors.push("Jāpiekrīt noteikumiem.");

  return errors;
}
