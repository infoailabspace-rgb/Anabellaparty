import { NextResponse } from "next/server";
import {
  ORIGIN,
  deliveryPrice,
  isInFreeZone,
  FREE_ZONE,
} from "@/lib/delivery";

export const runtime = "nodejs";

const ORS = "https://api.openrouteservice.org";

export async function POST(req: Request) {
  let address = "";
  try {
    const body = await req.json();
    address = (body?.address ?? "").toString().trim();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!address) return NextResponse.json({ ok: false, error: "Trūkst adreses." });

  const key = process.env.ORS_API_KEY;
  if (!key) {
    return NextResponse.json({
      ok: false,
      error: "Piegādes aprēķins nav konfigurēts. Norādīsim manuāli.",
    });
  }

  try {
    // 1. Ģeokodē adresi (ORS/Pelias, ierobežots ar Latviju).
    const geoRes = await fetch(
      `${ORS}/geocode/search?api_key=${key}&text=${encodeURIComponent(
        address,
      )}&boundary.country=LV&size=1`,
      { cache: "no-store" },
    );
    const geo = await geoRes.json();
    const feature = geo?.features?.[0];
    const coords = feature?.geometry?.coordinates as
      | [number, number]
      | undefined;
    if (!coords) {
      return NextResponse.json({
        ok: false,
        error: "Neizdevās atrast adresi. Piegādes cenu norādīsim manuāli.",
      });
    }
    const [destLng, destLat] = coords;
    // Reģions/novads no ģeokodēšanas (Pelias): county → macrocounty → region.
    const props = feature?.properties ?? {};
    const regionName: string | undefined =
      props.county || props.macrocounty || props.region || undefined;
    // Ģeokodētais (ORS atrastais) adreses teksts — admin salīdzina ar klienta ievadīto.
    const geocoded: string | null = props.label ?? null;

    // 2. Braukšanas attālums (ORS directions).
    const dirRes = await fetch(
      `${ORS}/v2/directions/driving-car?api_key=${key}&start=${ORIGIN.lng},${ORIGIN.lat}&end=${destLng},${destLat}`,
      { cache: "no-store" },
    );
    const dir = await dirRes.json();
    const meters = dir?.features?.[0]?.properties?.summary?.distance as
      | number
      | undefined;
    const km = typeof meters === "number" ? Math.round(meters / 1000) : null;
    const inFreeZone = isInFreeZone(regionName, km ?? 0);

    // Bezmaksas zona (Ķekavas novads) → vienmēr 0 €, arī ja maršruts neizdevās.
    // Tikai ja NAV bezmaksas UN nav attāluma → norādām manuāli.
    if (km === null && !inFreeZone) {
      return NextResponse.json({
        ok: false,
        error: "Neizdevās aprēķināt attālumu. Piegādes cenu norādīsim manuāli.",
      });
    }

    const cost = deliveryPrice(km ?? 0, inFreeZone);
    return NextResponse.json({
      ok: true,
      km: km ?? 0,
      cost,
      free: inFreeZone,
      inFreeZone,
      region: regionName ?? null,
      geocoded,
      freeZone: FREE_ZONE,
      origin: ORIGIN.label,
    });
  } catch {
    return NextResponse.json({
      ok: false,
      error: "Piegādes aprēķins pagaidām nav pieejams. Norādīsim manuāli.",
    });
  }
}
