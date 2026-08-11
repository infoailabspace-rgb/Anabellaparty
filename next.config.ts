import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const isDev = process.env.NODE_ENV !== "production";

// Content-Security-Policy.
// - script/style 'unsafe-inline': App Router injektē inline hidratācijas/RSC
//   skriptus un GTM injektē inline; statisks headers() bez nonce tos nevar aizvietot.
// - 'unsafe-eval' TIKAI izstrādē (React Fast Refresh) — produkcijā to nav.
// - Analītika (GTM/GA4/FB Pixel) ielādējas tikai pēc sīkdatņu piekrišanas,
//   tāpēc to hosti ir atļauti script/connect/frame direktīvās.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' blob: https://*.supabase.co",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://connect.facebook.net https://www.google-analytics.com https://www.clarity.ms https://*.clarity.ms`,
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com https://*.analytics.google.com https://connect.facebook.net https://www.facebook.com https://www.clarity.ms https://*.clarity.ms https://c.bing.com",
  "frame-src 'self' https://www.googletagmanager.com https://www.facebook.com https://td.doubleclick.net https://www.google.com https://maps.google.com",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // Mozello URL saglabāšana + konsekventi canonical (/foto-kaste/).
  trailingSlash: true,
  images: {
    // Supabase Storage attēli (admin augšupielādes) caur next/image.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
