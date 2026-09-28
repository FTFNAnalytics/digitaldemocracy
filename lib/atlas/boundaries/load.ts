import { DatabaseSync } from "node:sqlite";
import type { CrosswalkFile } from "./types";

/**
 * Copy approved crosswalk rows into boundary_crosswalk.
 * Draft and rejected rows are refused and leave the table unchanged.
 * Geography rows are not read or written.
 */
export function loadApprovedCrosswalk(db: DatabaseSync, file: CrosswalkFile): number {
  if (file.review_status !== "approved" || file.rows.some((row) => row.review_status !== "approved")) {
    throw new Error("refusing to load a crosswalk that is not fully approved");
  }
  if (file.rows.some((row) => !row.jurisdiction_key)) {
    throw new Error("refusing to load an approved row without jurisdiction_key");
  }
  const deleteRow = db.prepare("DELETE FROM boundary_crosswalk WHERE jurisdiction_key = ?");
  const insert = db.prepare(
    `INSERT INTO boundary_crosswalk (
      jurisdiction_key, boundary_source, boundary_code, boundary_version,
      match_method, confidence, review_status, reviewer_note
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const row of file.rows) {
      deleteRow.run(row.jurisdiction_key);
      insert.run(
        row.jurisdiction_key,
        row.boundary_source,
        row.boundary_code,
        row.boundary_version,
        row.match_method,
        row.confidence,
        row.review_status,
        row.reviewer_note,
      );
    }
    db.exec("COMMIT");
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      // Ignore rollback failures when the transaction is already closed.
    }
    throw error;
  }
  return file.rows.length;
}
