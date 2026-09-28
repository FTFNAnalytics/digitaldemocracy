import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import type { DatabaseSync } from "node:sqlite";
import { resolveAtlasSqlitePath } from "../paths";
import { openAtlasDatabase, tableExists } from "../sqlite";

/**
 * Publication ETag. It changes when the release fingerprint, snapshot label,
 * evidence-status counts, or derived row counts change. derive:atlas also
 * invalidates the `atlas-derived` cache tag.
 */
export function publicationEtag(sqlitePath = resolveAtlasSqlitePath()): string {
  if (!existsSync(sqlitePath)) return "atlas-missing";
  let db: DatabaseSync | null = null;
  try {
    db = openAtlasDatabase(sqlitePath, { readOnly: true });
    const parts: string[] = [];
    if (tableExists(db, "dataset_release")) {
      const releases = db
        .prepare(
          `SELECT lineage_id, release_id, fingerprint_sha256, research_snapshot_label
           FROM dataset_release
           ORDER BY lineage_id, release_id`,
        )
        .all();
      for (const row of releases) {
        parts.push(
          ["release", row.lineage_id, row.release_id, row.fingerprint_sha256, row.research_snapshot_label ?? ""].join(
            "\t",
          ),
        );
      }
    }
    if (tableExists(db, "result_row")) {
      const evidence = db
        .prepare(`SELECT evidence_status, COUNT(*) AS n FROM result_row GROUP BY evidence_status ORDER BY evidence_status`)
        .all();
      for (const row of evidence) parts.push(`evidence\t${row.evidence_status}\t${row.n}`);
    }
    for (const table of [
      "derived_jurisdiction",
      "derived_seat_status",
      "derived_cycle",
      "derived_cycle_unplaced",
      "derived_coverage",
    ]) {
      if (!tableExists(db, table)) {
        parts.push(`count\t${table}\tmissing`);
        continue;
      }
      const row = db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get();
      parts.push(`count\t${table}\t${row?.n ?? 0}`);
    }
    if (tableExists(db, "derived_seat_status")) {
      const reasons = db
        .prepare(
          `SELECT COALESCE(status_reason, '') AS status_reason, COUNT(*) AS n
           FROM derived_seat_status GROUP BY status_reason ORDER BY status_reason`,
        )
        .all();
      for (const row of reasons) parts.push(`seat\t${row.status_reason}\t${row.n}`);
    }
    return createHash("sha256").update(parts.join("\n")).digest("hex");
  } catch {
    return "atlas-unreadable";
  } finally {
    db?.close();
  }
}
