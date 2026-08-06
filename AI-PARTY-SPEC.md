# AI PARTY — Specifikācija

**Statuss:** Atsevišķs produkts. Būvējam PĒC tam, kad anabellaparty.lv ir dzīva. Nav daļa no soļu plāna.

---

## 1. KAS TAS IR

Jebkurš TV kļūst par AI foto kasti. Nav aparatūras, nav lejupielādes.

```
Roberts atver sesiju laptopā/planšetē → savieno ar TV
   ↓
TV rāda QR kodu un dzīvo galeriju
   ↓
Viesis skenē ar telefonu → uzņem selfiju → izvēlas tēmu
   ↓
AI pārveido (5-15 sek)
   ↓
Rezultāts parādās TV ekrānā un viesa telefonā
```

---

## 2. KONKURENTS — Snipsin

<cite index="2-1">Snipsin pozicionē sevi kā risinājumu, kas jebkuru TV pārvērš par AI foto kasti: uzstādīšana divās minūtēs bez lejupielādēm, viesi skenē QR kodu, augšupielādē foto un skatās, kā tie dzīvi parādās uz lielā ekrāna.</cite>

**Ko no tā mācāmies:**

Pozicionējums ir pareizs — "nav aparatūras" ir spēcīgāks pārdošanas arguments nekā "labāka AI". Tirgus jau pierādīts.

**Kur ir tava priekšrocība:**

| Snipsin | Anabella |
|---|---|
| Globāls, angliski | Latviski, latviešu kāzu tirgus |
| Tikai programmatūra | Tev jau ir 4 fiziskās kastes un klientu bāze |
| Klientam pašam jāuzstāda | Tu jau brauc uz pasākumu |
| Vispārīgas tēmas | Latviskas tēmas — Jāņi, Līgo, kāzu tradīcijas |

**Ko tas nozīmē biznesam:** AI Party nav atsevišķs produkts, ko pārdot svešiem. Tas ir **papildpārdošana esošajiem klientiem**. Cilvēks, kurš jau nomā foto kasti par 220 €, piemaksā 50–100 € par TV pieredzi visiem viesiem paralēli.

Tas ir daudz vieglāks ceļš nekā konkurēt ar Snipsin globāli.

---

## 3. TEHNISKAIS

### Trīs virsmas

| Virsma | Ceļš | Ierīce |
|---|---|---|
| **TV displejs** | `/party/<code>/tv` | TV pārlūks vai Chromecast/laptops |
| **Viesa lapa** | `/party/<code>` | Viesa telefons |
| **Vadība** | `/party/<code>/admin` | Roberta telefons |

Sesijas kods 6 rakstzīmes, viegli nolasāms (`ANABEL`, ne `x7Kp2Q`).

### Sinhronizācija

Supabase Realtime, ne WebSocket ar roku. Kad ieraksts nonāk `party_photos`, TV to saņem pats.

```sql
create table party_sessions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  event_name text,
  theme text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  status text default 'active',
  created_at timestamptz default now()
);

create table party_photos (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references party_sessions on delete cascade,
  original_url text not null,
  transformed_url text,
  theme text not null,
  status text default 'processing',   -- processing | done | failed | hidden
  created_at timestamptz default now()
);
```

### AI pārveide

Testējams: **fal.ai** (`flux` vai `nano-banana` image-to-image). Alternatīva: Replicate.

Izmaksas orientējoši €0.001–0.01 par attēlu. Tipiska ballīte 35 transformācijas = zem €0.50. Marža nav problēma — problēma ir ātrums un kvalitāte.

**Kritiskais rādītājs: laiks no selfija līdz rezultātam TV.** Virs 20 sekundēm viesi zaudē interesi un pāriet uz nākamo lietu. Zem 10 sekundēm — rinda pie TV.

### TV displejs

- Fullscreen, tumšs fons
- QR kods stūrī, vienmēr redzams
- Jaunākais foto liels centrā ar ienākšanas animāciju
- Iepriekšējie mazāki ap malām vai lentē apakšā
- Auto-rotācija, ja jaunu nav
- Sesijas kods lieliem burtiem
- Bez ritināšanas, bez peles — TV pārlūkā nav kursora

### Vadība

Roberta telefonā: pārskats, foto slēpšana (ja kāds nosūta neatbilstošu), tēmas maiņa, sesijas beigšana, visu foto lejupielāde ZIP.

**Moderācija ir obligāta.** TV ekrāns publiskā pasākumā bez slēpšanas pogas ir risks.

---

## 4. TĒMAS

Sākt ar 5, ne 15. Katra tēma ir prompt + testēšana + kvalitātes pārbaude.

1. **Kāzu glamour** — Holivudas portrets, mīksts apgaismojums
2. **Retro Gatsby** — 20. gadu stils
3. **Supervaroņi** — bērnu ballītēm
4. **Burvju skola** — bērniem un pusaudžiem
5. **Līgo** — vainagi, ugunskurs, latviska vasaras nakts ← neviens konkurents to nedarīs

Tēmu prompti `lib/party-themes.ts`, ne datubāzē. Tie mainās bieži un tos vajag versionēt Gitā.

---

## 5. CENA

Pēc `investor-mode` loģikas — cena pēc vērtības, ne pēc izmaksām.

| Modelis | Cena | Kad |
|---|---|---|
| Papildinājums foto kastei | +50 € | Klients jau nomā kasti |
| Atsevišķi (tu uzstādi) | 150 € | Klientam nav kastes |
| Self-service (klients pats) | 80 € | Tālāki pasākumi |

Neieteicu €5/sesija no viesiem — maksājuma berze ballītē nogalina lietojumu. Vieglāk iekļaut pasākuma cenā.

---

## 6. RISKI

| Risks | Rīcība |
|---|---|
| Pasākuma vietas wifi nestrādā | 4G router obligāti komplektā. Tas ir #1 iemesls, kāpēc šādas sistēmas krīt. |
| Viesis nosūta neatbilstošu foto | Moderācija + NSFW filtrs pirms parādīšanas TV |
| AI API krīt pasākuma laikā | Fallback: rāda oriģinālo foto bez pārveides |
| GDPR — sejas ir biometriskie dati | Skaidra piekrišana pirms augšupielādes, automātiska dzēšana pēc 30 dienām |
| Lēna pārveide | Rāda progresu un oriģinālo foto uzreiz, pārveidoto pievieno, kad gatavs |

---

## 7. MVP TVĒRUMS

Pirmajā versijā **tikai** šis:

- [ ] Sesijas izveide ar kodu
- [ ] TV displejs ar QR un dzīvo galeriju
- [ ] Viesa lapa: foto uzņemšana + tēmas izvēle
- [ ] Viena AI pārveide (fal.ai)
- [ ] 3 tēmas, ne 5
- [ ] Moderācijas poga
- [ ] Foto lejupielāde viesim

**Ne MVP:** maksājumi, analītika, vairākas vienlaicīgas sesijas, video, druka, zīmola pielāgošana klientiem.

Pirmais tests — sava ballīte vai draugu pasākums, ne maksājošs klients.

---

## 8. KAD SĀKT

Pēc tam, kad:
1. anabellaparty.lv ir dzīva un rezervācijas ienāk
2. SOLIS6 pabeigts

Ne agrāk. AI Party ir jauns produkts ar jaunu risku. Vietne ir esošā biznesa pamats.
