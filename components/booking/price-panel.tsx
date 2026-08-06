"use client";

import { useTranslations } from "next-intl";
import { computeQuote, computeTotals, formatEur, type CartItem } from "@/lib/pricing";
import type { Product } from "@/lib/products";

export default function PricePanel({
  items,
  products,
  deliveryCost,
  deliveryKm,
  deliveryComputed = false,
}: {
  items: CartItem[];
  products: Product[];
  deliveryCost?: number;
  deliveryKm?: number;
  deliveryComputed?: boolean;
}) {
  const t = useTranslations("pricePanel");
  const quote = computeQuote(items, products);
  const delivery = deliveryComputed ? deliveryCost ?? 0 : 0;
  const totals = computeTotals(quote.subtotal, delivery);

  return (
    <div className="rounded-2xl border border-gold/25 bg-navy/40 p-6">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-gold">
        {t("selected")}
      </h3>

      {quote.lines.length === 0 ? (
        <p className="mt-4 text-sm text-text/50">{t("empty")}</p>
      ) : (
        <ul className="mt-4 space-y-2 text-sm">
          {quote.lines.map((l) => (
            <li key={l.slug}>
              <div className="flex justify-between gap-3">
                <span className="text-text/85">
                  {l.name} <span className="text-text/40">({l.tierLabel})</span>
                </span>
                <span className="font-mono text-gold">
                  {l.contactOnly ? t("agree") : `${l.lineTotal} €`}
                </span>
              </div>
              {l.extraHours > 0 && (
                <div className="flex justify-between gap-3 pl-3 text-xs text-text/50">
                  <span>{t("extraHoursLine", { n: l.extraHours })}</span>
                  <span className="font-mono">{l.extraHoursTotal} €</span>
                </div>
              )}
              {l.addOns.map((a) => (
                <div
                  key={a.name}
                  className="flex justify-between gap-3 pl-3 text-xs text-text/50"
                >
                  <span>
                    + {a.name} × {a.qty}
                  </span>
                  <span className="font-mono">{a.total} €</span>
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 space-y-2 border-t border-gold/15 pt-4 text-sm">
        <div className="flex justify-between">
          <span>{t("inventory")}</span>
          <span className="font-mono">{formatEur(quote.subtotal)}</span>
        </div>
        <div className="flex justify-between text-text/70">
          <span>
            {t("delivery")}
            {deliveryComputed && deliveryKm ? ` (~${deliveryKm} km)` : ""}
          </span>
          <span className="font-mono">
            {deliveryComputed
              ? delivery > 0
                ? formatEur(delivery)
                : t("free")
              : t("deliveryStep2")}
          </span>
        </div>
        {quote.hasContactOnly && (
          <p className="text-xs text-rose-gold">{t("contactNote")}</p>
        )}
      </div>

      <div className="mt-3 space-y-2 border-t border-gold/15 pt-3 text-sm">
        <div className="flex justify-between text-text/80">
          <span>{t("net")}</span>
          <span className="font-mono">{formatEur(totals.net)}</span>
        </div>
        <div className="flex justify-between text-text/60">
          <span>{t("vat")}</span>
          <span className="font-mono">{formatEur(totals.vat)}</span>
        </div>
        <div className="flex justify-between border-t border-gold/15 pt-2">
          <span className="font-semibold">{t("gross")}</span>
          <span className="font-mono text-lg font-bold text-gold">
            {formatEur(totals.gross)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>{t("deposit")}</span>
          <span className="font-mono font-bold text-gold">
            {formatEur(totals.deposit)}
          </span>
        </div>
      </div>

      <p className="mt-4 rounded-lg border border-gold/25 bg-navy/40 p-3 text-sm leading-relaxed text-text/80">
        {t("note")}
      </p>
    </div>
  );
}
