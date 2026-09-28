#!/usr/bin/env npx tsx
/**
 * Propose a boundary crosswalk for one country.
 * Every written row is draft_for_human_review. This script never approves
 * a row and never writes a shape.
 *
 * Albania, when derived_jurisdiction is absent, uses the current mayor
 * office register (61 municipalities). Other countries require that table.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { crosswalkLinksAgree, parseCrosswalk, serializeCrosswalk } from "../../lib/atlas/boundaries/crosswalk";
import { loadAlbaniaMunicipalityPlaces, matchPlaces, readLauAttributeCsv } from "../../lib/atlas/boundaries/match";
import { loadPlacesFromDerived } from "../../lib/atlas/boundaries/places";
import type { JurisdictionPlace } from "../../lib/atlas/boundaries/types";
import { resolveAtlasSqlitePath } from "../../lib/atlas/paths";
import { tableExists } from "../../lib/atlas/sqlite";

const LAU_MANIFEST_ID = "gisco-lau-2023-4326-csv";
const LAU_VERSION = "2023";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index < 0) return undefined;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} needs a value`);
  return value;
}

function flag(name: string): boolean {
  return process.argv.includes(name);
}

function countryCode(countryId: string, supplied: string | undefined): string {
  if (supplied) return supplied;
  if (countryId === "albania") return "AL";
  throw new Error(`${countryId} needs --country-code (GISCO CNTR_CODE)`);
}

function placesForCountry(countryId: string): JurisdictionPlace[] {
  const sqlitePath = resolveAtlasSqlitePath();
  if (existsSync(sqlitePath)) {
    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      if (tableExists(db, "derived_jurisdiction")) {
        const places = loadPlacesFromDerived(db, countryId, "municipality");
        if (places.length === 0) {
          throw new Error(
            `derived_jurisdiction has no municipality rows for ${countryId}; refusing to fall back to a name list`,
          );
        }
        console.log(`places: ${places.length} municipality rows from derived_jurisdiction (${sqlitePath})`);
        return places;
      }
    } finally {
      db.close();
    }
  }
  if (countryId !== "albania") {
    throw new Error(
      `${countryId} has no derived_jurisdiction table. OV-01 must land before a crosswalk can be proposed for this country.`,
    );
  }
  const places = loadAlbaniaMunicipalityPlaces(process.cwd());
  console.log(
    `places: ${places.length} current Albania municipalities from the office register (derived_jurisdiction is absent; jurisdiction_key stays null)`,
  );
  return places;
}

function main(): void {
  const countryId = argument("--country");
  const lauCsv = argument("--lau-csv");
  if (!countryId) throw new Error("--country is required");
  if (!lauCsv) throw new Error("--lau-csv is required");
  const outPath = argument("--out") ?? path.join("schemas", "atlas", "boundaries", `${countryId}.json`);
  const code = countryCode(countryId, argument("--country-code"));
  const places = placesForCountry(countryId);
  const features = readLauAttributeCsv(readFileSync(lauCsv, "utf8"), LAU_VERSION).filter(
    (feature) => feature.country_code === code,
  );
  if (features.length === 0) throw new Error(`LAU CSV has no rows for country code ${code}`);
  const file = matchPlaces({
    countryId,
    places,
    features,
    sourceManifestId: LAU_MANIFEST_ID,
    boundarySource: "gisco_lau",
    boundaryVersion: LAU_VERSION,
  });
  const rate = places.length === 0 ? 0 : file.rows.length / places.length;
  console.log(`match rate ${file.rows.length}/${places.length} (${rate.toFixed(4)})`);
  if (file.unmatched.length === 0) console.log("unmatched: none");
  for (const place of file.unmatched) {
    console.log(`unmatched ${place.name} (${place.binding_geography_id ?? "no geography id"}): ${place.reason}`);
  }
  const serialized = serializeCrosswalk(file);
  if (flag("--check")) {
    if (!existsSync(outPath)) throw new Error(`no crosswalk to check at ${outPath}`);
    const existingText = readFileSync(outPath, "utf8");
    const existing = parseCrosswalk(JSON.parse(existingText) as unknown);
    const approved =
      existing.review_status === "approved" && existing.rows.every((row) => row.review_status === "approved");
    if (approved) {
      if (!crosswalkLinksAgree(existing, file)) {
        throw new Error(`approved crosswalk at ${outPath} does not match this proposal`);
      }
      if (existing.rows.some((row) => !row.jurisdiction_key || !row.parent_key)) {
        throw new Error(`approved crosswalk at ${outPath} is missing jurisdiction_key or parent_key`);
      }
      console.log(`check ok ${outPath}`);
      return;
    }
    if (existingText !== serialized) {
      throw new Error(`crosswalk at ${outPath} does not match this proposal`);
    }
    console.log(`check ok ${outPath}`);
    return;
  }
  if (existsSync(outPath)) {
    const existing = parseCrosswalk(JSON.parse(readFileSync(outPath, "utf8")) as unknown);
    if (existing.review_status === "approved" || existing.rows.some((row) => row.review_status === "approved")) {
      throw new Error(`refusing to overwrite approved rows in ${outPath}`);
    }
  }
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, serialized);
  console.log(`wrote draft crosswalk ${outPath} (review_status ${file.review_status})`);
}

try {
  main();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
