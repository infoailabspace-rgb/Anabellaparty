import HeroMedia from "@/components/hero-media";
import { getHeroMedia } from "@/lib/hero-media";

export default async function SectionHero({
  title,
  tagline,
  heroKey,
  video,
  posClass,
}: {
  title: string;
  tagline: string;
  heroKey?: string;
  // Fallback publiskais video (relatīvs mp4 ceļš), ja site_content tukšs.
  video?: string;
  // Kadra crop fokuss (Tailwind object-position klase).
  posClass?: string;
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
            posClass={posClass}
          />
          <div className="absolute inset-0 bg-bg/75" />
        </>
      ) : (
        <div className="absolute inset-0 bg-navy/30" />
      )}
      {/* Bez Reveal: H1 ir virs pirmā ekrāna (LCP) - redzams uzreiz. */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
        <div aria-hidden className="mx-auto mb-6 h-px w-14 bg-gold" />
        <h1 className="font-display text-page font-semibold tracking-tight">{title}</h1>
        <p className="mx-auto mt-5 max-w-xl text-lead text-text/80">{tagline}</p>
      </div>
    </section>
  );
}
