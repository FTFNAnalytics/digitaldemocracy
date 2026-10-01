import path from "node:path";
import type { DatabaseSync } from "node:sqlite";

/**
 * One in-process live publish. Country writers already `BEGIN` / `COMMIT`.
 * Those statements are nested under a single deferred transaction so a failure
 * before `publishStaging` rolls the master back, and `PRAGMA foreign_keys`
 * can still be changed before the writer's `BEGIN` (SQLite ignores that
 * pragma inside an open transaction).
 */

type LiveSession = {
  masterPath: string;
  db: DatabaseSync;
  depth: number;
  closed: boolean;
  originalExec: (sql: string) => void;
  originalClose: () => void;
};

let session: LiveSession | null = null;
let skipFullIntegrity = false;

export function shouldSkipFullIntegrityCheck(): boolean {
  return skipFullIntegrity;
}

export function setSkipFullIntegrityCheck(value: boolean): void {
  skipFullIntegrity = value;
}

export function liveSessionMasterPath(): string | null {
  return session?.masterPath ?? null;
}

export function borrowLiveDatabase(filePath: string, readOnly?: boolean): DatabaseSync | undefined {
  if (!session || session.closed || readOnly) return undefined;
  if (path.resolve(filePath) !== path.resolve(session.masterPath)) return undefined;
  return session.db;
}

function classifySql(sql: string): "begin" | "commit" | "rollback" | "other" {
  const stripped = sql
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--[^\n]*/g, " ")
    .trim();
  const parts = stripped
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  if (parts.length !== 1) return "other";
  const head = parts[0]!.replace(/\s+/g, " ").toUpperCase();
  if (head === "BEGIN" || head.startsWith("BEGIN ")) return "begin";
  if (head === "COMMIT" || head === "END") return "commit";
  if (head === "ROLLBACK" || head.startsWith("ROLLBACK ")) return "rollback";
  return "other";
}

function dispatchExec(current: LiveSession, sql: string): void {
  const kind = classifySql(sql);
  if (kind === "begin") {
    if (current.depth === 0) {
      current.originalExec("BEGIN IMMEDIATE;");
      current.depth = 1;
      return;
    }
    const name = `atlas_live_${current.depth}`;
    current.originalExec(`SAVEPOINT ${name};`);
    current.depth += 1;
    return;
  }
  if (kind === "commit") {
    if (current.depth <= 0) {
      current.originalExec("COMMIT;");
      return;
    }
    if (current.depth === 1) return;
    current.depth -= 1;
    current.originalExec(`RELEASE atlas_live_${current.depth};`);
    return;
  }
  if (kind === "rollback") {
    if (current.depth <= 1) {
      try {
        current.originalExec("ROLLBACK;");
      } catch {
        // No transaction was open.
      }
      current.depth = 0;
      return;
    }
    current.depth -= 1;
    const name = `atlas_live_${current.depth}`;
    current.originalExec(`ROLLBACK TO ${name};`);
    current.originalExec(`RELEASE ${name};`);
    return;
  }
  current.originalExec(sql);
}

export function registerLiveSession(masterPath: string, db: DatabaseSync): void {
  if (session && !session.closed) {
    throw new Error(`Atlas live publish is already open for ${session.masterPath}`);
  }
  const originalExec = db.exec.bind(db);
  const originalClose = db.close.bind(db);
  const next: LiveSession = {
    masterPath,
    db,
    depth: 0,
    closed: false,
    originalExec,
    originalClose,
  };
  session = next;
  db.exec = ((sql: string) => dispatchExec(next, sql)) as DatabaseSync["exec"];
  db.close = (() => {
    // The importer closes its handle before publish. The session keeps it.
  }) as DatabaseSync["close"];
  skipFullIntegrity = true;
}

/** Commit the deferred country transaction. Does not close the handle. */
export function commitLiveSession(): void {
  if (!session || session.closed) throw new Error("No Atlas live publish session to commit");
  if (session.depth > 0) {
    session.originalExec("COMMIT;");
    session.depth = 0;
  }
  session.originalExec("PRAGMA foreign_keys = ON;");
  session.originalExec("PRAGMA wal_checkpoint(PASSIVE);");
}

export function closeLiveSession(): void {
  if (!session || session.closed) {
    session = null;
    return;
  }
  const current = session;
  session = null;
  current.closed = true;
  current.originalClose();
}

/** Roll back any open transaction and close. Safe to call twice. */
export function endLiveSession(): void {
  if (!session || session.closed) {
    session = null;
    return;
  }
  const current = session;
  session = null;
  current.closed = true;
  if (current.depth > 0) {
    try {
      current.originalExec("ROLLBACK;");
    } catch {
      // The transaction may already be closed.
    }
    current.depth = 0;
  }
  try {
    current.originalClose();
  } catch {
    // The handle may already be closed.
  }
}
