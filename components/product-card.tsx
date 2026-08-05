"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product, ProductCategory } from "@/lib/products";
import ImagePlaceholder from "@/components/image-placeholder";

const categoryPath: Record<ProductCategory, string> = {
  "foto-kaste": "/foto-kaste",
  atrakcijas: "/piepusamas-atrakcijas",
  inventars: "/svinibu-inventars",
};

export default function ProductCard({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  const cover = product.images[0];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-gold/30 bg-navy/30 transition-transform hover:-translate-y-1">
      <div className="aspect-[4/3] w-full overflow-hidden">
        {failed || !cover ? (
          <ImagePlaceholder label={product.name} className="h-full w-full rounded-none border-0" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-lg font-semibold">{product.name}</h3>
        <p className="mt-2 flex-1 text-sm text-text/70">{product.tagline}</p>

        <div className="mt-4">
          <p className="font-mono text-2xl font-bold text-gold">
            €{product.price.amount}{" "}
            <span className="text-base text-text/60">/ {product.price.unit}</span>
          </p>
          {product.price.extra && (
            <p className="font-mono text-xs text-rose-gold">{product.price.extra}</p>
          )}
        </div>

        <Link
          href={categoryPath[product.category]}
          className="mt-5 inline-block rounded-full border-2 border-gold px-5 py-2 text-center text-sm font-semibold text-gold transition-colors hover:bg-gold/10"
        >
          Uzzināt vairāk
        </Link>
      </div>
    </div>
  );
}
