import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/seo/json-ld";
import { graph, breadcrumbNode, articleNode } from "@/lib/schema";
import { getPostBySlug, getRelatedPosts, CATEGORY_LABEL } from "@/lib/blog";
import { getProductBySlug } from "@/lib/catalog";
import { alternatesFor, ogMetadata } from "@/lib/seo";
import ShareButtons from "./share-buttons";
import ArticleContent from "./article-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Raksts nav atrasts | Anabella Party" };
  const title = `${post.title} | Anabella Party`;
  const description = post.metaDescription;
  const md: Metadata = {
    title,
    description,
    alternates: alternatesFor(locale, `/blogs/${slug}`),
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

export const revalidate = 300;

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
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
            className="text-xs font-semibold uppercase tracking-wide text-gold hover:underline"
          >
            {CATEGORY_LABEL[post.category] ?? post.category}
          </Link>
        )}
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-sm text-text/50">
          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("lv") : ""} ·{" "}
          {post.readingMin} min lasīšana
        </p>

        {post.cover && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-gold/20">
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
          <div className="mt-14 rounded-2xl border border-gold/25 bg-navy/25 p-6">
            <h2 className="font-display text-xl font-bold">Izmantotais inventārs</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {related.map((p) => {
                const priced = p.tiers.filter((t) => t.price > 0).map((t) => t.price);
                const from = priced.length
                  ? `no €${Math.min(...priced)}`
                  : "Cena vienojoties";
                return (
                  <div
                    key={p.slug}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gold/20 bg-bg/40 p-4"
                  >
                    <div>
                      <p className="font-display font-semibold text-text">{p.name}</p>
                      <p className="font-mono text-sm text-gold">{from}</p>
                    </div>
                    <Link
                      href={`/rezervet?item=${p.slug}`}
                      className="shrink-0 rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
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
            <h2 className="font-display text-xl font-bold">Lasi arī</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/blogs/${rp.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-gold/20 bg-navy/25 transition-colors hover:border-gold/50"
                >
                  {rp.cover && (
                    <div className="aspect-[16/10] overflow-hidden bg-navy">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={rp.cover} alt={rp.coverAlt} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-display text-sm font-semibold text-text group-hover:text-gold">{rp.title}</p>
                    <p className="mt-1 text-xs text-text/40">{rp.readingMin} min</p>
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
