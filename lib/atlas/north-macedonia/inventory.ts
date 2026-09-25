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
  APPROVAL_STATE_RELATIVE,
  BRVENICA_MAYOR_ID,
  BRVENICA_NEXT_DATE_LABEL,
  COUNTS_RELATIVE,
  COUNTRY_CODE,
  COUNTRY_ID,
  COUNTRY_NAME,
  CURRENT_NAMESPACE,
  DOCS_PREFIX,
  DRAFT_TIERS_RELATIVE,
  DRAFT_TIERS_SHA256,
  EXPECTED_COUNTS,
  FULL_PACK_DOCUMENTED_EVENTS,
  FULL_PACK_DOCUMENTED_RESULTS,
  FULL_PACK_DOCUMENTED_SOURCES,
  GAP_FILE_ORDER,
  GAP_IDS,
  GAP_STATUS,
  GAP_TOPICS,
  LINEAGE_ID,
  METADATA_RELATIVE,
  METHOD_VERSION,
  NATIONAL_PACK_GEOGRAPHY_ID,
  OFFICE_REGISTER_RELATIVE,
  OMITTED_PACK_PATHS,
  OMITTED_RESEARCH_DIR,
  PARLIAMENT_ID,
  PINNED_INPUTS,
  PRESIDENT_ID,
  RESEARCH_GAPS_RELATIVE,
  SCHEMA_VERSION,
  SOURCE_INVENTORY_RELATIVE,
  TIER_PATH,
  TIER_SHA256,
  TRANSITIONS_RELATIVE,
  assertAllowedOfficeIdentity,
  assertKnownRegisterKeys,
  buildHashInputs,
  canonical,
  fingerprintSha256,
  geographyIdForPackId,
  inputKindFor,
  isHistoricalOffice,
  releaseIdFor,
  sha256Hex,
  type HashInputDescriptor,
  type NorthMacedoniaDraftTier,
  type NorthMacedoniaRegisterStatus,
} from "./identity";

export type TrackedInput = HashInputDescriptor & { absPath: string };

export type NorthMacedoniaTierOffice = {
  office_id: string;
  tier: NorthMacedoniaDraftTier;
  review_status: string;
  justin_approved: boolean;
  rationale: string;
  classification_kind: string;
  id_namespace: string;
};

export type NorthMacedoniaRegisterOffice = {
  office_id: string;
  id_namespace: string;
  name: string;
  geography_name: string;
  pack_geography_id: string;
  geography_id: string;
  parent_pack_geography_id: string | null;
  parent_geography_id: string | null;
  office_type: string;
  office_status: NorthMacedoniaRegisterStatus;
  tier_scope: string;
  draft_tier: NorthMacedoniaDraftTier;
  selection_mode: string;
  direct_executive: boolean;
  source_ids: string[];
  state_note: string;
  next_date_label: string | null;
  register_index: number;
};

export type NorthMacedoniaGeography = {
  geography_id: string;
  name: string;
  country_id: string;
  pack_geography_id: string;
  parent_geography_id: string | null;
  geography_index: number;
};

export type NorthMacedoniaGap = { gap_id: string; topic: string; status: string; detail: string };

export type NorthMacedoniaInventory = {
  root: string;
  tierPath: string;
  gitCommit: string | null;
  tracked: TrackedInput[];
  byPath: Map<string, TrackedInput>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  hashInputs: ReturnType<typeof buildHashInputs>;
  tiers: NorthMacedoniaTierOffice[];
  offices: NorthMacedoniaRegisterOffice[];
  geographies: NorthMacedoniaGeography[];
  gaps: NorthMacedoniaGap[];
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

export class NorthMacedoniaPreflightError extends Error {
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

export function scanNorthMacedoniaInventory(options: {
  root: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): NorthMacedoniaInventory {
  const root = options.root;
  const tierAbs = options.tierPath ?? path.join(root, TIER_PATH);
  const gitCommit = gitHead(root);
  const requireGit = options.requireGitTrackedPackage ?? !options.tierPath;

  if (sha256Hex(readFileSync(path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_ATTEMPT_LOG_FILENAME))) !== ATTEMPT_LOG_SHA256) {
    throw new NorthMacedoniaPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_MASTER_FILENAME))) !== MASTER_SCHEMA_SHA256) {
    throw new NorthMacedoniaPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }
  for (const rel of OMITTED_PACK_PATHS) {
    if (existsSync(path.join(root, rel)) || (requireGit && gitTracked(root, rel).length !== 0)) {
      throw new NorthMacedoniaPreflightError(
        "omitted_bytes_present",
        `Omitted North Macedonia pack path is present: ${rel}. The slim importer does not adopt those bytes.`,
        {},
      );
    }
  }
  if (existsSync(path.join(root, OMITTED_RESEARCH_DIR)) || (requireGit && gitTracked(root, OMITTED_RESEARCH_DIR).length !== 0)) {
    throw new NorthMacedoniaPreflightError("omitted_bytes_present", "data/research/north-macedonia must not be adopted by this importer.", {});
  }

  const packagePaths = Object.keys(PINNED_INPUTS).sort();
  if (requireGit) {
    const tracked = [...gitTracked(root, DOCS_PREFIX), ...gitTracked(root, TIER_PATH)].sort();
    if (tracked.length !== packagePaths.length || tracked.some((rel, index) => rel !== packagePaths[index])) {
      const missing = packagePaths.filter((rel) => !tracked.includes(rel));
      const extra = tracked.filter((rel) => !packagePaths.includes(rel));
      throw new NorthMacedoniaPreflightError("package_inventory", "North Macedonia git-tracked pack does not match the pinned inputs.", {
        missing,
        extra,
      });
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
    omitted_pack_paths: [...OMITTED_PACK_PATHS],
    publish_source: OFFICE_REGISTER_RELATIVE,
    published_result_rows: 0,
    published_events: 0,
    published_sources: 0,
    successor_edges: 0,
  };
  if (!tierItem) throw new NorthMacedoniaPreflightError("missing_tier", `North Macedonia tier file is missing at ${TIER_PATH}.`, intendedInventory);
  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new NorthMacedoniaPreflightError(
          "package_hash_mismatch",
          `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`,
          intendedInventory,
        );
      }
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new NorthMacedoniaPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} pinned North Macedonia inputs, found ${tracked.length}.`,
        intendedInventory,
      );
    }
  }
  if (tierItem.sha256 !== TIER_SHA256 && !options.tierPath) {
    throw new NorthMacedoniaPreflightError("package_hash_mismatch", "North Macedonia tier bytes drifted.", intendedInventory);
  }

  const tiers = JSON.parse(readFileSync(tierItem.absPath, "utf8")) as NorthMacedoniaTierOffice[];
  if (!Array.isArray(tiers) || tiers.length !== EXPECTED_COUNTS.offices) {
    throw new NorthMacedoniaPreflightError("office_count", "North Macedonia tier file row count drifted.", intendedInventory);
  }
  const need = (rel: string) => tracked.find((item) => item.input_path === rel);
  const registerItem = need(OFFICE_REGISTER_RELATIVE);
  const draftItem = need(DRAFT_TIERS_RELATIVE);
  const countsItem = need(COUNTS_RELATIVE);
  const gapsItem = need(RESEARCH_GAPS_RELATIVE);
  const transitionsItem = need(TRANSITIONS_RELATIVE);
  const metadataItem = need(METADATA_RELATIVE);
  const approvalItem = need(APPROVAL_STATE_RELATIVE);
  const sourceItem = need(SOURCE_INVENTORY_RELATIVE);
  if (!registerItem || !draftItem || !countsItem || !gapsItem || !transitionsItem || !metadataItem || !approvalItem || !sourceItem) {
    throw new NorthMacedoniaPreflightError("package_inventory", "North Macedonia register, tiers, counts, or gap files are missing.", intendedInventory);
  }
  if (draftItem.sha256 !== DRAFT_TIERS_SHA256) {
    throw new NorthMacedoniaPreflightError("package_hash_mismatch", "North Macedonia draft-tiers.jsonl bytes drifted.", intendedInventory);
  }

  const draftRows = readJsonl(draftItem.absPath) as NorthMacedoniaTierOffice[];
  if (canonical(draftRows) !== canonical(tiers)) {
    throw new NorthMacedoniaPreflightError("numeric_tier", "Draft tiers and the schema tier file are not the same 172 rows.", intendedInventory);
  }
  const tierById = new Map(tiers.map((row) => [row.office_id, row]));
  const offices: NorthMacedoniaRegisterOffice[] = [];
  const seen = new Set<string>();
  const draftHistogram = new Map<string, number>();
  const registerRows = readJsonl(registerItem.absPath);
  if (registerRows.length !== EXPECTED_COUNTS.offices) {
    throw new NorthMacedoniaPreflightError("office_count", "North Macedonia office register row count drifted.", intendedInventory);
  }
  registerRows.forEach((rawValue, index) => {
    if (!rawValue || typeof rawValue !== "object" || Array.isArray(rawValue)) {
      throw new NorthMacedoniaPreflightError("office_register", `Office row ${index} is not an object.`, intendedInventory);
    }
    const raw = rawValue as Record<string, unknown>;
    const officeId = String(raw.office_id ?? "");
    assertKnownRegisterKeys(officeId, raw);
    const packGeographyId = String(raw.geography_id ?? "");
    const parentPack = raw.parent_geography_id == null ? null : String(raw.parent_geography_id);
    const office: NorthMacedoniaRegisterOffice = {
      office_id: officeId,
      id_namespace: String(raw.id_namespace ?? ""),
      name: String(raw.name ?? ""),
      geography_name: String(raw.geography ?? ""),
      pack_geography_id: packGeographyId,
      geography_id: geographyIdForPackId(packGeographyId),
      parent_pack_geography_id: parentPack,
      parent_geography_id: parentPack ? geographyIdForPackId(parentPack) : null,
      office_type: String(raw.office_type ?? ""),
      office_status: String(raw.status ?? "") as NorthMacedoniaRegisterStatus,
      tier_scope: String(raw.tier_scope ?? ""),
      draft_tier: "municipal",
      selection_mode: String(raw.selection_mode ?? ""),
      direct_executive: raw.direct_executive === true,
      source_ids: Array.isArray(raw.source_ids) ? raw.source_ids.map((item) => String(item)) : [],
      state_note: String(raw.state_note ?? ""),
      next_date_label: raw.next_date_label == null ? null : String(raw.next_date_label),
      register_index: index,
    };
    if (seen.has(office.office_id)) {
      throw new NorthMacedoniaPreflightError("duplicate_office", `Duplicate North Macedonia office ${office.office_id}.`, intendedInventory);
    }
    seen.add(office.office_id);
    const tier = tierById.get(office.office_id);
    if (!tier || tier.id_namespace !== CURRENT_NAMESPACE || tier.classification_kind !== "research_draft") {
      throw new NorthMacedoniaPreflightError("numeric_tier", `Office ${office.office_id} is missing a research-draft tier row.`, intendedInventory);
    }
    office.draft_tier = tier.tier;
    if (tier.justin_approved !== false || tier.review_status !== "draft_for_human_review" || !tier.rationale?.trim()) {
      throw new NorthMacedoniaPreflightError(
        "review_status",
        `Office ${office.office_id} must stay draft_for_human_review and justin_approved false.`,
        intendedInventory,
      );
    }
    assertAllowedOfficeIdentity(office.office_id, office.office_type, office.name);
    if (office.id_namespace !== CURRENT_NAMESPACE || office.source_ids.length === 0 || !office.state_note.trim() || !office.geography_name.trim()) {
      throw new NorthMacedoniaPreflightError("office_register", `Office ${office.office_id} namespace, sources, geography, or state note drifted.`, intendedInventory);
    }
    const expectsDirect = office.office_type === "mayor" || office.office_type === "president";
    if (office.direct_executive !== expectsDirect) {
      throw new NorthMacedoniaPreflightError("office_register", `Office ${office.office_id} direct_executive flag drifted.`, intendedInventory);
    }
    const expectsSelection = expectsDirect ? "direct_popular_two_round_majority" : "direct_popular_list_PR";
    if (office.selection_mode !== expectsSelection) {
      throw new NorthMacedoniaPreflightError("office_register", `Office ${office.office_id} selection mode drifted.`, intendedInventory);
    }
    const historical = isHistoricalOffice(office.office_id);
    if ((office.office_status === "historical_only") !== historical) {
      throw new NorthMacedoniaPreflightError("office_register", `Office ${office.office_id} historical status drifted.`, intendedInventory);
    }
    if (office.office_id === PARLIAMENT_ID || office.office_id === PRESIDENT_ID) {
      if (office.office_status !== "current" || office.tier_scope !== "national" || office.draft_tier !== "national" || office.pack_geography_id !== NATIONAL_PACK_GEOGRAPHY_ID || office.parent_pack_geography_id != null) {
        throw new NorthMacedoniaPreflightError("office_register", `National office ${office.office_id} drifted.`, intendedInventory);
      }
    } else if (office.tier_scope !== "local" || office.draft_tier !== "municipal" || !office.parent_pack_geography_id) {
      throw new NorthMacedoniaPreflightError("office_register", `Local office ${office.office_id} drifted.`, intendedInventory);
    }
    if (office.office_id === BRVENICA_MAYOR_ID) {
      if (office.next_date_label !== BRVENICA_NEXT_DATE_LABEL) {
        throw new NorthMacedoniaPreflightError("office_register", "Brvenica mayor next-date label drifted.", intendedInventory);
      }
    } else if (office.next_date_label != null) {
      throw new NorthMacedoniaPreflightError("office_register", `Office ${office.office_id} must not grow a next-date label.`, intendedInventory);
    }
    draftHistogram.set(tier.tier, (draftHistogram.get(tier.tier) ?? 0) + 1);
    offices.push(office);
  });
  if (
    draftHistogram.get("national") !== EXPECTED_COUNTS.draft_tier_national ||
    draftHistogram.get("municipal") !== EXPECTED_COUNTS.draft_tier_municipal ||
    (draftHistogram.get("regional") ?? 0) !== 0
  ) {
    throw new NorthMacedoniaPreflightError("numeric_tier", "North Macedonia draft tier histogram drifted.", intendedInventory);
  }

  const transitions = JSON.parse(readFileSync(transitionsItem.absPath, "utf8")) as Record<string, unknown>;
  const successorEdges = transitions.office_successor_edges;
  const claims = transitions.territorial_claims;
  const rename = transitions.country_rename as Record<string, unknown> | undefined;
  if (!Array.isArray(successorEdges) || successorEdges.length !== 0) {
    throw new NorthMacedoniaPreflightError("crosswalk", "North Macedonia office_successor_edges must stay empty.", intendedInventory);
  }
  if (!Array.isArray(claims) || claims.length !== 1 || String((claims[0] as Record<string, unknown>).relation_kind) !== "documented_territorial_reorganization_not_office_identity") {
    throw new NorthMacedoniaPreflightError("crosswalk", "The Kichevo territorial claim must stay a non-identity reorganization.", intendedInventory);
  }
  if (!rename || rename.creates_new_office !== false) {
    throw new NorthMacedoniaPreflightError("crosswalk", "The 2019 country rename must not create a new office.", intendedInventory);
  }

  const countsFile = JSON.parse(readFileSync(countsItem.absPath, "utf8")) as Record<string, unknown>;
  const histogram = countsFile.draft_tier_histogram as Record<string, number>;
  if (
    countsFile.offices_total !== EXPECTED_COUNTS.offices ||
    countsFile.offices_current !== EXPECTED_COUNTS.current_offices ||
    countsFile.offices_historical_only !== EXPECTED_COUNTS.historical_offices ||
    countsFile.current_councils !== EXPECTED_COUNTS.current_councils ||
    countsFile.current_direct_executives !== EXPECTED_COUNTS.current_direct_executives ||
    countsFile.current_local_direct_executives !== EXPECTED_COUNTS.current_local_direct_executives ||
    countsFile.current_national !== 2 ||
    countsFile.historical_councils !== 4 ||
    countsFile.historical_direct_executives !== 4 ||
    countsFile.ep_offices !== 0 ||
    countsFile.regional_offices !== 0 ||
    countsFile.applied_changes !== 0 ||
    histogram?.national !== 2 ||
    histogram?.municipal !== 170
  ) {
    throw new NorthMacedoniaPreflightError("office_count", "North Macedonia counts.json does not match the accepted pack counts.", intendedInventory);
  }
  if (
    countsFile.events !== FULL_PACK_DOCUMENTED_EVENTS ||
    countsFile.results !== FULL_PACK_DOCUMENTED_RESULTS ||
    countsFile.sources !== FULL_PACK_DOCUMENTED_SOURCES ||
    countsFile.events_past !== 812 ||
    countsFile.events_upcoming !== 1 ||
    countsFile.numeric_result_rows !== 1699 ||
    countsFile.null_vote_result_rows !== 1
  ) {
    throw new NorthMacedoniaPreflightError(
      "counts_file",
      "North Macedonia counts.json event/result/source figures drifted. Slim publish still stays 0 and does not emit omitted totals.",
      intendedInventory,
    );
  }

  const gapFile = JSON.parse(readFileSync(gapsItem.absPath, "utf8")) as Array<{ gap_id?: string; status?: string; description?: string }>;
  if (!Array.isArray(gapFile) || gapFile.length !== GAP_FILE_ORDER.length) {
    throw new NorthMacedoniaPreflightError("named_holds", "North Macedonia research gaps must stay MK-AZ-G01 through MK-AZ-G23.", intendedInventory);
  }
  const gaps: NorthMacedoniaGap[] = gapFile.map((row, index) => ({
    gap_id: GAP_FILE_ORDER[index]!,
    topic: String(row.gap_id ?? ""),
    status: String(row.status ?? ""),
    detail: String(row.description ?? ""),
  }));
  if (gaps.map((gap) => gap.topic).join(",") !== GAP_TOPICS.join(",")) {
    throw new NorthMacedoniaPreflightError("named_holds", "North Macedonia research-gap topic order drifted.", intendedInventory);
  }
  for (const gap of gaps) {
    const expectedStatus = GAP_STATUS[gap.gap_id as (typeof GAP_IDS)[number]];
    if (gap.status !== expectedStatus || !gap.detail.trim()) {
      throw new NorthMacedoniaPreflightError("named_holds", `Hold ${gap.gap_id} status drifted from ${expectedStatus}.`, intendedInventory);
    }
  }

  const metadataFile = JSON.parse(readFileSync(metadataItem.absPath, "utf8")) as Record<string, unknown>;
  if (
    metadataFile.applied_changes !== 0 ||
    metadataFile.research_coverage_complete !== false ||
    metadataFile.all_justin_approvals_unchecked !== true ||
    metadataFile.id_namespace !== CURRENT_NAMESPACE ||
    metadataFile.prompt !== "AZ" ||
    metadataFile.country !== COUNTRY_NAME ||
    metadataFile.country_code !== COUNTRY_CODE
  ) {
    throw new NorthMacedoniaPreflightError(
      "coverage",
      "North Macedonia metadata.json must stay applied_changes 0, research_coverage_complete false, and approvals unchecked.",
      intendedInventory,
    );
  }
  const approvalFile = JSON.parse(readFileSync(approvalItem.absPath, "utf8")) as { applied_changes?: number; justin_approvals?: Record<string, boolean> };
  const approvals = approvalFile.justin_approvals;
  if (
    approvalFile.applied_changes !== 0 ||
    !approvals ||
    Object.values(approvals).length === 0 ||
    Object.values(approvals).some((value) => value !== false)
  ) {
    throw new NorthMacedoniaPreflightError("coverage", "North Macedonia approval-state.json must stay unchecked.", intendedInventory);
  }

  const sources = JSON.parse(readFileSync(sourceItem.absPath, "utf8")) as Array<{ original_file_bundled?: boolean; retained_extract_path?: string }>;
  if (!Array.isArray(sources) || sources.length !== FULL_PACK_DOCUMENTED_SOURCES) {
    throw new NorthMacedoniaPreflightError("sources", "North Macedonia source inventory must stay the 222 omitted extracts.", intendedInventory);
  }
  for (const source of sources) {
    if (source.original_file_bundled !== false || !String(source.retained_extract_path ?? "").startsWith("sources/")) {
      throw new NorthMacedoniaPreflightError("sources", "North Macedonia source extracts must stay unbundled.", intendedInventory);
    }
  }

  const geographyByPack = new Map<string, NorthMacedoniaGeography>();
  for (const office of offices) {
    const existing = geographyByPack.get(office.pack_geography_id);
    if (!existing) {
      geographyByPack.set(office.pack_geography_id, {
        geography_id: office.geography_id,
        name: office.geography_name,
        country_id: COUNTRY_ID,
        pack_geography_id: office.pack_geography_id,
        parent_geography_id: office.parent_geography_id,
        geography_index: office.register_index,
      });
      continue;
    }
    if (existing.name !== office.geography_name || existing.parent_geography_id !== office.parent_geography_id) {
      throw new NorthMacedoniaPreflightError("geography", `Geography ${office.pack_geography_id} disagrees across offices.`, intendedInventory);
    }
  }
  const geographies = [...geographyByPack.values()];
  const packIds = new Set(geographies.map((row) => row.pack_geography_id));
  for (const geography of geographies) {
    if (!geography.parent_geography_id) continue;
    const parentPack = offices.find((office) => office.geography_id === geography.parent_geography_id)?.pack_geography_id;
    if (!parentPack || !packIds.has(parentPack)) {
      throw new NorthMacedoniaPreflightError("geography", `Geography ${geography.pack_geography_id} parent is not in the register.`, intendedInventory);
    }
  }
  if (geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new NorthMacedoniaPreflightError("geography", "North Macedonia geography histogram drifted.", intendedInventory);
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
    successorEdges: 0,
    metadata: { research_coverage_complete: false, applied_changes: 0, justin_approved: false },
    intendedInventory,
  };
}
