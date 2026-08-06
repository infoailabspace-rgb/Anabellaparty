# JURIDISKIE DATI — no dzīvās lapas

Viss zemāk ir **verificēts** no anabellaparty.lv/noteikumi un /privatuma-politika. Neizdomāts, nepieņemts.

---

## ⚠️ DIVAS LABOJAMAS KĻŪDAS

### 1. PIEGĀDES CENA — nepareiza CLAUDE.md un solis3b.md

| | Nepareizi (mans) | Pareizi (dzīvā lapa) |
|---|---|---|
| Bezmaksas zona | 30 km rādiuss | **Ķekava un Ķekavas novads** |
| Cena | €0.50/km | **€25 / 100 km, aprēķins turp-atpakaļ** |

Tas ir **€0.25/km no viena virziena attāluma** (jo 100 km turp-atpakaļ = 50 km vienā virzienā).

```ts
// lib/delivery.ts — LABOTS
export const WAREHOUSE = {
  address: 'Vecozolu iela 14, Ķekava, LV-2123',
  lat: 56.8236,
  lng: 24.2350,
};

export const FREE_ZONE = 'Ķekavas novads';
export const PRICE_PER_100KM_ROUNDTRIP = 25;

/** km = attālums VIENĀ virzienā no noliktavas */
export function deliveryPrice(km: number, isInFreeZone: boolean): number {
  if (isInFreeZone) return 0;
  const roundTripKm = km * 2;
  return Math.round((roundTripKm / 100) * PRICE_PER_100KM_ROUNDTRIP * 100) / 100;
}
```

**Bezmaksas zona ir administratīva, ne ģeometriska.** ORS geocoding atgriež reģionu — pārbaudi, vai tajā ir "Ķekava". Ja ORS neatgriež novadu droši, izmanto rezerves variantu: 15 km rādiuss aptuveni atbilst Ķekavas novadam.

Attēlojums kalkulatorā:
```
Piegāde
  Ķekava → Jelgava, 42 km (84 km turp-atpakaļ)
  25 € / 100 km                  21 €
```

### 2. CENAS IR BEZ PVN

Dzīvā lapa: *"Visas norādītās cenas ir bez PVN."*

```ts
export const VAT_RATE = 0.21;
export const PRICES_INCLUDE_VAT = false;
```

Katrā cenu blokā un kalkulatorā zem summas: **"Cenas norādītas bez PVN 21%."**

Kalkulatorā rādi abus — klientam, kas nav uzņēmums, 220 € nozīmē 266,20 €, un tas nedrīkst būt pārsteigums:

```
Kopā bez PVN                   670 €
PVN 21%                        140.70 €
───────────────────────────────────
Kopā ar PVN                    810.70 €
Avanss 50%                     405.35 €
```

---

## AVANSS UN ATCELŠANA

**Vienkāršāk, nekā es piedāvāju.** Nav pakāpju sistēmas:

> Rezervācija tiek apstiprināta pēc **50% avansa** iemaksas, neatkarīgi no izvēlētās tehnikas vai pakalpojuma. Norēķini — bankas pārskaitījums vai skaidra nauda.
>
> **Atceļot rezervāciju, avanss netiek atmaksāts**, jo tas nodrošina inventāra pieejamību un daļēji sedz zaudētos ienākumus.
>
> Atsevišķām iekārtām var tikt pieprasīta **drošības nauda (ķīla)**, kas tiek atgriezta pēc inventāra atgriešanas sākotnējā stāvoklī.

---

## SLIKTI LAIKAPSTĀKĻI

Ja atrakciju nevar uzstādīt — avanss netiek atgriezts, bet klients var vienoties par:
- datuma pārcelšanu
- summas izmantošanu cita inventāra nomai
- dāvanu karti avansa vērtībā

Ja atrakcija jau uzstādīta, bet netiek izmantota — nomas maksa netiek atmaksāta.

---

## UZSTĀDĪŠANAS PRASĪBAS

- 220V elektrības pieslēgums
- Atrakcija ne tālāk kā **25 m no pieslēguma**
- Vieta brīvi pieejama, bez šķēršļiem
- Ārā: līdzena, tīra pamatne (zāliens)
- Nedrīkst: akmeņi, čiekuri, būvgruži, asumi, melnzeme

---

## DROŠĪBA UN ATBILDĪBA

> No brīža, kad atrakcija uzstādīta vai nodota klienta rīcībā, **pilna atbildība pāriet klientam.**

Klients apņemas:
- Uzraudzīt bērnus
- Nepārsniegt cilvēku skaitu un **svara limitu 200 kg**
- Pārtraukt lietošanu nelabvēlīgos laikapstākļos

> Ja notiek traumas vai nelaimes gadījumi, **visa atbildība gulstas uz klientu.**

Apdrošināšana nav minēta — formulējums balstās uz atbildības pārnešanu, ne apdrošināšanu. Nemaini šo formulējumu.

---

## AIZLIEGUMI

Atrasties atrakcijā ar: apzīmētām sejām, flomasteriem, pildspalvām, krāsojošiem līdzekļiem, plaukšķenēm, konfeti, apaviem.

Aizliegts: kāpt pāri sānu malām, veikt remontdarbus pašiem.

Ienest: asus priekšmetus, dzīvniekus, ēdienu, dzērienus, rakstāmpiederumus.

---

## LAIKAPSTĀKĻI

Stipra vēja un lietus laikā lietošana aizliegta. Pēkšņa lietus gadījumā: atvienot no gaisa pūtēja, pūtēju atslēgt no elektrības un sargāt no mitruma.

---

## INVENTĀRA (ne atrakciju) NOTEIKUMI

Drošs elektrības pieslēgums. Lietū vai vējā lietošana aizliegta. Pēkšņa lietus gadījumā atvienot un novietot zem jumta.

Bojājumu gadījumā piemēro pieņemšanas-nodošanas aktā un nomas līgumā norādīto.

---

## PRIVĀTUMA POLITIKA — kas jau ir

**Pārzinis:** SIA "AR DIMANTI", reģ. nr. 40203276261, juridiskā adrese **Vecozolu 14, Ķekava, LV-2123** ← juridiskā adrese = noliktavas adrese, jautājums atbildēts.

Vācamie dati: vārds, uzvārds, e-pasts, tālrunis, maksājumu informācija, citi saziņas dati.

Mērķi: pakalpojumu sniegšana, klientu atbalsts, juridiskie pienākumi, tiešais mārketings (ar piekrišanu).

Tiesiskais pamats: piekrišana, līguma izpilde, juridiskie pienākumi, leģitīmās intereses.

Glabāšana: *"tik ilgi, cik nepieciešams, vai līdz pieprasītai dzēšanai."*

Tiesības: piekļuve, labošana, dzēšana, ierobežošana, iebilšana, piekrišanas atsaukšana, sūdzība Datu valsts inspekcijā.

### Ko jaunajai lapai jāpapildina

Vecā politika ir minimāla un neatbilst jaunajai lapai. Pievieno:

| Sadaļa | Saturs |
|---|---|
| **Konkrēti glabāšanas termiņi** | Rezervāciju pieteikumi — 3 gadi (grāmatvedība). Audio/video grāmatu faili — **30 dienas** (jau minēts produktu lapā). Čata sarunas — 90 dienas. Sīkdatnes — pēc sīkdatņu politikas. |
| **Apstrādātāji** | Vercel (hostings, ES), Supabase (DB, ES), Resend (e-pasti), Anthropic (čatbots), OpenRouteService (piegādes aprēķins), Google (GA4/GTM), Meta (Pixel) |
| **Foto kastu bildes** | `[JĀAPSTIPRINA: cik ilgi glabājat foto kastu bildes]` |
| **Čatbota sarunas** | Jauns — vecajā lapā nav |
| **Piegādes adrese** | Jauns — nosūtām ORS ģeokodēšanai |
| **Sīkdatņu piekrišana** | Consent Mode v2, atsaukšana |

---

## LAIMES RATS

Vecajā lapā ir laimes rats (0–20% atlaide, viena reize, jāpiekrīt jaunumiem). Termiņš bija līdz 2025. gada beigām — **beidzies**.

`[JĀAPSTIPRINA: vai laimes rats paliek jaunajā lapā?]` Ja jā, tas ir atsevišķs uzdevums ar savu GDPR sadaļu (e-pastu vākšana mārketingam). Ja nē — noteikumu sadaļu neiekļauj.

---

## KO IZDARĪT

1. **Labo `lib/delivery.ts`** — €25/100 km turp-atpakaļ, bezmaksas Ķekavas novadā
2. **Labo `CLAUDE.md`** cenu tabulu — piegāde nav €0.50/km
3. **Pievieno PVN** — `PRICES_INCLUDE_VAT = false`, kalkulatorā rādi ar un bez
4. **Pārraksti `/noteikumi`** ar šo saturu, papildinot ar AR DIMANTI rekvizītiem
5. **Pārraksti `/privatuma-politika`** — vecais saturs plus jaunās sadaļas
6. Noņem visus `[JĀAPSTIPRINA]` marķierus, izņemot divus, kas paliek zemāk

---

## PALIEK NEATBILDĒTS

1. Cik ilgi glabājat foto kastu bildes?
2. Vai laimes rats paliek jaunajā lapā?
3. Bankas rekvizīti (IBAN/SWIFT) — vajadzīgi tikai rēķiniem, nav steidzami
