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
  CONFLICTS_RELATIVE,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  GEOGRAPHY_RELATIVE,
  LINEAGE_ID,
  METHOD_VERSION,
  PROCEEDINGS_RELATIVE,
  REGISTER_RELATIVE,
  REGISTER_SHA256,
  RESEARCH_PREFIX,
  RESULTS_RELATIVE,
  SCHEMA_VERSION,
  SOURCES_RELATIVE,
  TIER_PATH,
  TIER_SHA256,
  UNRESOLVED_RELATIVE,
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

export type SwitzerlandEvidenceRef = {
  input_path: string;
  sha256?: string;
  locator?: unknown;
  json_pointer?: string;
};

export type SwitzerlandOfficeRow = {
  id_namespace: string;
  office_id: string;
  country_id: string;
  geography_id: string;
  name: string;
  office_type: string;
  current: boolean;
  proposed_tier?: string;
  electoral_mode?: string;
  next_election?: {
    label: string;
    precision: string;
    certainty: string;
    year?: number | null;
    month?: number | null;
    day?: number | null;
    derivation?: string;
    evidence?: SwitzerlandEvidenceRef[];
  } | null;
  human_review_required?: boolean;
  review_notes?: string[];
  evidence?: SwitzerlandEvidenceRef[];
  raw?: Record<string, unknown>;
  [key: string]: unknown;
};

export type SwitzerlandEventRow = {
  id_namespace: string;
  office_id: string;
  history_key: string;
  event_id: string;
  date?: string | null;
  precision?: string | null;
  certainty?: string | null;
  date_resolution?: string;
  event_kind?: string;
  selected_history_role?: string;
  ballot_basis?: string | null;
  share_unit?: string | null;
  legal_outcome?: string;
  evidence?: SwitzerlandEvidenceRef[];
  raw?: Record<string, unknown>;
  [key: string]: unknown;
};

export type SwitzerlandResultRow = {
  id_namespace: string;
  office_id: string;
  history_key: string;
  event_id?: string;
  result_row_id: string;
  proceeding_id?: string | null;
  candidate_or_list_label?: string | null;
  original_party_label?: string | null;
  original_party_code?: string | null;
  votes?: number | null;
  votes_status?: string;
  share?: number | null;
  share_status?: string;
  share_unit?: string | null;
  seats?: number | null;
  seats_status?: string;
  elected_flag?: unknown;
  evidence_status?: string;
  evidence?: SwitzerlandEvidenceRef[];
  raw?: Record<string, unknown>;
  [key: string]: unknown;
};

export type SwitzerlandGeographyRow = {
  geography_id: string;
  name: string;
  country_id: string;
  geography_type?: string;
  parent_geography_id?: string | null;
  current?: boolean;
  language?: string | null;
  evidence?: SwitzerlandEvidenceRef[];
  [key: string]: unknown;
};

export type SwitzerlandProceedingRow = {
  proceeding_id: string;
  id_namespace: string;
  office_id: string;
  history_key: string;
  kind: string;
  sequence_no: number;
  supersedes_id?: string | null;
  legal_outcome?: string;
  evidence?: SwitzerlandEvidenceRef[];
  raw?: Record<string, unknown>;
  [key: string]: unknown;
};

export type SwitzerlandSourceRow = {
  source_id: string;
  source_namespace?: string;
  country_id?: string;
  input_path: string;
  url?: string | null;
  publisher?: string | null;
  sha256?: string | null;
  bytes?: number | null;
  checked_as_of_label?: string | null;
  data_rights?: string | null;
  [key: string]: unknown;
};

export type SwitzerlandUnresolvedRow = {
  record_key: string;
  original_token: string;
  reason: string;
  source_locator: string;
  kind?: string;
  evidence?: SwitzerlandEvidenceRef[];
  [key: string]: unknown;
};

export type SwitzerlandAuditRow = {
  bfs_code?: string;
  official_name?: string;
  canton?: string;
  geography_id: string;
  current_office_ids?: string[];
  executive_body_recorded?: boolean;
  representative_legislature_recorded?: boolean;
  [key: string]: unknown;
};

export type SwitzerlandTierClassification = {
  office_id: string;
  tier: string;
  schema_v1_tier?: string;
  rationale: string;
  human_review_required?: boolean;
  tier_uncertain?: boolean;
  [key: string]: unknown;
};

export type SwitzerlandInventory = {
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
  offices: SwitzerlandOfficeRow[];
  events: SwitzerlandEventRow[];
  results: SwitzerlandResultRow[];
  geographies: SwitzerlandGeographyRow[];
  proceedings: SwitzerlandProceedingRow[];
  sources: SwitzerlandSourceRow[];
  unresolved: SwitzerlandUnresolvedRow[];
  audit: SwitzerlandAuditRow[];
  conflicts: Array<{ result_row_id: string; [key: string]: unknown }>;
  tiers: {
    status: string;
    production_accepted?: boolean;
    classifications: SwitzerlandTierClassification[];
    source_register?: { sha256?: string; path?: string };
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
      throw new Error(`Unexpected symlink in Switzerland research pack: ${rel}`);
    }
    if (entry.isDirectory()) {
      out.push(...walkRegularFiles(abs, rel));
    } else if (entry.isFile()) {
      if (entry.name === "README.md") continue;
      out.push(rel);
    } else {
      throw new Error(`Unexpected non-file in Switzerland research pack: ${rel}`);
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

export class SwitzerlandPreflightError extends Error {
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

export function scanSwitzerlandInventory(options: {
  root: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): SwitzerlandInventory {
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
    throw new SwitzerlandPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new SwitzerlandPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  const requireGit = options.requireGitTrackedPackage ?? !options.researchDir;
  let packagePaths: string[];
  if (requireGit) {
    const tracked = gitTrackedResearchFiles(root);
    const walked = [...walkRegularFiles(researchDir, RESEARCH_PREFIX), TIER_PATH].sort();
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new SwitzerlandPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} git-tracked Switzerland research/tier files, found ${tracked.length}. Slim pack omitted bulky sources; do not invent those bytes.`,
        {},
      );
    }
    if (JSON.stringify(tracked) !== JSON.stringify(walked)) {
      throw new SwitzerlandPreflightError(
        "unpinned_worktree",
        "Switzerland research worktree files do not match git-tracked paths.",
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
        text: logical.endsWith(".json") ? bytes.toString("utf8") : null,
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
    throw new SwitzerlandPreflightError("missing_tier", `Approved Switzerland tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }

  let tierJson: SwitzerlandInventory["tiers"];
  try {
    tierJson = JSON.parse(tierItem.text ?? "") as SwitzerlandInventory["tiers"];
  } catch (error) {
    throw new SwitzerlandPreflightError(
      "tier_unreadable",
      `Switzerland tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  tierMeta.status = tierJson.status;
  intendedInventory.tier = tierMeta;

  if (tierJson.status !== "approved" || tierJson.production_accepted !== true) {
    throw new SwitzerlandPreflightError(
      "tier_not_approved",
      `Switzerland tiers status is ${JSON.stringify(tierJson.status)}; import requires approved production-accepted bytes.`,
      intendedInventory,
    );
  }
  if (tierItem.sha256 !== TIER_SHA256) {
    throw new SwitzerlandPreflightError(
      "tier_hash_mismatch",
      `Switzerland tier SHA-256 mismatch; expected ${TIER_SHA256}.`,
      intendedInventory,
    );
  }

  const register = tracked.find((item) => item.input_path === REGISTER_RELATIVE);
  if (!register || register.sha256 !== REGISTER_SHA256) {
    throw new SwitzerlandPreflightError(
      "register_hash_mismatch",
      `Office register SHA-256 mismatch; expected ${REGISTER_SHA256}.`,
      intendedInventory,
    );
  }
  if (tierJson.source_register?.sha256 && tierJson.source_register.sha256 !== REGISTER_SHA256) {
    throw new SwitzerlandPreflightError(
      "register_hash_mismatch",
      "Tier source_register.sha256 does not match the accepted office register.",
      intendedInventory,
    );
  }

  if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
    throw new SwitzerlandPreflightError(
      "package_inventory",
      `Expected ${EXPECTED_COUNTS.retained_inputs} retained Switzerland inputs, found ${tracked.length}.`,
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
    PROCEEDINGS_RELATIVE,
    SOURCES_RELATIVE,
    UNRESOLVED_RELATIVE,
    AUDIT_RELATIVE,
    CONFLICTS_RELATIVE,
  ];
  for (const rel of mustRead) {
    if (!byPath.has(rel)) {
      throw new SwitzerlandPreflightError("missing_research_table", `Missing required Switzerland research table ${rel}.`, intendedInventory);
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
    offices: readJsonArray<SwitzerlandOfficeRow>(byPath.get(REGISTER_RELATIVE)!.absPath, REGISTER_RELATIVE),
    events: readJsonArray<SwitzerlandEventRow>(byPath.get(EVENTS_RELATIVE)!.absPath, EVENTS_RELATIVE),
    results: readJsonArray<SwitzerlandResultRow>(byPath.get(RESULTS_RELATIVE)!.absPath, RESULTS_RELATIVE),
    geographies: readJsonArray<SwitzerlandGeographyRow>(byPath.get(GEOGRAPHY_RELATIVE)!.absPath, GEOGRAPHY_RELATIVE),
    proceedings: readJsonArray<SwitzerlandProceedingRow>(byPath.get(PROCEEDINGS_RELATIVE)!.absPath, PROCEEDINGS_RELATIVE),
    sources: readJsonArray<SwitzerlandSourceRow>(byPath.get(SOURCES_RELATIVE)!.absPath, SOURCES_RELATIVE),
    unresolved: readJsonArray<SwitzerlandUnresolvedRow>(byPath.get(UNRESOLVED_RELATIVE)!.absPath, UNRESOLVED_RELATIVE),
    audit: readJsonArray<SwitzerlandAuditRow>(byPath.get(AUDIT_RELATIVE)!.absPath, AUDIT_RELATIVE),
    conflicts: readJsonArray(byPath.get(CONFLICTS_RELATIVE)!.absPath, CONFLICTS_RELATIVE),
    tiers: tierJson,
    intendedInventory,
  };
}
