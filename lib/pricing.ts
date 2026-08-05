import { getProductBySlug, type Product } from "@/lib/products";

export const DEPOSIT_RATE = 0.5; // avanss 50% no kopsummas

// Avanss 50% no kopsummas (inventārs + piegāde).
export function computeDeposit(subtotal: number, deliveryCost = 0): number {
  return Math.round((subtotal + deliveryCost) * DEPOSIT_RATE);
}

export type CartItem = {
  slug: string;
  tierIndex: number; // indekss product.tiers masīvā
  extraHours: number; // papildu stundas (foto kastēm ar hourlyExtra)
  addOns: Record<string, number>; // papildinājuma nosaukums -> daudzums
};

export type QuoteAddOnLine = {
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
};

export type QuoteLine = {
  slug: string;
  name: string;
  tierLabel: string;
  basePrice: number;
  extraHours: number;
  hourlyExtra: number;
  extraHoursTotal: number;
  addOns: QuoteAddOnLine[];
  lineTotal: number;
  contactOnly: boolean;
};

export type Quote = {
  lines: QuoteLine[];
  subtotal: number;
  deposit: number;
  hasContactOnly: boolean;
};

// Drošs tarifa nolasījums — atgriež cenu vai null (contactOnly / "vienojoties").
function tierFor(product: Product, tierIndex: number) {
  const tier = product.tiers[tierIndex];
  if (!tier) return null;
  return tier;
}

export function computeQuote(items: CartItem[]): Quote {
  const lines: QuoteLine[] = [];
  let subtotal = 0;
  let hasContactOnly = false;

  for (const item of items) {
    const product = getProductBySlug(item.slug);
    if (!product) continue;

    // contactOnly produkti vai tarifs ar cenu 0 ("Uz visu pasākumu — vienojoties")
    const tier = tierFor(product, item.tierIndex);
    const isContact = product.contactOnly || !tier || tier.price === 0;

    if (isContact) {
      hasContactOnly = true;
      lines.push({
        slug: product.slug,
        name: product.name,
        tierLabel: tier?.duration ?? "Vienojoties",
        basePrice: 0,
        extraHours: 0,
        hourlyExtra: 0,
        extraHoursTotal: 0,
        addOns: [],
        lineTotal: 0,
        contactOnly: true,
      });
      continue;
    }

    const basePrice = tier.price;
    const hourlyExtra = product.hourlyExtra ?? 0;
    const extraHours = Math.max(0, item.extraHours || 0);
    const extraHoursTotal = extraHours * hourlyExtra;

    const addOnLines: QuoteAddOnLine[] = [];
    for (const [name, qtyRaw] of Object.entries(item.addOns ?? {})) {
      const qty = Math.max(0, qtyRaw || 0);
      if (qty === 0) continue;
      const addOn = product.addOns?.find((a) => a.name === name);
      if (!addOn) continue;
      addOnLines.push({
        name: addOn.name,
        qty,
        unitPrice: addOn.price,
        total: addOn.price * qty,
      });
    }

    const addOnsTotal = addOnLines.reduce((s, a) => s + a.total, 0);
    const lineTotal = basePrice + extraHoursTotal + addOnsTotal;
    subtotal += lineTotal;

    lines.push({
      slug: product.slug,
      name: product.name,
      tierLabel: tier.duration,
      basePrice,
      extraHours,
      hourlyExtra,
      extraHoursTotal,
      addOns: addOnLines,
      lineTotal,
      contactOnly: false,
    });
  }

  return {
    lines,
    subtotal,
    deposit: Math.round(subtotal * DEPOSIT_RATE),
    hasContactOnly,
  };
}
