import { getTranslations } from "next-intl/server";
import type { Product } from "@/lib/products";
import { Link } from "@/i18n/navigation";
import ImageGallery from "@/components/image-gallery";
import PriceBlock from "@/components/price-block";
import { fromPrice, splitName } from "@/lib/product-display";

// Vienots produkta izkārtojums (redizains): galerija + virsraksts, cena
// "no X € + PVN" uzreiz zem virsraksta, 3-4 galvenās priekšrocības, primārais CTA
// ar ?item= priekšizvēli un sekundāra B2B saite. Bez sānu ieslīdēšanas efekta.
export default async function ProductDetail({
  product,
}: {
  product: Product;
  index?: number;
}) {
  const t = await getTranslations("productDetail");
  const th = await getTranslations("home");
  // Vāks pirmais; galerijā to nedublē; tukšie izmesti (vienīgā dedup vieta).
  const images = [
    product.coverImage,
    ...product.gallery.filter((g) => g && g !== product.coverImage),
  ].filter(Boolean);
  const { model, kind } = splitName(product.name);
  const price = product.contactOnly ? null : fromPrice(product);
  const includes = product.includes ?? [];
  const main = includes.slice(0, 4);
  const rest = includes.slice(4);

  return (
    <article
      id={product.slug}
      className="scroll-mt-24 rounded-panel border border-gold/20 bg-navy/20 p-5 sm:p-10"
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Galerija */}
        <ImageGallery images={images} alt={product.name} />

        {/* Info */}
        <div className="flex flex-col">
          <h2 className="font-display text-block font-semibold tracking-tight">{model}</h2>
          {kind && <p className="mt-1 text-text-muted">{kind}</p>}
          {price != null && (
            <p className="mt-4 text-xl font-semibold text-gold">{th("priceFrom", { price })}</p>
          )}
          <p className="mt-4 font-medium text-text/90">{product.tagline}</p>
          <p className="mt-3 text-text/80">{product.description}</p>

          {main.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-text-muted">
                {t("included")}
              </h3>
              <ul className="mt-4 space-y-3">
                {main.map((item) => (
                  <li key={item} className="flex gap-3 text-text/90">
                    <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {rest.length > 0 && (
                <details className="group mt-4">
                  <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold text-gold [&::-webkit-details-marker]:hidden">
                    {t("moreIncluded")} ({rest.length})
                    <span aria-hidden className="transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <ul className="mt-2 space-y-2">
                    {rest.map((item) => (
                      <li key={item} className="flex gap-3 text-sm text-text/80">
                        <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold/70" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          {product.specs && product.specs.length > 0 && (
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-gold/15 pt-6">
              {product.specs.map((s) => (
                <div key={s.label}>
                  <dt className="text-xs uppercase tracking-wide text-text-muted">{s.label}</dt>
                  <dd className="mt-0.5 text-sm text-text/90">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-8 border-t border-gold/15 pt-6">
            <PriceBlock product={product} />
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              {product.altPhone ? (
                <a
                  href={`tel:+371${product.altPhone}`}
                  className="inline-flex min-h-12 items-center rounded-full bg-gold px-7 font-semibold text-on-gold transition-colors hover:bg-gold/90"
                >
                  {t("call", { phone: `+371 ${product.altPhone}` })}
                </a>
              ) : (
                // Produkts jau priekšizvēlēts rezervācijas formā (?item=slug) - par vienu soli mazāk.
                <Link
                  href={{ pathname: "/rezervet", query: { item: product.slug } }}
                  className="inline-flex min-h-12 items-center rounded-full bg-gold px-7 font-semibold text-on-gold transition-colors hover:bg-gold/90"
                >
                  {t("book")}
                  <span className="sr-only">: {model}</span>
                </Link>
              )}
              <Link
                href="/kontakti/#pieprasijums"
                className="inline-flex min-h-11 items-center font-semibold text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold"
              >
                {t("b2bOffer")} →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
