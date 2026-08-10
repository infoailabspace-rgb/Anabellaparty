"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Hero medijs: poster/attēls (vienmēr next/image ar priority — LCP) + neobligāts
 * video virsū. Video ielādējas TIKAI desktopā (≥768px) un ja nav
 * prefers-reduced-motion; citādi redzams tikai poster (video vispār nemontējas).
 * preload="none" visur, izņemot sākumlapu (preloadMeta → "metadata").
 */
export default function HeroMedia({
  mp4,
  webm,
  poster,
  image,
  preloadMeta = false,
  className = "",
  posClass = "",
}: {
  mp4?: string | null;
  webm?: string | null;
  poster?: string | null;
  image?: string | null;
  preloadMeta?: boolean;
  className?: string;
  // object-position Tailwind klase (crop fokuss), piem. "object-top" vai "object-[center_40%]".
  posClass?: string;
}) {
  const still = image || poster || "";
  const [showVideo, setShowVideo] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!mp4) return;
    const desktop = window.matchMedia("(min-width: 768px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setShowVideo(desktop && !reduce);
  }, [mp4]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !showVideo) return;
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, [showVideo]);

  return (
    <>
      {still && (
        <Image
          src={still}
          alt=""
          fill
          priority
          sizes="100vw"
          className={`object-cover ${posClass} ${className}`}
          aria-hidden
        />
      )}
      {mp4 && showVideo && (
        <video
          ref={ref}
          className={`absolute inset-0 h-full w-full object-cover ${posClass} ${className}`}
          poster={poster || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload={preloadMeta ? "metadata" : "none"}
          aria-hidden
        >
          {webm && <source src={webm} type="video/webm" />}
          <source src={mp4} type="video/mp4" />
        </video>
      )}
    </>
  );
}
