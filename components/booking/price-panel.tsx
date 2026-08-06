"use client";

import { computeQuote, computeDeposit, type CartItem } from "@/lib/pricing";
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
  const quote = computeQuote(items, products);
  const delivery = deliveryComputed ? deliveryCost ?? 0 : 0;
  const grand = quote.subtotal + delivery;
  const deposit = computeDeposit(quote.subtotal, delivery);

  return (
    <div className="rounded-2xl border border-gold/25 bg-navy/40 p-6">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-gold">
        Izvēlētais inventārs
      </h3>

      {quote.lines.length === 0 ? (
        <p className="mt-4 text-sm text-text/50">
          Vēl nav izvēlēts inventārs. Pievieno produktus 1. solī.
        </p>
      ) : (
        <ul className="mt-4 space-y-2 text-sm">
          {quote.lines.map((l) => (
            <li key={l.slug}>
              <div className="flex justify-between gap-3">
                <span className="text-text/85">
                  {l.name} <span className="text-text/40">({l.tierLabel})</span>
                </span>
                <span className="font-mono text-gold">
                  {l.contactOnly ? "vienojoties" : `${l.lineTotal} €`}
                </span>
              </div>
              {l.extraHours > 0 && (
                <div className="flex justify-between gap-3 pl-3 text-xs text-text/50">
                  <span>+ {l.extraHours} papildu stundas</span>
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
          <span>Inventārs</span>
          <span className="font-mono">{quote.subtotal} €</span>
        </div>
        <div className="flex justify-between text-text/70">
          <span>
            Piegāde
            {deliveryComputed && deliveryKm ? ` (~${deliveryKm} km)` : ""}
          </span>
          <span className="font-mono">
            {deliveryComputed
              ? delivery > 0
                ? `${delivery} €`
                : "bez maksas"
              : "aprēķina 2. solī"}
          </span>
        </div>
        {quote.hasContactOnly && (
          <p className="text-xs text-rose-gold">
            * Daži produkti — cena vienojoties, nav iekļauti summā.
          </p>
        )}
      </div>

      <div className="mt-3 space-y-2 border-t border-gold/15 pt-3">
        <div className="flex justify-between">
          <span className="font-semibold">Kopā</span>
          <span className="font-mono text-lg font-bold text-gold">{grand} €</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Avanss (50%)</span>
          <span className="font-mono font-bold text-gold">{deposit} €</span>
        </div>
      </div>

      <p className="mt-4 rounded-lg border border-gold/25 bg-navy/40 p-3 text-sm leading-relaxed text-text/80">
        Aprēķins ir orientējošs. Cenas bez PVN. Piegāde Pierīgā (līdz 25 km no
        Ķekavas) bez maksas. Precīzu piedāvājumu nosūtīsim pēc pieteikuma.
      </p>
    </div>
  );
}
