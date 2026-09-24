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
  COUNTS_RELATIVE,
  DRAFT_TIERS_RELATIVE,
  EXPECTED_COUNTS,
  FULL_PACK_DOCUMENTED_EVENTS,
  FULL_PACK_DOCUMENTED_RESULTS,
  HOLD_IDS,
  LINEAGE_ID,
  METHOD_VERSION,
  METADATA_RELATIVE,
  OFFICE_REGISTER_RELATIVE,
  OMITTED_PATHS,
  OMITTED_RESEARCH_DIR,
  PINNED_INPUTS,
  RESEARCH_GAPS_JSONL_RELATIVE,
  SCHEMA_VERSION,
  TIER_PATH,
  TIER_SHA256,
  assertAllowedOfficeIdentity,
  buildHashInputs,
  canonical,
  fingerprintSha256,
  inputKindFor,
  releaseIdFor,
  sha256Hex,
  type HashInputDescriptor,
  type UnitedKingdomRegisterStatus,
} from "./identity";

export type TrackedInput = HashInputDescriptor & {
  absPath: string;
};

export type UnitedKingdomTierOffice = {
  office_id: string;
  draft_tier: number;
  review_status: string;
  rationale: string;
  justin_approved: boolean;
};

export type UnitedKingdomTierFile = {
  country: string;
  country_code: string;
  prompt: string;
  Justin_accepted: boolean;
  review_status: string;
  draft_for_human_review: boolean;
  office_count: number;
  holds_open: string[];
  offices: UnitedKingdomTierOffice[];
};

export type UnitedKingdomRegisterOffice = {
  office_id: string;
  country_id: string;
  name: string;
  office_type: string;
  level: string;
  nation: string;
  status: UnitedKingdomRegisterStatus;
  direct_executive: boolean;
  collective_body: boolean;
  selection_mode: string;
  source_ids: string[];
  as_of: string;
  next_ordinary_poll_date: string | null;
  next_date_status: string;
  territory_code: string | null;
  territory_name: string | null;
  electoral_system: string;
  executive_mode: string;
  footprint_note: string | null;
  register_line: number;
};

export type UnitedKingdomGap = {
  gap_id: string;
  topic: string;
  status: string;
  detail: string;
  source_id: string;
  justin_approved: boolean;
};

export type UnitedKingdomInventory = {
  root: string;
  tierPath: string;
  gitCommit: string | null;
  tracked: TrackedInput[];
  byPath: Map<string, TrackedInput>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  hashInputs: ReturnType<typeof buildHashInputs>;
  tiers: UnitedKingdomTierFile;
  offices: UnitedKingdomRegisterOffice[];
  gaps: UnitedKingdomGap[];
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

export class UnitedKingdomPreflightError extends Error {
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
  const lines = text.split("\n");
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index] ?? "";
    if (!line.trim()) continue;
    rows.push(JSON.parse(line) as T);
  }
  return rows;
}

export function scanUnitedKingdomInventory(options: {
  root: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): UnitedKingdomInventory {
  const root = options.root;
  const tierAbs = options.tierPath ?? path.join(root, TIER_PATH);
  const gitCommit = gitHead(root);
  const requireGit = options.requireGitTrackedPackage ?? !options.tierPath;

  const schemaAttempt = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_ATTEMPT_LOG_FILENAME);
  const schemaMaster = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_MASTER_FILENAME);
  if (sha256Hex(readFileSync(schemaAttempt)) !== ATTEMPT_LOG_SHA256) {
    throw new UnitedKingdomPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new UnitedKingdomPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  for (const rel of OMITTED_PATHS) {
    if (existsSync(path.join(root, rel))) {
      throw new UnitedKingdomPreflightError(
        "omitted_bytes_present",
        `Omitted United Kingdom pack path is present: ${rel}. The slim importer does not adopt those bytes.`,
        {},
      );
    }
  }
  if (requireGit && gitTracked(root, OMITTED_RESEARCH_DIR).length !== 0) {
    throw new UnitedKingdomPreflightError(
      "omitted_bytes_present",
      "data/research/united-kingdom is git-tracked. The slim importer does not adopt omitted research bytes.",
      {},
    );
  }

  const packagePaths = Object.keys(PINNED_INPUTS).sort();
  if (requireGit) {
    const trackedDocs = gitTracked(root, "docs/phase1/united-kingdom");
    const trackedTier = gitTracked(root, TIER_PATH);
    const tracked = [...trackedDocs, ...trackedTier].sort();
    if (tracked.length !== packagePaths.length || tracked.some((rel, index) => rel !== packagePaths[index])) {
      throw new UnitedKingdomPreflightError(
        "package_inventory",
        "United Kingdom git-tracked pack does not match the pinned slim inputs.",
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
    throw new UnitedKingdomPreflightError("missing_tier", `United Kingdom tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }
  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new UnitedKingdomPreflightError(
          "package_hash_mismatch",
          `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`,
          intendedInventory,
        );
      }
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new UnitedKingdomPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} pinned United Kingdom inputs, found ${tracked.length}.`,
        intendedInventory,
      );
    }
  }
  if (tierItem.sha256 !== TIER_SHA256 && requireGit) {
    throw new UnitedKingdomPreflightError(
      "tier_hash_mismatch",
      `United Kingdom tier SHA-256 mismatch; expected ${TIER_SHA256}.`,
      intendedInventory,
    );
  }

  let tiers: UnitedKingdomTierFile;
  try {
    tiers = JSON.parse(readFileSync(tierItem.absPath, "utf8")) as UnitedKingdomTierFile;
  } catch (error) {
    throw new UnitedKingdomPreflightError(
      "tier_unreadable",
      `United Kingdom tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  if (tiers.Justin_accepted !== false || tiers.draft_for_human_review !== true || tiers.review_status !== "needs_review") {
    throw new UnitedKingdomPreflightError(
      "tier_receipt",
      "United Kingdom tier file must stay Justin_accepted false, draft_for_human_review true, and review_status needs_review.",
      intendedInventory,
    );
  }
  if (tiers.country !== "united-kingdom" || tiers.country_code !== "GB" || tiers.prompt !== "AU") {
    throw new UnitedKingdomPreflightError("tier_receipt", "United Kingdom tier file country/prompt drifted.", intendedInventory);
  }
  if (!Array.isArray(tiers.holds_open) || tiers.holds_open.join(",") !== HOLD_IDS.join(",")) {
    throw new UnitedKingdomPreflightError("named_holds", "United Kingdom tier holds_open must stay G01 through G27.", intendedInventory);
  }
  if (!Array.isArray(tiers.offices) || tiers.offices.length !== EXPECTED_COUNTS.offices || tiers.office_count !== EXPECTED_COUNTS.offices) {
    throw new UnitedKingdomPreflightError(
      "office_count",
      `United Kingdom tier office_count ${tiers.office_count} / rows ${tiers.offices?.length} is not ${EXPECTED_COUNTS.offices}.`,
      intendedInventory,
    );
  }

  const registerItem = tracked.find((item) => item.input_path === OFFICE_REGISTER_RELATIVE);
  const draftItem = tracked.find((item) => item.input_path === DRAFT_TIERS_RELATIVE);
  const countsItem = tracked.find((item) => item.input_path === COUNTS_RELATIVE);
  const gapsItem = tracked.find((item) => item.input_path === RESEARCH_GAPS_JSONL_RELATIVE);
  const metadataItem = tracked.find((item) => item.input_path === METADATA_RELATIVE);
  if (!registerItem || !draftItem || !countsItem || !gapsItem || !metadataItem) {
    throw new UnitedKingdomPreflightError("package_inventory", "United Kingdom register, tiers, counts, gaps, or metadata is missing.", intendedInventory);
  }

  const registerRows = readJsonl<Omit<UnitedKingdomRegisterOffice, "register_line">>(registerItem.absPath);
  const offices: UnitedKingdomRegisterOffice[] = [];
  const registerLines = readFileSync(registerItem.absPath, "utf8").split("\n");
  let registerLine = 0;
  for (let index = 0; index < registerLines.length; index++) {
    const line = registerLines[index] ?? "";
    if (!line.trim()) continue;
    const row = JSON.parse(line) as Omit<UnitedKingdomRegisterOffice, "register_line">;
    registerLine += 1;
    offices.push({ ...row, register_line: index + 1 });
    if (offices.length !== registerLine) {
      throw new UnitedKingdomPreflightError("office_register", "United Kingdom register line accounting drifted.", intendedInventory);
    }
  }
  if (offices.length !== registerRows.length || offices.length !== EXPECTED_COUNTS.offices) {
    throw new UnitedKingdomPreflightError(
      "office_count",
      `United Kingdom office register has ${offices.length} rows, not ${EXPECTED_COUNTS.offices}.`,
      intendedInventory,
    );
  }

  const draftRows = readJsonl<UnitedKingdomTierOffice>(draftItem.absPath);
  if (draftRows.length !== EXPECTED_COUNTS.offices) {
    throw new UnitedKingdomPreflightError("office_count", "United Kingdom draft-tiers.jsonl row count drifted.", intendedInventory);
  }
  const draftById = new Map(draftRows.map((row) => [row.office_id, row]));
  const registerById = new Map(offices.map((row) => [row.office_id, row]));

  const seen = new Set<string>();
  const draftHistogram = new Map<number, number>();
  for (const office of tiers.offices) {
    if (seen.has(office.office_id)) {
      throw new UnitedKingdomPreflightError("duplicate_office", `Duplicate United Kingdom office ${office.office_id}.`, intendedInventory);
    }
    seen.add(office.office_id);
    if (office.justin_approved !== false || office.review_status !== "draft_unapproved") {
      throw new UnitedKingdomPreflightError(
        "review_status",
        `Office ${office.office_id} must stay justin_approved false and review_status draft_unapproved.`,
        intendedInventory,
      );
    }
    if (office.draft_tier !== 1 && office.draft_tier !== 2 && office.draft_tier !== 3 && office.draft_tier !== 4) {
      throw new UnitedKingdomPreflightError(
        "numeric_tier",
        `Office ${office.office_id} numeric tier ${office.draft_tier} is not 1–4.`,
        intendedInventory,
      );
    }
    const draft = draftById.get(office.office_id);
    const register = registerById.get(office.office_id);
    if (!draft || !register) {
      throw new UnitedKingdomPreflightError(
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
      throw new UnitedKingdomPreflightError(
        "numeric_tier",
        `Office ${office.office_id} draft-tiers.jsonl does not match the schema tier file. Refusing to remap.`,
        intendedInventory,
      );
    }
    assertAllowedOfficeIdentity(register.office_id, register.office_type, register.name);
    if (register.status !== "current" && register.status !== "current_shadow" && register.status !== "historical_only") {
      throw new UnitedKingdomPreflightError(
        "office_status",
        `Office ${register.office_id} register status ${String(register.status)} is not current, current_shadow, or historical_only.`,
        intendedInventory,
      );
    }
    if (register.country_id !== "GB") {
      throw new UnitedKingdomPreflightError("office_register", `Office ${register.office_id} country_id must stay GB.`, intendedInventory);
    }
    draftHistogram.set(office.draft_tier, (draftHistogram.get(office.draft_tier) ?? 0) + 1);
  }
  if (seen.size !== registerById.size || seen.size !== draftById.size) {
    throw new UnitedKingdomPreflightError("office_count", "United Kingdom tier, draft, and register id sets differ.", intendedInventory);
  }
  if (
    draftHistogram.get(1) !== EXPECTED_COUNTS.draft_tier_1 ||
    draftHistogram.get(2) !== EXPECTED_COUNTS.draft_tier_2 ||
    draftHistogram.get(3) !== EXPECTED_COUNTS.draft_tier_3 ||
    draftHistogram.get(4) !== EXPECTED_COUNTS.draft_tier_4
  ) {
    throw new UnitedKingdomPreflightError(
      "numeric_tier",
      `United Kingdom numeric tiers ${draftHistogram.get(1)}/${draftHistogram.get(2)}/${draftHistogram.get(3)}/${draftHistogram.get(4)} are not 2/5/76/427.`,
      intendedInventory,
    );
  }

  const countsFile = JSON.parse(readFileSync(countsItem.absPath, "utf8")) as {
    offices_total: number;
    offices_current: number;
    offices_current_shadow: number;
    offices_historical: number;
    principal_operational_councils: number;
    current_direct_executive_offices: number;
    direct_mayors: number;
    standalone_PCC_PFCC: number;
    source_identified_parish_town_councils: number;
    events: number;
    results: number;
    research_coverage_complete: boolean;
    applied_changes: number;
    draft_tier_histogram: Record<string, number>;
  };
  if (
    countsFile.offices_total !== EXPECTED_COUNTS.offices ||
    countsFile.offices_current !== EXPECTED_COUNTS.current_offices ||
    countsFile.offices_current_shadow !== EXPECTED_COUNTS.current_shadow_offices ||
    countsFile.offices_historical !== EXPECTED_COUNTS.historical_offices ||
    countsFile.principal_operational_councils !== EXPECTED_COUNTS.principal_councils ||
    countsFile.current_direct_executive_offices !== EXPECTED_COUNTS.direct_executive_offices ||
    countsFile.direct_mayors !== EXPECTED_COUNTS.direct_mayors ||
    countsFile.standalone_PCC_PFCC !== EXPECTED_COUNTS.standalone_pcc ||
    countsFile.source_identified_parish_town_councils !== EXPECTED_COUNTS.parish_town_councils ||
    countsFile.research_coverage_complete !== false ||
    countsFile.applied_changes !== 0 ||
    countsFile.draft_tier_histogram["1"] !== EXPECTED_COUNTS.draft_tier_1 ||
    countsFile.draft_tier_histogram["2"] !== EXPECTED_COUNTS.draft_tier_2 ||
    countsFile.draft_tier_histogram["3"] !== EXPECTED_COUNTS.draft_tier_3 ||
    countsFile.draft_tier_histogram["4"] !== EXPECTED_COUNTS.draft_tier_4
  ) {
    throw new UnitedKingdomPreflightError("office_count", "United Kingdom counts.json does not match the accepted pack counts.", intendedInventory);
  }
  if (countsFile.events !== FULL_PACK_DOCUMENTED_EVENTS || countsFile.results !== FULL_PACK_DOCUMENTED_RESULTS) {
    throw new UnitedKingdomPreflightError(
      "counts_file",
      "United Kingdom counts.json full-pack event/result figures drifted. Slim publish still stays 0 and does not emit omitted totals.",
      intendedInventory,
    );
  }

  const gaps = readJsonl<UnitedKingdomGap>(gapsItem.absPath);
  if (gaps.length !== EXPECTED_COUNTS.named_holds || gaps.map((gap) => gap.gap_id).join(",") !== HOLD_IDS.join(",")) {
    throw new UnitedKingdomPreflightError("named_holds", "United Kingdom research gaps must stay G01 through G27.", intendedInventory);
  }
  for (const gap of gaps) {
    if (gap.justin_approved !== false || !gap.detail?.trim() || !gap.status?.trim()) {
      throw new UnitedKingdomPreflightError("named_holds", `Hold ${gap.gap_id} must stay unapproved with its pack disposition.`, intendedInventory);
    }
  }

  const metadata = JSON.parse(readFileSync(metadataItem.absPath, "utf8")) as UnitedKingdomInventory["metadata"];
  if (metadata.research_coverage_complete !== false || metadata.applied_changes !== 0 || metadata.justin_approved !== false) {
    throw new UnitedKingdomPreflightError(
      "coverage",
      "United Kingdom release metadata must stay research_coverage_complete false, applied_changes 0, and justin_approved false.",
      intendedInventory,
    );
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
    tiers,
    offices,
    gaps,
    metadata,
    intendedInventory,
  };
}
