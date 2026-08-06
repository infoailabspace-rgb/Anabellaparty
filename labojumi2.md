# LABOJUMI 2 — Par mums, navbar, klienti

Aizstāj `labojumi.md` 1.3, 2. un 3. sadaļu. Pārējais (logo izmērs, Mūsu draugi navbar, uz augšu poga, sīkdatņu kļūda, ritinājums) paliek spēkā, kā rakstīts.

---

## 1. PAR MUMS — reālais teksts

Ņemts no anabellaparty.lv. Nemaini formulējumus — tas ir Aivas un Roberta pašu teksts.

**Virsraksts:** Kas ir Svētku inventārs Anabella?

**Apakšvirsraksts:** Iepazīsimies?

**Stāsts:**

> Tie esam mēs — Aiva un Roberts Dimanti.
>
> Mēs esam vīrs un sieva, kuri vienu dienu vienkārši izlēma darīt to, kas patīk. Atstājām stabilos darbus un sākām dzīvot pa īstam. Tagad mēs radām svētkus — tādus, kas paliek atmiņā ne tikai bildēs, bet arī sirdī.
>
> Mūsu foto kastes ķer īstus smieklus, nevis pozas. Mūsu baltās atrakcijas iepriecina bērnus un uzjautrina pieaugušos. Mēs ierodamies ar prieku un aizbraucam ar sajūtu, ka esam kādam dienu padarījuši īpašu.
>
> Šis nav vienkārši pakalpojums. Šī ir mūsu sirdslieta. Mēs paši — ar visu savu enerģiju, radošumu un vēlmi, lai jūsu pasākums būtu tas, par ko runā vēl ilgi.

**Mūsu mazie lielie plusi:**

- Mēs darām ar sirdi, ne pēc šablona
- Katrs klients mums nav "klients" — jūs esat kā draugi
- Pozitīva enerģija, ko nevar nepamanīt
- Svētku sajūta garantēta

**Noslēgums:** Uz tikšanos pasākumos!

### Kā to noformēt

Sirsniņu emocijzīmes (🖤) **aizstāj ar zeltainu ikonu** — maza rombveida vai zvaigznes forma `#D4A960` krāsā. Emocijzīmes renderējas atšķirīgi katrā ierīcē un premium izkārtojumā izskatās nekonsekventi. Saturs paliek tas pats, tikai vizuāli tīrāks.

Izkārtojums:
- Divas kolonnas desktopā: stāsts pa kreisi, Aivas un Roberta foto pa labi
- Mobilajā vienā kolonnā, foto virs teksta
- "Mūsu mazie lielie plusi" — atsevišķs bloks ar zelta apmali zem stāsta
- "Uz tikšanos pasākumos!" — lielākā, zeltainā rakstībā, kā noslēgums

Pēc stāsta — skaitļu josla: pasākumi, inventāra vienības, **kopš 2022**.

`[VAJAG: Aivas un Roberta kopīgs foto]` — līdz tam placeholder.

Pēc "Par mums" seko esošais pakalpojumu apraksts. Stāsts vienmēr pirmais.

---

## 2. NAVBAR — zelta rāmītis, ne pulsācija

### Navigācijas linki

Miera stāvoklī: parasts teksts, bez apmales.

**Hover:** ap linku parādās zelta rāmītis — 1px `#D4A960`, `rounded-full`, iekšējā atkāpe `px-4 py-2`. Teksts kļūst zeltains. Pāreja 250ms, `[0.22, 1, 0.36, 1]`.

**Aktīvā lapa:** rāmītis pastāvīgi redzams, bet klusāks — `border-gold/40`, teksts `text-gold/90`.

Rāmītis nedrīkst mainīt izkārtojumu, parādoties. Atkāpe ir vienmēr, tikai apmale ir caurspīdīga miera stāvoklī:

```
border border-transparent hover:border-gold
```

Nekādas pulsācijas, nekāda mirgošanas.

### "Rezervēt" poga

Izceļas ar aizpildījumu, ne kustību: zelta fons, melns teksts, `rounded-full`. Hover: `scale: 1.04` un zeltaina ēna.

### WhatsApp

Vienīgais elements, kas kustas. Lēciens ik pēc 4 sekundēm: `y: 0 → -6 → 0 → -3 → 0`, 600ms, tad miers. Zaļā WhatsApp krāsā vai zelta — pārbaudi, kurš uz tumša navbar lasās labāk.

Hover: lēciens apstājas, `scale: 1.15`.

`prefers-reduced-motion` — lēciens izslēdzas.

---

## 3. KLIENTI — tekstuāli, ne logo

Šī sadaļa ir atsevišķa no "Mums uzticas" (kur Roberts vēlāk ieliks logo ar atļaujām).

**Virsraksts:** Mūsu klientu vidū

**Ievadteksts:**

> Anabella inventārs ir bijis uzņēmumu ballēs, pašvaldību svētkos, tirdzniecības centru pasākumos un ģimeņu svinībās visā Latvijā. Strādājam gan ar privātpersonām, gan ar lielākajiem Latvijas uzņēmumiem un novadu pašvaldībām.

**Nosaukumi**, sagrupēti pa nozarēm — tas lasās labāk nekā 20 nosaukumu rinda:

| Nozare | Uzņēmumi |
|---|---|
| Finanses | Swedbank, SEB, INDEXO, Mintos, iDeal |
| Tirdzniecība | Mango, Tupperware, Via Jurmala Outlet Village, Teika Plaza |
| Pārtika un ražošana | Lāči, Santa Maria, Piana Vyshnia, Skonto Prefab, Visendorff |
| Mediji un mārketings | TVNET, McCann Riga, MOOZ |
| Pašvaldības un sabiedrība | Mārupes novads, Ogres novada Jauniešu dome, Mammām un Tētiem |
| Pakalpojumi | Lindström |

Dati `lib/clients.ts`:

```ts
export type ClientGroup = {
  sector: string;
  companies: string[];
};
```

Noformējums: nosaukumi kā teksts zeltainā krāsā, katrs savā "pill" formā ar zelta apmali 1px. Nozares virsraksts virs katras grupas, mazāks, gaišāks. Bez logo, bez attēliem.

Animācija: grupas parādās ar stagger, katra `pill` ar nelielu nobīdi.

**Kāpēc tekstuāli:** logo publiskošana prasa atļauju, un tas ir risks ar lielajiem zīmoliem. Nosaukuma minēšana faktiskā apgalvojumā ("bijis mūsu klients") ir cita lieta — tas ir patiess apgalvojums par savu darbību.

Kad Roberts saņems atļaujas konkrētiem logo, tie iet **atsevišķā "Mums uzticas" lentē** (SOLIS1C B2). Abas sadaļas var pastāvēt līdzās: logo tiem, kas atļāvuši, teksts pārējiem.

---

## 4. ATSAUKSMES — nevar izveidot no šī

Uzņēmumu nosaukumi nav atsauksmes. Atsauksme ir konkrēta cilvēka teikts citāts ar viņa vārdu. Izdomāt citātu un pierakstīt to Swedbank vai INDEXO nozīmē publicēt viltotu atsauci — ja kāds no viņiem to pamana, tas ir gan reputācijas, gan juridisks jautājums.

**Ko darīt tā vietā:**

Atsauksmju sadaļa **paliek neuzbūvēta**, līdz ir reāli citāti. Tās vietā sākumlapā strādā "Mūsu klientu vidū" sadaļa — tā jau pilda to pašu uzdevumu (sociālais pierādījums), tikai ar patiesiem apgalvojumiem.

**Kā dabūt reālas atsauksmes ātri:** pēc katra pasākuma nosūti klientam īsu e-pastu ar diviem jautājumiem un lūgumu atļaut publicēt vārdu. Trīs nedēļas — un tev būs 10 īstas atsauksmes. To var automatizēt SOLIS3 e-pastu plūsmā.

Ja Facebook lapā jau ir atsauksmes, tās var izmantot — tur cilvēki tās rakstījuši publiski un ar savu vārdu. `[JĀAPSTIPRINA: vai Facebook ir atsauksmes, ko pārnest]`

---

## 5. PĀRBAUDE

- [ ] "Par mums" — stāsts pirmais, tad pakalpojumi
- [ ] Emocijzīmes aizstātas ar zelta ikonām
- [ ] Gads 2022, ne 2019
- [ ] Navbar linkiem zelta rāmītis uz hover, bez pulsācijas
- [ ] Aktīvā lapa iezīmēta klusāku rāmīti
- [ ] Rāmītis neizraisa izkārtojuma lēcienu
- [ ] WhatsApp lēkā ik 4 sekundes
- [ ] Klienti tekstuāli, sagrupēti pa nozarēm
- [ ] Atsauksmju sadaļa neuzbūvēta vai tukša — nekādu izdomātu citātu
- [ ] `prefers-reduced-motion` respektēts
- [ ] `npm run build` tīrs
