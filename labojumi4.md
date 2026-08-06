# LABOJUMI 4 — Pilnīga satura tulkošana

**Prasība:** `/en` un `/ru` — **nulle** latviešu vārdu. Bez izņēmumiem.

Iepriekš teicu, ka produktu nosaukumi paliek LV. **Tas atcelts.** Roberts nolēmis: tulko visu.

---

## 1. KAS PALIKA NETULKOTS

No ekrānattēliem, sagrupēts pa cēloņiem:

### A. Produktu nosaukumi
```
SPOGULIS · OZOLS · INSTAGRAM
Baltā pils XL · Baltie pils torņi · Mini pilskalniņš
Video viesu grāmata — melns retro video telefons
Auksto dzirksteļu ierīce (salūts)
Foto kaste uz periodu · Foto kaste uz visu dienu
Masu pasākumiem — „Mēs maksājam Jums!"
```

### B. Specifikāciju **etiķetes** un **vērtības**
```
Etiķetes:  IZMĒRI (G×P×A) · VECUMS · SVARS · PIEEJAMAS · DARBĪBA · AUGSTUMS
Vērtības:  "līdz 200 kg" · "4 ierīces" · "līdz 8 min dzirksteļu"
```

Skaitļi un mērvienības (`5 × 4 × 4 m`, `2+`, `1–5 m`) paliek — tur nav ko tulkot. Bet vārdi vērtībās (`līdz`, `ierīces`, `dzirksteļu`) jātulko.

### C. Cenu piezīmes un papildinājumi
```
"Katra nākamā stunda +110 €"
"Uz visu pasākumu — cena vienojoties"
"+ Sarkanais paklājs un stabiņi — 40 €"
"+ Baltas bumbas (2500–3500 gb) — 20 €"
"par 1 gb (uzpildīta, gatava)"
"+ Pulveris (100 g) — 10 €"
"Cena vienojoties"    ← dažviet tulkots, dažviet nē
"Sazināties"
```

### D. Galerijas placeholder
Rāda produkta nosaukumu — tulkojas automātiski, kad A ir salabots.

---

## 2. DATUBĀZES SHĒMAS MAIŅA

Cēlonis: šie lauki nav `jsonb {lv,en,ru}`, bet vienkāršs teksts.

```sql
-- 1. Nosaukums
alter table products alter column name type jsonb
  using jsonb_build_object('lv', name, 'en', name, 'ru', name);
```

**`tiers`, `add_ons`, `specs`** jau ir `jsonb`, bet iekšējie teksti vienvalodīgi. Jaunā struktūra:

```ts
type ML = { lv: string; en: string; ru: string };

type PriceTier = {
  duration: ML;        // "2h" paliek, bet "Uz visu pasākumu" tulkojas
  price: number | null;
  note?: ML;           // "Katra nākamā stunda +110 €"
};

type AddOn = {
  name: ML;            // "Sarkanais paklājs un stabiņi"
  price: number;
  unit?: ML;           // "gb" → "pcs" / "шт"
};

type Spec = {
  label: ML;           // "Izmēri (G×P×A)"
  value: ML;           // "līdz 200 kg" → "up to 200 kg"
};
```

**Migrācijas skripts** `scripts/migrate-ml-fields.ts`:
1. Nolasa esošos ierakstus
2. Katru virkni ietin `{ lv: <esošais>, en: '', ru: '' }`
3. Ieraksta atpakaļ

**Nepalaid divreiz** — pārbaudi, vai lauks jau ir `{lv,...}` formā, un tad izlaid.

---

## 3. TULKOJUMI

Pēc migrācijas aizpildi EN un RU visiem laukiem.

### Produktu nosaukumi

| LV | EN | RU |
|---|---|---|
| SPOGULIS | MIRROR | ЗЕРКАЛО |
| OZOLS | OAK | ДУБ |
| INSTAGRAM | INSTAGRAM | INSTAGRAM |
| Foto kaste uz visu dienu | Full-day photo booth | Фотобудка на весь день |
| Foto kaste uz periodu | Long-term photo booth rental | Фотобудка на длительный срок |
| Masu pasākumiem — „Mēs maksājam Jums!" | For large events — "We pay you!" | Для массовых мероприятий — «Мы платим вам!» |
| MEGA Baltā pils | MEGA White Castle | МЕГА Белый замок |
| Baltā pils XL | White Castle XL | Белый замок XL |
| Baltie pils torņi | White Castle Towers | Белые башни замка |
| Baltais pils tornis L | White Castle Tower L | Белая башня замка L |
| Baltais pils tornis S | White Castle Tower S | Белая башня замка S |
| Mini pilskalniņš | Mini Castle | Мини-замок |
| Baltā bumbu vanna | White Ball Pit | Белый сухой бассейн |
| Baltais komplekts 1 / 2 | White Set 1 / 2 | Белый комплект 1 / 2 |
| Baltais Mega komplekts | White Mega Set | Белый мега-комплект |
| Video viesu grāmata — melns retro video telefons | Video guest book — black retro video phone | Видеокнига гостей — чёрный ретро-видеотелефон |
| Audio viesu grāmata — retro telefons | Audio guest book — retro phone | Аудиокнига гостей — ретро-телефон |
| Dekoratīva būdiņa | Decorative booth | Декоративная будка |
| Dekoratīva siena video telefonam | Decorative wall for video phone | Декоративная стена для видеотелефона |
| Koka USB ar gravējumu | Engraved wooden USB | Деревянная USB с гравировкой |
| Auksto dzirksteļu ierīce (salūts) | Cold spark machine (fountain) | Машина холодных искр (фонтан) |
| Zemās miglas ierīce | Low fog machine | Генератор низкого тумана |
| Burbuļu ierīce | Bubble machine | Генератор пузырей |
| Šampanieša siena (50 glāzes) | Champagne wall (50 glasses) | Стена шампанского (50 бокалов) |
| Dārza krēsli | Garden chairs | Садовые стулья |
| Zelta norobežojošie stabiņi + sarkanais paklājs | Gold stanchions + red carpet | Золотые стойки + красная дорожка |
| LED uzraksts „Tikko precējušies" | LED sign "Just Married" | LED-вывеска «Молодожёны» |
| LED uzraksts „Ballīte" | LED sign "Party" | LED-вывеска «Вечеринка» |
| LED uzraksts „Svinam dzīvi" | LED sign "Celebrate Life" | LED-вывеска «Празднуем жизнь» |
| VIP / LUX kubls | VIP / LUX hot tub | VIP / LUX чан |
| Kubls ar 13 m² terasi | Hot tub with 13 m² deck | Чан с террасой 13 м² |
| Mobilā pirts | Mobile sauna | Мобильная баня |
| Pirts + kubls (komplekts) | Sauna + hot tub (set) | Баня + чан (комплект) |

**INSTAGRAM nemainās** — tas ir platformas nosaukums.

Sarakstā var trūkt kāda produkta — iztulko pēc tā paša principa.

### Specifikāciju etiķetes

| LV | EN | RU |
|---|---|---|
| Izmēri (G×P×A) | Dimensions (L×W×H) | Размеры (Д×Ш×В) |
| Vecums | Age | Возраст |
| Svars | Weight limit | Ограничение по весу |
| Pieejamas | Available | Доступно |
| Darbība | Runtime | Время работы |
| Augstums | Height | Высота |
| Ietilpība | Capacity | Вместимость |

### Specifikāciju vērtības

| LV | EN | RU |
|---|---|---|
| līdz 200 kg | up to 200 kg | до 200 кг |
| līdz 250 kg | up to 250 kg | до 250 кг |
| 4 ierīces | 4 units | 4 устройства |
| līdz 8 min dzirksteļu | up to 8 min of sparks | до 8 мин искр |
| līdz 6 cilvēkiem | up to 6 people | до 6 человек |
| 6–8 cilvēkiem | 6–8 people | 6–8 человек |

### Tarifi un piezīmes

| LV | EN | RU |
|---|---|---|
| Katra nākamā stunda | Each additional hour | Каждый следующий час |
| Uz visu pasākumu — cena vienojoties | For the whole event — price by arrangement | На всё мероприятие — цена по договорённости |
| Cena vienojoties | Price by arrangement | Цена по договорённости |
| par 1 gb (uzpildīta, gatava) | per unit (filled, ready to use) | за 1 шт (заправлена, готова) |
| 1 diena | 1 day | 1 день |
| Drošības nauda | Security deposit | Залог |

Stundu apzīmējumi (`2h`, `10h`, `24h`) paliek — starptautiski saprotami.

### Papildinājumi

| LV | EN | RU |
|---|---|---|
| Sarkanais paklājs un stabiņi | Red carpet and stanchions | Красная дорожка и стойки |
| Baltas bumbas (2500–3500 gb) | White balls (2,500–3,500 pcs) | Белые шары (2500–3500 шт) |
| Pulveris (100 g) | Powder (100 g) | Порошок (100 г) |
| Šķidrums (1 L) | Fluid (1 L) | Жидкость (1 л) |
| Glāzes | Glasses | Бокалы |
| Info statīvs (rāmītis) | Info stand (frame) | Инфостойка (рамка) |
| USB koka kastīte ar gravējumu | Engraved wooden USB box | Деревянная USB-коробка с гравировкой |
| Video apsveikumu montāža | Video greeting editing | Монтаж видеопоздравлений |
| Foto papīra rullis (līdz 800 izdrukām) | Photo paper roll (up to 800 prints) | Рулон фотобумаги (до 800 отпечатков) |

### Pogas un UI

| LV | EN | RU |
|---|---|---|
| Sazināties | Contact us | Связаться |
| Pievienot | Add | Добавить |
| Apskatīt | View | Смотреть |
| Nomā iekļauts | Included in the rental | Входит в аренду |

---

## 4. ADMIN PANELIS

`/admin/inventars` jāpapildina ar LV/EN/RU cilnēm arī šiem laukiem:

- Nosaukums
- Tarifu ilgums un piezīmes
- Papildinājumu nosaukumi un mērvienības
- Specifikāciju etiķetes un vērtības

Saglabāšana nedestruktīva — tukšs lauks nepārraksta esošo vērtību.

---

## 5. LOGO NAVBAR

Ekrānattēlos logo trūkst vai pārklājas ar izvēlni.

```tsx
<nav className="flex items-center justify-between h-24 px-6 lg:px-10 max-w-[1600px] mx-auto">
  <Link href="/" className="shrink-0">          {/* shrink-0 obligāts */}
    <Image ... className="h-16 w-auto" />
  </Link>

  <div className="flex items-center gap-1 ml-10">
    {/* navigācija */}
  </div>

  <div className="flex items-center gap-4">
    {/* Rezervēt, valodas, sociālās */}
  </div>
</nav>
```

**`shrink-0` uz logo saites ir kritiskais.** Bez tā flex saspiež logo, kad navigācijai pietrūkst vietas — tāpēc tas ekrānattēlos pazuda vai kļuva par svītru.

Ja pie šaurāka platuma logo un navigācija sāk pārklāties, ej uz hamburger agrāk (`xl:` vietā `lg:`), nevis saspied logo.

---

## 6. PĀRBAUDE

**Metode:** atver `/en`, tad `/ru`. Izej cauri katrai lapai un **izlasi katru vārdu ekrānā.** Nemeklē kodā.

Lapas: `/`, `/foto-kaste`, `/foto-kaste/ai-foto`, `/piepusamas-atrakcijas`, `/svinibu-inventars` un 4 apakšlapas, `/rezervet` (visi 4 soļi + kļūdu paziņojumi), `/kontakti`, `/faq`, `/musu-draugi`, `/noteikumi`, `/privatuma-politika`.

Katrā produktā pārbaudi: nosaukums, tagline, apraksts, "Nomā iekļauts" saraksts, specifikāciju etiķetes UN vērtības, cenu piezīmes, papildinājumi, pogas, galerijas placeholder.

- [ ] Nulle latviešu vārdu `/en`
- [ ] Nulle latviešu vārdu `/ru`
- [ ] Logo redzams, nepārklājas, `shrink-0`
- [ ] Admin panelī visi lauki rediģējami trīs valodās
- [ ] Migrācijas skripts nesabojā datus, palaižot divreiz
- [ ] `npm run build` tīrs

**Vienīgais, kas paliek LV visās valodās:** atsauksmes (reāli citāti) un uzņēmumu nosaukumi klientu sadaļā (īpašvārdi).
