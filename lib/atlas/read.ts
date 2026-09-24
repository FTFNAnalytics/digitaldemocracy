import { existsSync } from "node:fs";
import type { DatabaseSync } from "node:sqlite";
import type { AtlasExplorerFilters } from "./filters";
import { emptyAtlasExplorerFilters } from "./filters";
import { resolveAtlasSqlitePath } from "./paths";
import { REGIONAL_CALENDAR_LABEL as HUNGARY_REGIONAL_CALENDAR_LABEL } from "./hungary/identity";
import { REGIONAL_CALENDAR_LABEL as LATVIA_REGIONAL_CALENDAR_LABEL } from "./latvia/identity";
import { REGIONAL_CALENDAR_LABEL as LITHUANIA_REGIONAL_CALENDAR_LABEL } from "./lithuania/identity";
import { REGIONAL_CALENDAR_LABEL as GREECE_REGIONAL_CALENDAR_LABEL } from "./greece/identity";
import { REGIONAL_CALENDAR_LABEL as LUXEMBOURG_REGIONAL_CALENDAR_LABEL } from "./luxembourg/identity";
import { REGIONAL_CALENDAR_LABEL as MALTA_REGIONAL_CALENDAR_LABEL } from "./malta/identity";
import { REGIONAL_CALENDAR_LABEL as ROMANIA_REGIONAL_CALENDAR_LABEL } from "./romania/identity";
import { REGIONAL_CALENDAR_LABEL as SPAIN_REGIONAL_CALENDAR_LABEL } from "./spain/identity";
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

export type AtlasOfficeDetail = AtlasOfficeRow & {
  lineageId: string;
  idNamespace: string;
};

export type AtlasExplorerOffice = AtlasOfficeRow & {
  countryName: string;
  regionId: string;
};

export type AtlasExplorerFacets = {
  countries: Array<{ value: string; label: string }>;
  regions: Array<{ value: string; label: string }>;
  tiers: Array<{ value: string; label: string }>;
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

export type AtlasEventDetail = AtlasEventRow & {
  idNamespace: string;
  countryId: string;
  countryName: string | null;
  officeName: string;
  shareUnit: string;
  comparability: string | null;
  recordState: string;
};

export type AtlasProceedingRow = {
  proceedingId: string;
  kind: string;
  sequenceNo: number | null;
  supersedesId: string | null;
  legalOutcome: string;
};

/**
 * Bare public-ID lookup used by `/atlas/offices/:id` and `/atlas/elections/:id`.
 *
 * Prompt B uniqueness is `(id_namespace, office_id)` / `(id_namespace, event_id)`,
 * not a global unique public ID. An ambiguous bare ID must not silently pick a
 * namespace.
 */
export type AtlasPublicIdLookup<T> =
  | { status: "found"; record: T }
  | { status: "missing" }
  | { status: "ambiguous"; namespaces: string[] };

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

function includesInsensitive(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

const OFFICE_COLUMNS = `o.office_id, o.country_id, o.name, o.office_type, o.office_status, o.lineage_id, o.id_namespace,
                  g.name AS geography_name, t.tier, t.review_status,
                  d.label AS next_label, d.precision AS next_precision, d.certainty AS next_certainty`;

const OFFICE_JOINS = `FROM office o
           LEFT JOIN geography g ON g.country_id = o.country_id AND g.geography_id = o.geography_id
           LEFT JOIN office_tier_classification t
             ON t.id_namespace = o.id_namespace AND t.office_id = o.office_id
           LEFT JOIN research_date d ON d.date_id = o.next_date_id`;

const OFFICE_SELECT = `SELECT ${OFFICE_COLUMNS} ${OFFICE_JOINS}`;

function mapOfficeRow(row: Record<string, unknown>): AtlasOfficeRow {
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
  };
}

function mapOfficeDetail(row: Record<string, unknown>): AtlasOfficeDetail {
  return {
    ...mapOfficeRow(row),
    lineageId: text(row.lineage_id),
    idNamespace: text(row.id_namespace),
  };
}

function mapEventRow(row: Record<string, unknown>): AtlasEventRow {
  return {
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
  };
}

export function formatAtlasTier(tier: string | null): string {
  if (tier == null || tier === "") return "unknown";
  if (tier === "national_context") return "national context";
  return tier.replaceAll("_", " ");
}

export function formatAtlasRegion(regionId: string): string {
  if (regionId === "europe") return "Europe";
  if (regionId === "americas") return "Americas";
  if (regionId === "oceania") return "Oceania";
  return regionId;
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
  if (countryId === "alderney") {
    return {
      offices,
      count: offices.length,
      label: "No regional tier in this package; two territorial office/contest records classified other.",
      denominatorKnown: false,
    };
  }
  if (countryId === "armenia") {
    return {
      offices,
      count: offices.length,
      label: "No regional offices in the supplied Armenia package; 71 municipal offices. Research coverage remains partial.",
      denominatorKnown: false,
    };
  }
  if (countryId === "austria") {
    return {
      offices,
      count: offices.length,
      label:
        "4 regional offices (Carinthia, Lower Austria, Tyrol, Upper Austria). No dated upcoming regional events; next dates remain unknown. Research coverage remains partial.",
      denominatorKnown: false,
    };
  }
  if (countryId === "belgium") {
    return {
      offices,
      count: offices.length,
      label:
        "15 regional offices (10 provincial councils + Flemish, Walloon, Brussels, German-speaking Community, and French Community parliaments). Historic regional depth is not a forthcoming alert. Remaining-universe notes stay open; no invented municipal or indirect rows beyond the accepted S2 pack.",
      denominatorKnown: false,
    };
  }
  if (countryId === "bosnia-and-herzegovina") {
    return {
      offices,
      count: offices.length,
      label:
        "13 regional offices (10 cantonal assemblies + Federation House of Representatives + RS National Assembly + RS President). Research holds remain open: RS presidential replacement/repeat, governing coalitions, and 2026-10-04 calendar certainty. No Brčko or municipal offices are supplied.",
      denominatorKnown: false,
    };
  }
  if (countryId === "bulgaria") {
    return {
      offices,
      count: offices.length,
      label:
        "No regional offices in the supplied Bulgaria package; 530 approved municipality-wide municipal offices. 3,067 district/village rows remain held. Research coverage remains partial.",
      denominatorKnown: false,
    };
  }
  if (countryId === "ireland") {
    return {
      offices,
      count: offices.length,
      label:
        "No regional offices in the supplied Ireland package. Regional assemblies are councillor appointments, not a popular regional tier. 118 municipal offices (31 current local authority councils, the directly elected Mayor of Limerick, and 86 historical town, borough, and pre-2014 city/county councils). Named holds stay open. Northern Ireland is excluded.",
      denominatorKnown: false,
    };
  }
  if (countryId === "denmark") {
    return {
      offices,
      count: offices.length,
      label:
        "20 regional offices (five operating region councils + elected preparatory Østdanmark + 14 historical county councils). 2029 next dates sit outside the alert window; in-window dated upcoming regional count is 0. Greenland/Faroe Realm, 2007/earlier merger successor, KMD/DST, 98 candidate-binding, and EP-detail notes stay open. No popular mayor rows.",
      denominatorKnown: false,
    };
  }
  if (countryId === "czechia") {
    return {
      offices,
      count: offices.length,
      label:
        "14 regional offices (13 kraj assemblies + one Prague city assembly). PRAGUE-DUAL-STATUS stays open: Prague is one body, not a second regional office, and borough councils stay other. 13 kraj assemblies have unknown next dates. Named holds stay open. No council-selected mayor or governor rows. Slim land omits result bytes; none are invented.",
      denominatorKnown: false,
    };
  }
  if (countryId === "sweden") {
    return {
      offices,
      count: offices.length,
      label:
        "25 regional offices (20 current regionfullmäktige + 5 historical landsting). Gotland stays the municipal SE-K0980-C office; no second regional office. 2030/EP 2029 next dates sit outside the alert window; in-window dated upcoming regional count is 0. Named holds stay open. No popular kommunalråd / prime-minister / cabinet rows.",
      denominatorKnown: false,
    };
  }
  if (countryId === "norway") {
    return {
      offices,
      count: offices.length,
      label:
        "32 regional offices (14 current county councils + 18 historical county councils). Oslo bystyre stays the municipal NO-M0301-C office; no separate Oslo fylkesting. 2027 municipal/county next dates sit outside the alert window as day-precision called metadata; Storting/Sámi 2029 stays year-expected. Named holds stay open. No popular mayor / prime-minister / cabinet or EP rows.",
      denominatorKnown: false,
    };
  }
  if (countryId === "poland") {
    return {
      offices,
      count: offices.length,
      label:
        "330 regional offices (16 voivodeship sejmiks + 314 powiat councils). PL-POWIAT-TIER stays open: powiat rows remain the drafted regional classification and are not reclassified. Do not report 330 as 330 voivodeships. Named historic, 2019 share-unit, special-return, Warsaw auxiliary, and next-date holds stay open. No appointed voivode or PM/cabinet rows. Slim land omits result bytes; none are invented.",
      denominatorKnown: false,
    };
  }
  if (countryId === "netherlands") {
    return {
      offices,
      count: offices.length,
      label:
        "12 regional offices (provincial states). Sourced 17 March 2027 next-date metadata is expected, not a prospective event. Hilversum/Wijdemeren merger successor binding, named historic gaps, and focused-tier reviews stay open. Appointed mayors have no election rows.",
      denominatorKnown: false,
    };
  }
  if (countryId === "switzerland") {
    return {
      offices,
      count: offices.length,
      label:
        "52 regional offices (26 cantonal legislatures + 26 cantonal executives). Historic cantonal depth is not a forthcoming alert. 308 commune-executive gaps, thin historic/merger archive, 1,938 citizen-assembly parliament caveats, and disputed-result notes stay open. Do not invent held commune executives.",
      denominatorKnown: false,
    };
  }
  if (countryId === "finland") {
    return {
      offices,
      count: offices.length,
      label:
        "22 regional offices (21 wellbeing-county councils + Åland Lagting). Helsinki has one municipal council and no county office. 2029/2030 next dates sit outside the alert window; in-window dated upcoming regional count is 0. Named holds stay open. No popular appointed-manager / prime-minister / cabinet rows.",
      denominatorKnown: false,
    };
  }
  if (countryId === "croatia") {
    return {
      offices,
      count: offices.length,
      label:
        "55 regional offices (21 county/Zagreb assemblies + 21 executive tickets + 13 independently elected county deputies). Zagreb stays one dual city/county pair (HR-Z21), separate from Zagrebačka županija (HR-Z01). ZAGREB-DUAL stays open. No second Zagreb body. Next dates stay unknown. Named holds stay open. No invented seat allocations or successor edges.",
      denominatorKnown: false,
    };
  }
  if (countryId === "portugal") {
    return {
      offices,
      count: offices.length,
      label:
        "2 regional offices (Açores and Madeira legislatures). No popular regional-government president. Parish assemblies, juntas, and parish presidents stay other while PARISH-TIER is open. Historical rows are unresolved aliases, not proved abolitions. Named holds stay open.",
      denominatorKnown: false,
    };
  }
  if (countryId === "spain") {
    return {
      offices,
      count: offices.length,
      label: SPAIN_REGIONAL_CALENDAR_LABEL,
      denominatorKnown: false,
    };
  }
  if (countryId === "estonia") {
    return {
      offices,
      count: offices.length,
      label:
        "0 regional offices. County statistical groupings are not elected regional bodies. 78 current municipal councils. Named holds EE-G01–EE-G09 stay open. No mayor, county-governor, cabinet, or Tallinn district office. The presidency stays indirect except the evidenced 1992 popular-ballot exception.",
      denominatorKnown: false,
    };
  }
  if (countryId === "latvia") {
    return {
      offices,
      count: offices.length,
      label: LATVIA_REGIONAL_CALENDAR_LABEL,
      denominatorKnown: false,
    };
  }
  if (countryId === "lithuania") {
    return {
      offices,
      count: offices.length,
      label: LITHUANIA_REGIONAL_CALENDAR_LABEL,
      denominatorKnown: false,
    };
  }
  if (countryId === "hungary") {
    return {
      offices,
      count: offices.length,
      label: HUNGARY_REGIONAL_CALENDAR_LABEL,
      denominatorKnown: false,
    };
  }
  if (countryId === "romania") {
    return {
      offices,
      count: offices.length,
      label: ROMANIA_REGIONAL_CALENDAR_LABEL,
      denominatorKnown: false,
    };
  }
  if (countryId === "greece") {
    return {
      offices,
      count: offices.length,
      label: GREECE_REGIONAL_CALENDAR_LABEL,
      denominatorKnown: false,
    };
  }
  if (countryId === "luxembourg") {
    return {
      offices,
      count: offices.length,
      label: LUXEMBOURG_REGIONAL_CALENDAR_LABEL,
      denominatorKnown: false,
    };
  }
  if (countryId === "malta") {
    return {
      offices,
      count: offices.length,
      label: MALTA_REGIONAL_CALENDAR_LABEL,
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
          `${OFFICE_SELECT}
           WHERE o.country_id = ?
           ORDER BY o.name, o.office_id`,
        )
        .all(countryId)
        .map((row) => mapOfficeRow(row));
    });
  } catch {
    return [];
  }
}

export function getAtlasOffice(
  officeId: string,
  sqlitePath = resolveAtlasSqlitePath(),
): AtlasOfficeDetail | null {
  const lookup = lookupAtlasOffice(officeId, sqlitePath);
  return lookup.status === "found" ? lookup.record : null;
}

export function lookupAtlasOffice(
  officeId: string,
  sqlitePath = resolveAtlasSqlitePath(),
): AtlasPublicIdLookup<AtlasOfficeDetail> {
  if (!existsSync(sqlitePath)) return { status: "missing" };
  try {
    return withDatabase(sqlitePath, (db) => {
      if (!tableExists(db, "office")) return { status: "missing" };
      const rows = db.prepare(`${OFFICE_SELECT} WHERE o.office_id = ?`).all(officeId);
      if (rows.length === 0) return { status: "missing" };
      if (rows.length > 1) {
        return {
          status: "ambiguous",
          namespaces: rows.map((row) => text(row.id_namespace)),
        };
      }
      return { status: "found", record: mapOfficeDetail(rows[0]!) };
    });
  } catch {
    return { status: "missing" };
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
        .map((row) => mapEventRow(row));
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

const EVENT_DETAIL_SELECT = `SELECT e.event_id, e.history_key, e.office_id, e.event_kind, e.selected_history_role,
                  e.legal_outcome, e.electoral_system, e.ballot_basis, e.comparability, e.share_unit,
                  e.record_state, e.id_namespace,
                  d.label AS date_label, d.precision AS date_precision, d.year AS date_year,
                  o.country_id, o.name AS office_name, c.name AS country_name,
                  (SELECT COUNT(*) FROM result_row r
                    WHERE r.id_namespace = e.id_namespace AND r.office_id = e.office_id AND r.history_key = e.history_key) AS result_count
           FROM election_event e
           LEFT JOIN research_date d ON d.date_id = e.date_id
           LEFT JOIN office o ON o.id_namespace = e.id_namespace AND o.office_id = e.office_id
           LEFT JOIN country c ON c.country_id = o.country_id`;

function mapEventDetail(row: Record<string, unknown>): AtlasEventDetail {
  return {
    ...mapEventRow(row),
    idNamespace: text(row.id_namespace),
    countryId: text(row.country_id),
    countryName: textOrNull(row.country_name),
    officeName: text(row.office_name) || text(row.office_id),
    shareUnit: text(row.share_unit),
    comparability: textOrNull(row.comparability),
    recordState: text(row.record_state),
  };
}

export function getAtlasEvent(
  eventId: string,
  sqlitePath = resolveAtlasSqlitePath(),
): AtlasEventDetail | null {
  const lookup = lookupAtlasEvent(eventId, sqlitePath);
  return lookup.status === "found" ? lookup.record : null;
}

export function lookupAtlasEvent(
  eventId: string,
  sqlitePath = resolveAtlasSqlitePath(),
): AtlasPublicIdLookup<AtlasEventDetail> {
  if (!existsSync(sqlitePath)) return { status: "missing" };
  try {
    return withDatabase(sqlitePath, (db) => {
      if (!tableExists(db, "election_event")) return { status: "missing" };
      const rows = db.prepare(`${EVENT_DETAIL_SELECT} WHERE e.event_id = ?`).all(eventId);
      if (rows.length === 0) return { status: "missing" };
      if (rows.length > 1) {
        return {
          status: "ambiguous",
          namespaces: rows.map((row) => text(row.id_namespace)),
        };
      }
      return { status: "found", record: mapEventDetail(rows[0]!) };
    });
  } catch {
    return { status: "missing" };
  }
}

export function listAtlasProceedings(
  officeId: string,
  historyKey: string,
  sqlitePath = resolveAtlasSqlitePath(),
): AtlasProceedingRow[] {
  if (!existsSync(sqlitePath)) return [];
  try {
    return withDatabase(sqlitePath, (db) => {
      if (!tableExists(db, "proceeding")) return [];
      return db
        .prepare(
          `SELECT proceeding_id, kind, sequence_no, supersedes_id, legal_outcome
           FROM proceeding
           WHERE office_id = ? AND history_key = ?
           ORDER BY sequence_no, proceeding_id`,
        )
        .all(officeId, historyKey)
        .map((row) => ({
          proceedingId: text(row.proceeding_id),
          kind: text(row.kind),
          sequenceNo: numOrNull(row.sequence_no),
          supersedesId: textOrNull(row.supersedes_id),
          legalOutcome: text(row.legal_outcome),
        }));
    });
  } catch {
    return [];
  }
}

export function listAtlasExplorerFacets(
  sqlitePath = resolveAtlasSqlitePath(),
): AtlasExplorerFacets {
  const catalog = loadAtlasCatalog(sqlitePath);
  const countries = catalog.countries.map((country) => ({
    value: country.countryId,
    label: country.name,
  }));
  const regionIds = [...new Set(catalog.countries.map((country) => country.regionId))].sort(
    (a, b) => regionRank(a) - regionRank(b) || a.localeCompare(b),
  );
  const regions = regionIds.map((regionId) => ({
    value: regionId,
    label: formatAtlasRegion(regionId),
  }));

  if (catalog.status !== "ready") {
    return { countries, regions, tiers: [] };
  }

  try {
    const tiers = withDatabase(sqlitePath, (db) => {
      if (!tableExists(db, "office")) return [];
      const found = new Set<string>();
      for (const row of db.prepare(`SELECT DISTINCT t.tier ${OFFICE_JOINS}`).all()) {
        found.add(textOrNull(row.tier) ?? "");
      }
      return [...found]
        .sort((a, b) => a.localeCompare(b))
        .map((tier) => ({
          value: tier === "" ? "unknown" : tier,
          label: formatAtlasTier(tier === "" ? null : tier),
        }));
    });
    return { countries, regions, tiers };
  } catch {
    return { countries, regions, tiers: [] };
  }
}

export function listAtlasExplorerOffices(
  filters: AtlasExplorerFilters = emptyAtlasExplorerFilters(),
  sqlitePath = resolveAtlasSqlitePath(),
): AtlasExplorerOffice[] {
  if (!existsSync(sqlitePath)) return [];
  try {
    return withDatabase(sqlitePath, (db) => {
      if (!tableExists(db, "office")) return [];
      const rows = db
        .prepare(
          `SELECT ${OFFICE_COLUMNS}, c.name AS country_name, c.region_id
           ${OFFICE_JOINS}
           JOIN country c ON c.country_id = o.country_id`,
        )
        .all()
        .map((row) => ({
          ...mapOfficeRow(row),
          countryName: text(row.country_name),
          regionId: text(row.region_id),
        }));

      return rows
        .filter((office) => {
          if (filters.country && office.countryId !== filters.country) return false;
          if (filters.region && office.regionId !== filters.region) return false;
          if (filters.tier) {
            const tier = office.tier ?? "unknown";
            if (tier !== filters.tier) return false;
          }
          if (filters.q) {
            const blob = `${office.officeId} ${office.name} ${office.countryId} ${office.countryName} ${office.geographyName ?? ""}`;
            if (!includesInsensitive(blob, filters.q)) return false;
          }
          return true;
        })
        .sort(
          (a, b) =>
            regionRank(a.regionId) - regionRank(b.regionId) ||
            a.countryName.localeCompare(b.countryName) ||
            a.name.localeCompare(b.name) ||
            a.officeId.localeCompare(b.officeId),
        );
    });
  } catch {
    return [];
  }
}
