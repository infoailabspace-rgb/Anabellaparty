# AI PARTY — SOLIS1: Tēmu bibliotēka, ieteikumi, personīgā galerija

**Priekšnosacījumi:** SOLIS0 ✅, fal.ai strādā, vismaz viens reāls tests izdarīts.

**Pirms sāc:** parādi plānu. Gaidi apstiprinājumu.

---

## ARHITEKTŪRAS MAIŅA — tēmas uz DB

solis0 teica tēmas turēt kodā, jo bija trīs. Tagad ir 25+, plus pielāgotas tēmas par maksu — katra jauna tēma nedrīkst nozīmēt deploy.

```sql
create table ai_themes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants on delete cascade,  -- null = globālā bibliotēka
  key text not null,
  name jsonb not null,              -- {lv,en,ru}
  category text not null,
  prompt text not null,
  negative_prompt text,
  strength numeric default 0.65,
  guidance numeric,
  preview_image text,
  is_custom boolean default false,  -- tenant pats izveidojis
  is_active boolean default true,   -- pieejama izvēlei
  created_at timestamptz default now()
);

create unique index on ai_themes (tenant_id, key);

create table session_themes (
  session_id uuid references sessions on delete cascade,
  theme_id uuid references ai_themes on delete cascade,
  primary key (session_id, theme_id)
);
```

**Sesijai izvēlas 6–8 tēmas no bibliotēkas**, ne visas. Operators to dara, veidojot sesiju — checkbox saraksts ar priekšskatījuma attēliem, sagrupēts pa kategorijām.

`lib/themes.ts` paliek kā **seed skripts** sākotnējai bibliotēkai, ne kā izpildlaika avots.

---

## 1. TĒMU BIBLIOTĒKA

25 tēmas, sagrupētas. Prompti ir melnraksti — **katrs jātestē pirms aktivizēšanas**, tāpat kā solis0 trim.

### Svētki un sezona
| Tēma | LV | EN |
|---|---|---|
| christmas | Ziemassvētki | Christmas |
| halloween | Helovīns | Halloween |
| newyear | Jaunais gads | New Year's Eve |
| valentine | Valentīndiena | Valentine's Day |

### Stils un laikmets
| Tēma | LV | EN |
|---|---|---|
| disco | Disko | Disco |
| gatsby | Retro Gatsby | Retro Gatsby *(jau MVP)* |
| neon80s | Neona 80. gadi | 80s Neon |
| renaissance | Renesanses glezna | Renaissance Portrait |
| steampunk | Steampunk | Steampunk |
| wildwest | Mežonīgie Rietumi | Wild West |
| pirates | Pirāti | Pirates |

### Fantāzija un piedzīvojums
| Tēma | LV | EN |
|---|---|---|
| wizard | Burvju skola | Wizard School *(jau MVP)* |
| fairytale | Pasaku tēli | Fairy Tale |
| royalty | Karaliskā dzimta | Royalty |
| mythology | Mitoloģija | Mythology |
| zombie | Zombiji | Zombie |
| adventure | Piedzīvojums | Adventure |

### Nākotne un kosmoss
| Tēma | LV | EN |
|---|---|---|
| future | Nākotne | Future |
| space | Kosmosa iekarotāji | Space Explorers |
| anime | Anime stils | Anime Style |

### Slava un statuss
| Tēma | LV | EN |
|---|---|---|
| superhero | Supervaroņi | Superheroes *(jau MVP)* |
| rockstar | Rokzvaigzne | Rockstar |
| moviestar | Kino zvaigzne | Movie Star |
| luxury | Luxury Life | Luxury Life |
| sportschamp | Sporta čempions | Sports Champion |

### Latviskais
| Tēma | LV | EN |
|---|---|---|
| folk | Tautiskais | Latvian Folk |

**Kāzu glamour** (jau MVP) paliek kā noklusējuma pirmā tēma visām sesijām.

**Seed skripts** `scripts/seed-themes.ts` ieraksta visas ar `tenant_id = null`, `is_active = false` — operators tās aktivizē pēc pirmā testa katrai.

---

## 2. OPERATORA TĒMU IZVĒLE

`/admin/sessions/jauna` — solis "Izvēlies tēmas":

- Bibliotēkas režģis pa kategorijām, priekšskatījuma attēls katrai
- Checkbox, ieteicamais maksimums 8 (brīdinājums, ja vairāk — "vairāk par 8 tēmām palēnina viesa izvēli")
- Ja tenantam ir pielāgotas tēmas (`is_custom = true`) — atsevišķa sadaļa augšā
- Izvēlētās saglabājas `session_themes`

**Kāpēc 8 ir robeža, ne ieteikums vien:** vairāk kartīšu telefona ekrānā nozīmē ritināšanu pirms izvēles, un tas tieši palēnina to rādītāju, kas visam produktam ir svarīgākais.

---

## 3. TĒMU IETEIKUMI NO VIESIEM

Vienkārša forma viesa lapā, zem tēmu izvēles vai apstiprinājuma ekrānā: **"Trūkst kādas tēmas? Ieteic!"**

```sql
create table theme_suggestions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions on delete set null,
  tenant_id uuid references tenants on delete cascade,
  text text not null,
  contact text,                     -- neobligāts, ja grib atbildi
  status text default 'pending',    -- pending | reviewed | added
  created_at timestamptz default now()
);
```

Viens teksta lauks, neobligāts kontakts, poga "Nosūtīt". Bez validācijas smagumiem — tas ir zemas-stakes ieteikums, ne pieteikums.

**Admin panelī** `/admin/ieteikumi` — saraksts, statusa maiņa, poga "Pārvērst par tēmu" (aizpilda jaunas tēmas formu ar ieteikuma tekstu kā sākumpunktu).

Rate limit: 5 ieteikumi uz IP dienā. Aizsardzība pret piebomobingu, ne pret reālu lietotāju.

---

## 4. PIELĀGOTAS TĒMAS — NOŅEMTS NO TVĒRUMA

Pielāgoto tēmu izveide klientam par maksu **netiek būvēta**. Bibliotēkas 25 tēmas ir tas, ko operators piedāvā. Ja vēlāk būs pieprasījums, to var pievienot atsevišķi.

---

## 5. SESIJAS GALERIJA — koplietots QR visiem dalībniekiem

**Prasība:** klients izvēlas galeriju (tēmu komplektu), samaksā, ballīte sākas. Visi 50 viesi izmanto **to pašu QR** — nav individuālu kontu vai kodu. Katrs, kas fotografējas, redz un lejupielādē savu bildi uzreiz pēc pārveides. Pēc sesijas beigām **visi dalībnieki** noteiktu laiku var atvērt to pašu QR un lejupielādēt jebkuru sesijas bildi, tad viss automātiski dzēšas.

Tas ir vienkāršāk nekā personīgais kods — un atbilst tam, kā QR faktiski tiek lietots pasākumā: viens kods uz plakāta vai TV, visi to skenē.

### Kā tas strādā

**Sesijas QR paliek derīgs arī pēc sesijas beigām**, līdz `gallery_expires_at`. Tas ir tas pats `/p/<code>` links, kas pasākuma laikā ved uz "uzņem foto", pēc beigām — uz galeriju.

```sql
alter table sessions
  add column gallery_expires_at timestamptz,   -- parasti +7 dienas pēc ends_at
  add column deleted_at timestamptz;           -- kad reāli izdzēsts
```

`gallery_expires_at` iestata operators, veidojot sesiju (noklusējums **10 dienas** pēc `ends_at`, izvēles: 7 / 10 / 14 dienas). Klients par to zina jau pērkot — "bildes pieejamas 10 dienas pēc pasākuma".

### `/p/<code>` uzvedība pēc statusa

| Sesijas statuss | Ko rāda `/p/<code>` |
|---|---|
| `active` | Uzņemt foto / izvēlēties tēmu (kā līdz šim) |
| `ended`, pirms `gallery_expires_at` | **Galerija**: visas sesijas bildes, masonry režģis, lightbox, "Lejupielādēt" katrai un "Lejupielādēt visas" (ZIP) |
| pēc `gallery_expires_at` vai `deleted_at` | "Šī pasākuma bildes vairs nav pieejamas" |

Nav atsevišķa `/mine` ceļa — viss notiek uz tā paša `/p/<code>`, jo tas ir tas, ko cilvēki reāli skenēs.

### Individuālais rezultāts pasākuma laikā

Pasākuma laikā katrs, kas tikko nofotografējās, joprojām **uzreiz redz savu bildi** (kā MVP) — tas nemainās. Atšķirība ir tikai tajā, ka pēc sesijas beigām tas pats QR atver **visu** sesijas galeriju, ne tikai pēdējo bildi.

`guest_id`/`device_token` sistēma no iepriekšējā melnraksta **atkrīt** — nav vajadzīga, jo piekļuve nav personīga, tā ir sesijas līmenī.

---

## 6. AUTOMĀTISKA DZĒŠANA PĒC TERMIŅA

```sql
-- pg_cron, reizi dienā
create or replace function expire_galleries()
returns void language plpgsql as $$
declare s record;
begin
  for s in
    select id from sessions
    where gallery_expires_at < now()
      and deleted_at is null
  loop
    -- dzēš Storage failus (edge funkcija vai atsevišķs worker)
    perform net.http_post(
      url := '<edge-function-url>/cleanup-session',
      body := jsonb_build_object('session_id', s.id)
    );
    update sessions set deleted_at = now() where id = s.id;
  end loop;
end;
$$;

select cron.schedule('expire-galleries', '0 3 * * *', 'select expire_galleries()');
```

Edge funkcija dzēš visus `photos` ierakstus un Storage failus (oriģinālus un pārveidotos) konkrētajai sesijai. Šis ir **tas pats mehānisms**, kas jau uzbūvēts 30 dienu individuālajai dzēšanai (SOLIS0) — atšķirība tikai termiņa avotā: agrāk `created_at + 30d`, tagad `sessions.gallery_expires_at`.

**Brīdinājums pirms dzēšanas:** operatoram e-pasts vai admin panelī iezīme "beidzas pēc 2 dienām", lai var pagarināt, ja klients lūdz. Pagarināšana — vienkārši maina `gallery_expires_at`.

---

## 7. OPERATORA IESTATĪJUMI

`/admin/sessions/jauna` papildus:

- **Galerijas pieejamības ilgums pēc pasākuma** — select: 7 / 10 / 14 dienas
- Redzams uzreiz sesijas kartītē: "Galerija pieejama līdz [datums]"
- Sesijas skatā — poga "Pagarināt par 7 dienām"

---

## 8. TV EKRĀNS UN DALĪŠANĀS

TV ekrānā pasākuma laikā un uz jebkura izdrukāta/parādīta QR paziņojuma: **"Skenē, lai redzētu un lejupielādētu VISAS šī pasākuma bildes — pieejamas [X] dienas pēc pasākuma."**

Tas pats QR strādā abos režīmos (uzņemšana / galerija) atkarībā no sesijas statusa — operatoram nekas papildus nav jādara.

---

## 9. BUILD UN PĀRBAUDE

```bash
npm run seed-themes    # ieraksta 25 tēmas ar is_active=false
npm run build
```

Pārbaudi:
- Jaunu sesiju veidojot, var izvēlēties tēmas no bibliotēkas un galerijas ilgumu
- Vairāk par 8 tēmām izvēloties, parādās brīdinājums
- Ieteikuma forma nosūta, parādās `/admin/ieteikumi`
- Pasākuma laikā `/p/<code>` rāda uzņemšanu; pēc `ended` — galeriju
- Galerijā redzamas VISAS sesijas bildes, ne tikai paša uzņemtās
- ZIP lejupielāde strādā
- Pēc `gallery_expires_at` — "vairs nav pieejamas"
- pg_cron dzēš gan DB ierakstus, gan Storage failus
- Operators var pagarināt termiņu
- Rate limits strādā

```bash
git add . && git commit -m "SOLIS1: tēmu bibliotēka, ieteikumi, koplietota sesijas galerija ar termiņa dzēšanu"
git push
```

---

## PIEŅEMŠANAS KRITĒRIJI

- [ ] 25 tēmas bibliotēkā, seed skripts idempotents
- [ ] Operators izvēlas aktīvās tēmas sesijai, brīdinājums virs 8
- [ ] Operators iestata galerijas pieejamības ilgumu, veidojot sesiju
- [ ] Viesi var ieteikt tēmas, redzamas admin panelī
- [ ] Viens QR strādā gan uzņemšanai (pasākuma laikā), gan galerijai (pēc beigām)
- [ ] Galerijā redz un lejupielādē VISU dalībnieku bildes, ne tikai savas
- [ ] Pēc termiņa — automātiska dzēšana (DB + Storage)
- [ ] Operators var pagarināt termiņu pirms dzēšanas
- [ ] Rate limiti uz ieteikumiem
- [ ] `npm run build` tīrs

---

## VAJAG NO ROBERTA

1. Katras jaunās tēmas prompts jāpārbauda ar reālu seju pirms aktivizēšanas — tas ir tavs darbs, ne automatizējams
2. Noklusējuma galerijas ilgums — 10 dienas, ar iespēju izvēlēties 7 vai 14 (apstiprināts)
3. Priekšskatījuma attēli tēmu bibliotēkai (var ģenerēt ar pašu sistēmu, kad tēmas testētas)

---

## KO NEDARĪT

- Nerāda visas 25 tēmas viesim uzreiz — tikai sesijai aktivizētās
- Neaktivizē tēmu bez testa
- Nebūvē klienta pašapkalpošanās tēmu ģenerēšanu — ārā no tvēruma
- Nebūvē personīgus kontus vai kodus — piekļuve ir sesijas līmenī, ar vienu QR
- Nedzēš bez brīdinājuma operatoram, ka termiņš tuvojas
