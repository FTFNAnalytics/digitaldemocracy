import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  ATTEMPT_LOG_SCHEMA_PATH,
  ATTEMPT_LOG_SHA256,
  ADAPTER_VERSION,
  APPROVED_TIER_PATH,
  APPROVED_TIER_SHA256,
  DRAFT_TIER_SHA256,
  EXPECTED_COUNTS,
  HashInputDescriptor,
  LINEAGE_ID,
  MASTER_SCHEMA_PATH,
  MASTER_SCHEMA_SHA256,
  METHOD_VERSION,
  PACKAGE_PREFIX,
  REGISTER_RELATIVE,
  REGISTER_SHA256,
  SCHEMA_VERSION,
  TIER_PATH,
  buildHashInputs,
  canonical,
  fingerprintSha256,
  releaseIdFor,
  sha256Hex,
} from "../identity";
import { ATLAS_ATTEMPT_LOG_FILENAME, ATLAS_MASTER_FILENAME, ATLAS_MIGRATIONS_DIR } from "../migrations";
import { sha256 as adapterSha256 } from "../../observatory/adapters/tar";
import { verifyManifestFiles, zipTable, type TableRow, type WorkbookTable } from "../../observatory/adapters/tables";

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

export type AlbaniaInventory = {
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
  history: WorkbookSlice[];
  returns: WorkbookSlice[];
  sources: WorkbookSlice;
  countryNotes: WorkbookSlice;
  calendar: WorkbookSlice;
  control: WorkbookSlice;
  poll: WorkbookSlice;
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
      throw new Error(`Unexpected symlink in Albania package: ${rel}`);
    }
    if (entry.isDirectory()) {
      out.push(...walkRegularFiles(abs, rel));
    } else if (entry.isFile()) {
      out.push(rel);
    } else {
      throw new Error(`Unexpected non-file in Albania package: ${rel}`);
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
  return { relativePath, table, rows: zipTable(table) };
}

function numberedTables(dirAbs: string, dirRel: string, prefix: string): WorkbookSlice[] {
  return readdirSync(dirAbs)
    .filter((name) => name.startsWith(prefix) && name.endsWith(".json"))
    .sort()
    .map((name) => loadWorkbook(path.join(dirAbs, name), posixJoin(dirRel, name)));
}

function inputKindFor(inputPath: string): HashInputDescriptor["input_kind"] {
  if (inputPath === TIER_PATH) return "tier_classification";
  if (inputPath.endsWith(".html")) return "artifact";
  return "package";
}

export type InventoryScanError = {
  code: string;
  message: string;
  inventory: Record<string, unknown>;
};

export class AlbaniaPreflightError extends Error {
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

export function scanAlbaniaInventory(options: {
  root: string;
  packageDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): AlbaniaInventory {
  const root = options.root;
  const packageDir = options.packageDir ?? path.join(root, PACKAGE_PREFIX);
  const packagePrefix = options.packageDir
    ? path.relative(root, packageDir).replace(/\\/g, "/") || PACKAGE_PREFIX
    : PACKAGE_PREFIX;
  const readingCheckedInSchema = !options.tierPath;
  const tierAbs = options.tierPath ?? path.join(root, TIER_PATH);
  const gitCommit = gitHead(root);

  const schemaAttempt = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_ATTEMPT_LOG_FILENAME);
  const schemaMaster = path.join(root, ATLAS_MIGRATIONS_DIR, ATLAS_MASTER_FILENAME);
  if (sha256Hex(readFileSync(schemaAttempt)) !== ATTEMPT_LOG_SHA256) {
    throw new AlbaniaPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new AlbaniaPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  const requireGit = options.requireGitTrackedPackage ?? !options.packageDir;
  let packagePaths: string[];
  if (requireGit) {
    const tracked = gitTrackedPackageFiles(root);
    const walked = walkRegularFiles(packageDir, PACKAGE_PREFIX);
    if (tracked.length !== EXPECTED_COUNTS.package_files_retained) {
      throw new AlbaniaPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.package_files_retained} git-tracked Albania files, found ${tracked.length}.`,
        {},
      );
    }
    if (JSON.stringify(tracked) !== JSON.stringify(walked)) {
      throw new AlbaniaPreflightError(
        "unpinned_worktree",
        "Albania package worktree files do not match git-tracked paths.",
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
        text: rel.endsWith(".json") || rel.endsWith(".html") || rel.endsWith(".md") || rel.endsWith(".py")
          ? bytes.toString("utf8")
          : null,
      };
      if (item.input_path.endsWith(".html")) item.input_kind = "artifact";
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
    throw new AlbaniaPreflightError(
      "missing_tier",
      `Approved Albania tier file is missing at ${TIER_PATH}.`,
      intendedInventory,
    );
  }

  let classificationBytes = tierBytes!;
  if (readingCheckedInSchema) {
    if (tierMeta.sha256 !== DRAFT_TIER_SHA256) {
      throw new AlbaniaPreflightError(
        "tier_hash_mismatch",
        `Albania schema-path tier SHA-256 mismatch; expected ${DRAFT_TIER_SHA256}.`,
        intendedInventory,
      );
    }
    let draftRows: Array<{ tier?: string; justin_approved?: boolean; review_status?: string }>;
    try {
      const parsed = JSON.parse(tierBytes!.toString("utf8")) as unknown;
      if (!Array.isArray(parsed)) throw new Error("tier file is not an array");
      draftRows = parsed as Array<{ tier?: string; justin_approved?: boolean; review_status?: string }>;
    } catch (error) {
      throw new AlbaniaPreflightError(
        "tier_unreadable",
        `Albania schema-path tier file is not a valid tier array: ${error instanceof Error ? error.message : String(error)}`,
        intendedInventory,
      );
    }
    const histogram = { national: 0, municipal: 0, other: 0 };
    for (const row of draftRows) {
      if (row.justin_approved !== false || row.review_status !== "draft_unapproved") {
        throw new AlbaniaPreflightError(
          "tier_not_approved",
          "Prompt BA draft rows must stay justin_approved false and draft_unapproved.",
          intendedInventory,
        );
      }
      if (row.tier !== "national" && row.tier !== "municipal" && row.tier !== "other") {
        throw new AlbaniaPreflightError(
          "tier_unreadable",
          `Unexpected Albania draft tier ${JSON.stringify(row.tier)}.`,
          intendedInventory,
        );
      }
      histogram[row.tier] += 1;
    }
    if (
      draftRows.length !== 891 ||
      histogram.national !== 1 ||
      histogram.municipal !== 868 ||
      histogram.other !== 22
    ) {
      throw new AlbaniaPreflightError(
        "office_count",
        `Albania Prompt BA draft histogram ${draftRows.length} ${JSON.stringify(histogram)} is not 891 (1/868/22).`,
        intendedInventory,
      );
    }
    const approvedAbs = path.join(root, APPROVED_TIER_PATH);
    if (!existsSync(approvedAbs)) {
      throw new AlbaniaPreflightError(
        "missing_tier",
        `Phase 1 approved Albania tier file is missing at ${APPROVED_TIER_PATH}.`,
        intendedInventory,
      );
    }
    classificationBytes = readFileSync(approvedAbs);
    if (adapterSha256(classificationBytes) !== APPROVED_TIER_SHA256) {
      throw new AlbaniaPreflightError(
        "tier_hash_mismatch",
        `Phase 1 approved Albania tier SHA-256 mismatch; expected ${APPROVED_TIER_SHA256}.`,
        intendedInventory,
      );
    }
  }

  let tierJson: AlbaniaInventory["tiers"];
  try {
    tierJson = JSON.parse(classificationBytes.toString("utf8")) as AlbaniaInventory["tiers"];
  } catch (error) {
    throw new AlbaniaPreflightError(
      "tier_unreadable",
      `Albania tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  tierMeta.status = tierJson.status;
  intendedInventory.tier = tierMeta;

  if (tierJson.status !== "approved") {
    throw new AlbaniaPreflightError(
      "tier_not_approved",
      `Albania tiers status is ${JSON.stringify(tierJson.status)}; import requires status "approved".`,
      intendedInventory,
    );
  }

  const register = tracked.find((item) => item.input_path === REGISTER_RELATIVE);
  if (!register || register.sha256 !== REGISTER_SHA256) {
    throw new AlbaniaPreflightError(
      "register_hash_mismatch",
      `Office register SHA-256 mismatch; expected ${REGISTER_SHA256}.`,
      intendedInventory,
    );
  }
  if (tierJson.source_register?.sha256 && tierJson.source_register.sha256 !== REGISTER_SHA256) {
    throw new AlbaniaPreflightError(
      "register_hash_mismatch",
      "Tier source_register.sha256 does not match the frozen office register.",
      intendedInventory,
    );
  }

  const manifestPath = tracked.find((item) => item.input_path === `${PACKAGE_PREFIX}/manifest.json`);
  if (!manifestPath?.text) {
    throw new AlbaniaPreflightError("missing_manifest", "Albania manifest.json is missing.", intendedInventory);
  }
  const manifest = JSON.parse(manifestPath.text) as Record<string, unknown>;
  if (manifest.schema_version !== "europe-country-extract/1") {
    throw new AlbaniaPreflightError(
      "manifest_schema",
      `Unexpected manifest schema_version ${String(manifest.schema_version)}.`,
      intendedInventory,
    );
  }
  if (manifest.coverage_complete !== false) {
    throw new AlbaniaPreflightError("coverage_complete", "Frozen Albania coverage_complete must be false.", intendedInventory);
  }
  const files = (manifest.files ?? {}) as Record<string, { sha256: string; bytes: number }>;
  if (Object.keys(files).length !== 159) {
    throw new AlbaniaPreflightError(
      "manifest_files",
      `manifest.files must list 159 entries, found ${Object.keys(files).length}.`,
      intendedInventory,
    );
  }
  try {
    verifyManifestFiles(packageDir, files);
  } catch (error) {
    throw new AlbaniaPreflightError(
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

  const tablesRel = `${PACKAGE_PREFIX}/tables`;
  const tablesAbs = path.join(packageDir, "tables");
  const pkgFile = (rel: string) => {
    const logical = posixJoin(PACKAGE_PREFIX, rel);
    const item = byPath.get(logical);
    if (!item) throw new AlbaniaPreflightError("missing_input", `Missing ${logical}`, intendedInventory);
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
    sourceLinks: JSON.parse(byPath.get(`${PACKAGE_PREFIX}/source-links.json`)!.text!) as AlbaniaInventory["sourceLinks"],
    officeRegister: pkgFile("tables/office-register.json"),
    history: numberedTables(tablesAbs, tablesRel, "history-index-"),
    returns: numberedTables(tablesAbs, tablesRel, "detailed-returns-"),
    sources: pkgFile("tables/sources.json"),
    countryNotes: pkgFile("tables/country-notes.json"),
    calendar: pkgFile("tables/election-calendar.json"),
    control: pkgFile("tables/governing-control.json"),
    poll: pkgFile("tables/polling-evidence.json"),
    countryCoverage: pkgFile("tables/country-coverage.json"),
    parameters: pkgFile("tables/parameters.json"),
    readMe: pkgFile("tables/read-me.json"),
    tiers: tierJson,
    intendedInventory,
  };
}
