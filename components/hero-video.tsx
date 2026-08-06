"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fona hero video. Ja padots vairāk par vienu avotu — tie spēlē secīgi,
 * viens pēc otra, un cilpo. Viens avots — parasts loop. muted+playsInline
 * nodrošina autoplay arī mobilajā.
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

  return (
    <video
      ref={ref}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      src={sources[idx]}
      autoPlay
      muted
      playsInline
      loop={!multiple}
      onEnded={advance}
      onError={advance}
      aria-hidden
    />
  );
}
