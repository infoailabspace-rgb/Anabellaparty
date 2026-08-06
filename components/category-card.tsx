import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { CategoryMeta } from "@/lib/categories";
import { categoryIcons, IconBadge } from "@/components/icons";
import Shimmer from "@/components/shimmer";

// SOLIS1D: fona attēlu rāda TIKAI, ja fails reāli eksistē public/.
// Ja nav — kartīte paliek ar tīru navy (kā tagad). Pārbauda būvēšanas laikā.
function bgExists(bgImage: string): boolean {
  try {
    return existsSync(join(process.cwd(), "public", bgImage));
  } catch {
    return false;
  }
}

export default async function CategoryCard({
  category,
  index = 0,
}: {
  category: CategoryMeta;
  index?: number;
}) {
  const [tc, tcommon] = await Promise.all([
    getTranslations("categories"),
    getTranslations("common"),
  ]);
  const Icon = categoryIcons[category.id];
  const hasBg = bgExists(category.bgImage);
  return (
    <Link
      href={category.href}
      className="group relative isolate flex h-full flex-col overflow-hidden rounded-2xl border border-gold/25 bg-navy/30 p-8 shadow-[0_20px_60px_-30px_rgba(212,169,96,0.25)] transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-[0_28px_70px_-24px_rgba(212,169,96,0.4)]"
    >
      {hasBg && (
        <>
          {/* Fona attēls — mazs, izstiepts (bez CSS blur), zema kvalitāte OK */}
          <Image
            src={category.bgImage}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            quality={55}
            loading="lazy"
            aria-hidden="true"
            className="-z-10 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* 1. Vienmērīgs tumšinājums — hover nedaudz atkāpjas */}
          <div className="absolute inset-0 -z-10 bg-bg/75 transition-colors duration-500 group-hover:bg-bg/65" />
          {/* 2. Gradients no apakšas — tur, kur teksts */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-bg via-bg/85 to-bg/50" />
        </>
      )}
      <Shimmer delay={index * 0.6} />
      <IconBadge delay={index * 0.3}>
        <Icon className="h-6 w-6" />
      </IconBadge>
      <h3 className="mt-5 font-display text-xl font-semibold text-text group-hover:text-gold">
        {tc(`${category.id}Name`)}
      </h3>
      <p className="mt-3 flex-1 text-sm text-text/70">
        {tc(`${category.id}Desc`)}
      </p>
      <span className="mt-5 inline-block text-sm font-semibold text-gold">
        {tcommon("apskatit")} →
      </span>
    </Link>
  );
}
