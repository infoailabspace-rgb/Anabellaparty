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

export async function getContent(key: string, fallback: string): Promise<string> {
  const map = await getContentMap();
  const v = map[key];
  return v && v.trim() ? v : fallback;
}
