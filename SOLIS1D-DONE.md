# SOLIS1D — PABEIGTS ✅ (kategoriju kartīšu fona attēli)

**Datums:** 2026-08-06
**Mērķis:** Sākumlapas kategoriju kartītēm tematiski fona attēli — izpludināti (bez CSS blur), tumšināti, ar saglabātu teksta lasāmību.

**Izvēle:** Variants A — izbūvēts mehānisms tagad; degradē uz pašreizējo tīro navy, kamēr nav foto. Kad ieliec foto → kartītes iegūst fonu bez koda izmaiņām.

---

## Kas izbūvēts

### Mehānisms (graceful degradation)
- `lib/categories.ts` — `CategoryMeta` tips paplašināts ar `bgImage` lauku; visām 6 kategorijām norādīts paredzētais ceļš (`/images/categories/<slug>.jpg`).
- `components/category-card.tsx` — servera komponents pārbauda ar `fs.existsSync` (būvēšanas laikā), vai fails **reāli eksistē** `public/`. Ja **jā** → renderē fonu; ja **nē** → kartīte paliek ar tīru navy (kā tagad). Try/catch drošs.
- **Pārbaudīts:** ceļš atrisinās pareizi (`public/images/categories/foto-kastes.jpg`); bez foto → `false` → nav bojātu attēlu, izskats nemainās.

### Attēla renderēšana (kad fails ir)
- `next/image` ar `fill`, `sizes="(max-width: 768px) 100vw, 33vw"`, `quality={55}`, `loading="lazy"`, tukšs `alt=""` + `aria-hidden` (dekoratīvs, ekrānlasītājs neizrunā). **NAV** `filter: blur()`, **NAV** CSS `background-image` — tieši kā spec prasa.
- **Divi tumšināšanas slāņi:** vienmērīgs `bg-bg/75` + gradients no apakšas (`from-bg via-bg/85 to-bg/50`), lai teksts vienmēr lasās.
- **Hover:** attēls `scale-105`, tumšinājums atkāpjas uz `bg-bg/65`, pāreja 500ms. Kartīte klikšķināma visā laukumā (`<Link>` ap visu).

### Sagatavots Robertam
- `public/images/categories/README.md` — tabula ar 6 failu nosaukumiem, saturu, prasībām (800×600, JPEG q60, <40 KB, no saviem pasākumiem, ne stock).

---

## Pieņemšanas kritēriji
- [x] Bez CSS blur (>4px) — lieto mazu attēlu, izstieptu
- [x] Divi tumšināšanas slāņi (vienmērīgs + gradients)
- [x] Hover: scale-105 + tumšinājums atkāpjas, 500ms
- [x] Attēli ar tukšu `alt` + `aria-hidden`
- [x] Kartīte klikšķināma visā laukumā
- [x] Bez attēla kartīte izskatās normāli (tīrs navy), ne salauzta
- [x] `npm run build` tīrs
- [ ] **Gaida Robertu:** 6 reāli foto → `public/images/categories/` (tad kartītes atdzīvojas)
- [ ] Kontrasts 4.5:1 un Lighthouse >90 — jāpārbauda **ar reāliem attēliem** pēc to ievietošanas

---

## Piezīmes
- `CategoryCard` lieto arī `/svinibu-inventars` habs — tur tas pats mehānisms strādā (4 apakškategorijas).
- Kad foto ievietoti: `git push` → Vercel pārbūvē → fs-pārbaude tos atrod → fons parādās. ISR neietekmē (statiska prerender būvēšanas laikā).
