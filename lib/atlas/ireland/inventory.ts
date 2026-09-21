import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
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
  AUDIT_RELATIVE,
  CROSSWALK_RELATIVE,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  GAPS_RELATIVE,
  GEOGRAPHY_RELATIVE,
  LINEAGE_ID,
  LOCAL_BOOK_RELATIVE,
  METHOD_VERSION,
  PROCEEDINGS_RELATIVE,
  REGISTER_RELATIVE,
  REGISTER_SHA256,
  RESEARCH_PREFIX,
  RESULTS_RELATIVE,
  RESULTS_SHA256,
  SCHEMA_VERSION,
  SOURCES_NOTE_RELATIVE,
  SOURCES_RELATIVE,
  TIER_PATH,
  TIER_SHA256,
  buildHashInputs,
  canonical,
  fingerprintSha256,
  inputKindFor,
  releaseIdFor,
  sha256Hex,
  type HashInputDescriptor,
} from "./identity";

export type TrackedInput = HashInputDescriptor & {
  absPath: string;
  text: string | null;
};

export type IrelandEvidenceRef = {
  input_path: string;
  sha256?: string;
  locator?: string | null;
  json_pointer?: string | null;
  dimensions?: unknown;
};

export type IrelandDateValue = {
  value: string;
  precision: string;
  certainty: string;
  evidence?: IrelandEvidenceRef[];
};

export type IrelandOfficeRow = {
  id_namespace: string;
  office_id: string;
  country_id: string;
  geography_id: string;
  name: string;
  office_type: string;
  office_status: string;
  record_state?: string;
  source_code?: string | null;
  proposed_tier?: string;
  electoral_mode?: string | null;
  next_election?: IrelandDateValue | null;
  evidence?: IrelandEvidenceRef[];
  review_notes?: string[];
  successor_office_id?: string | null;
  [key: string]: unknown;
};

export type IrelandEventRow = {
  id_namespace: string;
  office_id: string;
  history_key: string;
  event_id: string;
  source_cycle_year?: number | null;
  date: IrelandDateValue;
  event_kind?: string;
  contest_scope?: string;
  selected_history_role?: string;
  legal_outcome?: string;
  record_state?: string;
  evidence?: IrelandEvidenceRef[];
  notes?: string[];
  valid_votes?: number | null;
  total_seats?: number | null;
  coverage_complete?: boolean;
  [key: string]: unknown;
};

export type IrelandResultRow = {
  id_namespace: string;
  office_id: string;
  history_key: string;
  event_id: string;
  result_row_id: string;
  proceeding_id?: string | null;
  identity_token: string;
  row_type?: string;
  name?: string | null;
  party_label?: string | null;
  party_code?: string | null;
  candidate_name?: string | null;
  votes?: number | null;
  votes_status?: string;
  share?: number | null;
  share_status?: string;
  share_unit?: string | null;
  seats?: number | null;
  seats_status?: string;
  elected_flag?: boolean | null;
  ballot_basis?: string | null;
  evidence_status?: string;
  evidence?: IrelandEvidenceRef[];
  raw?: Record<string, unknown>;
  [key: string]: unknown;
};

export type IrelandGeographyRow = {
  geography_id: string;
  name: string;
  country_id: string;
  parent_geography_id?: string | null;
  evidence?: IrelandEvidenceRef[];
  [key: string]: unknown;
};

export type IrelandSourceRow = {
  source_id: string;
  source_namespace?: string;
  country_id?: string;
  lineage_id?: string;
  url?: string | null;
  title?: string | null;
  publisher?: string | null;
  input_path: string;
  sha256?: string | null;
  bytes?: number | null;
  request?: unknown;
  accessed_date?: string | null;
  source_type?: string | null;
  notes?: string | null;
  [key: string]: unknown;
};

export type IrelandResearchGapRow = {
  original_token: string;
  reason: string;
  evidence?: IrelandEvidenceRef[];
  office_ids?: string[];
  status?: string;
  [key: string]: unknown;
};

export type IrelandCrosswalkRow = {
  upstream_namespace: string;
  upstream_id: string;
  target_office_id: string;
  reason: string;
  evidence?: IrelandEvidenceRef[];
  [key: string]: unknown;
};

export type IrelandTierClassification = {
  office_id: string;
  tier: string;
  schema_v1_tier?: string;
  rationale: string;
  human_review_required?: boolean;
  tier_uncertain?: boolean;
  [key: string]: unknown;
};

export type IrelandInventory = {
  root: string;
  researchDir: string;
  tierPath: string;
  gitCommit: string | null;
  tracked: TrackedInput[];
  byPath: Map<string, TrackedInput>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  hashInputs: ReturnType<typeof buildHashInputs>;
  offices: IrelandOfficeRow[];
  events: IrelandEventRow[];
  results: IrelandResultRow[];
  geographies: IrelandGeographyRow[];
  sourceCatalogue: IrelandSourceRow[];
  researchGaps: IrelandResearchGapRow[];
  crosswalks: IrelandCrosswalkRow[];
  proceedings: unknown[];
  tiers: {
    status: string;
    production_accepted?: boolean;
    classifications: IrelandTierClassification[];
    source_register?: { sha256?: string; path?: string; input_path?: string };
  };
  intendedInventory: Record<string, unknown>;
};

function posixJoin(...parts: string[]): string {
  return parts.join("/").replace(/\\/g, "/").replace(/\/+/g, "/");
}

function walkRegularFiles(dir: string, relBase: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = posixJoin(relBase, entry.name);
    const abs = path.join(dir, entry.name);
    if (entry.isSymbolicLink() || lstatSync(abs).isSymbolicLink()) {
      throw new Error(`Unexpected symlink in Ireland research pack: ${rel}`);
    }
    if (entry.isDirectory()) {
      out.push(...walkRegularFiles(abs, rel));
    } else if (entry.isFile()) {
      if (entry.name === "README.md") continue;
      out.push(rel);
    } else {
      throw new Error(`Unexpected non-file in Ireland research pack: ${rel}`);
    }
  }
  return out.sort();
}

function gitTrackedResearchFiles(root: string): string[] {
  const output = execFileSync("git", ["-C", root, "ls-files", "-z", "--", RESEARCH_PREFIX, TIER_PATH], {
    encoding: "buffer",
  });
  return output
    .toString("utf8")
    .split("\0")
    .filter((rel) => Boolean(rel) && !rel.endsWith("/README.md") && rel !== `${RESEARCH_PREFIX}/README.md`)
    .sort();
}

function gitHead(root: string): string | null {
  try {
    return execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

export class IrelandPreflightError extends Error {
  readonly code: string;
  readonly inventory: Record<string, unknown>;
  constructor(code: string, message: string, inventory: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.inventory = inventory;
  }
}

function buildIntendedInventory(args: {
  gitCommit: string | null;
  packageFiles: Array<{ input_path: string; sha256: string | null; byte_count: number | null; error?: string }>;
  tier: { input_path: string; sha256: string | null; byte_count: number | null; error?: string; status?: string | null };
}): Record<string, unknown> {
  return {
    lineage_id: LINEAGE_ID,
    adapter_version: ADAPTER_VERSION,
    method_version: METHOD_VERSION,
    schema_version: SCHEMA_VERSION,
    schema_inputs: [
      { input_path: ATTEMPT_LOG_SCHEMA_PATH, sha256: ATTEMPT_LOG_SHA256 },
      { input_path: MASTER_SCHEMA_PATH, sha256: MASTER_SCHEMA_SHA256 },
    ],
    git_commit: args.gitCommit,
    package_files: args.packageFiles,
    tier: args.tier,
    overrides: [],
  };
}

function readJsonArray<T>(absPath: string, relativePath: string): T[] {
  const parsed = JSON.parse(readFileSync(absPath, "utf8"));
  if (!Array.isArray(parsed)) {
    throw new Error(`${relativePath} must be a JSON array`);
  }
  return parsed as T[];
}

function skipText(logical: string): boolean {
  return logical.endsWith("results.json") || !logical.endsWith(".json");
}

export function scanIrelandInventory(options: {
  root: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): IrelandInventory {
  const root = options.root;
  const researchDir = options.researchDir ?? path.join(root, RESEARCH_PREFIX);
  const researchPrefix = options.researchDir
    ? path.relative(root, researchDir).replace(/\\/g, "/") || RESEARCH_PREFIX
    : RESEARCH_PREFIX;
  const tierAbs = options.tierPath ?? path.join(root, TIER_PATH);
  const gitCommit = gitHead(root);

  const schemaAttempt = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_ATTEMPT_LOG_FILENAME);
  const schemaMaster = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_MASTER_FILENAME);
  if (sha256Hex(readFileSync(schemaAttempt)) !== ATTEMPT_LOG_SHA256) {
    throw new IrelandPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new IrelandPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  const requireGit = options.requireGitTrackedPackage ?? !options.researchDir;
  let packagePaths: string[];
  if (requireGit) {
    const tracked = gitTrackedResearchFiles(root);
    const walked = [...walkRegularFiles(researchDir, RESEARCH_PREFIX), TIER_PATH].sort();
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new IrelandPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} git-tracked Ireland research/tier files, found ${tracked.length}.`,
        {},
      );
    }
    if (JSON.stringify(tracked) !== JSON.stringify(walked)) {
      throw new IrelandPreflightError(
        "unpinned_worktree",
        "Ireland research worktree files do not match git-tracked paths.",
        {},
      );
    }
    packagePaths = tracked;
  } else {
    packagePaths = [...walkRegularFiles(researchDir, researchPrefix), TIER_PATH].sort();
  }

  const packageFilesMeta: Array<{ input_path: string; sha256: string | null; byte_count: number | null; error?: string }> =
    [];
  const tracked: TrackedInput[] = [];
  for (const rel of packagePaths) {
    const logical = rel === TIER_PATH || requireGit ? rel : posixJoin(RESEARCH_PREFIX, path.relative(researchPrefix, rel));
    const abs = rel === TIER_PATH ? (options.tierPath ? tierAbs : path.join(root, TIER_PATH)) : path.join(root, requireGit ? rel : logical);
    try {
      const bytes = readFileSync(abs);
      const item: TrackedInput = {
        input_path: logical,
        input_kind: inputKindFor(logical),
        sha256: sha256Hex(bytes),
        byte_count: bytes.length,
        absPath: abs,
        text: skipText(logical) ? null : bytes.toString("utf8"),
      };
      tracked.push(item);
      packageFilesMeta.push({ input_path: item.input_path, sha256: item.sha256, byte_count: item.byte_count });
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
  const tierMeta = {
    input_path: TIER_PATH,
    sha256: tierItem?.sha256 ?? null,
    byte_count: tierItem?.byte_count ?? null,
    status: null as string | null,
    error: existsSync(tierAbs) ? undefined : "missing_tier_file",
  };
  const intendedInventory = buildIntendedInventory({
    gitCommit,
    packageFiles: packageFilesMeta,
    tier: tierMeta,
  });

  if (tierMeta.error === "missing_tier_file" || !tierItem) {
    throw new IrelandPreflightError("missing_tier", `Approved Ireland tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }

  let tierJson: IrelandInventory["tiers"];
  try {
    tierJson = JSON.parse(tierItem.text ?? "") as IrelandInventory["tiers"];
  } catch (error) {
    throw new IrelandPreflightError(
      "tier_unreadable",
      `Ireland tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  tierMeta.status = tierJson.status;
  intendedInventory.tier = tierMeta;

  if (tierJson.status !== "approved" || tierJson.production_accepted !== true) {
    throw new IrelandPreflightError(
      "tier_not_approved",
      `Ireland tiers status is ${JSON.stringify(tierJson.status)}; import requires approved production-accepted bytes.`,
      intendedInventory,
    );
  }
  if (tierItem.sha256 !== TIER_SHA256) {
    throw new IrelandPreflightError(
      "tier_hash_mismatch",
      `Ireland tier SHA-256 mismatch; expected ${TIER_SHA256}.`,
      intendedInventory,
    );
  }

  const register = tracked.find((item) => item.input_path === REGISTER_RELATIVE);
  if (!register || register.sha256 !== REGISTER_SHA256) {
    throw new IrelandPreflightError(
      "register_hash_mismatch",
      `Office register SHA-256 mismatch; expected ${REGISTER_SHA256}.`,
      intendedInventory,
    );
  }
  if (tierJson.source_register?.sha256 && tierJson.source_register.sha256 !== REGISTER_SHA256) {
    throw new IrelandPreflightError(
      "register_hash_mismatch",
      "Tier source_register.sha256 does not match the accepted office register.",
      intendedInventory,
    );
  }

  const results = tracked.find((item) => item.input_path === RESULTS_RELATIVE);
  if (!results || results.sha256 !== RESULTS_SHA256) {
    throw new IrelandPreflightError(
      "results_hash_mismatch",
      `results.json SHA-256 mismatch; expected ${RESULTS_SHA256}.`,
      intendedInventory,
    );
  }

  if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
    throw new IrelandPreflightError(
      "package_inventory",
      `Expected ${EXPECTED_COUNTS.retained_inputs} retained Ireland inputs, found ${tracked.length}.`,
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

  const byPath = new Map(tracked.map((item) => [item.input_path, item]));
  const mustRead = [
    REGISTER_RELATIVE,
    EVENTS_RELATIVE,
    RESULTS_RELATIVE,
    GEOGRAPHY_RELATIVE,
    SOURCES_RELATIVE,
    GAPS_RELATIVE,
    CROSSWALK_RELATIVE,
    PROCEEDINGS_RELATIVE,
    LOCAL_BOOK_RELATIVE,
    AUDIT_RELATIVE,
    SOURCES_NOTE_RELATIVE,
  ];
  for (const rel of mustRead) {
    if (!byPath.has(rel)) {
      throw new IrelandPreflightError("missing_research_table", `Missing required Ireland research table ${rel}.`, intendedInventory);
    }
  }

  return {
    root,
    researchDir,
    tierPath: TIER_PATH,
    gitCommit,
    tracked,
    byPath,
    fingerprint,
    releaseId,
    hashInputsJson: canonical(hashInputs),
    hashInputs,
    offices: readJsonArray<IrelandOfficeRow>(byPath.get(REGISTER_RELATIVE)!.absPath, REGISTER_RELATIVE),
    events: readJsonArray<IrelandEventRow>(byPath.get(EVENTS_RELATIVE)!.absPath, EVENTS_RELATIVE),
    results: readJsonArray<IrelandResultRow>(byPath.get(RESULTS_RELATIVE)!.absPath, RESULTS_RELATIVE),
    geographies: readJsonArray<IrelandGeographyRow>(byPath.get(GEOGRAPHY_RELATIVE)!.absPath, GEOGRAPHY_RELATIVE),
    sourceCatalogue: readJsonArray<IrelandSourceRow>(byPath.get(SOURCES_RELATIVE)!.absPath, SOURCES_RELATIVE),
    researchGaps: readJsonArray<IrelandResearchGapRow>(byPath.get(GAPS_RELATIVE)!.absPath, GAPS_RELATIVE),
    crosswalks: readJsonArray<IrelandCrosswalkRow>(byPath.get(CROSSWALK_RELATIVE)!.absPath, CROSSWALK_RELATIVE),
    proceedings: readJsonArray<unknown>(byPath.get(PROCEEDINGS_RELATIVE)!.absPath, PROCEEDINGS_RELATIVE),
    tiers: tierJson,
    intendedInventory,
  };
}
