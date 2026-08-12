import { NextResponse } from "next/server";
import {
  ORIGIN,
  deliveryPrice,
  isInFreeZone,
  FREE_ZONE,
} from "@/lib/delivery";
import { getSupabaseServer } from "@/lib/supabase";

export const runtime = "nodejs";

const ORS = "https://api.openrouteservice.org";

// Normalizē LV vietvārdu salīdzināšanai: mazie burti, bez diakritikas, tikai burti.
function normPlace(s: unknown): string {
  const map: Record<string, string> = {
    ā: "a", č: "c", ē: "e", ģ: "g", ī: "i", ķ: "k",
    ļ: "l", ņ: "n", š: "s", ū: "u", ž: "z",
  };
  return String(s ?? "")
    .toLowerCase()
    .replace(/[āčēģīķļņšūž]/g, (m) => map[m] || m)
    .replace(/[^a-z]/g, "");
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: Request) {
  let address = "";
  let enteredCity = "";
  try {
    const body = await req.json();
    address = (body?.address ?? "").toString().trim();
    enteredCity = (body?.city ?? "").toString().trim();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!address) return NextResponse.json({ ok: false, error: "Trūkst adreses." });

  // Rate-limit (15 / IP / 10 min) — ORS ģeokodēšana ir maksas, sargā kvotu.
  const supabase = getSupabaseServer();
  if (supabase) {
    const { data: allowed, error: rateErr } = await supabase.rpc(
      "check_distance_rate",
      { p_ip: clientIp(req), p_limit: 15, p_window: "10 minutes" },
    );
    if (!rateErr && allowed === false) {
      return NextResponse.json(
        { ok: false, error: "Pārāk daudz aprēķinu. Pamēģini pēc brīža." },
        { status: 429 },
      );
    }
  }

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

    // Drošības slānis: vai lietotāja pilsēta atbilst atrastajai vietai?
    // Salīdzina pret locality/localadmin/region/county — ja nesakrīt nevienam,
    // atzīmē mismatch (Liepāja/Jelgava tips), lai klients apstiprina.
    const nCity = normPlace(enteredCity);
    const placeNames = [
      props.locality,
      props.localadmin,
      props.region,
      props.county,
      props.macrocounty,
    ]
      .map(normPlace)
      .filter(Boolean);
    const cityMismatch = Boolean(
      nCity &&
        placeNames.length &&
        !placeNames.some((p) => p.includes(nCity) || nCity.includes(p)),
    );

    return NextResponse.json({
      ok: true,
      km: km ?? 0,
      cost,
      free: inFreeZone,
      inFreeZone,
      region: regionName ?? null,
      geocoded,
      label: geocoded,
      resolvedCity: props.locality || props.localadmin || props.region || null,
      cityMismatch,
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
