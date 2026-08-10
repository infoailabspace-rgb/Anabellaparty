# AI PARTY — SOLIS0: MVP

**Mērķis:** No tukšas mapes līdz strādājošai sistēmai, ko var izmēģināt reālā pasākumā.

**Projekts:** atsevišķs no anabellaparty.lv. Sava kodu bāze, savs Supabase, sava deploy plūsma.

**Ceļš:** `C:\Projekti\AiParty\`
**Domēns:** vēlāk. Pagaidām Vercel preview URL.

**Pirms sāc:** parādi plānu. Gaidi apstiprinājumu.

---

## 1. KAS TAS IR

Jebkurš TV kļūst par AI foto kasti. Nav aparatūras, nav lejupielādes.

```
Roberts izveido sesiju → atver TV lapu uz ekrāna
   ↓
TV rāda QR kodu un dzīvo galeriju
   ↓
Viesis skenē telefonā → uzņem selfiju → izvēlas tēmu
   ↓
fal.ai pārveido (mērķis <10 sek)
   ↓
Rezultāts parādās TV un viesa telefonā
```

**Kritiskais rādītājs: laiks no selfija līdz attēlam uz TV.** Virs 20 sekundēm viesi zaudē interesi. Visi tehniskie lēmumi pakārtoti šim.

---

## 2. STACK

| Slānis | Tehnoloģija |
|---|---|
| Framework | Next.js 16 App Router, TypeScript |
| Stils | Tailwind v4 |
| DB + Realtime + Storage | Supabase (jauns projekts) |
| AI pārveide | fal.ai |
| Hostings | Vercel |

**Nekādu maksājumu, nekādas autentifikācijas viesiem.** Viesis skenē un lieto.

---

## 3. MULTI-TENANT NO SĀKUMA

Vairāki pasākumi notiek vienlaikus — arī dažādiem operatoriem. Tāpēc izolācija ir pamatos, ne pielikums.

```sql
-- Operators (Anabella, vēlāk citi)
create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  brand_color text default '#D4A960',
  plan text default 'trial',        -- trial | active | suspended
  created_at timestamptz default now()
);

create table tenant_users (
  id uuid primary key references auth.users on delete cascade,
  tenant_id uuid references tenants on delete cascade not null,
  email text not null,
  role text default 'operator',     -- owner | operator
  created_at timestamptz default now()
);

-- Pasākums
create table sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants on delete cascade not null,
  code text unique not null,        -- 6 rakstzīmes, cilvēklasāms
  event_name text,
  themes text[] not null,           -- kuras tēmas pieejamas
  starts_at timestamptz,
  ends_at timestamptz,
  status text default 'active',     -- active | paused | ended
  photo_count int default 0,
  created_at timestamptz default now()
);

create index on sessions (tenant_id, status);
create index on sessions (code) where status = 'active';

-- Bilde
create table photos (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions on delete cascade not null,
  original_path text not null,
  transformed_path text,
  theme text not null,
  status text default 'queued',     -- queued | processing | done | failed | hidden
  error text,
  ms_taken int,                     -- cik ilgi aizņēma
  created_at timestamptz default now()
);

create index on photos (session_id, created_at desc);
create index on photos (status) where status in ('queued','processing');
```

**Sesijas kods:** 6 rakstzīmes no `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` — bez `I`, `O`, `0`, `1`. Cilvēks to pārraksta no TV ekrāna, ja QR neskenējas.

**RLS:**
- `sessions`, `photos` — publiskā lasīšana pēc sesijas koda, ja `status = 'active'`
- Raksts `photos` — anon drīkst `insert` (viesis augšupielādē), ne `update`
- Viss pārējais — tikai `tenant_users` savam `tenant_id`

Aktīvu sesiju vienam tenantam var būt vairākas vienlaikus.

---

## 4. TRĪS VIRSMAS

| Virsma | Ceļš | Ierīce |
|---|---|---|
| **TV** | `/tv/<code>` | TV pārlūks, Chromecast, laptops |
| **Viesis** | `/p/<code>` | Telefons |
| **Vadība** | `/admin` | Roberta telefons |

Viesa ceļš īss — tas ir QR kodā un uz TV ekrāna.

### 4.1 TV displejs

- Fullscreen, melns fons, bez ritinājuma, bez kursora
- **QR kods stūrī, vienmēr redzams**, blakus sesijas kods lieliem burtiem
- Jaunākā bilde liela centrā, ienākšanas animācija
- Iepriekšējās mazākas lentē apakšā vai ap malām
- Auto-rotācija ik 8s, ja jaunu nav
- Bilžu skaitītājs

**Supabase Realtime**, ne polling. Kad `photos` ieraksts mainās uz `done`, TV to saņem pats.

**Reconnect:** ja savienojums pārtrūkst, atjauno automātiski un pārlādē pēdējās 20 bildes. Wifi pasākumu vietās krīt — tas nav malas gadījums.

**TV pārlūkiem nav kursora un ir vāji.** Nekādu smagu animāciju, nekāda `backdrop-blur`, nekāda video fona.

### 4.2 Viesa lapa

Trīs soļi, nekas vairāk:

1. **Uzņem vai izvēlies foto** — `<input type="file" accept="image/*" capture="user">`. Nekādas pielāgotas kameras lietotnes; native ir ātrāka un uzticamāka.
2. **Izvēlies tēmu** — lielas kartītes ar piemēru attēlu
3. **Gaidi** — progress ar reālu novērtējumu, ne bezgalīgs spinneris

Rezultāts: liels attēls, poga **"Lejupielādēt"**, poga "Vēl vienu".

**Klienta puses saspiešana pirms augšupielādes** — canvas, max 1200px, JPEG 85. Telefona 12 MB foto pār pasākuma wifi ir 30 sekundes tikai augšupielādei.

**Piekrišana pirms pirmās augšupielādes:** viens ekrāns — "Tava bilde tiks pārveidota ar AI un parādīta uz ekrāna šajā pasākumā. Bildes dzēšam pēc 30 dienām." Poga "Piekrītu un turpinu". Bez tā GDPR ziņā tas ir sejas datu apstrāde bez pamata.

### 4.3 Vadība

Roberta telefonā, pēc pieteikšanās:

- Aktīvo sesiju saraksts
- Jauna sesija: nosaukums, tēmas, kods ģenerējas
- Sesijas skats: bilžu plūsma, skaitītājs, vidējais apstrādes laiks
- **Slēpt bildi** — viens klikšķis, pazūd no TV uzreiz
- Pauzēt / beigt sesiju
- Visu bilžu ZIP lejupielāde

**Moderācija ir obligāta.** TV publiskā pasākumā bez slēpšanas pogas ir risks.

---

## 5. AI PĀRVEIDE

`app/api/transform/route.ts`

```
1. Saņem foto + tēmu + sesijas kodu
2. Validē: sesija aktīva, tēma atļauta, faila izmērs
3. Augšupielādē oriģinālu Storage
4. Ieraksta photos (status: processing)
5. Sauc fal.ai
6. Saglabā rezultātu Storage, atjauno photos (status: done, ms_taken)
7. Realtime paziņo TV automātiski
```

**Oriģinālu augšupielādē pirms pārveides** un `photos` ierakstu izveido uzreiz — tā TV var rādīt "apstrādājas" vietturi, un viesis redz, ka kaut kas notiek.

**Ja fal.ai krīt:** `status = failed`, viesim skaidrs paziņojums un poga "Mēģināt vēlreiz". TV to nerāda. Sesija turpinās.

**Taimauts 25 sekundes.** Ilgāk gaidīt nav jēgas — labāk kļūda un atkārtojums.

**Rate limit:** 10 pārveides uz IP 10 minūtēs. Aizsardzība pret vienu cilvēku, kas nostāv pie TV visu vakaru.

### Tēmas

`lib/themes.ts` — kodā, ne DB. Tie mainās bieži un jāversionē Gitā.

```ts
export type Theme = {
  id: string;
  name: { lv: string; en: string; ru: string };
  prompt: string;
  strength: number;        // cik stipri pārveido
  previewImage: string;
};
```

**MVP: trīs tēmas, ne piecas.** Katra prasa testēšanu un promptu slīpēšanu.

1. **Kāzu glamour** — Holivudas portrets, mīksts apgaismojums
2. **Supervaroņi** — bērnu ballītēm
3. **Retro Gatsby** — 20. gadu stils

**Sejas atpazīstamība ir svarīgāka par stilu.** Ja viesis sevi neatpazīst, produkts nestrādā — visa jēga ir "skaties, tas esmu es". `strength` regulē tieši to; sāc zemāk un cel, nevis otrādi.

---

## 6. VALODAS

LV / EN / RU no sākuma — viesi pasākumos ir dažādi.

Viesa lapa nosaka valodu pēc pārlūka, ar pārslēgu augšā. Tikai UI teksti; nav SEO, nav maršrutu prefiksu.

TV displejs — sesijas valodā, ko izvēlas operators.

---

## 7. PRIVĀTUMS

Sejas ir biometriskie dati. Nav malas gadījums.

- Piekrišana pirms pirmās augšupielādes
- **Automātiska dzēšana pēc 30 dienām** — Supabase cron, dzēš gan ierakstu, gan Storage failu
- Privātuma politikas lapa `/privatums`
- Sesijas beigās operators var dzēst visu uzreiz
- Bildes nav publiski pārlūkojamas — piekļuve tikai pa tiešo saiti

---

## 8. MVP TVĒRUMS

**Iekšā:**
- [ ] Sesijas izveide ar kodu
- [ ] TV displejs ar QR un dzīvo galeriju
- [ ] Viesa lapa: foto + tēma + rezultāts
- [ ] fal.ai pārveide, 3 tēmas
- [ ] Moderācija (slēpt bildi)
- [ ] Lejupielāde viesim
- [ ] Multi-tenant izolācija
- [ ] Piekrišana un 30 dienu dzēšana

**Ārā:** maksājumi, analītika, video, druka, klientu zīmola pielāgošana, publiska reģistrācija, e-pasta piegāde.

---

## 9. PIRMAIS TESTS

**Ne maksājošs klients.** Sava ballīte vai draugu pasākums.

Ko mērīt:
- Vidējais laiks no selfija līdz TV
- Cik cilvēku lietoja vairāk par vienu reizi
- Cik pārveižu neizdevās
- Vai kāds prasīja bildi noņemt

---

## 10. PRAKTISKIE RISKI

| Risks | Rīcība |
|---|---|
| **Pasākuma wifi nestrādā** | 4G routeris komplektā. Šis ir #1 iemesls, kāpēc šādas sistēmas krīt reālos pasākumos. |
| Neatbilstoša bilde uz TV | Moderācijas poga + fal.ai NSFW filtrs |
| Lēna pārveide | Vietturis TV uzreiz, rezultāts pievienojas |
| TV pārlūks vecs | Testē uz reāla TV, ne tikai Chrome. Bez ES2020+ funkcijām. |
| Vairāki cilvēki vienlaikus | Rinda ar ierobežotu paralēlismu, ne visi izsaukumi reizē |

---

## 11. BUILD

```bash
cd C:\Projekti\AiParty
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
npm install @supabase/supabase-js @fal-ai/serverless-client qrcode.react
npm run build      # LOKĀLI, pirms push
gh repo create infoailabspace-rgb/AiParty --private --source=. --push
vercel link && vercel --prod
```

Env: `SB_URL`, `SB_ANON_KEY`, `SB_SERVICE_ROLE_KEY`, `FAL_KEY`, `NEXT_PUBLIC_APP_URL`

---

## PIEŅEMŠANAS KRITĒRIJI

- [ ] Divas sesijas vienlaikus nejaucas
- [ ] Bilde parādās TV bez lapas pārlādes
- [ ] Vidējais laiks zem 15 sekundēm
- [ ] Seja atpazīstama visās trīs tēmās
- [ ] Slēptā bilde pazūd no TV uzreiz
- [ ] fal.ai kļūme nesabojā sesiju
- [ ] Realtime atjaunojas pēc savienojuma zuduma
- [ ] Piekrišanas ekrāns pirms pirmās augšupielādes
- [ ] `npm run build` tīrs lokāli
- [ ] Strādā uz reāla TV pārlūka

---

## VAJAG NO ROBERTA

1. **fal.ai API atslēga**
2. Trīs tēmu piemēru attēli (pēc testēšanas)
3. Anabella logo TV ekrānam
