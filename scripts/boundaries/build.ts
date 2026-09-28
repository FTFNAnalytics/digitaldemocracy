#!/usr/bin/env npx tsx
/**
 * Emit shapes for an approved crosswalk only.
 * Draft and rejected rows throw before any file is written.
 * Geography rows are not updated. Bbox and centroid are written onto
 * existing derived_jurisdiction rows when that table is already present.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { buildBoundaryFiles, readCrosswalkFile } from "../../lib/atlas/boundaries/build";
import type { FeatureCollection } from "../../lib/atlas/boundaries/geometry";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index < 0) return undefined;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} needs a value`);
  return value;
}

async function main(): Promise<void> {
  const crosswalkPath = argument("--crosswalk");
  const geometryPath = argument("--geometry");
  if (!crosswalkPath) throw new Error("--crosswalk is required");
  if (!geometryPath) throw new Error("--geometry is required");
  if (geometryPath.toLowerCase().endsWith(".zip")) {
    throw new Error(
      "build reads GeoJSON. A Natural Earth zip is checksummed by fetch and is not parsed into shapes.",
    );
  }
  const crosswalk = readCrosswalkFile(readFileSync(crosswalkPath, "utf8"));
  const geometry = JSON.parse(readFileSync(geometryPath, "utf8")) as FeatureCollection;
  if (geometry.type !== "FeatureCollection" || !Array.isArray(geometry.features)) {
    throw new Error("geometry must be a GeoJSON FeatureCollection");
  }
  const outDir = argument("--out") ?? path.join("public", "atlas", "geo");
  const sqlitePath = argument("--sqlite");
  let db: DatabaseSync | null = null;
  if (sqlitePath) {
    if (!existsSync(sqlitePath)) throw new Error(`sqlite file does not exist: ${sqlitePath}`);
    db = new DatabaseSync(sqlitePath);
  }
  try {
    const report = await buildBoundaryFiles({ crosswalk, geometry, outDir, db });
    for (const file of report.files) console.log(`wrote ${file}`);
    for (const [file, count] of Object.entries(report.featureCounts)) {
      console.log(`features ${file}: ${count}`);
    }
    console.log(`derived_jurisdiction: ${report.derivedJurisdiction}`);
    if (report.bboxWritten.length > 0) console.log(`bbox written: ${report.bboxWritten.join(", ")}`);
    if (report.bboxPending.length > 0) console.log(`bbox pending: ${report.bboxPending.join(", ")}`);
  } finally {
    db?.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
