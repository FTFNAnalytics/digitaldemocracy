import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { strToU8, zipSync } from "fflate";
import { countryBundleFiles, listCountryIds } from "./api/data";
import { resolveAtlasSqlitePath } from "./paths";
import { openAtlasDatabase, tableExists } from "./sqlite";

export type CountryBundleListing = {
  countryId: string;
  slug: string;
  name: string;
  snapshotLabel: string | null;
  href: string | null;
  checksumHref: string | null;
  checksum: string | null;
  byteSize: number | null;
};

type DownloadEnv = {
  VITEST?: string;
  ATLAS_DOWNLOADS_DIR?: string;
};

function downloadEnv(env?: DownloadEnv): DownloadEnv {
  const source = env ?? process.env;
  return {
    VITEST: source.VITEST,
    ATLAS_DOWNLOADS_DIR: source.ATLAS_DOWNLOADS_DIR,
  };
}

export function atlasDownloadsDir(env?: DownloadEnv, cwd = process.cwd()): string {
  const override = downloadEnv(env).ATLAS_DOWNLOADS_DIR?.trim();
  if (override) return path.resolve(cwd, override);
  return path.join(cwd, "public", "atlas", "downloads");
}

/** Tests skip writing into public/ unless ATLAS_DOWNLOADS_DIR is set. */
export function shouldWriteDownloadBundles(env?: DownloadEnv): boolean {
  const source = downloadEnv(env);
  if (source.ATLAS_DOWNLOADS_DIR?.trim()) return true;
  if (source.VITEST) return false;
  return true;
}

function sha256(bytes: Uint8Array | string): string {
  const hash = createHash("sha256");
  hash.update(typeof bytes === "string" ? Buffer.from(bytes, "utf8") : Buffer.from(bytes));
  return hash.digest("hex");
}

function writeAtomic(filePath: string, bytes: Uint8Array | string): void {
  const temporary = `${filePath}.${process.pid}.tmp`;
  writeFileSync(temporary, bytes);
  renameSync(temporary, filePath);
}

/**
 * Rebuild public/atlas/downloads/{slug}.zip for every country jurisdiction.
 * Each zip contains the CSV twins, SHA256SUMS of those members, and a LICENSE
 * that copies data_rights from the source table. A sibling {slug}.zip.sha256
 * is the checksum of the zip bytes.
 */
export function writeCountryBundles(db: DatabaseSync, directory: string): number {
  if (!tableExists(db, "derived_jurisdiction")) return 0;
  mkdirSync(directory, { recursive: true });
  const countries = listCountryIds(db);
  for (const country of countries) {
    const files = countryBundleFiles(db, country.countryId);
    const sums = Object.keys(files)
      .sort()
      .map((name) => `${sha256(files[name] ?? "")}  ${name}`)
      .join("\n");
    const members: Record<string, Uint8Array> = {};
    for (const name of Object.keys(files).sort()) {
      members[name] = strToU8(files[name] ?? "");
    }
    members.SHA256SUMS = strToU8(`${sums}\n`);
    const zipped = zipSync(members, { level: 6, mtime: new Date(Date.UTC(2020, 0, 1)) });
    const zipName = `${country.slug}.zip`;
    writeAtomic(path.join(directory, zipName), zipped);
    const checksum = sha256(zipped);
    writeAtomic(path.join(directory, `${zipName}.sha256`), `${checksum}  ${zipName}\n`);
  }
  return countries.length;
}

export function listCountryBundles(
  sqlitePath = resolveAtlasSqlitePath(),
  directory = atlasDownloadsDir(),
): CountryBundleListing[] {
  if (!existsSync(sqlitePath)) return [];
  let db: DatabaseSync | null = null;
  try {
    db = openAtlasDatabase(sqlitePath, { readOnly: true });
    if (!tableExists(db, "derived_jurisdiction")) return [];
    const snapshots = new Map<string, string | null>();
    if (tableExists(db, "derived_coverage")) {
      const rows = db
        .prepare(
          `SELECT j.country_id, c.latest_snapshot_label
           FROM derived_jurisdiction j
           LEFT JOIN derived_coverage c ON c.jurisdiction_key = j.jurisdiction_key
           WHERE j.depth = 0`,
        )
        .all();
      for (const row of rows) {
        const label = row.latest_snapshot_label == null ? null : String(row.latest_snapshot_label);
        snapshots.set(String(row.country_id), label === "" ? null : label);
      }
    }
    return listCountryIds(db).map((country) => {
      const zipName = `${country.slug}.zip`;
      const zipPath = path.join(directory, zipName);
      const checksumPath = path.join(directory, `${zipName}.sha256`);
      const present = existsSync(zipPath);
      let checksum: string | null = null;
      if (existsSync(checksumPath)) {
        const line = readFileSync(checksumPath, "utf8").trim().split(/\s+/)[0] ?? "";
        checksum = /^[0-9a-f]{64}$/.test(line) ? line : null;
      }
      return {
        countryId: country.countryId,
        slug: country.slug,
        name: country.name,
        snapshotLabel: snapshots.get(country.countryId) ?? null,
        href: present ? `/atlas/downloads/${encodeURIComponent(zipName)}` : null,
        checksumHref: checksum ? `/atlas/downloads/${encodeURIComponent(`${zipName}.sha256`)}` : null,
        checksum,
        byteSize: present ? statSync(zipPath).size : null,
      };
    });
  } catch {
    return [];
  } finally {
    db?.close();
  }
}
