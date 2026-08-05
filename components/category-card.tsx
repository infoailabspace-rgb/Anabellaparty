import Link from "next/link";
import type { CategoryMeta } from "@/lib/categories";
import { categoryIcons, IconBadge } from "@/components/icons";

export default function CategoryCard({
  category,
  index = 0,
}: {
  category: CategoryMeta;
  index?: number;
}) {
  const Icon = categoryIcons[category.id];
  return (
    <Link
      href={category.href}
      className="group flex h-full flex-col rounded-2xl border border-gold/25 bg-navy/30 p-8 shadow-[0_20px_60px_-30px_rgba(212,169,96,0.25)] transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-[0_28px_70px_-24px_rgba(212,169,96,0.4)]"
    >
      <IconBadge delay={index * 0.3}>
        <Icon className="h-6 w-6" />
      </IconBadge>
      <h3 className="mt-5 font-display text-xl font-semibold text-text group-hover:text-gold">
        {category.name}
      </h3>
      <p className="mt-3 flex-1 text-sm text-text/70">{category.description}</p>
      <span className="mt-5 inline-block text-sm font-semibold text-gold">
        Apskatīt →
      </span>
    </Link>
  );
}
