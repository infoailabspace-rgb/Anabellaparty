# CLAUDE.md — Anabella Party

Pastāvīgais konteksts. Lasi šo pirms katra soļa.

---

## PROJEKTS

**Anabella Party** — pasākumu inventāra noma Latvijā (foto kastes, piepūšamās atrakcijas, specefekti, audio grāmata).

- Esošā lapa: www.anabellaparty.lv (Mozello) → jaunā: Next.js 14 + Vercel
- Īpašnieki: Roberts un Aiva Dimanti, Ķekava
- Kontakti: +371 29222761 (WhatsApp), info@anabellaparty.lv
- GitHub: `infoailabspace-rgb/Anabellaparty`
- Lokālais ceļš: `C:\Projekti\Anabellaparty\`

---

## STACK

| Slānis | Tehnoloģija |
|---|---|
| Framework | Next.js 14 App Router |
| Valoda | TypeScript (strict) |
| Stils | Tailwind CSS |
| Animācijas | Framer Motion |
| Hostings | Vercel |
| DB (no SOLIS3) | Supabase |
| E-pasts (no SOLIS3) | Resend |
| AI čats (no SOLIS5) | Anthropic API |

---

## ZELTA LIKUMI

1. **Faili TIEŠI mapes saknē.** Nekad ligzdota apakšmape. `C:\Projekti\Anabellaparty\app\page.tsx` — NE `Anabellaparty\anabella-mvp\app\page.tsx`.
2. **`npm run build` LOKĀLI pirms push.** Ja būvē lokāli — būvēsies Vercel. Ja nebūvē — NEPUSHOT.
3. **package.json tikai ar reāli importētām pakotnēm.** Nekādu "varbūt vēlāk vajadzēs". Pievieno pakotni tikai tajā solī, kad to sāc lietot.
4. **Nekad neizdomāt versiju numurus.** Instalē ar `npm install <pkg>` un ļauj npm ierakstīt reālo versiju.
5. **Latviešu UTF-8:** nekad PowerShell `-replace`. Tikai Node.js `fs` ar `utf8` vai pilns faila pārrakstīšana.
6. **Parādi plānu pirms izmaiņām.** Vienmēr.
7. **Pārbaudi faila reālo saturu** pirms piedāvā regex/replace.
8. **Skili atrodas `skills/` mapē projekta saknē.** Ceļi `/mnt/skills/...` šeit neeksistē — tie ir Linux konteinera ceļi. Vienmēr lieto relatīvos ceļus no projekta saknes.

---

## SKILI (`skills/` mapē)

| Skils | Kad lasīt |
|---|---|
| `skills/web-builder/SKILL.md` | Jebkuram frontend darbam — motion, performance, SEO, komerc-UI |
| `skills/frontend-design/SKILL.md` | Vizuālais virziens, tipogrāfija, izkārtojums |

---

## DIZAINS

```
--navy:      #1A3A4A   (primary)
--gold:      #D4A960   (accent)
--rose-gold: #E8A87C   (subtle)
--bg:        #0F1419   (fons)
--text:      #F5F5F0
```

- Virsraksti: **Space Grotesk** (bold, ģeometrisks)
- Teksts: **Inter**
- Cenas/kods: **JetBrains Mono**

Komponenti:
- Poga: zelta fons, melns teksts, hover glow
- Kartīte: navy fons, 2px zelta apmale, lift uz hover
- Navbar: sticky, blur, zelta border-bottom

---

## URL STRUKTŪRA (nemainīga, saglabā SEO)

```
/                        Sākums
/foto-kaste/             Foto kastes
/piepusamas-atrakcijas/  Piepūšamās atrakcijas
/svinibu-inventars/      Svinību inventārs
/rezervet/               Rezervācija
/kontakti/               Kontakti
/faq/                    BUJ
/musu-draugi/            Mūsu draugi
/noteikumi/              Nomas noteikumi
/privatuma-politika/     Privātuma politika
```

Multilingua (no SOLIS5): `/en/...`, `/ru/...`. LV bez prefiksa.

---

## PRODUKTI UN CENAS

| Produkts | Cena |
|---|---|
| SPOGULIS foto kaste | €260 / 2h + €110/h |
| INSTAGRAM foto kaste | €220 / 2h |
| Piepūšamā pils (balta) | €230 / 10h |
| Specefekti (dzirksteles) | €35 / 24h |
| Audio grāmata | €50 / pasākums |
| Piegāde Ķekavas novadā | bez maksas |
| Piegāde ārpus | €25 / 100 km (aprēķins turp-atpakaļ) |
| **Avanss** | **50% no kopsummas ar PVN** |
| **PVN** | Cenas norādītas **bez PVN 21%** |

Pilnais katalogs (40+ produkti) — `lib/products.ts`. Šī tabula ir tikai orientieris.

---

## TRACKING

- GTM: `GTM-WDQZZ5PG`
- FB Pixel: `896953122077848`

---

## SOLIŠU PLĀNS

| Solis | Saturs | Statuss |
|---|---|---|
| SOLIS0 | Setup, scaffold, home page, GitHub, Vercel LIVE | ✅ |
| SOLIS1 | Produktu lapas + kontakti | ✅ |
| SOLIS1B | Pilns produktu katalogs (40+ produkti), galerijas | ⬜ |
| SOLIS1C | Dizains, kustība, Par mums, klientu logo | ⬜ |
| SOLIS2 | FAQ, noteikumi, privātuma politika, sīkdatņu banneris | ⬜ |
| SOLIS3 | Rezervācijas lapa: inventāra izvēle, cenas kalkulators, anketa | ⬜ |
| SOLIS4 | Multilingua LV/EN/RU + SEO + schema.org | ⬜ |
| SOLIS5 | AI čatbots (Anthropic API + pgvector) | ⬜ |
| SOLIS6 | Admin panelis, DNS pārslēgšana, GSC, GA4, LIVE | ⬜ |

**Maksājumi:** tiešsaistes maksājumu NAV. Depozīts 50% tiek samaksāts ar pārskaitījumu pēc piedāvājuma apstiprināšanas. Stripe netiek izmantots.

---

## KĻŪDU VĒSTURE (nekad neatkārto)

| Kļūda | Iemesls | Risinājums |
|---|---|---|
| `No matching version @radix-ui/react-slot@^2.0.0` | Izdomāta versija | Nekad neraksti versijas no galvas |
| `Cannot find module 'next-intl/plugin'` | next.config.js importēja neinstalētu pakotni | Konfigs drīkst importēt tikai to, kas ir package.json |
| `Couldn't find any pages or app directory` | Faili bija ligzdotā apakšmapē | Faili TIEŠI saknē |
