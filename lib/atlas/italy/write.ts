import type { DatabaseSync } from "node:sqlite";
import { LINEAGE_ID } from "./identity";
import { insertMany, insertRow } from "../sqlite";
import type { ItalyProjection, SqlRow } from "./project";

const ITALY_PROJECTION_TABLES = [
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

export function clearItalyProjection(db: DatabaseSync): void {
  for (const table of ITALY_PROJECTION_TABLES) {
    db.prepare(`DELETE FROM ${table} WHERE lineage_id = ?`).run(LINEAGE_ID);
  }
}

export function writeItalyProjection(
  db: DatabaseSync,
  projection: ItalyProjection,
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
    if (!existingRelease) insertRow(db, "dataset_release", projection.release);

    const selected = db.prepare("SELECT release_id FROM publication_release WHERE lineage_id = ?").get(LINEAGE_ID);
    if (!selected) {
      insertRow(db, "publication_release", projection.publicationRelease);
    } else if (String(selected.release_id) !== String(projection.publicationRelease.release_id)) {
      clearItalyProjection(db);
      db.prepare("UPDATE publication_release SET release_id = ? WHERE lineage_id = ?").run(
        projection.publicationRelease.release_id,
        LINEAGE_ID,
      );
    }

    insertMany(db, "retained_input", projection.retainedInputs);
    insertRow(db, "country", projection.country);
    insertMany(db, "geography", projection.geographies);
    insertMany(db, "research_date", projection.dates);
    insertMany(db, "office_tier_classification", projection.tiers);
    insertMany(db, "office", projection.offices);
    insertMany(db, "election_event", projection.events);
    insertMany(db, "proceeding", projection.proceedings);
    insertMany(db, "source", projection.sources);
    insertMany(db, "result_row", projection.results);
    insertMany(db, "record_locator", projection.locators);
    insertMany(db, "evidence_link", projection.evidence);
    insertMany(db, "unresolved_evidence", projection.unresolved);
    insertMany(db, "identity_crosswalk", projection.crosswalks);
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

export type { SqlRow };
