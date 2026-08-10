import Reveal from "@/components/reveal";
import HeroMedia from "@/components/hero-media";
import { getHeroMedia } from "@/lib/hero-media";

export default async function SectionHero({
  title,
  tagline,
  heroKey,
  video,
  position,
}: {
  title: string;
  tagline: string;
  heroKey?: string;
  // Fallback publiskais video (relatīvs mp4 ceļš), ja site_content tukšs.
  video?: string;
  // Kadra centrējums (crop): "top" — rāda augšdaļu.
  position?: "center" | "top";
}) {
  const media = heroKey ? await getHeroMedia(heroKey) : null;
  // Fallback: admin mediji → citādi publiskais video → citādi tīrs gradients.
  const mp4 = media?.mp4 ?? video ?? null;
  const poster =
    media?.poster ?? (video ? video.replace(/\.mp4$/i, ".jpg") : null);
  const image = media?.image ?? null;
  const hasMedia = Boolean(mp4 || image);

  return (
    <section className="relative overflow-hidden border-b border-gold/20">
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-bg to-black" />
      {hasMedia ? (
        <>
          <HeroMedia
            mp4={mp4}
            webm={media?.webm ?? null}
            poster={poster}
            image={image}
            position={position}
          />
          <div className="absolute inset-0 bg-bg/70" />
        </>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,169,96,0.15),transparent_60%)]" />
      )}
      <Reveal className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-center sm:py-28">
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-text/80">{tagline}</p>
      </Reveal>
    </section>
  );
}
