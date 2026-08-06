import { getLocale } from "next-intl/server";

// Pašreizējā valoda servera kontekstā; ārpus tā (API maršruti) → "lv".
export async function currentLocale(): Promise<string> {
  try {
    return await getLocale();
  } catch {
    return "lv";
  }
}

// jsonb {lv,en,ru} → virkne izvēlētajā valodā ar fallback uz lv.
export function pickStr(v: unknown, locale: string): string {
  if (v && typeof v === "object") {
    const o = v as Record<string, string>;
    return (o[locale] ?? o.lv ?? "") || "";
  }
  return "";
}

// jsonb {lv,en,ru} ar masīviem → masīvs izvēlētajā valodā ar fallback uz lv.
export function pickArr(v: unknown, locale: string): string[] | undefined {
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    const arr = o[locale] ?? o.lv;
    return Array.isArray(arr) ? (arr as string[]) : undefined;
  }
  return undefined;
}
