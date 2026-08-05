import Link from "next/link";
import type { CategoryMeta } from "@/lib/categories";

export default function CategoryCard({ category }: { category: CategoryMeta }) {
  return (
    <Link
      href={category.href}
      className="group flex h-full flex-col rounded-2xl border-2 border-gold/30 bg-navy/30 p-8 transition-transform hover:-translate-y-1 hover:border-gold/60"
    >
      <h3 className="font-display text-xl font-semibold text-text group-hover:text-gold">
        {category.name}
      </h3>
      <p className="mt-3 flex-1 text-sm text-text/70">{category.description}</p>
      <span className="mt-5 inline-block text-sm font-semibold text-gold">
        Apskatīt →
      </span>
    </Link>
  );
}
