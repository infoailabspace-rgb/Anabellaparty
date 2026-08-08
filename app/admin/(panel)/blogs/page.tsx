import { createClient } from "@/lib/supabase/server";
import BlogsList, { type BlogRow } from "./blogs-list";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function BlogsAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("id,slug,title,status,published_at,ai_generated,edited_after_ai,updated_at")
    .order("updated_at", { ascending: false });
  const rows: BlogRow[] = (data ?? []).map((r: any) => ({
    id: r.id,
    slug: r.slug,
    title: r.title?.lv ?? "",
    status: r.status,
    published_at: r.published_at ?? null,
    ai_generated: r.ai_generated,
    edited_after_ai: r.edited_after_ai,
  }));
  return <BlogsList rows={rows} />;
}
