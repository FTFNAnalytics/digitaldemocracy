import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, describe, expect, it } from "vitest";
import { applyMasterMigrations } from "../../lib/atlas/apply-migrations";
import { ATTRIBUTIONS } from "../../lib/atlas/boundaries/attribution";
import { buildBoundaryFiles, readCrosswalkFile } from "../../lib/atlas/boundaries/build";
import { approvedCrosswalkSha256, serializeCrosswalk } from "../../lib/atlas/boundaries/crosswalk";
import {
  buildEuropeLauPmtiles,
  countMvtPolygons,
  finalizeChildrenTopojson,
  readPmtilesTile,
  REGION_TOPOJSON_MAX_BYTES,
  topojsonFeatureCount,
  type FeatureCollection,
  type GeoJsonFeature,
} from "../../lib/atlas/boundaries/geometry";
import { loadApprovedCrosswalk } from "../../lib/atlas/boundaries/load";
import { assertNotGadm, hashBuffer, parseManifest } from "../../lib/atlas/boundaries/manifest";
import { loadAlbaniaMunicipalityPlaces, matchPlaces, readLauAttributeCsv } from "../../lib/atlas/boundaries/match";
import { loadPlacesFromDerived } from "../../lib/atlas/boundaries/places";
import type { BoundaryName, CrosswalkFile, CrosswalkRow, JurisdictionPlace } from "../../lib/atlas/boundaries/types";
import { tableExists } from "../../lib/atlas/sqlite";

const repoRoot = path.join(import.meta.dirname, "../..");
const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function tempDir(): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-boundaries-"));
  tempDirs.push(dir);
  return dir;
}

function albaniaProposal(): CrosswalkFile {
  const csv = readFileSync(path.join(repoRoot, "tests/fixtures/boundaries/lau-albania-2023.csv"), "utf8");
  return matchPlaces({
    countryId: "albania",
    places: loadAlbaniaMunicipalityPlaces(repoRoot),
    features: readLauAttributeCsv(csv).filter((feature) => feature.country_code === "AL"),
    sourceManifestId: "gisco-lau-2023-4326-csv",
    boundarySource: "gisco_lau",
    boundaryVersion: "2023",
  });
}

function lau(code: string, name: string, parent: string | null = null): BoundaryName {
  return {
    boundary_source: "gisco_lau",
    boundary_code: code,
    boundary_version: "2023",
    name,
    parent_name: parent,
    country_code: "AL",
  };
}

function place(name: string, extras: Partial<JurisdictionPlace> = {}): JurisdictionPlace {
  return {
    jurisdiction_key: null,
    binding_geography_id: `geo-${name}`,
    binding_territorial_unit_id: null,
    name,
    parent_name: null,
    parent_key: null,
    level: "municipality",
    ...extras,
  };
}

function approvedRow(partial: Partial<CrosswalkRow> & Pick<CrosswalkRow, "boundary_code" | "jurisdiction_key" | "name">): CrosswalkRow {
  return {
    binding_geography_id: null,
    binding_territorial_unit_id: null,
    parent_name: "Albania",
    parent_key: "parent-al",
    level: "municipality",
    boundary_source: "gisco_lau",
    boundary_version: "2023",
    match_method: "manual",
    confidence: 1,
    review_status: "approved",
    reviewer_note: "fixture",
    ...partial,
  };
}

describe("Albania boundary crosswalk", () => {
  it("round-trips the 61-municipality fixture as a draft", () => {
    const file = albaniaProposal();
    expect(file.rows).toHaveLength(61);
    expect(file.unmatched).toEqual([]);
    expect(file.review_status).toBe("draft_for_human_review");
    expect(file.rows.every((row) => row.review_status === "draft_for_human_review")).toBe(true);
    expect(file.rows.every((row) => row.jurisdiction_key === null)).toBe(true);
    expect(file.rows.filter((row) => row.match_method === "name_parent_exact")).toHaveLength(59);
    const fuzzy = file.rows.filter((row) => row.match_method === "name_parent_fuzzy");
    expect(fuzzy.map((row) => [row.boundary_code, row.name, row.confidence])).toEqual([
      ["AL151", "Fushë-Arrëz", 0.9],
      ["AL155", "Vau-Dejës", 0.8],
    ]);
    expect(approvedCrosswalkSha256(file)).toBeNull();
    const committed = readFileSync(path.join(repoRoot, "schemas/atlas/boundaries/albania.json"), "utf8");
    expect(serializeCrosswalk(file)).toBe(committed);
  });

  it("check mode matches the committed file", () => {
    const result = spawnSync(
      process.execPath,
      [
        "--experimental-sqlite",
        "--no-warnings",
        "--import",
        "tsx",
        "scripts/boundaries/match.ts",
        "--country",
        "albania",
        "--lau-csv",
        "tests/fixtures/boundaries/lau-albania-2023.csv",
        "--check",
      ],
      { cwd: repoRoot, encoding: "utf8", env: { ...process.env, ATLAS_SQLITE_PATH: path.join(tempDir(), "missing.sqlite") } },
    );
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("match rate 61/61");
    expect(result.stdout).toContain("check ok");
  });
});

describe("name and parent matching", () => {
  const base = {
    countryId: "fixture",
    sourceManifestId: "gisco-lau-2023-4326-csv",
    boundarySource: "gisco_lau" as const,
    boundaryVersion: "2023",
  };

  it("matches a shared parent and folded name", () => {
    const file = matchPlaces({
      ...base,
      places: [place("Tiranë", { parent_name: "Tiranë" })],
      features: [lau("AL1", "Tirane", "Tirane")],
    });
    expect(file.rows).toHaveLength(1);
    expect(file.rows[0]?.match_method).toBe("name_parent_exact");
    expect(file.rows[0]?.review_status).toBe("draft_for_human_review");
  });

  it("leaves a one-sided parent unmatched", () => {
    const file = matchPlaces({
      ...base,
      places: [place("Berat", { parent_name: "Berat" })],
      features: [lau("AL2", "Berat", null)],
    });
    expect(file.rows).toEqual([]);
    expect(file.unmatched[0]?.reason).toBe("parent name is supplied on only one side");
  });

  it("leaves differing parents unmatched", () => {
    const file = matchPlaces({
      ...base,
      places: [place("Berat", { parent_name: "One" })],
      features: [lau("AL2", "Berat", "Two")],
    });
    expect(file.rows).toEqual([]);
    expect(file.unmatched[0]?.reason).toContain("parent name differs");
  });

  it("does not assign a code when two places share a name", () => {
    const file = matchPlaces({
      ...base,
      places: [
        place("Belsh", { binding_geography_id: "geo-mayor" }),
        place("Belsh", { binding_geography_id: "geo-council" }),
      ],
      features: [lau("AL3", "Belsh")],
    });
    expect(file.rows).toEqual([]);
    expect(file.unmatched).toHaveLength(2);
    expect(file.unmatched.every((row) => row.reason.includes("ambiguous jurisdiction"))).toBe(true);
  });

  it("never emits an approved row", () => {
    const file = matchPlaces({
      ...base,
      places: [place("Dimal")],
      features: [lau("AL4", "Dimal"), lau("AL5", "Other")],
    });
    expect(file.review_status).toBe("draft_for_human_review");
    expect(file.rows.some((row) => row.review_status === "approved")).toBe(false);
  });
});

describe("boundary builder", () => {
  const geometry = JSON.parse(
    readFileSync(path.join(repoRoot, "tests/fixtures/boundaries/two-children.geojson"), "utf8"),
  ) as FeatureCollection;

  function approvedFile(): CrosswalkFile {
    const rows = [
      approvedRow({ boundary_code: "FIX-A", jurisdiction_key: "child-a", name: "Alpha" }),
      approvedRow({ boundary_code: "FIX-B", jurisdiction_key: "child-b", name: "Beta" }),
    ];
    return {
      schema: "atlas-boundary-crosswalk/1",
      country_id: "fixture",
      review_status: "approved",
      jurisdiction_key_dependency: "fixture",
      boundary_source: "gisco_lau",
      boundary_version: "2023",
      source_manifest_id: "fixture",
      matched: rows.length,
      unmatched: [],
      rows,
    };
  }

  it("refuses the Albania draft and writes nothing", async () => {
    const outDir = path.join(tempDir(), "geo");
    const draft = readCrosswalkFile(readFileSync(path.join(repoRoot, "schemas/atlas/boundaries/albania.json"), "utf8"));
    await expect(buildBoundaryFiles({ crosswalk: draft, geometry, outDir })).rejects.toThrow(/draft_for_human_review/);
    expect(() => readFileSync(path.join(outDir, "parent-al.json"))).toThrow();
  });

  it("refuses a mixed or rejected file", async () => {
    const outDir = path.join(tempDir(), "geo");
    const mixed = approvedFile();
    mixed.rows[1] = { ...mixed.rows[1]!, review_status: "draft_for_human_review" };
    await expect(buildBoundaryFiles({ crosswalk: mixed, geometry, outDir })).rejects.toThrow(/draft_for_human_review/);
    const rejected = approvedFile();
    rejected.review_status = "rejected";
    rejected.rows = rejected.rows.map((row) => ({ ...row, review_status: "rejected" }));
    await expect(buildBoundaryFiles({ crosswalk: rejected, geometry, outDir })).rejects.toThrow(/rejected/);
  });

  it("writes TopoJSON and PMTiles whose feature counts match the approved rows", async () => {
    const outDir = path.join(tempDir(), "geo");
    const file = approvedFile();
    const first = await buildBoundaryFiles({ crosswalk: file, geometry, outDir });
    const second = await buildBoundaryFiles({ crosswalk: file, geometry, outDir });
    const topoPath = path.join(outDir, "parent-al.json");
    const topo = readFileSync(topoPath, "utf8");
    expect(topojsonFeatureCount(JSON.parse(topo) as unknown)).toBe(2);
    expect(topo).toContain("FIX-A");
    expect(topo).toContain("FIX-B");
    expect(first.files.map((item) => readFileSync(item))).toEqual(second.files.map((item) => readFileSync(item)));
    const archive = readFileSync(path.join(outDir, "europe-lau.pmtiles"));
    expect(archive.subarray(0, 7).toString("utf8")).toBe("PMTiles");
    expect(archive.readUInt8(7)).toBe(3);
    expect(archive.readUInt8(96)).toBe(1);
    expect(archive.readUInt8(97)).toBe(1);
    expect(archive.readUInt8(98)).toBe(2);
    expect(archive.readUInt8(99)).toBe(1);
    expect(countMvtPolygons(readPmtilesTile(archive))).toBe(2);
    expect(first.derivedJurisdiction).toBe("absent");
  });

  it("checks TopoJSON feature count and the region size limit", () => {
    const topology = {
      type: "Topology",
      objects: { input: { type: "GeometryCollection", geometries: [{ type: "Polygon" }] } },
    };
    expect(finalizeChildrenTopojson("municipality", JSON.stringify(topology), 1)).toContain("Topology");
    expect(() => finalizeChildrenTopojson("municipality", JSON.stringify(topology), 2)).toThrow(/feature count/);
    const huge = { ...topology, pad: "x".repeat(REGION_TOPOJSON_MAX_BYTES) };
    expect(() => finalizeChildrenTopojson("region", JSON.stringify(huge), 1)).toThrow(/region TopoJSON/);
    expect(finalizeChildrenTopojson("region", JSON.stringify(topology), 1).length).toBeLessThan(REGION_TOPOJSON_MAX_BYTES);
  });

  it("updates bbox only for derived rows that already exist", async () => {
    const dir = tempDir();
    const db = new DatabaseSync(path.join(dir, "atlas.sqlite"));
    db.exec(
      "CREATE TABLE derived_jurisdiction (jurisdiction_key TEXT PRIMARY KEY, name TEXT NOT NULL)",
    );
    db.prepare("INSERT INTO derived_jurisdiction (jurisdiction_key, name) VALUES (?, ?)").run("child-a", "Alpha");
    const report = await buildBoundaryFiles({
      crosswalk: approvedFile(),
      geometry,
      outDir: path.join(dir, "geo"),
      db,
    });
    expect(report.bboxWritten).toEqual(["child-a"]);
    expect(report.bboxPending).toEqual(["child-b"]);
    const rows = db.prepare("SELECT jurisdiction_key, bbox_json, centroid_json FROM derived_jurisdiction").all() as {
      jurisdiction_key: string;
      bbox_json: string;
      centroid_json: string;
    }[];
    expect(rows).toHaveLength(1);
    expect(JSON.parse(rows[0]!.bbox_json)).toHaveLength(4);
    expect(JSON.parse(rows[0]!.centroid_json)).toHaveLength(2);
    db.close();
  });
});

describe("boundary_crosswalk migration", () => {
  it("applies version 5 without changing geography", () => {
    const dir = tempDir();
    const sqlitePath = path.join(dir, "atlas.sqlite");
    applyMasterMigrations(repoRoot, sqlitePath);
    const sql = readFileSync(path.join(repoRoot, "schemas/atlas/migrations/0005_atlas_boundary.sql"), "utf8");
    expect(sql).not.toMatch(/UPDATE\s+geography/i);
    expect(sql).not.toMatch(/ALTER\s+TABLE\s+geography/i);
    expect(sql).not.toMatch(/DELETE\s+FROM\s+geography/i);
    expect(sql).not.toMatch(/REFERENCES\s+derived_jurisdiction/i);
    expect(sql).not.toMatch(/CREATE\s+TABLE\s+derived_jurisdiction/i);

    const db = new DatabaseSync(sqlitePath);
    const geographySql = String(
      (db.prepare("SELECT sql FROM sqlite_master WHERE name = 'geography'").get() as { sql: string }).sql,
    );
    const geographyHash = createHash("sha256").update(geographySql).digest("hex");
    expect(db.prepare("SELECT version, description FROM schema_migration WHERE version = 1").get()).toMatchObject({
      version: 1,
      description: "Atlas Phase 1 master draft",
    });
    expect(db.prepare("SELECT version, description FROM schema_migration WHERE version = 5").get()).toMatchObject({
      version: 5,
      description: "Atlas boundary crosswalk",
    });
    expect(tableExists(db, "boundary_crosswalk")).toBe(true);
    expect(tableExists(db, "derived_jurisdiction")).toBe(false);

    const draft = albaniaProposal();
    expect(() => loadApprovedCrosswalk(db, draft)).toThrow(/not fully approved/);
    expect(db.prepare("SELECT COUNT(*) AS n FROM boundary_crosswalk").get()).toMatchObject({ n: 0 });

    const rows = [
      approvedRow({ boundary_code: "FIX-A", jurisdiction_key: "child-a", name: "Alpha" }),
      approvedRow({ boundary_code: "FIX-B", jurisdiction_key: "child-b", name: "Beta" }),
    ];
    const approved: CrosswalkFile = {
      ...draft,
      review_status: "approved",
      rows,
      unmatched: [],
    };
    expect(loadApprovedCrosswalk(db, approved)).toBe(2);
    expect(loadApprovedCrosswalk(db, approved)).toBe(2);
    expect(db.prepare("SELECT COUNT(*) AS n FROM boundary_crosswalk").get()).toMatchObject({ n: 2 });
    const rejected: CrosswalkFile = {
      ...approved,
      review_status: "rejected",
      rows: rows.map((row) => ({ ...row, review_status: "rejected" })),
    };
    expect(() => loadApprovedCrosswalk(db, rejected)).toThrow(/not fully approved/);
    expect(db.prepare("SELECT COUNT(*) AS n FROM boundary_crosswalk").get()).toMatchObject({ n: 2 });
    expect(createHash("sha256").update(geographySql).digest("hex")).toBe(geographyHash);
    expect(db.prepare("SELECT COUNT(*) AS n FROM geography").get()).toMatchObject({ n: 0 });
    expect(String((db.prepare("SELECT sql FROM sqlite_master WHERE name = 'geography'").get() as { sql: string }).sql)).toBe(
      geographySql,
    );
    db.close();
  });
});

describe("boundary manifest", () => {
  it("lists the committed sources and rejects GADM", () => {
    const manifest = parseManifest(JSON.parse(readFileSync(path.join(repoRoot, "data/boundaries/manifest.json"), "utf8")));
    expect(manifest.sources.map((source) => source.id)).toEqual([
      "gisco-lau-2023-4326-csv",
      "gisco-lau-2023-4326-geojson",
      "gisco-nuts-2024-10m-4326-geojson",
      "geoboundaries-cgaz-adm0-geojson",
      "geoboundaries-cgaz-adm1-geojson",
      "geoboundaries-cgaz-adm2-geojson",
      "natural-earth-50m-admin-0-countries-zip",
    ]);
    expect(hashBuffer(Buffer.from("boundary-bytes"))).toBe(
      createHash("sha256").update(Buffer.from("boundary-bytes")).digest("hex"),
    );
    expect(hashBuffer(Buffer.from("boundary-bytes"))).not.toBe(hashBuffer(Buffer.from("other-bytes")));
    expect(() =>
      assertNotGadm({
        id: "gadm-admin",
        url: "https://example.com/admin.geojson",
        filename: "admin.geojson",
        licence: "example",
        attribution: "example",
      }),
    ).toThrow(/GADM/);
    const docs = readFileSync(path.join(repoRoot, "docs/boundaries.md"), "utf8");
    for (const attribution of Object.values(ATTRIBUTIONS)) expect(docs).toContain(attribution);
    expect(docs.toLowerCase()).toContain("gadm is not used");
  });

  it("reads jurisdiction keys from derived_jurisdiction when the columns match", () => {
    const db = new DatabaseSync(":memory:");
    expect(() => loadPlacesFromDerived(db, "albania", "municipality")).toThrow(/not on this database/);
    db.exec(`CREATE TABLE derived_jurisdiction (
      jurisdiction_key TEXT PRIMARY KEY,
      country_id TEXT NOT NULL,
      geography_id TEXT,
      parent_key TEXT,
      name TEXT NOT NULL,
      level_label TEXT NOT NULL
    )`);
    db.prepare(
      "INSERT INTO derived_jurisdiction (jurisdiction_key, country_id, geography_id, parent_key, name, level_label) VALUES (?, ?, ?, ?, ?, ?)",
    ).run("al-belsh", "albania", "geo-mayor", null, "Belsh", "municipality");
    const places = loadPlacesFromDerived(db, "albania", "municipality");
    expect(places).toHaveLength(1);
    expect(places[0]?.jurisdiction_key).toBe("al-belsh");
    db.exec("ALTER TABLE derived_jurisdiction DROP COLUMN name");
    expect(() => loadPlacesFromDerived(db, "albania", "municipality")).toThrow(/does not match/);
    db.close();
  });
});

describe("PMTiles refuses an empty LAU set", () => {
  it("throws before writing an archive", () => {
    expect(() => buildEuropeLauPmtiles([] as GeoJsonFeature[])).toThrow(/empty/);
  });
});
