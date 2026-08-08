import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllProducts } from "@/lib/catalog";
import BlogEditor, { type BlogProduct, type EditPost } from "../blog-editor";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, products] = await Promise.all([
    supabase.from("blog_posts").select("*").eq("id", id).maybeSingle(),
    getAllProducts(),
  ]);
  if (!data) notFound();

  const r: any = data;
  const post: EditPost = {
    id: r.id,
    slug: r.slug,
    title: r.title?.lv ?? "",
    excerpt: r.excerpt?.lv ?? "",
    content: r.content?.lv ?? "",
    meta_description: r.meta_description?.lv ?? "",
    cover_url: r.cover_url ?? null,
    cover_alt: r.cover_alt?.lv ?? "",
    gallery: Array.isArray(r.gallery) ? r.gallery : [],
    category: r.category ?? null,
    tags: Array.isArray(r.tags) ? r.tags : [],
    related_products: Array.isArray(r.related_products) ? r.related_products : [],
    social: r.social ?? null,
    status: r.status,
    ai_generated: r.ai_generated,
    edited_after_ai: r.edited_after_ai,
  };
  const list: BlogProduct[] = products.map((p) => ({ slug: p.slug, name: p.name }));
  return <BlogEditor products={list} post={post} />;
}
