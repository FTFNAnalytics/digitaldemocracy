import {
  closeSync,
  constants,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  renameSync,
  rmSync,
  unlinkSync,
  writeSync,
} from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { deriveCountry, rebuildDerivedInFile } from "./derive/run";
import {
  closeLiveSession,
  commitLiveSession,
  endLiveSession,
  liveSessionMasterPath,
  registerLiveSession,
  setSkipFullIntegrityCheck,
} from "./live-session";
import {
  LATAM_LINEAGE_ID,
  countryIdForImportScope,
  describeAtlasPublishMode,
  resolveAtlasPublishMode,
} from "./publish-mode";
import { revalidateAtlasDerivedTag } from "./publication";
import { openAtlasDatabase } from "./sqlite";

export const publishDiagnostics = {
  vacuumInto: 0,
  liveSessions: 0,
  countryDerives: [] as string[],
  fullDerives: 0,
};

export function resetPublishDiagnostics(): void {
  publishDiagnostics.vacuumInto = 0;
  publishDiagnostics.liveSessions = 0;
  publishDiagnostics.countryDerives = [];
  publishDiagnostics.fullDerives = 0;
}

function samePath(left: string, right: string): boolean {
  return path.resolve(left) === path.resolve(right);
}

function discardStagingFiles(masterPath: string): void {
  const staging = `${masterPath}.staging`;
  for (const suffix of ["", "-wal", "-shm", "-journal"]) {
    const file = `${staging}${suffix}`;
    if (existsSync(file)) rmSync(file, { force: true });
  }
}

export function lockPathFor(masterPath: string): string {
  return `${masterPath}.lock`;
}

export function stagingPathFor(masterPath: string): string {
  const live = liveSessionMasterPath();
  if (live && samePath(live, masterPath)) return masterPath;
  return `${masterPath}.staging`;
}

export function acquireWriterLock(masterPath: string): number {
  mkdirSync(path.dirname(masterPath), { recursive: true });
  const lockPath = lockPathFor(masterPath);
  try {
    const fd = openSync(lockPath, constants.O_CREAT | constants.O_EXCL | constants.O_RDWR);
    writeSync(fd, String(process.pid));
    fsyncSync(fd);
    return fd;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EEXIST") {
      throw new Error(`Another Atlas writer holds ${lockPath}`);
    }
    throw error;
  }
}

export function releaseWriterLock(masterPath: string, fd: number | undefined): void {
  setSkipFullIntegrityCheck(false);
  if (fd == null) return;
  try {
    closeSync(fd);
  } catch {
    // ignore
  }
  try {
    unlinkSync(lockPathFor(masterPath));
  } catch {
    // ignore missing lock
  }
}

export function discardStaging(masterPath: string): void {
  const live = liveSessionMasterPath();
  if (live && samePath(live, masterPath)) endLiveSession();
  discardStagingFiles(masterPath);
}

function countryIdsForLiveDerive(db: DatabaseSync): string[] {
  const scope = (process.env.ATLAS_IMPORT_SCOPE ?? "").trim().toLowerCase();
  if (scope === "latam") {
    return db
      .prepare("SELECT country_id FROM country WHERE lineage_id = ? ORDER BY country_id")
      .all(LATAM_LINEAGE_ID)
      .map((row) => String(row.country_id));
  }
  const countryId = countryIdForImportScope(scope);
  return countryId ? [countryId] : [];
}

function journalMode(db: DatabaseSync): string {
  const row = db.prepare("PRAGMA journal_mode;").get();
  return String(row?.journal_mode ?? Object.values(row ?? {})[0] ?? "").toLowerCase();
}

function beginLivePublish(masterPath: string): void {
  discardStagingFiles(masterPath);
  const db = openAtlasDatabase(masterPath);
  db.exec("PRAGMA journal_mode = WAL;");
  const mode = journalMode(db);
  if (mode !== "wal") {
    db.close();
    throw new Error(
      `Refusing live publish because ${masterPath} stayed in journal_mode=${mode || "unknown"}. ` +
        "Another connection still has the DELETE journal open, so a country write would take a long lock. " +
        "Close readers (the Next.js server), retry this scoped import once so the file switches to WAL, then start readers again. " +
        "ATLAS_PUBLISH_RESTAGE=1 keeps the full-file VACUUM INTO path.",
    );
  }
  db.exec("PRAGMA busy_timeout = 5000;");
  registerLiveSession(masterPath, db);
  publishDiagnostics.liveSessions += 1;
  console.log(describeAtlasPublishMode());
}

function publishLive(masterPath: string): void {
  const db = openAtlasDatabase(masterPath);
  try {
    const countryIds = countryIdsForLiveDerive(db);
    if (countryIds.length === 0) {
      throw new Error(
        `Refusing live publish without a country_id for ATLAS_IMPORT_SCOPE=${JSON.stringify(process.env.ATLAS_IMPORT_SCOPE ?? "")}`,
      );
    }
    for (const countryId of countryIds) {
      deriveCountry(db, countryId);
      publishDiagnostics.countryDerives.push(countryId);
    }
    commitLiveSession();
    console.log(`publish_mode=live committed derive=${countryIds.join(",")}`);
    closeLiveSession();
  } catch (error) {
    endLiveSession();
    throw error;
  }
  void revalidateAtlasDerivedTag();
}

export function backupPublishedToStaging(masterPath: string): void {
  if (resolveAtlasPublishMode() === "live") {
    beginLivePublish(masterPath);
    return;
  }
  publishDiagnostics.vacuumInto += 1;
  console.log(describeAtlasPublishMode());
  discardStagingFiles(masterPath);
  const staging = `${masterPath}.staging`;
  const source = openAtlasDatabase(masterPath);
  try {
    const escaped = staging.replace(/'/g, "''");
    source.exec(`VACUUM INTO '${escaped}';`);
  } finally {
    source.close();
  }
}

function pragmaColumn(row: Record<string, unknown> | undefined, name: string, index: number): number {
  if (!row) return 0;
  if (name in row) return Number(row[name] ?? 0);
  const values = Object.values(row);
  return Number(values[index] ?? 0);
}

function checkpointAndCloseForPublish(filePath: string): void {
  const db = new DatabaseSync(filePath);
  try {
    db.exec("PRAGMA foreign_keys = ON;");
    const modeRow = db.prepare("PRAGMA journal_mode;").get();
    const mode = String(modeRow?.journal_mode ?? Object.values(modeRow ?? {})[0] ?? "").toLowerCase();
    if (mode === "wal") {
      db.exec("PRAGMA wal_checkpoint(TRUNCATE);");
      const checkpoint = db.prepare("PRAGMA wal_checkpoint(TRUNCATE);").get();
      const busy = pragmaColumn(checkpoint, "busy", 0);
      const log = pragmaColumn(checkpoint, "log", 1);
      const checkpointed = pragmaColumn(checkpoint, "checkpointed", 2);
      if (busy !== 0 || log !== checkpointed) {
        throw new Error(`WAL checkpoint busy or incomplete: ${JSON.stringify(checkpoint)}`);
      }
    }
    db.exec("PRAGMA journal_mode = DELETE;");
  } finally {
    db.close();
  }
  for (const suffix of ["-wal", "-shm"]) {
    const sidecar = `${filePath}${suffix}`;
    if (existsSync(sidecar)) {
      throw new Error(`Refusing to publish ${filePath} with live sidecar ${sidecar}`);
    }
  }
}

function fsyncPath(filePath: string, directory = false): void {
  const fd = openSync(filePath, directory ? constants.O_RDONLY : constants.O_RDWR);
  try {
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

/**
 * Close staging, convert to DELETE journal, fsync, atomic rename over the
 * published master, fsync the parent directory. Never serves a WAL-backed
 * half-published file.
 */
export function publishStaging(masterPath: string, options?: { rebuildDerived?: boolean }): void {
  const live = liveSessionMasterPath();
  if (live && samePath(live, masterPath)) {
    // Scoped imports always rebuild that country's derived and search rows.
    // `rebuildDerived: false` only skips the global rebuild on the restage path
    // (Bulgaria's additive upgrade uses that when an operator forces restage).
    publishLive(masterPath);
    return;
  }
  const staging = stagingPathFor(masterPath);
  // Derived rows and search indexes are rebuilt in the staged file so the atomic
  // rename publishes them with the master. Approved person proposals are reloaded
  // into person and person_alias. Other master entity rows are not edited.
  // Callers that already patched derived rows for a small lineage delta can skip
  // the rebuild. The default still rebuilds.
  if (options?.rebuildDerived !== false) {
    publishDiagnostics.fullDerives += 1;
    rebuildDerivedInFile(staging);
  }
  checkpointAndCloseForPublish(staging);
  fsyncPath(staging);
  for (const suffix of ["-wal", "-shm", "-journal"]) {
    const dest = `${masterPath}${suffix}`;
    if (existsSync(dest)) rmSync(dest, { force: true });
  }
  renameSync(staging, masterPath);
  fsyncPath(path.dirname(masterPath), true);
  void revalidateAtlasDerivedTag();
}
