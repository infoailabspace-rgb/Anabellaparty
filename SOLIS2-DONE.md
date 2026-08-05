# SOLIS2 — PABEIGTS ✅

**Datums:** 2026-08-05
**Mērķis:** Nulle 404 visā lapā + GDPR pamati pirms datu vākšanas — izpildīts.

---

## Kas izbūvēts

### BUJ (`/faq`)
- `lib/faq.ts` — 16 reāli jautājumi 4 kategorijās (rezervācija, piegāde, produkti, maksājumi).
- `components/faq-accordion.tsx` — accordion (`'use client'`, `useState`, **bez bibliotēkas**) + kategoriju filtrs. CTA uz kontaktiem.

### Juridiskās lapas
- `/noteikumi` — nomas noteikumi, 10 sadaļas.
- `/privatuma-politika` — GDPR, 10 sadaļas (t.sk. atsevišķa Fotogrāfijas sadaļa, datu saņēmēji, DVI sūdzības).
- `/sikdatnu-politika` — sīkdatņu tabula (consent, GTM, GA4, FB Pixel, Vercel Analytics) + kā atteikties.
- `components/prose.tsx` — konsekventa tipogrāfija teksta lapām.

### Sīkdatņu piekrišana (GDPR gating)
- `components/cookie-consent.tsx` (`'use client'`) — banneris apakšā pirmajā apmeklējumā; **Pieņemt visas / Tikai nepieciešamās / Iestatījumi** (3 slēdži). Izvēle → `localStorage` (`anabella-cookie-consent`) ar timestamp.
- `lib/consent.ts` — Google Consent Mode v2 noklusējumi `denied`; **GTM (`GTM-WDQZZ5PG`) injektējas TIKAI ar analītikas piekrišanu, FB Pixel (`896953122077848`) TIKAI ar mārketinga piekrišanu**. Bez piekrišanas skripti neparādās (pārbaudīts: sākotnējā HTML nav ne `googletagmanager`, ne `connect.facebook.net`).
- Pievienots `app/layout.tsx`.

### Mūsu draugi (`/musu-draugi`)
- `lib/partners.ts` + lapa. 3 placeholderi ar `[JĀAPSTIPRINA]` (reālo partneru vēl nav).

### 404 lapa
- `app/not-found.tsx` — zīmola stilā, links uz sākumu + populārākajām lapām (atgriež HTTP 404).

### Footer
- Pievienoti linki: BUJ, Mūsu draugi, Sīkdatņu politika (+ esošie noteikumi/privātums). Social linki ar `rel="noopener"`.

---

## Pārbaudes (lokāli)

- `npm run build` — **tīrs**, 12 maršruti + `_not-found` statiski prerenderēti.
- `npm run dev` — visi navbar/footer linki **HTTP 200**, nulle 404. Neeksistējoša lapa → zīmola 404 (statuss 404). Banneris renderējas. GTM/Pixel **nav** HTML pirms piekrišanas.

---

## ⚠️ `[JĀAPSTIPRINA]` — Robertam jāaizpilda pirms publiskošanas

Juridiskie teksti ir **sagataves, ne juridisks atzinums**. Pirms live jāpārskata, īpaši atbildības/drošības sadaļas.

### Nomas noteikumi (`/noteikumi`)
1. **Juridiskā forma, reģistrācijas numurs, juridiskā adrese** (1. sadaļa)
2. **Depozīta apmērs** (3. sadaļa; SOLIS4 plāns paredz 20%)
3. **Atlikušās summas apmaksas termiņš** (3. sadaļa)
4. **Konkrēti atcelšanas termiņi un depozīta atgriešanas nosacījumi** (4. sadaļa)
5. **Atbildības apmēra kārtība un iespējamā drošības nauda** (7. sadaļa)
6. **Piepūšamo atrakciju: max lietotāju skaits, vecuma/svara ierobežojumi** (8. sadaļa)

### Privātuma politika (`/privatuma-politika`)
7. **Juridiskais nosaukums un reģistrācijas numurs** (1. sadaļa)
8. **Fotogrāfiju glabāšanas termiņš + vai tās izmanto mārketingā** (5. sadaļa)
9. **Konkrēti datu glabāšanas termiņi** (7. sadaļa)

### BUJ (`/faq`)
10. **Piepūšamo atrakciju apdrošināšanas statuss**
11. **PVN maksātāja statuss un uzņēmuma rekvizīti**

### Mūsu draugi (`/musu-draugi`)
12. **3 reālie partneri** (nosaukums, apraksts, links) — `lib/partners.ts`

---

## Pieņemšanas kritēriji

- [x] Nulle 404 no jebkuras navbar/footer saites
- [x] Sīkdatņu banneris bloķē GTM/Pixel līdz piekrišanai
- [x] Piekrišana saglabājas localStorage
- [x] Visas juridiskās lapas latviski
- [x] `[JĀAPSTIPRINA]` vietas uzskaitītas šeit
- [x] `npm run build` tīrs
- [x] **Nav jaunu npm pakotņu**

---

## Kas nepieciešams SOLIS3

- Supabase pieslēgums (projekts, tabulas) + AI čatbots (Anthropic API).
- Reālu atsauksmju un partneru datu ievietošana, kad Roberts iedod.
