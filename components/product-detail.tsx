import { getTranslations } from "next-intl/server";
import type { Product } from "@/lib/products";
import { Link } from "@/i18n/navigation";
import ImageGallery from "@/components/image-gallery";
import PriceBlock from "@/components/price-block";
import SlideReveal from "@/components/slide-reveal";

export default async function ProductDetail({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const t = await getTranslations("productDetail");
  // Vāks pirmais; galerijā to nedublē; tukšie izmesti (vienīgā dedup vieta).
  const images = [
    product.coverImage,
    ...product.gallery.filter((g) => g && g !== product.coverImage),
  ].filter(Boolean);
  return (
    <SlideReveal index={index}>
      <article
        id={product.slug}
        className="scroll-mt-24 rounded-3xl border-2 border-gold/25 bg-navy/25 p-6 sm:p-10"
      >
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Galerija */}
          <ImageGallery images={images} alt={product.name} />

          {/* Info */}
          <div className="flex flex-col">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              {product.name}
            </h2>
            <p className="mt-2 text-gold">{product.tagline}</p>
            <p className="mt-4 text-text/80">{product.description}</p>

            {product.specs && product.specs.length > 0 && (
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3">
                {product.specs.map((s) => (
                  <div key={s.label}>
                    <dt className="text-xs uppercase tracking-wide text-text/50">
                      {s.label}
                    </dt>
                    <dd className="text-sm text-text/90">{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {product.includes && product.includes.length > 0 && (
              <div className="mt-6">
                <h3 className="font-display text-sm font-semibold text-text">
                  {t("included")}
                </h3>
                <ul className="mt-3 space-y-2">
                  {product.includes.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-text/80">
                      <span className="text-gold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-gold/15 pt-6">
              <PriceBlock product={product} />
              {product.altPhone ? (
                <a
                  href={`tel:+371${product.altPhone}`}
                  className="rounded-full bg-gold px-7 py-3 font-semibold text-black transition-shadow hover:shadow-[0_0_25px_rgba(212,169,96,0.5)]"
                >
                  {t("call", { phone: `+371 ${product.altPhone}` })}
                </a>
              ) : (
                <Link
                  href="/rezervet"
                  className="rounded-full bg-gold px-7 py-3 font-semibold text-black transition-shadow hover:shadow-[0_0_25px_rgba(212,169,96,0.5)]"
                >
                  {t("book")}
                </Link>
              )}
            </div>
          </div>
        </div>
      </article>
    </SlideReveal>
  );
}
