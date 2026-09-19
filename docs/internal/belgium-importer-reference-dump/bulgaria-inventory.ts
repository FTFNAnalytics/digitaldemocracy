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
import { zipTable, type TableRow, type WorkbookTable } from "../../observatory/adapters/tables";
import {
  ADAPTER_VERSION,
  EXPECTED_COUNTS,
  LINEAGE_ID,
  METHOD_VERSION,
  PACKAGE_PREFIX,
  REGISTER_RELATIVE,
  REGISTER_SHA256,
  SCHEMA_VERSION,
  TIER_PATH,
  TIER_SHA256,
  UNPACKED_PREFIX,
  buildHashInputs,
  canonical,
  fingerprintSha256,
  releaseIdFor,
  sha256Hex,
  unpackedPath,
  type HashInputDescriptor,
} from "./identity";

export type TrackedInput = HashInputDescriptor & {
  absPath: string;
  bytes: Buffer;
  text: string | null;
  archiveEntry: string | null;
};

export type WorkbookSlice = {
  relativePath: string;
  archiveEntry: string | null;
  table: WorkbookTable;
  rows: TableRow[];
};

export type HistoryIndexSlice = {
  relativePath: string;
  archiveEntry: string;
  rows: Array<Record<string, unknown>>;
};

export type BulgariaInventory = {
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
    registered_in_master: string[];
    without_master_source_row: string[];
  };
  officeRegister: WorkbookSlice;
  companionRegister: WorkbookSlice;
  histories: WorkbookSlice;
  historyIndex: HistoryIndexSlice;
  returns: WorkbookSlice;
  firstRound: WorkbookSlice;
  unresolvedHistory: WorkbookSlice;
  masterSources: WorkbookSlice;
  companionSources: WorkbookSlice;
  countryNotes: WorkbookSlice;
  calendar: WorkbookSlice;
  countryCoverage: WorkbookSlice;
  parameters: WorkbookSlice;
  readMe: WorkbookSlice;
  companionParameters: WorkbookSlice;
  companionReadMe: WorkbookSlice;
  tiers: {
    status: string;
    classifications: Array<{
      office_id: string;
      tier: string;
      rationale: string;
      human_review_required?: boolean;
      tier_uncertain?: boolean;
      review_category?: string;
      [key: string]: unknown;
    }>;
    notes?: Array<{ scope?: string; status?: string; [key: string]: unknown }>;
    source_register?: { sha256?: string };
    counts_by_approval?: Record<string, number>;
    importer_policy?: { load?: string; approved_count?: number; held_count?: number };
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
      throw new Error(`Unexpected symlink in Bulgaria package: ${rel}`);
    }
    if (entry.isDirectory()) {
      out.push(...walkRegularFiles(abs, rel));
    } else if (entry.isFile()) {
      out.push(rel);
    } else {
      throw new Error(`Unexpected non-file in Bulgaria package: ${rel}`);
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

function loadWorkbook(bytes: Buffer, relativePath: string, archiveEntry: string | null): WorkbookSlice {
  const table = JSON.parse(bytes.toString("utf8")) as WorkbookTable;
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
  return { relativePath, archiveEntry, table, rows: zipTable(table) };
}

function inputKindFor(inputPath: string): HashInputDescriptor["input_kind"] {
  if (inputPath === TIER_PATH) return "tier_classification";
  if (inputPath.endsWith(".html") || inputPath.endsWith(".xlsx") || inputPath.includes("/payload/")) {
    return "artifact";
  }
  return "package";
}

export class BulgariaPreflightError extends Error {
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

function extractBulgariaUstar(buffer: Buffer): Map<string, Buffer> {
  const files = new Map<string, Buffer>();
  let offset = 0;
  const decoder = new TextDecoder("utf-8");
  const readString = (block: Buffer, start: number, length: number) => {
    const slice = block.subarray(start, start + length);
    const end = slice.indexOf(0);
    return decoder.decode(end === -1 ? slice : slice.subarray(0, end)).trim();
  };
  while (offset + 512 <= buffer.length) {
    const header = buffer.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const name = readString(header, 0, 100);
    if (!name) break;
    const sizeText = readString(header, 124, 12);
    const size = Number.parseInt(sizeText, 8);
    if (!Number.isFinite(size) || size < 0) {
      throw new Error(`Invalid tar size for ${name}`);
    }
    const typeflag = String.fromCharCode(header[156] || 0);
    const prefix = readString(header, 345, 155);
    const full = (prefix ? `${prefix}/${name}` : name).replace(/^\.\//, "");
    if (full.startsWith("/") || full.split(/[\\/]/).includes("..")) {
      throw new Error(`Unsafe tar path ${full}`);
    }
    offset += 512;
    const content = buffer.subarray(offset, offset + size);
    offset += Math.ceil(size / 512) * 512;
    if (typeflag === "5" || full.endsWith("/")) continue;
    if (typeflag === "1" || typeflag === "2") {
      throw new Error(`Bulgaria payload rejects links: ${full}`);
    }
    if (typeflag !== "0" && typeflag !== "\0" && typeflag !== "") {
      throw new Error(`Unexpected tar typeflag ${JSON.stringify(typeflag)} for ${full}`);
    }
    if (files.has(full)) {
      throw new Error(`Duplicate tar member ${full}`);
    }
    files.set(full, Buffer.from(content));
  }
  return files;
}

function xzDecompress(buffer: Buffer): Buffer {
  try {
    return execFileSync("xz", ["-dc", "--stdout"], {
      input: buffer,
      maxBuffer: 512 * 1024 * 1024,
      encoding: "buffer",
    });
  } catch (error) {
    throw new Error(`Bulgaria payload is not valid xz: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function unpackBulgariaMembers(packageDir: string): Map<string, Buffer> {
  const manifestPath = path.join(packageDir, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error("Bulgaria manifest.json is missing.");
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
    payload_sha256: string;
    chunks: Record<string, { sha256: string; bytes: number }>;
    inventory?: { path: string; sha256: string; bytes: number };
  };
  const parts: Buffer[] = [];
  for (const [relative, expected] of Object.entries(manifest.chunks ?? {})) {
    const abs = path.join(packageDir, relative);
    if (!existsSync(abs)) {
      throw new Error(`Missing Bulgaria payload chunk ${relative}`);
    }
    const bytes = readFileSync(abs);
    if (bytes.length !== expected.bytes || adapterSha256(bytes) !== expected.sha256) {
      throw new Error(`Bulgaria payload chunk mismatch: ${relative}`);
    }
    parts.push(bytes);
  }
  const xz = Buffer.concat(parts);
  if (adapterSha256(xz) !== manifest.payload_sha256) {
    throw new Error("Bulgaria concatenated payload checksum mismatch");
  }
  const files = extractBulgariaUstar(xzDecompress(xz));
  if (files.size !== EXPECTED_COUNTS.payload_member_files) {
    throw new Error(`Expected ${EXPECTED_COUNTS.payload_member_files} Bulgaria payload members, found ${files.size}`);
  }
  const inventoryBytes = files.get("inventory.json");
  if (!inventoryBytes) {
    throw new Error("Bulgaria payload is missing inventory.json");
  }
  if (manifest.inventory) {
    if (adapterSha256(inventoryBytes) !== manifest.inventory.sha256 || inventoryBytes.length !== manifest.inventory.bytes) {
      throw new Error("Unpacked inventory.json does not match the outer manifest digest");
    }
  }
  const inventory = JSON.parse(inventoryBytes.toString("utf8")) as {
    contents?: Record<string, { sha256: string; bytes: number }>;
  };
  const contents = inventory.contents ?? {};
  for (const [entry, expected] of Object.entries(contents)) {
    const bytes = files.get(entry);
    if (!bytes) {
      throw new Error(`Inventory lists missing member ${entry}`);
    }
    if (bytes.length !== expected.bytes || adapterSha256(bytes) !== expected.sha256) {
      throw new Error(`Bulgaria member hash mismatch: ${entry}`);
    }
  }
  for (const entry of files.keys()) {
    if (entry === "inventory.json") continue;
    if (!contents[entry]) {
      throw new Error(`Unexpected Bulgaria payload member ${entry}`);
    }
  }
  return files;
}

export function scanBulgariaInventory(options: {
  root: string;
  packageDir?: string;
  tierPath?: string;
  requireGitTrackedPackage?: boolean;
}): BulgariaInventory {
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
    throw new BulgariaPreflightError("schema_hash_mismatch", "Attempt-log SQL bytes do not match the Identity Rules digest.", {});
  }
  if (sha256Hex(readFileSync(schemaMaster)) !== MASTER_SCHEMA_SHA256) {
    throw new BulgariaPreflightError("schema_hash_mismatch", "Master SQL bytes do not match the Identity Rules digest.", {});
  }

  const requireGit = options.requireGitTrackedPackage ?? !options.packageDir;
  let packagePaths: string[];
  if (requireGit) {
    const tracked = gitTrackedPackageFiles(root);
    const walked = walkRegularFiles(packageDir, PACKAGE_PREFIX);
    if (tracked.length !== EXPECTED_COUNTS.outer_package_files) {
      throw new BulgariaPreflightError(
        "package_inventory",
        `Expected ${EXPECTED_COUNTS.outer_package_files} git-tracked Bulgaria files, found ${tracked.length}.`,
        {},
      );
    }
    if (JSON.stringify(tracked) !== JSON.stringify(walked)) {
      throw new BulgariaPreflightError(
        "unpinned_worktree",
        "Bulgaria package worktree files do not match git-tracked paths.",
        {},
      );
    }
    packagePaths = tracked;
  } else {
    packagePaths = walkRegularFiles(packageDir, "");
  }

  const packageFilesMeta: Array<{ input_path: string; sha256: string | null; byte_count: number | null; error?: string }> =
    [];
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
        archiveEntry: null,
      };
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
    throw new BulgariaPreflightError(
      "package_read",
      `Failed to read Bulgaria package files: ${failedFiles.map((item) => item.input_path).join(", ")}`,
      buildIntendedInventory({
        gitCommit,
        packageFiles: packageFilesMeta,
        tier: { input_path: TIER_PATH, sha256: null, byte_count: null, status: null },
      }),
    );
  }

  let members: Map<string, Buffer>;
  try {
    members = unpackBulgariaMembers(packageDir);
  } catch (error) {
    throw new BulgariaPreflightError(
      "packed_input",
      error instanceof Error ? error.message : String(error),
      buildIntendedInventory({
        gitCommit,
        packageFiles: packageFilesMeta,
        tier: { input_path: TIER_PATH, sha256: null, byte_count: null, status: null },
      }),
    );
  }

  for (const [entry, bytes] of [...members.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))) {
    const logical = unpackedPath(entry);
    const text =
      entry.endsWith(".json") || entry.endsWith(".html") || entry.endsWith(".md") || entry.endsWith(".py")
        ? bytes.toString("utf8")
        : null;
    if (entry.endsWith(".json") && text) {
      try {
        JSON.parse(text);
      } catch (error) {
        throw new BulgariaPreflightError(
          "packed_input",
          `Invalid JSON member ${entry}: ${error instanceof Error ? error.message : String(error)}`,
          buildIntendedInventory({
            gitCommit,
            packageFiles: packageFilesMeta,
            tier: { input_path: TIER_PATH, sha256: null, byte_count: null, status: null },
          }),
        );
      }
    }
    tracked.push({
      input_path: logical,
      input_kind: inputKindFor(logical),
      sha256: adapterSha256(bytes),
      byte_count: bytes.length,
      absPath: "",
      bytes,
      text,
      archiveEntry: entry,
    });
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
    throw new BulgariaPreflightError(
      "missing_tier",
      `Approved Bulgaria tier file is missing at ${TIER_PATH}.`,
      intendedInventory,
    );
  }

  let tierJson: BulgariaInventory["tiers"];
  try {
    tierJson = JSON.parse(tierBytes!.toString("utf8")) as BulgariaInventory["tiers"];
  } catch (error) {
    throw new BulgariaPreflightError(
      "tier_unreadable",
      `Bulgaria tier file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      intendedInventory,
    );
  }
  tierMeta.status = tierJson.status;
  intendedInventory.tier = tierMeta;

  if (tierJson.status !== "approved") {
    throw new BulgariaPreflightError(
      "tier_not_approved",
      `Bulgaria tiers status is ${JSON.stringify(tierJson.status)}; import requires status "approved".`,
      intendedInventory,
    );
  }
  if (tierMeta.sha256 !== TIER_SHA256) {
    throw new BulgariaPreflightError(
      "tier_hash_mismatch",
      `Approved Bulgaria tier SHA-256 mismatch; expected ${TIER_SHA256}.`,
      intendedInventory,
    );
  }

  const byPath = new Map(tracked.map((item) => [item.input_path, item]));
  const register = byPath.get(REGISTER_RELATIVE);
  if (!register || register.sha256 !== REGISTER_SHA256) {
    throw new BulgariaPreflightError(
      "register_hash_mismatch",
      `Office register SHA-256 mismatch; expected ${REGISTER_SHA256}.`,
      intendedInventory,
    );
  }
  if (tierJson.source_register?.sha256 && tierJson.source_register.sha256 !== REGISTER_SHA256) {
    throw new BulgariaPreflightError(
      "register_hash_mismatch",
      "Tier source_register.sha256 does not match the frozen office register.",
      intendedInventory,
    );
  }

  const manifestItem = byPath.get(`${PACKAGE_PREFIX}/manifest.json`);
  if (!manifestItem?.text) {
    throw new BulgariaPreflightError("missing_manifest", "Bulgaria manifest.json is missing.", intendedInventory);
  }
  const manifest = JSON.parse(manifestItem.text) as Record<string, unknown>;
  if (manifest.country !== "Bulgaria") {
    throw new BulgariaPreflightError("manifest_country", "Bulgaria manifest country mismatch.", intendedInventory);
  }

  const coverageItem = byPath.get(`${PACKAGE_PREFIX}/coverage.json`);
  if (!coverageItem?.text) {
    throw new BulgariaPreflightError("missing_coverage", "Bulgaria coverage.json is missing.", intendedInventory);
  }
  const sourceLinksItem = byPath.get(`${UNPACKED_PREFIX}/source-links.json`);
  if (!sourceLinksItem?.text) {
    throw new BulgariaPreflightError("missing_source_links", "Bulgaria source-links.json is missing.", intendedInventory);
  }

  const tierInput: TrackedInput = {
    input_path: TIER_PATH,
    input_kind: "tier_classification",
    sha256: tierMeta.sha256!,
    byte_count: tierMeta.byte_count!,
    absPath: tierAbs,
    bytes: tierBytes!,
    text: tierBytes!.toString("utf8"),
    archiveEntry: null,
  };
  const allInputs = [...tracked, tierInput];
  if (allInputs.length !== EXPECTED_COUNTS.retained_inputs) {
    throw new BulgariaPreflightError(
      "retained_input_count",
      `Expected ${EXPECTED_COUNTS.retained_inputs} retained inputs, found ${allInputs.length}.`,
      intendedInventory,
    );
  }
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

  const memberFile = (entry: string) => {
    const logical = unpackedPath(entry);
    const item = byPath.get(logical);
    if (!item) throw new BulgariaPreflightError("missing_input", `Missing ${logical}`, intendedInventory);
    return loadWorkbook(item.bytes, logical, entry);
  };

  const historyIndexItem = byPath.get(`${UNPACKED_PREFIX}/history-index.json`);
  if (!historyIndexItem?.text) {
    throw new BulgariaPreflightError("missing_input", "Missing history-index.json", intendedInventory);
  }
  const historyIndexRows = JSON.parse(historyIndexItem.text) as Array<Record<string, unknown>>;
  if (!Array.isArray(historyIndexRows)) {
    throw new BulgariaPreflightError("packed_input", "history-index.json must be an array", intendedInventory);
  }

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
    coverage: JSON.parse(coverageItem.text) as Record<string, unknown>,
    sourceLinks: JSON.parse(sourceLinksItem.text) as BulgariaInventory["sourceLinks"],
    officeRegister: memberFile("tables/master/office-register.json"),
    companionRegister: memberFile("tables/companion/office-register.json"),
    histories: memberFile("tables/companion/history-index.json"),
    historyIndex: {
      relativePath: `${UNPACKED_PREFIX}/history-index.json`,
      archiveEntry: "history-index.json",
      rows: historyIndexRows,
    },
    returns: memberFile("tables/companion/detailed-returns.json"),
    firstRound: memberFile("tables/companion/first-round-returns.json"),
    unresolvedHistory: memberFile("tables/companion/unresolved-history.json"),
    masterSources: memberFile("tables/master/sources.json"),
    companionSources: memberFile("tables/companion/sources.json"),
    countryNotes: memberFile("tables/master/country-notes.json"),
    calendar: memberFile("tables/master/election-calendar.json"),
    countryCoverage: memberFile("tables/master/country-coverage.json"),
    parameters: memberFile("tables/master/parameters.json"),
    readMe: memberFile("tables/master/read-me.json"),
    companionParameters: memberFile("tables/companion/parameters.json"),
    companionReadMe: memberFile("tables/companion/read-me.json"),
    tiers: tierJson,
    intendedInventory,
  };
}
