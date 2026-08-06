# LABOJUMI 5 — Atlikušie netulkotie teksti un dropdown kļūda

Turpinājums `labojumi4.md`. Daļa nostrādāja, daļa ne.

---

## 1. `hourlyExtra` — netulkota etiķete

Attēlā: cena `2h — 220 €`, zem tās **"Katra nākamā stunda +100 €"**, bet nākamā rinda jau angliski ("For the whole event — price by arrangement").

**Cēlonis:** `hourlyExtra` ir skaitlis (`hourly_extra: 100`), un etiķete ap to ir hardkodēta cenu komponentē — nevis `tiers[].note`, kas jau tika migrēts. Tāpēc `labojumi4` migrācija to neaizskāra.

**Labojums:** pārcel etiķeti uz `messages/*.json`:

```json
"product": {
  "eachAdditionalHour": "Katra nākamā stunda",
  "securityDeposit": "Drošības nauda",
  "perDay": "dienā",
  "includedInRental": "Nomā iekļauts"
}
```

| LV | EN | RU |
|---|---|---|
| Katra nākamā stunda | Each additional hour | Каждый следующий час |

**Izej cauri visai cenu komponentei** (`price-display`, `product-detail`, `price-panel`) un pārbaudi katru virkni, kas nav no DB. Ja tā ir hardkodēta latviski — uz `messages/`.

---

## 2. Informatīvie bloki starp produktiem

Attēlā: **"Bumbu tīrīšanas ierīce"** ar aprakstu — pilnībā LV angļu versijā.

Tie nav produkti, tāpēc DB migrācija tos neskāra. Tie ir statiski bloki lapās.

**Atrodi visus šādus blokus:**

| Bloks | Lapa |
|---|---|
| Bumbu tīrīšanas ierīce | `/piepusamas-atrakcijas` |
| Foto rāmīšu dizaini | `/foto-kaste` |
| Tīrības garantija | `/piepusamas-atrakcijas` |
| Piegādes piezīmes | produktu lapas |
| Kubli Jūrmalā brīdinājums | `/svinibu-inventars/kublsballa` |
| AI foto tēmu saraksts | `/foto-kaste/ai-foto` |
| Audio grāmatu papildinājumi | `/svinibu-inventars/audio-viesu-gramatas` |

Visi uz `messages/*.json` zem `pages.<lapa>.*`.

**Bumbu tīrīšanas ierīce:**

> **EN:** Ball cleaning device — The device draws in a ball, washes it with an eco-friendly, child-safe solution and releases it clean and disinfected. This is how we ensure every attraction is hygienically safe for each little guest.
>
> **RU:** Устройство для чистки шаров — Устройство втягивает шар, моет его экологичным, безопасным для детей средством и выдаёт чистым и продезинфицированным. Так мы обеспечиваем гигиеническую безопасность каждого аттракциона для каждого маленького гостя.

Pārējiem blokiem tulko pēc tā paša principa.

---

## 3. Dropdown nepazūd

Nolaižamā izvēlne paliek atvērta pēc peles aiziešanas.

**Cēlonis:** `labojumi3` pievienoja `pt-3` tiltu un 150ms aizturi, lai izvēlne neaizvērtos, ejot no pogas uz izvēlni. Aizvēršanas loģika acīmredzot uz to nereaģē — vai nu `onMouseLeave` ir tikai uz pogas, ne uz konteinera, vai taimeris netiek notīrīts.

**Pareizā struktūra:**

```tsx
const [open, setOpen] = useState(false);
const closeTimer = useRef<NodeJS.Timeout | null>(null);

const openMenu = () => {
  if (closeTimer.current) clearTimeout(closeTimer.current);
  setOpen(true);
};

const scheduleClose = () => {
  if (closeTimer.current) clearTimeout(closeTimer.current);
  closeTimer.current = setTimeout(() => setOpen(false), 150);
};

// onMouseEnter/onMouseLeave uz KOPĪGA konteinera, kas ietver
// gan pogu, gan izvēlni — ne atsevišķi uz katra
<div onMouseEnter={openMenu} onMouseLeave={scheduleClose} className="relative">
  <button ...>Svinību inventārs</button>
  {open && <div className="absolute top-full pt-3">...</div>}
</div>
```

Papildus aizvēršana:
- **Esc** taustiņš
- Klikšķis ārpusē (`useEffect` ar `document.addEventListener('mousedown')`)
- **Ceļa maiņa** — `usePathname()` efekts, kas aizver izvēlni. Bez šī izvēlne paliek atvērta pēc navigācijas.
- Otras dropdown izvēlnes atvēršana aizver pirmo

`useEffect` cleanup — `clearTimeout` pie unmount, citādi taimeris nostrādā uz atmontēta komponenta.

Pārbaudi arī skārienekrānā: pirmais pieskāriens atver, otrais navigē. Pieskāriens ārpusē aizver.

---

## 4. Mūsu draugi — placeholderi

Attēlā trīs kartītes ar `[JĀAPSTIPRINA: partneris 1]` un tekstu "Aprakstu precizēs Roberts."

**Tas nedrīkst būt redzams publiskajā lapā.** Tas izskatās pēc nepabeigta darba, un tā arī ir.

**Rīcība, līdz Roberts iedod reālos partnerus:**

Ja `lib/partners.ts` ir tukšs vai satur tikai placeholderus, lapa rāda:

> **Mūsu draugi**
>
> Sadarbojamies ar uzticamiem partneriem pasākumu jomā. Drīzumā šeit būs mūsu draugu saraksts.
>
> Vai vēlies kļūt par mūsu partneri? Raksti — [info@anabellaparty.lv]

Tulkots trijās valodās. Nekādu `[JĀAPSTIPRINA]` marķieru publiskajā lapā.

**Alternatīva:** noņem "Mūsu draugi" no navbar, līdz saturs ir. Bet tad backlinku plāns nedarbojas — labāk atstāt ar godīgu paziņojumu.

`[VAJAG NO ROBERTA: partneru saraksts — nosaukums, apraksts, saite]`

---

## 5. PILNS PĀRBAUDES SARAKSTS

Iepriekšējās reizes rādīja, ka daļēja pārbaude palaiž garām. Šoreiz sistemātiski.

**Metode:** atver `/en`, ritini katru lapu no augšas līdz apakšai, lasi katru vārdu. Tad `/ru`. Tad `/lv` — pārbaudi, vai tulkošana nesabojāja latviešu versiju.

| Lapa | Ko pārbaudīt |
|---|---|
| `/` | Hero, pogas, sekciju virsraksti, kategoriju kartītes, Par mums, plusi, klienti, CTA, footeris |
| `/foto-kaste` | 3 produkti, 350 € bloks, uz periodu, masu pasākumiem, rāmīšu sekcija |
| `/foto-kaste/ai-foto` | Tēmu saraksts, CTA |
| `/piepusamas-atrakcijas` | 10 produktu, tīrības garantija, bumbu tīrīšanas ierīce |
| `/svinibu-inventars` | 4 kategoriju kartītes |
| 4 apakšlapas | Produkti, specifikācijas, papildinājumi, informatīvie bloki |
| `/rezervet` | Kontaktu pogas, 4 soļi, lauku etiķetes, placeholderi, **kļūdu paziņojumi**, cenu panelis, apstiprinājuma ekrāns |
| `/kontakti` | Rekvizīti, forma, darba laiks |
| `/faq` | Kategoriju cilnes, jautājumi, atbildes |
| `/musu-draugi` | Bez `[JĀAPSTIPRINA]` |
| `/noteikumi`, `/privatuma-politika` | Piezīme par LV versiju |
| 404 | Teksts |
| Čatbots | Sākuma ziņa, piedāvātie jautājumi |
| Sīkdatņu banneris | Visas trīs pogas un iestatījumi |

**Kļūdu paziņojumi** — ievadi tukšu telefonu, nederīgu e-pastu, datumu pagātnē. Tie bieži paliek hardkodēti validācijas funkcijās, ne komponentos.

**Meta un OG** — pārbaudi lapas avotā, vai `title` un `description` ir attiecīgajā valodā.

- [ ] `/en` — nulle latviešu vārdu
- [ ] `/ru` — nulle latviešu vārdu
- [ ] `/lv` — nekas nav sabojāts
- [ ] Dropdown aizveras: pele prom, Esc, klikšķis ārpusē, ceļa maiņa
- [ ] `[JĀAPSTIPRINA]` neparādās nekur publiskajā lapā
- [ ] `npm run build` tīrs

**Paliek LV apzināti:** atsauksmes un uzņēmumu nosaukumi klientu sadaļā.
