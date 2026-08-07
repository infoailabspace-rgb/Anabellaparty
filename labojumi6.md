# LABOJUMI 6 — Klientu logo karuselis

Aizstāj tekstuālo "Mūsu klientu vidū" sadaļu ar logo lenti, kas pārvaldāma admin panelī.

---

## 1. KO NOŅEMT

Tekstuālo sadaļu ar nozaru grupām un "pill" formas nosaukumiem — pilnībā. Arī `lib/clients.ts` nozaru struktūru, ja tā tur ir.

Virsraksts paliek: **"Mums uzticas"** (vai "Mūsu klientu vidū" — izvēlies vienu un lieto konsekventi).

---

## 2. DATUBĀZE

Tabula `clients` jau eksistē. Pārliecinies, ka tajā ir:

```sql
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);
```

Ja `logo_url` trūkst — pievieno.

RLS: publiskā lasīšana tikai `is_active = true`; rakstīšana tikai `admin_users`.

---

## 3. ADMIN PANELIS

`/admin/klienti` jau eksistē, bet tam vajag logo augšupielādi.

**Katram klientam:**
- Nosaukums (nav tulkojams — īpašvārds)
- **Logo augšupielāde** uz Supabase Storage `client-logos/`
- Mājaslapas saite (neobligāta)
- Aktīvs slēdzis
- Drag-to-reorder secībai

**Logo apstrāde augšupielādē:**
- Pārmēro uz **augstumu 96px** (2× no rādīšanas izmēra Retina ekrāniem), platums proporcionāls
- PNG saglabā caurspīdīgumu — **nekonvertē uz JPEG**, citādi logo dabū baltu fonu uz navy
- SVG saglabā kā ir, bez apstrādes
- Maksimums 200 KB pēc apstrādes

**Priekšskatījums admin panelī uz navy fona**, ne balta — tā tu uzreiz redzi, vai logo tur vispār lasās. Balti logo uz navy pazūd; tumši logo arī.

---

## 4. KARUSELIS

`components/clients-marquee.tsx`

**Tīrs CSS, bez bibliotēkas:**

```css
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
```

- Logo masīvs renderēts **divreiz** pēc kārtas → cilpa nemanāma
- `animation: marquee 40s linear infinite`
- Hover → `animation-play-state: paused`
- Malās fade maska:
  ```css
  mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
  ```
- Logo augstums fiksēts **48px**, `object-fit: contain`, `width: auto`
- Atstarpe starp logo `gap-12` (48px)
- Pelēktoņos `opacity: 0.65`, hover → pilnās krāsās `opacity: 1`, pāreja 300ms
- Ja `website` ir, logo ir saite ar `rel="noopener noreferrer"` un `target="_blank"`

**Ātrums pēc logo skaita:** 40s der ~15 logo. Ja to ir vairāk, cilpa kļūst pārāk ātra. Aprēķini ilgumu no skaita:

```
duration = max(30, logoCount * 3) sekundes
```

**`prefers-reduced-motion`:** ritinājums izslēdzas, logo rādās statiskā centrētā režģī.

**Ja logo mazāk par 6:** nerāda karuseli, rāda centrētu rindu. Ritinošs karuselis ar trim logo izskatās tukšs.

**Ja logo nav vispār:** sadaļa netiek renderēta. Nekādu placeholderu, nekāda "drīzumā".

---

## 5. VEIKTSPĒJA

Logo ir zem ekrāna locījuma — `loading="lazy"` visiem. Nekādu `priority`.

Renderējot masīvu divreiz, otrā kopija ir `aria-hidden="true"` — ekrānlasītājs nedrīkst nolasīt visus nosaukumus divreiz.

Konteinerim `overflow-hidden`, citādi animācija rada horizontālo ritinājumu.

---

## 6. PĀRBAUDE

- [ ] Tekstuālā nozaru sadaļa noņemta
- [ ] `/admin/klienti` — logo augšupielāde strādā
- [ ] Priekšskatījums uz navy fona
- [ ] PNG caurspīdīgums saglabāts
- [ ] Karuselis ritinās vienmērīgi, cilpa nemanāma
- [ ] Hover aptur ritinājumu
- [ ] Malu fade strādā
- [ ] Mazāk par 6 logo → statiska rinda
- [ ] Bez logo → sadaļa nerādās
- [ ] Nav horizontālā ritinājuma mobilajā
- [ ] `prefers-reduced-motion` → statisks režģis
- [ ] Otrā kopija `aria-hidden`
- [ ] `npm run build` tīrs

---

## PIEZĪME ROBERTAM

Augšupielādē tikai tos logo, kuriem ir **atļauja**. Swedbank, SEB, Mango, Tupperware un McCann mēdz par to būt stingri. Ja atļaujas nav, tas klients vienkārši netiek pievienots — nevis pievienots un cerēts, ka nepamanīs.
