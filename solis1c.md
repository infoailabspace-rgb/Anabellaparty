# SOLIS1C — Sākumlapa: dizains, kustība, Par mums, klienti

**Mērķis:** Sākumlapa, kas izskatās kā premium studijas darbs, ne kā scaffold. Kustība visā lapā.

**Priekšnosacījumi:** SOLIS1B ✅.

**Pirms sāc:**
1. Izlasi `CLAUDE.md`
2. Izlasi `/mnt/skills/user/web-builder/SKILL.md` — motion, performance un komerc-UI principi
3. Izlasi `/mnt/skills/public/frontend-design/SKILL.md` — vizuālais virziens
4. Parādi plānu. Gaidi apstiprinājumu.

**Pakotnes:** Framer Motion jau instalēts. Neinstalē neko jaunu.

---

## DAĻA A — KUSTĪBA VISĀ LAPĀ

Šobrīd lapa ir statiska. Kustība nav dekorācija — tā vada aci un rada premium sajūtu.

### A1. Kustības sistēma

Izveido `lib/motion.ts` — koplietojami varianti, lai animācijas ir konsekventas:

```ts
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export const stagger = {
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
```

Easing `[0.22, 1, 0.36, 1]` visur. Nekādu `ease: 'linear'` un nekādu atsperu, kas lec.

### A2. Kur kustība jābūt

| Vieta | Kustība |
|---|---|
| Hero virsraksts | Vārdi parādās pa vienam, stagger 60ms |
| Hero pogas | Fade-up ar 400ms aizturi pēc virsraksta |
| Hero scroll indikators | Bezgalīga maiga pulsācija uz leju |
| Sekciju virsraksti | `whileInView` fade-up, `viewport={{ once: true, margin: '-100px' }}` |
| Produktu kartītes | Stagger režģī, katra ar 80ms nobīdi |
| Kartīte hover | `y: -6`, zelta apmale spilgtāka, ēna dziļāka, attēls `scale: 1.04` |
| Pogas hover | `scale: 1.03` + zelta glow ēna |
| Skaitļi ("Kā tas notiek" 1-2-3) | Skaitās augšup, kad nonāk skatā |
| Klientu logo | Nepārtraukta horizontāla ritināšana |
| CTA sekcija | Lēna zelta gradienta pulsācija fonā |

### A3. Ko NEDARĪT

- Nekādu animāciju, kas aizkavē satura lasīšanu ilgāk par 700ms
- Nekāda parallax uz mobilā
- `prefers-reduced-motion: reduce` — visas animācijas izslēdzas, saturs paliek redzams. Šis ir obligāts.
- Nekādu `whileInView` bez `once: true` — atkārtota animācija, ritinot atpakaļ, izskatās lēti

---

## DAĻA B — JAUNAS SEKCIJAS

### B1. Par mums

Ievieto pēc "Kā tas notiek".

Saturs (Roberta paša teksts no dzīvās lapas):

> Mūsu uzņēmums radīts ar mērķi sniegt klientiem jaunākos izklaižu risinājumus. Piedāvājam plašu svētku inventāra katalogu perfektam svinību noskaņojumam: piepūšamās atrakcijas izmantošanai iekštelpās vai ārā, dažāda stila foto kastes, viesugrāmata — audio novēlējumu telefons, un vairāki svētku specefekti. Piedāvājam arī galdu klāšanu, servēšanu un dekorēšanu (bez ēdināšanas), ideju druku.
>
> Mūsu pakalpojumi seko līdzi mūsdienu ballīšu tendencēm, lai sniegtu klientiem visaktuālākos ballīšu risinājumus. Piedāvājam pakalpojumus gan privātpersonām, gan uzņēmumiem.

Izkārtojums: divas kolonnas desktopā — teksts pa kreisi, attēls pa labi (`/images/about/team.jpg`, placeholder ja nav). Mobilajā vienā kolonnā.

Zem teksta — statistikas josla, skaitļi animējas augšup:

```
[X]+ pasākumi   ·   [X]+ inventāra vienības   ·   Kopš [gads]
```

`[JĀAPSTIPRINA: pasākumu skaits, inventāra vienību skaits, dibināšanas gads]`

### B2. Klientu logo — dzīva ritināšanās

Bezgalīgs horizontāls logo lentes ritinājums ("marquee"). Bez bibliotēkas.

**Tehniski:**
- `lib/clients.ts` ar masīvu: `{ name, logo, url? }`
- Logo masīvs dublēts divreiz, lai cilpa ir nemanāma
- CSS `@keyframes` ar `translateX(-50%)`, `animation: scroll 40s linear infinite`
- Hover — ritināšana apstājas (`animation-play-state: paused`)
- Malās fade maska uz fona krāsu (`mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent)`)
- Logo pelēktoņos ar `opacity: 0.6`, hover — pilnas krāsas un `opacity: 1`
- Fiksēts augstums 48px, `object-fit: contain`
- **Bez JS animācijas** — tīrs CSS, lai neslogo galveno pavedienu
- `prefers-reduced-motion` — statisks režģis, ne ritinājums

Virsraksts virs lentes: **"Mums uzticas"**

Logo ceļi `/public/images/clients/<nosaukums>.svg` vai `.png`.
Ja mape tukša — 8 placeholder taisnstūri ar zelta apmali, lai izkārtojums ir redzams.

`[JĀAPSTIPRINA: klientu logo faili un vai drīkst tos publiskot]`

### B3. Atsauksmes — pārtaisīt

Pašreizējie placeholderi jāaizstāj ar karuseli: 3 redzamas desktopā, 1 mobilajā, bultiņas pa sāniem, auto-ritinājums ik 6s (apstājas uz hover). Zvaigznes zelta krāsā. Klienta vārds un pasākuma tips.

`[JĀAPSTIPRINA: 3-5 reālas atsauksmes ar vārdiem]`

---

## DAĻA C — VIZUĀLAIS SLĪPĒJUMS

### C1. Hero

Šobrīd plakans. Vajadzīgs:
- Video vai attēla fons ar tumšu pārklājumu (`bg-bg/70`), lai teksts lasāms
- Virsraksts lielāks: `clamp(2.5rem, 7vw, 5.5rem)`, Space Grotesk, `tracking-tight`, `leading-[0.95]`
- Viens vārds virsrakstā zelta krāsā — akcents
- Zem virsraksta plāna zelta līnija, kas ievelkas no 0 līdz 80px platumam
- Scroll indikators apakšā ar maigu pulsāciju

### C2. Sekciju ritms

Nedrīkst visas sekcijas izskatīties vienādi. Mainīgs fons:

```
Hero          — video/attēls
Kā tas notiek — bg (#0F1419)
Produkti      — navy (#1A3A4A) ar smalku tekstūru
Par mums      — bg
Klienti       — navy
Atsauksmes    — bg
CTA           — zelta gradients, tumšs teksts
```

Vertikālā telpa: `py-24 md:py-32`. Šobrīd visdrīzāk par šauru.

### C3. Detaļas, kas atšķir amatieri no profesionāļa

- **Zelta apmales** — `1px`, ne `2px`. 2px izskatās rupji.
- **Ēnas** — mīkstas un zeltainas: `0 20px 60px -20px rgba(212,169,96,0.25)`, ne melnas
- **Rādiusi** — konsekventi: kartītes `rounded-2xl`, pogas `rounded-full`, attēli `rounded-xl`
- **Tipogrāfija** — virsraksti `tracking-tight`, ievadteksts `text-lg leading-relaxed opacity-80`
- **Cenas** — JetBrains Mono, zelta krāsā, lielākas par pārējo tekstu
- **Fokusa stāvokļi** — zelta gredzens visiem interaktīvajiem elementiem (piekļūstamība, nav neobligāta)
- **Nekādu tīri baltu tekstu** uz tumša fona — `#F5F5F0`, kā CLAUDE.md

### C4. Attēlu apstrāde

Visur `next/image` ar `sizes`, `priority` tikai hero attēlam. Placeholderiem `blurDataURL` navy tonī, lai nav baltu problesku ielādes laikā.

---

## DAĻA D — BUILD UN PĀRBAUDE

```bash
npm run build
npm run dev
```

Pārbaudi:
- Animācijas nokrīt vietā, nelec un neatkārtojas ritinot atpakaļ
- Klientu lente ritinās vienmērīgi, apstājas uz hover
- Sistēmas iestatījumos ieslēdz "reduce motion" — animācijas izslēdzas, saturs redzams
- Mobilajā (375px) nekas nepārplūst horizontāli
- Lighthouse: Performance > 90, Accessibility > 95

```bash
git add .
git commit -m "SOLIS1C: sākumlapas dizains, kustība, Par mums, klientu logo"
git push
```

`SOLIS1C-DONE.md` ar `[JĀAPSTIPRINA]` sarakstu.

---

## PIEŅEMŠANAS KRITĒRIJI

- [ ] `lib/motion.ts` eksistē, visas sekcijas lieto tos pašus variantus
- [ ] Katra sekcija animējas ienākot skatā, `once: true`
- [ ] Hero virsraksts animējas pa vārdiem
- [ ] Klientu logo lente ritinās bezgalīgi, apstājas uz hover
- [ ] "Par mums" sekcija ar animētiem skaitļiem
- [ ] Atsauksmju karuselis strādā
- [ ] `prefers-reduced-motion` respektēts
- [ ] Sekcijām mainīgs fons, ne visas vienādas
- [ ] Zelta apmales 1px, ēnas zeltainas
- [ ] Lighthouse Performance > 90
- [ ] Nav jaunu npm pakotņu

---

## `[JĀAPSTIPRINA]` — Robertam

1. Pasākumu skaits, inventāra vienību skaits, dibināšanas gads
2. Klientu logo faili — kuri uzņēmumi un vai drīkst publiskot
3. 3–5 reālas atsauksmes ar vārdiem
4. Komandas foto sadaļai "Par mums"
5. Hero video (15–30s montāža) vai hero attēls pagaidām

---

## KO NEDARĪT

- Nepievieno npm pakotnes — ne marquee bibliotēku, ne karuseļa bibliotēku, ne ikonu pakotni. Viss ar CSS un useState.
- Neanimē visu, kas kustas. Ja animācija nevada aci — tā ir troksnis.
- Nemaini produktu datus (SOLIS1B).
- Neveido rezervācijas plūsmu (SOLIS4).
