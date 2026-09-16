import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import type { DatabaseSync } from "node:sqlite";
import {
  ATTEMPT_LOG_SCHEMA_PATH,
  ATTEMPT_LOG_SHA256,
  MASTER_SCHEMA_PATH,
  MASTER_SCHEMA_SHA256,
  OFFICE_NAMESPACE,
  canonical,
  dateId,
  locator,
  rawEnvelope,
  type HashInputDescriptor,
} from "../identity";
import { countRows } from "../sqlite";
import { approvedCountryIds, draftContinuityPacks, listContinuityTierPacks } from "./approved";
import { buildContinuityHashInputs, continuityFingerprint, continuityReleaseId } from "./hash";
import { runContinuityImport, type ContinuityImportOptions, type ContinuityImportResult } from "./run";
import type { ContinuityProjection, SqlRow, TrackedFile } from "./types";

export const LATAM_LINEAGE_ID = "latin-america-fe5e91689def";
export const LATAM_ADAPTER_VERSION = "atlas-latam-continuity/1";
export const MEXICO_OVERRIDE_PATH = "data/overrides/atlas/latin-america-fe5e91689def/mexico-share-domain.json";

type JsonObject = Record<string, unknown>;

function isObj(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function blankToNull(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value !== "string") return String(value);
  return value === "" ? null : value;
}

function trackFile(root: string, rel: string, kind: TrackedFile["input_kind"], storeText: boolean): TrackedFile {
  const absPath = path.join(root, rel);
  const bytes = readFileSync(absPath);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  let text: string | null = null;
  if (storeText) {
    text = rel.endsWith(".gz") ? gunzipSync(bytes).toString("utf8") : bytes.toString("utf8");
  }
  return {
    absPath,
    input_path: rel,
    input_kind: kind,
    sha256,
    byte_count: bytes.length,
    text,
  };
}

function parseGz(file: TrackedFile): JsonObject {
  const bytes = readFileSync(file.absPath);
  return JSON.parse(gunzipSync(bytes).toString("utf8")) as JsonObject;
}

function parseJson(file: TrackedFile): JsonObject {
  return JSON.parse(file.text ?? readFileSync(file.absPath, "utf8")) as JsonObject;
}

function mapTier(raw: string): string | null {
  if (raw === "municipal") return "municipal";
  if (raw === "regional") return "regional";
  if (raw === "other") return "other";
  if (raw === "national") return "national_context";
  if (raw === "unknown") return null;
  throw new Error(`Unsupported classification tier ${JSON.stringify(raw)}`);
}

function numericPair(value: unknown): { value: number | null; status: string } {
  if (!isObj(value)) return { value: null, status: "unknown" };
  const status = typeof value.status === "string" ? value.status : "unknown";
  if (value.value == null) return { value: null, status };
  if (typeof value.value !== "number" || !Number.isFinite(value.value)) {
    throw new Error(`Non-finite numeric pair ${JSON.stringify(value)}`);
  }
  return { value: value.value, status };
}

function sameNumber(actual: unknown, expected: unknown): boolean {
  if (actual == null && expected == null) return true;
  if (typeof actual === "number" && typeof expected === "number") return Object.is(actual, expected);
  return actual === expected;
}

function fileHashOrNull(value: unknown): string | null {
  if (typeof value !== "string" || value.length !== 64) return null;
  if (/[^0-9a-f]/.test(value)) return null;
  return value;
}

function partyLabel(row: JsonObject): string | null {
  const ext = isObj(row.extensions) && isObj(row.extensions.raw) ? row.extensions.raw : null;
  const rawParty = ext && typeof ext.party === "string" ? ext.party : null;
  if (rawParty && rawParty !== "") return rawParty;
  const label = typeof row.party_label === "string" ? row.party_label : null;
  return label && label !== "" ? label : null;
}

function substituteFlag(row: JsonObject): number | null {
  const ext = isObj(row.extensions) && isObj(row.extensions.raw) ? row.extensions.raw : null;
  if (ext && typeof ext.substitute === "boolean") return ext.substitute ? 1 : 0;
  return null;
}

function origin(inputPath: string, sha256: string, pointer: string) {
  return locator({ input_path: inputPath, sha256, json_pointer: pointer });
}

export type LatAmInventory = {
  root: string;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  intendedInventory: Record<string, unknown>;
  approvedCountries: string[];
  skippedDraftCountries: string[];
  tracked: TrackedFile[];
  byPath: Map<string, TrackedFile>;
  manifest: JsonObject;
  base: JsonObject;
  shards: Map<string, { file: TrackedFile; data: JsonObject }>;
  tiers: Map<string, { file: TrackedFile; data: JsonObject }>;
  override: TrackedFile;
};

export function scanLatAmInventory(root: string): LatAmInventory {
  const researchDir = path.join(root, "data/research");
  const manifestPath = path.join(researchDir, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error("data/research/manifest.json is required for LatAm continuity import");
  }
  const manifestFile = trackFile(root, "data/research/manifest.json", "package", true);
  const manifest = parseJson(manifestFile);
  const approved = [...approvedCountryIds(root, LATAM_LINEAGE_ID)].sort();
  if (approved.length === 0) {
    throw new Error("No approved LatAm tier packs; refusing empty lineage import");
  }
  const skipped = draftContinuityPacks(root)
    .filter((pack) => pack.lineageId === LATAM_LINEAGE_ID)
    .map((pack) => pack.countryId)
    .sort();

  const tracked: TrackedFile[] = [manifestFile];
  const baseRel = "data/research/base.json.gz";
  const baseFile = trackFile(root, baseRel, "package", false);
  const expectedBase = String(manifest.baseSha256 ?? "");
  if (expectedBase && baseFile.sha256 !== expectedBase) {
    throw new Error(`base.json.gz checksum mismatch`);
  }
  tracked.push(baseFile);

  const legacyRel = "data/research/legacy-links.json";
  if (existsSync(path.join(root, legacyRel))) {
    tracked.push(trackFile(root, legacyRel, "package", false));
  }

  const countryFiles = asArray(manifest.countryFiles);
  const shards = new Map<string, { file: TrackedFile; data: JsonObject }>();
  for (const entry of countryFiles) {
    if (!isObj(entry) || typeof entry.path !== "string") continue;
    const slug = path.basename(entry.path, ".json.gz");
    if (!approved.includes(slug)) continue;
    const rel = `data/research/${entry.path}`;
    const file = trackFile(root, rel, "package", false);
    if (typeof entry.sha256 === "string" && file.sha256 !== entry.sha256) {
      throw new Error(`Checksum mismatch ${rel}`);
    }
    tracked.push(file);
    shards.set(slug, { file, data: parseGz(file) });
  }
  for (const countryId of approved) {
    if (!shards.has(countryId)) {
      throw new Error(`Approved LatAm pack ${countryId} has no research shard`);
    }
  }

  const briefingFiles = asArray(manifest.briefingFiles);
  for (const entry of briefingFiles) {
    if (!isObj(entry) || typeof entry.path !== "string") continue;
    const slug = path.basename(entry.path, ".json.gz");
    if (!approved.includes(slug)) continue;
    const rel = `data/research/${entry.path}`;
    if (!existsSync(path.join(root, rel))) continue;
    tracked.push(trackFile(root, rel, "artifact", false));
  }

  const tiers = new Map<string, { file: TrackedFile; data: JsonObject }>();
  for (const pack of listContinuityTierPacks(root).filter((row) => row.lineageId === LATAM_LINEAGE_ID && row.status === "approved")) {
    const file = trackFile(root, pack.path, "tier_classification", true);
    const data = parseJson(file);
    if (data.status !== "approved") {
      throw new Error(`${pack.path} is not approved`);
    }
    tracked.push(file);
    tiers.set(pack.countryId, { file, data });
  }

  if (!existsSync(path.join(root, MEXICO_OVERRIDE_PATH))) {
    throw new Error(`Missing accepted Mexico override ${MEXICO_OVERRIDE_PATH}`);
  }
  const override = trackFile(root, MEXICO_OVERRIDE_PATH, "override", true);
  const overrideJson = parseJson(override);
  if (overrideJson.production_accepted !== true || overrideJson.executable_override !== true) {
    throw new Error("Mexico override is not executable/accepted");
  }

  const inputs: HashInputDescriptor[] = tracked.map((item) => ({
    input_path: item.input_path,
    input_kind: item.input_kind,
    sha256: item.sha256,
    byte_count: item.byte_count,
  }));
  const hashInputs = buildContinuityHashInputs({
    lineageId: LATAM_LINEAGE_ID,
    adapterVersion: LATAM_ADAPTER_VERSION,
    inputs,
    overrides: [
      {
        input_path: override.input_path,
        input_kind: "override",
        sha256: override.sha256,
        byte_count: override.byte_count,
      },
    ],
  });
  const fingerprint = continuityFingerprint(hashInputs);
  const byPath = new Map(tracked.concat(override).map((item) => [item.input_path, item]));

  return {
    root,
    fingerprint,
    releaseId: continuityReleaseId(LATAM_LINEAGE_ID, fingerprint),
    hashInputsJson: canonical(hashInputs),
    intendedInventory: {
      lineage_id: LATAM_LINEAGE_ID,
      approved_countries: approved,
      skipped_draft_countries: skipped,
      override_path: MEXICO_OVERRIDE_PATH,
      schema_inputs: [
        { input_path: ATTEMPT_LOG_SCHEMA_PATH, sha256: ATTEMPT_LOG_SHA256 },
        { input_path: MASTER_SCHEMA_PATH, sha256: MASTER_SCHEMA_SHA256 },
      ],
    },
    approvedCountries: approved,
    skippedDraftCountries: skipped,
    tracked: tracked.concat(override),
    byPath,
    manifest,
    base: parseGz(baseFile),
    shards,
    tiers,
    override,
  };
}

export function projectLatAm(inventory: LatAmInventory): ContinuityProjection {
  const L = LATAM_LINEAGE_ID;
  const R = inventory.releaseId;
  const N = OFFICE_NAMESPACE;

  const retainedInputs: SqlRow[] = inventory.tracked.map((item) => ({
    lineage_id: L,
    release_id: R,
    input_path: item.input_path,
    input_kind: item.input_kind,
    sha256: item.sha256,
    byte_count: item.byte_count,
    recovery_locator: `sha256:${item.sha256}`,
    payload_json: item.input_kind === "tier_classification" || item.input_kind === "override" || item.input_path.endsWith("manifest.json")
      ? item.text
      : null,
  }));

  const countries: SqlRow[] = [];
  const countrySeen = new Set<string>();
  const addCountry = (row: JsonObject, inputPath: string, sha256: string, pointer: string) => {
    const countryId = String(row.id ?? "");
    if (!countryId || countrySeen.has(countryId)) return;
    countrySeen.add(countryId);
    const screening = isObj(row.screening) ? row.screening : null;
    countries.push({
      country_id: countryId,
      country_code: null,
      name: isObj(row.names) ? String(row.names.official ?? countryId) : countryId,
      polity_kind: row.kind === "territory" ? "territory" : "sovereign_country",
      region_id: String(row.regionId ?? "americas"),
      coverage_status: String(row.coverageStatus ?? "partial"),
      screening_as_of_label: screening && typeof screening.asOfLabel === "string" ? screening.asOfLabel : null,
      notes: blankToNull(row.notes),
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: origin(inputPath, sha256, pointer), row }),
    });
  };

  for (const [i, row] of asArray(inventory.base.countries).entries()) {
    if (!isObj(row)) continue;
    addCountry(row, "data/research/base.json.gz", inventory.byPath.get("data/research/base.json.gz")!.sha256, `/countries/${i}`);
  }
  for (const countryId of inventory.approvedCountries) {
    const shard = inventory.shards.get(countryId)!;
    for (const [i, row] of asArray(shard.data.countries).entries()) {
      if (!isObj(row)) continue;
      addCountry(row, shard.file.input_path, shard.file.sha256, `/countries/${i}`);
    }
  }

  const geographies: SqlRow[] = [];
  const offices: SqlRow[] = [];
  const dates: SqlRow[] = [];
  const events: SqlRow[] = [];
  const proceedings: SqlRow[] = [];
  const sources: SqlRow[] = [];
  const results: SqlRow[] = [];
  const eventByPublicId = new Map<string, { officeId: string; historyKey: string }>();

  const pushDate = (args: {
    dateId: string;
    raw: JsonObject | null;
    fallbackLabel: string;
    originPath: string;
    sha256: string;
    pointer: string;
  }) => {
    const raw = args.raw ?? {};
    const precision = String(raw.precision ?? "unknown");
    const certainty = String(raw.certainty ?? "unknown");
    const label = String(raw.label ?? args.fallbackLabel);
    dates.push({
      date_id: args.dateId,
      label,
      precision,
      certainty,
      year: precision === "unknown" || precision === "range" ? null : raw.year ?? null,
      month: precision === "day" || precision === "month" ? raw.month ?? null : null,
      day: precision === "day" ? raw.day ?? null : null,
      range_start_id: null,
      range_end_id: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: origin(args.originPath, args.sha256, args.pointer), row: raw }),
    });
    return precision === "unknown" ? "unknown" : "resolved";
  };

  for (const countryId of inventory.approvedCountries) {
    const shard = inventory.shards.get(countryId)!;
    const srcPath = shard.file.input_path;
    const sha = shard.file.sha256;
    for (const [i, row] of asArray(shard.data.geographies).entries()) {
      if (!isObj(row)) continue;
      geographies.push({
        country_id: String(row.countryId ?? countryId),
        geography_id: String(row.id),
        name: isObj(row.names) ? String(row.names.official ?? row.id) : String(row.id),
        parent_geography_id: row.parentId == null ? null : String(row.parentId),
        effective_from_label: null,
        effective_to_label: null,
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({ origin: origin(srcPath, sha, `/geographies/${i}`), row }),
      });
    }

    for (const [i, row] of asArray(shard.data.offices).entries()) {
      if (!isObj(row)) continue;
      const officeId = String(row.id);
      const next = isObj(row.nextElection) ? row.nextElection : null;
      const nextDate = next && isObj(next.date) ? next.date : null;
      let nextDateId: string | null = null;
      let nextResolution = "unknown";
      let nextHistoryKey: string | null = null;
      if (nextDate) {
        nextDateId = dateId("office", officeId, "next");
        nextResolution = pushDate({
          dateId: nextDateId,
          raw: nextDate,
          fallbackLabel: String(nextDate.label ?? ""),
          originPath: srcPath,
          sha256: sha,
          pointer: `/offices/${i}/nextElection/date`,
        });
        nextHistoryKey = typeof next.eventId === "string" ? next.eventId : null;
      }
      offices.push({
        id_namespace: N,
        office_id: officeId,
        country_id: String(row.countryId ?? countryId),
        geography_id: String(row.geographyId),
        name: isObj(row.names) ? String(row.names.official ?? officeId) : officeId,
        office_type: String(row.officeType ?? "unknown"),
        office_status: row.status === "historical" ? "historical" : "current",
        record_state: "active",
        state_note: null,
        registry_qualified: row.registryQualified === true ? 1 : row.registryQualified === false ? 0 : null,
        next_date_id: nextDateId,
        next_date_resolution: nextResolution,
        next_history_key: nextHistoryKey,
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({ origin: origin(srcPath, sha, `/offices/${i}`), row }),
      });
    }

    for (const [i, row] of asArray(shard.data.events).entries()) {
      if (!isObj(row)) continue;
      const officeId = String(row.officeId);
      const historyKey = String(row.historyKey);
      const eventId = String(row.id);
      const dateRaw = isObj(row.date) ? row.date : {};
      const eventDateId = dateId("event", eventId, "ballot");
      const dateResolution = pushDate({
        dateId: eventDateId,
        raw: dateRaw,
        fallbackLabel: String(dateRaw.label ?? eventId),
        originPath: srcPath,
        sha256: sha,
        pointer: `/events/${i}/date`,
      });
      eventByPublicId.set(eventId, { officeId, historyKey });
      events.push({
        id_namespace: N,
        office_id: officeId,
        history_key: historyKey,
        event_id: eventId,
        date_id: eventDateId,
        date_resolution: dateResolution,
        event_kind: String(row.kind ?? "unknown"),
        selected_history_role: String(row.selectedHistoryRole ?? "selected"),
        electoral_system: blankToNull(row.electoralSystem),
        comparability: blankToNull(row.comparability),
        ballot_basis: String(row.ballotBasis ?? "unknown"),
        share_unit: String(row.voteShareUnit ?? "percent_0_100"),
        legal_outcome: String(row.legalOutcome ?? "unknown"),
        record_state: "active",
        state_note: null,
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({ origin: origin(srcPath, sha, `/events/${i}`), row: { ...row, resultRows: undefined } }),
      });
      for (const [j, result] of asArray(row.resultRows).entries()) {
        if (!isObj(result)) continue;
        const votes = numericPair(result.votes);
        const share = numericPair(result.share);
        const seats = numericPair(result.seats);
        results.push({
          id_namespace: N,
          office_id: officeId,
          history_key: historyKey,
          result_row_id: String(result.id),
          proceeding_id: null,
          country_id: String(row.countryId ?? countryId),
          candidate_or_list_label: blankToNull(result.label),
          original_party_label: partyLabel(result),
          original_party_code: blankToNull(result.partyCode),
          party_namespace: blankToNull(result.partyNamespace),
          party_mapping_id: null,
          votes: votes.value,
          votes_status: votes.status,
          share: share.value,
          share_status: share.status,
          share_unit: String(result.shareUnit ?? row.voteShareUnit ?? "percent_0_100"),
          seats: seats.value,
          seats_status: seats.status,
          elected_flag: result.electedFlag === true ? 1 : result.electedFlag === false ? 0 : null,
          is_substitute: substituteFlag(result),
          evidence_status: String(result.evidenceStatus ?? "unknown"),
          lineage_id: L,
          release_id: R,
          raw_json: rawEnvelope({ origin: origin(srcPath, sha, `/events/${i}/resultRows/${j}`), row: result }),
        });
      }
    }

    for (const [i, row] of asArray(shard.data.proceedings).entries()) {
      if (!isObj(row)) continue;
      const parent = eventByPublicId.get(String(row.eventId));
      if (!parent) continue;
      proceedings.push({
        id_namespace: N,
        office_id: parent.officeId,
        history_key: parent.historyKey,
        proceeding_id: String(row.id),
        kind: String(row.kind),
        sequence_no: typeof row.round === "number" ? row.round : null,
        supersedes_id: row.supersedesId == null ? null : String(row.supersedesId),
        legal_outcome: String(row.legalOutcome ?? "unknown"),
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({ origin: origin(srcPath, sha, `/proceedings/${i}`), row }),
      });
    }

    for (const [i, row] of asArray(shard.data.sources).entries()) {
      if (!isObj(row)) continue;
      sources.push({
        country_id: countryId,
        source_namespace: L,
        source_id: String(row.id),
        publisher: blankToNull(row.publisher),
        title: blankToNull(row.title),
        url: blankToNull(row.url),
        checked_as_of_label: blankToNull(row.datesLabel),
        evidence_grade: blankToNull(row.quality ?? row.grade ?? row.type),
        file_sha256: fileHashOrNull(row.fileHash),
        locator: blankToNull(row.locator),
        data_rights: String(row.dataRights ?? "unknown"),
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({ origin: origin(srcPath, sha, `/sources/${i}`), row }),
      });
    }
  }

  for (const [i, row] of asArray(inventory.base.sources).entries()) {
    if (!isObj(row)) continue;
    const sourceId = String(row.id);
    const countryId = sourceId.includes("--") ? sourceId.split("--")[0]! : String(asArray(row.supportedRecordIds)[0] ?? "");
    if (!countryId || !countrySeen.has(countryId)) continue;
    sources.push({
      country_id: countryId,
      source_namespace: L,
      source_id: sourceId,
      publisher: blankToNull(row.publisher),
      title: blankToNull(row.title),
      url: blankToNull(row.url),
      checked_as_of_label: blankToNull(row.datesLabel),
      evidence_grade: blankToNull(row.quality ?? row.grade ?? row.type),
      file_sha256: fileHashOrNull(row.fileHash),
      locator: blankToNull(row.locator),
      data_rights: String(row.dataRights ?? "unknown"),
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: origin("data/research/base.json.gz", inventory.byPath.get("data/research/base.json.gz")!.sha256, `/sources/${i}`),
        row,
      }),
    });
  }

  const historyByEventId = new Map(events.map((row) => [String(row.event_id), String(row.history_key)]));
  for (const office of offices) {
    if (office.next_history_key) {
      office.next_history_key =
        historyByEventId.get(String(office.next_history_key)) ?? office.next_history_key;
    }
  }

  applyMexicoOverride(results, parseJson(inventory.override));

  const tiers: SqlRow[] = [];
  const officeIds = new Set(offices.map((row) => String(row.office_id)));
  for (const countryId of inventory.approvedCountries) {
    const pack = inventory.tiers.get(countryId);
    if (!pack) throw new Error(`Missing approved tier file for ${countryId}`);
    const classifications = asArray(pack.data.classifications);
    for (const [i, row] of classifications.entries()) {
      if (!isObj(row)) continue;
      const officeId = String(row.office_id);
      if (!officeIds.has(officeId)) {
        throw new Error(`Tier ${countryId} references missing office ${officeId}`);
      }
      const mapped = mapTier(String(row.tier));
      const needsReview = Boolean(row.human_review_required || row.tier_uncertain);
      const reviewStatus =
        mapped == null ? "unknown" : pack.data.status === "approved" && !needsReview ? "approved" : "needs_review";
      tiers.push({
        id_namespace: N,
        office_id: officeId,
        tier: mapped,
        review_status: reviewStatus,
        rationale: String(row.rationale),
        lineage_id: L,
        release_id: R,
        classification_path: pack.file.input_path,
        classification_kind: "tier_classification",
        classification_sha256: pack.file.sha256,
        raw_json: rawEnvelope({
          origin: origin(pack.file.input_path, pack.file.sha256, `/classifications/${i}`),
          row,
        }),
      });
    }
  }
  if (tiers.length !== offices.length) {
    throw new Error(`Tier/office count mismatch ${tiers.length}/${offices.length}`);
  }

  const geoIds = new Set(geographies.map((row) => `${row.country_id}::${row.geography_id}`));
  for (const office of offices) {
    if (!geoIds.has(`${office.country_id}::${office.geography_id}`)) {
      throw new Error(`Office ${office.office_id} geography ${office.geography_id} is missing`);
    }
  }
  for (const geo of geographies) {
    if (geo.parent_geography_id && !geoIds.has(`${geo.country_id}::${geo.parent_geography_id}`)) {
      geo.parent_geography_id = null;
    }
  }

  const validatedCounts = {
    current_offices: offices.filter((row) => row.office_status === "current").length,
    historical_offices: offices.filter((row) => row.office_status === "historical").length,
    offices: offices.length,
    geographies: geographies.length,
    countries: countries.length,
    events: events.length,
    selected_histories: events.filter((row) => row.selected_history_role === "selected").length,
    other_histories: events.filter((row) => row.selected_history_role === "other").length,
    none_histories: events.filter((row) => row.selected_history_role === "none").length,
    result_rows: results.length,
    proceedings: proceedings.length,
    sources: sources.length,
    municipal_offices: tiers.filter((row) => row.tier === "municipal").length,
    regional_offices: tiers.filter((row) => row.tier === "regional").length,
    withheld_mexico_share_rows: results.filter((row) => row.share == null && String(row.result_row_id).startsWith("event-") && row.share_status === "unknown").length,
    skipped_draft_countries: inventory.skippedDraftCountries.length,
    approved_countries: inventory.approvedCountries.length,
    party_mappings: 0,
  };

  const releaseMeta = isObj(inventory.manifest.release) ? inventory.manifest.release : {};
  return {
    lineageId: L,
    lineage: {
      lineage_id: L,
      provenance_kind: "latin_america_release",
      description: "Latin America continuity input (approved packs only)",
    },
    release: {
      lineage_id: L,
      release_id: R,
      fingerprint_sha256: inventory.fingerprint,
      hash_inputs_json: inventory.hashInputsJson,
      adapter_version: LATAM_ADAPTER_VERSION,
      method_version: JSON.parse(inventory.hashInputsJson).method_version,
      schema_version: "atlas-master/1",
      research_snapshot_label: String(releaseMeta.snapshotLabel ?? "2026-09-13"),
      upstream_release_id: L,
      validated_counts_json: canonical(validatedCounts),
      research_coverage_complete: 0,
      raw_json: rawEnvelope({
        origin: origin("data/research/manifest.json", inventory.byPath.get("data/research/manifest.json")!.sha256, ""),
        row: inventory.manifest,
        supplemental: { approved_countries: inventory.approvedCountries, skipped_draft_countries: inventory.skippedDraftCountries },
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
    proceedings,
    sources,
    results,
    locators: [],
    evidence: [],
    unresolved: [],
    crosswalks: [],
    validatedCounts,
    skippedDraftCountries: inventory.skippedDraftCountries,
  };
}

function applyMexicoOverride(results: SqlRow[], override: JsonObject): void {
  const byId = new Map(results.map((row) => [String(row.result_row_id), row]));
  let applied = 0;
  for (const change of asArray(override.changes)) {
    if (!isObj(change)) continue;
    if (change.target_table !== "result_row") {
      throw new Error(`Unexpected override target ${String(change.target_table)}`);
    }
    const key = isObj(change.target_key) ? change.target_key : {};
    const row = byId.get(String(key.result_row_id));
    if (!row) {
      throw new Error(`Mexico override target missing: ${String(key.result_row_id)}`);
    }
    const field = String(change.field);
    if (!sameNumber(row[field], change.expected_original) && row[field] !== change.expected_original) {
      throw new Error(
        `Mexico override expected_original mismatch for ${String(key.result_row_id)}.${field}: got ${JSON.stringify(row[field])} expected ${JSON.stringify(change.expected_original)}`,
      );
    }
    row[field] = change.replacement === undefined ? null : change.replacement;
    applied += 1;
  }
  if (applied !== 201) {
    throw new Error(`Expected 201 Mexico override changes, applied ${applied}`);
  }
}

export function assertLatAmFidelity(db: DatabaseSync, projection?: ContinuityProjection): void {
  const offices = countRows(db, "office", "lineage_id = ?", [LATAM_LINEAGE_ID]);
  if (projection && offices !== projection.offices.length) {
    throw new Error(`LatAm office count ${offices} != ${projection.offices.length}`);
  }
  const skipped = projection?.skippedDraftCountries ?? [];
  if (skipped.length) {
    const placeholders = skipped.map(() => "?").join(", ");
    const found = db
      .prepare(`SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND country_id IN (${placeholders})`)
      .get(LATAM_LINEAGE_ID, ...skipped);
    if (Number(found?.n ?? 0) !== 0) {
      throw new Error("Draft-pack offices were imported");
    }
  }
  const mexicoWithheld = db
    .prepare(
      `SELECT COUNT(*) AS n FROM result_row
       WHERE lineage_id = ? AND country_id = 'mexico' AND share IS NULL AND share_status = 'unknown' AND evidence_status = 'disputed'`,
    )
    .get(LATAM_LINEAGE_ID);
  if (Number(mexicoWithheld?.n ?? 0) < 67) {
    throw new Error(`Mexico withhold rows ${String(mexicoWithheld?.n)} < 67`);
  }
  const overCap = db
    .prepare(
      `SELECT COUNT(*) AS n FROM result_row
       WHERE lineage_id = ? AND country_id = 'mexico' AND share IS NOT NULL AND share > 100`,
    )
    .get(LATAM_LINEAGE_ID);
  if (Number(overCap?.n ?? 0) !== 0) {
    throw new Error("Mexico share>100 rows survived withhold");
  }
}

export function importLatAm(options: ContinuityImportOptions): ContinuityImportResult {
  let inventory: LatAmInventory | null = null;
  return runContinuityImport({
    options,
    lineageId: LATAM_LINEAGE_ID,
    scriptVersion: "atlas-continuity-import/1.0.0",
    scan: () => {
      inventory = scanLatAmInventory(options.root);
      return {
        fingerprint: inventory.fingerprint,
        releaseId: inventory.releaseId,
        intendedInventory: inventory.intendedInventory,
      };
    },
    project: () => {
      if (!inventory) throw new Error("LatAm inventory missing");
      return projectLatAm(inventory);
    },
    assertFidelity: (db, projection) => assertLatAmFidelity(db, projection),
  });
}
