# SOLIS7 — FĀZE 1 PABEIGTA ✅ (datu slānis + admin produktu CRUD)

**Datums:** 2026-08-06
**Mērķis:** Produkti → Supabase; Roberts/Aiva rediģē inventāru bez koda. Fāze 1.

**Izvēles:** Fāze 1 tagad · Aivai pilnas tiesības (viena `admin` loma) · LV tikai (shēma atbalsta 3 valodas).

---

## Kas izbūvēts (Fāze 1)

### Datu bāze
- Tabulas: `products`, `product_images`, `site_content`, `site_testimonials`, `site_clients`, `site_faqs`, `content_audit` + Storage buckets (`product-images`, `site-images`, `client-logos`).
- **RLS:** publiski lasa tikai `is_active`/`is_published`; raksta tikai admini (`is_admin()`).

### Migrācija
- `scripts/migrate-products.ts` (`npm run migrate-products`) — pieteicas kā admin, pārbauda ka tabula tukša (nedublē), pārnes `lib/products.ts` → `products` un `lib/faq.ts` → `site_faqs`.
- **Pārnests: 38 produkti + 16 BUJ.** Cenas verificētas (Ozols 220/2h +100/h, Spogulis 260, kubli 28286911).
- `lib/products.ts` **NAV dzēsts** — tas ir migrācijas avots + fallback.

### Datu slānis (ISR)
- `lib/catalog.ts` — async `getAllProducts/getProductsByCategory/getProductBySlug/getFeaturedProducts` lasa no DB (`Product` forma, LV), **ar fallback uz `lib/products.ts`**, ja DB tukša/nepieejama.
- Publiskās lapas ar `export const revalidate = 300` (ISR — ātras, DB sit reizi 5 min). Admin izmaiņas → `revalidatePath()` → atjaunojas uzreiz.
- **Pārslēgti uz DB:** visas produktu lapas, `/rezervet` (produkti padoti formai kā prop), rezervācijas kalkulators (`computeQuote(items, products)`), API `/api/booking`, čatbots (`/api/chat` + `chat-prompt`), admin pieteikumu skati.
- **Verificēts:** deaktivizēts produkts pazūd no cenas (API subtotal=0) → apstiprina DB-read.

### Admin produktu CRUD (`/admin/inventars`)
- Saraksts: filtrs pēc kategorijas, meklēšana, **aktīvs/neaktīvs slēdzis**, "Jauns produkts".
- Rediģēšana/jauns (`/admin/inventars/[id]`, `/jauns`): pamatinfo (nosaukums/tagline/apraksts LV, kategorija, iekļauts), **cenas** (tarifu rindas, stundas piemaksa, papildinājumi, contact_only), **specifikācijas**, aktīvs/izcelts. Slug auto-ģenerējas no LV nosaukuma, pārbauda unikalitāti.
- **Dzēšanas aizsardzība:** produktu pieteikumā **nevar** dzēst (`items @> [{slug}]` pārbaude) — tikai deaktivizēt.
- **`content_audit`** izmaiņu žurnāls (kas/kad/ko).

---

## Pieņemšanas kritēriji (Fāze 1)
- [x] Produkti Supabase, publiskās lapas lasa no turienes
- [x] ISR strādā (revalidate=300 + revalidatePath)
- [x] Pievienot / rediģēt / deaktivizēt / dzēst produktu
- [x] Produktu ar pieteikumiem nevar dzēst
- [x] Izmaiņu žurnāls
- [x] `npm run build` tīrs · `npm run migrate-products` idempotents
- [ ] Attēlu augšupielāde, galerijas secība — **Fāze 2**
- [ ] Lapas teksti / atsauksmes / klienti / BUJ admin — **Fāze 2**
- [ ] Čatbota zināšanu poga — nav vajadzīga (čatbots lasa DB katrā izsaukumā, nekas nav jāreindeksē)

---

## Fāze 2 — PABEIGTA ✅
- **Attēlu augšupielāde:** `components/admin/image-uploader.tsx` — klienta puses **canvas saspiešana (max 2000px, JPEG 0.85)** → Supabase Storage (`product-images/<slug>/<uuid>.jpg`). **Drag-to-reorder** + **vāka izvēle** (radio) + dzēšana (Storage + masīvs). Integrēts produkta formā ("Attēli" sekcija). Att. glabājas produkta `cover_image`+`gallery` kolonnās (publiskā galerija nemainās).
- **`/admin/saturs`** — `site_content` LV lauki (hero, par mums, statistika, piegāde, kontakti). Publiskie komponenti (Hero, About, ClientsMarquee, Testimonials, DeliveryNote, Kontakti) lasa no DB ar **fallback** uz esošo tekstu, ISR + revalidate.
- **`/admin/atsauksmes`**, **`/admin/klienti`** (ar logo augšupielādi max 400px), **`/admin/faq`** — pilns CRUD (pievienot/rediģēt/dzēst, publicēts/aktīvs, secība, vērtējums). Publiskās lapas + **čatbots** lasa no DB.
- Seed: 9 satura atslēgas, 4 atsauksmes, 8 klienti (BUJ jau Fāzē 1). RLS: admini raksta, publiski lasa aktīvos.
- **Verificēts:** publiskās lapas rāda DB saturu; admin raksta (RLS testadmin OK); anon rakstīt NEVAR (0 rindas); Storage upload OK.

## Palicis (nākotnē)
- EN/RU tulkojumi (ar multilingua soli).
- Nesaglabātu izmaiņu brīdinājums, `updated_at` vienlaicīgas rediģēšanas pārbaude (nice-to-have).

## Piezīmes
- Čatbots/kalkulators/lapas lieto DB — **cenu maiņa admin panelī atspoguļojas visur** (pēc revalidate).
- Migrācija palaista ar testa admin kontu. Reālais admin — skat. `SOLIS6-DONE.md`.
