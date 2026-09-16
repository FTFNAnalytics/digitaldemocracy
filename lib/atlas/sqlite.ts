import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export function openAtlasDatabase(filePath: string, options?: { readOnly?: boolean }): DatabaseSync {
  if (!options?.readOnly) {
    mkdirSync(path.dirname(filePath), { recursive: true });
  }
  const db = options?.readOnly
    ? new DatabaseSync(filePath, { readOnly: true })
    : new DatabaseSync(filePath);
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA recursive_triggers = ON;");
  db.exec("PRAGMA synchronous = FULL;");
  const fk = db.prepare("PRAGMA foreign_keys;").get();
  if (Number(fk?.foreign_keys) !== 1) {
    db.close();
    throw new Error(`PRAGMA foreign_keys is ${String(fk?.foreign_keys)}, expected 1`);
  }
  return db;
}

export function pragmaValue(db: DatabaseSync, pragma: string): unknown {
  const row = db.prepare(`PRAGMA ${pragma};`).get();
  if (!row) return undefined;
  const values = Object.values(row);
  return values.length === 1 ? values[0] : row;
}

export function assertIntegrity(db: DatabaseSync): void {
  const fkOn = pragmaValue(db, "foreign_keys");
  if (Number(fkOn) !== 1) {
    throw new Error(`foreign_keys=${String(fkOn)}; expected 1`);
  }
  const fk = db.prepare("PRAGMA foreign_key_check;").all();
  if (fk.length > 0) {
    throw new Error(`foreign_key_check failed: ${JSON.stringify(fk.slice(0, 8))}`);
  }
  const integrity = String(pragmaValue(db, "integrity_check"));
  if (integrity !== "ok") {
    throw new Error(`integrity_check=${integrity}`);
  }
}

export function countRows(db: DatabaseSync, table: string, where = "", params: unknown[] = []): number {
  const sql = where
    ? `SELECT COUNT(*) AS n FROM ${table} WHERE ${where}`
    : `SELECT COUNT(*) AS n FROM ${table}`;
  const row = db.prepare(sql).get(...params);
  return Number(row?.n ?? 0);
}

export function tableExists(db: DatabaseSync, name: string): boolean {
  const row = db
    .prepare("SELECT 1 AS ok FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(name);
  return Boolean(row);
}

export function insertRow(db: DatabaseSync, table: string, row: Record<string, unknown>): void {
  const columns = Object.keys(row);
  const placeholders = columns.map(() => "?").join(", ");
  const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`;
  if (/\bOR\s+REPLACE\b/i.test(sql)) {
    throw new Error("INSERT OR REPLACE is prohibited");
  }
  db.prepare(sql).run(...columns.map((column) => row[column] ?? null));
}

export function userTables(db: DatabaseSync): string[] {
  return db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    )
    .all()
    .map((row) => String(row.name));
}
