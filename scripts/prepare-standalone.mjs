/**
 * Copy .next/static and public/ into the standalone tree after `next build`.
 * Fail if chunks contain no CSS, or if the copied file count does not match
 * the source. A silent partial copy leaves the site unstyled: the missing
 * stylesheet returns HTTP 500 while neighbouring JS chunks can still return 200.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, realpathSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * @param {string} dir
 * @returns {string[]} absolute file paths, sorted
 */
export function listFiles(dir) {
  if (!existsSync(dir)) return [];
  /** @type {string[]} */
  const files = [];
  for (const entry of readdirSync(dir, { recursive: true, encoding: "utf8" })) {
    const full = path.join(dir, entry);
    if (statSync(full).isFile()) files.push(full);
  }
  files.sort();
  return files;
}

/**
 * @param {string} root
 * @returns {Set<string>}
 */
function relativeSet(root, files) {
  return new Set(files.map((file) => path.relative(root, file).split(path.sep).join("/")));
}

/**
 * @param {string} sourceDir
 * @param {string} destDir
 * @param {string} label
 */
export function assertCopiedFileCount(sourceDir, destDir, label) {
  const sourceFiles = listFiles(sourceDir);
  const copiedFiles = listFiles(destDir);
  const source = relativeSet(sourceDir, sourceFiles);
  const copied = relativeSet(destDir, copiedFiles);
  const missing = [...source].filter((rel) => !copied.has(rel)).sort();
  const extra = [...copied].filter((rel) => !source.has(rel)).sort();
  if (copiedFiles.length !== sourceFiles.length || missing.length > 0 || extra.length > 0) {
    const lines = [
      `prepare-standalone: ${label} copied file count ${copiedFiles.length} does not match source ${sourceFiles.length}.`,
    ];
    if (missing.length > 0) lines.push(`missing:\n  ${missing.join("\n  ")}`);
    if (extra.length > 0) lines.push(`extra:\n  ${extra.join("\n  ")}`);
    throw new Error(lines.join("\n"));
  }
  return copiedFiles;
}

/**
 * Stylesheets Next emits under .next/static/chunks. The live homepage references
 * /_next/static/chunks/<hash>.css; a tree with none of those files cannot be styled.
 * @param {string} staticDir
 * @returns {string[]}
 */
export function cssChunkFiles(staticDir) {
  return listFiles(path.join(staticDir, "chunks")).filter((file) => file.endsWith(".css"));
}

/**
 * @param {string} file
 * @param {string} root
 */
function describeFile(file, root) {
  const rel = path.relative(root, file).split(path.sep).join("/");
  return `  ${statSync(file).size}\t${rel}`;
}

/**
 * Replace dest with a copy of source, then require the file counts to match.
 * @param {string} sourceDir
 * @param {string} destDir
 * @param {string} label
 * @param {(line: string) => void} log
 */
function copyTree(sourceDir, destDir, label, log) {
  rmSync(destDir, { recursive: true, force: true });
  mkdirSync(path.dirname(destDir), { recursive: true });
  cpSync(sourceDir, destDir, { recursive: true });
  const copied = assertCopiedFileCount(sourceDir, destDir, label);
  log(`prepare-standalone: copied ${copied.length} ${label} file${copied.length === 1 ? "" : "s"}`);
  for (const file of copied) log(describeFile(file, destDir));
  return copied;
}

/**
 * @param {{ root?: string, log?: (line: string) => void }} [options]
 */
export function prepareStandalone(options = {}) {
  const root = options.root ?? process.cwd();
  const log = options.log ?? console.log;
  const sourceStatic = path.join(root, ".next", "static");
  const destStatic = path.join(root, ".next", "standalone", ".next", "static");

  if (!existsSync(sourceStatic)) {
    throw new Error(`prepare-standalone: missing ${sourceStatic}. Run next build first.`);
  }

  const css = cssChunkFiles(sourceStatic);
  if (css.length === 0) {
    throw new Error(
      `prepare-standalone: ${path.join(sourceStatic, "chunks")} contains no .css file. Refusing to assemble a standalone tree that would serve unstyled HTML.`,
    );
  }

  const copiedStatic = copyTree(sourceStatic, destStatic, "static", log);
  const copiedCss = cssChunkFiles(destStatic);
  if (copiedCss.length !== css.length) {
    throw new Error(
      `prepare-standalone: copied ${copiedCss.length} css chunk file${copiedCss.length === 1 ? "" : "s"}, source has ${css.length}.`,
    );
  }

  const sourcePublic = path.join(root, "public");
  const destPublic = path.join(root, ".next", "standalone", "public");
  let publicCount = 0;
  if (existsSync(sourcePublic)) {
    publicCount = copyTree(sourcePublic, destPublic, "public", log).length;
  }

  return { staticCount: copiedStatic.length, cssCount: css.length, publicCount };
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return import.meta.url === pathToFileURL(entry).href;
  }
}

if (isDirectRun()) {
  try {
    prepareStandalone();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
