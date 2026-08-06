import { createClient } from "@/lib/supabase/server";
import TestimonialsAdmin, { type TRow } from "./testimonials-admin";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function AtsauksmesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_testimonials")
    .select("*")
    .order("sort_order", { ascending: true });
  const rows: TRow[] = (data ?? []).map((r: any) => ({
    id: r.id,
    author: r.author,
    event_type: r.event_type ?? "",
    rating: r.rating ?? 5,
    text: r.text?.lv ?? "",
    is_published: r.is_published,
    sort_order: r.sort_order ?? 0,
  }));
  return <TestimonialsAdmin rows={rows} />;
}
