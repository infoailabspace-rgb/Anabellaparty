# SOLIS6 — Admin panelis un palaišana

**Mērķis:** Roberts pārvalda pieteikumus lapā, nevis e-pastā. Domēns pārslēgts. Lapa dzīva.

**Priekšnosacījumi:** visi iepriekšējie soļi ✅.

**Pirms sāc:** izlasi `CLAUDE.md`. Parādi plānu. Gaidi apstiprinājumu.

**Šis solis maina dzīvo domēnu.** DNS daļa (D) jāizpilda atsevišķi, ne tajā pašā piegājienā, kur admin panelis. Vispirms A–C, pārbaudi, tad D.

---

## DAĻA A — AUTENTIFIKĀCIJA

Supabase Auth, e-pasts + parole. Nav publiskas reģistrācijas — kontus izveido Roberts Supabase panelī.

```
/admin/login       pieteikšanās
/admin             pieteikumu saraksts
/admin/[id]        viens pieteikums
/admin/kalendars   kalendāra skats
```

Middleware aizsargā visu `/admin/*`. Nav sesijas → `/admin/login`.

```sql
create table admin_users (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  name text,
  role text default 'admin',      -- admin | viewer
  created_at timestamptz default now()
);
```

RLS uz `booking_requests`: `select`/`update` tikai tiem, kas ir `admin_users`. Anon loma joprojām drīkst `insert` (publiskā forma).

Admin panelis **netiek indeksēts** — `robots.txt` `Disallow: /admin/`, plus `noindex` metadata.

---

## DAĻA B — PIETEIKUMU PĀRVALDĪBA

### B1. Saraksts

Tabula ar kolonnām: datums, klients, telefons, inventārs (īsināts), summa, statuss.

- **Kārtošana** pēc pasākuma datuma — tuvākie augšā. Ne pēc pieteikuma laika: svarīgs ir pasākums, ne kad rakstīja.
- **Filtri:** statuss, datumu diapazons, meklēšana pēc vārda/telefona/e-pasta
- **Krāsu kodējums pēc steidzamības:**
  - 🔴 pasākums < 7 dienas un statuss `new`
  - 🟡 pasākums < 30 dienas un statuss `new`/`contacted`
  - ⚪ pārējie
- Jaunie pieteikumi treknrakstā, kamēr nav atvērti

### B2. Statusi

```
new        Jauns, neapskatīts
contacted  Sazinājos
quoted     Nosūtīju piedāvājumu
confirmed  Apstiprināts, depozīts saņemts
completed  Pasākums notika
rejected   Atteicās / neatbildēja
```

Statusa maiņa vienā klikšķī no saraksta, bez lapas pārlādes.

### B3. Viena pieteikuma skats

Viss: kontakti, pasākums, izvēlētais inventārs ar cenām, piegādes km un cena, apraksts, aprēķinātā summa, depozīts.

Darbības:
- Zvanīt (`tel:`) un WhatsApp (`wa.me`) — vienā klikšķī no telefona
- Rakstīt e-pastu — atver `mailto:` ar aizpildītu tematu
- Iekšējās piezīmes (`admin_notes`) — autosave
- Statusa maiņa
- **Cenas korekcija** — Roberts var pārrakstīt aprēķināto summu, ja piedāvājums atšķiras. Saglabā abus: `estimated_total` un `final_total`.

```sql
alter table booking_requests
  add column final_total numeric,
  add column viewed_at timestamptz;
```

### B4. Kalendāra skats

Mēneša režģis ar pasākumiem. Katrā dienā — apstiprināto pasākumu skaits un inventārs.

**Kāpēc svarīgi:** ja divi klienti grib SPOGULI vienā dienā, tas jāredz uzreiz. Kalendārā parāda konfliktu — viens inventārs, divi apstiprināti pasākumi vienā datumā → sarkans brīdinājums.

Konfliktu pārbaude tikai `confirmed` statusam. Pieteikumi konfliktu nerada.

---

## DAĻA C — ANALĪTIKA

### C1. GA4 un GTM

GTM konteiners `GTM-WDQZZ5PG` jau ir. Google Consent Mode v2 (SOLIS2) jau bloķē līdz piekrišanai.

Notikumi:

| Notikums | Kad |
|---|---|
| `booking_started` | Atver `/rezervet` |
| `booking_item_added` | Pievieno inventāru (ar `item_name`, `value`) |
| `booking_step` | Pāriet uz nākamo soli (ar `step_number`) |
| `booking_submitted` | Nosūta pieteikumu (ar `value` = summa) |
| `contact_click` | Klikšķina Zvanīt / WhatsApp / e-pasts |
| `chat_opened` | Atver čatbotu |

`booking_submitted` iestata kā konversiju GA4.

**Kritiskākais rādītājs:** kurā anketas solī cilvēki pamet. Ja masveidā pamet 3. solī (kontakti), tad telefona obligātums maksā pieteikumus, un tas jāpārskata.

### C2. Facebook Pixel

Pikselis `896953122077848`. `Lead` notikums uz `booking_submitted`. Tikai pēc mārketinga piekrišanas.

### C3. Google Search Console

- Pievieno īpašumu (domēna verifikācija DNS TXT ierakstā)
- Iesniedz `sitemap.xml`
- **Pēc DNS pārslēgšanas** pieprasa pārindeksēšanu galvenajām lapām

### C4. Google Business Profile

Pārbaudi: adrese, telefons, darba laiks, kategorijas, foto, saite uz jauno lapu. Šis dod vairāk vietējā trafika nekā puse SEO darba.

---

## DAĻA D — DNS PĀRSLĒGŠANA

**Nedari to piektdienā vai pirms pasākumu sezonas nedēļas nogales.** Otrdienas rīts.

### D1. Pirms

- [ ] Visas lapas strādā Vercel preview URL
- [ ] Lighthouse mobilajā: Performance > 90, SEO 100
- [ ] Rezervācijas forma pārbaudīta no gala līdz galam — pieteikums nonāk Supabase, abi e-pasti atnāk
- [ ] Visi vecie URL eksistē (salīdzini ar Mozello sitemap)
- [ ] **Pieraksti pašreizējos DNS ierakstus** — īpaši MX. Ja e-pasts ir uz šī domēna, MX ierakstus NEDRĪKST pazaudēt.
- [ ] Mozello lapas eksports/dublējums
- [ ] Vercel env mainīgie iestatīti produkcijā

### D2. Pārslēgšana

1. Vercel → Project → Domains → pievieno `anabellaparty.lv` un `www.anabellaparty.lv`
2. Vercel parādīs vajadzīgos DNS ierakstus
3. Reģistratora panelī nomaini **tikai** A un CNAME ierakstus. **MX un TXT atstāj.**
4. TTL pirms tam samazini uz 300 sek (ideālā gadījumā dienu iepriekš)
5. Gaidi izplatīšanos — parasti 15 min līdz 2 h
6. Pārbaudi: `dig anabellaparty.lv`, `dig www.anabellaparty.lv`

Izvēlies kanonisko versiju (`www` vai bez) un otru pāradresē 301. Mozello lapa ir ar `www` — paliec pie `www`, lai nav lieka pāradresācija indeksētajiem URL.

### D3. Pēc

Pirmajā stundā:
- [ ] Visas lapas atveras uz jaunā domēna
- [ ] HTTPS strādā, sertifikāts izsniegts
- [ ] Rezervācijas forma nosūta pieteikumu
- [ ] E-pasts joprojām strādā (nosūti sev testa vēstuli)
- [ ] GA4 rāda apmeklējumus reāllaikā

Pirmajā nedēļā:
- [ ] GSC — nav `Coverage` kļūdu
- [ ] Pārbaudi 404 kļūdas Vercel logos, salabo trūkstošos URL
- [ ] Pozīciju kritums 5–15% pirmajās dienās ir normāls. Ja pēc 3 nedēļām nav atgriezies — meklē cēloni.

**Mozello lapu neatslēdz uzreiz.** Atstāj 2 nedēļas kā drošības tīklu.

---

## DAĻA E — PĒDĒJĀS PĀRBAUDES

- [ ] Visas saites strādā, nulle 404
- [ ] Formas strādā mobilajā
- [ ] Sīkdatņu banneris parādās un bloķē skriptus
- [ ] Čatbots atbild
- [ ] Trīs valodas
- [ ] Attēli ielādējas, nav salauztu ikonu
- [ ] Kontakttālruņi pareizi (29222761, kubliem 28286911)
- [ ] Juridiskās lapas bez `[JĀAPSTIPRINA]` marķieriem
- [ ] Lighthouse mobilajā četrās kategorijās
- [ ] Pārbaudi iPhone Safari un Android Chrome uz reālām ierīcēm

---

## PIEŅEMŠANAS KRITĒRIJI

- [ ] Admin panelis aizsargāts, `noindex`
- [ ] Pieteikumi redzami, kārtoti pēc pasākuma datuma
- [ ] Statusu maiņa strādā
- [ ] Kalendārs rāda inventāra konfliktus
- [ ] GA4 notikumi ienāk
- [ ] `booking_submitted` iestatīts kā konversija
- [ ] Sitemap iesniegts GSC
- [ ] Domēns rāda uz Vercel, HTTPS strādā
- [ ] MX ieraksti neskarti, e-pasts strādā
- [ ] Jaunas pakotnes: nav (vai `date-fns` kalendāram)

---

## `[JĀAPSTIPRINA]` — Robertam

1. Kanoniskā versija — `www.anabellaparty.lv` vai bez `www`?
2. Vai e-pasts ir uz šī domēna (tad MX kritiski svarīgi)
3. Kurš reģistrators un vai ir piekļuve
4. Cik admin kontu — tikai tev, vai arī Aivai

---

## KO NEDARĪT

- Nemaini DNS tajā pašā dienā, kad būvē admin paneli
- Nedzēs Mozello lapu uzreiz
- Nemaini MX ierakstus
- Neatļauj publisku reģistrāciju admin panelī
- Nepalaid GA4 bez Consent Mode
