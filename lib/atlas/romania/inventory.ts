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
  EVENTS_RELATIVE,
  EVENTS_SHA256,
  EXPECTED_COUNTS,
  GAPS_RELATIVE,
  GAPS_SHA256,
  GEOGRAPHY_RELATIVE,
  GEOGRAPHY_SHA256,
  LINEAGE_ID,
  METHOD_VERSION,
  NAMED_HOLDS,
  OMITTED_EVENTS_JSON,
  REGISTER_RELATIVE,
  REGISTER_SHA256,
  RESEARCH_PREFIX,
  RESULTS_RELATIVE,
  RESULTS_SHA256,
  SCHEMA_VERSION,
  SOURCES_RELATIVE,
  SOURCES_SHA256,
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

export type RomaniaOfficeRow = {
  office_id: string;
  country_id: string;
  name: string;
  office_type: string;
  geography_id: string;
  parent_geography_id?: string | null;
  current: boolean;
  elected: boolean;
  direct_election: boolean;
  proposed_tier: string;
  next_election_date?: string | null;
  next_date_certainty?: string | null;
  source_ids: string[];
  research_note?: string | null;
  successor_office_id?: string;
  [key: string]: unknown;
};

export type RomaniaEventRow = {
  event_id: string;
  office_id: string;
  election_date: string;
  event_type: string;
  round?: number | null;
  status: string;
  certification_status: string;
  source_ids: string[];
  note?: string | null;
  [key: string]: unknown;
};

export type RomaniaResultRow = {
  result_id: string;
  event_id: string;
  contestant: string;
  votes: number | null;
  vote_share_pct: number | null;
  seats: number | null;
  rank: number | null;
  source_id: string;
  note?: string | null;
  [key: string]: unknown;
};

export type RomaniaGeographyRow = {
  geography_id: string;
  name: string;
  kind: string;
  source_code?: string | null;
  parent_geography_id?: string | null;
  nuts_code?: string | null;
  [key: string]: unknown;
};

export type RomaniaSourceRow = {
  source_id: string;
  title?: string | null;
  publisher?: string | null;
  url?: string | null;
  mirror_url?: string | null;
  captured?: string | null;
  sha256?: string | null;
  status?: string | null;
  [key: string]: unknown;
};

export type RomaniaGapRow = {
  id: string;
  topic: string;
  status: string;
  detail: string;
};

export type RomaniaTierClassification = {
  office_id: string;
  tier: string;
  rationale: string;
  human_review_required?: boolean;
  tier_uncertain?: boolean;
  [key: string]: unknown;
};

export type RomaniaInventory = {
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
  offices: RomaniaOfficeRow[];
  events: RomaniaEventRow[];
  results: RomaniaResultRow[];
  geographies: RomaniaGeographyRow[];
  sourceCatalogue: RomaniaSourceRow[];
  gaps: RomaniaGapRow[];
  tiers: {
    status: string;
    production_accepted?: boolean;
    lineage_id?: string;
    classifications: RomaniaTierClassification[];
    source_register?: { sha256?: string; input_path?: string };
    predecessor_draft_sha256?: string;
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
      throw new Error(`Unexpected symlink in Romania research pack: ${rel}`);
    }
    if (entry.isDirectory()) {
      out.push(...walkRegularFiles(abs, rel));
    } else if (entry.isFile()) {
      if (entry.name === "README.md") continue;
      out.push(rel);
    } else {
      throw new Error(`Unexpected non-file in Romania research pack: ${rel}`);
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

export class RomaniaPreflightError extends Error {
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
    omitted_events_json: OMITTED_EVENTS_JSON,
  };
}

function readJsonText(absPath: string, relativePath: string): string {
  const bytes = readFileSync(absPath);
  if (relativePath.endsWith(".gz")) return gunzipSync(bytes).toString("utf8");
  return bytes.toString("utf8");
}

function readJson<T>(absPath: string, relativePath: string): T {
  try {
    return JSON.parse(readJsonText(absPath, relativePath)) as T;
  } catch (error) {
    throw new Error(`${relativePath} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function scanRomaniaInventory(options: {
  root: string;
  researchDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): RomaniaInventory {
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
    throw new RomaniaPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new RomaniaPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  const requireGit = options.requireGitTrackedPackage ?? !options.researchDir;
  let packagePaths: string[];
  if (requireGit) {
    const tracked = gitTrackedResearchFiles(root);
    const walked = [...walkRegularFiles(researchDir, RESEARCH_PREFIX), TIER_PATH].sort();
    if (tracked.includes(OMITTED_EVENTS_JSON) || walked.includes(OMITTED_EVENTS_JSON)) {
      throw new RomaniaPreflightError(
        "omitted_events_present",
        "Uncompressed events.json is present. The slim importer reads events.json.gz only and does not adopt a twin.",
        {},
      );
    }
    if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
      throw new RomaniaPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.retained_inputs} git-tracked Romania research/tier files, found ${tracked.length}.`,
        {},
      );
    }
    if (JSON.stringify(tracked) !== JSON.stringify(walked)) {
      throw new RomaniaPreflightError(
        "unpinned_worktree",
        "Romania research worktree files do not match git-tracked paths.",
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
    throw new RomaniaPreflightError("missing_tier", `Approved Romania tier file is missing at ${TIER_PATH}.`, intendedInventory);
  }

  let tierJson: RomaniaInventory["tiers"];
  try {
    tierJson = JSON.parse(tierItem.text ?? "") as RomaniaInventory["tiers"];
  } catch (error) {
    throw new RomaniaPreflightError(
      "tier_unreadable",
      `Romania tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  tierMeta.status = tierJson.status;
  intendedInventory.tier = tierMeta;

  if (tierJson.status !== "approved" || tierJson.production_accepted !== true) {
    throw new RomaniaPreflightError(
      "tier_not_approved",
      `Romania tiers status is ${JSON.stringify(tierJson.status)}; import requires approved production-accepted bytes.`,
      intendedInventory,
    );
  }
  if (tierItem.sha256 !== TIER_SHA256) {
    throw new RomaniaPreflightError(
      "tier_hash_mismatch",
      `Romania tier SHA-256 mismatch; expected ${TIER_SHA256}.`,
      intendedInventory,
    );
  }
  if (tierJson.lineage_id && tierJson.lineage_id !== LINEAGE_ID) {
    throw new RomaniaPreflightError("lineage_mismatch", "Romania tier lineage_id is not country-package-romania.", intendedInventory);
  }

  const pinned: Array<[string, string]> = [
    [REGISTER_RELATIVE, REGISTER_SHA256],
    [EVENTS_RELATIVE, EVENTS_SHA256],
    [RESULTS_RELATIVE, RESULTS_SHA256],
    [GEOGRAPHY_RELATIVE, GEOGRAPHY_SHA256],
    [SOURCES_RELATIVE, SOURCES_SHA256],
    [GAPS_RELATIVE, GAPS_SHA256],
  ];
  for (const [rel, expected] of pinned) {
    const item = tracked.find((row) => row.input_path === rel);
    if (!item || item.sha256 !== expected) {
      throw new RomaniaPreflightError(
        "package_hash_mismatch",
        `${rel} SHA-256 mismatch; expected ${expected}.`,
        intendedInventory,
      );
    }
  }
  if (tierJson.source_register?.sha256 && tierJson.source_register.sha256 !== REGISTER_SHA256) {
    throw new RomaniaPreflightError(
      "register_hash_mismatch",
      "Tier source_register.sha256 does not match the accepted office register.",
      intendedInventory,
    );
  }
  if (tracked.some((item) => item.input_path === OMITTED_EVENTS_JSON)) {
    throw new RomaniaPreflightError(
      "omitted_events_present",
      "Uncompressed events.json must stay omitted from the slim pack.",
      intendedInventory,
    );
  }
  if (tracked.length !== EXPECTED_COUNTS.retained_inputs) {
    throw new RomaniaPreflightError(
      "package_inventory",
      `Expected ${EXPECTED_COUNTS.retained_inputs} retained Romania inputs, found ${tracked.length}.`,
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

  const offices = readJson<RomaniaOfficeRow[]>(byPath.get(REGISTER_RELATIVE)!.absPath, REGISTER_RELATIVE);
  const events = readJson<RomaniaEventRow[]>(byPath.get(EVENTS_RELATIVE)!.absPath, EVENTS_RELATIVE);
  const results = readJson<RomaniaResultRow[]>(byPath.get(RESULTS_RELATIVE)!.absPath, RESULTS_RELATIVE);
  const geographies = readJson<RomaniaGeographyRow[]>(byPath.get(GEOGRAPHY_RELATIVE)!.absPath, GEOGRAPHY_RELATIVE);
  const sourceCatalogue = readJson<RomaniaSourceRow[]>(byPath.get(SOURCES_RELATIVE)!.absPath, SOURCES_RELATIVE);
  const gaps = readJson<RomaniaGapRow[]>(byPath.get(GAPS_RELATIVE)!.absPath, GAPS_RELATIVE);
  if (!Array.isArray(offices) || !Array.isArray(events) || !Array.isArray(geographies) || !Array.isArray(results)) {
    throw new RomaniaPreflightError(
      "research_shape",
      "Romania office, event, geography, and result tables must be arrays.",
      intendedInventory,
    );
  }
  if (!Array.isArray(gaps) || gaps.length !== NAMED_HOLDS.length) {
    throw new RomaniaPreflightError(
      "named_holds",
      `Expected ${NAMED_HOLDS.length} Romania research gaps, found ${Array.isArray(gaps) ? gaps.length : "non-array"}.`,
      intendedInventory,
    );
  }
  for (let i = 0; i < NAMED_HOLDS.length; i++) {
    const gap = gaps[i];
    const hold = NAMED_HOLDS[i]!;
    if (!gap || gap.id !== hold.token || gap.topic !== hold.topic || gap.status !== "open" || gap.detail !== hold.reason) {
      throw new RomaniaPreflightError(
        "named_holds",
        `Romania gap ${gap?.id ?? i} does not match the open hold ${hold.token}.`,
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
    results,
    geographies,
    sourceCatalogue,
    gaps,
    tiers: tierJson,
    intendedInventory,
  };
}
