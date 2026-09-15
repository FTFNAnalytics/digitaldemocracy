import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { sha256 } from "./tar";

export type WorkbookTable = {
  sheet: string;
  columns: string[];
  source_rows: number[];
  rows: unknown[][];
};

export type TableRow = Record<string, unknown> & { _source_row?: number };

export function zipTable(table: WorkbookTable): TableRow[] {
  return table.rows.map((row, index) => {
    const record: TableRow = { _source_row: table.source_rows[index] };
    for (let i = 0; i < table.columns.length; i++) {
      record[table.columns[i]!] = row[i] ?? null;
    }
    return record;
  });
}

export function loadJson(file: string): unknown {
  return JSON.parse(readFileSync(file, "utf8"));
}

export function loadWorkbookTables(tablesDir: string): Map<string, TableRow[]> {
  const grouped = new Map<string, TableRow[]>();
  if (!existsSync(tablesDir)) return grouped;
  const files = readdirSync(tablesDir)
    .filter((name) => name.endsWith(".json"))
    .sort();
  for (const name of files) {
    const table = loadJson(path.join(tablesDir, name)) as WorkbookTable;
    if (!table?.sheet || !Array.isArray(table.columns) || !Array.isArray(table.rows)) {
      throw new Error(`Unsupported table shape: ${name}`);
    }
    const rows = zipTable(table);
    const existing = grouped.get(table.sheet) ?? [];
    existing.push(...rows);
    grouped.set(table.sheet, existing);
  }
  return grouped;
}

export function verifyManifestFiles(
  dir: string,
  files: Record<string, { sha256: string; bytes: number }>,
): void {
  for (const [relative, expected] of Object.entries(files)) {
    const bytes = readFileSync(path.join(dir, relative));
    if (bytes.length !== expected.bytes) {
      throw new Error(`Byte length mismatch: ${relative}`);
    }
    if (sha256(bytes) !== expected.sha256) {
      throw new Error(`Checksum mismatch: ${relative}`);
    }
  }
}

export function cellText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

export function cellYear(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && /^\d{4}$/.test(value.trim())) {
    return Number(value.trim());
  }
  return null;
}

export function historyKey(
  officeId: string,
  year: unknown,
  ballotDate: unknown,
): string {
  const date = cellText(ballotDate);
  const y = cellYear(year);
  return `${officeId}::${y ?? (cellText(year) || "undated")}::${date}`;
}
