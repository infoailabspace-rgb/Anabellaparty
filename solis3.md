# SOLIS3 — Rezervācijas lapa un pieteikuma anketa

**Mērķis:** `/rezervet` lapa ar tūlītējiem kontaktiem augšā un pilnvērtīgu anketu zem tiem. Inventāra izvēle ar cenas aprēķinu reāllaikā.

**Priekšnosacījumi:** SOLIS1B ✅ (produktu dati), SOLIS1C ✅ (kustība), SOLIS2 ✅ (juridiskās lapas).

**Pirms sāc:** izlasi `CLAUDE.md`, `skills/web-builder/SKILL.md`. Parādi plānu. Gaidi apstiprinājumu.

**Piezīme par soļu secību:** šis solis maina plānu — rezervācijas anketa nāk PIRMS čatbota. Čatbots pārceļas uz SOLIS5. Atjauno `CLAUDE.md` soļu tabulu.

---

## 1. LAPAS STRUKTŪRA

Trīs daļas, šādā secībā:

```
1. Hero — īss, ne pilnekrāna
2. Tūlītējie kontakti — 3 lielas pogas
3. Anketa — daudzsoļu
```

### 1.1 Tūlītējie kontakti (virs anketas)

Trīs lielas, vienlīdzīgas pogas. Cilvēks, kurš grib zvanīt, nedrīkst ritināt.

| Poga | Darbība |
|---|---|
| **Zvanīt** | `tel:+37129222761` |
| **WhatsApp** | `https://wa.me/37129222761` |
| **Rakstīt e-pastu** | `mailto:` uz apstiprināto adresi |

Desktopā rindā, mobilajā viena zem otras, pilnā platumā. Zelta fons, melns teksts, ikonas inline SVG (`components/social-icons.tsx` no SOLIS1B).

Zem pogām plāna līnija un teksts: *"Vai aizpildi anketu — atbildēsim 24 stundu laikā ar precīzu piedāvājumu."*

### 1.2 Anketa

Zem kontaktiem. Ne modālis, ne atsevišķa lapa — tajā pašā ritinājumā.

---

## 2. ANKETAS SOĻI

Četri soļi ar progresa joslu augšā. Katrs solis validējas pirms pārejas uz nākamo. Atpakaļ vienmēr var.

### Solis 1 — Inventārs

Inventāra izvēle pa kategorijām. Dati no `lib/products.ts` (SOLIS1B) — **nekādu dublētu cenu**.

- Kategoriju cilnes: Foto kastes · Atrakcijas · Audio/video · Specefekti · Deco · Kubli
- Katrā kategorijā produktu kartītes ar attēlu, nosaukumu, cenu
- Klikšķis pievieno grozam, atkārtots klikšķis noņem. Izvēlētā kartīte ar zelta apmali un ķeksīti
- Produktiem ar vairākiem tarifiem (2h/10h/24h/48h/72h) — tarifa izvēle kartītē pēc pievienošanas
- Foto kastēm ar stundas piemaksu — skaitītājs "papildu stundas: − 0 +"
- Papildinājumiem (bumbas, glāzes, krēsli, pulveris, šķidrums) — daudzuma skaitītājs
- Var izvēlēties vairākus produktus no dažādām kategorijām

**Kubli:** ja izvēlēts kubls vai pirts, parādās brīdinājums: *"Kubli un pirts atrodas Jūrmalā, un tiem ir atsevišķs kontakttālrunis 28286911. Piegādes cena pēc vienošanās."* `[JĀAPSTIPRINA: vai kubli vispār iet caur šo anketu, vai tikai zvans]`

### Solis 2 — Pasākums

| Lauks | Tips | Obligāts |
|---|---|---|
| Pasākuma datums | date picker, nevar pagātnē | ✅ |
| Sākuma laiks | time | — |
| Pasākuma ilgums | select: 2h / 4h / 6h / 10h / 12h / visa diena | — |
| Pasākuma veids | select: Kāzas / Jubileja / Bērnu ballīte / Korporatīvais / Kristības / Cits | ✅ |
| Viesu skaits | number | — |
| Norises vieta | text (pilsēta/novads/adrese) | ✅ |
| Telpās vai ārā | radio | — |

**Datums ir kritisks** — tas ir vienīgais, kas nosaka, vai pasūtījums vispār iespējams.

**Piegādes aprēķins:** ja norises vieta ārpus Pierīgas, parādās piezīme par €0.50/km. Pagaidām neaprēķina automātiski — tikai informē. `[JĀAPSTIPRINA: kā tieši definēt "Pierīga"]`

### Solis 3 — Kontakti

| Lauks | Tips | Obligāts |
|---|---|---|
| Vārds, uzvārds | text | ✅ |
| **Telefons** | tel | ✅ **obligāts** |
| E-pasts | email | ✅ |
| Uzņēmums | text | — |
| Reģ. nr. / PVN nr. | text (parādās, ja aizpildīts uzņēmums) | — |

Telefona validācija: pieņem LV formātus (`+371XXXXXXXX`, `2XXXXXXX`, ar atstarpēm vai bez). Normalizē uz `+371XXXXXXXX` pirms nosūtīšanas.

### Solis 4 — Apraksts un apstiprinājums

- **Pasākuma apraksts** — textarea, 5 rindas. Placeholder: *"Pastāsti par pasākumu — tematika, īpašas vēlmes, kur tieši uzstādīt inventāru, vai vajadzīgs asistents..."*
- Kopsavilkums: izvēlētais inventārs, datums, vieta, kontakti
- Aprēķinātā cena
- Checkbox: *"Piekrītu [nomas noteikumiem](/noteikumi) un [privātuma politikai](/privatuma-politika)"* — obligāts
- Poga **"Nosūtīt pieteikumu"**

---

## 3. CENAS APRĒĶINS REĀLLAIKĀ

Sānu panelis (desktopā `sticky` pa labi, mobilajā fiksēta josla apakšā, izvēršama ar klikšķi).

Rāda:

```
IZVĒLĒTAIS INVENTĀRS

Foto kaste OZOLS               220 €
  + 2 papildu stundas          200 €
Baltā pils XL                  180 €
  + plastmasas bumbas           30 €
Burbuļu ierīce                  40 €
───────────────────────────────────
Kopā                           670 €

Piegāde Pierīgā                bez maksas
Ārpus Pierīgas             +0.50 €/km

Priekšapmaksa (20%)            134 €
```

**Loģika:**
- Bāzes tarifs no izvēlētā `tier`
- Papildu stundas × `hourlyExtra`
- Papildinājumi × daudzums
- `contactOnly` produkti — rāda "vienojoties", neieskaita summā, bet parāda kopsummā piezīmi
- Aprēķins **tikai klienta pusē** no `lib/products.ts`. Nekādu cenu no formas ievades.

**Atruna zem summas:** *"Aprēķins ir orientējošs. Precīzu piedāvājumu nosūtīsim pēc pieteikuma saņemšanas."*

Aprēķina loģika `lib/pricing.ts` — atsevišķi no UI, lai to var testēt un vēlāk pārlietot rēķinos.

`[JĀAPSTIPRINA: vai priekšapmaksa ir 20%]`

---

## 4. NOSŪTĪŠANA

### 4.1 Supabase

Šis ir solis, kur Supabase sākas. Instalē:

```bash
npm install @supabase/supabase-js
```

Tabula `booking_requests`:

```sql
create table booking_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  -- kontakti
  name text not null,
  phone text not null,
  email text not null,
  company text,
  reg_nr text,
  -- pasākums
  event_date date not null,
  event_time time,
  duration text,
  event_type text not null,
  guest_count int,
  location text not null,
  indoor_outdoor text,
  description text,
  -- inventārs
  items jsonb not null,
  estimated_total numeric,
  -- statuss
  status text default 'new',      -- new | contacted | quoted | confirmed | rejected
  admin_notes text
);
```

RLS: `insert` atļauts anon lomai, `select`/`update` tikai autentificētiem. Publiskajai formai lasīšana nav vajadzīga.

Env mainīgie ar `SB_` prefiksu (nevis `SUPABASE_` — tas ir rezervēts):

```
NEXT_PUBLIC_SB_URL=
NEXT_PUBLIC_SB_ANON_KEY=
SB_SERVICE_ROLE_KEY=
```

### 4.2 E-pasta paziņojumi

```bash
npm install resend
```

Route handler `app/api/booking/route.ts`:
1. Validē datus servera pusē (nepaļaujas uz klienta validāciju)
2. Pārrēķina cenu servera pusē no `lib/pricing.ts` — klienta atsūtītajai summai neuzticas
3. Ieraksta Supabase
4. Sūta divus e-pastus caur Resend:
   - **Robertam** — viss pieteikums, `reply-to` uz klienta e-pastu, temats: `Jauns pieteikums — [datums] — [vārds]`
   - **Klientam** — apstiprinājums ar pieteikuma kopsavilkumu un solījumu atbildēt 24h laikā

E-pasti HTML, navy/zelta zīmola stilā, latviski.

```
RESEND_API_KEY=
BOOKING_NOTIFY_EMAIL=
```

`[JĀAPSTIPRINA: uz kuru e-pastu sūtīt paziņojumus, un vai domēns ir verificēts Resend]`

### 4.3 Pēc nosūtīšanas

Nomaina anketu ar apstiprinājuma ekrānu: ķeksītis, pateicība, kopsavilkums, pogas "Zvanīt" un "WhatsApp" gadījumam, ja steidz.

Kļūdas gadījumā — skaidrs paziņojums un kontakti, nevis tikai "Kaut kas nogāja greizi". Formas dati nedrīkst pazust.

---

## 5. UX DETAĻAS

- **Formas stāvoklis `sessionStorage`** — pārlādējot lapu, dati nepazūd. Notīra pēc veiksmīgas nosūtīšanas.
- **Deep link no produkta:** poga "Rezervēt" produkta lapā ved uz `/rezervet?item=<slug>` un tas produkts jau ir grozā.
- **Validācija pēc `blur`**, ne katrā taustiņspiedienā. Kļūdas sarkanā, zem lauka, latviski.
- **Nospiežot "Nosūtīt"** — poga bloķējas, spinneris, lai nav dubultu pieteikumu.
- **Klaviatūra** — visa forma izejama ar Tab. Zelta fokusa gredzens.
- **Mobilais** — `inputMode="tel"` telefonam, `inputMode="numeric"` skaitļiem. Native date picker.
- **Kustība** — soļu pārejas ar `AnimatePresence`, slide horizontāli. Cenas izmaiņas ar `layout` animāciju.

---

## 6. BUILD UN PUSH

```bash
npm run build
npm run dev
```

Pārbaudi:
- Cena pārrēķinās uzreiz, pievienojot un noņemot inventāru
- Telefona lauks neļauj iet tālāk, ja tukšs
- Datums pagātnē nav izvēlams
- Deep link `?item=foto-kaste-ozols` ieliek produktu grozā
- Pieteikums nonāk Supabase
- Abi e-pasti atnāk
- Lapas pārlāde nezaudē datus
- Mobilais izkārtojums OK

```bash
git add .
git commit -m "SOLIS3: rezervācijas lapa ar inventāra izvēli un cenas aprēķinu"
git push
```

Vercel env mainīgie jāpievieno projekta iestatījumos — bez tiem produkcijas build strādās, bet nosūtīšana ne.

`SOLIS3-DONE.md` ar `[JĀAPSTIPRINA]` sarakstu.

---

## PIEŅEMŠANAS KRITĒRIJI

- [ ] Zvanīt / WhatsApp / E-pasts pogas VIRS anketas
- [ ] Inventāru var kombinēt no dažādām kategorijām
- [ ] Cena pārrēķinās reāllaikā
- [ ] Telefons obligāts, ar LV formāta validāciju
- [ ] Datums obligāts, pagātne bloķēta
- [ ] Pasākuma apraksta lauks
- [ ] Cenas aprēķins `lib/pricing.ts`, dati no `lib/products.ts` — nekur nav hardkodētu cenu
- [ ] Servera puse pārrēķina cenu, neuzticas klientam
- [ ] Pieteikums Supabase + divi e-pasti
- [ ] `sessionStorage` saglabā progresu
- [ ] Deep link no produkta lapas strādā
- [ ] `npm run build` tīrs
- [ ] Jaunas pakotnes tikai: `@supabase/supabase-js`, `resend`

---

## `[JĀAPSTIPRINA]` — Robertam

1. Priekšapmaksa 20% — pareizi?
2. Uz kuru e-pastu sūtīt pieteikumus
3. Vai Resend domēns verificēts
4. Kā definēt "Pierīga" bezmaksas piegādei (novadu saraksts vai km rādiuss)
5. Vai kubli iet caur anketu vai tikai zvans uz 28286911
6. Vai vajag arī Telegram paziņojumu (bija sākotnējā plānā)

---

## KO NEDARĪT

- **Nekādu Stripe maksājumu šajā solī.** Šī ir pieteikuma anketa, ne pirkums. Maksājumi SOLIS4.
- Neveido admin paneli (SOLIS6)
- Neveido čatbotu (SOLIS5)
- Nemaini produktu datus
- Nesūti SMS
