import { NextResponse } from "next/server";
import {
  ORIGIN,
  resolveDelivery,
  type Geocoder,
  type Router,
} from "@/lib/delivery";
import { getSupabaseServer } from "@/lib/supabase";

export const runtime = "nodejs";

const ORS = "https://api.openrouteservice.org";

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

  // ORS ģeokods (Pelias) — atļauj papildu layers 2. mēģinājumam (localadmin,locality).
  const geocode: Geocoder = async (text, opts) => {
    const layers = opts?.layers ? `&layers=${encodeURIComponent(opts.layers)}` : "";
    const url = `${ORS}/geocode/search?api_key=${key}&text=${encodeURIComponent(
      text,
    )}&boundary.country=LV&size=1${layers}`;
    try {
      const res = await fetch(url, { cache: "no-store" });
      const j = await res.json();
      const f = j?.features?.[0];
      const coords = f?.geometry?.coordinates as [number, number] | undefined;
      if (!coords) return null;
      return { coords, props: f.properties ?? {} };
    } catch {
      return null;
    }
  };

  // ORS braukšanas attālums no noliktavas (viens virziens, km).
  const route: Router = async ([lng, lat]) => {
    const url = `${ORS}/v2/directions/driving-car?api_key=${key}&start=${ORIGIN.lng},${ORIGIN.lat}&end=${lng},${lat}`;
    try {
      const res = await fetch(url, { cache: "no-store" });
      const j = await res.json();
      const m = j?.features?.[0]?.properties?.summary?.distance;
      return typeof m === "number" ? Math.round(m / 1000) : null;
    } catch {
      return null;
    }
  };

  try {
    const r = await resolveDelivery(
      { address, city: enteredCity },
      { geocode, route, log: (msg, data) => console.error(msg, data) },
    );
    if (!r.ok) {
      return NextResponse.json({
        ok: false,
        error: r.error ?? "Piegādes aprēķins pagaidām nav pieejams. Norādīsim manuāli.",
      });
    }
    return NextResponse.json({
      ok: true,
      km: r.km ?? 0,
      cost: r.cost, // number | null (null = nezināma → "tiks precizēta")
      free: r.inFreeZone,
      inFreeZone: r.inFreeZone,
      approximate: r.approximate,
      region: r.region,
      geocoded: r.geocoded, // ORS label vai "locality" (approx)
      label: r.geocoded,
      resolvedCity: r.resolvedCity,
      cityMismatch: r.cityMismatch,
      freeZone: r.freeZone,
      origin: r.origin,
    });
  } catch {
    return NextResponse.json({
      ok: false,
      error: "Piegādes aprēķins pagaidām nav pieejams. Norādīsim manuāli.",
    });
  }
}
