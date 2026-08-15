import { createClient } from "@/lib/supabase/server";
import CleaningAdmin, { type CRow } from "./cleaning-admin";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function TiribaPage() {
  const supabase = await createClient();
  // Tīrība attiecas uz VISIEM produktiem, arī iekšējiem/nepubliskiem
  // (is_active=false, piem. bumbu somas) — tāpēc bez is_active filtra.
  const { data } = await supabase
    .from("products")
    .select("id, slug, name, category, cleaning_status, cleaning_notes, is_active, unit_of")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  // Kataloga produkti, kuriem ir piesaistītas fiziskās vienības (unit_of → slug),
  // NErādās — tīrību seko per-vienībai. Vienības un pārējie produkti paliek.
  const parentSlugs = new Set(
    (data ?? []).map((r: any) => r.unit_of).filter(Boolean),
  );

  const rows: CRow[] = (data ?? [])
    .filter((r: any) => !parentSlugs.has(r.slug))
    .map((r: any) => ({
      id: r.id,
      name: (typeof r.name === "string" ? r.name : r.name?.lv) || r.slug,
      category: r.category ?? "cits",
      cleaning_status: r.cleaning_status ?? null,
      cleaning_notes: r.cleaning_notes ?? "",
    }));

  return <CleaningAdmin rows={rows} />;
}
