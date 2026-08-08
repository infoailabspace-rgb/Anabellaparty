import { getPublishedPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 300;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const posts = await getPublishedPosts({ limit: 50 });
  const items = posts
    .map((p) => {
      const link = `${SITE_URL}/blogs/${p.slug}/`;
      const date = p.publishedAt ? new Date(p.publishedAt).toUTCString() : "";
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      ${date ? `<pubDate>${date}</pubDate>` : ""}
      <description>${esc(p.excerpt)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Anabella Party — Blogs</title>
    <link>${SITE_URL}/blogs/</link>
    <description>Stāsti no pasākumiem, padomi un jaunumi.</description>
    <language>lv</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
