import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { CategoryMeta } from "@/lib/categories";
import { categoryIcons, IconBadge } from "@/components/icons";
import Shimmer from "@/components/shimmer";
import { getSiteImage } from "@/lib/site-content";

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
  const [tc, tcommon, dbImage] = await Promise.all([
    getTranslations("categories"),
    getTranslations("common"),
    getSiteImage(`category.${category.id}`),
  ]);
  const Icon = categoryIcons[category.id];
  // DB attēls (admin "Lapas attēli") → statiskais fails (ja eksistē) → tīrs navy.
  const bgSrc = dbImage ?? (bgExists(category.bgImage) ? category.bgImage : null);
  const hasBg = !!bgSrc;

  // "Drīzumā" kartīte (Izklaides punkts): pēc struktūras identiska parastajai
  // (DB attēls + tumšinājums, ja ir; citādi luxury gradients). Atšķirība: nav
  // klikšķināma un rāda DRĪZUMĀ uzlīmi, nevis "apskatīt →".
  if (category.comingSoon) {
    return (
      <div className="group relative isolate flex h-full cursor-default flex-col overflow-hidden rounded-2xl border border-gold/30 bg-navy p-8 shadow-[0_20px_60px_-30px_rgba(212,169,96,0.35)]">
        {hasBg ? (
          <>
            {/* Augšupielādētais DB attēls kā fons + tumšinājums (kā aktīvām kartītēm) */}
            <Image
              src={bgSrc!}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              quality={55}
              loading="lazy"
              aria-hidden="true"
              className="-z-10 object-cover"
            />
            <div className="absolute inset-0 -z-10 bg-bg/45" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-bg/90 via-bg/35 to-transparent" />
          </>
        ) : (
          <>
            {/* Fallback: luxury gradients, ja DB attēla nav */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#1e4257] via-navy to-[#0a1a22]" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-10%,rgba(212,169,96,0.30),transparent_55%)]" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_110%,rgba(212,169,96,0.12),transparent_50%)]" />
          </>
        )}
        {/* DRĪZUMĀ uzlīme stūrī */}
        <span className="absolute right-4 top-4 z-10 rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gold">
          {tc("comingSoonBadge")}
        </span>
        <Shimmer delay={index * 0.6} />
        <IconBadge delay={index * 0.3}>
          <Icon className="h-6 w-6" />
        </IconBadge>
        <h3 className="mt-5 font-display text-xl font-semibold text-text">
          {tc(`${category.id}Name`)}
        </h3>
        <p className="mt-3 flex-1 text-sm text-text/70">
          {tc(`${category.id}Desc`)}
        </p>
      </div>
    );
  }

  return (
    <Link
      href={category.href}
      className="group relative isolate flex h-full flex-col overflow-hidden rounded-2xl border border-gold/25 bg-navy/30 p-8 shadow-[0_20px_60px_-30px_rgba(212,169,96,0.25)] transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-[0_28px_70px_-24px_rgba(212,169,96,0.4)]"
    >
      {hasBg && (
        <>
          {/* Fona attēls — mazs, izstiepts (bez CSS blur), zema kvalitāte OK */}
          <Image
            src={bgSrc!}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            quality={55}
            loading="lazy"
            aria-hidden="true"
            className="-z-10 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* 1. Viegls vienmērīgs tumšinājums — attēls paliek gaišs; hover vēl gaišāks */}
          <div className="absolute inset-0 -z-10 bg-bg/45 transition-colors duration-500 group-hover:bg-bg/25" />
          {/* 2. Gradients: kontrasts TIKAI apakšā, kur teksts; augšā caurspīdīgs → attēls redzams */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-bg/90 via-bg/35 to-transparent" />
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
