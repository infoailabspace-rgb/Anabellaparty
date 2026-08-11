import { publicClient } from "@/lib/sb-public";
import { currentLocale, pickStr } from "@/lib/i18n-db";
import { testimonials as staticTestimonials } from "@/lib/testimonials";
import { clients as staticClients, type Client } from "@/lib/clients";
import { faqItems as staticFaqs, type FaqItem, type FaqCategory } from "@/lib/faq";
import { partners as staticPartners, type Partner } from "@/lib/partners";
import { autoAlt, type GalleryImage } from "@/lib/gallery";

export type PublicTestimonial = {
  author: string;
  event: string;
  rating: number;
  text: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getTestimonials(): Promise<PublicTestimonial[]> {
  const sb = publicClient();
  if (sb) {
    try {
      const { data } = await sb
        .from("site_testimonials")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (data && data.length)
        return data.map((r: any) => ({
          author: r.author,
          event: r.event_type ?? "",
          rating: r.rating ?? 5,
          text: r.text?.lv ?? "",
        }));
    } catch {
      /* fallback */
    }
  }
  return staticTestimonials.map((t) => ({
    author: t.author,
    event: t.event,
    rating: t.rating,
    text: t.text,
  }));
}

export async function getClients(): Promise<Client[]> {
  const sb = publicClient();
  if (sb) {
    try {
      const { data } = await sb
        .from("site_clients")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (data && data.length)
        return data.map((r: any) => ({
          name: r.name,
          logo: r.logo_url ?? "",
          url: r.website ?? undefined,
        }));
    } catch {
      /* fallback */
    }
  }
  return staticClients;
}

export async function getFaqs(): Promise<FaqItem[]> {
  const sb = publicClient();
  if (sb) {
    try {
      const locale = await currentLocale();
      const { data } = await sb
        .from("site_faqs")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (data && data.length)
        return data.map((r: any) => ({
          category: r.category as FaqCategory,
          question: pickStr(r.question, locale),
          answer: pickStr(r.answer, locale),
        }));
    } catch {
      /* fallback */
    }
  }
  return staticFaqs;
}
export async function getPartners(): Promise<Partner[]> {
  const sb = publicClient();
  if (sb) {
    try {
      const locale = await currentLocale();
      const { data } = await sb
        .from("site_partners")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (data && data.length)
        return data.map((r: any) => ({
          name: r.name,
          description: pickStr(r.description, locale),
          url: r.url ?? undefined,
          logoUrl: r.logo_url ?? undefined,
        }));
    } catch {
      /* fallback */
    }
  }
  return staticPartners;
}
function mapGallery(rows: any[], locale: string): GalleryImage[] {
  return rows.map((r) => ({
    id: r.id,
    url: r.image_url,
    caption: pickStr(r.caption, locale),
    alt: pickStr(r.alt, locale) || autoAlt(r.category ?? null, locale),
  }));
}

// Kategorijas lapas galerija — aktīvās bildes ar doto kategoriju.
export async function getGallery(category: string): Promise<GalleryImage[]> {
  const sb = publicClient();
  if (!sb) return [];
  try {
    const locale = await currentLocale();
    const { data } = await sb
      .from("site_gallery")
      .select("*")
      .eq("is_active", true)
      .eq("category", category)
      .order("sort_order", { ascending: true });
    if (data) return mapGallery(data, locale);
  } catch {
    /* tukša galerija */
  }
  return [];
}

// Sākumlapas galerija — tikai is_featured, jaukta no visām kategorijām, max 12.
export async function getFeaturedGallery(): Promise<GalleryImage[]> {
  const sb = publicClient();
  if (!sb) return [];
  try {
    const locale = await currentLocale();
    const { data } = await sb
      .from("site_gallery")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("sort_order", { ascending: true })
      .limit(12);
    if (data) return mapGallery(data, locale);
  } catch {
    /* tukša galerija */
  }
  return [];
}
/* eslint-enable @typescript-eslint/no-explicit-any */
