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
import { openAtlasDatabase } from "./sqlite";

export function lockPathFor(masterPath: string): string {
  return `${masterPath}.lock`;
}

export function stagingPathFor(masterPath: string): string {
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
  const staging = stagingPathFor(masterPath);
  for (const suffix of ["", "-wal", "-shm", "-journal"]) {
    const file = `${staging}${suffix}`;
    if (existsSync(file)) rmSync(file, { force: true });
  }
}

export function backupPublishedToStaging(masterPath: string): void {
  discardStaging(masterPath);
  const staging = stagingPathFor(masterPath);
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
export function publishStaging(masterPath: string): void {
  const staging = stagingPathFor(masterPath);
  checkpointAndCloseForPublish(staging);
  fsyncPath(staging);
  for (const suffix of ["-wal", "-shm", "-journal"]) {
    const dest = `${masterPath}${suffix}`;
    if (existsSync(dest)) rmSync(dest, { force: true });
  }
  renameSync(staging, masterPath);
  fsyncPath(path.dirname(masterPath), true);
}
