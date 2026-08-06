# SOLIS4B — PABEIGTS ✅

**Datums:** 2026-08-06
**Mērķis:** Anabella logo visur, kur bija teksts "Anabella Party".

---

## Logo faili

Roberts iedeva **pilno logo** (navy plāksne ar zelta rāmi, "Anabella" wordmark, "SVĒTKU INVENTĀRS" apakšraksts, disko bumba), 500×500 PNG.

**SVARĪGI:** logo tiek lietots **100% identisks failam — bez izgriešanas, krāsu vai proporciju izmaiņām**, tikai mērogots.

- `public/logo/logo-full.png` — pilnais logo, lietots VISUR.
- `app/icon.png` + `app/apple-icon.png` — pilnā logo eksakta kopija (favicon).

---

## Kur ievietots (visur pilnais logo)

- **Navbar** — `logo-full.png` (`next/image`, `h-12` mobil / `h-14` desktop, `w-auto`, `priority`, hover `opacity-90`, `aria-label`). Teksts "Anabella Party" aizvietots.
- **Footer** — `logo-full.png` (`h-24`).
- **404 lapa** — `logo-full.png` (`h-24`, centrēts).
- **Favicon** — `app/icon.png` + `app/apple-icon.png` (pilnais logo). Noklusējuma `favicon.ico` izdzēsts.
- **E-pasta galvene** — pilnais logo 200px, absolūts URL (`NEXT_PUBLIC_SITE_URL`).

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
