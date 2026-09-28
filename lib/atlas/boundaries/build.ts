import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { tableExists } from "../sqlite";
import { parseCrosswalk } from "./crosswalk";
import {
  buildEuropeLauPmtiles,
  childrenTopojson,
  featureBBox,
  featureCentroid,
  indexFeatures,
  type FeatureCollection,
  type GeoJsonFeature,
} from "./geometry";
import type { CrosswalkFile, CrosswalkRow } from "./types";

export type BuildReport = {
  files: string[];
  featureCounts: Record<string, number>;
  bboxWritten: string[];
  bboxPending: string[];
  derivedJurisdiction: "absent" | "updated";
};

export function assertApprovedForBuild(file: CrosswalkFile): void {
  if (file.review_status !== "approved") {
    throw new Error(`refusing to emit shapes: crosswalk review_status is ${file.review_status}`);
  }
  for (const row of file.rows) {
    if (row.review_status !== "approved") {
      throw new Error(`refusing to emit a shape for ${row.review_status} row ${row.boundary_code}`);
    }
    if (!row.jurisdiction_key) {
      throw new Error(`refusing to emit a shape for ${row.boundary_code}: jurisdiction_key is null`);
    }
    if (!row.parent_key) {
      throw new Error(`refusing to emit a shape for ${row.boundary_code}: parent jurisdiction_key is null`);
    }
  }
}

export async function buildBoundaryFiles(options: {
  crosswalk: CrosswalkFile;
  geometry: FeatureCollection;
  outDir: string;
  db?: DatabaseSync | null;
}): Promise<BuildReport> {
  assertApprovedForBuild(options.crosswalk);
  const features = indexFeatures(options.geometry);
  const groups = new Map<string, CrosswalkRow[]>();
  for (const row of options.crosswalk.rows) {
    const key = row.parent_key!;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }
  const outputs: { relative: string; body: string | Buffer; count: number }[] = [];
  const featureCounts: Record<string, number> = {};
  for (const [parentKey, rows] of groups) {
    if (!/^[A-Za-z0-9._-]+$/.test(parentKey)) {
      throw new Error(`parent jurisdiction_key cannot be a file name: ${parentKey}`);
    }
    const body = await childrenTopojson(rows, features);
    const relative = `${parentKey}.json`;
    outputs.push({ relative, body, count: rows.length });
    featureCounts[relative] = rows.length;
  }
  const lauRows = options.crosswalk.rows.filter((row) => row.boundary_source === "gisco_lau");
  if (lauRows.length > 0) {
    const lauFeatures = lauRows.map((row) => {
      const feature = features.get(row.boundary_code);
      if (!feature) throw new Error(`no geometry for approved boundary code ${row.boundary_code}`);
      return {
        type: "Feature" as const,
        properties: {
          boundary_code: row.boundary_code,
          jurisdiction_key: row.jurisdiction_key,
          name: row.name,
        },
        geometry: feature.geometry,
      };
    });
    outputs.push({
      relative: "europe-lau.pmtiles",
      body: buildEuropeLauPmtiles(lauFeatures),
      count: lauFeatures.length,
    });
    featureCounts["europe-lau.pmtiles"] = lauFeatures.length;
  }

  mkdirSync(options.outDir, { recursive: true });
  const written: string[] = [];
  for (const output of outputs) {
    const filePath = path.join(options.outDir, output.relative);
    writeFileSync(filePath, output.body);
    written.push(filePath);
  }

  const bbox = writeBboxAndCentroid(options.db ?? null, options.crosswalk.rows, features);
  return {
    files: written,
    featureCounts,
    bboxWritten: bbox.written,
    bboxPending: bbox.pending,
    derivedJurisdiction: bbox.table,
  };
}

export function writeBboxAndCentroid(
  db: DatabaseSync | null,
  rows: CrosswalkRow[],
  features: Map<string, GeoJsonFeature>,
): { written: string[]; pending: string[]; table: "absent" | "updated" } {
  if (!db || !tableExists(db, "derived_jurisdiction")) {
    return { written: [], pending: rows.map((row) => row.jurisdiction_key ?? row.boundary_code), table: "absent" };
  }
  const columns = db.prepare("PRAGMA table_info(derived_jurisdiction)").all() as { name: string }[];
  const names = new Set(columns.map((column) => column.name));
  if (!names.has("bbox_json")) db.exec("ALTER TABLE derived_jurisdiction ADD COLUMN bbox_json TEXT");
  if (!names.has("centroid_json")) db.exec("ALTER TABLE derived_jurisdiction ADD COLUMN centroid_json TEXT");
  const update = db.prepare(
    "UPDATE derived_jurisdiction SET bbox_json = ?, centroid_json = ? WHERE jurisdiction_key = ?",
  );
  const written: string[] = [];
  const pending: string[] = [];
  for (const row of rows) {
    const feature = features.get(row.boundary_code);
    if (!feature || !row.jurisdiction_key) {
      pending.push(row.jurisdiction_key ?? row.boundary_code);
      continue;
    }
    const box = featureBBox(feature);
    const centroid = featureCentroid(feature);
    const result = update.run(
      JSON.stringify([box.minLon, box.minLat, box.maxLon, box.maxLat]),
      JSON.stringify(centroid),
      row.jurisdiction_key,
    );
    if (Number(result.changes) === 0) pending.push(row.jurisdiction_key);
    else written.push(row.jurisdiction_key);
  }
  return { written, pending, table: "updated" };
}

export function readCrosswalkFile(text: string): CrosswalkFile {
  return parseCrosswalk(JSON.parse(text) as unknown);
}
