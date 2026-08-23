import { cache } from "react";
import { publicClient } from "@/lib/sb-public";
import { currentLocale, pickStr } from "@/lib/i18n-db";

// AI Party bannera saturs no site_content ('aiparty.banner', salikts jsonb).
// Pārvaldāms adminā (/admin/saturs). Publiski atgriež jau lokalizētas virknes.
export type AiPartyBanner = {
  image: string; // fona attēls (object-cover); publiski OBLIGĀTS
  url: string; // tukšs → poga neaktīva ("Drīzumā")
  badge: string;
  title: string;
  text: string;
  cta: string;
};

// Fallback: ja rindas nav, is_active=false, virsraksts tukšs VAI fona attēla nav
// → null (banneris NERĀDĀS). Nav hardkodēta satura — viss nāk no DB.
export const getAiPartyBanner = cache(async (): Promise<AiPartyBanner | null> => {
  const sb = publicClient();
  if (!sb) return null;
  try {
    const locale = await currentLocale();
    const { data } = await sb
      .from("site_content")
      .select("value")
      .eq("key", "aiparty.banner")
      .maybeSingle();
    const v = data?.value as
      | {
          is_active?: boolean;
          url?: string;
          image?: { url?: string } | null;
          badge?: unknown;
          title?: unknown;
          text?: unknown;
          cta?: unknown;
        }
      | null
      | undefined;
    if (!v || v.is_active !== true) return null;
    const image = typeof v.image?.url === "string" ? v.image.url.trim() : "";
    if (!image) return null; // attēla nav → publiski nerādās
    const title = pickStr(v.title, locale);
    if (!title.trim()) return null;
    return {
      image,
      url: typeof v.url === "string" ? v.url.trim() : "",
      badge: pickStr(v.badge, locale),
      title,
      text: pickStr(v.text, locale),
      cta: pickStr(v.cta, locale),
    };
  } catch {
    return null;
  }
});
