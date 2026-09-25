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
  COUNTS_RELATIVE,
  COUNTRY_ID,
  COUNTRY_NAME,
  CURRENT_NAMESPACE,
  CURRENT_TUZI_ID,
  DOCS_PREFIX,
  DRAFT_TIERS_RELATIVE,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  FULL_PACK_DOCUMENTED_EVENTS,
  FULL_PACK_DOCUMENTED_RESULTS,
  FULL_PACK_DOCUMENTED_SOURCE_EXTRACTS,
  GAP_IDS,
  GAP_STATUS,
  GOLUBOVCI_ID,
  HISTORICAL_TUZI_ID,
  LINEAGE_ID,
  METADATA_RELATIVE,
  METHOD_VERSION,
  MUNICIPALITIES_RELATIVE,
  OFFICE_REGISTER_RELATIVE,
  OMITTED_RESEARCH_DIR,
  PARLIAMENT_ID,
  PINNED_INPUTS,
  PRESIDENT_ID,
  RESEARCH_GAPS_RELATIVE,
  RESULTS_RELATIVE,
  SCHEMA_VERSION,
  SELECTION_MODES,
  SOURCE_INVENTORY_RELATIVE,
  TIER_PATH,
  TIER_SHA256,
  TRANSITIONS_RELATIVE,
  UNIT_KINDS,
  ZETA_ID,
  assertAllowedOfficeIdentity,
  assertKnownRegisterKeys,
  buildHashInputs,
  canonical,
  fingerprintSha256,
  geographyIdForName,
  inputKindFor,
  releaseIdFor,
  sha256Hex,
  type HashInputDescriptor,
  type MontenegroDraftTier,
  type MontenegroRegisterStatus,
} from "./identity";

export type TrackedInput = HashInputDescriptor & {
  absPath: string;
};

export type MontenegroTierOffice = {
  office_id: string;
  id_namespace: string;
  tier: MontenegroDraftTier;
  review_status: string;
  justin_approved: boolean;
  rationale: string;
  classification_kind: string;
};

export type MontenegroRegisterOffice = {
  office_id: string;
  id_namespace: string;
  country_id: string;
  name: string;
  geography: string;
  geography_id: string;
  office_type: string;
  office_status: MontenegroRegisterStatus;
  tier_scope: string;
  selection_mode: string;
  direct_executive: boolean;
  source_ids: string[];
  state_note: string;
  unit_kind: string | null;
  register_index: number;
};

export type MontenegroGeography = {
  geography_id: string;
  name: string;
  country_id: string;
  geography_index: number;
  office_ids: string[];
};

export type MontenegroGap = {
  gap_id: string;
  topic: string;
  status: string;
  detail: string;
};

export type MontenegroTransition = {
  relation_id: string;
  historical_office_id: string;
  related_current_office_id: string;
  successor_office_id: null;
  relation_kind: string;
  effective_label: string;
};

export type MontenegroInventory = {
  root: string;
  tierPath: string;
  gitCommit: string | null;
  tracked: TrackedInput[];
  byPath: Map<string, TrackedInput>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  hashInputs: ReturnType<typeof buildHashInputs>;
  tiers: MontenegroTierOffice[];
  offices: MontenegroRegisterOffice[];
  geographies: MontenegroGeography[];
  gaps: MontenegroGap[];
  transitions: MontenegroTransition[];
  successorEdges: number;
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

export class MontenegroPreflightError extends Error {
  readonly code: string;
  readonly inventory: Record<string, unknown>;
  constructor(code: string, message: string, inventory: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.inventory = inventory;
  }
}

const REGISTER_STATUSES = new Set<string>(["current", "historical_only"]);
const DRAFT_TIERS = new Set<string>(["national", "municipal"]);
const SELECTION_MODE_SET = new Set<string>(SELECTION_MODES);
const UNIT_KIND_SET = new Set<string>(UNIT_KINDS);

function readJsonl(absPath: string): unknown[] {
  const text = readFileSync(absPath, "utf8");
  const rows: unknown[] = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    rows.push(JSON.parse(line) as unknown);
  }
  return rows;
}

function sameTier(left: MontenegroTierOffice, right: MontenegroTierOffice): boolean {
  return canonical(left) === canonical(right);
}

export function scanMontenegroInventory(options: {
  root: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): MontenegroInventory {
  const root = options.root;
  const tierAbs = options.tierPath ?? path.join(root, TIER_PATH);
  const gitCommit = gitHead(root);
  const requireGit = options.requireGitTrackedPackage ?? !options.tierPath;

  const schemaAttempt = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_ATTEMPT_LOG_FILENAME);
  const schemaMaster = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_MASTER_FILENAME);
  if (sha256Hex(readFileSync(schemaAttempt)) !== ATTEMPT_LOG_SHA256) {
    throw new MontenegroPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new MontenegroPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }
  if (existsSync(path.join(root, OMITTED_RESEARCH_DIR))) {
    throw new MontenegroPreflightError(
      "omitted_bytes_present",
      "data/research/montenegro is present. The importer does not adopt a parallel research tree.",
      {},
    );
  }
  if (requireGit && gitTracked(root, OMITTED_RESEARCH_DIR).length !== 0) {
    throw new MontenegroPreflightError(
      "omitted_bytes_present",
      "data/research/montenegro is git-tracked. The importer does not adopt that tree.",
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
      throw new MontenegroPreflightError(
        "package_inventory",
        "Montenegro git-tracked pack does not match the pinned inputs.",
        { missing, extra },
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
    published_result_rows: 0,
    published_events: 0,
    published_sources: 0,
    events_file_not_projected: EVENTS_RELATIVE,
    results_file_not_projected: RESULTS_RELATIVE,
    source_extracts_not_projected: "docs/phase1/montenegro/sources/normalized",
  };

  if (!tierItem || !existsSync(tierItem.absPath)) {
    throw new MontenegroPreflightError("missing_tier", `Montenegro tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }
  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new MontenegroPreflightError(
          "package_hash_mismatch",
          `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`,
          intendedInventory,
        );
      }
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new MontenegroPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} pinned Montenegro inputs, found ${tracked.length}.`,
        intendedInventory,
      );
    }
  }
  if (tierItem.sha256 !== TIER_SHA256 && requireGit) {
    throw new MontenegroPreflightError(
      "tier_hash_mismatch",
      `Montenegro tier SHA-256 mismatch; expected ${TIER_SHA256}.`,
      intendedInventory,
    );
  }

  let tiers: MontenegroTierOffice[];
  try {
    const parsed = JSON.parse(readFileSync(tierItem.absPath, "utf8")) as unknown;
    if (!Array.isArray(parsed)) throw new Error("tier file is not an array");
    tiers = parsed as MontenegroTierOffice[];
  } catch (error) {
    throw new MontenegroPreflightError(
      "tier_unreadable",
      `Montenegro tier file is not a valid tier array: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  if (tiers.length !== EXPECTED_COUNTS.offices) {
    throw new MontenegroPreflightError(
      "office_count",
      `Montenegro tier rows ${tiers.length} is not ${EXPECTED_COUNTS.offices}.`,
      intendedInventory,
    );
  }

  const registerItem = tracked.find((item) => item.input_path === OFFICE_REGISTER_RELATIVE);
  const draftItem = tracked.find((item) => item.input_path === DRAFT_TIERS_RELATIVE);
  const countsItem = tracked.find((item) => item.input_path === COUNTS_RELATIVE);
  const gapsItem = tracked.find((item) => item.input_path === RESEARCH_GAPS_RELATIVE);
  const transitionItem = tracked.find((item) => item.input_path === TRANSITIONS_RELATIVE);
  const metadataItem = tracked.find((item) => item.input_path === METADATA_RELATIVE);
  const approvalItem = tracked.find((item) => item.input_path === APPROVAL_STATE_RELATIVE);
  const sourceItem = tracked.find((item) => item.input_path === SOURCE_INVENTORY_RELATIVE);
  const eventsItem = tracked.find((item) => item.input_path === EVENTS_RELATIVE);
  const resultsItem = tracked.find((item) => item.input_path === RESULTS_RELATIVE);
  const municipalitiesItem = tracked.find((item) => item.input_path === MUNICIPALITIES_RELATIVE);
  if (
    !registerItem ||
    !draftItem ||
    !countsItem ||
    !gapsItem ||
    !transitionItem ||
    !metadataItem ||
    !approvalItem ||
    !sourceItem ||
    !eventsItem ||
    !resultsItem ||
    !municipalitiesItem
  ) {
    throw new MontenegroPreflightError(
      "package_inventory",
      "Montenegro register, tiers, counts, gaps, transitions, metadata, or research files are missing.",
      intendedInventory,
    );
  }

  const draftRows = readJsonl(draftItem.absPath) as MontenegroTierOffice[];
  if (draftRows.length !== EXPECTED_COUNTS.offices) {
    throw new MontenegroPreflightError("office_count", "Montenegro draft-tiers.jsonl row count drifted.", intendedInventory);
  }
  const draftById = new Map(draftRows.map((row) => [row.office_id, row]));
  const tierById = new Map(tiers.map((row) => [row.office_id, row]));

  const registerRows = readJsonl(registerItem.absPath) as Array<Record<string, unknown>>;
  if (registerRows.length !== EXPECTED_COUNTS.offices) {
    throw new MontenegroPreflightError(
      "office_count",
      `Montenegro office register has ${registerRows.length} rows, not ${EXPECTED_COUNTS.offices}.`,
      intendedInventory,
    );
  }

  const offices: MontenegroRegisterOffice[] = [];
  const seen = new Set<string>();
  const draftHistogram = new Map<string, number>();
  const geoSeen = new Map<string, { name: string; officeIds: string[]; index: number }>();
  for (const [index, raw] of registerRows.entries()) {
    const officeId = String(raw.office_id ?? "");
    assertKnownRegisterKeys(officeId, raw);
    const geographyName = String(raw.geography ?? "");
    if (!geographyName.trim()) {
      throw new MontenegroPreflightError("geography", `Office ${officeId} is missing a geography name.`, intendedInventory);
    }
    const geographyId = geographyIdForName(geographyName);
    const prior = geoSeen.get(geographyId);
    if (prior && prior.name !== geographyName) {
      throw new MontenegroPreflightError("geography", `Geography id collision for ${officeId}.`, intendedInventory);
    }
    if (!prior) geoSeen.set(geographyId, { name: geographyName, officeIds: [officeId], index });
    else prior.officeIds.push(officeId);

    const office: MontenegroRegisterOffice = {
      office_id: officeId,
      id_namespace: String(raw.id_namespace ?? ""),
      country_id: COUNTRY_ID,
      name: String(raw.name ?? ""),
      geography: geographyName,
      geography_id: geographyId,
      office_type: String(raw.office_type ?? ""),
      office_status: String(raw.status ?? "") as MontenegroRegisterStatus,
      tier_scope: String(raw.tier_scope ?? ""),
      selection_mode: String(raw.selection_mode ?? ""),
      direct_executive: raw.direct_executive === true,
      source_ids: Array.isArray(raw.source_ids) ? raw.source_ids.map((item) => String(item)) : [],
      state_note: String(raw.state_note ?? ""),
      unit_kind: typeof raw.unit_kind === "string" ? raw.unit_kind : null,
      register_index: index,
    };
    if (seen.has(office.office_id)) {
      throw new MontenegroPreflightError("duplicate_office", `Duplicate Montenegro office ${office.office_id}.`, intendedInventory);
    }
    seen.add(office.office_id);
    const draft = draftById.get(office.office_id);
    const tier = tierById.get(office.office_id);
    if (!draft || !tier || !sameTier(draft, tier)) {
      throw new MontenegroPreflightError(
        "numeric_tier",
        `Office ${office.office_id} draft-tiers.jsonl does not match the schema tier file. Refusing to remap.`,
        intendedInventory,
      );
    }
    if (
      tier.justin_approved !== false ||
      tier.review_status !== "draft_for_human_review" ||
      tier.classification_kind !== "draft_for_human_review" ||
      tier.id_namespace !== CURRENT_NAMESPACE ||
      raw.justin_approved === true
    ) {
      throw new MontenegroPreflightError(
        "review_status",
        `Office ${office.office_id} must stay justin_approved false and review_status draft_for_human_review.`,
        intendedInventory,
      );
    }
    if (!DRAFT_TIERS.has(tier.tier) || !tier.rationale?.trim()) {
      throw new MontenegroPreflightError(
        "numeric_tier",
        `Office ${office.office_id} draft tier ${String(tier.tier)} is not a supplied tier.`,
        intendedInventory,
      );
    }
    assertAllowedOfficeIdentity(office.office_id, office.office_type, office.name);
    if (!REGISTER_STATUSES.has(office.office_status)) {
      throw new MontenegroPreflightError(
        "office_status",
        `Office ${office.office_id} status is not a supplied register value.`,
        intendedInventory,
      );
    }
    if (office.id_namespace !== CURRENT_NAMESPACE) {
      throw new MontenegroPreflightError(
        "office_register",
        `Office ${office.office_id} must stay namespace ${CURRENT_NAMESPACE}.`,
        intendedInventory,
      );
    }
    if (!SELECTION_MODE_SET.has(office.selection_mode) || office.source_ids.length === 0 || !office.state_note.trim()) {
      throw new MontenegroPreflightError(
        "office_register",
        `Office ${office.office_id} selection mode, source ids, or state note drifted.`,
        intendedInventory,
      );
    }
    if (office.unit_kind != null && !UNIT_KIND_SET.has(office.unit_kind)) {
      throw new MontenegroPreflightError("office_register", `Office ${office.office_id} unit kind drifted.`, intendedInventory);
    }
    if (office.office_id === PARLIAMENT_ID) {
      if (
        office.office_type !== "national_legislature" ||
        office.office_status !== "current" ||
        office.direct_executive ||
        office.tier_scope !== "national" ||
        office.selection_mode !== "direct_popular_list_election" ||
        office.geography !== "Montenegro"
      ) {
        throw new MontenegroPreflightError("office_register", "Parliament must stay the current national legislature.", intendedInventory);
      }
    } else if (office.office_id === PRESIDENT_ID) {
      if (
        office.office_type !== "president" ||
        office.office_status !== "current" ||
        !office.direct_executive ||
        office.tier_scope !== "national" ||
        office.selection_mode !== "direct_popular_majority_with_runoff_if_needed" ||
        office.geography !== "Montenegro"
      ) {
        throw new MontenegroPreflightError("office_register", "The President must stay the only direct executive.", intendedInventory);
      }
    } else if (office.office_type === "local_assembly") {
      if (
        office.office_status !== "current" ||
        office.direct_executive ||
        office.tier_scope !== "local" ||
        office.selection_mode !== "direct_popular_list_election" ||
        office.unit_kind == null
      ) {
        throw new MontenegroPreflightError(
          "office_register",
          `Local assembly ${office.office_id} must stay a current non-executive body.`,
          intendedInventory,
        );
      }
    } else if (office.office_type === "historical_nested_local_assembly") {
      if (
        office.office_status !== "historical_only" ||
        office.direct_executive ||
        office.tier_scope !== "local" ||
        office.selection_mode !== "direct_popular_local_assembly" ||
        office.unit_kind != null
      ) {
        throw new MontenegroPreflightError(
          "office_register",
          `Historical assembly ${office.office_id} must stay historical and non-executive.`,
          intendedInventory,
        );
      }
    }
    if (office.direct_executive !== (office.office_id === PRESIDENT_ID)) {
      throw new MontenegroPreflightError(
        "office_register",
        `Office ${office.office_id} direct_executive flag does not match the President-only rule.`,
        intendedInventory,
      );
    }
    const expectedDraft = office.tier_scope === "national" ? "national" : "municipal";
    if (tier.tier !== expectedDraft) {
      throw new MontenegroPreflightError(
        "numeric_tier",
        `Office ${office.office_id} draft tier does not match its tier scope.`,
        intendedInventory,
      );
    }
    draftHistogram.set(tier.tier, (draftHistogram.get(tier.tier) ?? 0) + 1);
    offices.push(office);
  }
  if (seen.size !== draftById.size || seen.size !== tierById.size) {
    throw new MontenegroPreflightError("office_count", "Montenegro tier, draft, and register id sets differ.", intendedInventory);
  }
  if (
    draftHistogram.get("national") !== EXPECTED_COUNTS.draft_tier_national ||
    draftHistogram.get("municipal") !== EXPECTED_COUNTS.draft_tier_municipal
  ) {
    throw new MontenegroPreflightError("numeric_tier", "Montenegro draft tier histogram drifted.", intendedInventory);
  }

  const shared = [...geoSeen.values()].filter((row) => row.officeIds.length > 1);
  if (shared.length !== 1 || shared[0]?.name !== "Montenegro" || shared[0].officeIds.join(",") !== `${PARLIAMENT_ID},${PRESIDENT_ID}`) {
    throw new MontenegroPreflightError(
      "geography",
      "Only Parliament and the President may share a geography, and that geography is Montenegro.",
      intendedInventory,
    );
  }

  const transitionsRaw = JSON.parse(readFileSync(transitionItem.absPath, "utf8")) as Array<Record<string, unknown>>;
  if (!Array.isArray(transitionsRaw) || transitionsRaw.length !== 2) {
    throw new MontenegroPreflightError("crosswalk", "Montenegro transition relations must stay the two supplied rows.", intendedInventory);
  }
  const registerById = new Map(offices.map((row) => [row.office_id, row]));
  const transitions: MontenegroTransition[] = [];
  for (const row of transitionsRaw) {
    if (row.successor_office_id != null) {
      throw new MontenegroPreflightError(
        "crosswalk",
        "Montenegro successor_office_id must stay null. No successor edge is imported.",
        intendedInventory,
      );
    }
    const historicalId = String(row.historical_office_id ?? "");
    const relatedId = String(row.related_current_office_id ?? "");
    const historical = registerById.get(historicalId);
    const related = registerById.get(relatedId);
    if (!historical || historical.office_status !== "historical_only" || !related || related.office_status !== "current") {
      throw new MontenegroPreflightError(
        "crosswalk",
        `Transition ${String(row.relation_id ?? "")} must join a historical office to a current office without merging them.`,
        intendedInventory,
      );
    }
    transitions.push({
      relation_id: String(row.relation_id ?? ""),
      historical_office_id: historicalId,
      related_current_office_id: relatedId,
      successor_office_id: null,
      relation_kind: String(row.relation_kind ?? ""),
      effective_label: String(row.effective_label ?? ""),
    });
  }
  const relationIds = transitions.map((row) => row.relation_id).sort().join(",");
  if (
    relationIds !== "ME-REL-GOLUBOVCI-ZETA-2022,ME-REL-TUZI-2018" ||
    !transitions.some((row) => row.historical_office_id === GOLUBOVCI_ID && row.related_current_office_id === ZETA_ID) ||
    !transitions.some((row) => row.historical_office_id === HISTORICAL_TUZI_ID && row.related_current_office_id === CURRENT_TUZI_ID)
  ) {
    throw new MontenegroPreflightError(
      "crosswalk",
      "Golubovci/Zeta and historical Tuzi/current Tuzi must stay separate identities.",
      intendedInventory,
    );
  }

  const countsFile = JSON.parse(readFileSync(countsItem.absPath, "utf8")) as {
    current_offices: number;
    historical_only_offices: number;
    total_offices: number;
    current_national_offices: number;
    current_local_offices: number;
    current_direct_executives: number;
    current_direct_local_executives: number;
    events: number;
    result_rows: number;
    ep_offices: number;
    applied_changes: number;
    research_coverage_complete: boolean;
    draft_tier_histogram: Record<string, number>;
    national_parliament_events: number;
    presidential_events: number;
    local_events: number;
    current_councils_chambers_assemblies: number;
  };
  if (
    countsFile.total_offices !== EXPECTED_COUNTS.offices ||
    countsFile.current_offices !== EXPECTED_COUNTS.current_offices ||
    countsFile.historical_only_offices !== EXPECTED_COUNTS.historical_offices ||
    countsFile.current_national_offices !== EXPECTED_COUNTS.current_national ||
    countsFile.current_local_offices !== EXPECTED_COUNTS.current_local_assemblies ||
    countsFile.current_direct_executives !== EXPECTED_COUNTS.direct_executive_offices ||
    countsFile.current_direct_local_executives !== 0 ||
    countsFile.ep_offices !== 0 ||
    countsFile.applied_changes !== 0 ||
    countsFile.research_coverage_complete !== false ||
    countsFile.draft_tier_histogram?.national !== EXPECTED_COUNTS.draft_tier_national ||
    countsFile.draft_tier_histogram?.municipal !== EXPECTED_COUNTS.draft_tier_municipal ||
    countsFile.current_councils_chambers_assemblies !== 26
  ) {
    throw new MontenegroPreflightError("office_count", "Montenegro counts.json does not match the accepted pack counts.", intendedInventory);
  }
  if (
    countsFile.events !== FULL_PACK_DOCUMENTED_EVENTS ||
    countsFile.result_rows !== FULL_PACK_DOCUMENTED_RESULTS ||
    countsFile.national_parliament_events !== 6 ||
    countsFile.presidential_events !== 5 ||
    countsFile.local_events !== 60
  ) {
    throw new MontenegroPreflightError(
      "counts_file",
      "Montenegro counts.json event/result figures drifted. Publication still stays 0 and does not emit omitted totals.",
      intendedInventory,
    );
  }
  if (readJsonl(eventsItem.absPath).length !== FULL_PACK_DOCUMENTED_EVENTS) {
    throw new MontenegroPreflightError("counts_file", "Montenegro events.jsonl row count drifted. Rows are not projected.", intendedInventory);
  }
  if (readJsonl(resultsItem.absPath).length !== FULL_PACK_DOCUMENTED_RESULTS) {
    throw new MontenegroPreflightError("counts_file", "Montenegro results.jsonl row count drifted. Rows are not projected.", intendedInventory);
  }

  const gaps = JSON.parse(readFileSync(gapsItem.absPath, "utf8")) as MontenegroGap[];
  if (!Array.isArray(gaps) || gaps.length !== GAP_IDS.length || gaps.map((gap) => gap.gap_id).join(",") !== GAP_IDS.join(",")) {
    throw new MontenegroPreflightError("named_holds", "Montenegro research gaps must stay ME-AY-G01 through ME-AY-G11.", intendedInventory);
  }
  for (const gap of gaps) {
    const expectedStatus = GAP_STATUS[gap.gap_id as (typeof GAP_IDS)[number]];
    if (gap.status !== expectedStatus || !gap.detail?.trim() || !gap.topic?.trim()) {
      throw new MontenegroPreflightError("named_holds", `Hold ${gap.gap_id} status drifted from ${expectedStatus}.`, intendedInventory);
    }
  }

  const metadataFile = JSON.parse(readFileSync(metadataItem.absPath, "utf8")) as {
    applied_changes: number;
    research_coverage_complete: boolean;
    id_namespace: string;
    prompt: string;
    country: string;
    all_justin_approvals_unchecked: boolean;
    research_snapshot: string;
  };
  if (
    metadataFile.applied_changes !== 0 ||
    metadataFile.research_coverage_complete !== false ||
    metadataFile.all_justin_approvals_unchecked !== true ||
    metadataFile.id_namespace !== CURRENT_NAMESPACE ||
    metadataFile.prompt !== "AY" ||
    metadataFile.country !== COUNTRY_NAME ||
    metadataFile.research_snapshot !== "2026-09-23"
  ) {
    throw new MontenegroPreflightError(
      "coverage",
      "Montenegro metadata.json must stay applied_changes 0, research_coverage_complete false, and approvals unchecked.",
      intendedInventory,
    );
  }
  const approval = JSON.parse(readFileSync(approvalItem.absPath, "utf8")) as {
    applied_changes: number;
    justin_approvals?: Record<string, boolean>;
  };
  const approvalValues = Object.values(approval.justin_approvals ?? {});
  if (approval.applied_changes !== 0 || approvalValues.length === 0 || approvalValues.some((value) => value !== false)) {
    throw new MontenegroPreflightError("coverage", "Montenegro approval-state.json must keep every approval false.", intendedInventory);
  }

  const sources = JSON.parse(readFileSync(sourceItem.absPath, "utf8")) as Array<{
    source_id?: string;
    input_path?: string;
    sha256?: string;
  }>;
  if (!Array.isArray(sources) || sources.length !== FULL_PACK_DOCUMENTED_SOURCE_EXTRACTS) {
    throw new MontenegroPreflightError("sources", "Montenegro source inventory must stay 23 normalized extracts.", intendedInventory);
  }
  for (const source of sources) {
    const rel = `docs/phase1/montenegro/${String(source.input_path ?? "")}`;
    const pinned = tracked.find((item) => item.input_path === rel);
    if (!pinned || pinned.sha256 !== source.sha256 || !source.source_id) {
      throw new MontenegroPreflightError(
        "sources",
        `Source extract ${String(source.source_id ?? rel)} does not match the pinned normalized file.`,
        intendedInventory,
      );
    }
  }

  const municipalities = JSON.parse(readFileSync(municipalitiesItem.absPath, "utf8")) as Array<{
    name?: string;
    current?: boolean;
    unit_kind?: string;
  }>;
  const currentAssemblies = offices.filter((row) => row.office_type === "local_assembly");
  const municipalityNames = municipalities.map((row) => String(row.name ?? "")).sort();
  const assemblyNames = currentAssemblies.map((row) => row.geography).sort();
  if (
    municipalities.length !== EXPECTED_COUNTS.current_local_assemblies ||
    municipalities.some((row) => row.current !== true) ||
    municipalityNames.join("\n") !== assemblyNames.join("\n")
  ) {
    throw new MontenegroPreflightError(
      "geography",
      "Current municipality names must match the 25 current local assemblies.",
      intendedInventory,
    );
  }

  const geographies: MontenegroGeography[] = [...geoSeen.entries()].map(([geographyId, row]) => ({
    geography_id: geographyId,
    name: row.name,
    country_id: COUNTRY_ID,
    geography_index: row.index,
    office_ids: row.officeIds,
  }));
  if (geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new MontenegroPreflightError("geography", "Montenegro geography histogram drifted.", intendedInventory);
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
    gaps,
    transitions,
    successorEdges: 0,
    metadata,
    intendedInventory,
  };
}
