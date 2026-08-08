# BLOGS — AI palīgs, ne AI publicētājs

**Mērķis:** Roberts iemet bildi un trīs teikumus par pasākumu → AI uzraksta melnrakstu → Roberts izlabo → publicē.

**Priekšnosacījumi:** galerija ✅, Anthropic API jau projektā (čatbots).

**Pirms sāc:** izlasi `CLAUDE.md`. Parādi plānu. Gaidi apstiprinājumu.

---

## PAMATPRINCIPS

**Nekādas "ģenerēt un publicēt" pogas.** Melnraksts vienmēr iet caur rediģēšanu.

Iemesls nav filozofisks. Google 2024. gadā sāka aktīvi pazemināt tukšu AI saturu — ne tāpēc, ka to raksta mašīna, bet tāpēc, ka visi raksti izklausās vienādi un neko konkrētu nepasaka. Vērtību dod tas, ko AI nezina: cik viesu, kurā pilī, cik izdrukas, kas notika.

Tāpēc plūsmā ir obligāts solis, kur Roberts ieliek divas konkrētas rindas.

**Valoda: tikai LV sākumā.** Blogs nes vietējo meklēšanas trafiku; EN/RU dubulto darbu bez pierādīta pieprasījuma. Shēma atbalsta trīs valodas, lauki paliek tukši.

---

## 1. DATUBĀZE

```sql
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,

  title jsonb not null,          -- {lv,en,ru}
  excerpt jsonb,                 -- 1-2 teikumi sarakstam un OG
  content jsonb not null,        -- markdown
  meta_description jsonb,

  cover_url text,
  cover_alt jsonb,
  gallery jsonb default '[]',    -- papildu bildes rakstā

  category text,                 -- 'kazas'|'berni'|'korporativie'|'padomi'|'jaunumi'
  tags text[],
  related_products text[],       -- produktu slug masīvs

  status text default 'draft',   -- draft | review | published
  published_at timestamptz,
  ai_generated boolean default false,
  edited_after_ai boolean default false,

  view_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index on blog_posts (status, published_at desc);
create index on blog_posts (category);
```

RLS: publiskā lasīšana tikai `status = 'published'` un `published_at <= now()`; raksts tikai `is_admin()`.

`edited_after_ai` — ja `ai_generated = true` un `edited_after_ai = false`, publicēšanas poga rāda brīdinājumu. Ne bloķē, bet atgādina.

---

## 2. ĢENERĒŠANAS PLŪSMA

`/admin/blogs/jauns`

### Solis 1 — Roberts ievada

| Lauks | Piemērs | Obligāts |
|---|---|---|
| Bildes | 1–5 no pasākuma | ✅ |
| Pasākuma veids | Kāzas / Bērnu ballīte / Korporatīvais / Jubileja | ✅ |
| Vieta | "Cēsu pils" | — |
| Viesu skaits | 80 | — |
| Izmantotais inventārs | SPOGULIS, Baltā pils XL (multi-select no kataloga) | ✅ |
| **Tavas piezīmes** | "Zelta rāmis, 340 izdrukas līdz pusnaktij, līgava gribēja retro filtru" | ✅ |
| Raksta tips | Pasākuma stāsts / Padomi / Jaunums | ✅ |

**Piezīmes ir obligātas un vismaz 20 zīmes.** Bez tām AI raksta tukšumu, un tā ir visa problēma.

### Solis 2 — AI ģenerē

`app/api/blog/generate/route.ts`, `claude-sonnet-4-6`.

Kontekstā iet: Roberta piezīmes, izvēlētie produkti ar reāliem aprakstiem un cenām no DB, pasākuma dati, uzņēmuma tonis no "Par mums".

Atgriež JSON: `title` (3 varianti), `excerpt`, `content` (markdown), `metaDescription`, `suggestedTags`.

**Sistēmas prompta būtība:**

```
Tu raksti Anabella Party blogam. Anabella iznomā svētku inventāru Latvijā.
Īpašnieki — Aiva un Roberts Dimanti, kuri atstāja stabilus darbus, lai darītu to, kas patīk.

TONIS: silts, personisks, konkrēts. Kā stāsts draugam, ne kā reklāma.
Latviešu valoda, nekļūdīga gramatika, pareizi garumzīmes un mīkstinājuma zīmes.

NOTEIKUMI:
- Balsties TIKAI uz dotajām piezīmēm un produktu datiem. Neizdomā detaļas.
- Nekādu tukšu frāžu: "neaizmirstams", "īpašs mirklis", "padarīs jūsu pasākumu
  neaizmirstamu". Ja teikumu var ielikt jebkurā citā rakstā — izmet.
- Konkrētība pār emocijām. "340 izdrukas līdz pusnaktij" ir vērtīgāk par
  "viesi bija sajūsmā".
- 400–700 vārdi. Īsi teikumi. Rindkopas 2–4 teikumi.
- Nesola konkrētus datumus vai pieejamību.
- Cenas min tikai tad, ja tās ir dotajos datos.
- Struktūra: ievads (kas notika) → detaļas (kā tas izskatījās) →
  praktisks padoms lasītājam → maigs aicinājums.
- Aicinājums viens, raksta beigās. Ne katrā rindkopā.

NERAKSTI: "Vai vēlaties, lai jūsu pasākums būtu neaizmirstams?" un tamlīdzīgi.
```

Modeļa temperatūra augstāka nekā čatbotam — tekstiem vajag variāciju.

### Solis 3 — Rediģēšana

Melnraksts atveras redaktorā. **Šo soli nevar izlaist.**

- Markdown redaktors ar priekšskatījumu blakus
- Virsraksta izvēle no 3 variantiem vai savs
- Bildes ievietojamas tekstā
- **"Pārģenerēt sadaļu"** — atzīmē rindkopu, dod norādi ("konkrētāk", "īsāk"), pārraksta tikai to
- Vārdu skaits un lasīšanas laiks
- Saistītie produkti — automātiski no ievades, maināmi

Kad Roberts kaut ko izmaina, `edited_after_ai = true`.

### Solis 4 — SEO un publicēšana

- Slug ģenerējas no virsraksta, rediģējams
- Meta description ar zīmju skaitītāju (mērķis 150–160)
- Kategorija, tagi
- Vāka attēls no augšupielādētajām bildēm
- OG priekšskatījums — kā izskatīsies Facebook un WhatsApp
- Statuss: melnraksts / publicēts / plānots ar datumu

Ja `ai_generated && !edited_after_ai` — brīdinājums: *"Šis teksts nav rediģēts. AI melnraksti bez cilvēka pieskāriena parasti izklausās tukši. Vai tiešām publicēt?"*

---

## 3. PUBLISKĀ DAĻA

```
/blogs                    saraksts ar kategoriju filtru
/blogs/<slug>             raksts
/blogs/kategorija/<cat>   kategorijas arhīvs
```

**Saraksts:** kartītes ar vāka attēlu, virsrakstu, izvilkumu, datumu, lasīšanas laiku. 9 lapā, tad "Rādīt vairāk".

**Raksts:**
- Vāka attēls pilnā platumā
- Virsraksts, datums, lasīšanas laiks
- Saturs — tipogrāfija lasīšanai: `max-w-[68ch]`, `text-lg`, `leading-relaxed`
- Bildes tekstā ar lightbox
- Zem raksta: **saistītie produkti** ar cenām un pogu "Rezervēt" → `/rezervet?item=<slug>`
- Dalīšanās pogas: Facebook, WhatsApp, kopēt saiti
- 3 saistītie raksti

**Saistītie produkti ir tas, kas pārvērš lasītāju par klientu.** Cilvēks izlasa par kāzām Cēsu pilī, redz SPOGULI ar cenu un pogu — tas ir tuvāk pieteikumam nekā jebkas cits blogā.

**SEO:** `Article` schema (headline, image, datePublished, author, publisher), `BreadcrumbList`, OG ar vāka attēlu, sitemap papildināts ar rakstiem, RSS `/blogs/rss.xml`.

---

## 4. DALĪŠANĀS SOC TĪKLOS

Pēc publicēšanas admin panelī parādās gatavi teksti kopēšanai:

**Facebook** — 2–3 teikumi + saite. Personisks tonis.
**Instagram** — īsāks, ar rindiņu pārtraukumiem un 5–8 tagiem (`#kazaslatvija #fotokaste #anabellaparty`).
**WhatsApp** — viens teikums + saite, ģimenes čatiem.

Tos ģenerē tas pats API izsaukums kā rakstu — tie ir gandrīz bez maksas un ietaupa Robertam 10 minūtes katrreiz.

Kopēšanas poga katram.

---

## 5. IZMAKSAS UN LIMITI

Viens raksts ~4000 izvades tokenu ≈ €0.06. Pat 20 rakstu mēnesī ir zem €1.50.

Bet: rate limit `/api/blog/generate` — 10 ģenerēšanas stundā uz admin lietotāju. Aizsardzība pret cilpu, ne pret Robertu.

---

## 6. PĀRBAUDE

- [ ] Ģenerēšana ar reāliem datiem dod lasāmu tekstu
- [ ] Bez piezīmēm nevar ģenerēt
- [ ] "Pārģenerēt sadaļu" strādā
- [ ] Nerediģēts AI teksts rāda brīdinājumu
- [ ] Publicēts raksts redzams `/blogs`
- [ ] Melnraksts nav publiski redzams
- [ ] Saistītie produkti ar pareizām cenām
- [ ] Deep link `/rezervet?item=` strādā
- [ ] Soc tīklu teksti ģenerējas
- [ ] `Article` schema validējas
- [ ] Sitemap satur rakstus
- [ ] Latviešu diakritika pareiza
- [ ] Lighthouse nav kritis
- [ ] `npm run build` tīrs

---

## KO NEDARĪT

- Nekādas "ģenerēt un publicēt" pogas
- Neinstalē smagu redaktoru — markdown textarea ar priekšskatījumu pietiek
- Neģenerē EN/RU, kamēr nav pieprasījuma
- Neliec AI izdomāt cenas, datumus vai pasākumu detaļas
- Nepublicē klientu vārdus bez atļaujas
- Nelieto `author` schema ar izdomātu vārdu — autors ir uzņēmums vai Roberts

---

## PIEZĪME PAR BILDĒM

Uz bloga bildēm attiecas tas pats, kas uz galeriju: tur ir cilvēki. Vispārīgi pasākuma kadri ir droši, atpazīstami portreti — nav. Privātuma politikas sadaļa jau papildināta galerijas solī, un tā sedz arī blogu.
