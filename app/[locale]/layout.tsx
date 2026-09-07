import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { routing } from "@/i18n/routing";
import { CLIENT_NAMESPACES, pickMessages } from "@/lib/messages-scope";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import GtagScripts from "@/components/gtag-scripts";
import CookieConsent from "@/components/cookie-consent";
import AnalyticsListener from "@/components/analytics-listener";
import ScrollToTopOnNav from "@/components/scroll-to-top-on-nav";
import BackToTop from "@/components/back-to-top";
import StickyCall from "@/components/sticky-call";
import SiteFrame from "@/components/site-frame";
import SiteTexture from "@/components/site-texture";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  // Klientam sūta TIKAI klienta komponenšu telpas (statiski, bez headers() → lapa
  // var būt ISR). Server komponentes turpina lietot pilnās ziņas caur getTranslations.
  const clientMessages = pickMessages(await getMessages(), CLIENT_NAMESPACES);

  return (
    <NextIntlClientProvider locale={locale} messages={clientMessages}>
      {/* Root <html lang> ir statiski "lv"; en/ru lapām uzstāda pareizo valodu. */}
      {locale !== "lv" && (
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.lang=${JSON.stringify(locale)}`,
          }}
        />
      )}
      <GtagScripts />
      <SiteTexture />
      <ScrollToTopOnNav />
      <SiteFrame navbar={<Navbar />} footer={<Footer />}>
        {children}
      </SiteFrame>
      <BackToTop />
      <StickyCall />
      <CookieConsent />
      <AnalyticsListener />
      <Analytics />
    </NextIntlClientProvider>
  );
}
