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
  CROSSWALK_RELATIVE,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  GAPS_RELATIVE,
  LINEAGE_ID,
  METHOD_VERSION,
  OBSERVATIONS_RELATIVE,
  OMITTED_RESULTS_RELATIVE,
  OMITTED_SOURCES_DIR,
  PINNED_INPUTS,
  PREDECESSOR_DRAFT_TIER_SHA256,
  REGISTER_RELATIVE,
  RESEARCH_GAPS,
  RESEARCH_PREFIX,
  SCHEMA_VERSION,
  SOURCE_INVENTORY_RELATIVE,
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

export type LuxembourgOfficeRow = {
  office_id: string;
  name: string;
  commune: string | null;
  office_type: string;
  status: string;
  tier: string;
  directly_elected: boolean;
  direct_executive: boolean;
  source_url: string;
  boundary_note: string | null;
  lau2?: string;
  canton?: string;
  register_last_synchro?: string;
  register_source_url?: string;
  [key: string]: unknown;
};

export type LuxembourgEventRow = {
  event_id: string;
  office_id: string;
  date: string;
  date_precision: string;
  event_type: string;
  result_status: string;
  source_urls: string[];
  date_role: string;
  uncontested_reporting_units?: string[];
  [key: string]: unknown;
};

export type LuxembourgGapRow = {
  id: string;
  topic: string;
  status: string;
  detail: string;
  [key: string]: unknown;
};

export type LuxembourgMergerEdge = {
  predecessor_office_id: string;
  successor_office_id: string;
  effective_date: string | null;
  source_url: string;
  evidence: string;
  [key: string]: unknown;
};

export type LuxembourgObservationEnvelope = {
  event_id: string;
  result_rows: number;
  [key: string]: unknown;
};

export type LuxembourgCountsFile = {
  current_offices: number;
  historical_offices: number;
  events: number;
  result_rows: number;
  [key: string]: unknown;
};

export type LuxembourgSourceInventoryRow = {
  source_id: string;
  path: string;
  sha256: string;
  [key: string]: unknown;
};

export type LuxembourgTierClassification = {
  office_id: string;
  tier: string;
  review_status: string;
  rationale: string;
  human_review_required?: boolean;
  [key: string]: unknown;
};

export type LuxembourgInventory = {
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
  offices: LuxembourgOfficeRow[];
  events: LuxembourgEventRow[];
  gaps: LuxembourgGapRow[];
  mergers: LuxembourgMergerEdge[];
  observations: LuxembourgObservationEnvelope[];
  countsFile: LuxembourgCountsFile;
  sourceInventory: LuxembourgSourceInventoryRow[];
  tiers: {
    status: string;
    production_accepted?: boolean;
    lineage_id?: string;
    predecessor_draft_sha256?: string;
    classifications: LuxembourgTierClassification[];
    counts_by_proposed_tier?: Record<string, number>;
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
      throw new Error(`Unexpected symlink in Luxembourg research pack: ${rel}`);
    }
    if (entry.isDirectory()) {
      if (rel === OMITTED_SOURCES_DIR || rel.startsWith(`${OMITTED_SOURCES_DIR}/`)) {
        throw new Error(`Omitted Luxembourg sources directory is present: ${rel}`);
      }
      out.push(...walkRegularFiles(abs, rel));
    } else if (entry.isFile()) {
      if (entry.name === "README.md") continue;
      if (rel === OMITTED_RESULTS_RELATIVE) {
        throw new Error(`Omitted Luxembourg results file is present: ${rel}`);
      }
      out.push(rel);
    } else {
      throw new Error(`Unexpected non-file in Luxembourg research pack: ${rel}`);
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

export class LuxembourgPreflightError extends Error {
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
    omitted_sources_dir: OMITTED_SOURCES_DIR,
  };
}

function readJson<T>(absPath: string, relativePath: string): T {
  try {
    return JSON.parse(readFileSync(absPath, "utf8")) as T;
  } catch (error) {
    throw new Error(`${relativePath} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function scanLuxembourgInventory(options: {
  root: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): LuxembourgInventory {
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
    throw new LuxembourgPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new LuxembourgPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  const requireGit = options.requireGitTrackedPackage ?? !options.researchDir;
  let packagePaths: string[];
  if (requireGit) {
    const tracked = gitTrackedResearchFiles(root);
    const walked = [...walkRegularFiles(researchDir, RESEARCH_PREFIX), TIER_PATH].sort();
    if (tracked.some((rel) => rel === OMITTED_RESULTS_RELATIVE || rel === OMITTED_SOURCES_DIR || rel.startsWith(`${OMITTED_SOURCES_DIR}/`))) {
      throw new LuxembourgPreflightError(
        "omitted_bytes_present",
        "Luxembourg results.json or sources/ is present. The slim importer does not adopt omitted bytes.",
        {},
      );
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new LuxembourgPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} git-tracked Luxembourg research/tier files, found ${tracked.length}.`,
        {},
      );
    }
    if (JSON.stringify(tracked) !== JSON.stringify(walked)) {
      throw new LuxembourgPreflightError(
        "unpinned_worktree",
        "Luxembourg research worktree files do not match git-tracked paths.",
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
    throw new LuxembourgPreflightError(
      "missing_tier",
      `Approved Luxembourg tier file is missing at ${TIER_PATH}.`,
      intendedInventory,
    );
  }

  let tierJson: LuxembourgInventory["tiers"];
  try {
    tierJson = JSON.parse(tierItem.text ?? readFileSync(tierItem.absPath, "utf8")) as LuxembourgInventory["tiers"];
  } catch (error) {
    throw new LuxembourgPreflightError(
      "tier_unreadable",
      `Luxembourg tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  tierMeta.status = tierJson.status;
  intendedInventory.tier = tierMeta;

  if (tierJson.status === "draft_for_human_review") {
    throw new LuxembourgPreflightError(
      "tier_draft_upgrade_rejected",
      "Refusing to upgrade Luxembourg tiers out of draft_for_human_review.",
      intendedInventory,
    );
  }
  if (tierJson.status !== "approved" || tierJson.production_accepted !== true) {
    throw new LuxembourgPreflightError(
      "tier_not_approved",
      `Luxembourg tiers status is ${JSON.stringify(tierJson.status)}; import requires the already-approved production-accepted bytes.`,
      intendedInventory,
    );
  }
  if (tierItem.sha256 !== TIER_SHA256) {
    throw new LuxembourgPreflightError(
      "tier_hash_mismatch",
      `Luxembourg tier SHA-256 mismatch; expected ${TIER_SHA256}.`,
      intendedInventory,
    );
  }
  if (tierJson.predecessor_draft_sha256 !== PREDECESSOR_DRAFT_TIER_SHA256) {
    throw new LuxembourgPreflightError(
      "predecessor_draft_mismatch",
      "Luxembourg predecessor draft SHA-256 does not match the accepted landing.",
      intendedInventory,
    );
  }
  if (tierJson.lineage_id && tierJson.lineage_id !== LINEAGE_ID) {
    throw new LuxembourgPreflightError(
      "lineage_mismatch",
      "Luxembourg tier lineage_id is not country-package-luxembourg.",
      intendedInventory,
    );
  }

  if (requireGit) {
    for (const item of tracked) {
      const expected = PINNED_INPUTS[item.input_path];
      if (!expected || item.sha256 !== expected) {
        throw new LuxembourgPreflightError(
          "package_hash_mismatch",
          `${item.input_path} SHA-256 mismatch; expected ${expected ?? "an unpinned path"}.`,
          intendedInventory,
        );
      }
    }
    if (tracked.length !== Object.keys(PINNED_INPUTS).length) {
      throw new LuxembourgPreflightError(
        "package_inventory",
        `Expected ${Object.keys(PINNED_INPUTS).length} pinned Luxembourg inputs, found ${tracked.length}.`,
        intendedInventory,
      );
    }
  }

  if (
    tracked.some(
      (item) =>
        item.input_path === OMITTED_RESULTS_RELATIVE ||
        item.input_path === OMITTED_SOURCES_DIR ||
        item.input_path.startsWith(`${OMITTED_SOURCES_DIR}/`),
    )
  ) {
    throw new LuxembourgPreflightError(
      "omitted_bytes_present",
      "Omitted Luxembourg results.json and sources/ must stay out of the slim pack.",
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

  const required = [
    REGISTER_RELATIVE,
    EVENTS_RELATIVE,
    GAPS_RELATIVE,
    CROSSWALK_RELATIVE,
    OBSERVATIONS_RELATIVE,
    COUNTS_RELATIVE,
    SOURCE_INVENTORY_RELATIVE,
  ];
  for (const rel of required) {
    if (!byPath.has(rel)) {
      throw new LuxembourgPreflightError("package_inventory", `Luxembourg pack is missing ${rel}.`, intendedInventory);
    }
  }
  if (byPath.has(OMITTED_RESULTS_RELATIVE)) {
    throw new LuxembourgPreflightError(
      "omitted_results_present",
      "Luxembourg results.json must stay omitted. Do not publish invented result rows.",
      intendedInventory,
    );
  }

  const offices = readJson<LuxembourgOfficeRow[]>(byPath.get(REGISTER_RELATIVE)!.absPath, REGISTER_RELATIVE);
  const events = readJson<LuxembourgEventRow[]>(byPath.get(EVENTS_RELATIVE)!.absPath, EVENTS_RELATIVE);
  const gaps = readJson<LuxembourgGapRow[]>(byPath.get(GAPS_RELATIVE)!.absPath, GAPS_RELATIVE);
  const mergers = readJson<LuxembourgMergerEdge[]>(byPath.get(CROSSWALK_RELATIVE)!.absPath, CROSSWALK_RELATIVE);
  const observations = readJson<LuxembourgObservationEnvelope[]>(
    byPath.get(OBSERVATIONS_RELATIVE)!.absPath,
    OBSERVATIONS_RELATIVE,
  );
  const countsFile = readJson<LuxembourgCountsFile>(byPath.get(COUNTS_RELATIVE)!.absPath, COUNTS_RELATIVE);
  const sourceInventory = readJson<LuxembourgSourceInventoryRow[]>(
    byPath.get(SOURCE_INVENTORY_RELATIVE)!.absPath,
    SOURCE_INVENTORY_RELATIVE,
  );

  if (!Array.isArray(offices) || !Array.isArray(events) || !Array.isArray(gaps) || !Array.isArray(mergers)) {
    throw new LuxembourgPreflightError(
      "research_shape",
      "Luxembourg office, event, gap, and merger tables must be arrays.",
      intendedInventory,
    );
  }
  if (!Array.isArray(observations)) {
    throw new LuxembourgPreflightError(
      "research_shape",
      "Luxembourg observations.json must stay an array of source-statistic envelopes.",
      intendedInventory,
    );
  }
  if (gaps.length !== RESEARCH_GAPS.length) {
    throw new LuxembourgPreflightError(
      "named_holds",
      `Expected ${RESEARCH_GAPS.length} Luxembourg research gaps, found ${gaps.length}.`,
      intendedInventory,
    );
  }
  for (let i = 0; i < RESEARCH_GAPS.length; i++) {
    const gap = gaps[i];
    const hold = RESEARCH_GAPS[i]!;
    if (!gap || gap.id !== hold.token || gap.topic !== hold.topic || gap.status !== hold.status) {
      throw new LuxembourgPreflightError(
        "named_holds",
        `Luxembourg gap ${gap?.id ?? i} does not match ${hold.token} (${hold.status}).`,
        intendedInventory,
      );
    }
  }
  if (countsFile.result_rows !== EXPECTED_COUNTS.documented_result_rows_omitted) {
    throw new LuxembourgPreflightError(
      "omitted_results_count",
      `counts.json result_rows ${countsFile.result_rows} is not the documented omitted ${EXPECTED_COUNTS.documented_result_rows_omitted}.`,
      intendedInventory,
    );
  }
  if (sourceInventory.length !== EXPECTED_COUNTS.source_inventory_rows) {
    throw new LuxembourgPreflightError(
      "source_inventory",
      `Expected ${EXPECTED_COUNTS.source_inventory_rows} omitted source catalogue rows.`,
      intendedInventory,
    );
  }
  for (const row of sourceInventory) {
    const rel = row.path.replace(/\\/g, "/");
    if (!rel.startsWith("sources/")) {
      throw new LuxembourgPreflightError(
        "source_inventory",
        `Source inventory path ${rel} is not an omitted sources/ capture.`,
        intendedInventory,
      );
    }
    const abs = path.join(root, RESEARCH_PREFIX, rel);
    if (existsSync(abs)) {
      throw new LuxembourgPreflightError(
        "omitted_sources_present",
        `Omitted source capture is present on disk: ${rel}.`,
        intendedInventory,
      );
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
    offices,
    events,
    gaps,
    mergers,
    observations,
    countsFile,
    sourceInventory,
    tiers: tierJson,
    intendedInventory,
  };
}
