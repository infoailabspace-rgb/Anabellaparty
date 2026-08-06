import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { getLocale } from "next-intl/server";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

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

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Anabella Party — Pasākumu inventāra noma Latvijā",
  description:
    "Foto kastes, piepūšamās atrakcijas, specefekti un audio grāmata Tavai neaizmirstamai ballītei. Piegāde Ķekavas novadā bez maksas.",
};

// Root layout — <html>/<body>, fonti. Lokalizēto chrome nodrošina [locale]/layout.
// Admin (/admin/*) renderējas šeit bez publiskā chrome (tam savs izkārtojums).
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text font-body">
        {children}
      </body>
    </html>
  );
}
