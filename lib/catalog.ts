import { createClient } from "@supabase/supabase-js";
import {
  products as staticProducts,
  type Product,
  type ProductCategory,
} from "@/lib/products";
import { currentLocale, pickStr, pickArr } from "@/lib/i18n-db";

// ML {lv,en,ru} VAI vienkārša virkne (atpakaļsaderība pirms migrācijas).
function mlPick(v: unknown, locale: string): string {
  if (typeof v === "string") return v;
  return pickStr(v, locale);
}

// Publiskā (anon) lasīšana bez sesijas — ļauj ISR kešošanu.
function anon() {
  const url = process.env.NEXT_PUBLIC_SB_URL;
  const key = process.env.NEXT_PUBLIC_SB_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// Iekšējie teksti (duration/note/name/unit/label/value) atrisināti uz aktuālo valodu.
function mapRow(r: any, locale: string): Product {
  const tiers = Array.isArray(r.tiers)
    ? r.tiers.map((t: any) => ({
        duration: mlPick(t.duration, locale),
        price: Number(t.price) || 0,
        ...(t.note != null ? { note: mlPick(t.note, locale) } : {}),
      }))
    : [];
  const addOns = Array.isArray(r.add_ons)
    ? r.add_ons.map((a: any) => ({
        name: mlPick(a.name, locale),
        price: Number(a.price) || 0,
        ...(a.unit != null ? { unit: mlPick(a.unit, locale) } : {}),
      }))
    : undefined;
  const specs = Array.isArray(r.specs)
    ? r.specs.map((s: any) => ({
        label: mlPick(s.label, locale),
        value: mlPick(s.value, locale),
      }))
    : undefined;
  return {
    slug: r.slug,
    name: mlPick(r.name, locale) || r.slug,
    tagline: pickStr(r.tagline, locale),
    description: pickStr(r.description, locale),
    category: r.category as ProductCategory,
    tiers,
    hourlyExtra: r.hourly_extra != null ? Number(r.hourly_extra) : undefined,
    addOns,
    specs,
    includes: pickArr(r.includes, locale),
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
      const locale = await currentLocale();
      const { data, error } = await sb
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("slug", { ascending: true });
      if (!error && data && data.length > 0)
        return data.map((r) => mapRow(r, locale));
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
