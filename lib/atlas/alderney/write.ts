import type { DatabaseSync } from "node:sqlite";
import { LINEAGE_ID } from "./identity";
import { insertRow } from "../sqlite";
import type { AlderneyProjection, SqlRow } from "./project";

const ALDERNEY_PROJECTION_TABLES = [
  "evidence_link",
  "unresolved_evidence",
  "identity_crosswalk",
  "record_locator",
  "result_row",
  "proceeding",
  "party_mapping",
  "election_event",
  "office",
  "office_tier_classification",
  "research_date",
  "geography",
  "source",
  "country",
  "retained_input",
] as const;

export function clearAlderneyProjection(db: DatabaseSync): void {
  for (const table of ALDERNEY_PROJECTION_TABLES) {
    db.prepare(`DELETE FROM ${table} WHERE lineage_id = ?`).run(LINEAGE_ID);
  }
}

export function writeAlderneyProjection(
  db: DatabaseSync,
  projection: AlderneyProjection,
  attemptId: string,
  options?: { reuseRelease?: boolean },
): void {
  db.exec("BEGIN IMMEDIATE;");
  try {
    if (options?.reuseRelease) {
      upsertReceipt(db, attemptId, projection.publicationRelease.release_id as string);
      db.exec("COMMIT;");
      return;
    }

    const lineage = db.prepare("SELECT lineage_id FROM dataset_lineage WHERE lineage_id = ?").get(LINEAGE_ID);
    if (!lineage) insertRow(db, "dataset_lineage", projection.lineage);

    const existingRelease = db
      .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?")
      .get(LINEAGE_ID, projection.release.release_id);
    if (!existingRelease) {
      insertRow(db, "dataset_release", projection.release);
    }

    const selected = db.prepare("SELECT release_id FROM publication_release WHERE lineage_id = ?").get(LINEAGE_ID);
    if (!selected) {
      insertRow(db, "publication_release", projection.publicationRelease);
    } else if (String(selected.release_id) !== String(projection.publicationRelease.release_id)) {
      clearAlderneyProjection(db);
      db.prepare("UPDATE publication_release SET release_id = ? WHERE lineage_id = ?").run(
        projection.publicationRelease.release_id,
        LINEAGE_ID,
      );
    }

    insertAll(db, "retained_input", projection.retainedInputs);
    insertRow(db, "country", projection.country);
    insertAll(db, "geography", projection.geographies);
    insertAll(db, "office_tier_classification", projection.tiers);
    insertAll(db, "office", projection.offices);
    insertAll(db, "research_date", projection.dates);
    insertAll(db, "election_event", projection.events);
    insertAll(db, "source", projection.sources);
    insertAll(db, "result_row", projection.results);
    insertAll(db, "record_locator", projection.locators);
    insertAll(db, "evidence_link", projection.evidence);
    insertAll(db, "unresolved_evidence", projection.unresolved);
    insertAll(db, "identity_crosswalk", projection.crosswalks);
    upsertReceipt(db, attemptId, projection.publicationRelease.release_id as string);
    db.exec("COMMIT;");
  } catch (error) {
    try {
      db.exec("ROLLBACK;");
    } catch {
      // ignore
    }
    throw error;
  }
}

function insertAll(db: DatabaseSync, table: string, rows: SqlRow[]): void {
  for (const row of rows) insertRow(db, table, row);
}

function upsertReceipt(db: DatabaseSync, attemptId: string, releaseId: string): void {
  const existing = db.prepare("SELECT singleton FROM publication_receipt WHERE singleton = 1").get();
  if (!existing) {
    insertRow(db, "publication_receipt", {
      singleton: 1,
      last_publish_attempt_id: attemptId,
      attempted_lineage_id: LINEAGE_ID,
      attempted_release_id: releaseId,
    });
    return;
  }
  db.prepare(
    `UPDATE publication_receipt
     SET last_publish_attempt_id = ?, attempted_lineage_id = ?, attempted_release_id = ?
     WHERE singleton = 1`,
  ).run(attemptId, LINEAGE_ID, releaseId);
}
