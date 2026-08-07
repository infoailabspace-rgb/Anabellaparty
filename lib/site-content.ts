import { cache } from "react";
import { publicClient } from "@/lib/sb-public";
import { currentLocale, pickStr } from "@/lib/i18n-db";

// Viss saturs kā {key: vērtība izvēlētajā valodā ar fallback uz lv}.
export const getContentMap = cache(async (): Promise<Record<string, string>> => {
  const sb = publicClient();
  if (!sb) return {};
  try {
    const locale = await currentLocale();
    const { data } = await sb.from("site_content").select("key,value");
    if (data) {
      const map: Record<string, string> = {};
      for (const r of data as { key: string; value: Record<string, string> }[]) {
        const v = pickStr(r.value, locale);
        if (v) map[r.key] = v;
      }
      return map;
    }
  } catch {
    /* fallback */
  }
  return {};
});

// Lapas attēls (valodneitrāls) — glabāts kā {url} zem norādītās atslēgas
// (piem. 'about.photo', 'og.fallback'). Tukšs → null (komponents lieto fallback).
export const getSiteImage = cache(async (key: string): Promise<string | null> => {
  const sb = publicClient();
  if (!sb) return null;
  try {
    const { data } = await sb
      .from("site_content")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    const url = (data?.value as { url?: string } | null)?.url;
    return url && url.trim() ? url : null;
  } catch {
    return null;
  }
});

export async function getContent(key: string, fallback: string): Promise<string> {
  const map = await getContentMap();
  const v = map[key];
  return v && v.trim() ? v : fallback;
}
