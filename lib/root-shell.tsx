// Kopīgais <html>/<body> apvalks abiem root izkārtojumiem: publiskajam
// app/[locale]/layout.tsx (lang = lokāle no params, statiski) un app/admin/layout.tsx
// (lang="lv"). Fonti, reveal skripts un noklusējuma metadati - viens avots.
import type { Metadata } from "next";
import { Space_Grotesk, Inter, Playfair_Display } from "next/font/google";
import { SITE_URL } from "@/lib/seo";
import { getSiteImage } from "@/lib/site-content";

// Publiskā lapa: TIKAI virsraksti (Space Grotesk) + teksts (Inter). Abi ir MAINĪGIE
// (variable) fonti → viens woff2 uz apakškopu (latin + latin-ext), aptver visus svarus
// (500/700 virsrakstiem, 400/600 tekstam). Skaidri norādīti svari ģenerētu atsevišķus
// statiskos failus katram svaram → vairāk woff2. JetBrains Mono ielādējas TIKAI admin
// izkārtojumā (skat. app/admin/(panel)/layout.tsx). Kopā publiskajā lapā = 4 woff2.
// Space Grotesk paliek TIKAI admin panelim (noklusējuma --font-heading). Publiskā
// lapa to nelieto → preload:false (fails ielādējas tikai adminā).
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: false,
});

// Publiskās lapas display fonts (redizains): Playfair Display - elegants, svinīgs
// serifs virsrakstiem. Mainīgais fonts → viens woff2 visiem svariem. Kirilica -
// atsevišķa saime bez preload (tikai RU lapām), tāpat kā Inter.
const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-playfair",
  display: "swap",
});
const playfairCyrillic = Playfair_Display({
  subsets: ["cyrillic"],
  variable: "--font-playfair-cyrillic",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

// RU lapām: kirilicas Inter kā otrā saime (body font-family rezerve). preload:false
// + unicode-range → fails ielādējas TIKAI, ja lapā ir kirilicas zīmes (LV/EN - 0 baitu).
// Space Grotesk kirilicu neatbalsta → RU virsraksti krīt uz šo Inter.
const interCyrillic = Inter({
  subsets: ["cyrillic"],
  variable: "--font-inter-cyrillic",
  display: "swap",
  preload: false,
});

// Reveal animācijas tikai ar JS (progressive enhancement, skat. globals.css .js-reveal).
// Ja hidratācija 3 s laikā nenotiek (lēns tīkls/JS kļūda), klasi noņem → saturs redzams.
export const REVEAL_SCRIPT =
  "(function(){var d=document.documentElement;d.classList.add('js-reveal');" +
  "setTimeout(function(){if(!window.__revealReady)d.classList.remove('js-reveal')},3000)})()";

// Rezerves OG attēls (og.fallback) — ja admin to iestatījis, kļūst par
// noklusējuma OG. Per-lapas metadata (ogMetadata) to pārraksta ar dinamisko /og.
export async function rootMetadata(): Promise<Metadata> {
  const ogFallback = await getSiteImage("og.fallback");
  return {
    metadataBase: new URL(SITE_URL),
    title: "Anabella Party — Pasākumu inventāra noma Latvijā",
    description:
      "Foto kastes, piepūšamās atrakcijas, specefekti un audio grāmata Tavai neaizmirstamai ballītei. Strādājam visā Latvijā.",
    ...(ogFallback
      ? { openGraph: { images: [{ url: ogFallback, width: 1200, height: 630 }] } }
      : {}),
  };
}

export function RootShell({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) {
  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${playfair.variable} ${playfairCyrillic.variable} ${inter.variable} ${interCyrillic.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-text font-body">
        {children}
      </body>
    </html>
  );
}
