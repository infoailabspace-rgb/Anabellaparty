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
/* eslint-enable @typescript-eslint/no-explicit-any */
