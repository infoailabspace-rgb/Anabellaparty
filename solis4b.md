# SOLIS4B — Logo integrācija

**Mērķis:** Anabella logo visur, kur šobrīd ir teksts "Anabella Party".

**Priekšnosacījumi:** SOLIS4 ✅ (vai palaid uzreiz pēc SOLIS1C, ja SOLIS4 vēl nav).

---

## 1. FAILI

Roberts iedod:

```
/public/logo/logo-full.png       ← pilnais zīmols ar rāmi (kvadrātisks)
/public/logo/logo-full.svg       ← ja ir vektors, tas ir labāks
```

Ja SVG nav — PNG ar caurspīdīgu fonu, vismaz 1000×1000 px.

**Krāsas logo apstiprina paleti:** tumši zils fons `#0E3450`–`#1A3A4A`, zelts `#E5B87A`–`#D4A960`. Tas, kas jau ir `CLAUDE.md`, ir pareizi.

---

## 2. KUR LOGO JĀBŪT

| Vieta | Versija | Izmērs |
|---|---|---|
| **Navbar** | Logo + wordmark | augstums 44px desktopā, 36px mobilajā |
| **Footer** | Pilnais logo | augstums 72px |
| **Favicon** | Tikai disko bumba | 32×32, 16×16, 180×180 (apple-touch) |
| **OG attēli** | Pilnais logo stūrī | ~120px |
| **404 lapa** | Pilnais logo | augstums 96px |
| **E-pastu galvene** | Pilnais logo | platums 200px |

---

## 3. NAVBAR — SVARĪGĀKAIS

Šobrīd tur ir teksts. Aizvieto ar logo.

**Problēma:** pilnais logo ar dekoratīvo rāmi 44px augstumā kļūst par neatpazīstamu plankumu. Rāmja detaļas un "SVĒTKU INVENTĀRS" apakšraksts pazūd.

**Risinājums** — divas versijas:

```
logo-full.svg     Pilnais ar rāmi     → footer, 404, e-pasti, OG
logo-mark.svg     Tikai "Anabella" + disko bumba, bez rāmja  → navbar
```

`logo-mark` izgriež no pilnā: wordmark "Anabella" + disko bumba pa labi augšā. Bez rāmja, bez fona, bez apakšraksta. Uz tumša navbar fona zelta elementi lasās tīri.

`[JĀAPSTIPRINA: vai Robertam ir atsevišķs logo bez rāmja, vai jāizgriež]`

**Realizācija:**

```tsx
<Link href="/" aria-label="Anabella Party — sākums">
  <Image
    src="/logo/logo-mark.svg"
    alt="Anabella Svētku inventārs"
    width={180}
    height={44}
    priority
    className="h-11 w-auto md:h-11"
  />
</Link>
```

- `priority` — logo ir LCP kandidāts navbar
- Fiksēts augstums, `w-auto` — nekādu izstiepšanu
- Hover: `opacity-90`, bez mērogošanas (logo, kas lec, izskatās lēti)
- Mobilajā `h-9`

**Teksta "Anabella Party" navbar vairs nav.** Logo to aizvieto pilnībā. `alt` teksts nodrošina piekļūstamību un SEO.

---

## 4. FAVICON

Izgriež tikai disko bumbu no logo — tā ir vienīgā daļa, kas atpazīstama 16×16.

```
app/icon.png            180×180
app/apple-icon.png      180×180
app/favicon.ico         32×32 + 16×16
```

Next.js App Router šos paņem automātiski no `app/` mapes — nav jāreģistrē `layout.tsx`.

Fons: navy `#0E3450`, ne caurspīdīgs. Caurspīdīgs favicon uz tumšas pārlūka cilnes pazūd.

---

## 5. OG ATTĒLI

`next/og` ģeneratorā (SOLIS4, B5) pievieno logo apakšējā kreisajā stūrī. Logo jāielādē kā base64 vai no absolūta URL — `ImageResponse` nelasa relatīvos ceļus.

---

## 6. E-PASTI

Rezervācijas apstiprinājuma e-pastā (SOLIS3) galvenē pilnais logo, 200px plats, centrēts, uz navy fona.

E-pastos SVG nestrādā — vajag PNG ar absolūtu URL: `https://www.anabellaparty.lv/logo/logo-full.png`.

---

## 7. PĀRBAUDE

- [ ] Navbar logo lasāms 44px augstumā, disko bumba saskatāma
- [ ] Mobilajā (375px) logo neaizņem vairāk par pusi navbar platuma
- [ ] Logo ir saite uz sākumlapu ar `aria-label`
- [ ] Favicon redzams pārlūka cilnē uz tumša un gaiša fona
- [ ] Apple touch icon strādā (pievieno lapu sākuma ekrānam iPhone)
- [ ] Footer logo nav izstiepts
- [ ] OG attēlā logo redzams
- [ ] E-pastā logo ielādējas (absolūts URL)
- [ ] `npm run build` tīrs

```bash
git add .
git commit -m "SOLIS4B: logo integrācija"
git push
```

---

## KO NEDARĪT

- Nemaini logo krāsas, proporcijas vai neliec ēnas
- Neliec pilno logo ar rāmi navbar — tas kļūst par plankumu
- Nelieto CSS `filter`, lai logo padarītu gaišāku vai tumšāku
- Neliec logo uz zelta CTA sekcijas — zelts uz zelta nelasās
