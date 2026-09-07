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

/** km = attālums VIENĀ virzienā no noliktavas. Turp-atpakaļ = km × 2. */
export function deliveryPrice(kmOneWay: number, inFreeZone: boolean): number {
  if (inFreeZone) return 0;
  if (!Number.isFinite(kmOneWay) || kmOneWay <= 0) return 0;
  const roundTripKm = kmOneWay * 2;
  return Math.round((roundTripKm / 100) * PRICE_PER_100KM_ROUNDTRIP * 100) / 100;
}

// ─────────────────────────── Adreses normalizācija ──────────────────────────

// Diakritiku noņemšana + normalizācija salīdzināšanai (mazie burti, tikai a-z0-9 + atstarpes).
export function normLv(s: string | undefined | null): string {
  const map: Record<string, string> = {
    ā: "a", č: "c", ē: "e", ģ: "g", ī: "i", ķ: "k",
    ļ: "l", ņ: "n", š: "s", ū: "u", ž: "z",
  };
  return String(s ?? "")
    .toLowerCase()
    .replace(/[āčēģīķļņšūž]/g, (m) => map[m] || m)
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// 2021. gada ATR reforma: vecais novads → jaunais novads (normalizēts "X novads").
// Tikai gadījumi, kur nosaukums MAINĪJĀS (jaunie novadi, kas paturēja nosaukumu, nav sarakstā).
export const NOVADI_2021: Record<string, string> = {
  // Aizkraukles novads
  "jaunjelgavas novads": "aizkraukles novads",
  "kokneses novads": "aizkraukles novads",
  "neretas novads": "aizkraukles novads",
  "plavinu novads": "aizkraukles novads",
  "skriveru novads": "aizkraukles novads",
  // Alūksnes novads
  "apes novads": "aluksnes novads",
  // Augšdaugavas novads (jauns)
  "daugavpils novads": "augsdaugavas novads",
  "ilukstes novads": "augsdaugavas novads",
  // Ādažu novads
  "carnikavas novads": "adazu novads",
  // Balvu novads
  "vilakas novads": "balvu novads",
  // Bauskas novads
  "iecavas novads": "bauskas novads",
  "rundales novads": "bauskas novads",
  "vecumnieku novads": "bauskas novads",
  // Cēsu novads
  "amatas novads": "cesu novads",
  "jaunpiebalgas novads": "cesu novads",
  "ligatnes novads": "cesu novads",
  "pargaujas novads": "cesu novads",
  "priekulu novads": "cesu novads",
  "vecpiebalgas novads": "cesu novads",
  // Dienvidkurzemes novads (jauns)
  "aizputes novads": "dienvidkurzemes novads",
  "durbes novads": "dienvidkurzemes novads",
  "grobinas novads": "dienvidkurzemes novads",
  "nicas novads": "dienvidkurzemes novads",
  "pavilostas novads": "dienvidkurzemes novads",
  "priekules novads": "dienvidkurzemes novads",
  "rucavas novads": "dienvidkurzemes novads",
  "vainodes novads": "dienvidkurzemes novads",
  // Dobeles novads
  "auces novads": "dobeles novads",
  "tervetes novads": "dobeles novads",
  // Jelgavas novads
  "ozolnieku novads": "jelgavas novads",
  // Jēkabpils novads
  "aknistes novads": "jekabpils novads",
  "krustpils novads": "jekabpils novads",
  "salas novads": "jekabpils novads",
  "viesites novads": "jekabpils novads",
  // Krāslavas novads
  "dagdas novads": "kraslavas novads",
  // Kuldīgas novads
  "skrundas novads": "kuldigas novads",
  // Ķekavas novads
  "baldones novads": "kekavas novads",
  // Limbažu novads
  "alojas novads": "limbazu novads",
  "salacgrivas novads": "limbazu novads",
  // Ludzas novads
  "ciblas novads": "ludzas novads",
  "karsavas novads": "ludzas novads",
  "zilupes novads": "ludzas novads",
  // Madonas novads
  "cesvaines novads": "madonas novads",
  "erglu novads": "madonas novads",
  "lubanas novads": "madonas novads",
  // Mārupes novads
  "babites novads": "marupes novads",
  // Ogres novads
  "ikskiles novads": "ogres novads",
  "keguma novads": "ogres novads",
  "lielvardes novads": "ogres novads",
  // Preiļu novads
  "aglonas novads": "preilu novads",
  "riebinu novads": "preilu novads",
  "varkavas novads": "preilu novads",
  // Rēzeknes novads
  "vilanu novads": "rezeknes novads",
  // Ropažu novads (jauns)
  "garkalnes novads": "ropazu novads",
  "incukalna novads": "ropazu novads",
  "stopinu novads": "ropazu novads",
  // Saldus novads
  "brocenu novads": "saldus novads",
  // Saulkrastu novads
  "sejas novads": "saulkrastu novads",
  // Siguldas novads
  "krimuldas novads": "siguldas novads",
  "malpils novads": "siguldas novads",
  // Smiltenes novads
  "raunas novads": "smiltenes novads",
  // Talsu novads
  "dundagas novads": "talsu novads",
  "mersraga novads": "talsu novads",
  "rojas novads": "talsu novads",
  // Tukuma novads
  "engures novads": "tukuma novads",
  "jaunpils novads": "tukuma novads",
  "kandavas novads": "tukuma novads",
  // Valmieras novads
  "beverinas novads": "valmieras novads",
  "burtnieku novads": "valmieras novads",
  "kocenu novads": "valmieras novads",
  "mazsalacas novads": "valmieras novads",
  "nauksenu novads": "valmieras novads",
  "rujienas novads": "valmieras novads",
  "strencu novads": "valmieras novads",
};

/** Pārveido novada nosaukumu uz 2021. g. reformas jauno (ja mainījies). Normalizēts. */
export function mapNovads2021(novadNorm: string): string {
  return NOVADI_2021[novadNorm] ?? novadNorm;
}

export type AddressTokens = {
  cleaned: string;
  pagasts?: string; // "Tīnužu pagasts" (oriģinālais reģistrs)
  pilseta?: string; // pirmais ne-ielas, ne-pagasta/novada tokens (pilsēta/ciems)
  novads?: string; // jau kartēts uz 2021 (normalizēts, piem. "ogres novads")
  places: string[]; // visi ne-ielas tokeni normalizēti (salīdzināšanai)
};

/** Notīra: apcērp atstarpes un liekās beigu/sākuma komatus. */
export function cleanAddress(raw: string): string {
  return String(raw ?? "")
    .replace(/\s+/g, " ")
    .replace(/^[\s,]+|[\s,]+$/g, "")
    .trim();
}

/** Izvelk pagasta/novada/pilsētas tokenus. Novads tiek kartēts uz 2021. reformu. */
export function extractTokens(raw: string): AddressTokens {
  const cleaned = cleanAddress(raw);
  const tokens = cleaned
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  let pagasts: string | undefined;
  let pilseta: string | undefined;
  let novadsNorm: string | undefined;
  const places: string[] = [];

  for (const tok of tokens) {
    const n = normLv(tok);
    if (/\bpagasts$/.test(n)) {
      pagasts = pagasts ?? tok;
      places.push(n.replace(/\s*pagasts$/, "").trim());
    } else if (/\bnovads$/.test(n)) {
      const mapped = mapNovads2021(n);
      novadsNorm = novadsNorm ?? mapped;
      places.push(mapped.replace(/\s*novads$/, "").trim());
      places.push(n.replace(/\s*novads$/, "").trim());
    } else if (!/\d/.test(n) && n.length >= 3) {
      // Ne-ielas tokens (bez cipariem) — kandidāts pilsētai/ciemam.
      pilseta = pilseta ?? tok;
      places.push(n);
    }
  }

  return {
    cleaned,
    pagasts,
    pilseta,
    novads: novadsNorm,
    places: Array.from(new Set(places.filter(Boolean))),
  };
}

/**
 * Latviešu ģenitīvs daudzskaitlī "-u" → nominatīvs "-i" (Tīnužu → Tīnuži,
 * Salas → Sala neder, tāpēc tikai "-u"). Ļauj no pagasta ("Tīnužu pagasts")
 * atvasināt ciema/apdzīvotās vietas nosaukumu ("Tīnuži"), ko ORS atrod.
 */
export function nominativise(word: string): string {
  return /u$/i.test(word) ? word.slice(0, -1) + "i" : word;
}

/** Sagatavo salīdzināšanas mērķus (pagasts + bāze + nominatīvs + pilsēta). */
function localityTargets(ex: AddressTokens): string[] {
  const targets: string[] = [];
  if (ex.pagasts) {
    const p = normLv(ex.pagasts);
    const baseNorm = p.replace(/\s*pagasts$/, "").trim();
    targets.push(p, baseNorm, nominativise(baseNorm));
  }
  if (ex.pilseta) targets.push(normLv(ex.pilseta));
  return targets.filter((t, i, a) => t.length >= 3 && a.indexOf(t) === i);
}

/** Sakārtoti 2. mēģinājuma vaicājumi — no precīzākā (nominatīvs) uz vispārīgāko. */
export function attempt2Queries(ex: AddressTokens): string[] {
  const novadLabel = ex.novads
    ? ex.novads.replace(/\b\w/g, (c) => c.toUpperCase())
    : undefined;
  const pagastsBase = ex.pagasts
    ? ex.pagasts.replace(/\s*pagasts$/i, "").trim()
    : undefined;
  const nom = pagastsBase ? nominativise(pagastsBase) : undefined;
  const raw = [
    nom, // "Tīnuži" — nominatīvs, ciema nosaukums
    nom ? `${nom}, Latvia` : undefined,
    ex.pilseta ? `${ex.pilseta}, Latvia` : undefined,
    ex.pagasts ? `${ex.pagasts}, Latvia` : undefined,
    [ex.pagasts, novadLabel, "Latvia"].filter(Boolean).join(", "),
  ];
  return raw.filter(
    (q, i, a): q is string => Boolean(q && q.trim()) && a.indexOf(q) === i,
  );
}

// ─────────────────────────── ORS rezultāta validācija ───────────────────────

export type OrsProps = {
  label?: string;
  name?: string;
  region?: string;
  localadmin?: string;
  locality?: string;
  county?: string;
  macrocounty?: string;
};

// Vai divi normalizēti tokeni "sakrīt" (vienāds vārds vai substring ≥4 simboli).
function tokenMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  const short = a.length <= b.length ? a : b;
  const long = a.length <= b.length ? b : a;
  return short.length >= 4 && long.includes(short);
}

/** ORS administratīvie lauki (normalizēti). */
export function orsPlaces(props: OrsProps): string[] {
  return [
    props.region,
    props.localadmin,
    props.locality,
    props.county,
    props.macrocounty,
    props.name,
  ]
    .map(normLv)
    .filter(Boolean);
}

/**
 * Vai ORS rezultāts atbilst ievadītajam PAGASTAM vai PILSĒTAI (vai to nominatīvam)
 * — NE tikai novadam. Novada sakritība viena pati NEDER (citādi "Xyz pagasts,
 * Ogres novads" tiktu pieņemts pēc Ogres novada centroīda). Salīdzina pret visiem
 * ORS administratīvajiem laukiem (t.sk. region, kur ORS bieži ievieto pilsētu/novadu).
 */
export function regionAccepted(ex: AddressTokens, props: OrsProps): boolean {
  const ors = orsPlaces(props);
  return localityTargets(ex).some((t) => ors.some((o) => tokenMatch(t, o)));
}

// Ķekavas novada precīzie (normalizētie) nosaukumi. ORS reāli ievieto novadu gan
// `region`, gan `localadmin` laukā (piem. region="Kekavas"), tāpēc pārbaudām abus,
// BET tikai ar PRECĪZU sakritību (kopa) — NEKĀDA substring "kekav" uz patvaļīga
// reģiona (novēršam viltus pozitīvus).
const FREE_ZONE_NAMES = new Set(["kekavas novads", "kekavas", "kekava"]);

/**
 * Bezmaksas zona (STRIKTI): ja ievadītais novads == "Ķekavas novads" VAI ORS
 * administratīvais lauks (localadmin/region/locality/county) PRECĪZI sakrīt ar
 * Ķekavu/Ķekavas novadu. Precīza kopas pārbaude, ne substring.
 */
export function freeZoneStrict(ex: AddressTokens, props: OrsProps): boolean {
  if (ex.novads && normLv(ex.novads) === "kekavas novads") return true;
  return [props.localadmin, props.region, props.locality, props.county]
    .map(normLv)
    .some((v) => FREE_ZONE_NAMES.has(v));
}

// Atpakaļsaderība: vecā (mīkstā) bezmaksas zonas pārbaude pēc reģiona nosaukuma.
// Jaunais ceļš izmanto freeZoneStrict; šo patur tikai klienta puses rezervei.
export function isInFreeZone(
  regionName: string | undefined,
  kmOneWay: number,
): boolean {
  if (regionName) {
    const norm = normLv(regionName);
    return norm === "kekavas novads" || norm === "kekava";
  }
  return Number.isFinite(kmOneWay) && kmOneWay > 0 && kmOneWay <= FREE_FALLBACK_RADIUS_KM;
}

// ─────────────────────────── Piegādes atrisināšana ──────────────────────────

export type GeocodeHit = { coords: [number, number]; props: OrsProps } | null;
export type Geocoder = (
  text: string,
  opts?: { layers?: string },
) => Promise<GeocodeHit>;
export type Router = (dest: [number, number]) => Promise<number | null>;

export type DeliveryResolution = {
  ok: boolean;
  km: number | null;
  cost: number | null; // null = nezināma, 0 = bezmaksas zona, >0 = maksas
  inFreeZone: boolean;
  approximate: boolean; // true → aprēķināts pēc pagasta centroīda
  geocoded: string | null; // ORS label VAI "locality" (approx)
  region: string | null;
  resolvedCity: string | null;
  cityMismatch: boolean;
  freeZone: string;
  origin: string;
  error?: string;
};

function priceFor(km: number | null, inFree: boolean): number | null {
  if (inFree) return 0;
  if (km == null) return null; // nezināms attālums ārpus zonas → nezināma cena
  return deliveryPrice(km, inFree);
}

/**
 * Divu mēģinājumu piegādes atrisināšana ar reģiona validāciju:
 *  1) pilnā adrese — pieņem TIKAI, ja reģions/localadmin sakrīt (citādi izmet + log).
 *  2) "{pagasts}, {novads}, Latvia" (layers=localadmin,locality) — pagasta centroīds, approximate.
 *  Abi krīt → cost null ("tiks precizēta").
 * geocode/route ir ievadāmi (DI) → testējams bez tīkla.
 */
export async function resolveDelivery(
  input: { address: string; city?: string },
  deps: { geocode: Geocoder; route: Router; log?: (msg: string, data?: unknown) => void },
): Promise<DeliveryResolution> {
  const base: DeliveryResolution = {
    ok: false,
    km: null,
    cost: null,
    inFreeZone: false,
    approximate: false,
    geocoded: null,
    region: null,
    resolvedCity: null,
    cityMismatch: false,
    freeZone: FREE_ZONE,
    origin: ORIGIN.label,
  };
  const log = deps.log ?? (() => {});
  const ex = extractTokens(input.address);
  if (!ex.cleaned) return { ...base, error: "Trūkst adreses." };

  // ── Mēģinājums 1: pilnā adrese, ar reģiona validāciju ──
  const g1 = await deps.geocode(ex.cleaned);
  if (g1) {
    if (regionAccepted(ex, g1.props)) {
      const inFree = freeZoneStrict(ex, g1.props);
      const km = await deps.route(g1.coords);
      const region = g1.props.county || g1.props.macrocounty || g1.props.region || null;
      return {
        ...base,
        ok: true,
        km,
        cost: priceFor(km, inFree),
        inFreeZone: inFree,
        approximate: false,
        geocoded: g1.props.label ?? null,
        region,
        resolvedCity: g1.props.locality || g1.props.localadmin || region || null,
      };
    }
    // Reģions NEsakrīt — izmet neatkarīgi no ORS confidence.
    log("[distance] 1. mēģinājums NORAIDĪTS (reģions nesakrīt)", {
      address: ex.cleaned,
      extracted: { novads: ex.novads, pagasts: ex.pagasts, places: ex.places },
      orsLabel: g1.props.label,
      orsPlaces: orsPlaces(g1.props),
    });
  }

  // ── Mēģinājums 2: pagasta/ciema centroīds (aptuvens), vairāki vaicājumi ──
  // Mēģina no precīzākā (pagasta nominatīvs → ciems) uz vispārīgāko; pieņem PIRMO,
  // kura rezultāts tiešām atbilst pagastam/pilsētai (ne tikai novadam).
  if (ex.pagasts || ex.novads) {
    for (const q of attempt2Queries(ex)) {
      const g2 = await deps.geocode(q, { layers: "locality,localadmin" });
      if (!g2) continue;
      if (regionAccepted(ex, g2.props)) {
        const inFree = freeZoneStrict(ex, g2.props);
        const km = await deps.route(g2.coords);
        const region =
          g2.props.county || g2.props.macrocounty || g2.props.region || null;
        return {
          ...base,
          ok: true,
          km,
          cost: priceFor(km, inFree),
          inFreeZone: inFree,
          approximate: true,
          geocoded: "locality",
          region,
          resolvedCity: g2.props.locality || g2.props.localadmin || region || null,
        };
      }
      log("[distance] 2. mēģ. kandidāts noraidīts (vieta neatbilst pagastam)", {
        query: q,
        pagasts: ex.pagasts,
        orsName: g2.props.name,
      });
    }
  }

  // ── Abi krīt → nezināma cena ──
  return {
    ...base,
    error: "Neizdevās atrast adresi. Piegādes cenu norādīsim manuāli.",
  };
}
