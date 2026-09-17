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
import { sha256 as adapterSha256 } from "../../observatory/adapters/tar";
import { verifyManifestFiles, zipTable, type TableRow, type WorkbookTable } from "../../observatory/adapters/tables";
import {
  ADAPTER_VERSION,
  EXPECTED_COUNTS,
  LINEAGE_ID,
  MANIFEST_LISTED_FILES,
  METHOD_VERSION,
  PACKAGE_PREFIX,
  REGISTER_RELATIVE,
  REGISTER_SHA256,
  SCHEMA_VERSION,
  TIER_PATH,
  TIER_SHA256,
  buildHashInputs,
  canonical,
  fingerprintSha256,
  releaseIdFor,
  sha256Hex,
  type HashInputDescriptor,
} from "./identity";

export type TrackedInput = HashInputDescriptor & {
  absPath: string;
  bytes: Buffer;
  text: string | null;
};

export type WorkbookSlice = {
  relativePath: string;
  table: WorkbookTable;
  rows: TableRow[];
};

export type AlderneyInventory = {
  root: string;
  packageDir: string;
  packagePrefix: string;
  tierPath: string;
  gitCommit: string | null;
  tracked: TrackedInput[];
  byPath: Map<string, TrackedInput>;
  fingerprint: string;
  releaseId: string;
  hashInputsJson: string;
  hashInputs: ReturnType<typeof buildHashInputs>;
  manifest: Record<string, unknown>;
  coverage: Record<string, unknown>;
  sourceLinks: {
    registered_source_urls: string[];
    urls_without_master_source_row: string[];
  };
  officeRegister: WorkbookSlice;
  history: WorkbookSlice;
  returns: WorkbookSlice;
  sources: WorkbookSlice;
  countryNotes: WorkbookSlice;
  calendar: WorkbookSlice;
  countryCoverage: WorkbookSlice;
  parameters: WorkbookSlice;
  readMe: WorkbookSlice;
  tiers: {
    status: string;
    classifications: Array<{
      office_id: string;
      tier: string;
      rationale: string;
      human_review_required?: boolean;
      tier_uncertain?: boolean;
      [key: string]: unknown;
    }>;
    source_register?: { sha256?: string };
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
      throw new Error(`Unexpected symlink in Alderney package: ${rel}`);
    }
    if (entry.isDirectory()) {
      out.push(...walkRegularFiles(abs, rel));
    } else if (entry.isFile()) {
      out.push(rel);
    } else {
      throw new Error(`Unexpected non-file in Alderney package: ${rel}`);
    }
  }
  return out.sort();
}

function gitTrackedPackageFiles(root: string): string[] {
  const output = execFileSync("git", ["-C", root, "ls-files", "-z", "--", PACKAGE_PREFIX], {
    encoding: "buffer",
  });
  return output
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .sort();
}

function gitHead(root: string): string | null {
  try {
    return execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function loadWorkbook(absPath: string, relativePath: string): WorkbookSlice {
  const table = JSON.parse(readFileSync(absPath, "utf8")) as WorkbookTable;
  if (!table?.sheet || !Array.isArray(table.columns) || !Array.isArray(table.rows) || !Array.isArray(table.source_rows)) {
    throw new Error(`Unsupported table shape: ${relativePath}`);
  }
  if (new Set(table.columns).size !== table.columns.length) {
    throw new Error(`Duplicate column names in ${relativePath}`);
  }
  if (table.rows.length !== table.source_rows.length) {
    throw new Error(`Row/source_row length mismatch in ${relativePath}`);
  }
  for (let i = 0; i < table.rows.length; i++) {
    if (!Array.isArray(table.rows[i]) || table.rows[i]!.length !== table.columns.length) {
      throw new Error(`Malformed row ${i} in ${relativePath}`);
    }
  }
  return { relativePath, table, rows: zipTable(table) };
}

function inputKindFor(inputPath: string): HashInputDescriptor["input_kind"] {
  if (inputPath === TIER_PATH) return "tier_classification";
  if (inputPath.endsWith(".html")) return "artifact";
  return "package";
}

export class AlderneyPreflightError extends Error {
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

export function scanAlderneyInventory(options: {
  root: string;
  packageDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): AlderneyInventory {
  const root = options.root;
  const packageDir = options.packageDir ?? path.join(root, PACKAGE_PREFIX);
  const packagePrefix = options.packageDir
    ? path.relative(root, packageDir).replace(/\\/g, "/") || PACKAGE_PREFIX
    : PACKAGE_PREFIX;
  const tierAbs = options.tierPath ?? path.join(root, TIER_PATH);
  const gitCommit = gitHead(root);

  const schemaAttempt = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_ATTEMPT_LOG_FILENAME);
  const schemaMaster = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_MASTER_FILENAME);
  if (sha256Hex(readFileSync(schemaAttempt)) !== ATTEMPT_LOG_SHA256) {
    throw new AlderneyPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new AlderneyPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  const requireGit = options.requireGitTrackedPackage ?? !options.packageDir;
  let packagePaths: string[];
  if (requireGit) {
    const tracked = gitTrackedPackageFiles(root);
    const walked = walkRegularFiles(packageDir, PACKAGE_PREFIX);
    if (tracked.length !== EXPECTED_COUNTS.package_files_retained) {
      throw new AlderneyPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.package_files_retained} git-tracked Alderney files, found ${tracked.length}.`,
        {},
      );
    }
    if (JSON.stringify(tracked) !== JSON.stringify(walked)) {
      throw new AlderneyPreflightError(
        "unpinned_worktree",
        "Alderney package worktree files do not match git-tracked paths.",
        {},
      );
    }
    packagePaths = tracked;
  } else {
    packagePaths = walkRegularFiles(packageDir, "");
  }

  const packageFilesMeta: Array<{ input_path: string; sha256: string | null; byte_count: number | null; error?: string }> = [];
  const tracked: TrackedInput[] = [];
  for (const rel of packagePaths) {
    const logical = requireGit ? rel : posixJoin(PACKAGE_PREFIX, rel);
    const abs = requireGit ? path.join(root, rel) : path.join(packageDir, rel);
    try {
      const bytes = readFileSync(abs);
      const item: TrackedInput = {
        input_path: logical,
        input_kind: inputKindFor(logical),
        sha256: adapterSha256(bytes),
        byte_count: bytes.length,
        absPath: abs,
        bytes,
        text:
          rel.endsWith(".json") || rel.endsWith(".html") || rel.endsWith(".md") || rel.endsWith(".py")
            ? bytes.toString("utf8")
            : null,
      };
      if (item.input_path.endsWith(".html")) item.input_kind = "artifact";
      if (item.input_path.endsWith(".json") && item.text) {
        JSON.parse(item.text);
      }
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
  const failedFiles = packageFilesMeta.filter((item) => item.error);
  if (failedFiles.length > 0) {
    throw new AlderneyPreflightError(
      "package_read",
      `Failed to read Alderney package files: ${failedFiles.map((item) => item.input_path).join(", ")}`,
      buildIntendedInventory({
        gitCommit,
        packageFiles: packageFilesMeta,
        tier: { input_path: TIER_PATH, sha256: null, byte_count: null, status: null },
      }),
    );
  }

  for (const forbidden of ["tables/governing-control.json", "tables/polling-evidence.json"]) {
    if (tracked.some((item) => item.input_path === posixJoin(PACKAGE_PREFIX, forbidden))) {
      throw new AlderneyPreflightError(
        "absent_optional_present",
        `Alderney package must not invent ${forbidden}.`,
        {},
      );
    }
  }

  let tierMeta: {
    input_path: string;
    sha256: string | null;
    byte_count: number | null;
    error?: string;
    status?: string | null;
  } = { input_path: TIER_PATH, sha256: null, byte_count: null, status: null };
  let tierBytes: Buffer | undefined;
  if (!existsSync(tierAbs)) {
    tierMeta = {
      input_path: TIER_PATH,
      sha256: null,
      byte_count: null,
      status: null,
      error: "missing_tier_file",
    };
  } else {
    tierBytes = readFileSync(tierAbs);
    tierMeta = {
      input_path: TIER_PATH,
      sha256: adapterSha256(tierBytes),
      byte_count: tierBytes.length,
      status: null,
    };
  }

  const intendedInventory = buildIntendedInventory({
    gitCommit,
    packageFiles: packageFilesMeta,
    tier: tierMeta,
  });

  if (tierMeta.error === "missing_tier_file") {
    throw new AlderneyPreflightError(
      "missing_tier",
      `Approved Alderney tier file is missing at ${TIER_PATH}.`,
      intendedInventory,
    );
  }

  let tierJson: AlderneyInventory["tiers"];
  try {
    tierJson = JSON.parse(tierBytes!.toString("utf8")) as AlderneyInventory["tiers"];
  } catch (error) {
    throw new AlderneyPreflightError(
      "tier_unreadable",
      `Alderney tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  tierMeta.status = tierJson.status;
  intendedInventory.tier = tierMeta;

  if (tierJson.status !== "approved") {
    throw new AlderneyPreflightError(
      "tier_not_approved",
      `Alderney tiers status is ${JSON.stringify(tierJson.status)}; import requires status "approved".`,
      intendedInventory,
    );
  }
  if (tierMeta.sha256 !== TIER_SHA256) {
    throw new AlderneyPreflightError(
      "tier_hash_mismatch",
      `Approved Alderney tier SHA-256 mismatch; expected ${TIER_SHA256}.`,
      intendedInventory,
    );
  }

  const register = tracked.find((item) => item.input_path === REGISTER_RELATIVE);
  if (!register || register.sha256 !== REGISTER_SHA256) {
    throw new AlderneyPreflightError(
      "register_hash_mismatch",
      `Office register SHA-256 mismatch; expected ${REGISTER_SHA256}.`,
      intendedInventory,
    );
  }
  if (tierJson.source_register?.sha256 && tierJson.source_register.sha256 !== REGISTER_SHA256) {
    throw new AlderneyPreflightError(
      "register_hash_mismatch",
      "Tier source_register.sha256 does not match the frozen office register.",
      intendedInventory,
    );
  }

  const manifestPath = tracked.find((item) => item.input_path === `${PACKAGE_PREFIX}/manifest.json`);
  if (!manifestPath?.text) {
    throw new AlderneyPreflightError("missing_manifest", "Alderney manifest.json is missing.", intendedInventory);
  }
  const manifest = JSON.parse(manifestPath.text) as Record<string, unknown>;
  if (manifest.schema_version !== "europe-country-extract/1") {
    throw new AlderneyPreflightError(
      "manifest_schema",
      `Unexpected manifest schema_version ${String(manifest.schema_version)}.`,
      intendedInventory,
    );
  }
  if (manifest.country !== "Alderney" || manifest.country_code !== "GG-ALD") {
    throw new AlderneyPreflightError("manifest_country", "Alderney manifest country/code mismatch.", intendedInventory);
  }
  if (manifest.coverage_complete !== false) {
    throw new AlderneyPreflightError("coverage_complete", "Frozen Alderney coverage_complete must be false.", intendedInventory);
  }
  const files = (manifest.files ?? {}) as Record<string, { sha256: string; bytes: number }>;
  if (Object.keys(files).length !== MANIFEST_LISTED_FILES) {
    throw new AlderneyPreflightError(
      "manifest_files",
      `manifest.files must list ${MANIFEST_LISTED_FILES} entries, found ${Object.keys(files).length}.`,
      intendedInventory,
    );
  }
  try {
    verifyManifestFiles(packageDir, files);
  } catch (error) {
    throw new AlderneyPreflightError(
      "manifest_checksum",
      error instanceof Error ? error.message : String(error),
      intendedInventory,
    );
  }

  const byPath = new Map(tracked.map((item) => [item.input_path, item]));
  const tierInput: TrackedInput = {
    input_path: TIER_PATH,
    input_kind: "tier_classification",
    sha256: tierMeta.sha256!,
    byte_count: tierMeta.byte_count!,
    absPath: tierAbs,
    bytes: tierBytes!,
    text: tierBytes!.toString("utf8"),
  };
  const allInputs = [...tracked, tierInput];
  const hashInputs = buildHashInputs({
    inputs: allInputs.map(({ input_path, input_kind, sha256, byte_count }) => ({
      input_path,
      input_kind,
      sha256,
      byte_count,
    })),
  });
  const fingerprint = fingerprintSha256(hashInputs);
  const releaseId = releaseIdFor(fingerprint);

  const pkgFile = (rel: string) => {
    const logical = posixJoin(PACKAGE_PREFIX, rel);
    const item = byPath.get(logical);
    if (!item) throw new AlderneyPreflightError("missing_input", `Missing ${logical}`, intendedInventory);
    return loadWorkbook(item.absPath, logical);
  };
  return {
    root,
    packageDir,
    packagePrefix,
    tierPath: TIER_PATH,
    gitCommit,
    tracked: allInputs,
    byPath: new Map([...byPath, [TIER_PATH, tierInput]]),
    fingerprint,
    releaseId,
    hashInputsJson: canonical(hashInputs),
    hashInputs,
    manifest,
    coverage: JSON.parse(byPath.get(`${PACKAGE_PREFIX}/coverage.json`)!.text!) as Record<string, unknown>,
    sourceLinks: JSON.parse(byPath.get(`${PACKAGE_PREFIX}/source-links.json`)!.text!) as AlderneyInventory["sourceLinks"],
    officeRegister: pkgFile("tables/office-register.json"),
    history: pkgFile("tables/history-index.json"),
    returns: pkgFile("tables/detailed-returns.json"),
    sources: pkgFile("tables/sources.json"),
    countryNotes: pkgFile("tables/country-notes.json"),
    calendar: pkgFile("tables/election-calendar.json"),
    countryCoverage: pkgFile("tables/country-coverage.json"),
    parameters: pkgFile("tables/parameters.json"),
    readMe: pkgFile("tables/read-me.json"),
    tiers: tierJson,
    intendedInventory,
  };
}
