import { cache } from "react";
import { marked } from "marked";
import { publicClient } from "@/lib/sb-public";
import { currentLocale, pickStr } from "@/lib/i18n-db";

export const BLOG_CATEGORIES = [
  "kazas",
  "berni",
  "korporativie",
  "padomi",
  "jaunumi",
] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const CATEGORY_LABEL: Record<string, string> = {
  kazas: "Kāzas",
  berni: "Bērnu ballītes",
  korporativie: "Korporatīvie",
  padomi: "Padomi",
  jaunumi: "Jaunumi",
};

export type BlogListItem = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string | null;
  coverAlt: string;
  category: string | null;
  publishedAt: string | null;
  readingMin: number;
};

export type BlogPostFull = BlogListItem & {
  contentMd: string;
  contentHtml: string;
  metaDescription: string;
  gallery: string[];
  tags: string[];
  relatedProducts: string[];
};

// marked KONFIGURĒTS BEZ raw HTML — renderer.html atgriež "", tāpēc jebkurš
// AI ieliktais <script>/<iframe>/inline HTML tiek izmests. Saturs ir markdown.
marked.use({
  breaks: true,
  gfm: true,
  renderer: {
    html: () => "",
  },
});

export function renderMarkdown(md: string): string {
  return marked.parse(md ?? "", { async: false }) as string;
}

export function readingMinutes(md: string): number {
  const words = (md ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toListItem(r: any, locale: string): BlogListItem {
  return {
    slug: r.slug,
    title: pickStr(r.title, locale),
    excerpt: pickStr(r.excerpt, locale),
    cover: r.cover_url ?? null,
    coverAlt: pickStr(r.cover_alt, locale) || pickStr(r.title, locale),
    category: r.category ?? null,
    publishedAt: r.published_at ?? null,
    readingMin: readingMinutes(pickStr(r.content, locale)),
  };
}

export const getPublishedPosts = cache(
  async (opts?: { category?: string; limit?: number }): Promise<BlogListItem[]> => {
    const sb = publicClient();
    if (!sb) return [];
    try {
      const locale = await currentLocale();
      let q = sb
        .from("blog_posts")
        .select("slug,title,excerpt,cover_url,cover_alt,category,published_at,content")
        .eq("status", "published")
        .lte("published_at", new Date().toISOString())
        .order("published_at", { ascending: false });
      if (opts?.category) q = q.eq("category", opts.category);
      if (opts?.limit) q = q.limit(opts.limit);
      const { data } = await q;
      return (data ?? []).map((r) => toListItem(r, locale));
    } catch {
      return [];
    }
  },
);

export async function getPostBySlug(slug: string): Promise<BlogPostFull | null> {
  const sb = publicClient();
  if (!sb) return null;
  try {
    const locale = await currentLocale();
    const { data } = await sb
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .maybeSingle();
    if (!data) return null;
    const contentMd = pickStr(data.content, locale);
    return {
      ...toListItem(data, locale),
      contentMd,
      contentHtml: renderMarkdown(contentMd),
      metaDescription: pickStr(data.meta_description, locale) || pickStr(data.excerpt, locale),
      gallery: Array.isArray(data.gallery) ? data.gallery : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      relatedProducts: Array.isArray(data.related_products) ? data.related_products : [],
    };
  } catch {
    return null;
  }
}

// 3 saistītie raksti — tā pati kategorija, citādi jaunākie.
export async function getRelatedPosts(
  slug: string,
  category: string | null,
  limit = 3,
): Promise<BlogListItem[]> {
  const inCat = await getPublishedPosts(category ? { category } : undefined);
  const picked = inCat.filter((p) => p.slug !== slug).slice(0, limit);
  if (picked.length >= limit || !category) return picked;
  const recent = await getPublishedPosts();
  const extra = recent.filter(
    (p) => p.slug !== slug && !picked.some((f) => f.slug === p.slug),
  );
  return [...picked, ...extra].slice(0, limit);
}

// Publicēto rakstu slug saraksts (sitemap).
export async function getPublishedSlugs(): Promise<{ slug: string; updated: string }[]> {
  const sb = publicClient();
  if (!sb) return [];
  try {
    const { data } = await sb
      .from("blog_posts")
      .select("slug,updated_at,published_at")
      .eq("status", "published")
      .lte("published_at", new Date().toISOString());
    return (data ?? []).map((r: any) => ({
      slug: r.slug,
      updated: r.updated_at ?? r.published_at ?? new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
