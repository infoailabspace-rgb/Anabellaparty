# SOLIS2 — Juridiskās lapas, BUJ, sīkdatnes

**Mērķis:** Nulle 404 visā lapā. GDPR pamati vietā pirms tiek vākti jebkādi dati.

**Priekšnosacījumi:** SOLIS1 ✅.

**Pirms sāc:** izlasi `CLAUDE.md`. Parādi plānu. Gaidi apstiprinājumu.

---

## 1. BUJ (`/faq`)

Izveido `lib/faq.ts` — jautājumu masīvs ar kategorijām:

```ts
export type FaqItem = {
  question: string;
  answer: string;
  category: 'rezervacija' | 'piegade' | 'produkti' | 'maksajumi';
};
```

Minimums 15 jautājumi. Reāli jautājumi, ko cilvēki uzdod:

- Cik iepriekš jārezervē?
- Vai piegādājat ārpus Rīgas? Cik maksā?
- Cik ilgi aizņem uzstādīšana?
- Vai vajag elektrību? Cik daudz vietas?
- Kas notiek, ja līst lietus (atrakcijas)?
- Vai var atcelt? Vai depozīts tiek atgriezts?
- Vai foto kastei ir operators?
- Cik foto var uztaisīt? Vai drukā uz vietas?
- Vai var pielāgot dizainu / logo?
- Kā notiek apmaksa?
- Vai izsniedzat rēķinu uzņēmumiem?
- Vai strādājat arī darbadienās?
- Kas notiek, ja inventārs tiek sabojāts?
- Vai atrakcijas ir apdrošinātas?
- Vai varat ieteikt papildu pakalpojumus?

Lapa: accordion (`'use client'`, useState, bez bibliotēkas), filtrs pa kategorijām, CTA uz kontaktiem apakšā.

---

## 2. Nomas noteikumi (`/noteikumi`)

Juridisks teksts latviski. Sadaļas:

1. Vispārīgie noteikumi (kas ir iznomātājs, kontaktinfo, reģ. dati)
2. Rezervācija un apstiprināšana
3. Depozīts (20%) un pilna apmaksa
4. Atcelšanas noteikumi un termiņi
5. Piegāde, uzstādīšana, demontāža
6. Nomnieka pienākumi (vieta, elektrība, uzraudzība)
7. Atbildība par bojājumiem un zudumiem
8. Drošības noteikumi (īpaši piepūšamajām atrakcijām — bērnu uzraudzība, vecuma/svara ierobežojumi, laikapstākļi)
9. Force majeure
10. Strīdu risināšana, piemērojamie tiesību akti (LR)

**Katrā vietā, kur trūkst reāla informācija** (reģ. numurs, konkrēti atcelšanas termiņi, drukas skaits) — ievieto `[JĀAPSTIPRINA: ...]` un uzskaiti tos `SOLIS2-DONE.md` failā, lai Roberts var aizpildīt.

---

## 3. Privātuma politika (`/privatuma-politika`)

GDPR atbilstoša. Sadaļas:

1. Pārzinis un kontaktinformācija
2. Kādus datus vācam (vārds, e-pasts, telefons, pasākuma adrese, maksājumu dati)
3. Kādēļ vācam (līguma izpilde, komunikācija, grāmatvedība)
4. Tiesiskais pamats katrai apstrādei
5. **Fotogrāfijas** — atsevišķa sadaļa: foto kastes attēli, kas tos redz, cik ilgi glabā, kā lūgt dzēst
6. Datu saņēmēji (Vercel, Supabase, Stripe, Resend — norādi ES/adekvātuma statusu)
7. Glabāšanas termiņi
8. Datu subjekta tiesības (piekļuve, labošana, dzēšana, pārnesamība, iebildumi)
9. Sūdzības Datu valsts inspekcijai
10. Politikas izmaiņas + pēdējais atjaunojums

---

## 4. Sīkdatņu politika (`/sikdatnu-politika`)

Tabula ar sīkdatnēm: nosaukums, mērķis, veids (nepieciešamā / analītiskā / mārketinga), glabāšanas ilgums, kas to iestata.

Pagaidām: GTM, GA4, Facebook Pixel, Vercel Analytics. Kā atteikties.

Pievieno šo linku footerī.

---

## 5. Sīkdatņu banneris

`components/cookie-consent.tsx` (`'use client'`):

- Parādās pirmajā apmeklējumā, apakšā
- Trīs pogas: **Pieņemt visas** / **Tikai nepieciešamās** / **Iestatījumi**
- Iestatījumi izver trīs slēdžus: nepieciešamās (bloķēts ieslēgts), analītiskās, mārketinga
- Izvēle saglabājas `localStorage` atslēgā `anabella-cookie-consent` ar timestamp
- Links uz `/sikdatnu-politika`

**Kritiski:** GTM un FB Pixel skripti **NEIELĀDĒJAS**, kamēr nav piekrišanas. Ielieto Google Consent Mode v2 noklusējumus (`denied`) `app/layout.tsx`, un banneris tos atjauno ar `gtag('consent', 'update', ...)`.

Šo dara **tagad**, ne SOLIS5 — pretējā gadījumā vāksim datus bez piekrišanas.

---

## 6. Mūsu draugi (`/musu-draugi`)

Vienkārša partneru lapa: kartītes ar nosaukumu, īsu aprakstu, linku (`rel="noopener"`). Dati `lib/partners.ts`. Ja partneru saraksta vēl nav — 3 placeholderi ar `[JĀAPSTIPRINA]`.

---

## 7. 404 lapa

`app/not-found.tsx` — zīmola stilā, links uz sākumu un populārākajām lapām.

---

## 8. Build pārbaude

```bash
npm run build
npm run dev
```

Pārbaudi:
- Visi navbar un footer linki strādā, nulle 404
- Sīkdatņu banneris parādās inkognito logā
- Pēc "Tikai nepieciešamās" — GTM/Pixel neielādējas (pārbaudi Network tabā)
- Izvēle saglabājas pēc pārlādes
- Accordion strādā
- Mobilais izkārtojums OK
- Latviešu burti pareizi

---

## 9. Push + atskaite

```bash
git add .
git commit -m "SOLIS2: juridiskās lapas, BUJ, sīkdatņu piekrišana"
git push
```

`SOLIS2-DONE.md` — obligāti iekļauj **pilnu `[JĀAPSTIPRINA]` sarakstu**, ko Roberts aizpilda.

Atjauno `CLAUDE.md`: SOLIS2 → ✅.

---

## PIEŅEMŠANAS KRITĒRIJI

- [ ] Nulle 404 no jebkuras saites lapā
- [ ] Sīkdatņu banneris bloķē GTM/Pixel līdz piekrišanai
- [ ] Piekrišana saglabājas localStorage
- [ ] Visas juridiskās lapas latviski
- [ ] `[JĀAPSTIPRINA]` vietas uzskaitītas SOLIS2-DONE.md
- [ ] `npm run build` tīrs
- [ ] Nav jaunu npm pakotņu

---

## KO NEDARĪT ŠAJĀ SOLĪ

- Nepievieno npm pakotnes (accordion un slēdži — parasts useState)
- Neveido rezervācijas formu (SOLIS4)
- Nepieskaries Supabase (SOLIS3)
- Nedari multilingua (SOLIS5)
- Neizdomā juridiskus faktus — nezināmais ir `[JĀAPSTIPRINA]`

---

## PIEZĪME

Šeit ģenerētie juridiskie teksti ir sagataves, ne juridisks atzinums. Pirms publiskošanas Robertam tie jāpārskata — īpaši atbildības un drošības sadaļas piepūšamajām atrakcijām.
