# ANABELLA — Pēdējie labojumi + pilns audits pirms palaišanas

Divi konkrēti uzdevumi, tad pilns audits. Izpildi šajā secībā.

---

## UZDEVUMS 1 — Kubli/pirts ārā no kalkulatora

Kubli, pirtis un balles apkalpo partneris atsevišķi (cita atrašanās vieta — Jūrmala, cits telefons 28286911). Tie **nedrīkst** iet caur rezervācijas kalkulatoru un automātisko cenu aprēķinu — partneris pats zvana un vienojas.

1. `/rezervet` inventāra izvēlē — noņem "Kubli / pirts" kategoriju no izvēles pilnībā (kalkulators to vairs nerāda, nevar pievienot grozam)
2. `/svinibu-inventars/kublsballa` lapa **paliek** (produktu apraksti, cenas informatīvi), bet CTA uz šīs lapas jābūt **"Zvanīt +371 28286911"**, ne "Pievienot grozam" vai "Rezervēt"
3. Pārbaudi, vai `lib/products.ts` / DB kubli produkti ir atzīmēti tā, lai tie automātiski neparādās kalkulatorā (piemēram, `booking_excluded: true` vai kategorijas filtrs) — **nedzēs pašus produktu datus**, tikai izslēdz no rezervācijas plūsmas

---

## UZDEVUMS 2 — "Izklaides punkts" vietā kublu kategorijas kartītes

Sākumlapā/kategoriju sadaļā, kur šobrīd ir "Kubli / pirts" kartīte — aizvieto ar jaunu kartīti:

```
Nosaukums: Izklaides punkts
Apraksts: AI foto pārsteigumi un interaktīvas spēles jūsu pasākumam —
          drīzumā pieejams.
Karodziņš: "DRĪZUMĀ" (redzams uzlīme stūrī, kā jau ir sistēmā citiem
           neaktīviem elementiem)
```

- Kartīte **nav klikšķināma** uz pilnu lapu (nav vēl kur vest) — vai arī klikšķis ved uz vienkāršu "drīzumā" paziņojuma lapu
- Vizuāli tā pati kartīšu sistēma, kas pārējām (fona attēls/gradients, ikona) — ikonai izvēlies kaut ko saistītu ar spēlēm/izklaidi (nevis atkārtot foto kastes ikonu)
- Kad "Izklaides punkts" būs gatavs, karodziņu un klikšķināmību ieslēgs atsevišķā solī — šeit tikai sagatavo vietu

**Kubli/pirts kartīte** kā tāda pazūd no kategoriju galerijas (jo tie tagad ir "zvaniet partnerim", nevis pašapkalpošanās produkts ar kalkulatoru) — bet pati `/svinibu-inventars/kublsballa` lapa un tās saturs paliek pieejama, ja kāds to atrod caur meklēšanu vai tiešo linku.

---

## UZDEVUMS 3 — PILNS AUDITS

Izej cauri VISAI publiskajai lapai un admin panelim. Nekas netiek pieņemts — katrs punkts jāpārbauda pret reālo kodu/DB, ne pēc atmiņas no iepriekšējām sarunām.

### A. Publiskā lapa — pilnīgums

Katrai lapai (LV/EN/RU): vai atveras, vai saturs pilnīgs, vai nav `[JĀAPSTIPRINA]`/placeholder tekstu, vai attēli ielādējas.

```
/, /foto-kaste, /foto-kaste/ai-foto, /piepusamas-atrakcijas,
/svinibu-inventars + 4 apakšlapas, /rezervet, /kontakti, /faq,
/musu-draugi, /noteikumi, /privatuma-politika, /sikdatnu-politika,
/blogs + raksti
```

### B. Rezervācijas plūsma — gala pārbaude

- Kalkulators pēc kublu izņemšanas — cenas joprojām pareizas pārējam inventāram
- PVN attēlojums pareizs
- Piegādes km aprēķins (ORS) strādā
- Telefons obligāts, validācija strādā
- Pieteikums nonāk Supabase
- E-pasti — skat. UZDEVUMU 4 zemāk

### C. Admin panelis — funkcionalitāte

- Pieteikšanās strādā ar reālo (ne testadmin) kontu
- `/admin/inventars` — CRUD, attēlu augšupielāde, EN/RU lauki
- `/admin/saturs`, `/admin/atsauksmes`, `/admin/klienti`, `/admin/partneri`, `/admin/faq`, `/admin/galerija`, `/admin/blogs`
- Pieteikumu saraksts — kārtošana, statusi, adreses salīdzinājums (klienta vs ģeokodētā)
- Vai testadmin konts vēl eksistē — ja jā, atgādini par dzēšanu

### D. DROŠĪBA

Šis nekad nav bijis pilnībā auditēts. Pārbaudi konkrēti:

- RLS politikas visām tabulām — vai publiskā lasīšana tiešām ierobežota uz `is_active`/`published`, vai rakstīšana tiešām prasa `is_admin()`
- Admin maršruti — vai `/admin/*` tiešām nesasniedzami bez autentifikācijas (mēģini piekļūt tieši bez login)
- API endpoints (`/api/booking`, `/api/distance`, `/api/blog/generate` u.c.) — vai tie validē ievadi servera pusē, vai paļaujas tikai uz klienta validāciju
- Rate limiting — vai tiešām strādā uz visiem publiskajiem endpoint (booking, distance, chat, blog generate)
- Vides mainīgie — vai neviens SECRET/SERVICE_ROLE/API atslēga nav noplūdusi klienta pusē (pārbaudi būvēto JS bundle, ne tikai kodu)
- CORS un headers — vai ir pamata drošības headeri (CSP, X-Frame-Options u.tml.) `next.config.ts`
- SQL injekcijas risks — ja kaut kur ir raw SQL (nevis Supabase klients ar parametrizētiem vaicājumiem)
- Robots/noindex uz `/admin` — jau bija plānots, apstiprini, ka strādā

### E. Veiktspēja

- Lighthouse mobilajā uz 3 galvenajām lapām (sākumlapa, produkta lapa, rezervet) — Performance, SEO, Accessibility
- Hero video/attēlu izmēri saprātīgi

---

## UZDEVUMS 4 — RESEND ATSLĒGA (kritiskais bloķētājs)

Šis ir vienīgā zināmā funkcionāli salauztā daļa visā projektā. Bez tā rezervācijas apstiprinājuma e-pasts klientam neaiziet.

Roberts — soli pa solim:

1. resend.com → ielogojies (vai izveido kontu)
2. API Keys → Create API Key → nosaukums "Anabella Party" → kopē
3. Pievieno Vercel Anabellaparty projektā: RESEND_API_KEY=re_...
4. Domēna verifikācija (lai e-pasti neietu tikai uz tavu paša adresi, bet uz jebkuru klientu):
   - Resend panelī → Domains → Add Domain → anabellaparty.lv
   - Parādīs DNS ierakstus (TXT, MX priekš return-path, CNAME priekš DKIM) — tie jāievada tur, kur pašlaik ir domēna DNS
   - Ja domēns vēl nav pārcelts — verifikāciju var izdarīt arī uz esošā DNS paneļa tagad, tas neietekmē vietnes darbību, tikai e-pasta sūtīšanu
5. Kad verificēts (var aizņemt līdz 24-48h DNS izplatībai) — atjauno RESEND_FROM uz info@anabellaparty.lv (vai apstiprināto adresi)

Līdz verifikācijai: e-pasti sūtās no onboarding@resend.dev un aiziet tikai uz tavu Resend reģistrācijas adresi — klients rezervācijas apstiprinājumu nesaņems. Tu gan saņemsi pieteikuma paziņojumu (tas strādā caur Supabase + admin paneli, neatkarīgi no Resend).

---

## REZULTĀTS

Pēc audita izpildes parādi man:

1. Tabulu ar visu pārbaudīto (kā iepriekšējos auditos)
2. Sarakstu ar to, kas reāli salauzts vai nepabeigts
3. Sarakstu ar drošības atradumiem, sagrupētu pēc smaguma (kritiski / vidēji / kosmētiski)

Neko nelabo audita laikā — tikai ziņo. Labojumus darīsim pēc tam, kā prioritātes sarakstu.
