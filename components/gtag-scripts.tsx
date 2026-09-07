import { GA4_ID } from "@/lib/consent";

// Consent Mode v2 "advanced" — SERVER-renderēti skripti, lai gtag.js (GA4) būtu
// klāt jau sākotnējā HTML (pirms piekrišanas), nevis injektēts ar JS pēc hidratācijas.
// Inline skripts iestata noklusējumus (visu denied + wait_for_update + url_passthrough)
// un konfigurē GA4, pirms gtag.js ielādējas. Guard karodziņi (__anabellaConsentInit,
// __anabellaGa4Loaded) neļauj lib/consent.ts to dublēt. GTM/Clarity/Pixel paliek
// aiz piekrišanas (skat. applyConsent). Renderēts publiskajā layout'ā pirms
// <CookieConsent /> — NAV /admin lapās.
export default function GtagScripts() {
  // Analītiku ielādē TIKAI produkcijā — preview/dev deploy'i nepiesārņo GA4/Ads datus.
  if (process.env.NEXT_PUBLIC_VERCEL_ENV !== "production") return null;
  return (
    <>
      <script
        id="ga-consent-default"
        // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
        dangerouslySetInnerHTML={{
          __html:
            "window.dataLayer=window.dataLayer||[];" +
            "function gtag(){dataLayer.push(arguments);}" +
            "window.gtag=window.gtag||gtag;" +
            "gtag('consent','default',{" +
            "ad_storage:'denied',analytics_storage:'denied'," +
            "ad_user_data:'denied',ad_personalization:'denied'," +
            "wait_for_update:500});" +
            "gtag('set','url_passthrough',true);" +
            "gtag('js',new Date());" +
            `gtag('config','${GA4_ID}');` +
            "window.__anabellaConsentInit=true;window.__anabellaGa4Loaded=true;",
        }}
      />
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
      />
    </>
  );
}
