"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { GalleryImage } from "@/lib/gallery";

export default function EventGallery({
  images,
  mode = "category",
}: {
  images: GalleryImage[];
  mode?: "category" | "home";
}) {
  const t = useTranslations("gallery");
  const [visible, setVisible] = useState(12);
  const [active, setActive] = useState<number | null>(null);
  const touch = useRef<number | null>(null);

  const go = useCallback(
    (dir: number) => {
      setActive((i) => (i === null ? i : (i + dir + images.length) % images.length));
    },
    [images.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, go]);

  // Bez bildēm → sadaļa netiek renderēta.
  if (!images.length) return null;

  const shown = mode === "home" ? images.slice(0, 12) : images.slice(0, visible);
  const hasMore = mode === "category" && visible < images.length;

  return (
    <section className="bg-bg py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center font-display text-3xl font-bold tracking-tight md:text-4xl">
          {t("heading")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center leading-relaxed text-text/70">
          {t("subtitle")}
        </p>

        <div className="mt-10 columns-2 gap-3 md:columns-3 lg:columns-4">
          {shown.map((img, i) => (
            <motion.figure
              key={img.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: (i % 12) * 0.04 }}
              className="mb-3 break-inside-avoid overflow-hidden rounded-xl border border-gold/15"
            >
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={img.alt}
                className="block w-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full cursor-zoom-in transition-transform duration-300 hover:scale-[1.03]"
                />
              </button>
              {img.caption && (
                <figcaption className="px-2 py-1.5 text-xs text-text/50">
                  {img.caption}
                </figcaption>
              )}
            </motion.figure>
          ))}
        </div>

        <div className="mt-10 text-center">
          {mode === "home" ? (
            <Link
              href="/svinibu-inventars"
              className="inline-block rounded-full border-2 border-gold px-8 py-3 font-semibold text-gold transition-colors hover:bg-gold/10"
            >
              {t("viewAll")}
            </Link>
          ) : hasMore ? (
            <button
              onClick={() => setVisible((v) => v + 12)}
              className="rounded-full border-2 border-gold px-8 py-3 font-semibold text-gold transition-colors hover:bg-gold/10"
            >
              {t("showMore")}
            </button>
          ) : null}
        </div>
      </div>

      {/* Lightbox */}
      {active !== null && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setActive(null)}
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touch.current === null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            touch.current = null;
          }}
          role="dialog"
          aria-modal="true"
          aria-label={t("heading")}
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-label="Aizvērt"
            className="absolute right-4 top-4 text-3xl text-text/80 hover:text-gold"
          >
            ✕
          </button>
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
          <figure
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[88vh] max-w-[92vw] flex-col items-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[active].url}
              alt={images[active].alt}
              className="max-h-[80vh] max-w-full rounded-lg object-contain"
            />
            <figcaption className="mt-3 text-center text-sm text-text/70">
              {images[active].caption && <span>{images[active].caption} · </span>}
              {active + 1} / {images.length}
            </figcaption>
          </figure>
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
        </div>
      )}
    </section>
  );
}
