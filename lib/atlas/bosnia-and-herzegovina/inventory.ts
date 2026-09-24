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
  BRCKO_ASSEMBLY_ID,
  COUNTS_RELATIVE,
  COUNTRY_ID,
  CURRENT_NAMESPACE,
  DRAFT_TIERS_RELATIVE,
  EXCLUDED_OFFICES_RELATIVE,
  EXPECTED_COUNTS,
  FULL_PACK_DOCUMENTED_EVENTS,
  FULL_PACK_DOCUMENTED_RESULTS,
  FULL_PACK_DOCUMENTED_SOURCE_EXTRACTS,
  GAP_IDS,
  GAP_STATUS,
  GEOGRAPHIES_RELATIVE,
  IDENTITY_VECTOR_BYTE_COUNT,
  IDENTITY_VECTOR_GIT_BLOB,
  IDENTITY_VECTORS_RELATIVE,
  ISTOCNO_SARAJEVO_ASSEMBLY_ID,
  LINEAGE_ID,
  METADATA_RELATIVE,
  METHOD_VERSION,
  OFFICE_REGISTER_RELATIVE,
  OMITTED_PATHS,
  OMITTED_RESEARCH_DIR,
  PINNED_INPUTS,
  PROMPT_O_DOCUMENTED_HISTORY_EVENTS,
  PROMPT_O_DOCUMENTED_OFFICES,
  PROMPT_O_DOCUMENTED_RESULT_ROWS,
  PROMPT_O_OFFICE_CROSSWALK,
  PROMPT_O_PACKAGE_PREFIX,
  PROMPT_O_REFERENCE_RELATIVE,
  RESEARCH_GAPS_RELATIVE,
  RS_PRESIDENT_ID,
  RS_VP_IDS,
  SARAJEVO_COUNCIL_ID,
  SCHEMA_VERSION,
  TIER_PATH,
  TIER_SHA256,
  TRANSITIONS_RELATIVE,
  assertAllowedOfficeIdentity,
  assertKnownRegisterKeys,
  buildHashInputs,
  canonical,
  fingerprintSha256,
  inputKindFor,
  isCouncilType,
  isDirectExecutiveType,
  releaseIdFor,
  sha256Hex,
  type BosniaDraftTier,
  type BosniaLevel,
  type BosniaRegisterStatus,
  type HashInputDescriptor,
} from "./identity";

export type TrackedInput = HashInputDescriptor & {
  absPath: string;
};

export type BosniaTierOffice = {
  office_id: string;
  tier: BosniaDraftTier;
  review_status: string;
  justin_approved: boolean;
  rationale: string;
  classification_kind?: string;
};

export type BosniaRegisterOffice = {
  office_id: string;
  id_namespace: string;
  country_id: string;
  name: string;
  office_type: string;
  level: BosniaLevel;
  tier: BosniaDraftTier;
  office_status: BosniaRegisterStatus;
  selection_mode: string;
  direct_popular: boolean;
  geography: string;
  geography_id: string;
  source_ids: string[];
  state_note?: string;
  entity?: string;
  basic_constituency_code?: string;
  record_state: string;
  registry_qualified: boolean;
  next_date: null;
  next_date_resolution: null;
  justin_approved: boolean;
  direct_executive: boolean;
  register_index: number;
};

export type BosniaGeography = {
  geography_id: string;
  name: string;
  level: string;
  country_id: string;
  parent_geography_id: string | null;
  source_ids: string[];
  geography_index: number;
};

export type BosniaTransition = {
  successor_edge_asserted: boolean;
  former_council_office_id: string;
  former_mayor_office_id: string;
  current_city_council_office_id: string;
  current_city_mayor_office_id: string;
  basic_constituency_code: string;
};

export type BosniaGap = {
  gap_id: string;
  topic: string;
  status: string;
  detail: string;
};

export type BosniaPromptOReference = {
  status: string;
  identity_vector_repo_path: string;
  identity_vector_git_blob_sha: string;
  identity_vector_byte_count: number;
  prior_detailed_result_rows: number;
  prior_historical_events: number;
  prior_offices: number;
  office_crosswalk: Record<string, string>;
  retranscription_policy: string;
};

export type BosniaInventory = {
  root: string;
  tierPath: string;
  gitCommit: string | null;
  tracked: TrackedInput[];
  byPath: Map<string, TrackedInput>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  hashInputs: ReturnType<typeof buildHashInputs>;
  tiers: BosniaTierOffice[];
  offices: BosniaRegisterOffice[];
  geographies: BosniaGeography[];
  transitions: BosniaTransition[];
  promptO: BosniaPromptOReference;
  gaps: BosniaGap[];
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

function gitBlob(root: string, rel: string): string {
  return execFileSync("git", ["-C", root, "hash-object", "--", rel], { encoding: "utf8" }).trim();
}

export class BosniaPreflightError extends Error {
  readonly code: string;
  readonly inventory: Record<string, unknown>;
  constructor(code: string, message: string, inventory: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.inventory = inventory;
  }
}

const REGISTER_STATUSES = new Set<string>(["current", "historical_only"]);
const DRAFT_TIERS = new Set<string>(["national", "regional", "municipal"]);
const LEVELS = new Set<string>(["state", "entity", "canton", "municipal"]);
const SELECTION_MODES = new Set([
  "direct_popular",
  "direct_popular_pr",
  "indirect_from_municipal_councils",
  "indirect_from_municipal_assemblies",
]);
const INDIRECT_OFFICES = new Map<string, string>([
  [SARAJEVO_COUNCIL_ID, "indirect_from_municipal_councils"],
  [ISTOCNO_SARAJEVO_ASSEMBLY_ID, "indirect_from_municipal_assemblies"],
]);

function readJsonl(absPath: string): unknown[] {
  const text = readFileSync(absPath, "utf8");
  const rows: unknown[] = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    rows.push(JSON.parse(line) as unknown);
  }
  return rows;
}

export function scanBosniaInventory(options: {
  root: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): BosniaInventory {
  const root = options.root;
  const tierAbs = options.tierPath ?? path.join(root, TIER_PATH);
  const gitCommit = gitHead(root);
  const requireGit = options.requireGitTrackedPackage ?? !options.tierPath;

  const schemaAttempt = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_ATTEMPT_LOG_FILENAME);
  const schemaMaster = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_MASTER_FILENAME);
  if (sha256Hex(readFileSync(schemaAttempt)) !== ATTEMPT_LOG_SHA256) {
    throw new BosniaPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new BosniaPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  for (const rel of OMITTED_PATHS) {
    if (existsSync(path.join(root, rel))) {
      throw new BosniaPreflightError(
        "omitted_bytes_present",
        `Omitted Bosnia pack path is present: ${rel}. The slim importer does not adopt those bytes.`,
        {},
      );
    }
  }
  if (requireGit && gitTracked(root, OMITTED_RESEARCH_DIR).length !== 0) {
    throw new BosniaPreflightError(
      "omitted_bytes_present",
      "data/research/bosnia-and-herzegovina is git-tracked. The slim importer does not adopt omitted research bytes.",
      {},
    );
  }

  const packagePaths = Object.keys(PINNED_INPUTS).sort();
  if (requireGit) {
    const trackedDocs = gitTracked(root, "docs/phase1/bosnia-and-herzegovina");
    const trackedTier = gitTracked(root, TIER_PATH);
    const tracked = [...trackedDocs, ...trackedTier].sort();
    if (tracked.some((rel) => rel.startsWith(PROMPT_O_PACKAGE_PREFIX))) {
      throw new BosniaPreflightError(
        "package_inventory",
        "The Prompt O country package must not be a slim-land pinned input.",
        { tracked },
      );
    }
    if (tracked.length !== packagePaths.length || tracked.some((rel, index) => rel !== packagePaths[index])) {
      throw new BosniaPreflightError(
        "package_inventory",
        "Bosnia git-tracked pack does not match the pinned slim inputs.",
        { tracked, pinned: packagePaths },
      );
    }
    const blob = gitBlob(root, IDENTITY_VECTORS_RELATIVE);
    if (blob !== IDENTITY_VECTOR_GIT_BLOB) {
      throw new BosniaPreflightError(
        "identity_vector_blob",
        `Bosnia_Identity_Vectors.json git blob ${blob} is not the pinned Prompt O blob ${IDENTITY_VECTOR_GIT_BLOB}.`,
        {},
      );
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
    prompt_o_package_not_publish_source: PROMPT_O_PACKAGE_PREFIX,
    published_result_rows: 0,
    published_events: 0,
    published_sources: 0,
    identity_vector_git_blob: IDENTITY_VECTOR_GIT_BLOB,
  };

  if (!tierItem || !existsSync(tierItem.absPath)) {
    throw new BosniaPreflightError("missing_tier", `Bosnia tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }
  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new BosniaPreflightError(
          "package_hash_mismatch",
          `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`,
          intendedInventory,
        );
      }
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new BosniaPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} pinned Bosnia inputs, found ${tracked.length}.`,
        intendedInventory,
      );
    }
    const vectors = tracked.find((item) => item.input_path === IDENTITY_VECTORS_RELATIVE);
    if (!vectors || vectors.byte_count !== IDENTITY_VECTOR_BYTE_COUNT) {
      throw new BosniaPreflightError(
        "identity_vector_blob",
        "Bosnia_Identity_Vectors.json byte count drifted. The Prompt O blob must stay intact.",
        intendedInventory,
      );
    }
  }
  if (tierItem.sha256 !== TIER_SHA256 && requireGit) {
    throw new BosniaPreflightError(
      "tier_hash_mismatch",
      `Bosnia tier SHA-256 mismatch; expected ${TIER_SHA256}.`,
      intendedInventory,
    );
  }

  let tiers: BosniaTierOffice[];
  try {
    const parsed = JSON.parse(readFileSync(tierItem.absPath, "utf8")) as unknown;
    if (!Array.isArray(parsed)) throw new Error("tier file is not an array");
    tiers = parsed as BosniaTierOffice[];
  } catch (error) {
    throw new BosniaPreflightError(
      "tier_unreadable",
      `Bosnia tier file is not a valid tier array: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  if (tiers.length !== EXPECTED_COUNTS.offices) {
    throw new BosniaPreflightError(
      "office_count",
      `Bosnia tier rows ${tiers.length} is not ${EXPECTED_COUNTS.offices}.`,
      intendedInventory,
    );
  }

  const registerItem = tracked.find((item) => item.input_path === OFFICE_REGISTER_RELATIVE);
  const draftItem = tracked.find((item) => item.input_path === DRAFT_TIERS_RELATIVE);
  const countsItem = tracked.find((item) => item.input_path === COUNTS_RELATIVE);
  const gapsItem = tracked.find((item) => item.input_path === RESEARCH_GAPS_RELATIVE);
  const geoItem = tracked.find((item) => item.input_path === GEOGRAPHIES_RELATIVE);
  const transitionItem = tracked.find((item) => item.input_path === TRANSITIONS_RELATIVE);
  const promptOItem = tracked.find((item) => item.input_path === PROMPT_O_REFERENCE_RELATIVE);
  const excludedItem = tracked.find((item) => item.input_path === EXCLUDED_OFFICES_RELATIVE);
  const metadataItem = tracked.find((item) => item.input_path === METADATA_RELATIVE);
  if (
    !registerItem ||
    !draftItem ||
    !countsItem ||
    !gapsItem ||
    !geoItem ||
    !transitionItem ||
    !promptOItem ||
    !excludedItem ||
    !metadataItem
  ) {
    throw new BosniaPreflightError(
      "package_inventory",
      "Bosnia register, tiers, counts, gaps, geographies, transitions, Prompt O reference, exclusions, or metadata is missing.",
      intendedInventory,
    );
  }

  const draftRows = readJsonl(draftItem.absPath) as BosniaTierOffice[];
  if (draftRows.length !== EXPECTED_COUNTS.offices) {
    throw new BosniaPreflightError("office_count", "Bosnia draft-tiers.jsonl row count drifted.", intendedInventory);
  }
  const draftById = new Map(draftRows.map((row) => [row.office_id, row]));
  const tierById = new Map(tiers.map((row) => [row.office_id, row]));

  const geographyRows = readJsonl(geoItem.absPath) as Array<Omit<BosniaGeography, "geography_index">>;
  if (geographyRows.length !== EXPECTED_COUNTS.geographies) {
    throw new BosniaPreflightError(
      "geography",
      `Bosnia geographies ${geographyRows.length} is not ${EXPECTED_COUNTS.geographies}.`,
      intendedInventory,
    );
  }
  const geographies: BosniaGeography[] = geographyRows.map((row, index) => ({ ...row, geography_index: index }));
  const geoByName = new Map<string, BosniaGeography>();
  const geoLevelHistogram = new Map<string, number>();
  for (const geography of geographies) {
    if (!geography.geography_id || !geography.name?.trim() || geography.country_id !== COUNTRY_ID) {
      throw new BosniaPreflightError("geography", `Geography ${geography.geography_id} is incomplete.`, intendedInventory);
    }
    if (geography.parent_geography_id != null) {
      throw new BosniaPreflightError(
        "geography",
        `Geography ${geography.geography_id} must not gain a parent or an effective interval.`,
        intendedInventory,
      );
    }
    if (geoByName.has(geography.name)) {
      throw new BosniaPreflightError("geography", `Duplicate geography name ${geography.name}.`, intendedInventory);
    }
    geoByName.set(geography.name, geography);
    geoLevelHistogram.set(geography.level, (geoLevelHistogram.get(geography.level) ?? 0) + 1);
  }
  if (
    geoLevelHistogram.get("state") !== EXPECTED_COUNTS.geography_state ||
    geoLevelHistogram.get("entity") !== EXPECTED_COUNTS.geography_entity ||
    geoLevelHistogram.get("canton") !== EXPECTED_COUNTS.geography_canton ||
    geoLevelHistogram.get("municipal") !== EXPECTED_COUNTS.geography_municipal
  ) {
    throw new BosniaPreflightError("geography", "Bosnia geography level histogram drifted.", intendedInventory);
  }

  const registerRows = readJsonl(registerItem.absPath) as Array<Record<string, unknown>>;
  if (registerRows.length !== EXPECTED_COUNTS.offices) {
    throw new BosniaPreflightError(
      "office_count",
      `Bosnia office register has ${registerRows.length} rows, not ${EXPECTED_COUNTS.offices}.`,
      intendedInventory,
    );
  }

  const offices: BosniaRegisterOffice[] = [];
  const seen = new Set<string>();
  const draftHistogram = new Map<string, number>();
  for (const [index, raw] of registerRows.entries()) {
    const officeId = String(raw.office_id ?? "");
    assertKnownRegisterKeys(officeId, raw);
    const geographyName = String(raw.geography ?? "");
    const geography = geoByName.get(geographyName);
    if (!geography) {
      throw new BosniaPreflightError(
        "geography",
        `Office ${officeId} geography ${geographyName} is not in geographies.jsonl.`,
        intendedInventory,
      );
    }
    const office: BosniaRegisterOffice = {
      office_id: officeId,
      id_namespace: String(raw.id_namespace),
      country_id: String(raw.country_id),
      name: String(raw.name),
      office_type: String(raw.office_type),
      level: String(raw.level) as BosniaLevel,
      tier: String(raw.tier) as BosniaDraftTier,
      office_status: String(raw.office_status) as BosniaRegisterStatus,
      selection_mode: String(raw.selection_mode),
      direct_popular: raw.direct_popular === true,
      geography: geographyName,
      geography_id: geography.geography_id,
      source_ids: Array.isArray(raw.source_ids) ? raw.source_ids.map((item) => String(item)) : [],
      ...(typeof raw.state_note === "string" ? { state_note: raw.state_note } : {}),
      ...(typeof raw.entity === "string" ? { entity: raw.entity } : {}),
      ...(typeof raw.basic_constituency_code === "string" ? { basic_constituency_code: raw.basic_constituency_code } : {}),
      record_state: String(raw.record_state),
      registry_qualified: raw.registry_qualified === true,
      next_date: null,
      next_date_resolution: null,
      justin_approved: raw.justin_approved === true,
      direct_executive: isDirectExecutiveType(String(raw.office_type)),
      register_index: index,
    };
    if (seen.has(office.office_id)) {
      throw new BosniaPreflightError("duplicate_office", `Duplicate Bosnia office ${office.office_id}.`, intendedInventory);
    }
    seen.add(office.office_id);
    const draft = draftById.get(office.office_id);
    const tier = tierById.get(office.office_id);
    if (!draft || !tier) {
      throw new BosniaPreflightError(
        "office_count",
        `Office ${office.office_id} is missing from the draft tiers or schema tier file.`,
        intendedInventory,
      );
    }
    if (
      draft.tier !== tier.tier ||
      draft.review_status !== tier.review_status ||
      draft.justin_approved !== tier.justin_approved ||
      draft.rationale !== tier.rationale
    ) {
      throw new BosniaPreflightError(
        "numeric_tier",
        `Office ${office.office_id} draft-tiers.jsonl does not match the schema tier file. Refusing to remap.`,
        intendedInventory,
      );
    }
    if (tier.classification_kind !== "draft_for_human_review") {
      throw new BosniaPreflightError(
        "review_status",
        `Office ${office.office_id} classification_kind must stay draft_for_human_review.`,
        intendedInventory,
      );
    }
    if (tier.justin_approved !== false || tier.review_status !== "draft_for_human_review" || office.justin_approved) {
      throw new BosniaPreflightError(
        "review_status",
        `Office ${office.office_id} must stay justin_approved false and review_status draft_for_human_review.`,
        intendedInventory,
      );
    }
    if (!DRAFT_TIERS.has(tier.tier) || office.tier !== tier.tier) {
      throw new BosniaPreflightError(
        "numeric_tier",
        `Office ${office.office_id} draft tier ${String(tier.tier)} does not match the register.`,
        intendedInventory,
      );
    }
    assertAllowedOfficeIdentity(office.office_id, office.office_type, office.name);
    if (!REGISTER_STATUSES.has(office.office_status) || !LEVELS.has(office.level)) {
      throw new BosniaPreflightError(
        "office_status",
        `Office ${office.office_id} status or level is not a supplied register value.`,
        intendedInventory,
      );
    }
    if (office.country_id !== COUNTRY_ID || office.registry_qualified || office.record_state !== "draft_research") {
      throw new BosniaPreflightError(
        "office_register",
        `Office ${office.office_id} must stay country bosnia-and-herzegovina, registry_qualified false, and record_state draft_research.`,
        intendedInventory,
      );
    }
    if (office.id_namespace !== CURRENT_NAMESPACE) {
      throw new BosniaPreflightError(
        "office_register",
        `Office ${office.office_id} must stay in ${CURRENT_NAMESPACE}.`,
        intendedInventory,
      );
    }
    if (raw.next_date != null || raw.next_date_resolution != null) {
      throw new BosniaPreflightError(
        "office_register",
        `Office ${office.office_id} next date must stay null. Supplied labels are not coerced, and none are supplied.`,
        intendedInventory,
      );
    }
    if (!SELECTION_MODES.has(office.selection_mode) || office.source_ids.length === 0) {
      throw new BosniaPreflightError(
        "office_register",
        `Office ${office.office_id} selection mode or source ids drifted.`,
        intendedInventory,
      );
    }
    const indirect = INDIRECT_OFFICES.get(office.office_id);
    if (indirect) {
      if (office.selection_mode !== indirect || office.direct_popular || office.direct_executive || office.office_status !== "current") {
        throw new BosniaPreflightError(
          "office_register",
          `Indirect body ${office.office_id} must stay an indirect current council, not a direct executive.`,
          intendedInventory,
        );
      }
    } else if (office.selection_mode.startsWith("indirect") || office.direct_popular !== true) {
      throw new BosniaPreflightError(
        "office_register",
        `Office ${office.office_id} must not gain an indirect selection mode.`,
        intendedInventory,
      );
    }
    if (office.direct_executive) {
      if (office.selection_mode !== "direct_popular" || !office.direct_popular) {
        throw new BosniaPreflightError(
          "office_register",
          `Direct executive ${office.office_id} must stay direct_popular. No extra mayor is invented.`,
          intendedInventory,
        );
      }
    } else if (!isCouncilType(office.office_type) || office.selection_mode === "direct_popular") {
      throw new BosniaPreflightError(
        "office_register",
        `Office ${office.office_id} type and selection mode are inconsistent.`,
        intendedInventory,
      );
    }
    if ((RS_VP_IDS as readonly string[]).includes(office.office_id)) {
      if (!/constitutional office [12]/.test(office.name) || /bosniak|croat|serb/i.test(office.name)) {
        throw new BosniaPreflightError(
          "office_register",
          `RS vice-president ${office.office_id} must stay the supplied placeholder. No constituent-people identity is invented.`,
          intendedInventory,
        );
      }
    }
    if (office.office_id === BRCKO_ASSEMBLY_ID) {
      if (office.office_type !== "district_assembly" || office.direct_executive || office.office_status !== "current") {
        throw new BosniaPreflightError("office_register", "Brčko must stay the current district assembly, not a mayor.", intendedInventory);
      }
    }
    if (office.office_id === RS_PRESIDENT_ID && (office.office_type !== "entity_direct_executive" || office.level !== "entity")) {
      throw new BosniaPreflightError("office_register", "BA-REG-RS-PRES must stay the RS President.", intendedInventory);
    }
    draftHistogram.set(tier.tier, (draftHistogram.get(tier.tier) ?? 0) + 1);
    offices.push(office);
  }
  if (seen.size !== draftById.size || seen.size !== tierById.size) {
    throw new BosniaPreflightError("office_count", "Bosnia tier, draft, and register id sets differ.", intendedInventory);
  }
  if (
    draftHistogram.get("national") !== EXPECTED_COUNTS.draft_tier_national ||
    draftHistogram.get("regional") !== EXPECTED_COUNTS.draft_tier_regional ||
    draftHistogram.get("municipal") !== EXPECTED_COUNTS.draft_tier_municipal
  ) {
    throw new BosniaPreflightError(
      "numeric_tier",
      `Bosnia draft tiers ${draftHistogram.get("national")}/${draftHistogram.get("regional")}/${draftHistogram.get("municipal")} are not 4/15/327.`,
      intendedInventory,
    );
  }

  const registerById = new Map(offices.map((row) => [row.office_id, row]));
  const transitionsRaw = JSON.parse(readFileSync(transitionItem.absPath, "utf8")) as BosniaTransition[];
  if (!Array.isArray(transitionsRaw) || transitionsRaw.length !== EXPECTED_COUNTS.historical_transitions) {
    throw new BosniaPreflightError("crosswalk", "Bosnia historical transitions must stay 20 rows with no guessed edges.", intendedInventory);
  }
  for (const transition of transitionsRaw) {
    if (transition.successor_edge_asserted !== false) {
      throw new BosniaPreflightError(
        "crosswalk",
        `Transition ${transition.basic_constituency_code} asserts a successor edge. None may be invented.`,
        intendedInventory,
      );
    }
    for (const officeId of [
      transition.former_council_office_id,
      transition.former_mayor_office_id,
      transition.current_city_council_office_id,
      transition.current_city_mayor_office_id,
    ]) {
      const office = registerById.get(officeId);
      if (!office) {
        throw new BosniaPreflightError("crosswalk", `Transition office ${officeId} is not in the register.`, intendedInventory);
      }
    }
    const formerCouncil = registerById.get(transition.former_council_office_id);
    const formerMayor = registerById.get(transition.former_mayor_office_id);
    if (formerCouncil?.office_status !== "historical_only" || formerMayor?.office_status !== "historical_only") {
      throw new BosniaPreflightError("crosswalk", `Transition ${transition.basic_constituency_code} former offices must stay historical_only.`, intendedInventory);
    }
  }

  const promptO = JSON.parse(readFileSync(promptOItem.absPath, "utf8")) as BosniaPromptOReference;
  const crosswalkEntries = Object.entries(PROMPT_O_OFFICE_CROSSWALK);
  const suppliedEntries = Object.entries(promptO.office_crosswalk ?? {});
  if (
    promptO.status !== "retained_prior_research_reference_not_retranscribed" ||
    promptO.identity_vector_repo_path !== IDENTITY_VECTORS_RELATIVE ||
    promptO.identity_vector_git_blob_sha !== IDENTITY_VECTOR_GIT_BLOB ||
    promptO.identity_vector_byte_count !== IDENTITY_VECTOR_BYTE_COUNT ||
    promptO.prior_detailed_result_rows !== PROMPT_O_DOCUMENTED_RESULT_ROWS ||
    promptO.prior_historical_events !== PROMPT_O_DOCUMENTED_HISTORY_EVENTS ||
    promptO.prior_offices !== PROMPT_O_DOCUMENTED_OFFICES ||
    !promptO.retranscription_policy?.includes("not a new import") ||
    suppliedEntries.length !== crosswalkEntries.length ||
    suppliedEntries.some(([prior, next]) => PROMPT_O_OFFICE_CROSSWALK[prior] !== next)
  ) {
    throw new BosniaPreflightError(
      "prompt_o_reference",
      "Prompt O detailed-results reference drifted. It stays documentary and is not re-imported as result rows.",
      intendedInventory,
    );
  }
  for (const nextId of Object.values(promptO.office_crosswalk)) {
    if (!registerById.has(nextId)) {
      throw new BosniaPreflightError("prompt_o_reference", `Prompt O crosswalk target ${nextId} is not an AW office.`, intendedInventory);
    }
  }

  const excluded = JSON.parse(readFileSync(excludedItem.absPath, "utf8")) as Array<{ name?: string }>;
  if (!Array.isArray(excluded) || excluded.length !== 10) {
    throw new BosniaPreflightError("excluded_offices", "Bosnia excluded-offices.json must stay the 10 documented gates.", intendedInventory);
  }
  const officeNames = new Set(offices.map((row) => row.name));
  for (const row of excluded) {
    if (!row.name || officeNames.has(row.name)) {
      throw new BosniaPreflightError("excluded_offices", `Excluded office ${row.name ?? ""} must not be published.`, intendedInventory);
    }
  }

  const countsFile = JSON.parse(readFileSync(countsItem.absPath, "utf8")) as {
    current_offices: number;
    historical_only_offices: number;
    total_offices: number;
    events: number;
    results: number;
    source_extracts: number;
    applied_changes: number;
    justin_approvals_checked: number;
    ep_offices: number;
    research_gaps: number;
    current_state: number;
    current_entity: number;
    current_canton: number;
    current_municipal_local: number;
    current_local_councils_assemblies: number;
    current_local_direct_executives: number;
    current_direct_executive_offices_all_levels: number;
    current_councils_chambers_assemblies: number;
    prompt_o_detailed_numeric_rows_referenced: number;
    prompt_o_detailed_history_events_referenced: number;
    draft_tier_histogram: Record<string, number>;
  };
  if (
    countsFile.total_offices !== EXPECTED_COUNTS.offices ||
    countsFile.current_offices !== EXPECTED_COUNTS.current_offices ||
    countsFile.historical_only_offices !== EXPECTED_COUNTS.historical_offices ||
    countsFile.current_state !== EXPECTED_COUNTS.current_state ||
    countsFile.current_entity !== EXPECTED_COUNTS.current_entity ||
    countsFile.current_canton !== EXPECTED_COUNTS.current_canton ||
    countsFile.current_municipal_local !== EXPECTED_COUNTS.current_municipal_local ||
    countsFile.current_local_councils_assemblies !== EXPECTED_COUNTS.current_local_representative_bodies ||
    countsFile.current_local_direct_executives !== EXPECTED_COUNTS.current_local_direct_executives ||
    countsFile.current_direct_executive_offices_all_levels !== EXPECTED_COUNTS.direct_executive_offices ||
    countsFile.current_councils_chambers_assemblies !== EXPECTED_COUNTS.current_councils_chambers_assemblies ||
    countsFile.ep_offices !== 0 ||
    countsFile.applied_changes !== 0 ||
    countsFile.justin_approvals_checked !== 0 ||
    countsFile.research_gaps !== EXPECTED_COUNTS.named_open_holds ||
    countsFile.draft_tier_histogram?.national !== EXPECTED_COUNTS.draft_tier_national ||
    countsFile.draft_tier_histogram?.regional !== EXPECTED_COUNTS.draft_tier_regional ||
    countsFile.draft_tier_histogram?.municipal !== EXPECTED_COUNTS.draft_tier_municipal ||
    countsFile.prompt_o_detailed_numeric_rows_referenced !== PROMPT_O_DOCUMENTED_RESULT_ROWS ||
    countsFile.prompt_o_detailed_history_events_referenced !== PROMPT_O_DOCUMENTED_HISTORY_EVENTS
  ) {
    throw new BosniaPreflightError("office_count", "Bosnia counts.json does not match the accepted pack counts.", intendedInventory);
  }
  if (
    countsFile.events !== FULL_PACK_DOCUMENTED_EVENTS ||
    countsFile.results !== FULL_PACK_DOCUMENTED_RESULTS ||
    countsFile.source_extracts !== FULL_PACK_DOCUMENTED_SOURCE_EXTRACTS
  ) {
    throw new BosniaPreflightError(
      "counts_file",
      "Bosnia counts.json full-pack event/result/source figures drifted. Slim publish still stays 0 and does not emit omitted totals.",
      intendedInventory,
    );
  }

  const gaps = JSON.parse(readFileSync(gapsItem.absPath, "utf8")) as BosniaGap[];
  if (!Array.isArray(gaps) || gaps.length !== GAP_IDS.length || gaps.map((gap) => gap.gap_id).join(",") !== GAP_IDS.join(",")) {
    throw new BosniaPreflightError("named_holds", "Bosnia research gaps must stay BA-AW-G01 through BA-AW-G09.", intendedInventory);
  }
  for (const gap of gaps) {
    const expectedStatus = GAP_STATUS[gap.gap_id as (typeof GAP_IDS)[number]];
    if (gap.status !== expectedStatus || !gap.detail?.trim() || !gap.topic?.trim()) {
      throw new BosniaPreflightError("named_holds", `Hold ${gap.gap_id} status drifted from ${expectedStatus}.`, intendedInventory);
    }
  }

  const metadataFile = JSON.parse(readFileSync(metadataItem.absPath, "utf8")) as {
    applied_changes: number;
    research_coverage_complete: boolean;
    numeric_result_vector_complete: boolean;
    approval?: Record<string, boolean>;
  };
  const approvalValues = Object.values(metadataFile.approval ?? {});
  if (
    metadataFile.applied_changes !== 0 ||
    metadataFile.research_coverage_complete !== false ||
    metadataFile.numeric_result_vector_complete !== false ||
    approvalValues.length === 0 ||
    approvalValues.some((value) => value !== false)
  ) {
    throw new BosniaPreflightError(
      "coverage",
      "Bosnia metadata.json must stay applied_changes 0, research_coverage_complete false, and every approval false.",
      intendedInventory,
    );
  }

  const metadata = {
    research_coverage_complete: false,
    applied_changes: 0,
    justin_approved: false,
  };

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
    tiers,
    offices,
    geographies,
    transitions: transitionsRaw,
    promptO,
    gaps,
    metadata,
    intendedInventory,
  };
}
