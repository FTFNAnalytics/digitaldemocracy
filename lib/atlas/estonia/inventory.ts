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
  COUNTS_RELATIVE,
  COUNTRY_RELATIVE,
  CROSSWALK_RELATIVE,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  GEOGRAPHY_RELATIVE,
  LINEAGE_ID,
  METHOD_VERSION,
  OMITTED_RESULTS_RELATIVE,
  PROCEEDINGS_RELATIVE,
  REGISTER_RELATIVE,
  REGISTER_SHA256,
  RESEARCH_PREFIX,
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

export type EstoniaOrigin = {
  input_path: string;
  sha256?: string;
  xpath?: string;
  html_locator?: string;
  html_table?: number;
  html_row?: number;
  archive_path?: string;
  archive_sha256?: string;
  archive_member?: string;
  source_id?: string;
  json_pointer?: string;
  locator?: string;
  [key: string]: unknown;
};

export type EstoniaAuthoredDate = {
  label: string;
  precision: string;
  certainty: string;
  year?: number | null;
  month?: number | null;
  day?: number | null;
  origin?: EstoniaOrigin;
};

export type EstoniaOfficeRow = {
  id_namespace: string;
  office_id: string;
  country_id: string;
  geography_id: string;
  office_name: string;
  official_jurisdiction_name?: string;
  office_type: string;
  election_mode?: string;
  current: boolean;
  historical?: boolean;
  proposed_tier?: string;
  observed_cycles?: number[];
  holds?: string[];
  next_date?: EstoniaAuthoredDate | null;
  origins?: EstoniaOrigin[];
  successor_office_id?: string;
  [key: string]: unknown;
};

export type EstoniaEventRow = {
  id_namespace: string;
  office_id: string;
  history_key: string;
  event_id: string;
  cycle?: string;
  event_role?: string;
  date: EstoniaAuthoredDate;
  election_mode: string;
  status?: string;
  evidence_status?: string;
  result_status?: string;
  origins?: EstoniaOrigin[];
  raw?: Record<string, unknown>;
  [key: string]: unknown;
};

export type EstoniaProceedingRow = {
  proceeding_id: string;
  event_id: string;
  office_id: string;
  history_key: string;
  sequence: number;
  proceeding_kind: string;
  label?: string;
  date_label: string;
  electoral_body?: string;
  origin?: EstoniaOrigin;
  raw?: Record<string, unknown>;
  supersedes_id?: string | null;
  [key: string]: unknown;
};

export type EstoniaGeographyRow = {
  geography_id: string;
  name: string;
  country_id: string;
  geography_type?: string;
  parent_geography_id?: string | null;
  origins?: EstoniaOrigin[];
  [key: string]: unknown;
};

export type EstoniaSourceRow = {
  source_id: string;
  source_namespace?: string;
  country_id?: string;
  url?: string | null;
  title?: string | null;
  publisher?: string | null;
  input_path: string;
  sha256?: string | null;
  bytes?: number | null;
  retrieved_on?: string | null;
  source_kind?: string;
  content_use?: string;
  status?: string;
  [key: string]: unknown;
};

export type EstoniaCrosswalkRow = {
  entity_kind: string;
  upstream_namespace: string;
  upstream_id: string;
  record_key: string;
  reason: string;
  [key: string]: unknown;
};

export type EstoniaCountryRow = {
  country_id: string;
  country_code: string;
  name: string;
  polity_kind: string;
  region_id: string;
  coverage_status: string;
  screening_as_of_label?: string;
  notes?: string[];
  [key: string]: unknown;
};

export type EstoniaCountsRow = {
  offices: number;
  current_offices: number;
  historical_offices: number;
  current_municipal_councils: number;
  events: number;
  results: number;
  proceedings: number;
  current_direct_executive_offices: number;
  current_indirect_presidential_offices: number;
  municipal_rosters_by_cycle?: Record<string, number>;
  [key: string]: unknown;
};

export type EstoniaTierClassification = {
  office_id: string;
  tier: string;
  schema_v1_tier?: string;
  rationale: string;
  human_review_required?: boolean;
  tier_uncertain?: boolean;
  review_categories?: string[];
  [key: string]: unknown;
};

export type EstoniaInventory = {
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
  offices: EstoniaOfficeRow[];
  events: EstoniaEventRow[];
  geographies: EstoniaGeographyRow[];
  sourceCatalogue: EstoniaSourceRow[];
  crosswalks: EstoniaCrosswalkRow[];
  proceedings: EstoniaProceedingRow[];
  country: EstoniaCountryRow;
  counts: EstoniaCountsRow;
  tiers: {
    status: string;
    production_accepted?: boolean;
    classifications: EstoniaTierClassification[];
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
      throw new Error(`Unexpected symlink in Estonia research pack: ${rel}`);
    }
    if (entry.isDirectory()) {
      out.push(...walkRegularFiles(abs, rel));
    } else if (entry.isFile()) {
      if (entry.name === "README.md") continue;
      out.push(rel);
    } else {
      throw new Error(`Unexpected non-file in Estonia research pack: ${rel}`);
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

export class EstoniaPreflightError extends Error {
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
    omitted_results: OMITTED_RESULTS_RELATIVE,
  };
}

function readJson<T>(absPath: string, relativePath: string): T {
  try {
    return JSON.parse(readFileSync(absPath, "utf8")) as T;
  } catch (error) {
    throw new Error(
      `${relativePath} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function scanEstoniaInventory(options: {
  root: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): EstoniaInventory {
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
    throw new EstoniaPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new EstoniaPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  const requireGit = options.requireGitTrackedPackage ?? !options.researchDir;
  let packagePaths: string[];
  if (requireGit) {
    const tracked = gitTrackedResearchFiles(root);
    const walked = [...walkRegularFiles(researchDir, RESEARCH_PREFIX), TIER_PATH].sort();
    if (tracked.includes(OMITTED_RESULTS_RELATIVE) || walked.includes(OMITTED_RESULTS_RELATIVE)) {
      throw new EstoniaPreflightError(
        "omitted_results_present",
        "results.json is present. The slim importer does not invent or silently adopt omitted result bytes.",
        {},
      );
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new EstoniaPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} git-tracked Estonia research/tier files, found ${tracked.length}.`,
        {},
      );
    }
    if (JSON.stringify(tracked) !== JSON.stringify(walked)) {
      throw new EstoniaPreflightError(
        "unpinned_worktree",
        "Estonia research worktree files do not match git-tracked paths.",
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
    throw new EstoniaPreflightError("missing_tier", `Approved Estonia tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }

  let tierJson: EstoniaInventory["tiers"];
  try {
    tierJson = JSON.parse(tierItem.text ?? "") as EstoniaInventory["tiers"];
  } catch (error) {
    throw new EstoniaPreflightError(
      "tier_unreadable",
      `Estonia tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  tierMeta.status = tierJson.status;
  intendedInventory.tier = tierMeta;

  if (tierJson.status !== "approved" || tierJson.production_accepted !== true) {
    throw new EstoniaPreflightError(
      "tier_not_approved",
      `Estonia tiers status is ${JSON.stringify(tierJson.status)}; import requires approved production-accepted bytes.`,
      intendedInventory,
    );
  }
  if (tierItem.sha256 !== TIER_SHA256) {
    throw new EstoniaPreflightError(
      "tier_hash_mismatch",
      `Estonia tier SHA-256 mismatch; expected ${TIER_SHA256}.`,
      intendedInventory,
    );
  }

  const register = tracked.find((item) => item.input_path === REGISTER_RELATIVE);
  if (!register || register.sha256 !== REGISTER_SHA256) {
    throw new EstoniaPreflightError(
      "register_hash_mismatch",
      `Office register SHA-256 mismatch; expected ${REGISTER_SHA256}.`,
      intendedInventory,
    );
  }
  if (tierJson.source_register?.sha256 && tierJson.source_register.sha256 !== REGISTER_SHA256) {
    throw new EstoniaPreflightError(
      "register_hash_mismatch",
      "Tier source_register.sha256 does not match the accepted office register.",
      intendedInventory,
    );
  }

  if (tracked.some((item) => item.input_path === OMITTED_RESULTS_RELATIVE)) {
    throw new EstoniaPreflightError(
      "omitted_results_present",
      "results.json must stay omitted from the slim pack.",
      intendedInventory,
    );
  }

  if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
    throw new EstoniaPreflightError(
      "package_inventory",
      `Expected ${EXPECTED_COUNTS.retained_inputs} retained Estonia inputs, found ${tracked.length}.`,
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
    GEOGRAPHY_RELATIVE,
    SOURCES_RELATIVE,
    CROSSWALK_RELATIVE,
    PROCEEDINGS_RELATIVE,
    COUNTRY_RELATIVE,
    COUNTS_RELATIVE,
  ];
  for (const rel of mustRead) {
    if (!byPath.has(rel)) {
      throw new EstoniaPreflightError("missing_research_table", `Missing required Estonia research table ${rel}.`, intendedInventory);
    }
  }

  const offices = readJson<EstoniaOfficeRow[]>(byPath.get(REGISTER_RELATIVE)!.absPath, REGISTER_RELATIVE);
  const events = readJson<EstoniaEventRow[]>(byPath.get(EVENTS_RELATIVE)!.absPath, EVENTS_RELATIVE);
  const geographies = readJson<EstoniaGeographyRow[]>(byPath.get(GEOGRAPHY_RELATIVE)!.absPath, GEOGRAPHY_RELATIVE);
  const sourceCatalogue = readJson<EstoniaSourceRow[]>(byPath.get(SOURCES_RELATIVE)!.absPath, SOURCES_RELATIVE);
  const crosswalks = readJson<EstoniaCrosswalkRow[]>(byPath.get(CROSSWALK_RELATIVE)!.absPath, CROSSWALK_RELATIVE);
  const proceedings = readJson<EstoniaProceedingRow[]>(byPath.get(PROCEEDINGS_RELATIVE)!.absPath, PROCEEDINGS_RELATIVE);
  const country = readJson<EstoniaCountryRow>(byPath.get(COUNTRY_RELATIVE)!.absPath, COUNTRY_RELATIVE);
  const counts = readJson<EstoniaCountsRow>(byPath.get(COUNTS_RELATIVE)!.absPath, COUNTS_RELATIVE);
  if (!Array.isArray(offices) || !Array.isArray(events) || !Array.isArray(geographies)) {
    throw new EstoniaPreflightError("research_shape", "Estonia office, event, and geography tables must be arrays.", intendedInventory);
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
    offices,
    events,
    geographies,
    sourceCatalogue,
    crosswalks,
    proceedings,
    country,
    counts,
    tiers: tierJson,
    intendedInventory,
  };
}
