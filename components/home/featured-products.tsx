// Sākumlapas "Galvenie produkti": foto kastes vienotās kartītēs - foto, nosaukums,
// cena "no X € + PVN", 3-4 priekšrocības un CTA ar ?item= priekšizvēli.
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/lib/products";
import { homeCategories } from "@/lib/categories";
import { fromPrice, splitName } from "@/lib/product-display";

const FEATURED = ["spogulis", "ozols", "instagram"];

export default async function FeaturedProducts({ products }: { products: Product[] }) {
  const t = await getTranslations("home");
  const tc = await getTranslations("categories");
  const list = FEATURED.map((s) => products.find((p) => p.slug === s)).filter(
    (p): p is Product => Boolean(p),
  );
  if (!list.length) return null;
  const others = homeCategories.filter((c) => c.id !== "foto-kaste");

  return (
    <section className="section-y">
      <div className="container-site">
        <div className="max-w-2xl">
          <p className="eyebrow">{t("productsEyebrow")}</p>
          <h2 className="mt-3 font-display text-section font-semibold tracking-tight">
            {t("productsTitle")}
          </h2>
          <p className="mt-4 text-lead text-text-muted">{t("productsIntro")}</p>
        </div>

        <ul className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => {
            const { model, kind } = splitName(p.name);
            const price = fromPrice(p);
            const benefits = (p.includes ?? []).slice(0, 4);
            return (
              <li
                key={p.slug}
                className="group flex flex-col overflow-hidden rounded-card border border-gold/20 bg-navy/25 transition-colors duration-(--duration-base) hover:border-gold/50"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-navy">
                  <Image
                    src={p.coverImage}
                    alt={p.name}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                    quality={70}
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-card font-semibold tracking-tight">
                    {model}
                  </h3>
                  {kind && <p className="mt-1 text-sm text-text-muted">{kind}</p>}
                  <p className="mt-4 text-lg font-semibold text-gold">
                    {price != null ? t("priceFrom", { price }) : t("priceOnRequest")}
                  </p>
                  <ul className="mt-4 flex-1 space-y-2 text-sm text-text/85">
                    {benefits.map((b) => (
                      <li key={b} className="flex gap-3">
                        <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <Link
                      href={{ pathname: "/rezervet", query: { item: p.slug } }}
                      className="inline-flex min-h-11 items-center rounded-full bg-gold px-6 text-sm font-semibold text-on-gold transition-colors hover:bg-gold/90"
                    >
                      {t("bookThis")}
                      <span className="sr-only">: {model}</span>
                    </Link>
                    <Link
                      href={`/foto-kaste#${p.slug}`}
                      className="inline-flex min-h-11 items-center text-sm font-semibold text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold"
                    >
                      {t("learnMore")}
                      <span className="sr-only">: {model}</span>
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Pārējais inventārs - kompakti, bez konkurējošām kartītēm */}
        <nav aria-label={t("moreInventory")} className="mt-12 border-t border-gold/15 pt-8">
          <p className="text-sm font-semibold text-text">{t("moreInventory")}</p>
          <ul className="mt-4 flex flex-wrap gap-3">
            {others.map((c) => (
              <li key={c.id}>
                <Link
                  href={c.href}
                  className="inline-flex min-h-11 items-center rounded-full border border-gold/30 px-5 text-sm text-text/85 transition-colors hover:border-gold hover:text-gold"
                >
                  {tc(`${c.id}Name` as never)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
