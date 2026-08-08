// Sīkdatņu piekrišanas loģika + dinamiska GTM/Pixel injekcija.
// Google Consent Mode v2: noklusējumi "denied", banneris atjauno ar "update".
// Skripti tiek injektēti TIKAI pēc attiecīgas piekrišanas — bez piekrišanas
// tie neparādās Network tabā.

export const CONSENT_KEY = "anabella-cookie-consent";
export const GTM_ID = "GTM-WDQZZ5PG";
export const FB_PIXEL_ID = "896953122077848";

export type Consent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: any;
    _fbq?: any;
    __anabellaGtmLoaded?: boolean;
    __anabellaPixelLoaded?: boolean;
    __anabellaConsentInit?: boolean;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 gads

// Sīkfails ir PRIMĀRĀ glabātuve — noturīgs pat tur, kur localStorage ir bloķēts
// (Safari privātais režīms, atspējota krātuve) vai partitioned (preview iframe).
function writeCookie(value: string) {
  if (typeof document === "undefined") return;
  try {
    const secure =
      typeof location !== "undefined" && location.protocol === "https:"
        ? "; Secure"
        : "";
    document.cookie = `${CONSENT_KEY}=${encodeURIComponent(
      value,
    )}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  } catch {
    /* ignore */
  }
}

function readCookie(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(
    new RegExp("(?:^|; )" + CONSENT_KEY + "=([^;]*)"),
  );
  return m ? decodeURIComponent(m[1]) : null;
}

export function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  // Sīkfails vispirms; ja nav — localStorage rezerve.
  let raw = readCookie();
  if (!raw) {
    try {
      raw = window.localStorage.getItem(CONSENT_KEY);
    } catch {
      raw = null;
    }
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Consent>;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      timestamp: parsed.timestamp ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveConsent(analytics: boolean, marketing: boolean): Consent {
  const consent: Consent = {
    necessary: true,
    analytics,
    marketing,
    timestamp: new Date().toISOString(),
  };
  const raw = JSON.stringify(consent);
  // Sīkfails primārais (noturīgs), localStorage rezerve — abi neatkarīgi.
  writeCookie(raw);
  try {
    window.localStorage.setItem(CONSENT_KEY, raw);
  } catch {
    /* sīkfails jau saglabāts */
  }
  return consent;
}

// Consent Mode v2 noklusējumi — visu "denied", pirms jebkas ielādējas.
export function initConsentDefaults() {
  if (typeof window === "undefined" || window.__anabellaConsentInit) return;
  window.__anabellaConsentInit = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  window.gtag?.("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
}

function loadGtm() {
  if (window.__anabellaGtmLoaded) return;
  window.__anabellaGtmLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(s);
}

function loadPixel() {
  if (window.__anabellaPixelLoaded) return;
  window.__anabellaPixelLoaded = true;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (function (f: any, b: Document) {
    if (f.fbq) return;
    const n: any = (f.fbq = function () {
      // eslint-disable-next-line prefer-spread, prefer-rest-params
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const t = b.createElement("script");
    t.async = true;
    t.src = "https://connect.facebook.net/en_US/fbevents.js";
    b.head.appendChild(t);
  })(window, document);
  /* eslint-enable @typescript-eslint/no-explicit-any */
  window.fbq("init", FB_PIXEL_ID);
  window.fbq("track", "PageView");
}

// Piemēro piekrišanu: atjauno Consent Mode un injektē atļautos skriptus.
export function applyConsent(consent: Consent) {
  if (typeof window === "undefined") return;
  initConsentDefaults();

  window.gtag?.("consent", "update", {
    analytics_storage: consent.analytics ? "granted" : "denied",
    ad_storage: consent.marketing ? "granted" : "denied",
    ad_user_data: consent.marketing ? "granted" : "denied",
    ad_personalization: consent.marketing ? "granted" : "denied",
  });

  if (consent.analytics) loadGtm();
  if (consent.marketing) loadPixel();
}
