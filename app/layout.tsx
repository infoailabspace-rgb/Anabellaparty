import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { SITE_URL } from "@/lib/seo";
import { getSiteImage } from "@/lib/site-content";
import "./globals.css";

// Publiskā lapa: TIKAI virsraksti (Space Grotesk) + teksts (Inter). Abi ir MAINĪGIE
// (variable) fonti → viens woff2 uz apakškopu (latin + latin-ext), aptver visus svarus
// (500/700 virsrakstiem, 400/600 tekstam). Skaidri norādīti svari ģenerētu atsevišķus
// statiskos failus katram svaram → vairāk woff2. JetBrains Mono ielādējas TIKAI admin
// izkārtojumā (skat. app/admin/(panel)/layout.tsx). Kopā publiskajā lapā = 4 woff2.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

// Rezerves OG attēls (og.fallback) — ja admin to iestatījis, kļūst par
// noklusējuma OG. Per-lapas metadata (ogMetadata) to pārraksta ar dinamisko /og.
export async function generateMetadata(): Promise<Metadata> {
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

// Root layout — <html>/<body>, fonti. Lokalizēto chrome nodrošina [locale]/layout.
// Admin (/admin/*) renderējas šeit bez publiskā chrome (tam savs izkārtojums).
// lang="lv" statiski (LV ir noklusējums; en/ru ir noindex sekundārie) — NElieto
// getLocale(), kas lasa headers un padarītu VISUS maršrutus dinamiskus. Pareizo
// valodu en/ru lapām uzstāda [locale]/layout ar mazu inline skriptu.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="lv"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text font-body">
        {children}
      </body>
    </html>
  );
}
