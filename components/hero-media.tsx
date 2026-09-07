"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Hero medijs: poster/attēls (next/image ar priority + fetchPriority="high" — tas ir
 * LCP elements) un neobligāts video VIRSŪ. Video NEsāk pirms lapas `load`, lai
 * nekonkurē ar LCP attēlu; pēc load — requestIdleCallback (rezerve 1500 ms). Video
 * bez poster (attēlu jau renderē next/image) un ar preload="none". prefers-reduced-motion
 * → video vispār nemontējas (redzams tikai poster). Video ieslīd (fade) tikai kad gatavs.
 */
export default function HeroMedia({
  mp4,
  webm,
  poster,
  image,
  className = "",
  posClass = "",
}: {
  mp4?: string | null;
  webm?: string | null;
  poster?: string | null;
  image?: string | null;
  // Novecojis: video tagad vienmēr preload="none" un montējas pēc load.
  preloadMeta?: boolean;
  className?: string;
  posClass?: string;
}) {
  const still = image || poster || "";
  const [showVideo, setShowVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  // Montē video TIKAI pēc `load` (+ idle rezerve 1500 ms), lai netraucē LCP posteri.
  useEffect(() => {
    if (!mp4) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // reduced-motion → tikai poster, bez video

    let idleId: number | undefined;
    const mount = () => setShowVideo(true);
    const onLoad = () => {
      const ric = (window as unknown as {
        requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      }).requestIdleCallback;
      idleId = ric ? ric(mount, { timeout: 1500 }) : window.setTimeout(mount, 200);
    };

    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    return () => {
      window.removeEventListener("load", onLoad);
      if (idleId != null) {
        const cic = (window as unknown as {
          cancelIdleCallback?: (id: number) => void;
        }).cancelIdleCallback;
        if (cic) cic(idleId);
        else clearTimeout(idleId);
      }
    };
  }, [mp4]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !showVideo) return;
    // iOS/Android autoplay prasa muted+playsInline. React `muted` ne vienmēr uzstāda
    // DOM atribūtu, tāpēc iestatām tieši pirms play().
    v.muted = true;
    v.setAttribute("muted", "");
    v.playsInline = true;
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
          fetchPriority="high"
          quality={60}
          sizes="100vw"
          className={`object-cover ${posClass} ${className}`}
          aria-hidden
        />
      )}
      {mp4 && showVideo && (
        <video
          ref={ref}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            videoReady ? "opacity-100" : "opacity-0"
          } ${posClass} ${className}`}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          onPlaying={() => setVideoReady(true)}
        >
          {webm && <source src={webm} type="video/webm" />}
          <source src={mp4} type="video/mp4" />
        </video>
      )}
    </>
  );
}
