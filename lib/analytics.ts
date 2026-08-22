// GTM/GA4 notikumi caur dataLayer + FB Pixel Lead.
// Skripti ielādējas tikai pēc sīkdatņu piekrišanas (Consent Mode v2, SOLIS2),
// tāpēc bez piekrišanas notikumi tiek ignorēti (dataLayer glabā, bet GA4/Pixel
// nefirē līdz "granted").

/* eslint-disable @typescript-eslint/no-explicit-any */
export function track(event: string, params: Record<string, any> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

// Facebook Pixel "Lead" — tikai ja mārketinga piekrišana ielādējusi fbq.
export function trackLead(value: number) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "Lead", { value, currency: "EUR" });
  }
}

// Konversijas notikums ar VĒRTĪBU un VALŪTU (B2B spec §8). Bez value+currency
// Google Ads Smart Bidding uzskata visus pieprasījumus par vienādi vērtīgiem,
// tāpēc ROAS = 0. Šis padod abus dataLayer, lai GTM Google Ads tags tos nolasa.
export function trackConversion(
  event: string,
  value: number,
  params: Record<string, any> = {},
) {
  track(event, { value, currency: "EUR", ...params });
}

// Fiksētas konversijas vērtības pēc avota (Google Ads Smart Bidding / ROAS).
// Bez konsekventas value visi pieteikumi šķiet vienlīdzīgi. B2B un pašvaldības =
// lielāki darījumi → augstāka vērtība; B2C anketa un rezervācija = 150 EUR.
export const LEAD_VALUE: Record<string, number> = {
  b2b: 400,
  pasvaldibam: 400,
  b2c: 150,
  reservation: 150,
};

// B2B anketas iesniegums. Atsevišķs notikums no B2C rezervācijas (booking_submitted),
// lai kampaņas var optimizēt atsevišķi. value+currency → Google Ads/Meta ROAS.
export function generateLead(
  value: number,
  source = "b2b",
  params: Record<string, any> = {},
) {
  // lead_source = tīra GA4 dimensija; source paturēts esošajam GTM tagam.
  track("generate_lead", {
    value,
    currency: "EUR",
    source,
    lead_source: source,
    ...params,
  });
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "Lead", { value, currency: "EUR" });
  }
}

// Kontakta klikšķi (telefons / WhatsApp / e-pasts) — B2B daļa zvana, ne aizpilda
// anketu, tāpēc šie klikšķi ir svarīgi kā mikro-konversijas.
export function trackContactClick(
  method: "phone" | "whatsapp" | "email",
  context = "",
) {
  track("contact_click", { method, context });
}

// tel: klikšķis ar lapas slug avotu (Google Ads/GA4). B2B daļa zvana — bez šī
// notikuma kampaņas izskatās sliktākas, nekā ir.
export function trackPhoneClick(source: string) {
  track("phone_click", { lead_source: source });
}
/* eslint-enable @typescript-eslint/no-explicit-any */
