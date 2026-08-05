"use client";

import { useCallback, useEffect, useState } from "react";
import ImagePlaceholder from "@/components/image-placeholder";

export default function ImageGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const [lightbox, setLightbox] = useState(false);

  const markFailed = (i: number) =>
    setFailed((prev) => (prev[i] ? prev : { ...prev, [i]: true }));

  const hasImages = images.length > 0;
  const activeFailed = !hasImages || failed[active];

  const go = useCallback(
    (dir: number) => {
      if (!hasImages) return;
      setActive((i) => (i + dir + images.length) % images.length);
    },
    [hasImages, images.length],
  );

  // Lightbox tastatūras vadība.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, go]);

  return (
    <div className="flex flex-col gap-4">
      {/* Galvenais attēls */}
      <button
        type="button"
        onClick={() => hasImages && !activeFailed && setLightbox(true)}
        aria-label={`${alt} — palielināt`}
        className="aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-xl"
      >
        {activeFailed ? (
          <ImagePlaceholder label={alt} className="h-full w-full" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[active]}
            alt={alt}
            className="h-full w-full object-cover"
            onError={() => markFailed(active)}
          />
        )}
      </button>

      {/* Sīktēli */}
      {images.length > 1 && (
        <div className="flex flex-wrap gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${alt} — attēls ${i + 1}`}
              aria-current={i === active}
              className={`aspect-square w-20 overflow-hidden rounded-lg border-2 transition-colors ${
                i === active ? "border-gold" : "border-gold/20 hover:border-gold/50"
              }`}
            >
              {failed[i] ? (
                <ImagePlaceholder label={`${i + 1}`} className="h-full w-full !p-1" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={() => markFailed(i)}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && !activeFailed && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Aizvērt"
            className="absolute right-4 top-4 text-3xl text-text/80 hover:text-gold"
          >
            ✕
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              aria-label="Iepriekšējais"
              className="absolute left-4 text-4xl text-text/80 hover:text-gold"
            >
              ‹
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[active]}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            onError={() => {
              markFailed(active);
              setLightbox(false);
            }}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
          />

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              aria-label="Nākamais"
              className="absolute right-4 text-4xl text-text/80 hover:text-gold"
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}
