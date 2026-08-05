import { NextResponse } from "next/server";
import { ORIGIN, computeDeliveryCost, FREE_RADIUS_KM } from "@/lib/delivery";

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
    const coords = geo?.features?.[0]?.geometry?.coordinates as
      | [number, number]
      | undefined;
    if (!coords) {
      return NextResponse.json({
        ok: false,
        error: "Neizdevās atrast adresi. Piegādes cenu norādīsim manuāli.",
      });
    }
    const [destLng, destLat] = coords;

    // 2. Braukšanas attālums (ORS directions).
    const dirRes = await fetch(
      `${ORS}/v2/directions/driving-car?api_key=${key}&start=${ORIGIN.lng},${ORIGIN.lat}&end=${destLng},${destLat}`,
      { cache: "no-store" },
    );
    const dir = await dirRes.json();
    const meters = dir?.features?.[0]?.properties?.summary?.distance as
      | number
      | undefined;
    if (!meters) {
      return NextResponse.json({
        ok: false,
        error: "Neizdevās aprēķināt attālumu. Piegādes cenu norādīsim manuāli.",
      });
    }

    const km = Math.round(meters / 1000);
    const cost = computeDeliveryCost(km);
    return NextResponse.json({
      ok: true,
      km,
      cost,
      free: cost === 0,
      freeRadiusKm: FREE_RADIUS_KM,
      origin: ORIGIN.label,
    });
  } catch {
    return NextResponse.json({
      ok: false,
      error: "Piegādes aprēķins pagaidām nav pieejams. Norādīsim manuāli.",
    });
  }
}
