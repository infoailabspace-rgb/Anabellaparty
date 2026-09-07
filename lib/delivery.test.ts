import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveDelivery,
  extractTokens,
  mapNovads2021,
  type Geocoder,
  type Router,
} from "@/lib/delivery";

// ── Pure normalizācija / kartēšana ──
test("mapNovads2021: 2021. reformas kartējums", () => {
  assert.equal(mapNovads2021("ikskiles novads"), "ogres novads");
  assert.equal(mapNovads2021("baldones novads"), "kekavas novads");
  assert.equal(mapNovads2021("nicas novads"), "dienvidkurzemes novads");
  assert.equal(mapNovads2021("kekavas novads"), "kekavas novads"); // nemainās
});

test("extractTokens: apcērp beigu komatu, izvelk pagastu/novadu (kartētu)", () => {
  const ex = extractTokens(
    "Barži viesu nams, Strūdznieki, Ikšķiles novads, Tīnužu pagasts,",
  );
  assert.equal(ex.cleaned.endsWith(","), false);
  assert.equal(ex.novads, "ogres novads"); // Ikšķiles → Ogres
  assert.equal(ex.pagasts, "Tīnužu pagasts");
});

// ── resolveDelivery ar mock ģeokodu/maršrutu ──
const KM = { barzi: 40, liepaja: 220, kekava: 2 };

test("Barži: 1. mēģ. noraidīts (Nīca≠Ogre), 2. mēģ. pieņemts, ja localadmin atbilst pagastam → aptuvens, maksas", async () => {
  const logs: string[] = [];
  const geocode: Geocoder = async (_text, opts) => {
    if (!opts?.layers) {
      // 1. mēģinājums — ORS atgriež NEPAREIZU vietu Nīcā (confidence high).
      return {
        coords: [21.0, 56.43],
        props: {
          label: 'Viesu nams "Šķilas", Nīca',
          region: "Nicas",
          locality: "Nīca",
          localadmin: "Nīcas novads",
        },
      };
    }
    // 2. mēģinājums — Tīnužu pagasta centroīds.
    return {
      coords: [24.5, 56.83],
      props: {
        label: "Tīnužu pagasts",
        localadmin: "Tīnužu pagasts",
        locality: "Tīnuži",
        county: "Ogres novads",
      },
    };
  };
  const route: Router = async () => KM.barzi;
  const r = await resolveDelivery(
    { address: "Barži viesu nams, Strūdznieki, Ikšķiles novads, Tīnužu pagasts," },
    { geocode, route, log: (m) => logs.push(m) },
  );
  // Uzvedības pārbaudes (nevis konkrēts km diapazons): centroīds pieņemts, jo
  // localadmin ("Tīnužu pagasts") atbilst pagastam; aptuvens, maksas, ne bezmaksas.
  assert.equal(r.ok, true);
  assert.equal(r.approximate, true);
  assert.equal(r.geocoded, "locality");
  assert.equal(r.inFreeZone, false);
  assert.ok(r.km !== null, "km aprēķināts");
  assert.ok(r.cost !== null && r.cost > 0, `cost=${r.cost}`);
  assert.ok(logs.some((m) => m.includes("NORAIDĪTS")), "jālogo 1. mēģ. noraidījums");
});

test("'Xyz pagasts, Ogres novads' → tikai novads sakrīt (ne pagasts) → null", async () => {
  // ORS abos mēģinājumos atgriež Ogres novada centroīdu (name/locality="Ogres").
  // Tikai novada sakritība NEDER — jāatgriež null (nevis 77 km pēc novada centra).
  const geocode: Geocoder = async () => ({
    coords: [24.6, 56.82],
    props: { name: "Ogres", locality: "Ogres", region: "Ogres" },
  });
  const route: Router = async () => 77;
  const r = await resolveDelivery(
    { address: "Xyz pagasts, Ogres novads" },
    { geocode, route },
  );
  assert.equal(r.ok, false);
  assert.equal(r.cost, null);
});

test("Liepāja, Kūrmājas prospekts 1: reāls match 1. mēģinājumā (nav approximate)", async () => {
  const geocode: Geocoder = async () => ({
    coords: [21.0, 56.51],
    props: {
      label: "Kūrmājas prospekts 1, Liepāja",
      locality: "Liepāja",
      localadmin: "Liepāja",
      region: "Liepāja",
    },
  });
  const route: Router = async () => KM.liepaja;
  const r = await resolveDelivery(
    { address: "Liepāja, Kūrmājas prospekts 1" },
    { geocode, route },
  );
  assert.equal(r.ok, true);
  assert.equal(r.approximate, false);
  assert.notEqual(r.geocoded, "locality");
  assert.equal(r.inFreeZone, false);
  assert.ok(r.cost !== null && r.cost > 0, `cost=${r.cost}`);
});

test("Ķekava, Gaismas iela 19: bezmaksas zona (cost 0)", async () => {
  // Reāls ORS Ķekavai novadu atgriež `region` laukā ("Kekavas"), nevis localadmin.
  const geocode: Geocoder = async () => ({
    coords: [24.23, 56.81],
    props: {
      label: "19 Gaismas iela, KK, Latvia",
      locality: "KK",
      region: "Kekavas",
    },
  });
  const route: Router = async () => KM.kekava;
  const r = await resolveDelivery(
    { address: "Ķekava, Gaismas iela 19" },
    { geocode, route },
  );
  assert.equal(r.ok, true);
  assert.equal(r.inFreeZone, true);
  assert.equal(r.cost, 0);
});

test("Atkritumi (nav match, nav pagasta/novada) → cost null", async () => {
  const geocode: Geocoder = async () => null; // ORS neatrod neko
  const route: Router = async () => null;
  const r = await resolveDelivery(
    { address: "qwerty asdf zzz" },
    { geocode, route },
  );
  assert.equal(r.ok, false);
  assert.equal(r.cost, null);
});
