# SOLIS0 — Setup + Home page + Deploy

**Mērķis:** No tukšas mapes līdz dzīvai lapai uz Vercel.

**Priekšnosacījumi:**
- Mape `C:\Projekti\Anabellaparty\` ir TUKŠA
- GitHub repo `infoailabspace-rgb/Anabellaparty` ir izdzēsts
- Vercel projekts `anabellaparty` ir izdzēsts
- Node.js 18+, `gh` un `vercel` CLI ir autentificēti

**Pirms sāc:** izlasi `CLAUDE.md`. Parādi plānu. Gaidi apstiprinājumu.

---

## 1. Scaffold

```bash
cd C:\Projekti\Anabellaparty
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --eslint --import-alias "@/*"
```

Atbildes: visur pieņem noklusējumu. `src/` — **NĒ**. Turbopack — **NĒ**.

**Pārbaudi:** `app/page.tsx` un `app/layout.tsx` eksistē mapes SAKNĒ.

---

## 2. Framer Motion

```bash
npm install framer-motion
```

Neinstalē neko citu. Nekādu Supabase, Stripe, next-intl, radix-ui — tie nāk vēlākos soļos.

---

## 3. Krāsas un fonti

**`app/globals.css`** — pievieno CSS mainīgos:

```css
:root {
  --navy: #1A3A4A;
  --gold: #D4A960;
  --rose-gold: #E8A87C;
  --bg: #0F1419;
  --text: #F5F5F0;
}

body {
  background: var(--bg);
  color: var(--text);
}
```

**`tailwind.config.ts`** — paplašini tēmu:

```ts
theme: {
  extend: {
    colors: {
      navy: '#1A3A4A',
      gold: '#D4A960',
      'rose-gold': '#E8A87C',
      bg: '#0F1419',
    },
    fontFamily: {
      display: ['var(--font-space-grotesk)', 'sans-serif'],
      body: ['var(--font-inter)', 'sans-serif'],
    },
  },
}
```

**`app/layout.tsx`** — fonti caur `next/font/google`:

```tsx
import { Space_Grotesk, Inter } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-space-grotesk',
});
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
});
```

`latin-ext` ir obligāts — bez tā ā, č, ē, ģ, ī, ķ, ļ, ņ, š, ū, ž nerenderēsies pareizi.

Metadata: `lang="lv"`, title, description latviski.

---

## 4. Komponenti

**`components/navbar.tsx`**
- Sticky, `backdrop-blur`, zelta border-bottom
- Logo pa kreisi, navigācija pa labi
- Linki: Sākums, Foto kastes, Atrakcijas, Inventārs, Kontakti
- Poga "Rezervēt" — zelta, uz `/rezervet`
- Mobilajā: hamburger izvēlne
- `'use client'`

**`components/footer.tsx`**
- Kontakti: +371 29222761, info@anabellaparty.lv
- Sociālie: Instagram, Facebook, WhatsApp (parasti `<a>` linki)
- Legal linki: `/noteikumi`, `/privatuma-politika`
- Copyright

---

## 5. Home page (`app/page.tsx`)

Sekcijas:

1. **Hero** — pilnekrāna, video placeholder (`<div>` ar gradientu, `/public/videos/` vēl tukšs), H1 "Neaizmirstamas ballītes sākas šeit", divas pogas: "Rezervēt" (zelta) un "Apskatīt inventāru" (outline)
2. **Kā tas notiek** — 3 soļi: Izvēlies → Rezervē → Mēs atbraucam
3. **Produkti** — 4 kartītes ar cenām no CLAUDE.md
4. **Atsauksmes** — 3 placeholder atsauksmes
5. **CTA** — "Gatavs svinēt?" + poga

Framer Motion: `whileInView` fade-up katrai sekcijai. Nekādu smagu animāciju.

---

## 6. Build pārbaude

```bash
npm run build
```

**Ja ir kaut viena kļūda — labo un palaid vēlreiz. NEPĀREJ uz 7. punktu, kamēr build nav tīrs.**

```bash
npm run dev
```

Atver http://localhost:3000, pārbaudi:
- Latviešu burti renderējas pareizi
- Navbar sticky darbojas
- Mobilā izvēlne atveras
- Nav konsoles kļūdu

---

## 7. GitHub

```bash
git init
git add .
git commit -m "SOLIS0: Next.js 14 scaffold + home page"
gh repo create infoailabspace-rgb/Anabellaparty --public --source=. --push
```

---

## 8. Vercel

```bash
vercel link
vercel --prod
```

**Sagaidāmais rezultāts:** zaļš deployment, dzīvs URL.

---

## 9. Atskaite

Izveido `SOLIS0-DONE.md`:
- Kas izbūvēts
- Dzīvais URL
- `npm run build` izvade (pēdējās rindas)
- Kas nepieciešams SOLIS1

Atjauno `CLAUDE.md` soļu tabulu: SOLIS0 → ✅

---

## PIEŅEMŠANAS KRITĒRIJI

- [ ] `app/page.tsx` ir mapes SAKNĒ, ne apakšmapē
- [ ] `npm run build` iet cauri bez kļūdām LOKĀLI
- [ ] package.json satur tikai: next, react, react-dom, typescript, tailwindcss, postcss, autoprefixer, framer-motion, eslint, eslint-config-next, @types/*
- [ ] Latviešu diakritiskās zīmes renderējas pareizi
- [ ] Vercel deployment ir zaļš
- [ ] URL atveras pārlūkā

---

## KO NEDARĪT ŠAJĀ SOLĪ

- Nepievieno Supabase, Stripe, Resend, next-intl, radix-ui, shadcn
- Neveido produktu lapas (tas ir SOLIS1)
- Neveido čatbotu (SOLIS3)
- Nepieskaries DNS (SOLIS6)
- Nerakstīt versiju numurus manuāli package.json
