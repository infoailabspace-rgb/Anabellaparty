"use client";

import { computeQuote, type CartItem } from "@/lib/pricing";

export default function PricePanel({ items }: { items: CartItem[] }) {
  const quote = computeQuote(items);

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
                  {l.name}{" "}
                  <span className="text-text/40">({l.tierLabel})</span>
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

      <div className="mt-4 border-t border-gold/15 pt-4">
        <div className="flex justify-between">
          <span className="font-semibold">Kopā</span>
          <span className="font-mono text-lg font-bold text-gold">
            {quote.subtotal} €
          </span>
        </div>
        {quote.hasContactOnly && (
          <p className="mt-1 text-xs text-rose-gold">
            * Daži produkti — cena vienojoties, nav iekļauti summā.
          </p>
        )}
        <div className="mt-3 space-y-1 text-xs text-text/60">
          <div className="flex justify-between">
            <span>Piegāde Pierīgā</span>
            <span>bez maksas</span>
          </div>
          <div className="flex justify-between">
            <span>Ārpus Pierīgas</span>
            <span className="font-mono">+0.50 €/km</span>
          </div>
        </div>
        <div className="mt-3 flex justify-between border-t border-gold/15 pt-3">
          <span className="text-sm">Priekšapmaksa (20%)</span>
          <span className="font-mono font-bold text-gold">{quote.deposit} €</span>
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-text/40">
        Aprēķins ir orientējošs. Cenas bez PVN. Precīzu piedāvājumu nosūtīsim pēc
        pieteikuma saņemšanas.
      </p>
    </div>
  );
}
