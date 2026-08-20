import type { MetadataRoute } from "next";

const base =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.anabellaparty.lv";

// AI/atbilžu dzinēju crawler-i, kas baro ChatGPT, Claude, Perplexity un Google
// AI Overviews — skaidri atļauti (AEO 6. solis). /admin/ vienmēr bloķēts.
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "Bingbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...AI_BOTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: "/admin/",
      })),
      { userAgent: "*", allow: "/", disallow: "/admin/" },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
