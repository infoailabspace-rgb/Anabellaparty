import { createClient } from "@/lib/supabase/server";
import ClientsAdmin, { type CRow } from "./clients-admin";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function KlientiPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_clients")
    .select("*")
    .order("sort_order", { ascending: true });
  const rows: CRow[] = (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    logo_url: r.logo_url ?? "",
    website: r.website ?? "",
    sort_order: r.sort_order ?? 0,
    is_active: r.is_active,
  }));
  return <ClientsAdmin rows={rows} />;
}
