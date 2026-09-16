import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { key } from "../../../scripts/import/normalize";
import {
  OFFICE_NAMESPACE,
  canonical,
  dateId,
  locator,
  rawEnvelope,
  type HashInputDescriptor,
} from "../identity";
import { countRows } from "../sqlite";
import { listContinuityTierPacks } from "./approved";
import { buildContinuityHashInputs, continuityFingerprint, continuityReleaseId } from "./hash";
import { runContinuityImport, type ContinuityImportOptions, type ContinuityImportResult } from "./run";
import type { ContinuityProjection, SqlRow, TrackedFile } from "./types";

export const NZ_LINEAGE_ID = "country-package-new-zealand";
export const NZ_ADAPTER_VERSION = "atlas-nz-continuity/1";
export const NZ_DATASET_PATH = "data/countries/new-zealand/dataset.json";
export const NZ_TIER_PATH = "schemas/atlas/tiers/new-zealand.json";

type JsonObject = Record<string, unknown>;

function isObj(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function trackFile(root: string, rel: string, kind: TrackedFile["input_kind"]): TrackedFile {
  const absPath = path.join(root, rel);
  const bytes = readFileSync(absPath);
  return {
    absPath,
    input_path: rel,
    input_kind: kind,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    byte_count: bytes.length,
    text: bytes.toString("utf8"),
  };
}

function origin(inputPath: string, sha256: string, pointer: string) {
  return locator({ input_path: inputPath, sha256, json_pointer: pointer });
}

function parseDay(label: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(label.trim());
  if (!match) throw new Error(`NZ date is not an ISO day: ${JSON.stringify(label)}`);
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function mapNzTier(raw: string): string | null {
  if (raw === "municipal") return "municipal";
  if (raw === "regional") return "regional";
  if (raw === "other") return "other";
  if (raw === "national") return "national_context";
  if (raw === "unknown") return null;
  throw new Error(`Unsupported NZ tier ${JSON.stringify(raw)}`);
}

function eventKind(electionType: unknown): string {
  const text = String(electionType ?? "");
  if (text === "by_election") return "special";
  if (text === "ordinary") return "ordinary";
  if (text === "special" || text === "repeated" || text === "indirect" || text === "unknown") return text;
  throw new Error(`Unsupported NZ election_type ${JSON.stringify(electionType)}`);
}

function ballotBasis(electoralSystem: unknown, historical: boolean): string {
  if (historical) return "candidate_marks";
  return String(electoralSystem) === "FPP" ? "candidate_marks" : "unknown";
}

export type NzInventory = {
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  intendedInventory: Record<string, unknown>;
  dataset: TrackedFile;
  readme?: TrackedFile;
  validate?: TrackedFile;
  tier: TrackedFile;
  payload: JsonObject;
  tierJson: JsonObject;
};

export function scanNzInventory(root: string): NzInventory {
  const pack = listContinuityTierPacks(root).find((row) => row.countryId === "new-zealand");
  if (!pack || pack.status !== "approved") {
    throw new Error("New Zealand tier pack is not approved");
  }
  const dataset = trackFile(root, NZ_DATASET_PATH, "package");
  const tier = trackFile(root, NZ_TIER_PATH, "tier_classification");
  const extras: TrackedFile[] = [];
  try {
    extras.push(trackFile(root, "data/countries/new-zealand/README.md", "package"));
  } catch {
    // optional
  }
  try {
    extras.push(trackFile(root, "data/countries/new-zealand/validate.mjs", "package"));
  } catch {
    // optional
  }
  const inputs: HashInputDescriptor[] = [dataset, ...extras, tier].map((item) => ({
    input_path: item.input_path,
    input_kind: item.input_kind,
    sha256: item.sha256,
    byte_count: item.byte_count,
  }));
  const hashInputs = buildContinuityHashInputs({
    lineageId: NZ_LINEAGE_ID,
    adapterVersion: NZ_ADAPTER_VERSION,
    inputs,
    overrides: [],
  });
  const fingerprint = continuityFingerprint(hashInputs);
  return {
    fingerprint,
    releaseId: continuityReleaseId(NZ_LINEAGE_ID, fingerprint),
    hashInputsJson: canonical(hashInputs),
    intendedInventory: {
      lineage_id: NZ_LINEAGE_ID,
      dataset: NZ_DATASET_PATH,
      tier: NZ_TIER_PATH,
    },
    dataset,
    readme: extras.find((item) => item.input_path.endsWith("README.md")),
    validate: extras.find((item) => item.input_path.endsWith("validate.mjs")),
    tier,
    payload: JSON.parse(dataset.text!) as JsonObject,
    tierJson: JSON.parse(tier.text!) as JsonObject,
  };
}

export function projectNz(inventory: NzInventory): ContinuityProjection {
  const L = NZ_LINEAGE_ID;
  const R = inventory.releaseId;
  const N = OFFICE_NAMESPACE;
  const data = inventory.payload;
  const sha = inventory.dataset.sha256;
  const src = inventory.dataset.input_path;

  const retainedInputs: SqlRow[] = [inventory.dataset, inventory.readme, inventory.validate, inventory.tier]
    .filter((item): item is TrackedFile => Boolean(item))
    .map((item) => ({
      lineage_id: L,
      release_id: R,
      input_path: item.input_path,
      input_kind: item.input_kind,
      sha256: item.sha256,
      byte_count: item.byte_count,
      recovery_locator: `sha256:${item.sha256}`,
      payload_json: item.input_path.endsWith(".json") ? item.text : null,
    }));

  const countries: SqlRow[] = [
    {
      country_id: "new-zealand",
      country_code: blankToNull(data.country_code) ?? "NZ",
      name: String(data.country ?? "New Zealand"),
      polity_kind: "sovereign_country",
      region_id: "oceania",
      coverage_status: "partial",
      screening_as_of_label: null,
      notes:
        "Initial local by-election research only. Not a complete national inventory. Multi-seat candidate marks are not unique voters.",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: origin(src, sha, ""), row: { schema_version: data.schema_version, coverage: data.coverage, conventions: data.conventions } }),
    },
  ];

  const geographies: SqlRow[] = [];
  const offices: SqlRow[] = [];
  const dates: SqlRow[] = [];
  const events: SqlRow[] = [];
  const sources: SqlRow[] = [];
  const results: SqlRow[] = [];
  const geoByOffice = new Map<string, string>();

  for (const [i, race] of asArray(data.races).entries()) {
    if (!isObj(race)) continue;
    const officeId = String(race.id);
    const authority = String(race.authority ?? "");
    const district = String(race.district ?? "");
    const geographyId = key("geo", ["new-zealand", authority, district]);
    geoByOffice.set(officeId, geographyId);
    geographies.push({
      country_id: "new-zealand",
      geography_id: geographyId,
      name: `${authority} / ${district}`,
      parent_geography_id: null,
      effective_from_label: null,
      effective_to_label: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: origin(src, sha, `/races/${i}`), row: { authority, district } }),
    });
    const electionDate = String(race.election_date);
    const parts = parseDay(electionDate);
    const nextEventId = key("next", officeId);
    const officeDateId = dateId("office", officeId, "next");
    const eventDateId = dateId("event", nextEventId, "ballot");
    const close = race.close_time_local ? `${electionDate} ${race.close_time_local} ${race.time_zone ?? ""}`.trim() : electionDate;
    dates.push(dateRow(officeDateId, electionDate, parts, "expected", src, sha, `/races/${i}/election_date`, L, R, race));
    dates.push(dateRow(eventDateId, close, parts, "expected", src, sha, `/races/${i}/election_date`, L, R, race));
    offices.push({
      id_namespace: N,
      office_id: officeId,
      country_id: "new-zealand",
      geography_id: geographyId,
      name: `${district.replaceAll("_", " ")} — ${String(race.office_type ?? "").replaceAll("_", " ")}`,
      office_type: String(race.office_type ?? "").replaceAll("_", " "),
      office_status: "current",
      record_state: "active",
      state_note: null,
      registry_qualified: null,
      next_date_id: officeDateId,
      next_date_resolution: "resolved",
      next_history_key: nextEventId,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: origin(src, sha, `/races/${i}`), row: race }),
    });
    events.push({
      id_namespace: N,
      office_id: officeId,
      history_key: nextEventId,
      event_id: nextEventId,
      date_id: eventDateId,
      date_resolution: "resolved",
      event_kind: eventKind(race.election_type),
      selected_history_role: "none",
      electoral_system: blankToNull(race.electoral_system),
      comparability: blankToNull(race.notes),
      ballot_basis: ballotBasis(race.electoral_system, false),
      share_unit: "percent_0_100",
      legal_outcome: "not_held",
      record_state: "active",
      state_note: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: origin(src, sha, `/races/${i}`), row: race }),
    });
  }

  for (const [i, history] of asArray(data.histories).entries()) {
    if (!isObj(history)) continue;
    const officeId = String(history.related_race_id);
    const eventId = String(history.id);
    const electionDate = String(history.election_date);
    const parts = parseDay(electionDate);
    const eventDateId = dateId("event", eventId, "ballot");
    dates.push(dateRow(eventDateId, electionDate, parts, "unknown", src, sha, `/histories/${i}/election_date`, L, R, history));
    events.push({
      id_namespace: N,
      office_id: officeId,
      history_key: eventId,
      event_id: eventId,
      date_id: eventDateId,
      date_resolution: "resolved",
      event_kind: eventKind(history.election_type),
      selected_history_role: "selected",
      electoral_system: blankToNull(history.electoral_system),
      comparability: blankToNull(history.evidence_status),
      ballot_basis: ballotBasis(history.vote_unit ?? history.electoral_system, true),
      share_unit: "percent_0_100",
      legal_outcome: "unknown",
      record_state: "active",
      state_note: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: origin(src, sha, `/histories/${i}`), row: { ...history, results: undefined } }),
    });
    for (const [j, result] of asArray(history.results).entries()) {
      if (!isObj(result)) continue;
      const votes = typeof result.votes === "number" ? result.votes : null;
      const share = typeof result.vote_share === "number" ? result.vote_share : null;
      results.push({
        id_namespace: N,
        office_id: officeId,
        history_key: eventId,
        result_row_id: String(result.id),
        proceeding_id: null,
        country_id: "new-zealand",
        candidate_or_list_label: blankToNull(result.name),
        original_party_label: blankToNull(result.affiliation),
        original_party_code: null,
        party_namespace: `new-zealand/${eventId}`,
        party_mapping_id: null,
        votes,
        votes_status: votes == null ? "unknown" : votes === 0 ? "zero" : "recorded",
        share,
        share_status: share == null ? "unknown" : share === 0 ? "zero" : "recorded",
        share_unit: "percent_0_100",
        seats: null,
        seats_status: "unknown",
        elected_flag: result.elected === true ? 1 : result.elected === false ? 0 : null,
        is_substitute: null,
        evidence_status: String(history.evidence_status ?? "unknown") === "official_final_table_reviewed" ? "recorded" : "unknown",
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({ origin: origin(src, sha, `/histories/${i}/results/${j}`), row: result }),
      });
    }
  }

  for (const [i, source] of asArray(data.sources).entries()) {
    if (!isObj(source)) continue;
    const bareId = String(source.id);
    sources.push({
      country_id: "new-zealand",
      source_namespace: L,
      source_id: `new-zealand--${bareId}`,
      publisher: blankToNull(source.publisher),
      title: blankToNull(source.title),
      url: blankToNull(source.url),
      checked_as_of_label: blankToNull(source.checked_on),
      evidence_grade: blankToNull(source.review_status),
      file_sha256: null,
      locator: null,
      data_rights: "unknown",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: origin(src, sha, `/sources/${i}`), row: source }),
    });
  }

  const classifications = asArray(inventory.tierJson.classifications);
  if (classifications.length !== offices.length) {
    throw new Error(`NZ tier/office mismatch ${classifications.length}/${offices.length}`);
  }
  const tiers: SqlRow[] = classifications.map((row, i) => {
    if (!isObj(row)) throw new Error("Invalid NZ classification");
    const mapped = mapNzTier(String(row.tier));
    const needsReview = Boolean(row.human_review_required || row.tier_uncertain);
    return {
      id_namespace: N,
      office_id: String(row.office_id),
      tier: mapped,
      review_status: mapped == null ? "unknown" : inventory.tierJson.status === "approved" && !needsReview ? "approved" : "needs_review",
      rationale: String(row.rationale),
      lineage_id: L,
      release_id: R,
      classification_path: NZ_TIER_PATH,
      classification_kind: "tier_classification",
      classification_sha256: inventory.tier.sha256,
      raw_json: rawEnvelope({
        origin: origin(NZ_TIER_PATH, inventory.tier.sha256, `/classifications/${i}`),
        row,
      }),
    };
  });

  const evidenceStatusOk = (status: unknown) =>
    ["recorded", "zero", "unknown", "not_applicable", "structurally_unavailable", "preliminary", "disputed", "superseded"].includes(
      String(status),
    );
  for (const row of results) {
    if (!evidenceStatusOk(row.evidence_status)) row.evidence_status = "unknown";
  }

  const validatedCounts = {
    offices: offices.length,
    geographies: geographies.length,
    events: events.length,
    result_rows: results.length,
    sources: sources.length,
    prospective_events: events.filter((row) => row.selected_history_role === "none").length,
    historical_events: events.filter((row) => row.selected_history_role === "selected").length,
    proceedings: 0,
    party_mappings: 0,
  };

  return {
    lineageId: L,
    lineage: {
      lineage_id: L,
      provenance_kind: "country_package",
      description: "New Zealand continuity input",
    },
    release: {
      lineage_id: L,
      release_id: R,
      fingerprint_sha256: inventory.fingerprint,
      hash_inputs_json: inventory.hashInputsJson,
      adapter_version: NZ_ADAPTER_VERSION,
      method_version: JSON.parse(inventory.hashInputsJson).method_version,
      schema_version: "atlas-master/1",
      research_snapshot_label: String(data.snapshot_date ?? "2026-09-15"),
      upstream_release_id: L,
      validated_counts_json: canonical(validatedCounts),
      research_coverage_complete: 0,
      raw_json: rawEnvelope({
        origin: origin(src, sha, ""),
        row: {
          schema_version: data.schema_version,
          coverage: data.coverage,
          site_ingestion_status: data.site_ingestion_status,
        },
      }),
    },
    publicationRelease: { lineage_id: L, release_id: R },
    retainedInputs,
    countries,
    geographies,
    offices,
    tiers,
    dates,
    events,
    proceedings: [],
    sources,
    results,
    locators: [],
    evidence: [],
    unresolved: [],
    crosswalks: [],
    validatedCounts,
    skippedDraftCountries: [],
  };
}

function blankToNull(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value);
  return text === "" ? null : text;
}

function dateRow(
  dateIdValue: string,
  label: string,
  parts: { year: number; month: number; day: number },
  certainty: string,
  src: string,
  sha: string,
  pointer: string,
  lineageId: string,
  releaseId: string,
  row: unknown,
): SqlRow {
  return {
    date_id: dateIdValue,
    label,
    precision: "day",
    certainty,
    year: parts.year,
    month: parts.month,
    day: parts.day,
    range_start_id: null,
    range_end_id: null,
    lineage_id: lineageId,
    release_id: releaseId,
    raw_json: rawEnvelope({ origin: origin(src, sha, pointer), row }),
  };
}

export function assertNzFidelity(db: DatabaseSync): void {
  const offices = countRows(db, "office", "lineage_id = ?", [NZ_LINEAGE_ID]);
  const events = countRows(db, "election_event", "lineage_id = ?", [NZ_LINEAGE_ID]);
  const results = countRows(db, "result_row", "lineage_id = ?", [NZ_LINEAGE_ID]);
  if (offices !== 4) throw new Error(`NZ offices ${offices}`);
  if (events !== 7) throw new Error(`NZ events ${events}`);
  if (results !== 36) throw new Error(`NZ results ${results}`);
  const buller = db
    .prepare("SELECT event_id FROM election_event WHERE lineage_id = ? AND office_id = ? AND selected_history_role = 'none'")
    .get(NZ_LINEAGE_ID, "NZ-BULLER-WESTPORT-2026");
  if (String(buller?.event_id) !== "next-154f7bfa6ea99d09c5a47d7c") {
    throw new Error(`NZ Buller next event ${String(buller?.event_id)}`);
  }
}

export function importNewZealand(options: ContinuityImportOptions): ContinuityImportResult {
  let inventory: NzInventory | null = null;
  return runContinuityImport({
    options,
    lineageId: NZ_LINEAGE_ID,
    scriptVersion: "atlas-continuity-import/1.0.0",
    scan: () => {
      inventory = scanNzInventory(options.root);
      return {
        fingerprint: inventory.fingerprint,
        releaseId: inventory.releaseId,
        intendedInventory: inventory.intendedInventory,
      };
    },
    project: () => {
      if (!inventory) throw new Error("NZ inventory missing");
      return projectNz(inventory);
    },
    assertFidelity: (db) => assertNzFidelity(db),
  });
}
