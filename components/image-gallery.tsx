"use client";

import { useState } from "react";
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

  const markFailed = (i: number) =>
    setFailed((prev) => (prev[i] ? prev : { ...prev, [i]: true }));

  const hasImages = images.length > 0;
  const activeFailed = !hasImages || failed[active];

  return (
    <div className="flex flex-col gap-4">
      {/* Galvenais attēls */}
      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl">
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
      </div>

      {/* Sīktēli */}
      {images.length > 1 && (
        <div className="flex gap-3">
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
    </div>
  );
}
