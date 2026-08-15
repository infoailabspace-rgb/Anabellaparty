import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import SectionHero from "@/components/section-hero";
import JsonLd from "@/components/seo/json-ld";
import { graph, breadcrumbNode } from "@/lib/schema";
import { getPublishedPosts } from "@/lib/blog";
import { alternatesFor, ogMetadata } from "@/lib/seo";
import BlogList from "./blog-list";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = "Blogs | Anabella Party";
  const description =
    "Stāsti no pasākumiem, praktiski padomi un jaunumi — Anabella Party svētku inventārs Latvijā.";
  return {
    title,
    description,
    alternates: alternatesFor(locale, "/blogs"),
    ...(await ogMetadata(locale, "/blogs", title, description)),
  };
}

export const revalidate = 300;

export default async function BlogsPage() {
  const [locale, posts] = await Promise.all([getLocale(), getPublishedPosts()]);
  return (
    <>
      <JsonLd
        data={graph(breadcrumbNode(locale, [{ name: "Blogs", path: "/blogs" }]))}
      />
      <SectionHero
        title="Blogs"
        tagline="Stāsti no pasākumiem, praktiski padomi un jaunumi."
        heroKey="blog"
      />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <BlogList posts={posts} />
      </div>
    </>
  );
}
