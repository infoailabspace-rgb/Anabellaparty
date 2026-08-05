# SOLIS1 — Produktu lapas

**Mērķis:** 4 produktu lapas + koplietojami komponenti. Nulle 404 no navbar/footer/home.

**Priekšnosacījumi:** SOLIS0 ✅, Vercel auto-deploy strādā.

**Pirms sāc:** izlasi `CLAUDE.md`. Parādi plānu. Gaidi apstiprinājumu.

---

## 1. Datu slānis

Izveido `lib/products.ts` — viens patiesības avots visām cenām un aprakstiem. Statisks TypeScript, **nekādas DB** (Supabase nāk SOLIS3).

Tipi:

```ts
export type Product = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: { amount: number; unit: string; extra?: string };
  specs: { label: string; value: string }[];
  includes: string[];
  images: string[];        // ceļi uz /public/images/...
  category: 'foto-kaste' | 'atrakcijas' | 'inventars';
};
```

Aizpildi ar reālajiem datiem no `CLAUDE.md` cenu tabulas. Aprakstus raksti latviski, pārdodoši, bez mārketinga tukšvārdības. Attēlu ceļi lai norāda uz `/images/products/<slug>-1.jpg` utt. — faili vēl neeksistē, tas ir OK (skat. 4. punktu).

---

## 2. Lapas

| Ceļš | Saturs |
|---|---|
| `/foto-kaste` | SPOGULIS + INSTAGRAM foto kastes |
| `/piepusamas-atrakcijas` | Piepūšamā pils un citas atrakcijas |
| `/svinibu-inventars` | Specefekti (dzirksteles), audio grāmata, dekori |
| `/kontakti` | Kontaktinfo, karte, kontaktforma (bez sūtīšanas — tikai UI) |

Katras produktu lapas struktūra:

1. **Hero** — sekcijas nosaukums, viena teikuma tagline, video/attēla placeholder
2. **Produktu bloki** — katram produktam: attēlu galerija, apraksts, specifikācijas, "Kas iekļauts", cena, poga "Rezervēt"
3. **Cenu skaidrojums** — piegādes noteikumi (bez maksas Pierīgā, €0.50/km ārpus)
4. **CTA** — "Rezervēt" poga uz `/rezervet`

**Kontaktu lapa** atsevišķi: telefons kā `tel:` links, e-pasts kā `mailto:`, WhatsApp links, Google Maps iframe uz Ķekavu, darba laiks. Kontaktforma — tikai vizuāla, `onSubmit` pagaidām `console.log`. Reālā sūtīšana nāk SOLIS4.

---

## 3. Koplietojamie komponenti

- **`components/product-card.tsx`** — kartīte sarakstam (attēls, nosaukums, cena, poga)
- **`components/product-detail.tsx`** — pilns produkta bloks
- **`components/image-gallery.tsx`** — galvenais attēls + sīktēli, klikšķis maina galveno (`'use client'`)
- **`components/section-hero.tsx`** — atkārtojamais lapas hero
- **`components/cta-section.tsx`** — pārstrādā home page CTA par koplietojamu

Home page produktu sekcija jāpārraksta, lai lieto `product-card.tsx` un `lib/products.ts` — nekādu dublētu cenu.

---

## 4. Attēli

Reālu foto vēl nav. Izveido `components/image-placeholder.tsx`: navy gradients + zelta apmale + produkta nosaukums centrā.

`image-gallery.tsx` lai automātiski krīt atpakaļ uz placeholder, ja attēls neielādējas (`onError`). Tā, kad Roberts iemet reālos failus `/public/images/products/`, tie parādās bez koda izmaiņām.

Izveido `/public/images/products/.gitkeep`.

---

## 5. Metadata

Katrai lapai `export const metadata` ar latvisku title un description. Formāts:

```
title: 'Foto kastes noma | Anabella Party'
description: '...' (150–160 zīmes, ar cenu un Pierīgu)
```

Pilns SEO (schema.org, sitemap, OG attēli) nāk SOLIS5.

---

## 6. Build pārbaude

```bash
npm run build
npm run dev
```

Pārbaudi lokāli:
- Visas 4 lapas atveras
- Navbar linki vairs nedod 404 (izņemot `/rezervet`, `/faq`, `/noteikumi`, `/privatuma-politika` — tie ir SOLIS2)
- Galerijas klikšķi strādā
- Placeholderi renderējas
- Mobilajā izkārtojums nesalūzt
- Latviešu burti pareizi

**Ja build met kļūdu — labo. Nepusho salauztu.**

---

## 7. Push

```bash
git add .
git commit -m "SOLIS1: produktu lapas + kontakti"
git push
```

Vercel deployos automātiski. Pārbaudi dzīvo URL.

---

## 8. Atskaite

Izveido `SOLIS1-DONE.md`. Atjauno `CLAUDE.md` soļu tabulu: SOLIS1 → ✅.

---

## PIEŅEMŠANAS KRITĒRIJI

- [ ] 4 jaunas lapas dzīvas uz Vercel
- [ ] Cenas nāk TIKAI no `lib/products.ts` — nekur nav hardkodētas
- [ ] `npm run build` tīrs lokāli
- [ ] Attēlu placeholderi strādā, galerija gatava reāliem failiem
- [ ] Mobilais izkārtojums OK
- [ ] Nav jaunu npm pakotņu

---

## KO NEDARĪT ŠAJĀ SOLĪ

- Nepievieno nevienu npm pakotni
- Neveido rezervācijas plūsmu (SOLIS4)
- Nesūti e-pastus (SOLIS4)
- Nepieskaries Supabase (SOLIS3)
- Neveido `/faq`, `/noteikumi`, `/privatuma-politika` (SOLIS2)

---

## ROBERTAM PARALĒLI

Kamēr Claude Code strādā, sagatavo:
- Produktu foto → `/public/images/products/` nosaukumos `<slug>-1.jpg`, `<slug>-2.jpg`
- 3 reālas atsauksmes (teksts + vārds)
- Precīzā adrese Google Maps iframe (Ķekava)
