# SOLIS1B — PABEIGTS ✅

**Datums:** 2026-08-05
**Mērķis:** Aizstāt SOLIS1 nepilnīgo katalogu ar pilnu, verificētu katalogu no dzīvās lapas + apakšlapu struktūra. Izpildīts.

---

## Kas izbūvēts

### Datu modelis — `lib/products.ts` (pārrakstīts)
- Jauni tipi: `PriceTier` (24h/48h/72h utt.), `AddOn`, `Product` ar `tiers[]`, `hourlyExtra`, `addOns[]`, `specs[]`, `contactOnly`, `altPhone`.
- 6 kategorijas: `foto-kaste | atrakcijas | audio-video | specefekti | deco | kubli`.
- **~38 produkti**, teksti un cenas ņemti **burtiski no `solis1b.md`** (Roberta formulējumi, nekas nav izdomāts).
- `lib/categories.ts` — kategoriju metadati home/hub/navbar vajadzībām.

### Cenu attēlošana — `components/price-block.tsx`
Apstrādā: vienu tarifu · vairāku tarifu tabulu (24/48/72h) · stundas piemaksu · papildinājumus (sīkā rakstā) · `contactOnly` → “Cena vienojoties” + poga.

### Lapas
- **`/foto-kaste`** (pārrakstīta): SPOGULIS + OZOLS + INSTAGRAM, izceltais **“uz visu dienu 350 €”** bloks, “uz periodu” un “masu pasākumiem” (contactOnly), foto rāmīšu sekcija, AI foto links.
- **`/foto-kaste/ai-foto`** (jauna): tēmas, CTA (cena = JĀAPSTIPRINA).
- **`/piepusamas-atrakcijas`** (pārrakstīta): 10 atrakcijas ar izmēriem/vecumu/svaru, balto bumbu piezīme, bumbu tīrīšanas ierīces info.
- **`/svinibu-inventars`** (hub): 4 kategoriju kartītes.
- **4 apakšlapas**: `audio-viesu-gramatas` (+YouTube embed, papildinājumi, 30 dienu glabāšana), `specefekti`, `decomebeles`, `kublsballa`.

### Navbar (pārrakstīts)
Dropdown apakšizvēlnes: “Foto kastes” (→ Foto kastes, AI foto) un “Svinību inventārs” (→ Viss inventārs, Audio/video, Specefekti, Deco/mēbeles, Kubli/pirts). Desktopā dropdown (hover + focus), mobilajā izvērsts saraksts.

### Home page
Produktu sekcija → **6 kategoriju kartītes** (40+ produkti sākumlapā nav lasāmi). `components/category-card.tsx`.

### Kubli / pirts
Atsevišķs tālrunis **28286911** (ne 29222761) — katras produkta “Zvanīt” poga, augšas atzīme un CTA. Norāde, ka kubli atrodas **Jūrmalā** un svētku dienās cenas pēc vienošanās.

### Sakārtošana
- Dzēsts novecojušais `components/product-card.tsx`.
- `components/product-detail.tsx` pārrakstīts uz jauno modeli (PriceBlock, altPhone).
- **`DeliveryNote` labots** — noņemts SOLIS1 kļūdaini pievienotais “Cenas norādītas ar PVN” (lapā PVN nav norādīts, skat. JĀAPSTIPRINA #3).
- CLAUDE.md URL struktūra atjaunināta uz reālo; atzīme, ka `lib/products.ts` ir vienīgais cenu avots.

---

## Pārbaudes (lokāli)

- `npm run build` — **tīrs**, 17 satura maršruti + `_not-found`.
- `npm run dev` — visas 9 produktu/kataloga lapas HTTP 200. Verificēts: **OZOLS/INSTAGRAM 220 €/2h + 100 €/h** (ne 260/110), SPOGULIS 260/110, 350 € 12h izceltais bloks, kublu tālrunis 28286911 + Jūrmala, audio 30 dienu glabāšana + YouTube embed.

---

## Pieņemšanas kritēriji

- [x] Visi ~38 produkti `lib/products.ts`
- [x] Ozols, Instagram = 220 €/2h + 100 €/h (NE 260/110)
- [x] 350 € 12h piedāvājums savā izceltā blokā
- [x] Kublu lapā telefons 28286911
- [x] Navbar apakšizvēlnes strādā
- [x] `npm run build` tīrs
- [x] **Nav jaunu npm pakotņu**
- [~] Cenas sakrīt ar anabellaparty.lv — sakrīt ar `solis1b.md` (Roberta iesniegtie dati); jāsalīdzina ar dzīvo lapu, ja ir izmaiņas

---

## ⚠️ `[JĀAPSTIPRINA]` — Robertam

1. **E-pasts:** `info@anabellaparty.lv` (CLAUDE.md) vai `anabellaparty@inbox.lv` (Facebook)? Šobrīd lapā `info@anabellaparty.lv`.
2. **AI foto funkcijas cena** — lapā nav norādīta, tāpēc “cena vienojoties”.
3. **PVN** — vai cenas ar PVN vai bez? Jāsakārto vienoti (vienā vietā — USB — rakstīts “bez PVN”). Šobrīd nekur netiek apgalvots.
4. **Kubli/pirts** — vai vispār paliek jaunajā lapā? Cits telefons + cita atrašanās vieta (Jūrmala) izskatās pēc partnera pakalpojuma. Šobrīd iekļauti ar atsevišķu tālruni.
5. **Foto kaste “uz periodu” un “masu pasākumiem”** — atstātas kā `contactOnly`; vai ir cenu diapazons?

---

## Kas nepieciešams tālāk
- Reālie produktu foto → `/public/images/products/<slug>-N.jpg` (slugi sakrīt ar `lib/products.ts`).
- SOLIS3: Supabase + AI čatbots.
