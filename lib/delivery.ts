// Piegādes aprēķins no noliktavas Ķekavā.
export const ORIGIN = {
  lat: 56.8109713,
  lng: 24.2082151,
  label: "Vecozolu iela 14, Ķekava",
};

export const DELIVERY_RATE = 0.5; // € par km (viens virziens)
export const FREE_RADIUS_KM = 25; // bezmaksas zona (Pierīga) [JĀAPSTIPRINA]

// Bezmaksas ≤ 25 km; tālāk pilns attālums × €0.50.
export function computeDeliveryCost(km: number): number {
  if (!Number.isFinite(km) || km <= 0) return 0;
  if (km <= FREE_RADIUS_KM) return 0;
  return Math.round(km * DELIVERY_RATE);
}
