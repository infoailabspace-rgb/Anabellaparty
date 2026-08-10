# LANDING PĀRBŪVE — "Pasākumu Stacija": Foto + Spēles

**Skar divus projektus.** Izpildi secīgi, katru savā projekta mapē.

---

## DAĻA A — AI PARTY PROJEKTS

**Mērķis:** Landing vairs nav tikai par AI foto — tā ir "Pasākumu Stacija" ar divām skaidri nošķirtām aktivitātēm, kas abas ved uz to pašu konfiguratoru.

### A1. Nosaukums galvenē

Visur, kur šobrīd redzams "AI Party" publiskajā UI (navbar, hero, metadata title, e-pastu paraksts) — aizvieto ar **"Pasākumu Stacija"**.

**Nemaini:** projekta mapes nosaukumu, repo nosaukumu, Vercel projekta ID, iekšējo kodu (main funkciju/tabulu nosaukumus ar `aiparty_` prefiksu). Tikai to, ko redz apmeklētājs.

### A2. Divas sadaļas

Zem hero, pirms konfiguratora:

```
┌─────────────────────┐  ┌─────────────────────┐
│                     │  │                     │
│   📷 AI FOTO         │  │   🎮 SPĒLES          │
│                     │  │                     │
│  Viesi fotografējas │  │  Erudīcija un        │
│  un kļūst par       │  │  interaktīvas        │
│  supervaroņiem...   │  │  viktorīnas TV       │
│                     │  │  ekrānā...           │
│  [Apskatīt →]       │  │  [Apskatīt →]        │
└─────────────────────┘  └─────────────────────┘
```

**Katrai savs krāsu akcents** virs kopējā tumšā/zelta pamata:
- **AI Foto** — zelta/dzintara akcents (esošā zīmola krāsa)
- **Spēles** — cits akcents (piemēram, violets vai smaragda) — atšķirīgs, bet no tās pašas premium paletes, ne konfliktējošs

Abas kartītes **vienā vizuālā sistēmā** (tie paši fonti, apmales stils, kustības princips) — atšķiras tikai akcenta krāsa, ikona un attēls/video fons. Nav divi dažādi zīmoli, ir viens zīmols ar diviem produktiem.

Klikšķis uz katras kartītes **ritina uz leju pie konfiguratora**, ne uz atsevišķu lapu — abas ved uz to pašu vienoto konfigurāciju (jau uzbūvēts: var izvēlēties foto tēmas un/vai spēles kā papildinājumus).

### A3. "Kā tas strādā" — divas atšķirīgas plūsmas

Šobrīd ir viena "Kā tas strādā" sekcija (foto plūsmai). Pievieno pārslēdzamu vai blakusesošu otru variantu spēlēm:

```
[ AI Foto ]  [ Spēles ]   ← cilnes/tabs pārslēgs

AI Foto:  01 Izvēlies tēmas → 02 Viesi fotografējas → 03 TV rāda rezultātu
Spēles:   01 Izvēlies/veido jautājumus → 02 Viesi pievienojas ar telefonu → 03 TV rāda dzīvo tablo
```

### A4. Attēlu/video demo atšķirība

Ja iespējams, "AI Foto" kartītei un sekcijai — pirms/pēc demo (jau plānots). "Spēles" kartītei un sekcijai — TV tablo/podija ekrāna screenshot vai īss demo klips, kad tāds būs. Ja vēl nav — skaidri iezīmēts placeholder ar norādi, kur ievietot.

---

## DAĻA B — ANABELLAPARTY PROJEKTS

**Mērķis:** Navbar/produktu izvēlnē pievieno saiti uz Pasākumu Staciju, pozicionētu blakus foto kastēm.

### B1. Navigācijas vieta

Foto kastes apakšizvēlnē (vai blakus tai, ja struktūra to neļauj) pievieno jaunu vienumu:

```
Foto kastes ▾
  SPOGULIS
  OZOLS
  INSTAGRAM
  AI Foto (esošā /foto-kaste/ai-foto lapa)
  ─────────────
  Pasākumu Stacija (TV spēles un AI foto) → ārējā saite
```

Vai, ja vizuāli labāk der atsevišķa navbar pozīcija (ne apakšizvēlnē) — poga/links ar nelielu "JAUNS" vai zibens ikonu, lai piesaista uzmanību kā jaunam piedāvājumam.

**Tehniski:** parasta `<a>` saite uz AI Party publisko URL (ārējs domēns), `target="_blank"` vai tajā pašā logā — izvēlies to, kas dabiski der esošajai navigācijai. `rel="noopener"`.

### B2. Neaiztiec /foto-kaste/ai-foto lapu

Šī lapa jau eksistē Anabellā un apraksta AI foto funkciju foto kastēm. Tā paliek kā ir — jaunā saite uz Pasākumu Staciju ir **papildu**, atsevišķs piedāvājums (TV/spēles), ne šīs lapas aizstājējs.

---

## PĀRBAUDE

**AI Party projektā:**
- [ ] Nekur publiski neredz "AI Party" — visur "Pasākumu Stacija"
- [ ] Divas kartītes ar atšķirīgu akcentu, vienotā zīmola sistēmā
- [ ] Abas ved uz to pašu konfiguratoru
- [ ] "Kā tas strādā" pārslēdzas starp abām plūsmām
- [ ] `npm run build` tīrs

**Anabellas projektā:**
- [ ] Jauna saite navbar/izvēlnē uz Pasākumu Staciju
- [ ] Saite ved uz pareizo ārējo URL
- [ ] `/foto-kaste/ai-foto` nemainīta
- [ ] `npm run build` tīrs

---

## KO NEDARĪT

- Nemaini repo/mapes/Vercel projekta nosaukumu — tikai publiski redzamo tekstu
- Neveido divas atsevišķas konfiguratora plūsmas — viena, kur var izvēlēties abus
- Nesajauc krāsu akcentus tā, lai izskatītos pēc diviem dažādiem zīmoliem
