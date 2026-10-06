// Produkta attēlošanas palīgi (sākumlapas kartītes un produktu lapas).
import type { Product } from "@/lib/products";

// Nosaukumu sadala modelī un aprakstā ("SPOGULIS - foto spogulis"), lai UI nav
// jāattēlo DB domuzīme un virsraksts ir īss. Pats DB nosaukums nemainās.
export function splitName(name: string): { model: string; kind: string | null } {
  const m = name.split(/\s+[\u2014\u2013-]\s+/);
  return m.length > 1 ? { model: m[0], kind: m.slice(1).join(" ") } : { model: name, kind: null };
}

/** Zemākā tarifa cena (bez PVN) vai null, ja cena tikai vienojoties. */
export function fromPrice(p: Product): number | null {
  const prices = p.tiers.map((t) => t.price).filter((x) => x > 0);
  return prices.length ? Math.min(...prices) : null;
}

/** Attēlošanai: DB nosaukuma garā domuzīme → "-" (pats nosaukums DB nemainās). */
export function displayName(name: string): string {
  return name.replace(/\s+[\u2014\u2013]\s+/g, " - ");
}
