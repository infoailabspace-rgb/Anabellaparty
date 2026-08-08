import { cache } from "react";
import { publicClient } from "@/lib/sb-public";

export type ML = { lv?: string; en?: string; ru?: string };

// DB teksta pārraksti publiskajām lapām (categories./pages./sec.) → Map<key, ML>.
// Tikai admin rediģētās atslēgas eksistē; pārējais nāk no messages/*.json.
export const getTextOverrides = cache(async (): Promise<Map<string, ML>> => {
  const map = new Map<string, ML>();
  const sb = publicClient();
  if (!sb) return map;
  try {
    const { data } = await sb.from("site_content").select("key,value");
    for (const r of (data ?? []) as { key: string; value: unknown }[]) {
      if (
        /^(categories|pages|sec)\./.test(r.key) &&
        r.value &&
        typeof r.value === "object"
      ) {
        map.set(r.key, r.value as ML);
      }
    }
  } catch {
    /* DB nesasniedzams → bez pārrakstiem (messages fallback) */
  }
  return map;
});
