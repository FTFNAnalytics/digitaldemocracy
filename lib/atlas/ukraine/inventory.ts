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
  ACCEPTANCE_RELATIVE,
  ADAPTER_VERSION,
  COUNTS_RELATIVE,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_ID,
  COUNTRY_NAME,
  canonical,
  CURRENT_NAMESPACE,
  DOCS_PREFIX,
  DRAFT_TIERS_RELATIVE,
  EXPECTED_COUNTS,
  FULL_PACK_DOCUMENTED_EVENTS,
  FULL_PACK_DOCUMENTED_RESULTS,
  FULL_ZIP_SHA256,
  GAP_STATUS,
  HISTORICAL_GEOGRAPHY_IDS,
  IDENTITY_NOTES_RELATIVE,
  LINEAGE_ID,
  METADATA_RELATIVE,
  METHOD_VERSION,
  OFFICE_REGISTER_RELATIVE,
  OMITTED_PATHS,
  OMITTED_RESEARCH_DIR,
  OPEN_HOLD_IDS,
  PINNED_INPUTS,
  RESEARCH_GAPS_RELATIVE,
  SCHEMA_VERSION,
  TERRITORIAL_HOLDS_RELATIVE,
  TIER_PATH,
  TIER_SHA256,
  VALIDATION_RELATIVE,
  assertAllowedOfficeIdentity,
  buildHashInputs,
  expectedDraftTier,
  fingerprintSha256,
  inputKindFor,
  isDirectExecutive,
  officeTypeFor,
  releaseIdFor,
  sha256Hex,
  type HashInputDescriptor,
  type UkraineDraftTier,
  type UkraineRegisterStatus,
} from "./identity";

export type TrackedInput = HashInputDescriptor & {
  absPath: string;
};

export type UkraineTierOffice = {
  office_id: string;
  tier: UkraineDraftTier;
  draft_tier: UkraineDraftTier;
  status: string;
  justin_approved: boolean;
  rationale: string;
  applied: boolean;
  tier_index: number;
};

export type UkraineDraftOffice = {
  office_id: string;
  draft_tier: UkraineDraftTier;
  status: string;
  justin_approved: boolean;
  basis: string;
  applied: boolean;
};

export type UkraineRegisterOffice = {
  office_id: string;
  id_namespace: string;
  country_id: string;
  country_code: string;
  name: string;
  office_type: string;
  scope_level: string;
  geography_id: string;
  office_status: UkraineRegisterStatus;
  selection_mode: string;
  direct_executive: boolean;
  successor_office_id: null;
  predecessor_office_id: null;
  register_index: number;
  raw: Record<string, unknown>;
};

export type UkraineGeography = {
  geography_id: string;
  name: string;
  country_id: string;
  parent_geography_id: string | null;
  geography_index: number;
  office_ids: string[];
  source_register_index: number;
};

export type UkraineGap = {
  gap_id: string;
  title: string;
  status: string;
  treatment: string;
  justin_approved: boolean;
};

export type UkraineInventory = {
  root: string;
  tierPath: string;
  gitCommit: string | null;
  tracked: TrackedInput[];
  byPath: Map<string, TrackedInput>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  hashInputs: ReturnType<typeof buildHashInputs>;
  tiers: UkraineTierOffice[];
  drafts: UkraineDraftOffice[];
  offices: UkraineRegisterOffice[];
  geographies: UkraineGeography[];
  gaps: UkraineGap[];
  successorEdges: number;
  parentsLeftNull: number;
  territorialHoldRows: number;
  metadata: {
    research_coverage_complete: boolean;
    applied_changes: number;
    justin_approved: boolean;
  };
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
  return output
    .toString("utf8")
    .split("\0")
    .filter((rel) => Boolean(rel))
    .sort();
}

export class UkrainePreflightError extends Error {
  readonly code: string;
  readonly inventory: Record<string, unknown>;
  constructor(code: string, message: string, inventory: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.inventory = inventory;
  }
}

const REGISTER_KEYS = new Set([
  "office_id",
  "country_scope",
  "name_local",
  "name_en",
  "office_kind",
  "scope_level",
  "office_status",
  "selection_mode",
  "is_direct_executive",
  "institutional_scope",
  "ep_office",
  "source_ids",
  "effective_from",
  "effective_to",
  "predecessor_id",
  "successor_id",
  "current_operation_status",
  "current_operation_status_note",
  "justin_approved",
  "applied",
  "chamber",
  "territory_code",
  "region_id",
  "region_name",
  "cvk_body_id",
  "territory_name",
  "territory_register_row",
  "territory_register_source",
  "territory_scope_version",
  "source_name",
  "parent_territory_code",
  "wartime_hold_id",
  "head_record_named",
  "identity_note",
]);

const DRAFT_TIERS = new Set<string>(["national", "regional", "autonomous", "raion", "local", "city_district"]);
const REGISTER_STATUSES = new Set<string>(["current", "historical_only"]);
const TERRITORY_CODE_RE = /^UA\d{17}$/;
const PARENTS_WITHOUT_OFFICE_GEOGRAPHY = new Set(["UA14000000000091971", "UA44000000000018893"]);

function readJson(absPath: string): unknown {
  return JSON.parse(readFileSync(absPath, "utf8")) as unknown;
}

function readJsonl(absPath: string): unknown[] {
  const text = readFileSync(absPath, "utf8");
  const rows: unknown[] = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    rows.push(JSON.parse(line) as unknown);
  }
  return rows;
}

export function scanUkraineInventory(options: {
  root: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): UkraineInventory {
  const root = options.root;
  const tierAbs = options.tierPath ?? path.join(root, TIER_PATH);
  const gitCommit = gitHead(root);
  const requireGit = options.requireGitTrackedPackage ?? !options.tierPath;

  const schemaAttempt = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_ATTEMPT_LOG_FILENAME);
  const schemaMaster = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_MASTER_FILENAME);
  if (sha256Hex(readFileSync(schemaAttempt)) !== ATTEMPT_LOG_SHA256) {
    throw new UkrainePreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new UkrainePreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  for (const rel of OMITTED_PATHS) {
    if (existsSync(path.join(root, rel))) {
      throw new UkrainePreflightError(
        "omitted_bytes_present",
        `Omitted Ukraine pack path is present: ${rel}. The importer does not adopt those bytes.`,
        {},
      );
    }
  }
  if (requireGit && gitTracked(root, OMITTED_RESEARCH_DIR).length !== 0) {
    throw new UkrainePreflightError(
      "omitted_bytes_present",
      "data/research/ukraine is git-tracked. The importer does not adopt omitted research bytes.",
      {},
    );
  }

  const packagePaths = Object.keys(PINNED_INPUTS).sort();
  if (requireGit) {
    const trackedDocs = gitTracked(root, DOCS_PREFIX);
    const trackedTier = gitTracked(root, TIER_PATH);
    const tracked = [...trackedDocs, ...trackedTier].sort();
    if (tracked.length !== packagePaths.length || tracked.some((rel, index) => rel !== packagePaths[index])) {
      const missing = packagePaths.filter((rel) => !tracked.includes(rel));
      const extra = tracked.filter((rel) => !packagePaths.includes(rel));
      throw new UkrainePreflightError("package_inventory", "Ukraine git-tracked pack does not match the pinned inputs.", {
        missing,
        extra,
      });
    }
  }

  const packageFilesMeta: Array<{ input_path: string; sha256: string | null; byte_count: number | null; error?: string }> = [];
  const tracked: TrackedInput[] = [];
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
    tier: {
      input_path: TIER_PATH,
      sha256: tierItem?.sha256 ?? null,
      byte_count: tierItem?.byte_count ?? null,
    },
    overrides: [],
    omitted_research_dir: OMITTED_RESEARCH_DIR,
    publish_source: OFFICE_REGISTER_RELATIVE,
    published_result_rows: 0,
    published_events: 0,
    published_sources: 0,
    events_file_not_projected: "docs/phase1/ukraine/data/events.jsonl",
    results_file_not_projected: "docs/phase1/ukraine/data/results.jsonl",
    sources_file_not_projected: "docs/phase1/ukraine/sources",
    full_zip_sha256_documentary: FULL_ZIP_SHA256,
  };

  if (!tierItem || !existsSync(tierItem.absPath)) {
    throw new UkrainePreflightError("missing_tier", `Ukraine tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }
  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new UkrainePreflightError(
          "package_hash_mismatch",
          `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`,
          intendedInventory,
        );
      }
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new UkrainePreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} pinned Ukraine inputs, found ${tracked.length}.`,
        intendedInventory,
      );
    }
  }
  if (tierItem.sha256 !== TIER_SHA256 && requireGit) {
    throw new UkrainePreflightError("tier_hash_mismatch", `Ukraine tier SHA-256 mismatch; expected ${TIER_SHA256}.`, intendedInventory);
  }

  const registerItem = tracked.find((item) => item.input_path === OFFICE_REGISTER_RELATIVE);
  const draftItem = tracked.find((item) => item.input_path === DRAFT_TIERS_RELATIVE);
  const countsItem = tracked.find((item) => item.input_path === COUNTS_RELATIVE);
  const gapsItem = tracked.find((item) => item.input_path === RESEARCH_GAPS_RELATIVE);
  const metadataItem = tracked.find((item) => item.input_path === METADATA_RELATIVE);
  const validationItem = tracked.find((item) => item.input_path === VALIDATION_RELATIVE);
  const acceptanceItem = tracked.find((item) => item.input_path === ACCEPTANCE_RELATIVE);
  const holdsItem = tracked.find((item) => item.input_path === TERRITORIAL_HOLDS_RELATIVE);
  const notesItem = tracked.find((item) => item.input_path === IDENTITY_NOTES_RELATIVE);
  if (
    !registerItem ||
    !draftItem ||
    !countsItem ||
    !gapsItem ||
    !metadataItem ||
    !validationItem ||
    !acceptanceItem ||
    !holdsItem ||
    !notesItem
  ) {
    throw new UkrainePreflightError(
      "package_inventory",
      "Ukraine register, tiers, counts, gaps, holds, identity notes, metadata, or validation files are missing.",
      intendedInventory,
    );
  }

  let tierRows: UkraineTierOffice[];
  try {
    const parsed = readJson(tierItem.absPath);
    if (!Array.isArray(parsed)) throw new Error("tier file is not an array");
    tierRows = parsed.map((row, tier_index) => {
      const item = row as Record<string, unknown>;
      return {
        office_id: String(item.office_id ?? ""),
        tier: String(item.tier ?? "") as UkraineDraftTier,
        draft_tier: String(item.draft_tier ?? "") as UkraineDraftTier,
        status: String(item.status ?? ""),
        justin_approved: item.justin_approved === true,
        rationale: String(item.basis ?? ""),
        applied: item.applied === true,
        tier_index,
      };
    });
  } catch (error) {
    throw new UkrainePreflightError(
      "tier_unreadable",
      `Ukraine tier file is not a valid tier array: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  if (tierRows.length !== EXPECTED_COUNTS.offices) {
    throw new UkrainePreflightError("office_count", `Ukraine tier rows ${tierRows.length} is not ${EXPECTED_COUNTS.offices}.`, intendedInventory);
  }

  const draftParsed = readJsonl(draftItem.absPath);
  if (draftParsed.length !== EXPECTED_COUNTS.offices) {
    throw new UkrainePreflightError("office_count", "Ukraine draft-tiers.jsonl row count drifted.", intendedInventory);
  }
  const drafts: UkraineDraftOffice[] = draftParsed.map((row) => {
    const item = row as Record<string, unknown>;
    return {
      office_id: String(item.office_id ?? ""),
      draft_tier: String(item.draft_tier ?? "") as UkraineDraftTier,
      status: String(item.status ?? ""),
      justin_approved: item.justin_approved === true,
      basis: String(item.basis ?? ""),
      applied: item.applied === true,
    };
  });
  const draftById = new Map(drafts.map((row) => [row.office_id, row]));
  const tierById = new Map<string, UkraineTierOffice>();
  for (const tier of tierRows) {
    if (tierById.has(tier.office_id)) {
      throw new UkrainePreflightError("duplicate_office", `Duplicate Ukraine tier ${tier.office_id}.`, intendedInventory);
    }
    if (tier.tier !== tier.draft_tier) {
      throw new UkrainePreflightError("numeric_tier", `Ukraine tier ${tier.office_id} draft_tier and tier differ.`, intendedInventory);
    }
    tierById.set(tier.office_id, tier);
  }

  const registerParsed = readJsonl(registerItem.absPath);
  if (registerParsed.length !== EXPECTED_COUNTS.offices) {
    throw new UkrainePreflightError(
      "office_count",
      `Ukraine office register has ${registerParsed.length} rows, not ${EXPECTED_COUNTS.offices}.`,
      intendedInventory,
    );
  }

  const offices: UkraineRegisterOffice[] = [];
  const seen = new Set<string>();
  const draftHistogram = new Map<string, number>();
  const territoryParents = new Map<string, string | null>();
  const territoryNames = new Map<string, string>();
  let unnamedHeads = 0;
  for (const [index, rawUnknown] of registerParsed.entries()) {
    if (!rawUnknown || typeof rawUnknown !== "object" || Array.isArray(rawUnknown)) {
      throw new UkrainePreflightError("office_register", `Register row ${index} is not an object.`, intendedInventory);
    }
    const raw = rawUnknown as Record<string, unknown>;
    const officeId = String(raw.office_id ?? "");
    for (const field of Object.keys(raw)) {
      if (!REGISTER_KEYS.has(field)) {
        throw new UkrainePreflightError("office_register", `Refusing undocumented Ukraine office field ${field} on ${officeId}.`, intendedInventory);
      }
    }
    if (raw.successor_id != null || raw.predecessor_id != null) {
      throw new UkrainePreflightError("successor_edge", `Office ${officeId} supplies a successor or predecessor. None are imported.`, intendedInventory);
    }
    if (raw.country_scope !== "Ukraine") {
      throw new UkrainePreflightError("office_register", `Office ${officeId} is outside Ukraine scope.`, intendedInventory);
    }
    if (raw.institutional_scope !== "Ukrainian_institution" || raw.ep_office !== false) {
      throw new UkrainePreflightError("office_register", `Office ${officeId} is an EP or non-Ukrainian institution.`, intendedInventory);
    }
    if (raw.justin_approved !== false || raw.applied !== false) {
      throw new UkrainePreflightError("review_status", `Office ${officeId} must stay justin_approved false and unapplied.`, intendedInventory);
    }
    if (raw.effective_from != null || raw.effective_to != null) {
      throw new UkrainePreflightError("office_register", `Office ${officeId} must not gain an effective date.`, intendedInventory);
    }
    const officeKind = String(raw.office_kind ?? "");
    const scopeLevel = String(raw.scope_level ?? "");
    const officeType = officeTypeFor(officeKind, scopeLevel);
    const direct = raw.is_direct_executive === true;
    if (direct !== (officeKind === "direct_executive") || direct !== isDirectExecutive(officeType)) {
      throw new UkrainePreflightError("office_register", `Office ${officeId} direct-executive flag drifted.`, intendedInventory);
    }
    const geographyId = geographyIdFor(officeId, scopeLevel, raw.territory_code);
    const office: UkraineRegisterOffice = {
      office_id: officeId,
      id_namespace: CURRENT_NAMESPACE,
      country_id: COUNTRY_ID,
      country_code: COUNTRY_CODE,
      name: String(raw.name_local ?? ""),
      office_type: officeType,
      scope_level: scopeLevel,
      geography_id: geographyId,
      office_status: String(raw.office_status ?? "") as UkraineRegisterStatus,
      selection_mode: String(raw.selection_mode ?? ""),
      direct_executive: direct,
      successor_office_id: null,
      predecessor_office_id: null,
      register_index: index,
      raw,
    };
    if (!office.office_id || seen.has(office.office_id)) {
      throw new UkrainePreflightError("duplicate_office", `Duplicate or blank Ukraine office ${office.office_id}.`, intendedInventory);
    }
    seen.add(office.office_id);
    assertAllowedOfficeIdentity(office.office_id, office.office_type, office.name);
    if (!REGISTER_STATUSES.has(office.office_status) || office.selection_mode !== "direct_popular") {
      throw new UkrainePreflightError("office_status", `Office ${office.office_id} status or selection mode drifted.`, intendedInventory);
    }
    if (!Array.isArray(raw.source_ids) || raw.source_ids.length === 0) {
      throw new UkrainePreflightError("office_register", `Office ${office.office_id} is missing source ids.`, intendedInventory);
    }
    const historical = office.office_status === "historical_only";
    const historicalId = Object.prototype.hasOwnProperty.call(HISTORICAL_GEOGRAPHY_IDS, office.office_id);
    if (historical !== historicalId) {
      throw new UkrainePreflightError("office_status", `Historical identity drifted for ${office.office_id}.`, intendedInventory);
    }
    if (historical || scopeLevel === "national") {
      if (raw.territory_code != null) {
        throw new UkrainePreflightError("geography", `Office ${office.office_id} must not invent a territory code.`, intendedInventory);
      }
    } else {
      const code = raw.territory_code;
      if (typeof code !== "string" || !TERRITORY_CODE_RE.test(code)) {
        throw new UkrainePreflightError("geography", `Office ${office.office_id} territory code drifted.`, intendedInventory);
      }
      const name = String(raw.territory_name ?? "");
      if (!name.trim()) {
        throw new UkrainePreflightError("geography", `Office ${office.office_id} is missing a territory name.`, intendedInventory);
      }
      const parent = raw.parent_territory_code == null ? null : String(raw.parent_territory_code);
      if (parent != null && !TERRITORY_CODE_RE.test(parent)) {
        throw new UkrainePreflightError("geography", `Office ${office.office_id} parent territory code drifted.`, intendedInventory);
      }
      const priorParent = territoryParents.get(code);
      if (priorParent !== undefined && priorParent !== parent) {
        throw new UkrainePreflightError("geography", `Territory ${code} has conflicting parents.`, intendedInventory);
      }
      const priorName = territoryNames.get(code);
      if (priorName !== undefined && priorName !== name) {
        throw new UkrainePreflightError("geography", `Territory ${code} has conflicting names.`, intendedInventory);
      }
      territoryParents.set(code, parent);
      territoryNames.set(code, name);
      if (raw.wartime_hold_id !== "UA-BD-G03") {
        throw new UkrainePreflightError("named_holds", `Current office ${office.office_id} lost the nationwide upcoming-date hold.`, intendedInventory);
      }
    }
    if (office.office_type === "mayor" && raw.head_record_named === false) unnamedHeads += 1;
    const tier = tierById.get(office.office_id);
    const draft = draftById.get(office.office_id);
    if (!tier || !draft) {
      throw new UkrainePreflightError("numeric_tier", `Office ${office.office_id} is missing a draft or schema tier row.`, intendedInventory);
    }
    const expectedTier = expectedDraftTier(office.scope_level);
    if (
      tier.tier !== expectedTier ||
      draft.draft_tier !== expectedTier ||
      tier.draft_tier !== draft.draft_tier ||
      tier.rationale !== draft.basis ||
      !tier.rationale.trim()
    ) {
      throw new UkrainePreflightError("numeric_tier", `Office ${office.office_id} draft tier does not match the schema tier file.`, intendedInventory);
    }
    if (
      tier.justin_approved !== false ||
      draft.justin_approved !== false ||
      draft.applied !== false ||
      tier.applied !== false ||
      draft.status !== "draft_unapproved" ||
      tier.status !== "draft_unapproved"
    ) {
      throw new UkrainePreflightError(
        "review_status",
        `Office ${office.office_id} must stay justin_approved false and draft_unapproved.`,
        intendedInventory,
      );
    }
    if (!DRAFT_TIERS.has(tier.tier)) {
      throw new UkrainePreflightError("numeric_tier", `Office ${office.office_id} draft tier ${tier.tier} is not a supplied tier.`, intendedInventory);
    }
    draftHistogram.set(tier.tier, (draftHistogram.get(tier.tier) ?? 0) + 1);
    offices.push(office);
  }
  if (
    draftHistogram.get("national") !== EXPECTED_COUNTS.draft_tier_national ||
    draftHistogram.get("regional") !== EXPECTED_COUNTS.draft_tier_regional ||
    draftHistogram.get("autonomous") !== EXPECTED_COUNTS.draft_tier_autonomous ||
    draftHistogram.get("raion") !== EXPECTED_COUNTS.draft_tier_raion ||
    draftHistogram.get("local") !== EXPECTED_COUNTS.draft_tier_local ||
    draftHistogram.get("city_district") !== EXPECTED_COUNTS.draft_tier_city_district ||
    unnamedHeads !== EXPECTED_COUNTS.unnamed_current_heads
  ) {
    throw new UkrainePreflightError("numeric_tier", "Ukraine draft tier histogram or unnamed-head count drifted.", intendedInventory);
  }

  const geographies = buildGeographies(offices, territoryParents, territoryNames, intendedInventory);
  if (geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new UkrainePreflightError("geography", `Ukraine geography count ${geographies.length} drifted.`, intendedInventory);
  }
  const nullParents = geographies.filter((row) => row.parent_geography_id == null);
  if (nullParents.length !== EXPECTED_COUNTS.geographies_without_parent) {
    throw new UkrainePreflightError("geography", "Ukraine null-parent geography count drifted.", intendedInventory);
  }
  const parentsLeftNull = [...territoryParents.entries()].filter(([, parent]) => parent != null && !territoryParents.has(parent));
  const parentsLeftNullCount = parentsLeftNull.length;
  if (parentsLeftNullCount !== EXPECTED_COUNTS.parents_left_null) {
    throw new UkrainePreflightError("geography", "Ukraine unresolved parent-territory count drifted.", intendedInventory);
  }
  for (const [, parent] of parentsLeftNull) {
    if (!parent || !PARENTS_WITHOUT_OFFICE_GEOGRAPHY.has(parent)) {
      throw new UkrainePreflightError("geography", `Refusing to invent a geography for parent ${parent}.`, intendedInventory);
    }
  }
  if (hasParentCycle(geographies)) {
    throw new UkrainePreflightError("geography", "Ukraine geography parents contain a cycle.", intendedInventory);
  }

  const gapParsed = readJson(gapsItem.absPath);
  if (!Array.isArray(gapParsed) || gapParsed.length !== OPEN_HOLD_IDS.length) {
    throw new UkrainePreflightError("named_holds", "Ukraine research-gap count drifted.", intendedInventory);
  }
  const gaps: UkraineGap[] = gapParsed.map((row) => {
    const item = row as Record<string, unknown>;
    return {
      gap_id: String(item.gap_id ?? ""),
      title: String(item.title ?? ""),
      status: String(item.status ?? ""),
      treatment: String(item.remaining_hold ?? ""),
      justin_approved: item.justin_approved === true,
    };
  });
  if (
    gaps.some(
      (gap, index) =>
        gap.gap_id !== OPEN_HOLD_IDS[index] ||
        gap.status !== GAP_STATUS[OPEN_HOLD_IDS[index]] ||
        gap.justin_approved ||
        !gap.treatment.trim() ||
        !gap.title.trim(),
    )
  ) {
    throw new UkrainePreflightError("named_holds", "Ukraine named holds drifted or a hold was closed.", intendedInventory);
  }

  const notes = readJsonl(notesItem.absPath);
  if (notes.length !== 4) {
    throw new UkrainePreflightError("successor_edge", "Ukraine identity-note row count drifted.", intendedInventory);
  }
  for (const rowUnknown of notes) {
    const row = rowUnknown as Record<string, unknown>;
    if (row.successor_edge_created !== false || row.effective_date != null) {
      throw new UkrainePreflightError("successor_edge", "Ukraine identity notes must not create a successor edge or an effective date.", intendedInventory);
    }
  }

  const holds = readJsonl(holdsItem.absPath);
  if (holds.length !== EXPECTED_COUNTS.territorial_hold_rows) {
    throw new UkrainePreflightError("named_holds", "Ukraine territorial-hold row count drifted.", intendedInventory);
  }
  for (const rowUnknown of holds) {
    const row = rowUnknown as Record<string, unknown>;
    if (row.office_created !== false || row.result_rows_created !== false || row.current_control_census !== false) {
      throw new UkrainePreflightError(
        "named_holds",
        "A territorial hold created an office, a result, or a control-census claim.",
        intendedInventory,
      );
    }
  }

  const counts = readJson(countsItem.absPath) as Record<string, unknown>;
  const histogram = (counts.draft_tier_histogram ?? {}) as Record<string, unknown>;
  if (
    counts.current_offices !== EXPECTED_COUNTS.current_offices ||
    counts.historical_only_offices !== EXPECTED_COUNTS.historical_offices ||
    counts.total_offices !== EXPECTED_COUNTS.offices ||
    counts.current_direct_executives !== EXPECTED_COUNTS.current_direct_executives ||
    counts.current_councils !== EXPECTED_COUNTS.current_councils ||
    counts.current_municipal_head_offices !== EXPECTED_COUNTS.current_local_mayors ||
    counts.current_national_legislatures !== EXPECTED_COUNTS.current_legislatures ||
    counts.ep_offices !== 0 ||
    counts.occupying_power_offices !== 0 ||
    counts.territorial_hold_rows !== EXPECTED_COUNTS.territorial_hold_rows ||
    histogram.national !== EXPECTED_COUNTS.draft_tier_national ||
    histogram.regional !== EXPECTED_COUNTS.draft_tier_regional ||
    histogram.autonomous !== EXPECTED_COUNTS.draft_tier_autonomous ||
    histogram.raion !== EXPECTED_COUNTS.draft_tier_raion ||
    histogram.local !== EXPECTED_COUNTS.draft_tier_local ||
    histogram.city_district !== EXPECTED_COUNTS.draft_tier_city_district
  ) {
    throw new UkrainePreflightError("office_count", "Ukraine counts.json office figures drifted.", intendedInventory);
  }
  if (counts.events !== FULL_PACK_DOCUMENTED_EVENTS || counts.results !== FULL_PACK_DOCUMENTED_RESULTS) {
    throw new UkrainePreflightError(
      "counts_file",
      "Ukraine counts.json event/result figures drifted. Publication still stays 0 and does not emit omitted totals.",
      intendedInventory,
    );
  }

  const metadata = readJson(metadataItem.absPath) as {
    research_coverage_complete?: boolean;
    applied_changes?: number;
    justin_approvals?: Record<string, boolean>;
    guessed_successor_edges?: number;
    ep_offices?: number;
    occupying_power_offices?: number;
    country_code?: string;
    country_scope?: string;
  };
  const approvals = metadata.justin_approvals ?? {};
  if (
    metadata.research_coverage_complete !== false ||
    metadata.applied_changes !== 0 ||
    metadata.guessed_successor_edges !== 0 ||
    metadata.ep_offices !== 0 ||
    metadata.occupying_power_offices !== 0 ||
    metadata.country_code !== COUNTRY_CODE ||
    metadata.country_scope !== COUNTRY_NAME ||
    Object.values(approvals).some((value) => value !== false)
  ) {
    throw new UkrainePreflightError("coverage", "Ukraine metadata must stay unapproved with research_coverage_complete false.", intendedInventory);
  }
  const validation = readJson(validationItem.absPath) as {
    status?: string;
    applied_changes?: number;
    current_offices?: number;
    historical_only_offices?: number;
    events?: number;
    results?: number;
    ep_offices?: number;
    research_holds_closed?: number;
    justin_approvals_checked?: number;
  };
  if (
    validation.status !== "PASS" ||
    validation.applied_changes !== 0 ||
    validation.current_offices !== EXPECTED_COUNTS.current_offices ||
    validation.historical_only_offices !== EXPECTED_COUNTS.historical_offices ||
    validation.events !== FULL_PACK_DOCUMENTED_EVENTS ||
    validation.results !== FULL_PACK_DOCUMENTED_RESULTS ||
    validation.ep_offices !== 0 ||
    validation.research_holds_closed !== 0 ||
    validation.justin_approvals_checked !== 0
  ) {
    throw new UkrainePreflightError(
      "coverage",
      "Ukraine validation-report.json must stay the pre-import PASS receipt. Documentary events and results are not published.",
      intendedInventory,
    );
  }
  const acceptance = readFileSync(acceptanceItem.absPath, "utf8");
  if (!acceptance.includes(FULL_ZIP_SHA256) || !acceptance.includes("UA-BD-G01") || !acceptance.includes("UA-BD-G19")) {
    throw new UkrainePreflightError("coverage", "Ukraine acceptance receipt drifted from the documentary ZIP SHA or hold range.", intendedInventory);
  }

  const currentDirect = offices.filter((office) => office.office_status === "current" && office.direct_executive).length;
  const historicalDirect = offices.filter((office) => office.office_status === "historical_only" && office.direct_executive).length;
  const ep = offices.filter((office) => office.raw.ep_office === true || /european parliament|європейськ(ий|ого) парламент|\bEP\b/i.test(`${office.office_id} ${office.office_type} ${office.name}`)).length;
  const occupying = offices.filter((office) => office.raw.institutional_scope !== "Ukrainian_institution").length;
  if (
    currentDirect !== EXPECTED_COUNTS.current_direct_executives ||
    historicalDirect !== EXPECTED_COUNTS.historical_direct_executives ||
    ep !== 0 ||
    occupying !== 0
  ) {
    throw new UkrainePreflightError("office_count", "Ukraine direct-executive or excluded-scope count drifted.", intendedInventory);
  }

  const hashInputs = buildHashInputs({
    inputs: tracked.map(({ input_path, input_kind, sha256, byte_count }) => ({
      input_path,
      input_kind,
      sha256,
      byte_count,
    })),
  });
  const fingerprint = fingerprintSha256(hashInputs);
  const releaseId = releaseIdFor(fingerprint);
  return {
    root,
    tierPath: TIER_PATH,
    gitCommit,
    tracked,
    byPath: new Map(tracked.map((item) => [item.input_path, item])),
    fingerprint,
    releaseId,
    hashInputsJson: canonical(hashInputs),
    hashInputs,
    tiers: tierRows,
    drafts,
    offices,
    geographies,
    gaps,
    successorEdges: 0,
    parentsLeftNull: parentsLeftNullCount,
    territorialHoldRows: holds.length,
    metadata: {
      research_coverage_complete: false,
      applied_changes: 0,
      justin_approved: false,
    },
    intendedInventory,
  };
}

function geographyIdFor(officeId: string, scopeLevel: string, territoryCode: unknown): string {
  if (scopeLevel === "national") return COUNTRY_GEOGRAPHY_ID;
  if (typeof territoryCode === "string" && territoryCode) return territoryCode;
  const historical = HISTORICAL_GEOGRAPHY_IDS[officeId];
  if (historical) return historical;
  throw new Error(`Office ${officeId} has no geography`);
}

function buildGeographies(
  offices: UkraineRegisterOffice[],
  territoryParents: Map<string, string | null>,
  territoryNames: Map<string, string>,
  intendedInventory: Record<string, unknown>,
): UkraineGeography[] {
  const officeIdsByGeo = new Map<string, string[]>();
  const firstIndex = new Map<string, number>();
  const names = new Map<string, string>();
  for (const office of offices) {
    const list = officeIdsByGeo.get(office.geography_id) ?? [];
    list.push(office.office_id);
    officeIdsByGeo.set(office.geography_id, list);
    if (!firstIndex.has(office.geography_id)) firstIndex.set(office.geography_id, office.register_index);
    if (office.geography_id === COUNTRY_GEOGRAPHY_ID) names.set(office.geography_id, COUNTRY_NAME);
    else if (territoryNames.has(office.geography_id)) names.set(office.geography_id, territoryNames.get(office.geography_id) ?? "");
    else names.set(office.geography_id, office.name);
  }
  const ordered = [...officeIdsByGeo.keys()];
  const geographies: UkraineGeography[] = ordered.map((geographyId, geography_index) => {
    let parent: string | null = null;
    if (geographyId !== COUNTRY_GEOGRAPHY_ID && territoryParents.has(geographyId)) {
      const supplied = territoryParents.get(geographyId) ?? null;
      parent = supplied && territoryParents.has(supplied) ? supplied : null;
    }
    const name = names.get(geographyId) ?? "";
    if (!name.trim()) {
      throw new UkrainePreflightError("geography", `Geography ${geographyId} is missing a name.`, intendedInventory);
    }
    return {
      geography_id: geographyId,
      name,
      country_id: COUNTRY_ID,
      parent_geography_id: parent,
      geography_index,
      office_ids: officeIdsByGeo.get(geographyId) ?? [],
      source_register_index: firstIndex.get(geographyId) ?? 0,
    };
  });
  for (const geography of geographies) {
    if (geography.office_ids.length === 0) {
      throw new UkrainePreflightError("geography", `Geography ${geography.geography_id} has no office.`, intendedInventory);
    }
  }
  return geographies;
}

function hasParentCycle(geographies: UkraineGeography[]): boolean {
  const parent = new Map(geographies.map((row) => [row.geography_id, row.parent_geography_id]));
  for (const start of parent.keys()) {
    const seen = new Set<string>();
    let cursor: string | null = start;
    while (cursor) {
      if (seen.has(cursor)) return true;
      seen.add(cursor);
      cursor = parent.get(cursor) ?? null;
    }
  }
  return false;
}
