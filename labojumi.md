# LABOJUMI — navbar, Par mums, klienti, UX

---

## 1. NAVBAR

### 1.1 Logo lielāks

Pašreiz par mazu. `h-11` → **`h-16` desktopā, `h-12` mobilajā**. Navbar augstums attiecīgi `h-24` / `h-20`.

Logo klikšķis:
- Ja jau esi sākumlapā → ritina uz augšu (`scrollTo({ top: 0, behavior: 'smooth' })`)
- Ja citā lapā → navigē uz `/`, un lapa atveras no augšas

Tas pats "Sākums" pogai.

**Next.js problēma:** `<Link>` starp lapām neatiestata ritinājumu vienmēr paredzami. Izveido `components/scroll-to-top-on-nav.tsx` — `usePathname()` efekts, kas pie ceļa maiņas izsauc `window.scrollTo(0, 0)`.

### 1.2 "Mūsu draugi" navbar

Trūkst. Pievieno starp "Kontakti" un valodu pārslēdzēju.

```
Sākums · Foto kastes ▾ · Atrakcijas · Svinību inventārs ▾ · Mūsu draugi · Kontakti
```

Mobilajā izvēlnē tāpat.

### 1.3 Navigācijas animācija — daļēji citādi, nekā prasīts

Prasība bija, lai visas navbar pogas pulsē un mirgo. **Neiesaku to darīt visām.** Pieci vienlaikus pulsējoši elementi galvenē lasās kā reklāmas baneris, un premium zīmolam tas strādā pretēji — cilvēks pārstāj skatīties uz to, kas kustas, jo kustas viss.

Tā vietā — hierarhija:

| Elements | Kustība |
|---|---|
| Navigācijas linki | Hover: zelta pasvītrojums ieslīd no kreisās (200ms), teksts kļūst zeltains. Aktīvā lapa — pastāvīgs pasvītrojums. |
| **"Rezervēt" poga** | Nepārtraukta maiga pulsācija: `scale` 1 → 1.03 → 1, 2.5s, bezgalīgi. Plus zelta glow, kas elpo līdzi. Hover: pulsācija apstājas, `scale: 1.05`. |
| **WhatsApp ikona** | Lēciens ik pēc 4 sekundēm: `y: 0 → -6 → 0 → -3 → 0`, 600ms. Starp lēcieniem miers. |
| Sociālās ikonas | Hover: zelta krāsa, `scale: 1.1` |

Rezultāts: acs iet uz "Rezervēt" un WhatsApp, jo tikai tie kustas. Ja kustas viss, neviens neizceļas.

`prefers-reduced-motion` — visas pulsācijas izslēdzas.

---

## 2. PAR MUMS — stāsts pirms pakalpojumiem

Pašreiz sākas ar pakalpojumu uzskaitījumu. Cilvēkiem patīk stāsts par to, kā bizness sākās — tas jāliek pirmais.

**Struktūra:**

```
1. Stāsts        — kā radās ideja, kāpēc sākāt   ← [VAJAG TAVU TEKSTU]
2. Ko darām      — esošais pakalpojumu apraksts
3. Skaitļi       — pasākumi, inventārs, kopš 2022
```

**Gads: 2019 → 2022.** Nomaini visur, kur tas parādās.

**Man vajag stāstu no tevis.** Es to nevaru uzrakstīt — tas ir jūsu personīgais. Trīs jautājumi, no kuriem pietiek ar atbildēm dažos teikumos:

1. Kā radās ideja? Bija kāds konkrēts pasākums vai brīdis?
2. Kas bija pirmais inventārs, ko iegādājāties?
3. Kas jūs pārsteidza pirmajā gadā?

Iedod atbildes brīvā tekstā — es to noformēšu.

Līdz tam sadaļa paliek ar `[STĀSTS — JĀPAPILDINA]` marķieri, ne ar izdomātu tekstu.

---

## 3. KLIENTU LOGO — precizējums

**Tie nav atsauksmes, tie ir klienti.** Divas dažādas sekcijas:

| Sekcija | Saturs |
|---|---|
| **"Mums uzticas"** | Logo lente — Swedbank, SEB, INDEXO, Santa Maria, Lāči, Mango, Tupperware, McCann Riga, Mintos, Lindström, TVNET, Teika Plaza, Via Jurmala, Skonto Prefab, Mārupes novads, Ogres novada Jauniešu dome utt. |
| **"Ko saka klienti"** | Atsauksmes — citāti ar vārdiem. Šīm vēl vajag reālus tekstus. |

Logo ievieto `lib/clients.ts` un lentē (SOLIS1C B2 — bezgalīgs CSS ritinājums, apstājas uz hover, pelēktoņos ar `opacity: 0.6`, hover pilnās krāsās).

Faili `/public/images/clients/<nosaukums>.png` vai `.svg`, augstums 48px, `object-fit: contain`.

**Juridiska piezīme:** klientu logo publiskošana parasti prasa atļauju. Lielākie zīmoli (Swedbank, SEB, Mango, Tupperware) par to var būt stingri. Ja atļaujas nav, drošāk ir rakstīt bez logo — "Strādājam ar Latvijas lielākajiem uzņēmumiem: bankām, tirdzniecības centriem, mediju kompānijām." Tas ir tavs lēmums, bet ir vērts to zināt.

---

## 4. "UZ AUGŠU" POGA

`components/back-to-top.tsx` (`'use client'`):

- Parādās, kad noritināts vairāk par 600px
- Apakšējais labais stūris, virs čata widgeta (`bottom-24`, `right-6`)
- Aplis 48px, navy fons, zelta apmale 1px, zelta bultiņa
- Ienākšana: fade + slide no apakšas, 300ms
- Klikšķis: `scrollTo({ top: 0, behavior: 'smooth' })`
- `aria-label="Uz lapas sākumu"`
- Mobilajā mazāks (40px)

Nedrīkst pārklāt čata pogu vai cenu paneli `/rezervet` lapā — pārbaudi abas.

---

## 5. SĪKDATŅU BANNERIS — kļūda

Pēc apstiprināšanas parādās atkal. Iespējamie iemesli:

1. `localStorage` ieraksts saglabājas, bet komponents to nepārbauda pirms renderēšanas → parādās uz mirkli un pazūd
2. Hidratācijas neatbilstība — serveris renderē bez `localStorage`, klients ar
3. Ieraksts saglabājas zem citas atslēgas, nekā tiek lasīts

**Risinājums:**

```tsx
const [ready, setReady] = useState(false);
const [show, setShow] = useState(false);

useEffect(() => {
  const saved = localStorage.getItem('anabella-cookie-consent');
  setShow(!saved);
  setReady(true);
}, []);

if (!ready) return null;   // nerenderē neko, kamēr nezinām
```

Pārbaudi: apstiprini → pārlādē lapu → banneris neparādās. Pārbaudi arī pārejot starp lapām un mainot valodu (`/en/`, `/ru/` — vai `localStorage` atslēga ir kopīga visām valodām, ne atsevišķa katrai).

---

## 6. PĀRBAUDE

- [ ] Logo `h-16` desktopā, klikšķis ritina uz augšu
- [ ] "Mūsu draugi" navbar un mobilajā izvēlnē
- [ ] "Rezervēt" pulsē, WhatsApp lēkā, pārējie navbar linki nepulsē
- [ ] Pāreja starp lapām sākas no augšas
- [ ] "Uz augšu" poga parādās pēc 600px, nepārklāj čatu
- [ ] Sīkdatņu banneris pēc apstiprināšanas neparādās nekad
- [ ] Klientu logo lentē, atsauksmes atsevišķi
- [ ] Gads visur 2022
- [ ] `prefers-reduced-motion` izslēdz pulsācijas
- [ ] `npm run build` tīrs

---

## VAJAG NO ROBERTA

1. **Stāsts** — atbildes uz trim jautājumiem 2. sadaļā
2. **Klientu logo faili** — PNG vai SVG, `/public/images/clients/`
3. **Vai ir atļaujas** logo publiskošanai
4. **Atsauksmes** — 3–5 reāli citāti ar vārdiem
