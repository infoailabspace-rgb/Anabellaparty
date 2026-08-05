# SOLIS3 — PABEIGTS ✅

**Datums:** 2026-08-06
**Mērķis:** `/rezervet` lapa ar tūlītējiem kontaktiem, daudzsoļu anketu, reāllaika cenu, Supabase ierakstu un e-pastiem. Izpildīts.

**Plāna maiņa:** rezervācijas anketa nāk PIRMS čatbota — čatbots pārcelts uz SOLIS5. CLAUDE.md soļu tabula atjaunināta.

---

## Kas izbūvēts

### Lapa `/rezervet`
- Īss hero → **3 lielas kontaktpogas** (Zvanīt / WhatsApp / Rakstīt e-pastu, zelta, inline SVG) → daudzsoļu anketa tajā pašā ritinājumā.

### Anketa — `components/booking/booking-form.tsx` (4 soļi)
- Progresa josla, `AnimatePresence` soļu pārejas, `prefers-reduced-motion` respektēts.
- **1. Inventārs:** kategoriju cilnes, produktu kartītes (pievieno/noņem grozam), tarifa izvēle, papildu stundu skaitītājs, papildinājumu daudzumi; kubliem brīdinājums (Jūrmala, 28286911).
- **2. Pasākums:** datums (min šodien, obligāts), laiks, ilgums, veids (obligāts), viesi, vieta (obligāts), telpās/ārā; piegādes piezīme.
- **3. Kontakti:** vārds, **telefons obligāts + LV validācija/normalizē uz +371…**, e-pasts, uzņēmums, reģ.nr (parādās, ja uzņēmums).
- **4. Apstiprināt:** apraksts, kopsavilkums, piekrišanas checkbox (noteikumi+privātums), submit ar spinneri (bloķē dubultu).
- **`sessionStorage`** progresam (notīra pēc veiksmes), **deep link `?item=<slug>`** ieliek produktu grozā, validācija pirms katras pārejas, sekmes/kļūdas ekrāns.

### Cena — `lib/pricing.ts` + `components/booking/price-panel.tsx`
- Tīra `computeQuote()`: bāzes tarifs + papildu stundas × `hourlyExtra` + papildinājumi × daudzums; `contactOnly` → "vienojoties" (neieskaita); priekšapmaksa **20%**.
- **Dati TIKAI no `lib/products.ts`** — nekur nav hardkodētu cenu.
- Panelis sticky desktopā, rāda rindas, kopsummu, piegādi, priekšapmaksu, atrunu.

### Supabase (projekts `uewpetpyckpuzqywtcmf`, eu-west-3)
- Tabula `public.booking_requests` + RLS: **publiskā forma drīkst tikai `insert`**; `select`/`update` tikai autentificētiem.
- **Svarīga niansē:** insert lieto `return=minimal` (bez `.select()`), jo anon lomai nav SELECT politikas — `INSERT…RETURNING` citādi izgāztos ar RLS kļūdu.
- `lib/supabase.ts` — servera klients (service_role, ja pieejams, citādi anon).

### API — `app/api/booking/route.ts`
- Servera validācija (`lib/booking.ts`), **cena pārrēķināta servera pusē** (klientam neuzticas), telefons normalizēts, ieraksts Supabase.
- 2 e-pasti caur Resend (Robertam ar `reply-to` uz klientu + klientam apstiprinājums), navy/zelta HTML LV. Ja `RESEND_API_KEY` tukšs — izlaiž bez kļūdas (pieteikums tik un tā saglabāts).

### Env
- `.env.local` (lokāli) + **Vercel** (production+preview): `NEXT_PUBLIC_SB_URL`, `NEXT_PUBLIC_SB_ANON_KEY`, `BOOKING_NOTIFY_EMAIL`.
- Vēl jāpievieno: `RESEND_API_KEY` (+ `BOOKING_FROM_EMAIL` ar verificētu domēnu) — kad Roberts iedos.

---

## Pārbaudes
- `npm run build` — **tīrs** (`/api/booking` = ƒ, `/rezervet` statisks).
- API tests (dev): derīgs pieteikums → `ok:true`, pieteikums nonāca Supabase, telefons normalizēts, cena pārrēķināta servera pusē; nederīgs → validācijas kļūdas. Testa rindas iztīrītas.

## Pieņemšanas kritēriji
- [x] Zvanīt/WhatsApp/E-pasts pogas VIRS anketas
- [x] Inventāru var kombinēt no dažādām kategorijām
- [x] Cena pārrēķinās reāllaikā
- [x] Telefons obligāts, LV validācija
- [x] Datums obligāts, pagātne bloķēta
- [x] Pasākuma apraksts
- [x] `lib/pricing.ts`, dati no `lib/products.ts` — nav hardkodētu cenu
- [x] Servera puse pārrēķina cenu
- [x] Pieteikums Supabase (+ 2 e-pasti, kad Resend konfigurēts)
- [x] `sessionStorage` saglabā progresu
- [x] Deep link no produkta strādā
- [x] Build tīrs
- [x] Jaunas pakotnes tikai `@supabase/supabase-js`, `resend`

---

## ⚠️ `[JĀAPSTIPRINA]` — Robertam
1. **Priekšapmaksa 20%** — pareizi? (šobrīd 20%)
2. **Resend:** API atslēga + verificēts domēns; uz kuru adresi sūtīt paziņojumus (šobrīd info@anabellaparty.lv). Kamēr nav — pieteikumi nonāk Supabase, bet e-pasti netiek sūtīti.
3. **"Pierīga"** definīcija bezmaksas piegādei (novadi vai km) — šobrīd tikai informē.
4. **Kubli** caur anketu (ar brīdinājumu) vai tikai zvans uz 28286911? (šobrīd caur anketu ar brīdinājumu)
5. **Telegram** paziņojums — vajag? (šobrīd nē)

## Tālāk
- SOLIS4: Multilingua + SEO (Stripe netiek izmantots — depozīts ar pārskaitījumu).
- SOLIS5: AI čatbots.

---

## PAPILDINĀJUMS — piegādes aprēķins + avanss 50%

- **Avanss = 50%** no kopsummas (inventārs + piegāde) — apstiprināts, atrisina JĀAPSTIPRINA #1. `lib/pricing.ts` `computeDeposit()`.
- **Automātisks piegādes aprēķins:** anketas 2. solī lauks "Piegādes adrese"; pēc `blur` `/api/distance` aprēķina attālumu no **Vecozolu iela 14, Ķekava** un cenu.
  - **OpenRouteService** (ģeokodēšana + braukšanas maršruts), atslēga `ORS_API_KEY` (`.env.local` + Vercel). Nomināli 1000 pieprasījumi/dienā.
  - Likums: **bezmaksas ≤ 25 km** (Pierīga), tālāk **pilns attālums × €0.50** (viens virziens). `FREE_RADIUS_KM` konfigurējams. `lib/delivery.ts`.
  - Fallback: ja adrese neatrodas — "Piegādes cenu norādīsim manuāli" (nebloķē pieteikumu).
- Cenu panelis rāda inventāru + piegādi + kopsummu + avansu 50%.
- Supabase: pievienotas kolonnas `delivery_address`, `delivery_distance_km`, `delivery_cost`.
- Pārbaudīts (dev): Talsi 135 km → 68 €; tuvā adrese ≤25 km → bez maksas; pilns pieteikums inventārs 260 + piegāde 68 = 328 → avanss 164 (50%).

**Env kopsavilkums (Vercel + `.env.local`):** `NEXT_PUBLIC_SB_URL`, `NEXT_PUBLIC_SB_ANON_KEY`, `BOOKING_NOTIFY_EMAIL`, `ORS_API_KEY`. Vēl jāpievieno: `RESEND_API_KEY` (+ `BOOKING_FROM_EMAIL`).
