import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  ATTEMPT_LOG_SCHEMA_PATH,
  ATTEMPT_LOG_SHA256,
  MASTER_SCHEMA_PATH,
  MASTER_SCHEMA_SHA256,
} from "../identity";
import { ATLAS_ATTEMPT_LOG_FILENAME, ATLAS_MASTER_FILENAME, ATLAS_MIGRATIONS_DIR } from "../migrations";
import {
  ADAPTER_VERSION,
  ASSEMBLY_ID,
  COUNTS_RELATIVE,
  COUNTRY_ID,
  COUNTRY_NAME,
  CROSSWALK_RELATIVE,
  CURRENT_NAMESPACE,
  DOCS_PREFIX,
  DRAFT_TIERS_RELATIVE,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  FULL_PACK_DOCUMENTED_EVENTS,
  FULL_PACK_DOCUMENTED_RESEARCH_DATES,
  FULL_PACK_DOCUMENTED_RESULTS,
  FULL_PACK_DOCUMENTED_SOURCE_EXTRACTS,
  GAP_FILE_ORDER,
  GAP_IDS,
  GAP_STATUS,
  LINEAGE_ID,
  LOCAL_AGGREGATES_RELATIVE,
  METADATA_RELATIVE,
  METHOD_VERSION,
  OFFICE_REGISTER_RELATIVE,
  OMITTED_RESEARCH_DIR,
  PINNED_INPUTS,
  PRESIDENT_ID,
  RESEARCH_DATES_RELATIVE,
  RESEARCH_GAPS_RELATIVE,
  RESULTS_RELATIVE,
  SCHEMA_VERSION,
  SOURCE_INVENTORY_RELATIVE,
  STATUS_CHANGE_EDGES,
  TIER_PATH,
  TIER_SHA256,
  VOJVODINA_ID,
  assertAllowedOfficeIdentity,
  assertKnownRegisterKeys,
  buildHashInputs,
  canonical,
  fingerprintSha256,
  geographyIdForSuppliedName,
  geographyIdForUnnamedOffice,
  inputKindFor,
  releaseIdFor,
  sha256Hex,
  type HashInputDescriptor,
  type SerbiaDraftTier,
  type SerbiaRegisterStatus,
} from "./identity";

export type TrackedInput = HashInputDescriptor & { absPath: string };

export type SerbiaTierOffice = {
  office_id: string;
  tier: SerbiaDraftTier;
  review_status: string;
  justin_approved: boolean;
  rationale: string;
};

export type SerbiaRegisterOffice = {
  office_id: string;
  id_namespace: string;
  country_id: string;
  name: string;
  geography_name: string | null;
  geography_id: string;
  geography_name_supplied: boolean;
  parent_geography: string | null;
  statistical_region: string | null;
  office_type: string;
  office_status: SerbiaRegisterStatus;
  scope: string;
  draft_tier: SerbiaDraftTier;
  selection_mode: string;
  direct_executive: boolean;
  source_ids: string[];
  state_note: string;
  register_index: number;
};

export type SerbiaGeography = {
  geography_id: string;
  name: string;
  country_id: string;
  geography_index: number;
  supplied: boolean;
};

export type SerbiaGap = { gap_id: string; topic: string; status: string; detail: string };

export type SerbiaStatusChange = {
  predecessor_office_id: string;
  successor_office_id: string;
  relationship: string;
  effective_label: string;
  source_id: string;
  boundary_change_claim: false;
  note: string;
  crosswalk_index: number;
};

export type SerbiaInventory = {
  root: string;
  tierPath: string;
  gitCommit: string | null;
  tracked: TrackedInput[];
  byPath: Map<string, TrackedInput>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  hashInputs: ReturnType<typeof buildHashInputs>;
  tiers: SerbiaTierOffice[];
  offices: SerbiaRegisterOffice[];
  geographies: SerbiaGeography[];
  gaps: SerbiaGap[];
  statusChanges: SerbiaStatusChange[];
  successorEdges: number;
  metadata: { research_coverage_complete: boolean; applied_changes: number; justin_approved: boolean };
  intendedInventory: Record<string, unknown>;
};

function gitHead(root: string): string | null {
  try {
    return execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function gitTracked(root: string, spec: string): string[] {
  const output = execFileSync("git", ["-C", root, "ls-files", "-z", "--", spec], { encoding: "buffer" });
  return output.toString("utf8").split("\0").filter(Boolean).sort();
}

export class SerbiaPreflightError extends Error {
  readonly code: string;
  readonly inventory: Record<string, unknown>;
  constructor(code: string, message: string, inventory: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.inventory = inventory;
  }
}

function readJsonl(absPath: string): unknown[] {
  const rows: unknown[] = [];
  for (const line of readFileSync(absPath, "utf8").split("\n")) {
    if (!line.trim()) continue;
    rows.push(JSON.parse(line) as unknown);
  }
  return rows;
}

const KOSOVO = /kosov|metohij/i;

export function scanSerbiaInventory(options: {
  root: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): SerbiaInventory {
  const root = options.root;
  const tierAbs = options.tierPath ?? path.join(root, TIER_PATH);
  const gitCommit = gitHead(root);
  const requireGit = options.requireGitTrackedPackage ?? !options.tierPath;

  if (sha256Hex(readFileSync(path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_ATTEMPT_LOG_FILENAME))) !== ATTEMPT_LOG_SHA256) {
    throw new SerbiaPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_MASTER_FILENAME))) !== MASTER_SCHEMA_SHA256) {
    throw new SerbiaPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }
  if (existsSync(path.join(root, OMITTED_RESEARCH_DIR)) || (requireGit && gitTracked(root, OMITTED_RESEARCH_DIR).length !== 0)) {
    throw new SerbiaPreflightError("omitted_bytes_present", "data/research/serbia must not be adopted by this importer.", {});
  }

  const packagePaths = Object.keys(PINNED_INPUTS).sort();
  if (requireGit) {
    const tracked = [...gitTracked(root, DOCS_PREFIX), ...gitTracked(root, TIER_PATH)].sort();
    if (tracked.length !== packagePaths.length || tracked.some((rel, index) => rel !== packagePaths[index])) {
      const missing = packagePaths.filter((rel) => !tracked.includes(rel));
      const extra = tracked.filter((rel) => !packagePaths.includes(rel));
      throw new SerbiaPreflightError("package_inventory", "Serbia git-tracked pack does not match the pinned inputs.", { missing, extra });
    }
  }

  const tracked: TrackedInput[] = [];
  const packageFilesMeta: Array<{ input_path: string; sha256: string | null; byte_count: number | null; error?: string }> = [];
  for (const rel of packagePaths) {
    const abs = rel === TIER_PATH && options.tierPath ? tierAbs : path.join(root, rel);
    try {
      const bytes = readFileSync(abs);
      const item: TrackedInput = {
        input_path: rel,
        input_kind: inputKindFor(rel),
        sha256: sha256Hex(bytes),
        byte_count: bytes.length,
        absPath: abs,
      };
      tracked.push(item);
      packageFilesMeta.push({ input_path: rel, sha256: item.sha256, byte_count: item.byte_count });
    } catch (error) {
      packageFilesMeta.push({
        input_path: rel,
        sha256: null,
        byte_count: null,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const tierItem = tracked.find((item) => item.input_path === TIER_PATH);
  const intendedInventory: Record<string, unknown> = {
    lineage_id: LINEAGE_ID,
    adapter_version: ADAPTER_VERSION,
    method_version: METHOD_VERSION,
    schema_version: SCHEMA_VERSION,
    schema_inputs: [
      { input_path: ATTEMPT_LOG_SCHEMA_PATH, sha256: ATTEMPT_LOG_SHA256 },
      { input_path: MASTER_SCHEMA_PATH, sha256: MASTER_SCHEMA_SHA256 },
    ],
    git_commit: gitCommit,
    package_files: packageFilesMeta,
    tier: { input_path: TIER_PATH, sha256: tierItem?.sha256 ?? null, byte_count: tierItem?.byte_count ?? null },
    overrides: [],
    omitted_research_dir: OMITTED_RESEARCH_DIR,
    publish_source: OFFICE_REGISTER_RELATIVE,
    published_result_rows: 0,
    published_events: 0,
    published_sources: 0,
    events_file_not_projected: EVENTS_RELATIVE,
    results_file_not_projected: RESULTS_RELATIVE,
    research_dates_not_projected: RESEARCH_DATES_RELATIVE,
    source_extracts_not_projected: "docs/phase1/serbia/sources",
  };
  if (!tierItem) throw new SerbiaPreflightError("missing_tier", `Serbia tier file is missing at ${TIER_PATH}.`, intendedInventory);
  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new SerbiaPreflightError("package_hash_mismatch", `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`, intendedInventory);
      }
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new SerbiaPreflightError("package_inventory", `Expected ${EXPECTED_COUNTS.retained_inputs} pinned Serbia inputs, found ${tracked.length}.`, intendedInventory);
    }
  }

  const tiers = JSON.parse(readFileSync(tierItem.absPath, "utf8")) as SerbiaTierOffice[];
  if (!Array.isArray(tiers) || tiers.length !== EXPECTED_COUNTS.offices) {
    throw new SerbiaPreflightError("office_count", "Serbia tier file row count drifted.", intendedInventory);
  }
  const need = (rel: string) => tracked.find((item) => item.input_path === rel);
  const registerItem = need(OFFICE_REGISTER_RELATIVE);
  const draftItem = need(DRAFT_TIERS_RELATIVE);
  const countsItem = need(COUNTS_RELATIVE);
  const gapsItem = need(RESEARCH_GAPS_RELATIVE);
  const crosswalkItem = need(CROSSWALK_RELATIVE);
  const metadataItem = need(METADATA_RELATIVE);
  const sourceItem = need(SOURCE_INVENTORY_RELATIVE);
  const eventsItem = need(EVENTS_RELATIVE);
  const resultsItem = need(RESULTS_RELATIVE);
  const datesItem = need(RESEARCH_DATES_RELATIVE);
  const aggregatesItem = need(LOCAL_AGGREGATES_RELATIVE);
  if (!registerItem || !draftItem || !countsItem || !gapsItem || !crosswalkItem || !metadataItem || !sourceItem || !eventsItem || !resultsItem || !datesItem || !aggregatesItem) {
    throw new SerbiaPreflightError("package_inventory", "Serbia register, tiers, counts, gaps, or research files are missing.", intendedInventory);
  }

  const draftRows = readJsonl(draftItem.absPath) as SerbiaTierOffice[];
  const draftById = new Map(draftRows.map((row) => [row.office_id, row]));
  const tierById = new Map(tiers.map((row) => [row.office_id, row]));
  const registerRows = readJsonl(registerItem.absPath) as Array<Record<string, unknown>>;
  if (draftRows.length !== EXPECTED_COUNTS.offices || registerRows.length !== EXPECTED_COUNTS.offices) {
    throw new SerbiaPreflightError("office_count", "Serbia draft or register row count drifted.", intendedInventory);
  }

  const offices: SerbiaRegisterOffice[] = [];
  const seen = new Set<string>();
  const draftHistogram = new Map<string, number>();
  const namedGeos = new Map<string, string>();
  for (const [index, raw] of registerRows.entries()) {
    const officeId = String(raw.office_id ?? "");
    assertKnownRegisterKeys(officeId, raw);
    const geographyName = typeof raw.geography_name === "string" && raw.geography_name.trim() ? raw.geography_name : null;
    const geographyId = geographyName ? geographyIdForSuppliedName(geographyName) : geographyIdForUnnamedOffice(officeId);
    if (geographyName) {
      const prior = namedGeos.get(geographyId);
      if (prior) throw new SerbiaPreflightError("geography", `Geography ${geographyName} is shared by ${prior} and ${officeId}.`, intendedInventory);
      namedGeos.set(geographyId, officeId);
    }
    const office: SerbiaRegisterOffice = {
      office_id: officeId,
      id_namespace: CURRENT_NAMESPACE,
      country_id: String(raw.country_id ?? ""),
      name: String(raw.name ?? ""),
      geography_name: geographyName,
      geography_id: geographyId,
      geography_name_supplied: geographyName != null,
      parent_geography: typeof raw.parent_geography === "string" ? raw.parent_geography : null,
      statistical_region: typeof raw.statistical_region === "string" ? raw.statistical_region : null,
      office_type: String(raw.office_type ?? ""),
      office_status: String(raw.status ?? "") as SerbiaRegisterStatus,
      scope: String(raw.scope ?? ""),
      draft_tier: String(raw.tier ?? "") as SerbiaDraftTier,
      selection_mode: String(raw.selection_mode ?? ""),
      direct_executive: raw.direct_executive === true,
      source_ids: Array.isArray(raw.source_ids) ? raw.source_ids.map((item) => String(item)) : [],
      state_note: String(raw.state_note ?? ""),
      register_index: index,
    };
    const haystack = `${office.office_id} ${office.name} ${office.geography_name ?? ""} ${office.parent_geography ?? ""} ${office.statistical_region ?? ""}`;
    if (KOSOVO.test(haystack)) {
      throw new SerbiaPreflightError("kosovo", `Kosovo-scope office ${office.office_id} is outside this Serbia pack.`, intendedInventory);
    }
    if (seen.has(office.office_id)) throw new SerbiaPreflightError("duplicate_office", `Duplicate Serbia office ${office.office_id}.`, intendedInventory);
    seen.add(office.office_id);
    const draft = draftById.get(office.office_id);
    const tier = tierById.get(office.office_id);
    if (!draft || !tier || canonical(draft) !== canonical(tier) || office.draft_tier !== tier.tier) {
      throw new SerbiaPreflightError("numeric_tier", `Office ${office.office_id} register tier does not match the draft tier file.`, intendedInventory);
    }
    if (tier.justin_approved !== false || tier.review_status !== "draft_for_human_review" || !tier.rationale?.trim()) {
      throw new SerbiaPreflightError("review_status", `Office ${office.office_id} must stay draft_for_human_review and justin_approved false.`, intendedInventory);
    }
    assertAllowedOfficeIdentity(office.office_id, office.office_type, office.name);
    if (office.country_id !== COUNTRY_ID || office.source_ids.length === 0 || !office.state_note.trim()) {
      throw new SerbiaPreflightError("office_register", `Office ${office.office_id} country, sources, or state note drifted.`, intendedInventory);
    }
    if (office.direct_executive !== (office.office_id === PRESIDENT_ID)) {
      throw new SerbiaPreflightError("office_register", `Office ${office.office_id} direct_executive flag must stay President-only.`, intendedInventory);
    }
    if (office.office_id === PRESIDENT_ID) {
      if (office.selection_mode !== "direct_popular_majority_with_runoff" || office.scope !== "national" || office.draft_tier !== "national" || office.office_status !== "current" || geographyName) {
        throw new SerbiaPreflightError("office_register", "The President must stay the current national direct executive without a supplied geography name.", intendedInventory);
      }
    } else if (office.selection_mode !== "direct_popular_list_election") {
      throw new SerbiaPreflightError("office_register", `Office ${office.office_id} must stay a list election.`, intendedInventory);
    }
    if (office.office_type === "local_assembly" && !(office.office_status === "current" && office.scope === "local" && office.draft_tier === "municipal" && geographyName)) {
      throw new SerbiaPreflightError("office_register", `Local assembly ${office.office_id} drifted.`, intendedInventory);
    }
    if (office.office_type === "city_municipality_assembly" && !(office.office_status === "current" && office.scope === "local" && office.draft_tier === "municipal" && geographyName && office.parent_geography)) {
      throw new SerbiaPreflightError("office_register", `City municipality ${office.office_id} drifted.`, intendedInventory);
    }
    if (office.office_type === "municipality_assembly" && !(office.office_status === "historical_only" && office.scope === "local_historical" && office.draft_tier === "municipal" && !geographyName)) {
      throw new SerbiaPreflightError("office_register", `Historical municipality ${office.office_id} drifted.`, intendedInventory);
    }
    if (office.office_id === ASSEMBLY_ID && !(office.office_status === "current" && office.scope === "national" && office.draft_tier === "national" && !geographyName && !office.direct_executive)) {
      throw new SerbiaPreflightError("office_register", "The National Assembly drifted.", intendedInventory);
    }
    if (office.office_id === VOJVODINA_ID && !(office.office_status === "current" && office.scope === "provincial" && office.draft_tier === "regional" && !geographyName && !office.direct_executive)) {
      throw new SerbiaPreflightError("office_register", "The Vojvodina Assembly must stay the only regional office and not a direct executive.", intendedInventory);
    }
    draftHistogram.set(tier.tier, (draftHistogram.get(tier.tier) ?? 0) + 1);
    offices.push(office);
  }
  if (
    draftHistogram.get("national") !== EXPECTED_COUNTS.draft_tier_national ||
    draftHistogram.get("regional") !== EXPECTED_COUNTS.draft_tier_regional ||
    draftHistogram.get("municipal") !== EXPECTED_COUNTS.draft_tier_municipal
  ) {
    throw new SerbiaPreflightError("numeric_tier", "Serbia draft tier histogram drifted.", intendedInventory);
  }

  const edges = JSON.parse(readFileSync(crosswalkItem.absPath, "utf8")) as Array<Record<string, unknown>>;
  if (!Array.isArray(edges) || edges.length !== STATUS_CHANGE_EDGES.length) {
    throw new SerbiaPreflightError("crosswalk", "Serbia successor crosswalk must stay the five supplied status changes.", intendedInventory);
  }
  const registerById = new Map(offices.map((row) => [row.office_id, row]));
  const statusChanges: SerbiaStatusChange[] = edges.map((row, index) => ({
    predecessor_office_id: String(row.predecessor_office_id ?? ""),
    successor_office_id: String(row.successor_office_id ?? ""),
    relationship: String(row.relationship ?? ""),
    effective_label: String(row.effective_label ?? ""),
    source_id: String(row.source_id ?? ""),
    boundary_change_claim: false,
    note: String(row.note ?? ""),
    crosswalk_index: index,
  }));
  const expectedEdges = STATUS_CHANGE_EDGES.map((row) => row.join("|")).sort().join("\n");
  const actualEdges = statusChanges.map((row) => [row.predecessor_office_id, row.successor_office_id, row.effective_label, row.source_id].join("|")).sort().join("\n");
  if (actualEdges !== expectedEdges) {
    throw new SerbiaPreflightError("crosswalk", "Serbia status-change pairs drifted.", intendedInventory);
  }
  for (const edge of statusChanges) {
    if (edge.relationship !== "same_territory_status_change" || edges[edge.crosswalk_index]?.boundary_change_claim !== false || !edge.note.trim()) {
      throw new SerbiaPreflightError("crosswalk", `Status change ${edge.predecessor_office_id} must stay a non-boundary status change.`, intendedInventory);
    }
    const predecessor = registerById.get(edge.predecessor_office_id);
    const successor = registerById.get(edge.successor_office_id);
    if (!predecessor || predecessor.office_status !== "historical_only" || !successor || successor.office_status !== "current" || successor.office_type !== "local_assembly") {
      throw new SerbiaPreflightError("crosswalk", `Status change ${edge.predecessor_office_id} must join a historical municipality to its current local assembly.`, intendedInventory);
    }
  }

  const countsFile = JSON.parse(readFileSync(countsItem.absPath, "utf8")) as Record<string, unknown>;
  const histogram = countsFile.draft_tier_histogram as Record<string, number>;
  if (
    countsFile.total_office_rows !== EXPECTED_COUNTS.offices ||
    countsFile.current_offices !== EXPECTED_COUNTS.current_offices ||
    countsFile.historical_only_offices !== EXPECTED_COUNTS.historical_offices ||
    countsFile.national_current !== 2 ||
    countsFile.provincial_current !== 1 ||
    countsFile.local_current !== 170 ||
    countsFile.top_level_local_assemblies !== 145 ||
    countsFile.city_municipality_assemblies !== 25 ||
    countsFile.councils_chambers_assemblies_current !== 172 ||
    countsFile.direct_executive_current !== 1 ||
    countsFile.direct_local_executive_current !== 0 ||
    countsFile.european_parliament_offices !== 0 ||
    countsFile.kosovo_scope_offices !== 0 ||
    countsFile.applied_changes !== 0 ||
    histogram?.national !== 2 ||
    histogram?.regional !== 1 ||
    histogram?.municipal !== 175
  ) {
    throw new SerbiaPreflightError("office_count", "Serbia counts.json does not match the accepted pack counts.", intendedInventory);
  }
  if (countsFile.events !== FULL_PACK_DOCUMENTED_EVENTS || countsFile.results !== FULL_PACK_DOCUMENTED_RESULTS || countsFile.local_events !== 520 || countsFile.source_extracts !== FULL_PACK_DOCUMENTED_SOURCE_EXTRACTS) {
    throw new SerbiaPreflightError("counts_file", "Serbia counts.json event/result/source figures drifted. Publication still stays 0.", intendedInventory);
  }
  if (readJsonl(eventsItem.absPath).length !== FULL_PACK_DOCUMENTED_EVENTS || readJsonl(resultsItem.absPath).length !== FULL_PACK_DOCUMENTED_RESULTS || readJsonl(datesItem.absPath).length !== FULL_PACK_DOCUMENTED_RESEARCH_DATES) {
    throw new SerbiaPreflightError("counts_file", "Serbia event, result, or research-date files drifted. Rows are not projected.", intendedInventory);
  }

  const gaps = JSON.parse(readFileSync(gapsItem.absPath, "utf8")) as SerbiaGap[];
  if (!Array.isArray(gaps) || gaps.map((gap) => gap.gap_id).join(",") !== GAP_FILE_ORDER.join(",")) {
    throw new SerbiaPreflightError("named_holds", "Serbia research gaps must stay the supplied RS-AX-G01 through RS-AX-G11 order.", intendedInventory);
  }
  for (const gap of gaps) {
    const expectedStatus = GAP_STATUS[gap.gap_id as (typeof GAP_IDS)[number]];
    if (gap.status !== expectedStatus || !gap.detail?.trim() || !gap.topic?.trim()) {
      throw new SerbiaPreflightError("named_holds", `Hold ${gap.gap_id} status drifted from ${expectedStatus}.`, intendedInventory);
    }
  }

  const metadataFile = JSON.parse(readFileSync(metadataItem.absPath, "utf8")) as Record<string, unknown>;
  const approvals = metadataFile.justin_approvals as Record<string, boolean> | undefined;
  if (
    metadataFile.applied_changes !== 0 ||
    Object.prototype.hasOwnProperty.call(metadataFile, "research_coverage_complete") ||
    metadataFile.id_namespace !== CURRENT_NAMESPACE ||
    metadataFile.lineage_id !== LINEAGE_ID ||
    metadataFile.prompt !== "AX" ||
    metadataFile.country !== COUNTRY_NAME ||
    metadataFile.retry_rebuilt !== true ||
    metadataFile.current_offices !== 173 ||
    metadataFile.historical_only_offices !== 5 ||
    !approvals ||
    Object.values(approvals).length === 0 ||
    Object.values(approvals).some((value) => value !== false)
  ) {
    throw new SerbiaPreflightError("coverage", "Serbia metadata.json must stay applied_changes 0, approvals false, and must not set research_coverage_complete.", intendedInventory);
  }

  const sources = JSON.parse(readFileSync(sourceItem.absPath, "utf8")) as Array<{ source_id?: string; input_path?: string; sha256?: string; remote_original_bytes_retained?: boolean }>;
  if (!Array.isArray(sources) || sources.length !== FULL_PACK_DOCUMENTED_SOURCE_EXTRACTS) {
    throw new SerbiaPreflightError("sources", "Serbia source inventory must stay 30 normalized extracts.", intendedInventory);
  }
  for (const source of sources) {
    const rel = `docs/phase1/serbia/${String(source.input_path ?? "")}`;
    const pinned = tracked.find((item) => item.input_path === rel);
    if (!pinned || pinned.sha256 !== source.sha256 || source.remote_original_bytes_retained !== false) {
      throw new SerbiaPreflightError("sources", `Source extract ${String(source.source_id ?? rel)} does not match the pinned normalized file.`, intendedInventory);
    }
  }
  const aggregates = JSON.parse(readFileSync(aggregatesItem.absPath, "utf8")) as unknown[];
  if (!Array.isArray(aggregates) || aggregates.length !== 3) {
    throw new SerbiaPreflightError("aggregates", "Serbia local-cycle aggregates must stay the three supplied rows and are not allocated to offices.", intendedInventory);
  }

  const geographies: SerbiaGeography[] = offices.map((office) => ({
    geography_id: office.geography_id,
    name: office.geography_name ?? office.name,
    country_id: COUNTRY_ID,
    geography_index: office.register_index,
    supplied: office.geography_name_supplied,
  }));
  if (geographies.length !== EXPECTED_COUNTS.geographies || new Set(geographies.map((row) => row.geography_id)).size !== geographies.length) {
    throw new SerbiaPreflightError("geography", "Serbia geography histogram drifted.", intendedInventory);
  }

  const hashInputs = buildHashInputs({
    inputs: tracked.map(({ input_path, input_kind, sha256, byte_count }) => ({ input_path, input_kind, sha256, byte_count })),
  });
  const fingerprint = fingerprintSha256(hashInputs);
  return {
    root,
    tierPath: TIER_PATH,
    gitCommit,
    tracked,
    byPath: new Map(tracked.map((item) => [item.input_path, item])),
    fingerprint,
    releaseId: releaseIdFor(fingerprint),
    hashInputsJson: canonical(hashInputs),
    hashInputs,
    tiers,
    offices,
    geographies,
    gaps,
    statusChanges,
    successorEdges: statusChanges.length,
    metadata: { research_coverage_complete: false, applied_changes: 0, justin_approved: false },
    intendedInventory,
  };
}
