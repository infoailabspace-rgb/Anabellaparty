# SOLIS6 — A+B+C PABEIGTS ✅ · D (DNS) = RUNBOOK

**Datums:** 2026-08-06
**Mērķis:** Admin panelis, analītika, palaišana. DNS (D) jādara atsevišķi (maina dzīvo domēnu).

---

## A — Autentifikācija ✅
- `@supabase/ssr` — cookie sesijas; `middleware.ts` aizsargā `/admin/*` (bez sesijas → `/admin/login`).
- `admin_users` tabula + `is_admin()` (SECURITY DEFINER). **RLS pastiprināts:** `booking_requests` `select`/`update` tikai adminiem; anon `insert` (publiskā forma) paliek.
- `/admin/login` (Supabase Auth, e-pasts+parole). Nav publiskas reģistrācijas.
- Admin `noindex` + `robots.txt Disallow: /admin/`. Publiskais navbar/footer/čats admin lapās neparādās (`SiteFrame`).

## B — Pieteikumu pārvaldība ✅
- `/admin` — saraksts, **kārtots pēc pasākuma datuma**, filtri (statuss/datums/meklēšana), steidzamības krāsas (🔴<7d new, 🟡<30d new/contacted), jaunie treknrakstā. Statusa maiņa vienā klikšķī.
- `/admin/[id]` — kontakti (Zvanīt/WhatsApp/mailto), pasākums, inventārs ar cenām, piegāde, avanss, **cenas korekcija** (`final_total`), iekšējās piezīmes (autosave), statuss. Atzīmē `viewed_at`.
- `/admin/kalendars` — mēneša režģis, **inventāra konfliktu brīdinājums** (viens inventārs 2+ `confirmed` vienā datumā → sarkans).
- Migrācija: `final_total`, `viewed_at`.

## C — Analītika ✅ (kods; dashboardos jādara Robertam)
- `dataLayer` notikumi: `booking_started`, `booking_item_added`, `booking_step`, `booking_submitted` (value=summa), `contact_click` (globāls), `chat_opened`. Caur esošo GTM + Consent Mode (SOLIS2).
- FB Pixel `Lead` uz `booking_submitted` (tikai pēc mārketinga piekrišanas).
- `robots.txt` + `sitemap.xml` (16 lapas).
- **Robertam GA4/GSC panelī:** `booking_submitted` iestatīt kā konversiju; GSC pievienot īpašumu + iesniegt sitemap; Google Business Profile pārbaudīt.

---

## ADMIN KONTA IZVEIDE

**Pagaidu testa konts** (izveidots pārbaudei — nomaini/dzēs!):
`testadmin@anabellaparty.lv` / `AnabellaTest2026!`

**Īstā admin konta izveide** (ieteicamais ceļš):
1. Supabase → Authentication → Users → **Add user** (e-pasts + parole, "Auto Confirm").
2. Iekopē lietotāja `id` (UUID).
3. Pievieno `admin_users`: `insert into admin_users(id,email,name) values ('<uuid>','<epasts>','Roberts');`
4. **Dzēs testa kontu:** Supabase → Users → dzēs `testadmin@…`, un `delete from admin_users where email='testadmin@anabellaparty.lv';`

(Ja iedosi `service_role` atslēgu — varu izveidot īsto kontu un izdzēst testa kontu es.)

---

## D — DNS RUNBOOK (izpilda Roberts/tu — NE tajā pašā dienā, kad būvē; otrdienas rīts)

**Apstiprināts:** kanoniskā **`www.anabellaparty.lv`**; e-pasts ir uz domēna (`info@anabellaparty.lv`) → **MX ieraksti KRITISKI, tos NEDRĪKST mainīt.**

### Pirms
- [ ] **Pieraksti pašreizējos DNS ierakstus, īpaši MX un TXT** (SPF/DKIM).
- [ ] Mozello lapas dublējums; salīdzini vecos URL ar jauno sitemap.
- [ ] Vercel env produkcijā iestatīti (SB, ORS, ANTHROPIC; Resend, ja lieto).
- [ ] Rezervācijas forma pārbaudīta no gala līdz galam.

### Pārslēgšana
1. TTL registratorā samazini uz **300 s** (dienu iepriekš).
2. Vercel → Project → **Domains** → pievieno `anabellaparty.lv` UN `www.anabellaparty.lv`. Iestati **www kā primāro** (bez-www → 301 uz www).
3. Vercel parādīs vajadzīgos ierakstus. Registratorā nomaini **TIKAI**:
   - `www` **CNAME** → `cname.vercel-dns.com` (vai Vercel norādīto)
   - saknes `@` **A** → Vercel norādīto IP (parasti `76.76.21.21`)
4. **MX un TXT ierakstus ATSTĀJ neskartus** (e-pasts!).
5. Gaidi izplatīšanos (15 min–2 h). Pārbaudi: `dig www.anabellaparty.lv`, `dig anabellaparty.lv MX` (MX jāpaliek vecajam).

### Pēc (1. stundā)
- [ ] Lapas atveras uz `www.anabellaparty.lv`, HTTPS sertifikāts izsniegts.
- [ ] Forma nosūta pieteikumu; **nosūti sev testa e-pastu — e-pasts joprojām strādā**.
- [ ] GA4 reāllaikā rāda apmeklējumus.
- [ ] Atjaunini `NEXT_PUBLIC_SITE_URL` Vercel uz `https://www.anabellaparty.lv` (OG/sitemap/e-pastu logo).

### 1. nedēļā
- [ ] GSC — nav Coverage kļūdu; pieprasi pārindeksēšanu.
- [ ] Vercel logos pārbaudi 404, salabo trūkstošos URL.
- [ ] **Mozello lapu neatslēdz 2 nedēļas** (drošības tīkls).

---

## PĀRBAUDES (E) — pēc A–C
- [x] Admin aizsargāts, `noindex`, publiskais chrome nerādās
- [x] Pieteikumi kārtoti pēc pasākuma datuma, statusa maiņa, kalendāra konflikts
- [x] Auth+RLS pārbaudīts (login OK, is_admin, admin redz/rediģē, anon bloķēts)
- [x] Analītikas notikumi + robots/sitemap
- [x] Build tīrs
- [ ] Lighthouse mobilajā (jāpārbauda ar reālu rīku pēc DNS)
- [ ] iPhone Safari / Android Chrome uz reālām ierīcēm (tavs uzdevums)

## `[JĀAPSTIPRINA]` / Robertam
1. Cik admin kontu — tikai Roberts, vai arī Aiva? (izveido kā augstāk)
2. GA4: `booking_submitted` kā konversija; GSC sitemap; Google Business.
3. Sarunu/rate-limit auto-dzēšana (Supabase cron >90 d) — SOLIS5 uzdevums, vēl nav.

## Env
`@supabase/ssr` pievienots. Admin panelis lieto **anon atslēgu + lietotāja sesiju** (ne service_role). `service_role` NAV lietotnē.
