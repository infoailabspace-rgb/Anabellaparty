# SOLIS4B — PABEIGTS ✅

**Datums:** 2026-08-06
**Mērķis:** Anabella logo visur, kur bija teksts "Anabella Party".

---

## Logo faili

Roberts iedeva **pilno logo** (navy plāksne ar zelta rāmi, "Anabella" wordmark, "SVĒTKU INVENTĀRS" apakšraksts, disko bumba), 500×500 PNG ar caurspīdīgumu.

No tā ar `sharp` (jau instalēts) izgriezu:
- `public/logo/logo-full.png` — pilnais logo (footer, 404, e-pasts).
- `public/logo/logo-mark.png` — **Anabella + disko bumba, bez rāmja un apakšraksta** (navbar). Atrisina `[JĀAPSTIPRINA]` — atsevišķa versija izgriezta no pilnā.
- `app/icon.png` + `app/apple-icon.png` — **tikai disko bumba** uz navy fona (favicon).

---

## Kur ievietots

- **Navbar** — `logo-mark.png` (`next/image`, `h-9` mobil / `h-11` desktop, `w-auto`, `priority`, `rounded-md`, hover `opacity-90`, `aria-label`). Teksts "Anabella Party" aizvietots pilnībā.
- **Footer** — `logo-full.png` (`h-24`).
- **404 lapa** — `logo-full.png` (`h-24`, centrēts).
- **Favicon** — `app/icon.png` (256) + `app/apple-icon.png` (180), navy fons (ne caurspīdīgs). Noklusējuma `favicon.ico` izdzēsts, lai Next lieto disko bumbu.
- **E-pasta galvene** (SOLIS3 apstiprinājums) — pilnais logo 200px, centrēts, absolūts URL (`NEXT_PUBLIC_SITE_URL` vai vercel.app).

---

## Pārbaude
- `npm run build` — tīrs (22 maršruti).
- Dev: navbar/footer/404 logo attēli, `/logo/logo-mark.png` un `/icon.png` → HTTP 200, favicon `<link rel="icon">` (302×302 png) + apple-icon klāt.

## Ievēroti solis4b norādījumi
- Navbar NElieto pilno rāmja logo (izgriezts mark) — nekļūst par plankumu.
- Nekādu CSS `filter`, ēnu vai mērogošanas hover; tikai `opacity-90`.
- Logo NAV uz zelta CTA sekcijas.

## `[JĀAPSTIPRINA]` / tālāk
- **OG attēli** ar logo — nāk ar SEO soli (`next/og`), vēl nav.
- Ja Robertam ir **vektora (SVG)** logo — tas būtu asāks nekā PNG; var nomainīt `public/logo/` failus bez koda izmaiņām.
- E-pasta logo URL: kad DNS pārslēgts uz anabellaparty.lv, atjaunināt `NEXT_PUBLIC_SITE_URL`.
