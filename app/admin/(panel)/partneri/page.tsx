import { createClient } from "@/lib/supabase/server";
import PartnersAdmin, { type PRow } from "./partners-admin";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function PartneriPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_partners")
    .select("*")
    .order("sort_order", { ascending: true });
  const rows: PRow[] = (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    description: {
      lv: r.description?.lv ?? "",
      en: r.description?.en ?? "",
      ru: r.description?.ru ?? "",
    },
    url: r.url ?? "",
    sort_order: r.sort_order ?? 0,
    is_active: r.is_active,
  }));
  return <PartnersAdmin rows={rows} />;
}
