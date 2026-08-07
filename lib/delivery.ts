// Piegādes aprēķins no noliktavas Ķekavā.
export const ORIGIN = {
  lat: 56.8109713,
  lng: 24.2082151,
  label: "Vecozolu iela 14, Ķekava",
};

// Bezmaksas zona ir ADMINISTRATĪVA (Ķekavas novads), ne ģeometriska.
export const FREE_ZONE = "Ķekavas novads";
// Rezerve, ja ģeokodēšana neatgriež novadu droši: ~15 km rādiuss ≈ Ķekavas novads.
export const FREE_FALLBACK_RADIUS_KM = 15;
// Cena: 25 € par 100 km, aprēķins turp-atpakaļ (= 0,25 €/km no viena virziena).
export const PRICE_PER_100KM_ROUNDTRIP = 25;

/** Vai adrese ir bezmaksas zonā — pēc reģiona nosaukuma; ja tā nav zināma, pēc rezerves rādiusa. */
export function isInFreeZone(
  regionName: string | undefined,
  kmOneWay: number,
): boolean {
  if (regionName) {
    // ORS/Pelias reģionu atgriež BEZ diakritikas ("Kekavas"), tāpēc normalizē ķ→k.
    const norm = regionName.toLowerCase().replace(/ķ/g, "k");
    return norm.includes("kekav");
  }
  return Number.isFinite(kmOneWay) && kmOneWay > 0 && kmOneWay <= FREE_FALLBACK_RADIUS_KM;
}

/** km = attālums VIENĀ virzienā no noliktavas. Turp-atpakaļ = km × 2. */
export function deliveryPrice(kmOneWay: number, inFreeZone: boolean): number {
  if (inFreeZone) return 0;
  if (!Number.isFinite(kmOneWay) || kmOneWay <= 0) return 0;
  const roundTripKm = kmOneWay * 2;
  return Math.round((roundTripKm / 100) * PRICE_PER_100KM_ROUNDTRIP * 100) / 100;
}
