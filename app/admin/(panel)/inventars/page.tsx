import { createClient } from "@/lib/supabase/server";
import ProductsAdmin, { type AdminProductRow } from "./products-admin";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function InventarsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id,slug,category,name,tiers,is_active,sort_order")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  const rows: AdminProductRow[] = (data ?? []).map((r: any) => ({
    id: r.id,
    slug: r.slug,
    category: r.category,
    name: r.name?.lv ?? r.slug,
    price:
      (Array.isArray(r.tiers) ? r.tiers.find((t: any) => t.price > 0)?.price : 0) ??
      0,
    is_active: r.is_active,
  }));

  return <ProductsAdmin rows={rows} />;
}
