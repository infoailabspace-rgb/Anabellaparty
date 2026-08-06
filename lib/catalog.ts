import { createClient } from "@supabase/supabase-js";
import {
  products as staticProducts,
  type Product,
  type ProductCategory,
} from "@/lib/products";

// Publiskā (anon) lasīšana bez sesijas — ļauj ISR kešošanu.
function anon() {
  const url = process.env.NEXT_PUBLIC_SB_URL;
  const key = process.env.NEXT_PUBLIC_SB_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

const L = (v: unknown): string =>
  v && typeof v === "object" ? ((v as Record<string, string>).lv ?? "") : "";
const LArr = (v: unknown): string[] | undefined => {
  if (v && typeof v === "object" && Array.isArray((v as Record<string, unknown>).lv)) {
    return (v as Record<string, string[]>).lv;
  }
  return undefined;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRow(r: any): Product {
  return {
    slug: r.slug,
    name: L(r.name) || r.slug,
    tagline: L(r.tagline),
    description: L(r.description),
    category: r.category as ProductCategory,
    tiers: Array.isArray(r.tiers) ? r.tiers : [],
    hourlyExtra: r.hourly_extra != null ? Number(r.hourly_extra) : undefined,
    addOns: r.add_ons ?? undefined,
    specs: r.specs ?? undefined,
    includes: LArr(r.includes),
    coverImage: r.cover_image ?? "",
    gallery: Array.isArray(r.gallery) ? r.gallery : [],
    featured: r.is_featured ?? undefined,
    contactOnly: r.contact_only ?? undefined,
    altPhone: r.alt_phone ?? undefined,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Visi aktīvie produkti no DB; ja DB tukša/nepieejama → statiskie (fallback).
export async function getAllProducts(): Promise<Product[]> {
  const sb = anon();
  if (sb) {
    try {
      const { data, error } = await sb
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("slug", { ascending: true });
      if (!error && data && data.length > 0) return data.map(mapRow);
    } catch {
      /* fallback zemāk */
    }
  }
  return staticProducts;
}

export async function getProductsByCategory(
  category: ProductCategory,
): Promise<Product[]> {
  return (await getAllProducts()).filter((p) => p.category === category);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  return (await getAllProducts()).find((p) => p.slug === slug);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return (await getAllProducts()).filter((p) => p.featured);
}
