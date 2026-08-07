import { createClient } from "@/lib/supabase/server";
import AiFotoAdmin from "./ai-foto-admin";

export const dynamic = "force-dynamic";

type ML = { lv: string; en: string; ru: string };

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function AiFotoAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_content")
    .select("key,value")
    .in("key", [
      "aifoto.intro",
      "aifoto.price",
      "aifoto.themes",
      "aifoto.gallery",
    ]);
  const map = new Map((data ?? []).map((r: any) => [r.key, r.value]));
  const asML = (v: any): ML => ({
    lv: v?.lv ?? "",
    en: v?.en ?? "",
    ru: v?.ru ?? "",
  });
  const themes: ML[] = ((map.get("aifoto.themes")?.items ?? []) as any[]).map(asML);
  const gallery: string[] = ((map.get("aifoto.gallery")?.images ?? []) as any[]).filter(
    (s) => typeof s === "string",
  );

  return (
    <AiFotoAdmin
      intro={asML(map.get("aifoto.intro"))}
      price={asML(map.get("aifoto.price"))}
      themes={themes}
      gallery={gallery}
    />
  );
}
