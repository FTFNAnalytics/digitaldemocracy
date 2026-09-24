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
  DRAFT_TIERS_RELATIVE,
  EXPECTED_COUNTS,
  FVG_ID_PREFIX,
  FULL_PACK_DOCUMENTED_EVENTS,
  FULL_PACK_DOCUMENTED_RESULTS,
  HOLD_IDS,
  LINEAGE_ID,
  METHOD_VERSION,
  OFFICE_REGISTER_RELATIVE,
  OMITTED_PATHS,
  OMITTED_RESEARCH_DIR,
  PINNED_INPUTS,
  REGION_CURRENT_OFFICES,
  RESEARCH_GAPS_RELATIVE,
  SCHEMA_VERSION,
  TIER_PATH,
  TIER_SHA256,
  assertAllowedOfficeIdentity,
  assertKnownRegisterKeys,
  buildHashInputs,
  canonical,
  fingerprintSha256,
  inputKindFor,
  releaseIdFor,
  sha256Hex,
  usesCountryGeography,
  type HashInputDescriptor,
  type ItalyRegisterStatus,
} from "./identity";

export type TrackedInput = HashInputDescriptor & {
  absPath: string;
};

export type ItalyTierOffice = {
  office_id: string;
  draft_tier: number;
  review_status: string;
  rationale: string;
  justin_approved: boolean;
};

export type ItalyTierFile = {
  country: string;
  country_code: string;
  prompt: string;
  Justin_accepted: boolean;
  review_status: string;
  draft_for_human_review: boolean;
  office_count: number;
  holds_open: string[];
  offices: ItalyTierOffice[];
};

export type ItalyRegisterOffice = {
  office_id: string;
  country: string;
  name: string;
  office_type: string;
  level: string;
  region_code: string | null;
  territory_code: string | null;
  status: ItalyRegisterStatus;
  selection_mode: string;
  direct_executive: boolean;
  source_id: string;
  legal_source_id: string | null;
  as_of: string;
  effective_from: string | null;
  effective_to: string | null;
  notes: string;
  justin_approved: boolean;
  cadastral_code?: string | null;
  source_row?: number;
  register_line: number;
};

export type ItalyGap = {
  gap_id: string;
  scope: string;
  status: string;
  detail: string;
  resolution_needed: string;
  justin_approved: boolean;
};

export type ItalyInventory = {
  root: string;
  tierPath: string;
  gitCommit: string | null;
  tracked: TrackedInput[];
  byPath: Map<string, TrackedInput>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  hashInputs: ReturnType<typeof buildHashInputs>;
  tiers: ItalyTierFile;
  offices: ItalyRegisterOffice[];
  gaps: ItalyGap[];
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

export class ItalyPreflightError extends Error {
  readonly code: string;
  readonly inventory: Record<string, unknown>;
  constructor(code: string, message: string, inventory: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.inventory = inventory;
  }
}

function readJsonl<T>(absPath: string): T[] {
  const text = readFileSync(absPath, "utf8");
  const rows: T[] = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    rows.push(JSON.parse(line) as T);
  }
  return rows;
}

const REGISTER_STATUSES = new Set<string>(["current", "historical_only", "statutory_pending_first_election"]);

export function scanItalyInventory(options: {
  root: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): ItalyInventory {
  const root = options.root;
  const tierAbs = options.tierPath ?? path.join(root, TIER_PATH);
  const gitCommit = gitHead(root);
  const requireGit = options.requireGitTrackedPackage ?? !options.tierPath;

  const schemaAttempt = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_ATTEMPT_LOG_FILENAME);
  const schemaMaster = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_MASTER_FILENAME);
  if (sha256Hex(readFileSync(schemaAttempt)) !== ATTEMPT_LOG_SHA256) {
    throw new ItalyPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new ItalyPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  for (const rel of OMITTED_PATHS) {
    if (existsSync(path.join(root, rel))) {
      throw new ItalyPreflightError(
        "omitted_bytes_present",
        `Omitted Italy pack path is present: ${rel}. The slim importer does not adopt those bytes.`,
        {},
      );
    }
  }
  if (requireGit && gitTracked(root, OMITTED_RESEARCH_DIR).length !== 0) {
    throw new ItalyPreflightError(
      "omitted_bytes_present",
      "data/research/italy is git-tracked. The slim importer does not adopt omitted research bytes.",
      {},
    );
  }

  const packagePaths = Object.keys(PINNED_INPUTS).sort();
  if (requireGit) {
    const trackedDocs = gitTracked(root, "docs/phase1/italy");
    const trackedTier = gitTracked(root, TIER_PATH);
    const tracked = [...trackedDocs, ...trackedTier].sort();
    if (tracked.length !== packagePaths.length || tracked.some((rel, index) => rel !== packagePaths[index])) {
      throw new ItalyPreflightError(
        "package_inventory",
        "Italy git-tracked pack does not match the pinned slim inputs.",
        { tracked, pinned: packagePaths },
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
    published_result_rows: 0,
    published_events: 0,
  };

  if (!tierItem || !existsSync(tierItem.absPath)) {
    throw new ItalyPreflightError("missing_tier", `Italy tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }
  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new ItalyPreflightError(
          "package_hash_mismatch",
          `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`,
          intendedInventory,
        );
      }
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new ItalyPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} pinned Italy inputs, found ${tracked.length}.`,
        intendedInventory,
      );
    }
  }
  if (tierItem.sha256 !== TIER_SHA256 && requireGit) {
    throw new ItalyPreflightError(
      "tier_hash_mismatch",
      `Italy tier SHA-256 mismatch; expected ${TIER_SHA256}.`,
      intendedInventory,
    );
  }

  let tiers: ItalyTierFile;
  try {
    tiers = JSON.parse(readFileSync(tierItem.absPath, "utf8")) as ItalyTierFile;
  } catch (error) {
    throw new ItalyPreflightError(
      "tier_unreadable",
      `Italy tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  if (tiers.Justin_accepted !== false || tiers.draft_for_human_review !== true || tiers.review_status !== "needs_review") {
    throw new ItalyPreflightError(
      "tier_receipt",
      "Italy tier file must stay Justin_accepted false, draft_for_human_review true, and review_status needs_review.",
      intendedInventory,
    );
  }
  if (tiers.country !== "italy" || tiers.country_code !== "IT" || tiers.prompt !== "AT") {
    throw new ItalyPreflightError("tier_receipt", "Italy tier file country/prompt drifted.", intendedInventory);
  }
  if (!Array.isArray(tiers.holds_open) || tiers.holds_open.join(",") !== HOLD_IDS.join(",")) {
    throw new ItalyPreflightError("named_holds", "Italy tier holds_open must stay IT-G01 through IT-G19.", intendedInventory);
  }
  if (!Array.isArray(tiers.offices) || tiers.offices.length !== EXPECTED_COUNTS.offices || tiers.office_count !== EXPECTED_COUNTS.offices) {
    throw new ItalyPreflightError(
      "office_count",
      `Italy tier office_count ${tiers.office_count} / rows ${tiers.offices?.length} is not ${EXPECTED_COUNTS.offices}.`,
      intendedInventory,
    );
  }

  const registerItem = tracked.find((item) => item.input_path === OFFICE_REGISTER_RELATIVE);
  const draftItem = tracked.find((item) => item.input_path === DRAFT_TIERS_RELATIVE);
  const countsItem = tracked.find((item) => item.input_path === COUNTS_RELATIVE);
  const gapsItem = tracked.find((item) => item.input_path === RESEARCH_GAPS_RELATIVE);
  const approvalItem = tracked.find((item) => item.input_path === APPROVAL_STATE_RELATIVE);
  if (!registerItem || !draftItem || !countsItem || !gapsItem || !approvalItem) {
    throw new ItalyPreflightError("package_inventory", "Italy register, tiers, counts, gaps, or approval state is missing.", intendedInventory);
  }

  const offices: ItalyRegisterOffice[] = [];
  const registerLines = readFileSync(registerItem.absPath, "utf8").split("\n");
  for (let index = 0; index < registerLines.length; index++) {
    const line = registerLines[index] ?? "";
    if (!line.trim()) continue;
    const row = JSON.parse(line) as Omit<ItalyRegisterOffice, "register_line">;
    assertKnownRegisterKeys(String(row.office_id), row);
    offices.push({ ...row, register_line: index + 1 });
  }
  if (offices.length !== EXPECTED_COUNTS.offices) {
    throw new ItalyPreflightError(
      "office_count",
      `Italy office register has ${offices.length} rows, not ${EXPECTED_COUNTS.offices}.`,
      intendedInventory,
    );
  }

  const draftRows = readJsonl<ItalyTierOffice>(draftItem.absPath);
  if (draftRows.length !== EXPECTED_COUNTS.offices) {
    throw new ItalyPreflightError("office_count", "Italy draft-tiers.jsonl row count drifted.", intendedInventory);
  }
  const draftById = new Map(draftRows.map((row) => [row.office_id, row]));
  const registerById = new Map(offices.map((row) => [row.office_id, row]));

  const seen = new Set<string>();
  const draftHistogram = new Map<number, number>();
  for (const office of tiers.offices) {
    if (seen.has(office.office_id)) {
      throw new ItalyPreflightError("duplicate_office", `Duplicate Italy office ${office.office_id}.`, intendedInventory);
    }
    seen.add(office.office_id);
    if (office.justin_approved !== false || office.review_status !== "unapproved_draft") {
      throw new ItalyPreflightError(
        "review_status",
        `Office ${office.office_id} must stay justin_approved false and review_status unapproved_draft.`,
        intendedInventory,
      );
    }
    if (office.draft_tier !== 1 && office.draft_tier !== 2 && office.draft_tier !== 3 && office.draft_tier !== 4) {
      throw new ItalyPreflightError(
        "numeric_tier",
        `Office ${office.office_id} numeric tier ${office.draft_tier} is not 1–4.`,
        intendedInventory,
      );
    }
    const draft = draftById.get(office.office_id);
    const register = registerById.get(office.office_id);
    if (!draft || !register) {
      throw new ItalyPreflightError(
        "office_count",
        `Office ${office.office_id} is missing from the register or draft-tiers file.`,
        intendedInventory,
      );
    }
    if (
      draft.draft_tier !== office.draft_tier ||
      draft.review_status !== office.review_status ||
      draft.justin_approved !== office.justin_approved ||
      draft.rationale !== office.rationale
    ) {
      throw new ItalyPreflightError(
        "numeric_tier",
        `Office ${office.office_id} draft-tiers.jsonl does not match the schema tier file. Refusing to remap.`,
        intendedInventory,
      );
    }
    assertAllowedOfficeIdentity(register.office_id, register.office_type, register.name);
    if (!REGISTER_STATUSES.has(register.status)) {
      throw new ItalyPreflightError(
        "office_status",
        `Office ${register.office_id} register status ${String(register.status)} is not current, historical_only, or statutory_pending_first_election.`,
        intendedInventory,
      );
    }
    if (register.country !== "IT" || register.justin_approved !== false) {
      throw new ItalyPreflightError("office_register", `Office ${register.office_id} must stay country IT and justin_approved false.`, intendedInventory);
    }
    if (register.effective_from != null) {
      throw new ItalyPreflightError("office_register", `Office ${register.office_id} effective_from must stay null. No date is invented.`, intendedInventory);
    }
    if (register.status === "historical_only") {
      if (!register.office_id.includes(".ended-") || register.effective_to == null) {
        throw new ItalyPreflightError("office_register", `Historical office ${register.office_id} must keep its ended id and effective_to.`, intendedInventory);
      }
    } else if (register.office_id.includes(".ended-") || register.effective_to != null) {
      throw new ItalyPreflightError("office_register", `Office ${register.office_id} is not historical and must not carry an extinction date.`, intendedInventory);
    }
    if (register.status === "statutory_pending_first_election") {
      if (!register.office_id.startsWith(FVG_ID_PREFIX)) {
        throw new ItalyPreflightError("office_register", `Pending office ${register.office_id} is outside the FVG 2026 namespace.`, intendedInventory);
      }
    } else if (register.office_id.startsWith(FVG_ID_PREFIX)) {
      throw new ItalyPreflightError("office_register", `FVG office ${register.office_id} must stay statutory_pending_first_election.`, intendedInventory);
    }
    if (usesCountryGeography(register.office_id)) {
      if (register.territory_code != null || register.region_code != null || register.status !== "current") {
        throw new ItalyPreflightError("office_register", `Country office ${register.office_id} must stay current with no territory.`, intendedInventory);
      }
    } else if (!register.territory_code) {
      throw new ItalyPreflightError("office_register", `Office ${register.office_id} is missing its supplied territory_code.`, intendedInventory);
    }
    if (register.status === "current" && register.region_code == null && !usesCountryGeography(register.office_id)) {
      throw new ItalyPreflightError("office_register", `Current office ${register.office_id} is missing its supplied region_code.`, intendedInventory);
    }
    draftHistogram.set(office.draft_tier, (draftHistogram.get(office.draft_tier) ?? 0) + 1);
  }
  if (seen.size !== registerById.size || seen.size !== draftById.size) {
    throw new ItalyPreflightError("office_count", "Italy tier, draft, and register id sets differ.", intendedInventory);
  }
  if (
    draftHistogram.get(1) !== EXPECTED_COUNTS.draft_tier_1 ||
    draftHistogram.get(2) !== EXPECTED_COUNTS.draft_tier_2 ||
    draftHistogram.get(3) !== EXPECTED_COUNTS.draft_tier_3 ||
    draftHistogram.get(4) !== EXPECTED_COUNTS.draft_tier_4
  ) {
    throw new ItalyPreflightError(
      "numeric_tier",
      `Italy numeric tiers ${draftHistogram.get(1)}/${draftHistogram.get(2)}/${draftHistogram.get(3)}/${draftHistogram.get(4)} are not 4/38/11/16568.`,
      intendedInventory,
    );
  }

  const countsFile = JSON.parse(readFileSync(countsItem.absPath, "utf8")) as {
    offices_total: number;
    offices_current: number;
    offices_historical: number;
    offices_statutory_pending_first_election: number;
    current_direct_executive_offices: number;
    current_collective_bodies: number;
    current_municipal_councils: number;
    municipalities: number;
    events: number;
    results: number;
    full_requested_scope_complete: boolean;
    applied_changes: number;
    justin_approved: boolean;
    research_coverage_complete?: boolean;
    draft_tier_histogram: Record<string, number>;
    regions: Array<{ region_code: string; current_offices: number }>;
  };
  if (
    countsFile.offices_total !== EXPECTED_COUNTS.offices ||
    countsFile.offices_current !== EXPECTED_COUNTS.current_offices ||
    countsFile.offices_historical !== EXPECTED_COUNTS.historical_offices ||
    countsFile.offices_statutory_pending_first_election !== EXPECTED_COUNTS.pending_fvg_offices ||
    countsFile.current_direct_executive_offices !== EXPECTED_COUNTS.direct_executive_offices ||
    countsFile.current_collective_bodies !== EXPECTED_COUNTS.current_collective_bodies ||
    countsFile.current_municipal_councils !== EXPECTED_COUNTS.current_municipal_councils ||
    countsFile.municipalities !== EXPECTED_COUNTS.current_municipal_councils ||
    countsFile.full_requested_scope_complete !== false ||
    countsFile.applied_changes !== 0 ||
    countsFile.justin_approved !== false ||
    countsFile.draft_tier_histogram["1"] !== EXPECTED_COUNTS.draft_tier_1 ||
    countsFile.draft_tier_histogram["2"] !== EXPECTED_COUNTS.draft_tier_2 ||
    countsFile.draft_tier_histogram["3"] !== EXPECTED_COUNTS.draft_tier_3 ||
    countsFile.draft_tier_histogram["4"] !== EXPECTED_COUNTS.draft_tier_4
  ) {
    throw new ItalyPreflightError("office_count", "Italy counts.json does not match the accepted pack counts.", intendedInventory);
  }
  if (countsFile.research_coverage_complete !== undefined && countsFile.research_coverage_complete !== false) {
    throw new ItalyPreflightError("coverage", "Italy research_coverage_complete must stay false.", intendedInventory);
  }
  if (countsFile.events !== FULL_PACK_DOCUMENTED_EVENTS || countsFile.results !== FULL_PACK_DOCUMENTED_RESULTS) {
    throw new ItalyPreflightError(
      "counts_file",
      "Italy counts.json full-pack event/result figures drifted. Slim publish still stays 0 and does not emit omitted totals.",
      intendedInventory,
    );
  }
  if (!Array.isArray(countsFile.regions) || countsFile.regions.length !== 20) {
    throw new ItalyPreflightError("office_count", "Italy counts.json region table drifted.", intendedInventory);
  }
  for (const region of countsFile.regions) {
    if (REGION_CURRENT_OFFICES[region.region_code] !== region.current_offices) {
      throw new ItalyPreflightError(
        "office_count",
        `Italy region ${region.region_code} current offices ${region.current_offices} drifted.`,
        intendedInventory,
      );
    }
  }

  const gaps = JSON.parse(readFileSync(gapsItem.absPath, "utf8")) as ItalyGap[];
  if (!Array.isArray(gaps) || gaps.length !== EXPECTED_COUNTS.named_holds || gaps.map((gap) => gap.gap_id).join(",") !== HOLD_IDS.join(",")) {
    throw new ItalyPreflightError("named_holds", "Italy research gaps must stay IT-G01 through IT-G19.", intendedInventory);
  }
  for (const gap of gaps) {
    if (gap.justin_approved !== false || !gap.detail?.trim() || !gap.status?.trim() || !gap.resolution_needed?.trim()) {
      throw new ItalyPreflightError("named_holds", `Hold ${gap.gap_id} must stay unapproved with its pack disposition.`, intendedInventory);
    }
  }

  const approval = JSON.parse(readFileSync(approvalItem.absPath, "utf8")) as {
    applied_changes: number;
    justin_approvals: Record<string, boolean>;
  };
  const approvalValues = Object.values(approval.justin_approvals ?? {});
  if (approval.applied_changes !== 0 || approvalValues.length === 0 || approvalValues.some((value) => value !== false)) {
    throw new ItalyPreflightError(
      "coverage",
      "Italy approval-state.json must stay applied_changes 0 with every justin approval false.",
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
    gaps,
    metadata,
    intendedInventory,
  };
}
