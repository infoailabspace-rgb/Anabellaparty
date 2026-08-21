// Vienots Anabella zīmola e-pasta ietvars — viens patiesības avots visiem
// e-pastiem (rezervācijas, B2B pieprasījumi, kontaktforma). Navy galvene ar logo
// + zelta akcents + balta karte, max-width 600px, TIKAI inline stili (e-pasta
// klienti nelasa <style>/klases), mobilajam draudzīgs. <meta charset="utf-8">
// iekļauts — LV diakritika (āčēģīķļņšūž) un kirilica renderējas pareizi.

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.anabellaparty.lv";
export const EMAIL_NAVY = "#1A3A4A";
export const EMAIL_GOLD = "#D4A960";
export const EMAIL_GOLD_DARK = "#B0842E"; // saitēm uz balta fona (kontrasts)

// HTML escaping — lietotāja ievade nedrīkst injicēt HTML.
export function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const DEFAULT_FOOTER = `<p style="font-size:12px;color:#777;margin:24px 0 0;line-height:1.6;">
  Anabella Party — SIA „AR DIMANTI", PVN maksātājs. Strādājam ar līgumu un rēķinu.<br>
  Jautājumi? Atbildi uz šo e-pastu vai zvani
  <a href="tel:+37129222761" style="color:${EMAIL_GOLD_DARK};text-decoration:none;">+371 29222761</a> ·
  <a href="mailto:info@anabellaparty.lv" style="color:${EMAIL_GOLD_DARK};text-decoration:none;">info@anabellaparty.lv</a>
</p>`;

/**
 * Ietin saturu zīmola ietvarā. `footer` — noklusējuma kontaktu kājene; padod ""
 * lai to noņemtu (piem. iekšējiem admin e-pastiem). `preheader` — īss teksts,
 * ko rāda iesūtnes priekšskatījumā (slēpts pašā e-pastā).
 */
export function emailShell(
  inner: string,
  opts: { footer?: string; preheader?: string } = {},
): string {
  const preheader = opts.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(
        opts.preheader,
      )}</div>`
    : "";
  const footer = opts.footer === undefined ? DEFAULT_FOOTER : opts.footer;
  return `<meta charset="utf-8">${preheader}
  <div style="font-family:Arial,Helvetica,sans-serif;background:#F5F5F0;padding:16px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e6e1d6;border-radius:12px;overflow:hidden;">
      <div style="background:${EMAIL_NAVY};padding:24px;text-align:center;">
        <img src="${SITE_URL}/logo/logo-full.png" width="170" alt="Anabella Party" style="max-width:170px;height:auto;" />
      </div>
      <div style="height:4px;background:${EMAIL_GOLD};"></div>
      <div style="padding:24px;color:${EMAIL_NAVY};font-size:15px;line-height:1.6;">
        ${inner}
        ${footer}
      </div>
    </div>
  </div>`;
}

/** Zelta CTA poga (centrēta). */
export function ctaButton(href: string, text: string): string {
  return `<div style="margin:22px 0;text-align:center;">
    <a href="${href}" style="display:inline-block;background:${EMAIL_GOLD};color:#000000;padding:13px 30px;border-radius:9999px;text-decoration:none;font-weight:bold;">${esc(
      text,
    )}</a>
  </div>`;
}

/** Zelta-apmales datu karte ar label:value rindām (sk. infoRow). */
export function infoCard(title: string, rowsHtml: string): string {
  return `<div style="margin:20px 0;border:2px solid ${EMAIL_GOLD};border-radius:8px;padding:16px;background:#faf6ec;">
    ${
      title
        ? `<p style="margin:0 0 10px;font-weight:bold;color:${EMAIL_NAVY};">${esc(
            title,
          )}</p>`
        : ""
    }
    <table style="width:100%;border-collapse:collapse;font-size:14px;">${rowsHtml}</table>
  </div>`;
}

/** Viena datu rinda kartei. `value` drīkst saturēt jau-escapotu HTML (saites). */
export function infoRow(label: string, value: string): string {
  return `<tr><td style="padding:4px 0;color:#555;white-space:nowrap;vertical-align:top;">${esc(
    label,
  )}:</td><td style="padding:4px 0 4px 12px;color:${EMAIL_NAVY};word-break:break-word;">${value}</td></tr>`;
}
