# GALERIJA — Pasākumu bildes katras sadaļas apakšā

**Mērķis:** Zem inventāra saraksta katrā kategoriju lapā — galerija ar reālām bildēm no pasākumiem. Iedvesmai, ne katalogam.

**Kāpēc tas strādā:** produktu foto rāda, kas tas ir. Pasākumu foto rāda, kā tas izskatās realitātē — ar cilvēkiem, gaismu, telpu. Tas ir tas, kas pārdod.

---

## 1. KUR

Katras kategoriju lapas **apakšā**, zem visiem produktiem, virs CTA:

```
/foto-kaste
/piepusamas-atrakcijas
/svinibu-inventars/audio-viesu-gramatas
/svinibu-inventars/specefekti
/svinibu-inventars/decomebeles
/svinibu-inventars/kublsballa
/foto-kaste/ai-foto
```

Un **sākumlapā** — jaukta galerija no visām kategorijām, virs CTA.

Virsraksts: **"No mūsu pasākumiem"** (LV/EN/RU).
Apakšvirsraksts: **"Iedvesmojies no reāliem pasākumiem, kur bijis mūsu inventārs."**

---

## 2. DATUBĀZE

Seko esošajam `site_*` paternam:

```sql
create table site_gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  storage_path text not null,
  category text,                    -- 'foto-kaste' | 'atrakcijas' | 'audio-video'
                                    -- | 'specefekti' | 'deco' | 'kubli' | 'ai-foto' | null
  caption jsonb,                    -- {lv,en,ru} — neobligāts
  alt jsonb,                        -- {lv,en,ru} — SEO un piekļūstamība
  sort_order int default 0,
  is_active boolean default true,
  is_featured boolean default false,  -- rādīt sākumlapā
  created_at timestamptz default now()
);

create index on site_gallery (category, sort_order);
```

RLS: publiskā lasīšana tikai `is_active`; raksts tikai `is_admin()`.

**`category` var būt `null`** — tad bilde parādās tikai sākumlapā, ne kategoriju lapās. Der vispārīgiem pasākumu kadriem.

---

## 3. ADMIN — `/admin/galerija`

Jauna sadaļa navigācijā.

**Augšupielāde:**
- Drag & drop, **vairāki faili vienlaikus** — Roberts pēc pasākuma iemet 20 bildes uzreiz
- Canvas saspiešana: max 1600px platums, JPEG 82, mērķis zem 300 KB
- Augšupielādes progress katram failam
- Uz Supabase Storage `site-images/gallery/`

**Pārvaldība:**
- Režģa skats ar filtru pa kategorijām
- Katrai bildei: kategorija (dropdown), paraksts (neobligāts, LV/EN/RU), alt teksts, aktīvs slēdzis, "rādīt sākumlapā" slēdzis
- Drag-to-reorder
- **Masveida darbības:** atzīmē vairākas → piešķir kategoriju / deaktivizē / dzēs. Bez tā 100 bilžu pārvaldīšana ir mokas.
- Dzēšot — dzēš arī Storage failu

**Alt teksts:** ja tukšs, ģenerē automātiski no kategorijas — "Foto kaste pasākumā" / "Photo booth at an event" / "Фотобудка на мероприятии". Tukšs `alt` ir SEO un piekļūstamības zaudējums, un 100 bildēm tos rakstīt ar roku neviens nedarīs.

---

## 4. PUBLISKAIS IZSKATS

**Masonry režģis**, ne vienāda augstuma kartītes. Pasākumu bildes ir dažādās proporcijās — piespiest tās kvadrātā nozīmē nogriezt cilvēkiem galvas.

```
Desktopā:  4 kolonnas
Planšetē:  3 kolonnas
Mobilajā:  2 kolonnas
```

Realizācija ar CSS `columns` (`columns-2 md:columns-3 lg:columns-4 gap-3`), ne JS bibliotēka. Bildēm `break-inside-avoid` un `mb-3`.

**Sākotnēji rāda 12 bildes.** Zem tām poga "Rādīt vairāk" (+12). Nekāda bezgalīgā ritinājuma — tas cīnās ar footeri un CTA.

**Lightbox:**
- Klikšķis atver pilnekrānā, tumšs fons
- Bultiņas pa kreisi/labi, klaviatūras bultiņas, Esc
- Mobilajā swipe
- Paraksts apakšā, ja ir
- Skaitītājs "7 / 24"
- Tas pats komponents, kas produktu galerijai, ja iespējams — nedublē kodu

**Kustība:** bildes parādās ar stagger fade-up, `once: true`. Hover — `scale: 1.03`, 300ms. Nekādu pelēktoņu.

**Veiktspēja:** visas `loading="lazy"`, nevienai `priority` — galerija ir lapas apakšā. `next/image` ar `sizes`.

**Ja bilžu nav** — sadaļa netiek renderēta vispār. Bez placeholderiem.

---

## 5. SĀKUMLAPA

Rāda tikai `is_featured = true` bildes, jauktas no visām kategorijām, maksimums 12. Bez "rādīt vairāk" — tā vietā poga "Skatīt visu inventāru" uz `/svinibu-inventars`.

---

## 6. SVARĪGI — PRIVĀTUMS

Pasākumu bildēs ir cilvēki. Divas lietas:

**Privātuma politikā** jāpapildina sadaļa: publicējam pasākumu fotogrāfijas mājaslapā un sociālajos tīklos; ja kāds nevēlas, lai viņa attēls tiek rādīts, var rakstīt uz [e-pasts], un attēls tiks noņemts.

**Praksē:** neaugšupielādē bildes, kur cilvēki ir atpazīstami tuvplānā un nav skaidra piekrišanas. Vispārējie kadri no pasākuma ir droši; portrets nav.

Tas ir GDPR jautājums, ne pieklājības — un tas ir tieši tāds gadījums, kur sūdzība nāk gadu vēlāk.

---

## 7. PĀRBAUDE

- [ ] Galerija katras kategoriju lapas apakšā
- [ ] Sākumlapā jauktā galerija (`is_featured`)
- [ ] `/admin/galerija` — vairāku failu augšupielāde vienlaikus
- [ ] Masveida kategorijas piešķiršana
- [ ] Automātiskais alt teksts, ja tukšs
- [ ] Masonry režģis, bildes nav nogrieztas
- [ ] "Rādīt vairāk" +12
- [ ] Lightbox: bultiņas, Esc, swipe, skaitītājs
- [ ] Bez bildēm sadaļa nerādās
- [ ] Visas `loading="lazy"`
- [ ] Privātuma politika papildināta
- [ ] Lighthouse nav kritis
- [ ] `npm run build` tīrs

---

## KO NEDARĪT

- Neinstalē masonry vai lightbox bibliotēku — CSS `columns` un `useState` pietiek
- Nelieto bezgalīgo ritinājumu
- Negriež bildes kvadrātā
- Nepievieno pelēktoņu efektu
