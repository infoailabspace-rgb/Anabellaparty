import { publicClient } from "@/lib/sb-public";
import { currentLocale, pickStr } from "@/lib/i18n-db";
import { testimonials as staticTestimonials } from "@/lib/testimonials";
import { clients as staticClients, type Client } from "@/lib/clients";
import { faqItems as staticFaqs, type FaqItem, type FaqCategory } from "@/lib/faq";

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
/* eslint-enable @typescript-eslint/no-explicit-any */
