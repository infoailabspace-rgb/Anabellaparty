# SOLIS1 — PABEIGTS ✅

**Datums:** 2026-08-05
**Mērķis:** 4 produktu lapas + koplietojami komponenti, nulle 404 no navbar/footer/home — izpildīts.

---

## Kas izbūvēts

### Datu slānis
- **`lib/products.ts`** — viens patiesības avots. `Product` tips + 5 produkti ar reālām cenām no CLAUDE.md (SPOGULIS €260/2h, INSTAGRAM €220/2h, Piepūšamā pils €230/10h, Dzirksteles €35/24h, Audio grāmata €50/pasākums). Helperi: `getProductsByCategory`, `getFeaturedProducts`. **Cenas nekur nav hardkodētas** — home un visas lapas lasa no šī faila.

### Lapas (katra ar LV `metadata`)
- **`/foto-kaste`** — SPOGULIS + INSTAGRAM
- **`/piepusamas-atrakcijas`** — Piepūšamā pils
- **`/svinibu-inventars`** — Dzirksteles + Audio grāmata
- **`/kontakti`** — `tel:`/`mailto:`/WhatsApp linki, Google Maps iframe (Ķekava), darba laiks, kontaktforma (tikai UI)
- **`/rezervet`** — vienkāršs placeholder (WhatsApp/zvana/e-pasta pogas); pilnā forma nāk SOLIS4

### Koplietojamie komponenti
- `product-card.tsx` — saraksta kartīte (`'use client'`, attēla `onError` fallback)
- `product-detail.tsx` — pilns produkta bloks (galerija + apraksts + specs + "Kas iekļauts" + cena + Rezervēt)
- `image-gallery.tsx` — galvenais attēls + sīktēli, klikšķis maina (`'use client'`)
- `section-hero.tsx` — atkārtojamais lapas hero
- `cta-section.tsx` — koplietojams CTA (home + visas produktu lapas)
- `image-placeholder.tsx` — navy gradients + zelta apmale + nosaukums
- `delivery-note.tsx` — piegādes/cenu skaidrojums (bez maksas Pierīgā, €0.50/km ārpus)
- `contact-form.tsx` — kontaktforma, `onSubmit` → `console.log` (bez sūtīšanas)

### Attēli
- Galerija un kartītes automātiski krīt atpakaļ uz placeholder ar `onError`. Kad Roberts iemet failus `/public/images/products/<slug>-N.jpg`, tie parādīsies **bez koda izmaiņām**.
- `public/images/products/.gitkeep` izveidots.

### Refaktors
- Home page produktu sekcija tagad lieto `ProductCard` + `getFeaturedProducts()` — nekādu dublētu cenu. Home CTA → `CtaSection`.

---

## Pārbaudes (lokāli)

`npm run build` — **tīrs**, 7 maršruti statiski prerenderēti:
```
┌ ○ /
├ ○ /_not-found
├ ○ /foto-kaste
├ ○ /kontakti
├ ○ /piepusamas-atrakcijas
├ ○ /rezervet
└ ○ /svinibu-inventars
```

`npm run dev` smoke tests — visas lapas **HTTP 200**, saturs no `lib/products.ts` renderējas, Ķekavas karte ielādējas, latviešu diakritika pareiza.

---

## Pieņemšanas kritēriji

- [x] 4 jaunas produktu lapas (+kontakti, +rezervet placeholder) dzīvas
- [x] Cenas TIKAI no `lib/products.ts`
- [x] `npm run build` tīrs lokāli
- [x] Attēlu placeholderi strādā, galerija gatava reāliem failiem
- [x] Mobilais izkārtojums (responsīvi grid/flex breakpointi)
- [x] Nav jaunu npm pakotņu

---

## Zināmie 404 (apzināti — SOLIS2)

Footer/navbar joprojām linko uz: `/faq`, `/noteikumi`, `/privatuma-politika` — tie ir SOLIS2.

---

## Kas nepieciešams SOLIS2

- Lapas: `/faq`, `/noteikumi`, `/privatuma-politika`, `/musu-draugi`
- Cookie banneris (GTM `GTM-WDQZZ5PG`, FB Pixel `896953122077848`)
- Pēc tam nulle 404 no visa navbar/footer

## Robertam paralēli
- Reālie produktu foto → `/public/images/products/` kā `<slug>-1.jpg`, `<slug>-2.jpg` (slugi: `spogulis`, `instagram`, `piepusama-pils`, `dzirksteles`, `audio-gramata`)
- 3 reālas atsauksmes (teksts + vārds) home lapai
- Precīzā Google Maps adrese Ķekavā (šobrīd ģenerisks Ķekavas pins)
