import { existsSync } from "node:fs";
import type { DatabaseSync } from "node:sqlite";
import { atlasDownloadsDir, shouldWriteDownloadBundles, writeCountryBundles } from "../downloads";
import { ensureSearchSchema } from "../search/schema";
import { assertIntegrity, insertMany, openAtlasDatabase } from "../sqlite";
import {
  projectDerived,
  type CoverageRow,
  type CycleRow,
  type EventInput,
  type GeographyInput,
  type JurisdictionRow,
  type MasterSnapshot,
  type OfficeInput,
  type ResultInput,
  type SeatRow,
  type UnplacedRow,
} from "./project";
import { rebuildSearchIndexes } from "../search/rebuild";
import {
  emptyOfficeSlugMeanings,
  officeIdentity,
  type OfficeSlugAlias,
  type OfficeSlugMeanings,
  type OfficeSlugRow,
} from "../seat/slug";
import { loadApprovedPeople, resolvePeopleDir } from "../people/load";
import { ensurePersonSchema } from "../people/schema";
import { ensureDerivedSchema, ensureOfficeSlugSchema } from "./schema";
import { ensureCatalogSummarySchema } from "../summary/schema";
import { deleteCatalogSummary, insertCatalogSummary, summarizeSnapshot } from "../summary/write";
import { emptySlugMeanings, type PublishedSlugMeanings } from "./slug";

export type DeriveStats = {
  schema: "applied" | "skipped";
  searchSchema: "applied" | "skipped";
  jurisdictions: number;
  aliases: number;
  seats: number;
  officeSlugs: number;
  officeSlugAliases: number;
  cycles: number;
  unplaced: number;
  coverage: number;
  searchSeats: number;
  searchCycles: number;
  searchCandidates: number;
  persons: number;
  personAliases: number;
};

function text(value: unknown): string {
  return value == null ? "" : String(value);
}

function textOrNull(value: unknown): string | null {
  if (value == null) return null;
  const next = String(value);
  return next === "" ? null : next;
}

function numOrNull(value: unknown): number | null {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function loadPrior(db: DatabaseSync): { jurisdictions: PublishedSlugMeanings; offices: OfficeSlugMeanings } {
  const jurisdictions = emptySlugMeanings();
  const offices = emptyOfficeSlugMeanings();
  if (db.prepare("SELECT 1 AS ok FROM sqlite_master WHERE type = 'table' AND name = 'derived_jurisdiction'").get()) {
    for (const row of db.prepare("SELECT jurisdiction_key, slug_path FROM derived_jurisdiction").all()) {
      jurisdictions.meaning.set(text(row.slug_path), text(row.jurisdiction_key));
    }
    for (const row of db.prepare("SELECT slug_path, jurisdiction_key, reason FROM derived_slug_alias").all()) {
      jurisdictions.meaning.set(text(row.slug_path), text(row.jurisdiction_key));
      jurisdictions.aliasReason.set(text(row.slug_path), text(row.reason));
    }
  }
  if (db.prepare("SELECT 1 AS ok FROM sqlite_master WHERE type = 'table' AND name = 'derived_office_slug'").get()) {
    for (const row of db.prepare("SELECT id_namespace, office_id, slug_path FROM derived_office_slug").all()) {
      offices.meaning.set(text(row.slug_path), officeIdentity(text(row.id_namespace), text(row.office_id)));
    }
    for (const row of db.prepare("SELECT slug_path, id_namespace, office_id, reason FROM derived_office_slug_alias").all()) {
      offices.meaning.set(text(row.slug_path), officeIdentity(text(row.id_namespace), text(row.office_id)));
      offices.aliasReason.set(text(row.slug_path), text(row.reason));
    }
  }
  return { jurisdictions, offices };
}

function loadMaster(db: DatabaseSync, countryId?: string): MasterSnapshot {
  const countryParams = countryId ? [countryId] : [];
  const countries = db
    .prepare(
      `SELECT country_id, name, coverage_status FROM country ${countryId ? "WHERE country_id = ?" : ""} ORDER BY country_id`,
    )
    .all(...countryParams)
    .map((row) => ({
      countryId: text(row.country_id),
      name: text(row.name),
      coverageStatus: text(row.coverage_status),
    }));
  const geographies: GeographyInput[] = db
    .prepare(
      `SELECT country_id, geography_id, name, parent_geography_id FROM geography ${countryId ? "WHERE country_id = ?" : ""} ORDER BY country_id, geography_id`,
    )
    .all(...countryParams)
    .map((row) => ({
      countryId: text(row.country_id),
      geographyId: text(row.geography_id),
      name: text(row.name),
      parentGeographyId: textOrNull(row.parent_geography_id),
    }));
  const offices: OfficeInput[] = db
    .prepare(
      `SELECT o.id_namespace, o.office_id, o.country_id, o.geography_id, o.name, o.office_type,
              o.next_date_id, o.next_date_resolution, o.lineage_id, t.tier
       FROM office o
       LEFT JOIN office_tier_classification t
         ON t.id_namespace = o.id_namespace AND t.office_id = o.office_id
       ${countryId ? "WHERE o.country_id = ?" : ""}
       ORDER BY o.id_namespace, o.office_id`,
    )
    .all(...countryParams)
    .map((row) => ({
      idNamespace: text(row.id_namespace),
      officeId: text(row.office_id),
      countryId: text(row.country_id),
      geographyId: text(row.geography_id),
      name: text(row.name),
      officeType: text(row.office_type),
      nextDateId: textOrNull(row.next_date_id),
      nextDateResolution: text(row.next_date_resolution),
      tier: textOrNull(row.tier),
      lineageId: text(row.lineage_id),
    }));
  const events: EventInput[] = db
    .prepare(
      `SELECT e.id_namespace, e.office_id, e.history_key, e.event_id, o.country_id, o.geography_id, t.tier,
              e.date_id, e.date_resolution, e.event_kind, e.selected_history_role, e.legal_outcome, e.record_state,
              d.precision, d.year, d.month, d.day
       FROM election_event e
       JOIN office o ON o.id_namespace = e.id_namespace AND o.office_id = e.office_id
       LEFT JOIN office_tier_classification t
         ON t.id_namespace = o.id_namespace AND t.office_id = o.office_id
       LEFT JOIN research_date d ON d.date_id = e.date_id
       ${countryId ? "WHERE o.country_id = ?" : ""}`,
    )
    .all(...countryParams)
    .map((row) => ({
      idNamespace: text(row.id_namespace),
      officeId: text(row.office_id),
      historyKey: text(row.history_key),
      eventId: text(row.event_id),
      countryId: text(row.country_id),
      geographyId: text(row.geography_id),
      tier: textOrNull(row.tier),
      dateId: textOrNull(row.date_id),
      dateResolution: text(row.date_resolution),
      eventKind: text(row.event_kind),
      selectedHistoryRole: text(row.selected_history_role),
      legalOutcome: text(row.legal_outcome),
      recordState: text(row.record_state),
      precision: textOrNull(row.precision),
      year: numOrNull(row.year),
      month: numOrNull(row.month),
      day: numOrNull(row.day),
    }));
  const results: ResultInput[] = db
    .prepare(
      `SELECT r.id_namespace, r.office_id, r.history_key, r.result_row_id, r.proceeding_id,
              r.candidate_or_list_label, r.original_party_label, r.share, r.share_status, r.share_unit,
              r.elected_flag, r.evidence_status, p.legal_outcome AS proceeding_outcome
       FROM result_row r
       LEFT JOIN proceeding p
         ON p.id_namespace = r.id_namespace AND p.office_id = r.office_id
        AND p.history_key = r.history_key AND p.proceeding_id = r.proceeding_id
       ${countryId ? "WHERE r.country_id = ?" : ""}`,
    )
    .all(...countryParams)
    .map((row) => ({
      idNamespace: text(row.id_namespace),
      officeId: text(row.office_id),
      historyKey: text(row.history_key),
      resultRowId: text(row.result_row_id),
      proceedingId: textOrNull(row.proceeding_id),
      proceedingOutcome: textOrNull(row.proceeding_outcome),
      label: textOrNull(row.candidate_or_list_label),
      partyLabel: textOrNull(row.original_party_label),
      share: numOrNull(row.share),
      shareStatus: text(row.share_status),
      shareUnit: text(row.share_unit),
      electedFlag: numOrNull(row.elected_flag),
      evidenceStatus: text(row.evidence_status),
    }));
  const snapshots = db
    .prepare(
      `SELECT c.country_id, r.research_snapshot_label
       FROM country c
       JOIN publication_release p ON p.lineage_id = c.lineage_id
       JOIN dataset_release r ON r.lineage_id = p.lineage_id AND r.release_id = p.release_id
       ${countryId ? "WHERE c.country_id = ?" : ""}
       ORDER BY c.country_id`,
    )
    .all(...countryParams)
    .map((row) => ({
      countryId: text(row.country_id),
      label: textOrNull(row.research_snapshot_label),
    }));
  return { countries, geographies, offices, events, results, snapshots };
}

function deleteDerived(db: DatabaseSync): void {
  db.exec(`
    DELETE FROM derived_office_slug_alias;
    DELETE FROM derived_office_slug;
    DELETE FROM derived_slug_alias;
    DELETE FROM derived_coverage;
    DELETE FROM derived_cycle_unplaced;
    DELETE FROM derived_cycle;
    DELETE FROM derived_seat_status;
    DELETE FROM derived_jurisdiction;
  `);
  deleteCatalogSummary(db);
}

/** Delete derived rows for one country. Other countries stay. */
function deleteCountryDerived(db: DatabaseSync, countryId: string): void {
  db.prepare(
    `DELETE FROM derived_coverage WHERE jurisdiction_key IN (
       SELECT jurisdiction_key FROM derived_jurisdiction WHERE country_id = ?
     )`,
  ).run(countryId);
  db.prepare("DELETE FROM derived_cycle WHERE country_id = ?").run(countryId);
  db.prepare("DELETE FROM derived_cycle_unplaced WHERE country_id = ?").run(countryId);
  db.prepare(
    `DELETE FROM derived_office_slug_alias WHERE EXISTS (
       SELECT 1 FROM office o
       WHERE o.id_namespace = derived_office_slug_alias.id_namespace
         AND o.office_id = derived_office_slug_alias.office_id
         AND o.country_id = ?
     )`,
  ).run(countryId);
  db.prepare(
    `DELETE FROM derived_office_slug WHERE jurisdiction_key IN (
       SELECT jurisdiction_key FROM derived_jurisdiction WHERE country_id = ?
     )`,
  ).run(countryId);
  db.prepare(
    `DELETE FROM derived_slug_alias WHERE jurisdiction_key IN (
       SELECT jurisdiction_key FROM derived_jurisdiction WHERE country_id = ?
     )`,
  ).run(countryId);
  db.prepare("DELETE FROM derived_seat_status WHERE country_id = ?").run(countryId);
  db.prepare("DELETE FROM derived_jurisdiction WHERE country_id = ?").run(countryId);
  deleteCatalogSummary(db, countryId);
}

function insertDerived(
  db: DatabaseSync,
  rows: {
    jurisdictions: JurisdictionRow[];
    aliases: Array<{ slug_path: string; jurisdiction_key: string; reason: string }>;
    seats: SeatRow[];
    officeSlugs: OfficeSlugRow[];
    officeSlugAliases: OfficeSlugAlias[];
    cycles: CycleRow[];
    unplaced: UnplacedRow[];
    coverage: CoverageRow[];
  },
): void {
  insertMany(db, "derived_jurisdiction", rows.jurisdictions);
  insertMany(db, "derived_slug_alias", rows.aliases);
  insertMany(db, "derived_seat_status", rows.seats);
  insertMany(db, "derived_office_slug", rows.officeSlugs);
  insertMany(db, "derived_office_slug_alias", rows.officeSlugAliases);
  insertMany(db, "derived_cycle", rows.cycles);
  insertMany(db, "derived_cycle_unplaced", rows.unplaced);
  insertMany(db, "derived_coverage", rows.coverage);
}

/** Rebuild derived tables from the master. Does not write master rows. */
export function deriveAtlas(
  db: DatabaseSync,
  options?: { countryId?: string },
): Omit<DeriveStats, "schema" | "searchSchema"> {
  ensureOfficeSlugSchema(db);
  ensurePersonSchema(db);
  ensureCatalogSummarySchema(db);
  const countryId = options?.countryId?.trim() || undefined;
  db.exec("BEGIN IMMEDIATE;");
  try {
    const prior = loadPrior(db);
    const master = loadMaster(db, countryId);
    const projected = projectDerived(master, prior.jurisdictions, prior.offices);
    if (countryId) deleteCountryDerived(db, countryId);
    else deleteDerived(db);
    insertDerived(db, projected);
    insertCatalogSummary(db, summarizeSnapshot(master));
    const search = rebuildSearchIndexes(db, countryId ? { countryId } : undefined);
    const people = loadApprovedPeople(db, resolvePeopleDir(), countryId ? { countryId } : undefined);
    db.exec("COMMIT;");
    return {
      jurisdictions: projected.jurisdictions.length,
      aliases: projected.aliases.length,
      seats: projected.seats.length,
      officeSlugs: projected.officeSlugs.length,
      officeSlugAliases: projected.officeSlugAliases.length,
      cycles: projected.cycles.length,
      unplaced: projected.unplaced.length,
      coverage: projected.coverage.length,
      searchSeats: search.searchSeats,
      searchCycles: search.searchCycles,
      searchCandidates: search.searchCandidates,
      persons: people.persons,
      personAliases: people.aliases,
    };
  } catch (error) {
    try {
      db.exec("ROLLBACK;");
    } catch {
      // The transaction may already be closed.
    }
    throw error;
  }
}

export function rebuildDerivedInFile(sqlitePath: string): DeriveStats & { downloads: number } {
  if (!existsSync(sqlitePath)) {
    throw new Error(`No Atlas database at ${sqlitePath}. Run npm run migrate:atlas first.`);
  }
  const db = openAtlasDatabase(sqlitePath);
  try {
    const schema = ensureDerivedSchema(db);
    const searchSchema = ensureSearchSchema(db);
    const stats = deriveAtlas(db);
    assertIntegrity(db);
    const downloads = shouldWriteDownloadBundles() ? writeCountryBundles(db, atlasDownloadsDir()) : 0;
    return { schema, searchSchema, ...stats, downloads };
  } finally {
    db.close();
  }
}

/**
 * Rebuild derived tables, search rows, and the download zip for one country.
 * Other countries' rows stay. Does not run integrity_check.
 */
export function deriveCountry(db: DatabaseSync, countryId: string): Omit<DeriveStats, "schema" | "searchSchema"> {
  const id = countryId.trim();
  if (!id) throw new Error("deriveCountry requires a country_id");
  return deriveAtlas(db, { countryId: id });
}

export function rebuildDerivedCountryInFile(
  sqlitePath: string,
  countryId: string,
): DeriveStats & { downloads: number } {
  if (!existsSync(sqlitePath)) {
    throw new Error(`No Atlas database at ${sqlitePath}. Run npm run migrate:atlas first.`);
  }
  const id = countryId.trim();
  if (!id) throw new Error("Country derive requires a country_id");
  const db = openAtlasDatabase(sqlitePath);
  try {
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA busy_timeout = 5000;");
    const schema = ensureDerivedSchema(db);
    const searchSchema = ensureSearchSchema(db);
    const stats = deriveCountry(db, id);
    const downloads = shouldWriteDownloadBundles() ? writeCountryBundles(db, atlasDownloadsDir(), id) : 0;
    return { schema, searchSchema, ...stats, downloads };
  } finally {
    db.close();
  }
}
