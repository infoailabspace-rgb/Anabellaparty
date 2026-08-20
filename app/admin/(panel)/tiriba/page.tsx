import { createClient } from "@/lib/supabase/server";
import CleaningAdmin, { type CRow, type CleaningGroup } from "./cleaning-admin";

export const dynamic = "force-dynamic";

// Tīrības grupa no slug (fiksēta secība nosaka cleaning-admin.tsx).
function cleaningGroup(slug: string): CleaningGroup {
  if (slug.startsWith("bumbu-soma")) return "bumbu-somas";
  if (slug.startsWith("dzirkstelu-ierice")) return "dzirkstelu-ierices";
  if (slug.startsWith("burbulu-ierice")) return "burbulu-ierices";
  return "atrakcijas";
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function TiribaPage() {
  const supabase = await createClient();
  // TIKAI tīrāmais inventārs (needs_cleaning=true): atrakcijas, bumbu somas,
  // dzirksteļu un burbuļu ierīču vienības. Foto kastes, telefoni, USB, deko,
  // specefektu mašīnas bez tīrības vajadzības NErādās.
  const { data } = await supabase
    .from("products")
    .select("id, slug, name, cleaning_status, cleaning_notes, unit_of, needs_cleaning")
    .eq("needs_cleaning", true)
    .order("slug", { ascending: true });

  // Kataloga parents ar fiziskām vienībām (unit_of → slug) NErādās — tīrību
  // seko per-vienībai (piem. balta-pils-xl paslēpts, tā vienības rādās).
  const parentSlugs = new Set(
    (data ?? []).map((r: any) => r.unit_of).filter(Boolean),
  );

  const rows: CRow[] = (data ?? [])
    .filter((r: any) => !parentSlugs.has(r.slug))
    .map((r: any) => ({
      id: r.id,
      name: (typeof r.name === "string" ? r.name : r.name?.lv) || r.slug,
      group: cleaningGroup(r.slug),
      cleaning_status: r.cleaning_status ?? null,
      cleaning_notes: r.cleaning_notes ?? "",
    }));

  return <CleaningAdmin rows={rows} />;
}
