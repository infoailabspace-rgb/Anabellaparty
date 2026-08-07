"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fona hero video. Ja padots vairāk par vienu avotu — tie spēlē secīgi,
 * viens pēc otra, un cilpo. Viens avots — parasts loop.
 * autoPlay + muted + playsInline nodrošina autoplay arī mobilajā.
 * poster (kadrs) novērš melnu LCP, kamēr video ielādējas.
 * WebM tiek piedāvāts pirms MP4 (mazāks fails); ja WebM nav — atkāpjas uz MP4.
 */
export default function HeroVideo({
  sources,
  className = "",
}: {
  sources: string[];
  className?: string;
}) {
  const [idx, setIdx] = useState(0);
  const ref = useRef<HTMLVideoElement>(null);
  const multiple = sources.length > 1;

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.load();
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, [idx]);

  if (sources.length === 0) return null;

  const advance = () => {
    if (multiple) setIdx((i) => (i + 1) % sources.length);
  };

  const mp4 = sources[idx];
  const base = mp4.replace(/\.mp4$/i, "");
  const webm = `${base}.webm`;
  const poster = `${base}.jpg`;

  return (
    <video
      // key liek pārmontēt <source>, kad mainās avots (secīgie video).
      key={mp4}
      ref={ref}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      poster={poster}
      autoPlay
      muted
      loop={!multiple}
      playsInline
      preload="metadata"
      onEnded={advance}
      onError={advance}
      aria-hidden
    >
      <source src={webm} type="video/webm" />
      <source src={mp4} type="video/mp4" />
    </video>
  );
}
