# REKVIZĪTI — Anabella Party

Ievieto `lib/company.ts` kā vienu patiesības avotu. Juridiskās lapas, e-pasti, rēķini un schema.org lasa no turienes — nekur nedublē ar roku.

---

## JURIDISKĀ PERSONA

```ts
export const COMPANY = {
  legalName: 'SIA "AR DIMANTI"',
  brandName: 'Anabella Party',
  regNr: '40203276261',
  vatNr: 'LV40203276261',
  isVatPayer: true,

  address: {
    street: 'Vecozolu iela 14',
    city: 'Ķekava',
    region: 'Ķekavas novads',
    postalCode: 'LV-2123',
    country: 'LV',
  },

  contact: {
    phone: '+37129222761',
    phoneDisplay: '+371 29222761',
    whatsapp: 'https://wa.me/37129222761',
    email: '[JĀAPSTIPRINA]',
  },

  // Kubli/pirts — atsevišķs kontakts, cita atrašanās vieta
  altContact: {
    phone: '+37128286911',
    phoneDisplay: '+371 28286911',
    location: 'Jūrmala',
  },

  social: {
    instagram: 'https://www.instagram.com/anabella_svetku_inventars/',
    facebook: 'https://www.facebook.com/anabellaparty.lv',
  },

  bank: {
    name: '[JĀAPSTIPRINA]',
    iban: '[JĀAPSTIPRINA]',
    swift: '[JĀAPSTIPRINA]',
  },
};
```

---

## PVN — jāizlemj

AR DIMANTI ir PVN maksātājs. Tas nozīmē, ka **katrai cenai lapā jābūt skaidram, vai tā ir ar PVN vai bez.** Šobrīd lapā tas nav norādīts nekur, un tas ir patērētāju tiesību jautājums, ne stila.

Latvijā privātpersonām cenas rāda **ar PVN**. Ja lapā cenas jau ir ar PVN, tad zem katras cenu tabulas pietiek ar rindiņu: *"Cenas norādītas ar PVN 21%."*

Ja cenas ir bez PVN, ir divas problēmas: privātpersona redz cenu, kas nav īstā, un konkurenti izskatās dārgāki. Tad tās jāpārrēķina.

**`[JĀAPSTIPRINA]`: cenas lib/products.ts — ar PVN vai bez?**

Kad zināms, `lib/company.ts` pievieno:

```ts
export const VAT_RATE = 0.21;
export const PRICES_INCLUDE_VAT = true;  // vai false
```

Un cenu komponentē zem summas rāda attiecīgi.

---

## KUR REKVIZĪTI JĀPARĀDĀS

| Vieta | Kas |
|---|---|
| **Nomas noteikumi** | Pilns nosaukums, reģ. nr., PVN nr., juridiskā adrese, kontakti |
| **Privātuma politika** | Pārzinis: pilns nosaukums, reģ. nr., adrese, e-pasts |
| **Footer** | Īsā versija: `SIA "AR DIMANTI", reģ. nr. 40203276261` |
| **Kontaktu lapa** | Pilni rekvizīti atsevišķā blokā |
| **Rēķini** (nākotnē) | Viss, ieskaitot bankas rekvizītus |
| **schema.org LocalBusiness** | `legalName`, `vatID`, `address`, `telephone` |
| **E-pastu kājene** | Īsā versija |

Zīmola nosaukums lapā paliek **"Anabella Party"**. Juridiskais nosaukums parādās tikai tur, kur likums to prasa — footerī, juridiskajās lapās, rēķinos.

---

## KO IZDARĪT

1. Izveido `lib/company.ts` ar augšminēto
2. Nomaini visus `[JĀAPSTIPRINA]` marķierus juridiskajās lapās uz reāliem rekvizītiem
3. Footerī pievieno juridisko rindu
4. Kontaktu lapā rekvizītu bloks
5. schema.org `LocalBusiness` papildini ar `legalName` un `vatID`
6. Pārbaudi, ka nekur nav hardkodēts reģ. nr. — viss no `lib/company.ts`

---

## PALIEK NEATBILDĒTS

1. **E-pasts** — `info@anabellaparty.lv` vai `anabellaparty@inbox.lv`?
2. **Cenas ar PVN vai bez?**
3. **Bankas rekvizīti** — vajadzīgi, kad būs rēķini. Pagaidām var atstāt tukšus.
4. **Juridiskā adrese** — vai AR DIMANTI juridiskā adrese ir tā pati Vecozolu iela 14, vai cita? Ja cita, tad juridiskajās lapās jābūt juridiskajai, bet piegādes izejas punkts paliek Vecozolu 14.
