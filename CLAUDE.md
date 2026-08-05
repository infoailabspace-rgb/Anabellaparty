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
| Framework | Next.js 16 App Router (React 19) |
| Valoda | TypeScript (strict) |
| Stils | Tailwind CSS v4 (bez `tailwind.config.ts` — tēma `app/globals.css` `@theme` blokā) |
| Animācijas | Framer Motion |
| Hostings | Vercel |
| DB (no SOLIS3) | Supabase |
| Maksājumi (no SOLIS4) | Stripe |
| E-pasts (no SOLIS4) | Resend |
| AI čats (no SOLIS3) | Anthropic API |

---

## ZELTA LIKUMI

1. **Faili TIEŠI mapes saknē.** Nekad ligzdota apakšmape. `C:\Projekti\Anabellaparty\app\page.tsx` — NE `Anabellaparty\anabella-mvp\app\page.tsx`.
2. **`npm run build` LOKĀLI pirms push.** Ja būvē lokāli — būvēsies Vercel. Ja nebūvē — NEPUSHOT.
3. **package.json tikai ar reāli importētām pakotnēm.** Nekādu "varbūt vēlāk vajadzēs". Pievieno pakotni tikai tajā solī, kad to sāc lietot.
4. **Nekad neizdomāt versiju numurus.** Instalē ar `npm install <pkg>` un ļauj npm ierakstīt reālo versiju.
5. **Latviešu UTF-8:** nekad PowerShell `-replace`. Tikai Node.js `fs` ar `utf8` vai pilns faila pārrakstīšana.
6. **Parādi plānu pirms izmaiņām.** Vienmēr.
7. **Pārbaudi faila reālo saturu** pirms piedāvā regex/replace.

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
/                                          Sākums
/foto-kaste/                               Foto kastes (3 kastes + īpašie bloki)
/foto-kaste/ai-foto/                       AI foto kaste
/piepusamas-atrakcijas/                    Piepūšamās atrakcijas
/svinibu-inventars/                        Svinību inventārs (HUB — 4 kategorijas)
/svinibu-inventars/audio-viesu-gramatas/   Audio/video viesu grāmatas
/svinibu-inventars/specefekti/             Specefekti
/svinibu-inventars/decomebeles/            Deco / mēbeles
/svinibu-inventars/kublsballa/             Kubli / pirts (tālr. 28286911, Jūrmalā)
/rezervet/                                 Rezervācija
/kontakti/                                 Kontakti
/faq/                                      BUJ
/musu-draugi/                              Mūsu draugi
/noteikumi/                                Nomas noteikumi
/privatuma-politika/                       Privātuma politika
/sikdatnu-politika/                        Sīkdatņu politika
```

Multilingua (no SOLIS5): `/en/...`, `/ru/...`. LV bez prefiksa.

**Produktu dati:** vienīgais patiesības avots ir `lib/products.ts` (SOLIS1B, ~38 produkti). Cenu tabula zemāk ir novecojusi — NElieto to, skaties `lib/products.ts`.

---

## PRODUKTI UN CENAS

| Produkts | Cena |
|---|---|
| SPOGULIS foto kaste | €260 / 2h + €110/h |
| INSTAGRAM foto kaste | €220 / 2h |
| Piepūšamā pils (balta) | €230 / 10h |
| Specefekti (dzirksteles) | €35 / 24h |
| Audio grāmata | €50 / pasākums |
| Piegāde Pierīgā | bez maksas |
| Piegāde ārpus | €0.50/km |

---

## TRACKING

- GTM: `GTM-WDQZZ5PG`
- FB Pixel: `896953122077848`

---

## SOLIŠU PLĀNS

| Solis | Saturs | Statuss |
|---|---|---|
| SOLIS0 | Setup, scaffold, home page, GitHub, Vercel LIVE | ✅ |
| SOLIS1 | Produktu lapas (4 gab.) | ✅ |
| SOLIS2 | Kontakti, FAQ, noteikumi, privātuma politika, cookie banner | ✅ |
| SOLIS3 | Supabase + AI čatbots | ⬜ |
| SOLIS4 | Rezervācija + Stripe 20% depozīts + Resend | ⬜ |
| SOLIS5 | Multilingua LV/EN/RU + SEO + schema.org | ⬜ |
| SOLIS6 | DNS pārslēgšana, GSC, GA4, LIVE | ⬜ |

---

## KĻŪDU VĒSTURE (nekad neatkārto)

| Kļūda | Iemesls | Risinājums |
|---|---|---|
| `No matching version @radix-ui/react-slot@^2.0.0` | Izdomāta versija | Nekad neraksti versijas no galvas |
| `Cannot find module 'next-intl/plugin'` | next.config.js importēja neinstalētu pakotni | Konfigs drīkst importēt tikai to, kas ir package.json |
| `Couldn't find any pages or app directory` | Faili bija ligzdotā apakšmapē | Faili TIEŠI saknē |
