# SOLIS7 — Satura pārvaldība admin panelī

**Mērķis:** Roberts un Aiva pievieno, maina un dzēš inventāru, cenas, attēlus un tekstus lapā. Bez koda, bez deploy.

**Priekšnosacījumi:** SOLIS6 daļas A–C ✅ (admin autentifikācija strādā).

**Secība:** izpildi šo **pirms** SOLIS6 daļas D (DNS pārslēgšanas). Nav jēgas pārslēgt domēnu uz lapu, kuru nevar rediģēt.

**Pirms sāc:** izlasi `CLAUDE.md`. Parādi plānu. Gaidi apstiprinājumu.

---

## 1. ARHITEKTŪRAS MAIŅA

Produkti pārceļas no `lib/products.ts` uz Supabase.

**Kritiski — veiktspēja.** Ja katra lapa sit datubāzi katrā apmeklējumā, lapa kļūst lēna un Lighthouse krīt. Risinājums: ISR.

```ts
export const revalidate = 300;   // 5 minūtes
```

Lapa paliek statiska un ātra. Datubāzi sit reizi 5 minūtēs. Kad Aiva saglabā izmaiņas, admin izsauc `revalidatePath()`, un lapa atjaunojas uzreiz, negaidot 5 minūtes.

`lib/products.ts` **nedzēs** — tas kļūst par migrācijas avotu (3. punkts) un paliek Gitā kā vēsturisks dublējums.

---

## 2. DATUBĀZE

```sql
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category text not null,
  sort_order int default 0,
  is_active boolean default true,
  is_featured boolean default false,

  -- saturs pa valodām
  name jsonb not null,          -- {"lv":"...","en":"...","ru":"..."}
  tagline jsonb,
  description jsonb,
  includes jsonb,               -- {"lv":["..."],"en":[...],"ru":[...]}

  -- cenas
  tiers jsonb not null,         -- [{"duration":"2h","price":220}]
  hourly_extra numeric,
  add_ons jsonb,                -- [{"name":{...},"price":30,"unit":"gb"}]
  contact_only boolean default false,

  -- tehniskais
  specs jsonb,                  -- [{"label":{...},"value":"6 × 5 × 5 m"}]
  alt_phone text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products on delete cascade,
  url text not null,
  storage_path text not null,
  alt jsonb,
  sort_order int default 0,
  is_cover boolean default false,
  created_at timestamptz default now()
);

create table site_content (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,     -- 'home.hero.title', 'about.body'
  value jsonb not null,         -- {"lv":"...","en":"...","ru":"..."}
  content_type text default 'text',   -- text | richtext | image | number
  updated_at timestamptz default now()
);

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  event_type text,
  rating int default 5,
  text jsonb not null,
  is_published boolean default false,
  sort_order int default 0
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website text,
  sort_order int default 0,
  is_active boolean default true
);

create table faqs (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  question jsonb not null,
  answer jsonb not null,
  sort_order int default 0,
  is_published boolean default true
);
```

**RLS:** publiskā lasīšana tikai `is_active`/`is_published` ierakstiem. Rakstīšana tikai `admin_users`.

---

## 3. MIGRĀCIJA

`scripts/migrate-products.ts` — vienreizējs:

1. Nolasa `lib/products.ts`
2. Ieraksta `products` tabulā
3. Tāpat `lib/faq.ts` → `faqs`
4. Izdrukā, cik ierakstu izveidots

**Pirms palaišanas** pārbaudi, ka tabula tukša — skripts nedrīkst dublēt datus, ja to palaiž divreiz.

Pēc migrācijas visi komponenti lasa no Supabase, ne no `lib/products.ts`.

---

## 4. ATTĒLU PĀRVALDĪBA

### Supabase Storage

Buckets:
```
product-images/    publisks lasīšanai
site-images/       publisks lasīšanai
client-logos/      publisks lasīšanai
```

### Augšupielāde

Admin panelī drag & drop zona. Katram attēlam:

1. **Klienta pusē pārveido pirms augšupielādes** — `canvas`, max 2000px platums, JPEG kvalitāte 85. 8 MB foto no telefona kļūst par ~400 KB. Bez šī Aiva augšupielādēs 12 MB failus un lapa kļūs lēna.
2. Validācija: tikai `jpg`/`png`/`webp`, max 10 MB pirms pārveides
3. Augšupielāde Storage ar ceļu `<product-slug>/<uuid>.jpg`
4. Ieraksts `product_images`

**Galerijas pārvaldība:**
- Sīktēlu režģis ar drag-to-reorder
- Vāka attēla izvēle (radio)
- Dzēšana ar apstiprinājumu — dzēš gan Storage failu, gan ierakstu
- Alt teksts katram attēlam trīs valodās (SEO un piekļūstamība)

Augšupielādes progress redzams. Vairāki faili vienlaikus.

---

## 5. ADMIN SASKARNE

```
/admin/inventars              produktu saraksts
/admin/inventars/jauns        jauns produkts
/admin/inventars/[id]         rediģēšana
/admin/saturs                 lapas teksti
/admin/atsauksmes             atsauksmes
/admin/klienti                klientu logo
/admin/faq                    BUJ
```

### 5.1 Produktu saraksts

Tabula: vāka attēls, nosaukums, kategorija, cena, aktīvs/neaktīvs, darbības.

- Filtrs pēc kategorijas
- Meklēšana
- Drag-to-reorder secībai
- **Aktīvs/neaktīvs slēdzis** — neaktīvs produkts pazūd no publiskās lapas, bet dati paliek. Tas ir tas, ko vajag sezonāliem produktiem, nevis dzēšana.
- Dublēšana ("Kopēt") — jauna atrakcija bieži atšķiras tikai ar izmēriem un cenu

### 5.2 Produkta rediģēšana

Cilnes: **Pamatinfo · Cenas · Attēli · Specifikācijas · SEO**

**Pamatinfo:** slug, kategorija, nosaukums / tagline / apraksts trīs valodās (valodu cilnes lauku iekšienē)

**Cenas:** tarifu saraksts (pievieno/dzēš rindas), stundas piemaksa, papildinājumi, `contact_only` slēdzis

**Attēli:** 4. punkta saskarne

**Specifikācijas:** atslēga-vērtība pāri (Izmēri, Vecums, Svars)

**SEO:** meta title un description trīs valodās. Tukši → ģenerē automātiski no nosaukuma un cenas.

**Priekšskatījums** — poga, kas atver produktu publiskajā lapā jaunā cilnē.

**Saglabāšana:** validācija pirms, skaidra kļūdas ziņa, `revalidatePath()` pēc.

### 5.3 Jauns produkts

Tā pati forma, tukša. Slug ģenerējas no LV nosaukuma automātiski (`Baltā pils XL` → `balta-pils-xl`), bet ir rediģējams. Pārbauda unikalitāti.

### 5.4 Dzēšana

Divpakāpju: apstiprinājums ar produkta nosaukumu jāieraksta.

**Ja produkts ir kādā pieteikumā** — nedzēš, tikai deaktivizē. Citādi vecie pieteikumi zaudē datus. Parāda: *"Šis produkts ir 12 pieteikumos. Vari to deaktivizēt, bet ne dzēst."*

### 5.5 Lapas teksti

`site_content` atslēgas ar cilvēklasāmiem nosaukumiem:

| Atslēga | Kur |
|---|---|
| `home.hero.title` | Sākumlapas virsraksts |
| `home.hero.subtitle` | Apakšvirsraksts |
| `about.body` | Par mums teksts |
| `about.stats.events` | Pasākumu skaits |
| `about.stats.since` | Dibināšanas gads |
| `contact.hours` | Darba laiks |
| `delivery.note` | Piegādes piezīme |

Grupēts pa lapām. Katrs lauks ar trim valodu cilnēm. Garākiem tekstiem — vienkāršs rich text (treknraksts, slīpraksts, saraksti, saites). **Neinstalē smagu redaktoru** — `contenteditable` ar dažām pogām pietiek.

---

## 6. ATSAUKSMES, KLIENTI, BUJ

**Atsauksmes:** pievienot/rediģēt/dzēst, publicēts slēdzis, secība, vērtējums 1–5. Nepublicētas neparādās.

**Klienti:** logo augšupielāde, nosaukums, mājaslapa, secība, aktīvs slēdzis. Logo automātiski pārveido uz max 400px platumu.

**BUJ:** jautājums un atbilde trīs valodās, kategorija, secība, publicēts slēdzis.

**Pēc BUJ vai produktu izmaiņām čatbota zināšanu bāze noveco.** Admin panelī poga *"Atjaunot čatbota zināšanas"*, kas palaiž indeksēšanu (SOLIS5). Alternatīvi — automātiski pēc saglabāšanas, ja tas nav pārāk lēni.

---

## 7. DROŠĪBA UN ROBUSTUMS

| Risks | Aizsardzība |
|---|---|
| Nejauša dzēšana | Divpakāpju apstiprinājums, deaktivizēšana kā noklusējums |
| Nesaglabātas izmaiņas | Brīdinājums, aizverot lapu ar nesaglabātām izmaiņām |
| Vienlaicīga rediģēšana | `updated_at` pārbaude — ja ieraksts mainīts kopš atvēršanas, brīdina |
| Salauzts JSON | Validācija serverī, nekad neuzticas klienta struktūrai |
| Milzu attēli | Klienta puses pārveide + servera puses izmēra pārbaude |
| Storage aizpildās | Dzēšot produktu, dzēš arī tā attēlus no Storage |

**Izmaiņu žurnāls:**

```sql
create table content_audit (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  action text not null,          -- create | update | delete
  entity text not null,          -- product | content | faq
  entity_id text,
  changes jsonb,
  created_at timestamptz default now()
);
```

Kad divi cilvēki rediģē, un cena pēkšņi ir nepareiza, šis ir vienīgais veids uzzināt, kas notika.

---

## 8. BUILD UN PĀRBAUDE

```bash
npm run migrate-products
npm run build
npm run dev
```

Pārbaudi:
- Migrācija pārnesa visus produktus, cenas sakrīt
- Publiskās lapas rāda datus no Supabase
- Jauns produkts parādās publiskajā lapā pēc saglabāšanas
- Attēla augšupielāde strādā, liels fails tiek saspiests
- Deaktivizēts produkts pazūd no publiskās lapas
- Produktu ar pieteikumiem nevar dzēst
- Teksta maiņa sākumlapā parādās uzreiz
- Rezervācijas kalkulators lieto jaunās cenas
- Lighthouse nav pasliktinājies (ISR strādā)
- Aiva var to izdarīt bez tavas palīdzības — **šis ir īstais tests**

```bash
git add .
git commit -m "SOLIS7: satura pārvaldība admin panelī"
git push
```

---

## PIEŅEMŠANAS KRITĒRIJI

- [ ] Produkti Supabase, publiskās lapas lasa no turienes
- [ ] ISR strādā, Lighthouse nav kritis
- [ ] Pievienot / rediģēt / deaktivizēt / dzēst produktu
- [ ] Attēlu augšupielāde ar automātisku saspiešanu
- [ ] Galerijas secība maināma
- [ ] Lapas teksti rediģējami trīs valodās
- [ ] Atsauksmes, klienti, BUJ pārvaldāmi
- [ ] Čatbota zināšanu atjaunošanas poga
- [ ] Izmaiņu žurnāls
- [ ] Produktu ar pieteikumiem nevar dzēst
- [ ] `npm run build` tīrs

---

## `[JĀAPSTIPRINA]` — Robertam

1. Vai Aivai vajag pilnas tiesības, vai tikai satura rediģēšana bez cenu maiņas?
2. Vai tulkojumus EN/RU pievienos manuāli, vai vajag pogu "Tulkot ar AI"?

---

## KO NEDARĪT

- Neinstalē CMS bibliotēku (Payload, Sanity, Strapi) — Supabase un React formas pietiek
- Neinstalē smagu rich text redaktoru
- Nenoņem ISR — bez tā lapa kļūst lēna
- Nedzēs `lib/products.ts` — tas ir migrācijas avots un dublējums
- Neļauj dzēst produktus, kas ir pieteikumos
