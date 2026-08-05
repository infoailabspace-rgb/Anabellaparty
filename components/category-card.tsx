import Link from "next/link";
import type { CategoryMeta } from "@/lib/categories";

export default function CategoryCard({ category }: { category: CategoryMeta }) {
  return (
    <Link
      href={category.href}
      className="group flex h-full flex-col rounded-2xl border border-gold/25 bg-navy/30 p-8 shadow-[0_20px_60px_-30px_rgba(212,169,96,0.25)] transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-[0_28px_70px_-24px_rgba(212,169,96,0.4)]"
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
