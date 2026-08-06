import { cache } from "react";
import { publicClient } from "@/lib/sb-public";

// Viss saturs kā {key: lv-vērtība}. cache() dedupē vienā renderā.
export const getContentMap = cache(async (): Promise<Record<string, string>> => {
  const sb = publicClient();
  if (!sb) return {};
  try {
    const { data } = await sb.from("site_content").select("key,value");
    if (data) {
      const map: Record<string, string> = {};
      for (const r of data as { key: string; value: { lv?: string } }[]) {
        if (r.value?.lv) map[r.key] = r.value.lv;
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
