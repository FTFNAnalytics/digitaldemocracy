import { existsSync } from "node:fs";
import type { DatabaseSync } from "node:sqlite";
import type { WorldMarker } from "@/lib/atlas/map/world";
import { buildWorldMarkers, countResultRowsByCountry, type WorldMarkerInput } from "@/lib/atlas/map/world";
import { jurisdictionPublicPath, listCountryCards } from "@/lib/atlas/jurisdiction";
import { resolveAtlasSqlitePath } from "@/lib/atlas/paths";
import { loadAtlasCatalog } from "@/lib/atlas/read";
import { atlasRoutes } from "@/lib/atlas/routes";
import { openAtlasDatabase, tableExists } from "@/lib/atlas/sqlite";
import type { AtlasCoverageSnapshot } from "@/components/atlas/types";

export type CenterCoverageTotals = {
  countries: number;
  offices: number;
  officesWithAnyEvent: number;
  officesWithResults: number;
  events: number;
  eventsWithResults: number;
};

export type CenterSnapshot = {
  lineageId: string;
  releaseId: string;
  snapshotLabel: string | null;
};

export type CenterFrontDoorStatus = "ready" | "missing" | "unavailable";

export type CenterFrontDoor = {
  status: CenterFrontDoorStatus;
  message: string;
  coverage: CenterCoverageTotals | null;
  snapshots: CenterSnapshot[];
  markers: WorldMarker[];
};

function empty(status: CenterFrontDoorStatus, message: string): CenterFrontDoor {
  return { status, message, coverage: null, snapshots: [], markers: [] };
}

function num(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function text(value: unknown): string {
  return String(value ?? "");
}

function textOrNull(value: unknown): string | null {
  if (value == null) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
}

/**
 * Country rows already roll up places beneath them. Summing every jurisdiction
 * would count the same office again at each ancestor.
 */
function readCoverage(db: DatabaseSync): CenterCoverageTotals | null {
  if (!tableExists(db, "derived_coverage") || !tableExists(db, "derived_jurisdiction")) return null;
  const row = db
    .prepare(
      `SELECT COUNT(*) AS countries,
              SUM(c.offices) AS offices,
              SUM(c.offices_with_any_event) AS offices_with_any_event,
              SUM(c.offices_with_results) AS offices_with_results,
              SUM(c.events_total) AS events_total,
              SUM(c.events_with_results) AS events_with_results
       FROM derived_jurisdiction j
       JOIN derived_coverage c ON c.jurisdiction_key = j.jurisdiction_key
       WHERE j.depth = 0`,
    )
    .get() as Record<string, unknown> | undefined;
  if (!row || num(row.countries) === 0) return null;
  return {
    countries: num(row.countries),
    offices: num(row.offices),
    officesWithAnyEvent: num(row.offices_with_any_event),
    officesWithResults: num(row.offices_with_results),
    events: num(row.events_total),
    eventsWithResults: num(row.events_with_results),
  };
}

/** Published snapshot labels from dataset_release. Unpublished rows stay off the strip. */
function readSnapshots(db: DatabaseSync): CenterSnapshot[] {
  if (!tableExists(db, "dataset_release")) return [];
  const sql = tableExists(db, "publication_release")
    ? `SELECT r.lineage_id AS lineage_id, r.release_id AS release_id, r.research_snapshot_label AS research_snapshot_label
       FROM dataset_release r
       JOIN publication_release p ON p.lineage_id = r.lineage_id AND p.release_id = r.release_id
       ORDER BY r.lineage_id, r.release_id`
    : `SELECT lineage_id, release_id, research_snapshot_label
       FROM dataset_release
       ORDER BY lineage_id, release_id`;
  return (db.prepare(sql).all() as Array<Record<string, unknown>>).map((row) => ({
    lineageId: text(row.lineage_id),
    releaseId: text(row.release_id),
    snapshotLabel: textOrNull(row.research_snapshot_label),
  }));
}

function coverageSnapshot(
  card: ReturnType<typeof listCountryCards>[number],
): AtlasCoverageSnapshot | null {
  if (!card.coverage) return null;
  return {
    offices: card.coverage.offices,
    officesWithAnyEvent: card.coverage.officesWithAnyEvent,
    officesWithResults: card.coverage.officesWithResults,
    eventsTotal: card.coverage.eventsTotal,
    eventsWithResults: card.coverage.eventsWithResults,
    notSuppliedNextDates: card.coverage.notSuppliedNextDates,
    latestSnapshotLabel: card.coverage.latestSnapshotLabel,
  };
}

function readMarkers(sqlitePath: string): WorldMarker[] {
  try {
    const catalog = loadAtlasCatalog(sqlitePath);
    if (catalog.status !== "ready") return [];
    const cards = new Map(listCountryCards(sqlitePath).map((card) => [card.countryId, card]));
    const resultRows = countResultRowsByCountry(sqlitePath);
    const inputs: WorldMarkerInput[] = catalog.countries.map((country) => {
      const card = cards.get(country.countryId);
      return {
        countryId: country.countryId,
        countryCode: country.countryCode,
        name: country.name,
        href: card ? jurisdictionPublicPath(card.slugPath) : atlasRoutes.country(country.countryId),
        resultRows: resultRows.get(country.countryId) ?? 0,
        coverage: card ? coverageSnapshot(card) : null,
      };
    });
    return buildWorldMarkers(inputs);
  } catch {
    return [];
  }
}

export function loadCenterFrontDoor(sqlitePath = resolveAtlasSqlitePath()): CenterFrontDoor {
  if (!existsSync(sqlitePath)) {
    return empty(
      "missing",
      "No Atlas database is loaded. Counts and coverage markers stay unavailable until a database is present.",
    );
  }

  let db: DatabaseSync | null = null;
  try {
    db = openAtlasDatabase(sqlitePath, { readOnly: true });
    const coverage = readCoverage(db);
    const snapshots = readSnapshots(db);
    db.close();
    db = null;
    return {
      status: "ready",
      message: "",
      coverage,
      snapshots,
      markers: readMarkers(sqlitePath),
    };
  } catch {
    return empty("unavailable", "The Atlas database could not be read.");
  } finally {
    db?.close();
  }
}
