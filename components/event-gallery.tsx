"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useInView } from "@/lib/use-in-view";
import type { GalleryImage } from "@/lib/gallery";

// Kartes platums: zem 768px 2 kolonnas (~50vw), no 768px 3 kolonnas (33vw), bet
// konteiners apstājas pie max-w-6xl (1104px saturs), tāpēc virs 1152px viewport
// karte ir fiksēti (1104 - 2*12) / 3 = 360px.
const CARD_SIZES = "(min-width: 1152px) 360px, (min-width: 768px) 33vw, 50vw";

// Viena kartīte - fade + slīde uz augšu, kad ienāk skatā (IntersectionObserver).
// Aizkave staggeram (i % 12) atkārto oriģinālo pakāpenisko parādīšanos.
// Fiksēta proporcija + object-cover: kartes režģī ir vienāda izmēra neatkarīgi
// no bildes malu attiecības.
function GalleryFigure({
  img,
  i,
  aspect,
  onOpen,
}: {
  img: GalleryImage;
  i: number;
  aspect: string;
  onOpen: () => void;
}) {
  const { ref, inView } = useInView<HTMLElement>({
    once: true,
    rootMargin: "-40px",
  });
  return (
    <figure
      ref={ref}
      style={{ transitionDelay: `${(i % 12) * 40}ms` }}
      className={`reveal-up overflow-hidden rounded-tile border border-gold/15${
        inView ? " is-visible" : ""
      }`}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={img.alt}
        className={`relative block ${aspect} w-full overflow-hidden`}
      >
        {/* next/image: srcset + sizes dod kartes izmēram atbilstošu variantu,
            nevis pilno augšupielādi. Lightbox atver oriģinālo URL. */}
        <Image
          src={img.url}
          alt={img.alt}
          fill
          sizes={CARD_SIZES}
          loading="lazy"
          quality={75}
          className="cursor-zoom-in object-cover transition-colors duration-(--duration-base)"
        />
      </button>
      {img.caption && (
        <figcaption className="px-2 py-1.5 text-xs text-text-muted">
          {img.caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function EventGallery({
  images,
  mode = "category",
  // Karšu proporcija. Noklusējums = visām lapām, kas bija līdz šim;
  // ai-foto lapa padod "aspect-[2/3]" (AI portreti ar rāmjiem).
  aspect = "aspect-[4/3]",
}: {
  images: GalleryImage[];
  mode?: "category" | "home";
  aspect?: string;
}) {
  const t = useTranslations("gallery");
  // Sāk ar 6 SSR'otiem (mazāks sākotnējais HTML/flight); pārējos rāda load-more.
  const [visible, setVisible] = useState(6);
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

  const shown = images.slice(0, visible);
  const hasMore = visible < images.length;

  return (
    <section className="bg-bg py-20">
      <div className="container-site">
        <h2 className="text-center font-display text-section font-semibold tracking-tight">
          {t("heading")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center leading-relaxed text-text/70">
          {t("subtitle")}
        </p>

        {/* Režģis, ne CSS columns: columns balansēja pēc augstuma, un ar 6
            kartēm 4 kolonnās sanāca 2+2+2+0 (tukša 4. kolonna, bloks nobīdīts
            pa kreisi). Režģis vienmēr aizpilda rindu no kreisās. */}
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
          {shown.map((img, i) => (
            <GalleryFigure
              key={img.id}
              img={img}
              i={i}
              aspect={aspect}
              onOpen={() => setActive(i)}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          {hasMore ? (
            <button
              onClick={() => setVisible((v) => v + 6)}
              className="rounded-full border-2 border-gold px-8 py-3 font-semibold text-gold transition-colors hover:bg-gold/10"
            >
              {t("showMore")}
            </button>
          ) : mode === "home" ? (
            <Link
              href="/svinibu-inventars"
              className="inline-block rounded-full border-2 border-gold px-8 py-3 font-semibold text-gold transition-colors hover:bg-gold/10"
            >
              {t("viewAll")}
            </Link>
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
              className="max-h-[80vh] max-w-full rounded-control object-contain"
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
