import { createClient } from "@/lib/supabase/server";
import FaqAdmin, { type FRow } from "./faq-admin";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function FaqAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_faqs")
    .select("*")
    .order("sort_order", { ascending: true });
  const ml = (v: any) => ({ lv: v?.lv ?? "", en: v?.en ?? "", ru: v?.ru ?? "" });
  const rows: FRow[] = (data ?? []).map((r: any) => ({
    id: r.id,
    category: r.category,
    question: ml(r.question),
    answer: ml(r.answer),
    sort_order: r.sort_order ?? 0,
    is_published: r.is_published,
  }));
  return <FaqAdmin rows={rows} />;
}
