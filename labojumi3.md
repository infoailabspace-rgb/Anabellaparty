# LABOJUMI 3 — Navbar izkārtojums un netulkotie teksti

---

## 1. NAVBAR — izkārtojums salūzis

### Ko redzu attēlos

- Linki laužas divās rindās: "Foto kastes", "Svinību inventārs", "Mūsu draugi", "Party inventory", "Book now"
- Zelta rāmīši par tuvu logo — "Sākums" gandrīz pieskaras
- Atstarpes starp elementiem nevienādas
- Nolaižamā izvēlne caurspīdīga — hero teksts spīd cauri
- EN versijā elementi vēl platāki (Photo booths, Party inventory, Our friends, Book now) → laušanās ir sliktāka

### Labojumi

**Nekas nedrīkst laužas divās rindās.**

```
whitespace-nowrap    // katram nav linkam un pogai
```

**Atstarpes:**

| Vieta | Vērtība |
|---|---|
| Logo → pirmais links | `ml-10` (min 40px) |
| Starp linkiem | `gap-1` (rāmītim jau ir `px-4`, tāpēc vizuāli sanāk ~32px) |
| Pēdējais links → "Rezervēt" | `ml-6` |
| "Rezervēt" → valodu pārslēgs | `ml-6`, ar vertikālu atdalītāju `border-l border-gold/20 pl-6` |
| Valodas → sociālās ikonas | `ml-4`, tāpat ar atdalītāju |

**Rāmīši:** `px-4 py-2` visiem vienādi, `text-sm`. Miera stāvoklī `border-transparent`, hover `border-gold`.

**Vertikālā centrēšana:** navbar `flex items-center h-24`. Visi elementi vienā baseline.

### Kad nesatilpst

EN versijā ar visiem elementiem 1440px ekrānā var pietrūkt vietas. Trīs pakāpes:

| Platums | Rīcība |
|---|---|
| ≥1280px | Viss redzams |
| 1024–1279px | Sociālās ikonas paslēptas (tās ir footerī), `text-sm` → `text-[13px]`, atstarpes mazākas |
| <1024px | Hamburger izvēlne |

**Nemazini fontu zem 13px** un **nesaīsini tekstus** ("Sv. inventārs" izskatās pēc kļūdas). Ja nesatilpst — ej uz hamburger agrāk.

### Nolaižamā izvēlne

Caurspīdīga — teksts aiz tās spīd cauri. Labo:

```
bg-navy           // pilnīgi necaurspīdīgs, ne bg-navy/90
border border-gold/25
rounded-xl
shadow-2xl shadow-black/50
backdrop-blur-none
z-50              // virs hero satura
```

Vienumiem `px-5 py-2.5`, hover — zelta fons ar melnu tekstu vai zeltains teksts. Atveras ar fade + slide 4px lejup, 180ms.

Aizveras: klikšķis ārpusē, Esc, vai kad pele pamet gan pogu, gan izvēlni (ar ~150ms aizturi, lai neaizvērtos, pārvietojot peli no pogas uz izvēlni).

---

## 2. NETULKOTIE TEKSTI

Kategoriju kartītes un dažas pogas rāda latviski `/en` un `/ru` versijās.

### Kas konkrēti

| Vieta | Attēlā | Problēma |
|---|---|---|
| Kategoriju kartītes | 2, 4 | "Foto kastes", "SPOGULIS, OZOLS un INSTAGRAM foto kastes ar tūlītēju druku un asistentu", "Apskatīt →" — visi LV |
| Hero pogas | 3 | "Rezervēt", "Apskatīt inventāru" — LV, kaut virsraksts angliski |

### Kāpēc tas notika

Kategoriju kartītes **nav DB saturs** — tās ir hardkodētas sākumlapā vai `lib/categories.ts`. i18n darbs gāja cauri `messages/` un DB, un šo izlaida.

### Labojums

1. Atrodi kategoriju datu avotu (`lib/categories.ts` vai inline `app/[locale]/page.tsx`)
2. Pārcel nosaukumus un aprakstus uz `messages/lv.json`, `en.json`, `ru.json` zem `home.categories.*`
3. Tāpat "Apskatīt →" un hero pogas
4. **Izej cauri visai sākumlapai** — pārbaudi katru redzamo virkni. Ja tā ir hardkodēta, tā jāpārceļ.

### Pilna pārbaude

Pēc labošanas atver `/en` un `/ru` un **izlasi katru vārdu.** Nemeklē kodā — skaties ekrānā. Katrs latviešu vārds, kas nav īpašvārds, ir kļūda.

Izņēmumi, kas paliek LV apzināti:
- Produktu nosaukumi: SPOGULIS, OZOLS, INSTAGRAM
- Atsauksmes
- Uzņēmumu nosaukumi klientu sadaļā
- Specifikāciju vērtības (`6 × 5 × 5 m`, `200 kg`)

Visu pārējo pārbaudi lapu pa lapai: `/`, `/foto-kaste`, `/piepusamas-atrakcijas`, `/svinibu-inventars` un apakšlapas, `/rezervet`, `/kontakti`, `/faq`, `/musu-draugi`, `/noteikumi`, `/privatuma-politika` — visās trijās valodās.

---

## 3. PĀRBAUDE

- [ ] Neviens navbar elements nelaužas divās rindās nevienā valodā
- [ ] Logo un pirmais links vismaz 40px attālumā
- [ ] Atstarpes vienādas
- [ ] Nolaižamā izvēlne necaurspīdīga, virs hero
- [ ] Izvēlne neaizveras, pārvietojot peli no pogas uz to
- [ ] 1024–1279px: sociālās ikonas paslēptas, viss satilpst
- [ ] <1024px: hamburger
- [ ] `/en` — nulle latviešu vārdu (izņemot īpašvārdus)
- [ ] `/ru` — tas pats
- [ ] Hero pogas tulkotas
- [ ] Kategoriju kartītes tulkotas
- [ ] `npm run build` tīrs
