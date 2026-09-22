import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import {
  ATTEMPT_LOG_SCHEMA_PATH,
  ATTEMPT_LOG_SHA256,
  MASTER_SCHEMA_PATH,
  MASTER_SCHEMA_SHA256,
} from "../identity";
import { ATLAS_ATTEMPT_LOG_FILENAME, ATLAS_MASTER_FILENAME, ATLAS_MIGRATIONS_DIR } from "../migrations";
import {
  ADAPTER_VERSION,
  CROSSWALK_RELATIVE,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  GAPS_RELATIVE,
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

export type CroatiaEvidenceRef = {
  source_id: string;
  input_path: string;
  sha256?: string;
  archive_entry?: string | null;
  locator?: unknown;
};

export type CroatiaAuthoredDate = {
  value: string | null;
  precision: string;
  certainty: string;
  note?: string;
  evidence?: CroatiaEvidenceRef[];
};

export type CroatiaOfficeRow = {
  id_namespace: string;
  office_id: string;
  geography_id: string;
  name: string;
  office_type: string;
  office_status: string;
  proposed_tier?: string;
  next_election?: CroatiaAuthoredDate | null;
  evidence?: CroatiaEvidenceRef[];
  raw?: Record<string, unknown>;
  [key: string]: unknown;
};

export type CroatiaEventRow = {
  id_namespace: string;
  office_id: string;
  history_key: string;
  event_id: string;
  date?: CroatiaAuthoredDate | null;
  event_kind?: string;
  selected_history_role?: string;
  legal_outcome?: string;
  ballot_basis?: string;
  share_unit?: string;
  evidence?: CroatiaEvidenceRef[];
  raw?: Record<string, unknown>;
  [key: string]: unknown;
};

export type CroatiaProceedingRow = {
  office_id: string;
  history_key: string;
  event_id?: string;
  proceeding_id: string;
  proceeding_type: string;
  sequence_no: number;
  supersedes_id?: string | null;
  legal_outcome?: string;
  evidence?: CroatiaEvidenceRef[];
  [key: string]: unknown;
};

export type CroatiaResultRow = {
  id_namespace: string;
  office_id: string;
  history_key: string;
  event_id?: string;
  result_row_id: string;
  proceeding_id?: string | null;
  identity_token?: string;
  candidate_name?: string | null;
  source_label?: string | null;
  party_name_raw?: string | null;
  votes?: number | null;
  votes_status?: string;
  share?: number | null;
  share_status?: string;
  share_unit?: string;
  seats?: number | null;
  seats_status?: string;
  elected_flag?: number | null;
  evidence_status?: string;
  evidence?: CroatiaEvidenceRef[];
  [key: string]: unknown;
};

export type CroatiaGeographyRow = {
  geography_id: string;
  name: string;
  parent_geography_id?: string | null;
  evidence?: CroatiaEvidenceRef[];
  [key: string]: unknown;
};

export type CroatiaSourceRow = {
  source_id: string;
  url?: string | null;
  title?: string | null;
  publisher?: string | null;
  input_path: string;
  sha256?: string | null;
  byte_count?: number | null;
  data_rights?: string | null;
  retrieved_at?: string | null;
  [key: string]: unknown;
};

export type CroatiaResearchGapRow = {
  original_token: string;
  reason: string;
  status?: string;
  office_ids?: string[];
  evidence?: CroatiaEvidenceRef[];
  [key: string]: unknown;
};

export type CroatiaCrosswalkRow = {
  entity_kind?: string;
  upstream_namespace: string;
  upstream_id: string;
  target_office_id: string;
  reason: string;
  [key: string]: unknown;
};

export type CroatiaTierClassification = {
  office_id: string;
  tier: string;
  rationale: string;
  human_review_required?: boolean;
  tier_uncertain?: boolean;
  [key: string]: unknown;
};

export type CroatiaInventory = {
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
  offices: CroatiaOfficeRow[];
  events: CroatiaEventRow[];
  results: CroatiaResultRow[];
  geographies: CroatiaGeographyRow[];
  sourceCatalogue: CroatiaSourceRow[];
  researchGaps: CroatiaResearchGapRow[];
  crosswalks: CroatiaCrosswalkRow[];
  proceedings: CroatiaProceedingRow[];
  tiers: {
    status: string;
    production_accepted?: boolean;
    classifications: CroatiaTierClassification[];
    source_register?: { sha256?: string; path?: string; input_path?: string };
  };
  intendedInventory: Record<string, unknown>;
};

function posixJoin(...parts: string[]): string {
  return parts.join("/").replace(/\\/g, "/").replace(/\/+/g, "/");
}

function isDocumentationName(name: string): boolean {
  return name === "README.md" || name === "SOURCES_NOTE.md";
}

function walkRegularFiles(dir: string, relBase: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = posixJoin(relBase, entry.name);
    const abs = path.join(dir, entry.name);
    if (entry.isSymbolicLink() || lstatSync(abs).isSymbolicLink()) {
      throw new Error(`Unexpected symlink in Croatia research pack: ${rel}`);
    }
    if (entry.isDirectory()) {
      out.push(...walkRegularFiles(abs, rel));
    } else if (entry.isFile()) {
      if (isDocumentationName(entry.name)) continue;
      out.push(rel);
    } else {
      throw new Error(`Unexpected non-file in Croatia research pack: ${rel}`);
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
    .filter((rel) => Boolean(rel) && !isDocumentationName(path.posix.basename(rel)))
    .sort();
}

function gitHead(root: string): string | null {
  try {
    return execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

export class CroatiaPreflightError extends Error {
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
    omitted_slim_inputs: [
      "data/research/croatia/sources/",
      "data/research/croatia/events.json",
      "docs/phase1/croatia/Croatia_Identity_Vectors.json",
    ],
  };
}

export function readResearchText(absPath: string, relativePath: string): string {
  const bytes = readFileSync(absPath);
  return relativePath.endsWith(".gz") ? gunzipSync(bytes).toString("utf8") : bytes.toString("utf8");
}

function readJsonArray<T>(absPath: string, relativePath: string): T[] {
  const text = readResearchText(absPath, relativePath);
  if (relativePath.endsWith(".jsonl") || relativePath.endsWith(".jsonl.gz")) {
    return text
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line, index) => {
        try {
          return JSON.parse(line) as T;
        } catch (error) {
          throw new Error(
            `${relativePath} line ${index + 1} is not JSON: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      });
  }
  const parsed = JSON.parse(text) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error(`${relativePath} must be a JSON array`);
  }
  return parsed as T[];
}

export function scanCroatiaInventory(options: {
  root: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): CroatiaInventory {
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
    throw new CroatiaPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new CroatiaPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  const requireGit = options.requireGitTrackedPackage ?? !options.researchDir;
  let packagePaths: string[];
  if (requireGit) {
    const tracked = gitTrackedResearchFiles(root);
    const walked = [...walkRegularFiles(researchDir, RESEARCH_PREFIX), TIER_PATH].sort();
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new CroatiaPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} git-tracked Croatia research/tier files, found ${tracked.length}.`,
        {},
      );
    }
    if (JSON.stringify(tracked) !== JSON.stringify(walked)) {
      throw new CroatiaPreflightError(
        "unpinned_worktree",
        "Croatia research worktree files do not match git-tracked paths.",
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
    throw new CroatiaPreflightError("missing_tier", `Approved Croatia tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }

  let tierJson: CroatiaInventory["tiers"];
  try {
    tierJson = JSON.parse(tierItem.text ?? "") as CroatiaInventory["tiers"];
  } catch (error) {
    throw new CroatiaPreflightError(
      "tier_unreadable",
      `Croatia tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  tierMeta.status = tierJson.status;
  intendedInventory.tier = tierMeta;

  if (tierJson.status !== "approved" || tierJson.production_accepted !== true) {
    throw new CroatiaPreflightError(
      "tier_not_approved",
      `Croatia tiers status is ${JSON.stringify(tierJson.status)}; import requires approved production-accepted bytes.`,
      intendedInventory,
    );
  }
  if (tierItem.sha256 !== TIER_SHA256) {
    throw new CroatiaPreflightError(
      "tier_hash_mismatch",
      `Croatia tier SHA-256 mismatch; expected ${TIER_SHA256}.`,
      intendedInventory,
    );
  }

  const register = tracked.find((item) => item.input_path === REGISTER_RELATIVE);
  if (!register || register.sha256 !== REGISTER_SHA256) {
    throw new CroatiaPreflightError(
      "register_hash_mismatch",
      `Office register SHA-256 mismatch; expected ${REGISTER_SHA256}.`,
      intendedInventory,
    );
  }
  if (tierJson.source_register?.sha256 && tierJson.source_register.sha256 !== REGISTER_SHA256) {
    throw new CroatiaPreflightError(
      "register_hash_mismatch",
      "Tier source_register.sha256 does not match the accepted office register.",
      intendedInventory,
    );
  }

  if (
    tracked.some(
      (item) =>
        item.input_path.endsWith("/events.json") ||
        item.input_path.endsWith("/results.json") ||
        item.input_path.includes("/sources/"),
    )
  ) {
    throw new CroatiaPreflightError(
      "unexpected_slim_blob",
      "Croatia slim land must not invent an uncompressed events.json twin, an uncompressed results.json, or raw sources/ bytes.",
      intendedInventory,
    );
  }

  if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
    throw new CroatiaPreflightError(
      "package_inventory",
      `Expected ${EXPECTED_COUNTS.retained_inputs} retained Croatia inputs, found ${tracked.length}.`,
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
  ];
  for (const rel of mustRead) {
    if (!byPath.has(rel)) {
      throw new CroatiaPreflightError("missing_research_table", `Missing required Croatia research table ${rel}.`, intendedInventory);
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
    offices: readJsonArray<CroatiaOfficeRow>(byPath.get(REGISTER_RELATIVE)!.absPath, REGISTER_RELATIVE),
    events: readJsonArray<CroatiaEventRow>(byPath.get(EVENTS_RELATIVE)!.absPath, EVENTS_RELATIVE),
    results: readJsonArray<CroatiaResultRow>(byPath.get(RESULTS_RELATIVE)!.absPath, RESULTS_RELATIVE),
    geographies: readJsonArray<CroatiaGeographyRow>(byPath.get(GEOGRAPHY_RELATIVE)!.absPath, GEOGRAPHY_RELATIVE),
    sourceCatalogue: readJsonArray<CroatiaSourceRow>(byPath.get(SOURCES_RELATIVE)!.absPath, SOURCES_RELATIVE),
    researchGaps: readJsonArray<CroatiaResearchGapRow>(byPath.get(GAPS_RELATIVE)!.absPath, GAPS_RELATIVE),
    crosswalks: readJsonArray<CroatiaCrosswalkRow>(byPath.get(CROSSWALK_RELATIVE)!.absPath, CROSSWALK_RELATIVE),
    proceedings: readJsonArray<CroatiaProceedingRow>(byPath.get(PROCEEDINGS_RELATIVE)!.absPath, PROCEEDINGS_RELATIVE),
    tiers: tierJson,
    intendedInventory,
  };
}
