# STATUSS — Anabella Party

Kopsavilkums: kas izpildīts, kas atlicis, kas gaida datus.

---

## IZPILDĪTS

SOLIS0, 1, 1B, 1C, 2, 3, 4B, 5, 6 (A–C), 7 (Fāze 1), rekvizīti.

Dzīvs: GitHub `infoailabspace-rgb/Anabellaparty`, Vercel preview. **Domēns vēl vecajā nodrošinātājā — DNS nav iestatīti.**

---

## IZPILDĀMS TAGAD (nekas nav vajadzīgs no Roberta)

| # | Fails | Saturs | Branch |
|---|---|---|---|
| 1 | `juridiskie-dati.md` | Piegādes cena €25/100km, cenas bez PVN, noteikumi no dzīvās lapas, laimes rats prom | `feat/i18n` |
| 2 | `labojumi.md` + `labojumi2.md` | Logo lielāks, Mūsu draugi navbar, zelta rāmīši, WhatsApp lēciens, Par mums stāsts, klienti tekstuāli, uz augšu poga, sīkdatņu kļūda, gads 2022 | `feat/i18n` |
| 3 | i18n Fāze 1 | Karkass, UI, metadata, hreflang | `feat/i18n` |
| 4 | SOLIS7 Fāze 2 | Attēlu augšupielāde, `/admin/saturs`, `/admin/atsauksmes`, `/admin/klienti`, `/admin/faq` | — |
| 5 | `solis3b.md` | Piegādes km aprēķins (ORS) | — |
| 6 | `solis1d.md` | Kategoriju fona attēli (struktūra, attēli vēlāk) | — |
| 7 | `solis4.md` | SEO, sitemap, schema.org, OG attēli | — |

**Ieteicamā secība:** 1 → 2 → 3 → 4 → 5 → 6 → 7.

Pirmie divi ir labojumi jau uzbūvētajā. Tie iet pirmie, lai i18n tulko pareizos tekstus, ne vecos.

---

## GAIDA DATUS NO ROBERTA

| Kas | Kur vajadzīgs | Bloķē |
|---|---|---|
| **Resend API atslēga** | `.env.local` + Vercel | Pieteikumu e-pasti — vienīgā salauztā funkcija |
| **ORS API tokens** | `.env.local` + Vercel | solis3b piegādes aprēķins |
| Aivas un Roberta foto | `/public/images/about/` | Par mums sadaļa |
| Kategoriju attēli (6 gab.) | `/public/images/categories/` | solis1d |
| Produktu foto | `/public/images/products/<slug>/` | Galerijas |
| Klientu logo ar atļaujām | `/public/images/clients/` | "Mums uzticas" lente |
| Pasākumu skaits, inventāra vienību skaits | `site_content` | Par mums skaitļi |
| Reālas atsauksmes | `testimonials` | Atsauksmju sadaļa |
| Foto glabāšanas termiņš | Privātuma politika | Juridisks |
| Bankas rekvizīti (IBAN/SWIFT) | `lib/company.ts` | Tikai rēķiniem, nav steidzami |

---

## MANUĀLS DARBS (ne kods)

- GA4 — `booking_submitted` iestatīt kā konversiju
- Google Search Console — pievienot īpašumu, iesniegt sitemap
- Google Business Profile — pārbaudīt datus, saite uz jauno lapu
- Lighthouse — izmērīt mobilajā
- 404 audits — salīdzināt Mozello sitemap ar jaunajiem maršrutiem
- Hero video — poster attēls, `playsInline`, WebM
- DNS pārslēgšana (SOLIS6 daļa D)

---

## APZINĀTI NETAISĀM

**Atsauksmes ar uzņēmumu vārdiem.** Swedbank, SEB, INDEXO neko nav teikuši. Izdomāts citāts ar reāla uzņēmuma vārdu ir viltota atsauce. Tā vietā — "Mūsu klientu vidū" sadaļa ar faktisku apgalvojumu, ka šie uzņēmumi ir bijuši klienti.

**Klientu logo bez atļaujas.** Nosaukuma minēšana faktiskā apgalvojumā ir viena lieta, logo publiskošana — cita. Logo iet lentē tikai tie, kuriem ir atļauja.

**Laimes rats.** Dzēsts pilnībā. Termiņš beidzās 2025. gada beigās, un piekrišanas mehānika bija GDPR ziņā nepareiza.

**Bonusu programma, datuma pieejamības pārbaude, ieteikumu programma.** Apspriests, atlikts. Nav vajadzīgs palaišanai.

**Stripe un tiešsaistes maksājumi.** Depozīts 50% ar pārskaitījumu pēc piedāvājuma.

**AI Party.** Atsevišķs produkts pēc palaišanas. Spec ir `AI-PARTY-SPEC.md`.

---

## LABOTĀS KĻŪDAS

| Kļūda | Bija | Ir |
|---|---|---|
| Piegādes cena | €0.50/km, 30 km bezmaksas | €25/100 km turp-atpakaļ, bez maksas Ķekavas novadā |
| PVN | Nenoteikts | Cenas bez PVN, kalkulators rāda abus |
| Atcelšana | Pakāpju sistēma | Avanss neatgriežas |
| Foto kastes cenas | Visas €260/€110 | Spogulis €260/€110, Ozols un Instagram €220/€100 |
| Katalogs | 6 produkti | 38 produkti |
| Dibināšanas gads | 2019 | 2022 |
| Skilu ceļi | `/mnt/skills/...` | `skills/` projekta saknē |

---

## PIRMĀ KOMANDA

```
Izlasi juridiskie-dati.md. Izpildi to, kas norādīts sadaļā "KO IZDARĪT". Parādi plānu pirms sāc.
```
