import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SectionHero from "@/components/section-hero";
import JsonLd from "@/components/seo/json-ld";
import { graph, breadcrumbNode } from "@/lib/schema";
import {
  getPublishedPosts,
  BLOG_CATEGORIES,
  CATEGORY_LABEL,
  type BlogCategory,
} from "@/lib/blog";
import { alternatesFor, ogMetadata } from "@/lib/seo";
import BlogList from "../../blog-list";

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((cat) => ({ cat }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; cat: string }>;
}): Promise<Metadata> {
  const { locale, cat } = await params;
  const label = CATEGORY_LABEL[cat] ?? "Blogs";
  const title = `${label} | Anabella Party blogs`;
  const description = `${label} — raksti un padomi no Anabella Party.`;
  return {
    title,
    description,
    alternates: alternatesFor(locale, `/blogs/kategorija/${cat}`),
    ...(await ogMetadata(locale, `/blogs/kategorija/${cat}`, title, description)),
  };
}

export const revalidate = 300;

export default async function CategoryArchivePage({
  params,
}: {
  params: Promise<{ locale: string; cat: string }>;
}) {
  const { locale, cat } = await params;
  if (!BLOG_CATEGORIES.includes(cat as BlogCategory)) notFound();
  const posts = await getPublishedPosts({ category: cat });
  const label = CATEGORY_LABEL[cat];

  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbNode(locale, [
            { name: "Blogs", path: "/blogs" },
            { name: label, path: `/blogs/kategorija/${cat}` },
          ]),
        )}
      />
      <SectionHero
        title={label}
        tagline={`Raksti kategorijā “${label}”.`}
        heroKey="blog"
      />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <BlogList posts={posts} />
      </div>
    </>
  );
}
