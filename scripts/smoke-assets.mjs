/**
 * Fetch a page, then every /_next/static asset it references.
 * Exit non-zero when the page or any asset is not HTTP 200.
 *
 *   npm run smoke -- http://localhost:3000
 *   npm run smoke -- https://center4digitaldemocracy.com
 */
import { pathToFileURL } from "node:url";
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

const STATIC_PREFIX = "/_next/static/";

/**
 * @param {string} raw
 * @returns {string | null} root-relative /_next/static path, including query
 */
export function staticAssetPath(raw) {
  if (!raw) return null;
  const decoded = raw.replaceAll("&amp;", "&").trim();
  if (!decoded || decoded.startsWith("data:") || decoded.startsWith("blob:")) return null;
  let url;
  try {
    url = new URL(decoded, "http://assets.invalid");
  } catch {
    return null;
  }
  if (!url.pathname.startsWith(STATIC_PREFIX)) return null;
  return `${url.pathname}${url.search}`;
}

/**
 * Pull every href and src that points at /_next/static/...
 * @param {string} html
 * @returns {string[]}
 */
export function extractStaticAssetPaths(html) {
  const found = new Set();
  const attr = /(?:^|[\s<])(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi;
  for (const match of html.matchAll(attr)) {
    const path = staticAssetPath(match[1] ?? match[2] ?? match[3] ?? "");
    if (path) found.add(path);
  }
  return [...found].sort();
}

/**
 * @param {{ path: string, status: number, bytes: number }[]} rows
 * @returns {string}
 */
export function formatSmokeTable(rows) {
  const statusWidth = Math.max(6, ...rows.map((row) => String(row.status).length));
  const bytesWidth = Math.max(5, ...rows.map((row) => String(row.bytes).length));
  const lines = [`${"status".padEnd(statusWidth)}  ${"bytes".padStart(bytesWidth)}  path`];
  for (const row of rows) {
    lines.push(
      `${String(row.status).padEnd(statusWidth)}  ${String(row.bytes).padStart(bytesWidth)}  ${row.path}`,
    );
  }
  return lines.join("\n");
}

/**
 * @param {string} baseUrl
 * @param {{ fetchImpl?: typeof fetch, log?: (line: string) => void, errorLog?: (line: string) => void, timeoutMs?: number }} [options]
 */
export async function smokeAssets(baseUrl, options = {}) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const log = options.log ?? console.log;
  const timeoutMs = options.timeoutMs ?? 30_000;
  const pageUrl = new URL(baseUrl);
  if (pageUrl.protocol !== "http:" && pageUrl.protocol !== "https:") {
    throw new Error(`unsupported protocol: ${pageUrl.protocol}`);
  }

  const page = await fetchImpl(pageUrl, { signal: AbortSignal.timeout(timeoutMs) });
  const html = await page.text();
  const homepageBytes = Buffer.byteLength(html);
  log(`homepage  ${page.status}  ${homepageBytes} bytes  ${pageUrl.href}`);

  const paths = extractStaticAssetPaths(html);
  /** @type {{ path: string, status: number, bytes: number }[]} */
  const rows = [];
  for (const assetPath of paths) {
    const assetUrl = new URL(assetPath, pageUrl);
    const response = await fetchImpl(assetUrl, { signal: AbortSignal.timeout(timeoutMs) });
    const body = await response.arrayBuffer();
    rows.push({ path: assetPath, status: response.status, bytes: body.byteLength });
  }

  if (rows.length > 0) log(formatSmokeTable(rows));
  else log("assets  0  (homepage referenced no /_next/static href or src)");

  const failures = [];
  if (page.status !== 200) failures.push(`homepage status ${page.status}`);
  if (paths.length === 0) failures.push("homepage referenced no /_next/static assets");
  const css = paths.filter((assetPath) => assetPath.split("?")[0].endsWith(".css"));
  if (paths.length > 0 && css.length === 0) {
    failures.push("homepage referenced no /_next/static stylesheet");
  }
  for (const row of rows) {
    if (row.status !== 200) failures.push(`${row.status} ${row.bytes} bytes ${row.path}`);
  }

  const ok = failures.length === 0;
  if (!ok) {
    const errorLog = options.errorLog ?? console.error;
    errorLog(`smoke failed:\n${failures.map((line) => `  ${line}`).join("\n")}`);
  }
  return { ok, homepageStatus: page.status, rows, failures };
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
  const base = process.argv[2];
  if (!base) {
    console.error("usage: npm run smoke -- <base-url>");
    process.exit(2);
  }
  try {
    const result = await smokeAssets(base);
    process.exit(result.ok ? 0 : 1);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
