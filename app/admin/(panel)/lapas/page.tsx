import lvMsg from "@/messages/lv.json";
import enMsg from "@/messages/en.json";
import ruMsg from "@/messages/ru.json";
import { createClient } from "@/lib/supabase/server";
import { CATALOG } from "@/lib/editable-catalog";
import LapasAdmin, { type EGroup } from "./lapas-admin";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
const MSG: Record<string, any> = { lv: lvMsg, en: enMsg, ru: ruMsg };
function msgVal(key: string, locale: string): string {
  const i = key.indexOf(".");
  const ns = key.slice(0, i);
  const sub = key.slice(i + 1);
  return MSG[locale]?.[ns]?.[sub] ?? "";
}

export default async function LapasPage() {
  const sb = await createClient();
  const { data } = await sb.from("site_content").select("key,value");
  const ov = new Map((data ?? []).map((r: any) => [r.key, r.value]));

  const groups: EGroup[] = CATALOG.map((g) => ({
    id: g.id,
    title: g.title,
    fields: g.fields.map((f) => {
      const o = ov.get(f.key) as any;
      const has = !!o && typeof o === "object";
      const def = {
        lv: msgVal(f.key, "lv"),
        en: msgVal(f.key, "en"),
        ru: msgVal(f.key, "ru"),
      };
      return {
        key: f.key,
        label: f.label,
        multiline: !!f.multiline,
        hasOverride: has,
        def,
        value: has
          ? { lv: o.lv ?? "", en: o.en ?? "", ru: o.ru ?? "" }
          : { ...def },
      };
    }),
  }));

  return <LapasAdmin groups={groups} />;
}
