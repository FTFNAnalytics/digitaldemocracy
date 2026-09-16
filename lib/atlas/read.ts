import { existsSync } from "node:fs";
import type { DatabaseSync } from "node:sqlite";
import { resolveAtlasSqlitePath } from "./paths";
import { openAtlasDatabase, tableExists } from "./sqlite";

export type AtlasLoadStatus = "ready" | "missing" | "empty" | "unavailable";

export type AtlasCatalog = {
  status: AtlasLoadStatus;
  sqlitePath: string;
  message: string;
  lineages: AtlasLineage[];
  countries: AtlasCountrySummary[];
  statusOnlyCountries: AtlasCountrySummary[];
  totals: {
    countriesWithOffices: number;
    offices: number;
    events: number;
    resultRows: number;
  };
};

export type AtlasLineage = {
  lineageId: string;
  description: string;
  provenanceKind: string;
  releaseId: string;
  snapshotLabel: string | null;
  officeCount: number;
};

export type AtlasCountrySummary = {
  countryId: string;
  name: string;
  countryCode: string | null;
  regionId: string;
  coverageStatus: string;
  polityKind: string;
  notes: string | null;
  lineageId: string;
  officeCount: number;
  eventCount: number;
};

export type AtlasCountryDetail = AtlasCountrySummary & {
  screeningAsOfLabel: string | null;
};

export type AtlasOfficeRow = {
  officeId: string;
  countryId: string;
  name: string;
  officeType: string;
  officeStatus: string;
  geographyName: string | null;
  tier: string | null;
  reviewStatus: string | null;
  nextLabel: string | null;
  nextPrecision: string | null;
  nextCertainty: string | null;
};

export type AtlasEventRow = {
  eventId: string;
  historyKey: string;
  officeId: string;
  eventKind: string;
  selectedHistoryRole: string;
  legalOutcome: string;
  electoralSystem: string | null;
  ballotBasis: string;
  dateLabel: string | null;
  datePrecision: string | null;
  dateYear: number | null;
  resultCount: number;
};

export type AtlasResultRow = {
  resultRowId: string;
  label: string | null;
  partyLabel: string | null;
  votes: number | null;
  votesStatus: string;
  share: number | null;
  shareStatus: string;
  seats: number | null;
  seatsStatus: string;
  electedFlag: number | null;
  evidenceStatus: string;
};

function text(value: unknown): string {
  return value == null ? "" : String(value);
}

function textOrNull(value: unknown): string | null {
  if (value == null) return null;
  const next = String(value);
  return next === "" ? null : next;
}

function num(value: unknown): number {
  return Number(value ?? 0);
}

function numOrNull(value: unknown): number | null {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function regionRank(regionId: string): number {
  if (regionId === "europe") return 0;
  if (regionId === "americas") return 1;
  if (regionId === "oceania") return 2;
  return 3;
}

function lineageRank(lineageId: string): number {
  if (lineageId === "country-package-albania") return 0;
  if (lineageId.startsWith("country-package-")) return 1;
  return 2;
}

export function formatAtlasTier(tier: string | null): string {
  if (tier == null || tier === "") return "unknown";
  if (tier === "national_context") return "national context";
  return tier.replaceAll("_", " ");
}

export function formatAtlasDate(row: {
  nextLabel?: string | null;
  dateLabel?: string | null;
  nextPrecision?: string | null;
  datePrecision?: string | null;
  dateYear?: number | null;
}): string {
  const label = row.nextLabel ?? row.dateLabel;
  if (label) return label;
  if (row.dateYear != null) return String(row.dateYear);
  return "date not supplied";
}

function withDatabase<T>(sqlitePath: string, fn: (db: DatabaseSync) => T): T {
  const db = openAtlasDatabase(sqlitePath, { readOnly: true });
  try {
    return fn(db);
  } finally {
    db.close();
  }
}

function requiredTablesPresent(db: DatabaseSync): boolean {
  return ["country", "office", "election_event", "dataset_lineage", "publication_release"].every((name) =>
    tableExists(db, name),
  );
}

export function loadAtlasCatalog(sqlitePath = resolveAtlasSqlitePath()): AtlasCatalog {
  if (!existsSync(sqlitePath)) {
    return {
      status: "missing",
      sqlitePath,
      message:
        "No Atlas SQLite file was found. Import approved packs locally with npm run import:atlas, or set ATLAS_SQLITE_PATH (production expects /var/lib/cdd/atlas.sqlite).",
      lineages: [],
      countries: [],
      statusOnlyCountries: [],
      totals: { countriesWithOffices: 0, offices: 0, events: 0, resultRows: 0 },
    };
  }

  try {
    return withDatabase(sqlitePath, (db) => {
      if (!requiredTablesPresent(db)) {
        return {
          status: "unavailable",
          sqlitePath,
          message: "The Atlas SQLite file exists but does not contain the expected master tables.",
          lineages: [],
          countries: [],
          statusOnlyCountries: [],
          totals: { countriesWithOffices: 0, offices: 0, events: 0, resultRows: 0 },
        };
      }

      const lineages = db
        .prepare(
          `SELECT l.lineage_id, l.description, l.provenance_kind, p.release_id, r.research_snapshot_label,
                  (SELECT COUNT(*) FROM office o WHERE o.lineage_id = l.lineage_id) AS office_count
           FROM dataset_lineage l
           JOIN publication_release p ON p.lineage_id = l.lineage_id
           LEFT JOIN dataset_release r ON r.lineage_id = p.lineage_id AND r.release_id = p.release_id
           ORDER BY l.lineage_id`,
        )
        .all()
        .map((row) => ({
          lineageId: text(row.lineage_id),
          description: text(row.description),
          provenanceKind: text(row.provenance_kind),
          releaseId: text(row.release_id),
          snapshotLabel: textOrNull(row.research_snapshot_label),
          officeCount: num(row.office_count),
        }))
        .sort((a, b) => lineageRank(a.lineageId) - lineageRank(b.lineageId) || a.lineageId.localeCompare(b.lineageId));

      const allCountries = db
        .prepare(
          `SELECT c.country_id, c.name, c.country_code, c.region_id, c.coverage_status, c.polity_kind, c.notes, c.lineage_id,
                  (SELECT COUNT(*) FROM office o WHERE o.country_id = c.country_id) AS office_count,
                  (SELECT COUNT(*) FROM election_event e JOIN office o ON o.id_namespace = e.id_namespace AND o.office_id = e.office_id
                   WHERE o.country_id = c.country_id) AS event_count
           FROM country c`,
        )
        .all()
        .map((row) => ({
          countryId: text(row.country_id),
          name: text(row.name),
          countryCode: textOrNull(row.country_code),
          regionId: text(row.region_id),
          coverageStatus: text(row.coverage_status),
          polityKind: text(row.polity_kind),
          notes: textOrNull(row.notes),
          lineageId: text(row.lineage_id),
          officeCount: num(row.office_count),
          eventCount: num(row.event_count),
        }))
        .sort(
          (a, b) =>
            regionRank(a.regionId) - regionRank(b.regionId) ||
            b.officeCount - a.officeCount ||
            a.name.localeCompare(b.name),
        );

      const countries = allCountries.filter((row) => row.officeCount > 0);
      const statusOnlyCountries = allCountries.filter((row) => row.officeCount === 0);
      const totals = {
        countriesWithOffices: countries.length,
        offices: num(db.prepare("SELECT COUNT(*) AS n FROM office").get()?.n),
        events: num(db.prepare("SELECT COUNT(*) AS n FROM election_event").get()?.n),
        resultRows: tableExists(db, "result_row")
          ? num(db.prepare("SELECT COUNT(*) AS n FROM result_row").get()?.n)
          : 0,
      };

      if (lineages.length === 0 && countries.length === 0) {
        return {
          status: "empty",
          sqlitePath,
          message:
            "Atlas SQLite is present but no published lineages or offices are loaded yet. Run npm run import:atlas against this path.",
          lineages,
          countries,
          statusOnlyCountries,
          totals,
        };
      }

      return {
        status: "ready",
        sqlitePath,
        message: "",
        lineages,
        countries,
        statusOnlyCountries,
        totals,
      };
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      status: "unavailable",
      sqlitePath,
      message: `Atlas SQLite could not be read (${message}).`,
      lineages: [],
      countries: [],
      statusOnlyCountries: [],
      totals: { countriesWithOffices: 0, offices: 0, events: 0, resultRows: 0 },
    };
  }
}

export function getAtlasCountry(
  countryId: string,
  sqlitePath = resolveAtlasSqlitePath(),
): AtlasCountryDetail | null {
  const catalog = loadAtlasCatalog(sqlitePath);
  if (catalog.status !== "ready") return null;
  try {
    return withDatabase(sqlitePath, (db) => {
      const row = db
        .prepare(
          `SELECT c.country_id, c.name, c.country_code, c.region_id, c.coverage_status, c.polity_kind, c.notes,
                  c.lineage_id, c.screening_as_of_label,
                  (SELECT COUNT(*) FROM office o WHERE o.country_id = c.country_id) AS office_count,
                  (SELECT COUNT(*) FROM election_event e JOIN office o ON o.id_namespace = e.id_namespace AND o.office_id = e.office_id
                   WHERE o.country_id = c.country_id) AS event_count
           FROM country c WHERE c.country_id = ?`,
        )
        .get(countryId);
      if (!row) return null;
      return {
        countryId: text(row.country_id),
        name: text(row.name),
        countryCode: textOrNull(row.country_code),
        regionId: text(row.region_id),
        coverageStatus: text(row.coverage_status),
        polityKind: text(row.polity_kind),
        notes: textOrNull(row.notes),
        lineageId: text(row.lineage_id),
        screeningAsOfLabel: textOrNull(row.screening_as_of_label),
        officeCount: num(row.office_count),
        eventCount: num(row.event_count),
      };
    });
  } catch {
    return null;
  }
}

export function listAtlasRegionalCalendar(
  countryId: string,
  sqlitePath = resolveAtlasSqlitePath(),
): {
  offices: AtlasOfficeRow[];
  count: number;
  label: string;
  denominatorKnown: boolean;
} {
  const offices = listAtlasOffices(countryId, sqlitePath).filter((row) => row.tier === "regional");
  if (countryId === "andorra") {
    return {
      offices,
      count: offices.length,
      label: "No regional tier in this package; seven municipal councils.",
      denominatorKnown: false,
    };
  }
  return {
    offices,
    count: offices.length,
    label:
      offices.length === 0
        ? "No regional-tier offices are stored for this country."
        : `${offices.length} regional-tier office${offices.length === 1 ? "" : "s"}.`,
    denominatorKnown: false,
  };
}

export function listAtlasOffices(
  countryId: string,
  sqlitePath = resolveAtlasSqlitePath(),
): AtlasOfficeRow[] {
  if (!existsSync(sqlitePath)) return [];
  try {
    return withDatabase(sqlitePath, (db) => {
      if (!tableExists(db, "office")) return [];
      return db
        .prepare(
          `SELECT o.office_id, o.country_id, o.name, o.office_type, o.office_status,
                  g.name AS geography_name, t.tier, t.review_status,
                  d.label AS next_label, d.precision AS next_precision, d.certainty AS next_certainty
           FROM office o
           LEFT JOIN geography g ON g.country_id = o.country_id AND g.geography_id = o.geography_id
           LEFT JOIN office_tier_classification t
             ON t.id_namespace = o.id_namespace AND t.office_id = o.office_id
           LEFT JOIN research_date d ON d.date_id = o.next_date_id
           WHERE o.country_id = ?
           ORDER BY o.name, o.office_id`,
        )
        .all(countryId)
        .map((row) => ({
          officeId: text(row.office_id),
          countryId: text(row.country_id),
          name: text(row.name),
          officeType: text(row.office_type),
          officeStatus: text(row.office_status),
          geographyName: textOrNull(row.geography_name),
          tier: textOrNull(row.tier),
          reviewStatus: textOrNull(row.review_status),
          nextLabel: textOrNull(row.next_label),
          nextPrecision: textOrNull(row.next_precision),
          nextCertainty: textOrNull(row.next_certainty),
        }));
    });
  } catch {
    return [];
  }
}

export function getAtlasOffice(
  officeId: string,
  sqlitePath = resolveAtlasSqlitePath(),
): (AtlasOfficeRow & { lineageId: string }) | null {
  if (!existsSync(sqlitePath)) return null;
  try {
    return withDatabase(sqlitePath, (db) => {
      if (!tableExists(db, "office")) return null;
      const row = db
        .prepare(
          `SELECT o.office_id, o.country_id, o.name, o.office_type, o.office_status, o.lineage_id,
                  g.name AS geography_name, t.tier, t.review_status,
                  d.label AS next_label, d.precision AS next_precision, d.certainty AS next_certainty
           FROM office o
           LEFT JOIN geography g ON g.country_id = o.country_id AND g.geography_id = o.geography_id
           LEFT JOIN office_tier_classification t
             ON t.id_namespace = o.id_namespace AND t.office_id = o.office_id
           LEFT JOIN research_date d ON d.date_id = o.next_date_id
           WHERE o.office_id = ?`,
        )
        .get(officeId);
      if (!row) return null;
      return {
        officeId: text(row.office_id),
        countryId: text(row.country_id),
        name: text(row.name),
        officeType: text(row.office_type),
        officeStatus: text(row.office_status),
        geographyName: textOrNull(row.geography_name),
        tier: textOrNull(row.tier),
        reviewStatus: textOrNull(row.review_status),
        nextLabel: textOrNull(row.next_label),
        nextPrecision: textOrNull(row.next_precision),
        nextCertainty: textOrNull(row.next_certainty),
        lineageId: text(row.lineage_id),
      };
    });
  } catch {
    return null;
  }
}

export function listAtlasEvents(
  officeId: string,
  sqlitePath = resolveAtlasSqlitePath(),
): AtlasEventRow[] {
  if (!existsSync(sqlitePath)) return [];
  try {
    return withDatabase(sqlitePath, (db) => {
      if (!tableExists(db, "election_event")) return [];
      return db
        .prepare(
          `SELECT e.event_id, e.history_key, e.office_id, e.event_kind, e.selected_history_role,
                  e.legal_outcome, e.electoral_system, e.ballot_basis,
                  d.label AS date_label, d.precision AS date_precision, d.year AS date_year,
                  (SELECT COUNT(*) FROM result_row r
                    WHERE r.id_namespace = e.id_namespace AND r.office_id = e.office_id AND r.history_key = e.history_key) AS result_count
           FROM election_event e
           LEFT JOIN research_date d ON d.date_id = e.date_id
           WHERE e.office_id = ?
           ORDER BY CASE e.selected_history_role WHEN 'none' THEN 0 WHEN 'selected' THEN 1 ELSE 2 END,
                    d.year DESC, d.month DESC, d.day DESC, e.event_id`,
        )
        .all(officeId)
        .map((row) => ({
          eventId: text(row.event_id),
          historyKey: text(row.history_key),
          officeId: text(row.office_id),
          eventKind: text(row.event_kind),
          selectedHistoryRole: text(row.selected_history_role),
          legalOutcome: text(row.legal_outcome),
          electoralSystem: textOrNull(row.electoral_system),
          ballotBasis: text(row.ballot_basis),
          dateLabel: textOrNull(row.date_label),
          datePrecision: textOrNull(row.date_precision),
          dateYear: numOrNull(row.date_year),
          resultCount: num(row.result_count),
        }));
    });
  } catch {
    return [];
  }
}

export function listAtlasResults(
  officeId: string,
  historyKey: string,
  sqlitePath = resolveAtlasSqlitePath(),
): AtlasResultRow[] {
  if (!existsSync(sqlitePath)) return [];
  try {
    return withDatabase(sqlitePath, (db) => {
      if (!tableExists(db, "result_row")) return [];
      return db
        .prepare(
          `SELECT result_row_id, candidate_or_list_label, original_party_label, votes, votes_status,
                  share, share_status, seats, seats_status, elected_flag, evidence_status
           FROM result_row
           WHERE office_id = ? AND history_key = ?
           ORDER BY result_row_id`,
        )
        .all(officeId, historyKey)
        .map((row) => ({
          resultRowId: text(row.result_row_id),
          label: textOrNull(row.candidate_or_list_label),
          partyLabel: textOrNull(row.original_party_label),
          votes: numOrNull(row.votes),
          votesStatus: text(row.votes_status),
          share: numOrNull(row.share),
          shareStatus: text(row.share_status),
          seats: numOrNull(row.seats),
          seatsStatus: text(row.seats_status),
          electedFlag: numOrNull(row.elected_flag),
          evidenceStatus: text(row.evidence_status),
        }));
    });
  } catch {
    return [];
  }
}
