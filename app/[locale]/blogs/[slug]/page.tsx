import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getLocale, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/seo/json-ld";
import { graph, breadcrumbNode, articleNode } from "@/lib/schema";
import {
  getPostBySlug,
  getRelatedPosts,
  CATEGORY_LABEL,
  getPublishedPosts,
} from "@/lib/blog";
import { getProductBySlug } from "@/lib/catalog";
import { routing } from "@/i18n/routing";
import { translatedAlternates, ogMetadata } from "@/lib/seo";
import ShareButtons from "./share-buttons";
import ArticleContent from "./article-content";
import { formatTimestampDateRiga } from "@/lib/riga-time";
import { sbImage } from "@/lib/sb-image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Raksts nav atrasts | Anabella Party" };
  const title = `${post.title} | Anabella Party`;
  const description = post.metaDescription;
  // en/ru → canonical uz LV + noindex,follow, IZŅEMOT ja rakstam ir reāls
  // tulkojums (title+content) tajā valodā → tad self-canonical + hreflang.
  const { alternates, robots } = translatedAlternates(
    locale,
    `/blogs/${slug}`,
    post.translatedLocales,
  );
  const md: Metadata = {
    title,
    description,
    alternates,
    robots,
    ...(await ogMetadata(locale, `/blogs/${slug}`, title, description)),
  };
  if (post.cover) {
    md.openGraph = {
      ...(md.openGraph ?? {}),
      images: [{ url: post.cover }],
    };
  }
  return md;
}

export const revalidate = 3600;

// Priekšrenderē zināmos rakstus (locale × slug); jauni raksti - ISR pēc pieprasījuma.
export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return routing.locales.flatMap((locale) =>
    posts.map((p) => ({ locale, slug: p.slug })),
  );
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [related, relatedPosts] = await Promise.all([
    Promise.all(post.relatedProducts.map((s) => getProductBySlug(s))).then((r) =>
      r.filter((p): p is NonNullable<typeof p> => Boolean(p)),
    ),
    getRelatedPosts(slug, post.category, 3),
  ]);

  return (
    <>
      <JsonLd
        data={graph(
          articleNode(post, locale),
          breadcrumbNode(locale, [
            { name: "Blogs", path: "/blogs" },
            { name: post.title, path: `/blogs/${slug}` },
          ]),
        )}
      />

      <article className="mx-auto max-w-3xl px-6 py-16">
        {post.category && (
          <Link
            href={`/blogs`}
            className="inline-flex min-h-11 items-center text-xs font-semibold uppercase tracking-wide text-gold hover:underline"
          >
            {CATEGORY_LABEL[post.category] ?? post.category}
          </Link>
        )}
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-sm text-text-muted">
          {post.publishedAt ? formatTimestampDateRiga(post.publishedAt) : ""} ·{" "}
          {post.readingMin} min lasīšana
        </p>

        {post.cover && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-card border border-gold/20">
            <Image
              src={post.cover}
              alt={post.coverAlt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        <ArticleContent html={post.contentHtml} />

        {/* Saistītie produkti */}
        {related.length > 0 && (
          <div className="mt-14 rounded-card border border-gold/25 bg-navy/25 p-6">
            <h2 className="font-display text-xl font-semibold">Izmantotais inventārs</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {related.map((p) => {
                const priced = p.tiers.filter((t) => t.price > 0).map((t) => t.price);
                const from = priced.length
                  ? `no €${Math.min(...priced)}`
                  : "Cena vienojoties";
                return (
                  <div
                    key={p.slug}
                    className="flex items-center justify-between gap-3 rounded-tile border border-gold/20 bg-bg/40 p-4"
                  >
                    <div>
                      <p className="font-display font-semibold text-text">{p.name}</p>
                      <p className="font-mono text-sm text-gold">{from}</p>
                    </div>
                    <Link
                      href={`/rezervet?item=${p.slug}`}
                      className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-gold px-5 text-sm font-semibold text-on-gold transition-colors hover:bg-gold/90"
                    >
                      Rezervēt
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dalīšanās */}
        <div className="mt-12 border-t border-gold/15 pt-6">
          <ShareButtons />
        </div>

        {/* Saistītie raksti */}
        {relatedPosts.length > 0 && (
          <div className="mt-14">
            <h2 className="font-display text-xl font-semibold">Lasi arī</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/blogs/${rp.slug}`}
                  className="group flex flex-col overflow-hidden rounded-tile border border-gold/20 bg-navy/25 transition-colors hover:border-gold/50"
                >
                  {rp.cover && (
                    <div className="aspect-[16/10] overflow-hidden bg-navy">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={sbImage(rp.cover, 640)} width={640} height={400} alt={rp.coverAlt} loading="lazy" decoding="async" className="h-full w-full object-cover transition-colors duration-(--duration-slow)" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-display text-sm font-semibold text-text group-hover:text-gold">{rp.title}</p>
                    <p className="mt-1 text-xs text-text-muted">{rp.readingMin} min</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}
