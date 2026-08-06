import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CookieConsent from "@/components/cookie-consent";
import AnalyticsListener from "@/components/analytics-listener";
import ScrollToTopOnNav from "@/components/scroll-to-top-on-nav";
import BackToTop from "@/components/back-to-top";
import SiteFrame from "@/components/site-frame";

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

  return (
    <NextIntlClientProvider>
      <ScrollToTopOnNav />
      <SiteFrame navbar={<Navbar />} footer={<Footer />}>
        {children}
      </SiteFrame>
      <BackToTop />
      <CookieConsent />
      <AnalyticsListener />
    </NextIntlClientProvider>
  );
}
