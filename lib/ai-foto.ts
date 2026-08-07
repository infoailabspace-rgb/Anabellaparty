import { cache } from "react";
import { publicClient } from "@/lib/sb-public";
import { currentLocale, pickStr } from "@/lib/i18n-db";

export type ML = { lv: string; en: string; ru: string };

export type AifotoContent = {
  intro: string;
  price: string;
  themes: string[];
  gallery: string[];
};

// AI-foto lapas saturs no site_content (aifoto.*). Tukšs → "" / [] (lapa
// atkāpjas uz messages / statisko galeriju).
export const getAifoto = cache(async (): Promise<AifotoContent> => {
  const empty: AifotoContent = { intro: "", price: "", themes: [], gallery: [] };
  const sb = publicClient();
  if (!sb) return empty;
  try {
    const locale = await currentLocale();
    const { data } = await sb
      .from("site_content")
      .select("key,value")
      .in("key", [
        "aifoto.intro",
        "aifoto.price",
        "aifoto.themes",
        "aifoto.gallery",
      ]);
    if (!data) return empty;
    const map = new Map(
      (data as { key: string; value: unknown }[]).map((r) => [r.key, r.value]),
    );
    const themesRaw =
      (map.get("aifoto.themes") as { items?: ML[] } | undefined)?.items ?? [];
    const galleryRaw =
      (map.get("aifoto.gallery") as { images?: string[] } | undefined)?.images ??
      [];
    return {
      intro: pickStr(map.get("aifoto.intro"), locale),
      price: pickStr(map.get("aifoto.price"), locale),
      themes: themesRaw.map((t) => pickStr(t, locale)).filter(Boolean),
      gallery: galleryRaw.filter((s) => typeof s === "string" && s.trim()),
    };
  } catch {
    return empty;
  }
});
