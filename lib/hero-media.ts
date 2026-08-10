import { publicClient } from "@/lib/sb-public";

// Hero mediji glabājas site_content: key = "hero.<pageKey>", value jsonb
// (valodneitrāls): { mp4?, webm?, poster?, image? }.
export type HeroMedia = {
  mp4?: string | null;
  webm?: string | null;
  poster?: string | null;
  image?: string | null;
};

// Lapas, kurām ir hero mediji (video vai attēls).
export const HERO_VIDEO_PAGES = [
  "home",
  "foto-kaste",
  "ai-foto",
  "atrakcijas",
  "specefekti",
] as const;
export const HERO_IMAGE_PAGES = [
  "inventars",
  "audio-video",
  "deco",
  "kubli",
  "rezervet",
  "kontakti",
  "faq",
  "musu-draugi",
] as const;

export type HeroPageKey =
  | (typeof HERO_VIDEO_PAGES)[number]
  | (typeof HERO_IMAGE_PAGES)[number];

export const isVideoPage = (key: string): boolean =>
  (HERO_VIDEO_PAGES as readonly string[]).includes(key);

/** Nolasa hero medijus lapai no site_content (bez lokalizācijas). */
export async function getHeroMedia(pageKey: string): Promise<HeroMedia | null> {
  const sb = publicClient();
  if (!sb) return null;
  try {
    const { data } = await sb
      .from("site_content")
      .select("value")
      .eq("key", `hero.${pageKey}`)
      .maybeSingle();
    const v = (data?.value ?? null) as HeroMedia | null;
    if (!v) return null;
    // Tukšs objekts → nav mediju.
    if (!v.mp4 && !v.webm && !v.poster && !v.image) return null;
    return v;
  } catch {
    return null;
  }
}
