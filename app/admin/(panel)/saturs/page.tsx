import { createClient } from "@/lib/supabase/server";
import ContentEditor from "./content-editor";
import HeroMediaAdmin, { type HeroPage } from "./hero-media-admin";
import PageImagesAdmin from "./page-images-admin";
import {
  HERO_VIDEO_PAGES,
  HERO_IMAGE_PAGES,
  isVideoPage,
} from "@/lib/hero-media";

export const dynamic = "force-dynamic";

const ORDER = [
  "home.hero.title", "home.hero.accent", "home.hero.subtitle",
  "about.body", "about.stats.events", "about.stats.units", "about.stats.since",
  "delivery.note", "contact.hours",
];

// pageKey → publiskais ceļš (admin attēlojumam).
const HERO_PATHS: Record<string, string> = {
  home: "/ (sākumlapa)",
  "foto-kaste": "/foto-kaste",
  atrakcijas: "/piepusamas-atrakcijas",
  specefekti: "/svinibu-inventars/specefekti",
  inventars: "/svinibu-inventars",
  "audio-video": "/svinibu-inventars/audio-viesu-gramatas",
  deco: "/svinibu-inventars/decomebeles",
  kubli: "/svinibu-inventars/kublsballa",
  "ai-foto": "/foto-kaste/ai-foto",
  rezervet: "/rezervet",
  kontakti: "/kontakti",
  faq: "/faq",
  "musu-draugi": "/musu-draugi",
  blog: "/blogs (visas kategorijas)",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function SatursPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_content")
    .select("key,value,content_type");
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

  const heroKeys = [...HERO_VIDEO_PAGES, ...HERO_IMAGE_PAGES];
  const heroPages: HeroPage[] = heroKeys.map((key) => {
    const v: any = map.get(`hero.${key}`)?.value ?? {};
    return {
      key,
      path: HERO_PATHS[key] ?? key,
      video: isVideoPage(key),
      media: {
        mp4: v.mp4 ?? null,
        webm: v.webm ?? null,
        poster: v.poster ?? null,
        image: v.image ?? null,
      },
    };
  });

  const imgUrl = (k: string) =>
    (map.get(k)?.value as { url?: string } | undefined)?.url ?? null;
  const pageImages: Record<string, string | null> = {
    "about.photo": imgUrl("about.photo"),
    "team.aiva": imgUrl("team.aiva"),
    "team.roberts": imgUrl("team.roberts"),
    "team.matiss": imgUrl("team.matiss"),
    "team.solvita": imgUrl("team.solvita"),
    "og.fallback": imgUrl("og.fallback"),
    "category.foto-kaste": imgUrl("category.foto-kaste"),
    "category.ai-foto": imgUrl("category.ai-foto"),
    "category.atrakcijas": imgUrl("category.atrakcijas"),
    "category.audio-video": imgUrl("category.audio-video"),
    "category.specefekti": imgUrl("category.specefekti"),
    "category.deco": imgUrl("category.deco"),
    "category.izklaides-punkts": imgUrl("category.izklaides-punkts"),
    "foto-kaste.frames": imgUrl("foto-kaste.frames"),
  };

  return (
    <>
      <ContentEditor items={items} />
      <PageImagesAdmin values={pageImages} />
      <HeroMediaAdmin pages={heroPages} />
    </>
  );
}
