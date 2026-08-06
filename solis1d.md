# SOLIS1D — Kategoriju kartīšu fona attēli

**Mērķis:** Sākumlapas kategoriju kartītēm tematiski fona attēli — izpludināti, tumšināti, ar saglabātu teksta lasāmību.

**Priekšnosacījumi:** SOLIS1B ✅, SOLIS1C ✅.

---

## 1. PIEEJA — nelieto CSS blur

Acīmredzamais risinājums ir `filter: blur(12px)` uz attēla. **Nedari to.** Seši izpludināti attēli vienā ekrānā ir GPU slodze, kas mobilajā rada ritināšanas raustīšanos, un `filter` uz `<img>` nozīmē, ka pārlūks renderē pilnu attēlu un tad to izmet.

**Pareizais risinājums:** mazs attēls, izstiepts pāri kartītei. 400px plats attēls uz 480px kartītes ir dabiski mīksts — bez `filter`, bez GPU slodzes, un fails ir 20 KB, ne 300 KB.

```tsx
<Image
  src={category.bgImage}
  alt=""                      // dekoratīvs — tukšs alt
  fill
  sizes="(max-width: 768px) 100vw, 33vw"
  quality={55}                // zema kvalitāte ir OK — tas tāpat ir izpludināts
  className="object-cover"
  aria-hidden="true"
/>
```

Ja pēc tam vēl vajag mīkstāku — `blur-sm` (4px), ne vairāk. Neko lielāku.

---

## 2. TUMŠINĀŠANA

Divi slāņi virs attēla:

```tsx
{/* 1. Vienmērīgs tumšinājums */}
<div className="absolute inset-0 bg-bg/75" />

{/* 2. Gradients no apakšas — tur, kur teksts */}
<div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/85 to-bg/50" />
```

**Kāpēc divi:** vienmērīgs tumšinājums viens pats nozīmē, ka teksts pār gaišu attēla daļu joprojām nelasās. Gradients nodrošina, ka apakšējā daļa, kur ir virsraksts un apraksts, vienmēr ir tumša neatkarīgi no attēla.

**Kontrasta prasība:** teksts pret fonu vismaz 4.5:1. Pārbaudi ar reāliem attēliem, ne ar pieņēmumu. Ja kāds attēls ir pārāk gaišs — nomaini attēlu, nevis padari tekstu treknāku.

Hover: tumšinājums nedaudz atkāpjas (`bg-bg/65`), attēls `scale-105`, pāreja 500ms. Attēls kļūst redzamāks, kartīte atdzīvojas.

---

## 3. ATTĒLI PA KATEGORIJĀM

```
/public/images/categories/
  foto-kastes.jpg
  atrakcijas.jpg
  audio-video.jpg
  specefekti.jpg
  deco.jpg
  kubli.jpg
```

Katrs 800×600, JPEG kvalitāte 60, mērķis zem 40 KB.

**Kas katrā:**

| Kategorija | Attēls |
|---|---|
| Foto kastes | Spoguļa kaste ar zeltainu apgaismojumu, cilvēku silueti fonā |
| Piepūšamās atrakcijas | Baltā pils zālienā, vakara gaisma |
| Audio/video viesu grāmatas | Retro telefons tuvplānā, silts apgaismojums |
| Specefekti | Aukstās dzirksteles tumsā — vienīgais, kur attēls drīkst būt kontrastains |
| Deco / mēbeles | Šampanieša siena ar glāzēm, LED uzraksts |
| Kubli / pirts | Kubls vakarā ar tvaiku, siltas gaismas |

**Ņem no saviem pasākumiem, ne no stock.** Tavi foto ir zīmola īpašums un izskatās autentiski. Stock attēli premium segmentā ir uzreiz pamanāmi.

Ja kāda kategorijas attēla nav — tā kartīte paliek bez fona, ar tīru navy. Nejauc stock ar saviem — nekonsekvence izskatās sliktāk nekā tukšums.

---

## 4. VEIKTSPĒJA

Sešas kartītes ir virs ekrāna locījuma vai tuvu tam — tie ir seši attēli LCP ceļā.

- `priority` **tikai** hero video posterim, ne kartītēm
- Kartītēm `loading="lazy"` — tās ir zem hero
- `quality={55}` — izpludinātam fonam vairāk nevajag
- Pārbaudi Lighthouse **pēc** izmaiņām. Ja Performance nokrīt zem 90, samazini attēlu izmēru uz 600×450

---

## 5. STRUKTŪRA

```tsx
<article className="relative isolate overflow-hidden rounded-2xl border border-gold/20 h-[280px] group">
  {/* fons */}
  <Image ... className="object-cover transition-transform duration-500 group-hover:scale-105" />
  <div className="absolute inset-0 bg-bg/75 transition-colors group-hover:bg-bg/65" />
  <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/85 to-bg/50" />

  {/* saturs */}
  <div className="relative z-10 flex h-full flex-col justify-end p-6">
    <Icon />
    <h3>...</h3>
    <p>...</p>
    <span>Apskatīt →</span>
  </div>
</article>
```

`isolate` un `z-10` ir obligāti — bez tiem saturs pazūd zem slāņiem.

Visa kartīte ir klikšķināma (`<Link>` ap `<article>` vai `absolute inset-0` saite pār kartīti), ne tikai "Apskatīt" teksts.

---

## 6. PĀRBAUDE

- [ ] Teksts lasāms uz visiem sešiem attēliem
- [ ] Kontrasts vismaz 4.5:1
- [ ] Hover pāreja gluda, bez raustīšanās
- [ ] Mobilajā ritināšana nerausās
- [ ] Lighthouse Performance joprojām > 90
- [ ] Attēli ar tukšu `alt` un `aria-hidden` — ekrānlasītājs tos neizrunā
- [ ] Kartīte klikšķināma visā laukumā
- [ ] Bez attēla kartīte izskatās normāli, ne salauzta

---

## KO NEDARĪT

- Nelieto `filter: blur()` virs 4px
- Neliec attēlus kā CSS `background-image` — `next/image` optimizē, CSS ne
- Nejauc stock attēlus ar saviem
- Nepadari tekstu treknāku, lai kompensētu sliktu kontrastu — nomaini attēlu
