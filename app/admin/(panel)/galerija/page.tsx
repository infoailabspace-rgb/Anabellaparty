import { createClient } from "@/lib/supabase/server";
import GalleryAdmin, { type GRow } from "./gallery-admin";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function GalerijaPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_gallery")
    .select("*")
    .order("sort_order", { ascending: true });
  const rows: GRow[] = (data ?? []).map((r: any) => ({
    id: r.id,
    url: r.image_url,
    storage_path: r.storage_path,
    category: r.category ?? null,
    caption: { lv: r.caption?.lv ?? "", en: r.caption?.en ?? "", ru: r.caption?.ru ?? "" },
    alt: { lv: r.alt?.lv ?? "", en: r.alt?.en ?? "", ru: r.alt?.ru ?? "" },
    is_active: r.is_active,
    is_featured: r.is_featured,
    sort_order: r.sort_order ?? 0,
  }));
  return <GalleryAdmin rows={rows} />;
}
