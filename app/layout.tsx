import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CookieConsent from "@/components/cookie-consent";
import ChatWidget from "@/components/chat-widget";

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
  title: "Anabella Party — Pasākumu inventāra noma Latvijā",
  description:
    "Foto kastes, piepūšamās atrakcijas, specefekti un audio grāmata Tavai neaizmirstamai ballītei. Piegāde Pierīgā bez maksas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="lv"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text font-body">
        <Navbar />
        <main className="flex-1 overflow-x-hidden">{children}</main>
        <Footer />
        <CookieConsent />
        <ChatWidget />
      </body>
    </html>
  );
}
