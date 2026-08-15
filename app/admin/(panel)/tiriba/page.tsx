import { createClient } from "@/lib/supabase/server";
import CleaningAdmin, { type CRow } from "./cleaning-admin";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function TiribaPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, slug, name, category, cleaning_status, cleaning_notes, is_active")
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  const rows: CRow[] = (data ?? []).map((r: any) => ({
    id: r.id,
    name: (typeof r.name === "string" ? r.name : r.name?.lv) || r.slug,
    category: r.category ?? "cits",
    cleaning_status: r.cleaning_status ?? null,
    cleaning_notes: r.cleaning_notes ?? "",
  }));

  return <CleaningAdmin rows={rows} />;
}
