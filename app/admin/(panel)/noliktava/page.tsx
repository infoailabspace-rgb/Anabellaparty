import { createClient } from "@/lib/supabase/server";
import MaterialsAdmin, { type MRow } from "./materials-admin";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function NoliktavaPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inventory_materials")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  const rows: MRow[] = (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    category: r.category ?? "",
    quantity: Number(r.quantity) || 0,
    unit: r.unit ?? "",
    min_quantity: Number(r.min_quantity) || 0,
    notes: r.notes ?? "",
  }));

  return <MaterialsAdmin rows={rows} />;
}
