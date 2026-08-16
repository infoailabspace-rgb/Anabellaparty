import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/lib/products";

function formatPrice(n: number) {
  return `${n} €`;
}

export default async function PriceBlock({ product }: { product: Product }) {
  const t = await getTranslations("productDetail");
  const { tiers, hourlyExtra, addOns, contactOnly } = product;

  if (contactOnly) {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <span className="font-mono text-xl font-bold text-gold">
          {t("priceByArrangement")}
        </span>
        <Link
          href="/kontakti"
          className="rounded-full border-2 border-gold px-5 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold/10"
        >
          {t("contactUs")}
        </Link>
      </div>
    );
  }

  const priced = tiers.filter((t) => t.price > 0);
  const contactTiers = tiers.filter((t) => t.price === 0);

  return (
    <div className="space-y-2">
      {priced.length > 1 ? (
        // Vairāki tarifi — tabula (24h / 48h / 72h u.tml.)
        <div className="flex flex-wrap gap-2">
          {priced.map((t) => (
            <div
              key={t.duration}
              className="rounded-lg border border-gold/25 bg-bg/40 px-3 py-2 text-center"
            >
              <div className="text-xs uppercase tracking-wide text-text/50">
                {t.duration}
              </div>
              <div className="font-mono text-lg font-bold text-gold">
                {formatPrice(t.price)}
              </div>
              {t.note && (
                <div className="text-[11px] text-rose-gold">{t.note}</div>
              )}
            </div>
          ))}
        </div>
      ) : priced.length === 1 ? (
        // Viens tarifs
        <p className="font-mono text-2xl font-bold text-gold">
          {priced[0].duration} — {formatPrice(priced[0].price)}
          {priced[0].note && (
            <span className="ml-2 text-sm text-rose-gold">{priced[0].note}</span>
          )}
        </p>
      ) : null}

      {typeof hourlyExtra === "number" && (
        <p className="text-sm text-text/70">
          {t("eachAdditionalHour")}{" "}
          <span className="font-mono text-gold">+{formatPrice(hourlyExtra)}</span>
        </p>
      )}

      {contactTiers.map((ct) => (
        <p key={ct.duration} className="text-sm text-text/70">
          {ct.duration} — {ct.note ?? t("priceByArrangement")}
        </p>
      ))}

      {addOns && addOns.length > 0 && (
        <ul className="mt-1 space-y-0.5 text-xs text-text/60">
          {addOns.map((a) => (
            <li key={a.name}>
              + {a.name}
              {a.unit ? ` (${a.unit})` : ""} —{" "}
              <span className="font-mono text-rose-gold">
                {formatPrice(a.price)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="pt-1 text-xs text-text/40">{t("vatNote")}</p>
    </div>
  );
}
