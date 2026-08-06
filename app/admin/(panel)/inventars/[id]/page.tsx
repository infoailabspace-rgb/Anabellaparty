import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "../product-form";
import type { ProductInput } from "../actions";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").eq("id", id).single();
  if (!data) notFound();
  const d = data as any;
  const ml = (v: any) => ({ lv: v?.lv ?? "", en: v?.en ?? "", ru: v?.ru ?? "" });
  const mlArr = (v: any) => ({
    lv: v?.lv ?? [],
    en: v?.en ?? [],
    ru: v?.ru ?? [],
  });

  const initial: ProductInput = {
    slug: d.slug,
    category: d.category,
    name: d.name?.lv ?? "",
    tagline: ml(d.tagline),
    description: ml(d.description),
    includes: mlArr(d.includes),
    tiers: Array.isArray(d.tiers) ? d.tiers : [],
    hourly_extra: d.hourly_extra != null ? Number(d.hourly_extra) : null,
    add_ons: Array.isArray(d.add_ons) ? d.add_ons : [],
    contact_only: Boolean(d.contact_only),
    specs: Array.isArray(d.specs) ? d.specs : [],
    alt_phone: d.alt_phone ?? null,
    is_active: d.is_active,
    is_featured: Boolean(d.is_featured),
    cover_image: d.cover_image ?? "",
    gallery: Array.isArray(d.gallery) ? d.gallery : [],
  };

  return <ProductForm id={id} initial={initial} />;
}
