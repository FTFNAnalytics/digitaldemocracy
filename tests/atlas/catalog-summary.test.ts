import { performance } from "node:perf_hooks";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, describe, expect, it } from "vitest";

/**
 * Timing fixture for the catalog-summary read.
 * A 6.4GB production result_row cannot be built here. This table is large enough
 * that GROUP BY has to walk the payload, while the summary read touches a few rows.
 */
describe("catalog summary read stays off the result payload", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  it("reads a summary faster than grouping a fat result table", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-summary-bench-"));
    tempDirs.push(dir);
    const db = new DatabaseSync(path.join(dir, "bench.sqlite"));
    const countries = 72;
    const rowsPerCountry = 400;
    const payload = JSON.stringify({ note: "x".repeat(1800) });
    try {
      db.exec(`
        CREATE TABLE result_row (
          country_id TEXT NOT NULL,
          result_row_id TEXT NOT NULL,
          raw_json TEXT NOT NULL
        );
        CREATE TABLE derived_country_summary (
          country_id TEXT PRIMARY KEY,
          result_rows INTEGER NOT NULL
        );
      `);
      const insert = db.prepare("INSERT INTO result_row (country_id, result_row_id, raw_json) VALUES (?, ?, ?)");
      db.exec("BEGIN IMMEDIATE;");
      for (let country = 0; country < countries; country += 1) {
        const countryId = `c${String(country).padStart(2, "0")}`;
        for (let row = 0; row < rowsPerCountry; row += 1) {
          insert.run(countryId, `${countryId}-${row}`, payload);
        }
      }
      db.exec("COMMIT;");
      db.exec(`
        INSERT INTO derived_country_summary (country_id, result_rows)
        SELECT country_id, COUNT(*) FROM result_row GROUP BY country_id;
      `);

      const countStarted = performance.now();
      const counted = db.prepare("SELECT country_id, COUNT(*) AS n FROM result_row GROUP BY country_id").all();
      const countMs = performance.now() - countStarted;

      const summaryStarted = performance.now();
      const summarized = db.prepare("SELECT country_id, result_rows FROM derived_country_summary").all();
      const summaryMs = performance.now() - summaryStarted;

      console.info(
        `catalog-summary fixture rows=${countries * rowsPerCountry} payload_bytes=${payload.length} summary_ms=${summaryMs.toFixed(2)} group_by_ms=${countMs.toFixed(2)}`,
      );
      expect(counted).toHaveLength(countries);
      expect(summarized).toHaveLength(countries);
      expect(summaryMs, `summary ${summaryMs.toFixed(2)}ms; group-by ${countMs.toFixed(2)}ms; rows ${countries * rowsPerCountry}`).toBeLessThan(
        countMs,
      );
      expect(summaryMs).toBeLessThan(50);
    } finally {
      db.close();
    }
  });
});
