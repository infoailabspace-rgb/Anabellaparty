import { createClient } from "@/lib/supabase/server";
import ContentEditor from "./content-editor";

export const dynamic = "force-dynamic";

const ORDER = [
  "home.hero.title", "home.hero.accent", "home.hero.subtitle",
  "about.body", "about.stats.events", "about.stats.units", "about.stats.since",
  "delivery.note", "contact.hours",
];

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function SatursPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("key,value,content_type");
  const map = new Map((data ?? []).map((r: any) => [r.key, r]));
  const items = ORDER.filter((k) => map.has(k)).map((k) => {
    const r: any = map.get(k);
    const v = r.value ?? {};
    return {
      key: k,
      value: { lv: v.lv ?? "", en: v.en ?? "", ru: v.ru ?? "" },
      content_type: r.content_type ?? "text",
    };
  });
  return <ContentEditor items={items} />;
}
