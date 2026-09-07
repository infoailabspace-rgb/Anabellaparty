import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { routing } from "@/i18n/routing";
import { namespacesForPath, pickMessages } from "@/lib/messages-scope";
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

  // Klientam sūta TIKAI maršrutam vajadzīgās tulkojumu telpas (nevis visu lv.json).
  // Server komponentes turpina lietot pilnās ziņas caur getTranslations.
  const pathname = (await headers()).get("x-pathname") ?? "";
  const namespaces = namespacesForPath(pathname);
  const allMessages = await getMessages();
  const clientMessages = namespaces
    ? pickMessages(allMessages, namespaces)
    : allMessages;

  return (
    <NextIntlClientProvider locale={locale} messages={clientMessages}>
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
