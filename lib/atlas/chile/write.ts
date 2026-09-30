import type { DatabaseSync } from "node:sqlite";
import { COUNTRY_ID, LINEAGE_ID } from "./identity";
import { insertMany, insertRow } from "../sqlite";
import type { ChileProjection, SqlRow } from "./project";

const CHILE_PROJECTION_TABLES = [
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

export function clearChileProjection(db: DatabaseSync): void {
  for (const table of CHILE_PROJECTION_TABLES) {
    db.prepare(`DELETE FROM ${table} WHERE lineage_id = ?`).run(LINEAGE_ID);
  }
}

/**
 * The LatAm continuity import publishes Chile as a zero-office screened_out
 * country. That row owns country_id, so the package cannot insert until the
 * empty stub is removed. Offices, events, and results must already be zero.
 * Poll-catalogue sources attached only to that stub are removed with it.
 * The replacement country stays partial and unapproved.
 */
export function clearChileScreenedOutStub(db: DatabaseSync): void {
  const existing = db
    .prepare("SELECT coverage_status, lineage_id FROM country WHERE country_id = ?")
    .get(COUNTRY_ID) as { coverage_status?: unknown; lineage_id?: unknown } | undefined;
  if (!existing) return;
  if (String(existing.lineage_id) === LINEAGE_ID) return;
  const offices = Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE country_id = ?").get(COUNTRY_ID)?.n ?? 0);
  const events = Number(
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM election_event e
         JOIN office o ON o.id_namespace = e.id_namespace AND o.office_id = e.office_id
         WHERE o.country_id = ?`,
      )
      .get(COUNTRY_ID)?.n ?? 0,
  );
  const results = Number(db.prepare("SELECT COUNT(*) AS n FROM result_row WHERE country_id = ?").get(COUNTRY_ID)?.n ?? 0);
  if (String(existing.coverage_status) !== "screened_out" || offices !== 0 || events !== 0 || results !== 0) {
    throw new Error("Chile country row is not an empty screened_out stub and cannot be replaced");
  }
  db.prepare("DELETE FROM source WHERE country_id = ?").run(COUNTRY_ID);
  db.prepare("DELETE FROM party_mapping WHERE country_id = ?").run(COUNTRY_ID);
  db.prepare("DELETE FROM geography WHERE country_id = ?").run(COUNTRY_ID);
  const removed = db.prepare("DELETE FROM country WHERE country_id = ? AND coverage_status = 'screened_out'").run(COUNTRY_ID);
  if (Number(removed.changes) !== 1) {
    throw new Error("Chile screened_out stub was not cleared");
  }
}

export function writeChileProjection(
  db: DatabaseSync,
  projection: ChileProjection,
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
      clearChileProjection(db);
      db.prepare("UPDATE publication_release SET release_id = ? WHERE lineage_id = ?").run(
        projection.publicationRelease.release_id,
        LINEAGE_ID,
      );
    }

    clearChileScreenedOutStub(db);

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
