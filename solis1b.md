# SOLIS1B — Pilnais produktu katalogs

**Mērķis:** Aizstāt `lib/products.ts` ar pilnu, verificētu katalogu no dzīvās lapas. Papildināt lapu struktūru ar apakšlapām.

**Statuss:** Šis solis LABO SOLIS1. Cenas un produkti tur bija nepilnīgi.

**Pirms sāc:** izlasi `CLAUDE.md`. Parādi plānu. Gaidi apstiprinājumu.

---

## 1. LAPU STRUKTŪRA (labota)

CLAUDE.md struktūra bija nepilnīga. Reālā:

```
/
/foto-kaste/
/foto-kaste/ai-foto/
/piepusamas-atrakcijas/
/svinibu-inventars/                       ← hub lapa
/svinibu-inventars/audio-viesu-gramatas/
/svinibu-inventars/specefekti/
/svinibu-inventars/decomebeles/
/svinibu-inventars/kublsballa/
/rezervet/
/kontakti/
/faq/
/musu-draugi/
/noteikumi/
/privatuma-politika/
```

`/svinibu-inventars/` ir hub — 4 kategoriju kartītes uz apakšlapām, nevis produktu saraksts.

**Kontakti:** e-pasts lapā ir `anabellaparty@inbox.lv` (Facebook) — CLAUDE.md rakstīts `info@anabellaparty.lv`. `[JĀAPSTIPRINA: kurš ir pareizais]`

---

## 2. DATU MODELIS

`lib/products.ts` jāatbalsta cenu varianti (24h/48h/72h), papildinājumi un tehniskās specifikācijas:

```ts
export type PriceTier = {
  duration: string;      // "2h", "10h", "24h", "48h", "72h", "1 diena"
  price: number;
  note?: string;
};

export type AddOn = {
  name: string;
  price: number;
  unit?: string;         // "gb", "1L", "100gr"
};

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: 'foto-kaste' | 'atrakcijas' | 'audio-video' | 'specefekti' | 'deco' | 'kubli';
  tiers: PriceTier[];
  hourlyExtra?: number;      // katra nākamā stunda
  addOns?: AddOn[];
  specs?: { label: string; value: string }[];
  includes?: string[];
  images: string[];
  featured?: boolean;
  contactOnly?: boolean;     // cena tikai vienojoties
  altPhone?: string;         // kubliem cits numurs
};
```

---

## 3. KATALOGS

### 3.1 Foto kastes (`/foto-kaste/`)

Kopīgi visām foto kastēm — **Nomā iekļauts:**
- Neierobežots foto izdruku skaits
- Profesionāls asistents
- Individuāla foto rāmīšu un sākumekrāna dizaina izstrāde
- Aksesuāri jautrākām bildēm

Visām iespējams pievienot AI funkciju (links uz `/foto-kaste/ai-foto/`).

| Produkts | Apraksts | Cena |
|---|---|---|
| **SPOGULIS** | Eleganta, stilīga foto kaste. Augstas kvalitātes attēli, tūlītēja druka, personalizēta pieredze. Kāzām, korporatīviem pasākumiem, ballītēm. | 2h — **260 €**<br>Katra nākamā stunda **+110 €**<br>Uz visu pasākumu — vienojoties<br>Papildus: sarkanais paklājs un stabiņi **40 €** |
| **OZOLS** | Dabisks ozolkoka dizains, gaumīgs stils, viegla lietošana. Kāzām, svinībām, korporatīviem pasākumiem. | 2h — **220 €**<br>Katra nākamā stunda **+100 €**<br>Uz visu pasākumu — vienojoties |
| **INSTAGRAM** | Balta un stilīga. Neviltotas emocijas, skaistas bildes, vienkārša lietošana. | 2h — **220 €**<br>Katra nākamā stunda **+100 €**<br>Uz visu pasākumu — vienojoties |

**FOTO KASTE UZ VISU DIENU — 350 €** (atsevišķs, izcelts bloks)
- Noma bez operatora, 12h
- Piemērojas **tikai** Instagram un Ozols kastēm
- Saņemšana noliktavā ar apmācību, VAI atbraucam, uzstādām, apmācām
- Attālināts tehniskais atbalsts visa pasākuma laikā (telefoniski vai pieslēdzoties iekārtai)
- Komplektā viens foto papīra rullis (līdz 800 izdrukām)
- Katrs nākamais rullis **70 €**

**FOTO KASTE UZ PERIODU** (`contactOnly: true`)
Stacionāra foto kaste iestādēm un pasākumu vietām uz ilgstošu periodu. Piegāde, uzstādīšana, apmācības, konsultācijas nomas periodā. Standarta foto programma, iespējams uzstādīt AI funkcijas.

**MASU PASĀKUMIEM — "Mēs maksājam Jums!"** (`contactOnly: true`)
Foto kastes ar POS termināli. Klients pelna procentus no katras izdrukas.
Varianti:
- Autonoma foto kaste ar POS termināli
- Autonoma foto kaste ar drošu interneta maksājumu
- Foto kaste ar asistentu un nodrošinātu POS mobile

Piemērots: korporatīvie pasākumi un balles, festivāli un pilsētas svētki, skolu izlaidumi un studentu balles, tirdzniecības centru aktivitātes, sporta sacensības un fanu zonas, koncerti.

**FOTO RĀMĪŠU DIZAINI** — sekcija ar attēlu, ne produkts. Klients izvēlas rāmīti, pievieno logo/tekstu.

---

### 3.2 AI Foto (`/foto-kaste/ai-foto/`)

Atsevišķa lapa. AI foto kaste pārvērš viesus par supervaroņiem, kosmosa ceļotājiem, retro gangsteriem, Holivudas zvaigznēm. Pielāgojama pasākuma tematikai.

Tēmas: Gatsby retro, supervaroņi, kosmosa iekarotāji, Harija Potera burvji, elegantas profesijas, senie laiki, klienta paša ideja.

`[JĀAPSTIPRINA: AI funkcijas cena — lapā nav norādīta]`

CTA: zvanīt vai aizpildīt anketu.

---

### 3.3 Piepūšamās atrakcijas (`/piepusamas-atrakcijas/`)

Kopīgi visām:
- Var izmantot gan telpās, gan ārā
- Tīrības garantija — katra atrakcija rūpīgi sagatavota, tīrīta un dezinficēta. Bumbas tīrītas ar speciālu ierīci un dezinficētas pēc katras lietošanas reizes
- Piegādājam un uzstādām
- Iespējams izdekorēt ar baloniem, iepriekš vienojoties

| Produkts | Izmēri (G×P×A) | Vecums | Svars | Cena 10h |
|---|---|---|---|---|
| **MEGA Baltā pils** — lēkāšana + 5m slidkalniņš | 6 × 5 × 5 m | 2+ | līdz 250 kg | **230 €** |
| **Baltā pils XL** — lēkāšana + slidkalniņš + bumbu vanna | 5 × 4 × 4 m | 2+ | līdz 200 kg | **180 €** + bumbas 30 € |
| **Baltie pils torņi** — lēkāšana + slidkalniņš + bumbu vanna | 4,5 × 4,5 × 3 m | 2+ | līdz 200 kg | **170 €** + bumbas 20 € |
| **Baltais pils tornis L** | 4 × 4 × 4 m | 2+ | līdz 200 kg | **150 €** |
| **Mini pilskalniņš** | 2,5 × 2,5 × 2,5 m | 2+ | līdz 200 kg | **100 €** |
| **Baltais pils tornis S** | 2,5 × 2,5 × 2,5 m | 2+ | līdz 200 kg | **100 €** |
| **Baltā bumbu vanna** | 2,5 × 2 × 1 m | 1+ | — | **120 €** (bumbas iekļautas) |
| **Baltais komplekts 1** — Mini pilskalniņš + bumbu vanna | — | 1+ | līdz 200 kg | **160 €** (bumbas iekļautas) |
| **Baltais komplekts 2** — Baltais tornis S + bumbu vanna | — | 1+ | līdz 200 kg | **160 €** |
| **Baltais Mega komplekts** — Baltie pils torņi L + bumbu vanna | — | 1+ | līdz 200 kg | **200 €** (bumbas iekļautas) |

**Baltas bumbas** (papildinājums): 2500–3500 gb. XL atrakcijām **30 €**, L atrakcijām **20 €**.

**Bumbu tīrīšanas ierīce** — informatīva sekcija, ne produkts. Ierīce iesūc bumbu, apmazgā ar ekoloģisku bērniem nekaitīgu līdzekli, izmet tīru un dezinficētu.

---

### 3.4 Audio/video viesu grāmatas (`/svinibu-inventars/audio-viesu-gramatas/`)

Kopīgi: faili no audio/video viesu grāmatām tiek glabāti **30 dienas**. (Svarīgi privātuma politikai.)

| Produkts | 24h | 48h | 72h |
|---|---|---|---|
| **Video viesu grāmata — melns retro video telefons** | **150 €** | **250 €** | **350 €** |
| **Audio viesu grāmata — retro telefons** (tikai kāzām) | **50 €** | **80 €** | **120 €** |
| **Audio viesu grāmata — balts telefons** | **50 €** | **80 €** | **120 €** |
| **Audio viesu grāmata — melns telefons** | **50 €** | **80 €** | **120 €** |
| **Audio viesu grāmata — dzeltens telefons** | **50 €** | **80 €** | **120 €** |
| **Dekoratīva būdiņa** (viesu grāmata nav iekļauta, saderīga ar visām) | **100 €** | **160 €** | — |
| **Dekoratīva siena video telefonam** (LED gaisma, dekorējama) | **50 €** | **80 €** | — |

**Papildinājumi:**
- Info statīvs (rāmītis) — **10 €**
- USB koka kastīte ar personalizētu gravējumu — **20 €**
- Video apsveikumu videomontāža (viens fails ar mūziku, tekstu) — **no 30 €**
- Personalizēts koka USB, 5 GB — **20 € + piegāde** (pārdošana, ne noma)

Video pamācība: `https://www.youtube.com/embed/hIrsgkIkbnY`

---

### 3.5 Specefekti (`/svinibu-inventars/specefekti/`)

Visām ierīcēm nodrošināta instruktāža. Visas ir bērniem drošas.

| Produkts | Apraksts | Cena |
|---|---|---|
| **Auksto dzirksteļu ierīce (salūts)** | Tālvadības pults. Pilna uzpilde — līdz 8 min dzirksteļu. Ugunsdrošs iekštelpās, bērniem drošs. Dzirksteles 1–5 m. Saslēdzamas vienotā sistēmā ar DMX kabeļiem. **Pieejamas 4 ierīces.** | **35 € / 24h** par 1 gb (uzpildīta, gatava)<br>Pulveris 100 g — **10 €**<br>*Salūta laikā veidojas putekļu nogulsnes |
| **Zemās miglas ierīce** | 3000 W. Blīvi, aromātiski dūmi apakšējā slānī minūtes laikā. Līdz 150 m². | **75 € / 24h** (uzpildīta 1h darbam)<br>Šķidrums 1 L — **5 €** |
| **Burbuļu ierīce** | 300 W. Simtiem burbuļu nepārtraukti. Aizpilda 30–40 m². Telpās un ārā. | **40 € / 24h** (uzpildīta 20 min darbam)<br>Šķidrums 1 L — **5 €** |

---

### 3.6 Deco / mēbeles (`/svinibu-inventars/decomebeles/`)

| Produkts | Detaļas | Cena 24h |
|---|---|---|
| **Šampanieša siena (50 glāzes)** | Viegli uzstādāma, stabila. Papildināma ar LED uzrakstu. | **80 €**<br>Glāzes **1 € / gb** |
| **Dekoratīva būdiņa viesu grāmatai** | Viesu grāmata nav iekļauta | **100 €** / 48h **160 €** |
| **Dārza krēsli** | Laikapstākļiem izturīgi. **Pieejami 10 gb.** | **8 € / gb** |
| **Zelta norobežojošie stabiņi + sarkanais paklājs** | Samta virve. Paklājs 2 × 2,40 m | **40 €** |
| **LED uzraksts "Tikko precējušies"** | 1018 × 199 mm | **25 €** |
| **LED uzraksts "Ballīte"** | 500 × 166 mm | **25 €** |
| **LED uzraksts "Svinam dzīvi"** | 787 × 157 mm | **25 €** |

---

### 3.7 Kubli / pirts (`/svinibu-inventars/kublsballa/`)

**⚠️ Atsevišķs tālrunis: 28286911** (ne 29222761). Kubli atrodas **Jūrmalā**, ne Ķekavā. Piegādes cena pēc vienošanās atkarībā no attāluma.

Visiem: svētku dienās cenas pēc vienošanās.

| Produkts | Detaļas | Cena/diena | Drošības nauda |
|---|---|---|---|
| **VIP / LUX kubls** | Līdz 6 cilvēkiem. Nav uz piekabes — novietojams pagalmā uz bruģa vai zālāja. Izmēri 2,20 × 2,20 m. Mūzikas sistēma, ūdens attīrīšanas filtrs, hidromasāža, gaisa burbuļu masāža, ūdens termometrs, krāsu mainošs LED iekšā un ārpusē, salokāms termovāks. | **100 €** | 100 € |
| **Kubls ar 13 m² terasi** | 6–8 cilvēkiem. Saliktā: 2,60 × 4,30 m (+1,5 m dīstele). Atvērtā: 3,50–4,70 × 5,70 m (+1,5 m). Komplektā: uzstādīšana un novākšana, saules/lietus sargs ar LED, galds ar krēsliem, 13 m pagarinātājs, 20 m ūdens šļūtene, 10 m noliešanas šļūtene. Hidromasāža, gaisa burbuļi, krāsu mainošs LED, salokāms termovāks (uzsilst 1,5–2h atkarībā no āra temperatūras). | **80 €** | 100 € |
| **Mobilā pirts** | Malkas krāsns. Iekšpuse dalīta: pirts telpa + atpūtas telpa. Ārpusē maza terase ar krēsliem, trepes, 10 m pagarinātājs, 4 atbalsta kājas. Izmēri: A 3,50 × P 2,50 × G 4,70 m (+1,4 m dīstele). | **90 €** | 100 € |
| **Kubls ar terasi + Pirts** | Komplekts | **150 €** | 200 € |
| **VIP/LUX kubls + Pirts** | Komplekts | **170 €** | 200 € |

---

## 4. KO BŪVĒT

1. **Pārraksti `lib/products.ts`** ar visu iepriekšminēto. Aprakstus paņem burtiski no šī faila — tie ir Roberta paša teksti, ne izdomāti.
2. **Pārraksti `/foto-kaste`** — 3 kastes + "uz visu dienu 350 €" izcelts bloks + "uz periodu" + "masu pasākumiem" + rāmīšu sekcija.
3. **Izveido `/foto-kaste/ai-foto`**.
4. **Pārraksti `/piepusamas-atrakcijas`** — 10 atrakcijas ar izmēriem, vecuma un svara ierobežojumiem.
5. **Pārtaisi `/svinibu-inventars`** par hub lapu — 4 kategoriju kartītes.
6. **Izveido 4 apakšlapas**: audio-viesu-gramatas, specefekti, decomebeles, kublsballa.
7. **Atjauno navbar** — apakšizvēlnes foto kastēm un svinību inventāram (dropdown desktopā, izvērsts saraksts mobilajā).
8. **Atjauno home page** — produktu sekcija lai rāda kategorijas, ne atsevišķus produktus. 40+ produkti sākumlapā nav lasāmi.
9. **Kublu lapā** — telefons 28286911, ne 29222761. Atzīme, ka kubli atrodas Jūrmalā.

---

## 5. CENU ATTĒLOŠANA

Cenu komponente lai tiek galā ar visiem gadījumiem:

- Viens tarifs: "10h — 230 €"
- Vairāki tarifi: 24h / 48h / 72h tabula
- Stundas piemaksa: "2h — 260 € · katra nākamā +110 €"
- Papildinājumi: sīkākā rakstā zem galvenās cenas
- `contactOnly`: "Cena vienojoties" + poga "Sazinies"

Nekur nav norādīts, vai cenas ir ar PVN. `[JĀAPSTIPRINA: PVN]` — vienā vietā (USB) rakstīts "bez PVN", pārējās vietās nekas. Tas jāsakārto vienoti.

---

## 6. BUILD UN PUSH

```bash
npm run build
npm run dev
```

Pārbaudi: visas 9 produktu lapas, navbar dropdown, mobilais, latviešu burti.

```bash
git add .
git commit -m "SOLIS1B: pilns produktu katalogs no dzīvās lapas"
git push
```

`SOLIS1B-DONE.md` — obligāti `[JĀAPSTIPRINA]` saraksts.

---

## PIEŅEMŠANAS KRITĒRIJI

- [ ] Visi 40+ produkti `lib/products.ts`
- [ ] Cenas sakrīt ar anabellaparty.lv līdz centam
- [ ] Ozols, Instagram = 220 €/2h + 100 €/h (NE 260/110 — tas ir Spogulis)
- [ ] 350 € 12h piedāvājums ir savā izceltā blokā
- [ ] Kublu lapā telefons 28286911
- [ ] Navbar apakšizvēlnes strādā
- [ ] `npm run build` tīrs
- [ ] Nav jaunu npm pakotņu

---

## `[JĀAPSTIPRINA]` — Robertam

1. E-pasts: `info@anabellaparty.lv` vai `anabellaparty@inbox.lv`?
2. AI foto funkcijas cena
3. Vai cenas ar PVN vai bez? (jāsakārto vienoti)
4. Vai kubli/pirts vispār paliek jaunajā lapā? Cits telefons, cita atrašanās vieta — izskatās pēc partnera pakalpojuma, ne pašu inventāra
5. Foto kaste "uz periodu" un "masu pasākumiem" — vai atstājam kā contactOnly, vai ir cenu diapazons

---

## KO NEDARĪT

- Nepievieno npm pakotnes
- Neizdomā cenas, ko nav šajā failā
- Nemaini aprakstu tekstus — tie ir klienta paša formulējumi
- Neveido rezervācijas plūsmu (SOLIS4)
