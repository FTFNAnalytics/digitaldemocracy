import { writeSync } from "node:fs";
import type { DatabaseSync } from "node:sqlite";
import { insertRow, tableExists } from "../sqlite";
import { writeBulgariaProjection } from "./write";
import type { BulgariaProjection, SqlRow } from "./project";
import {
  BI_DRAFT_OFFICE_IDS,
  COUNTRY_ID,
  EXPECTED_BI_COUNTS,
  LINEAGE_ID,
} from "./bi-identity";

export type BulgariaBiWriteMode = "fresh" | "additive" | "reuse";

const DRAFT_IDS = new Set<string>(BI_DRAFT_OFFICE_IDS);

/**
 * Child kinds the slim BI land does not publish. Deleting these rows is
 * scoped to the Bulgaria lineage. Preserved office rows are not deleted.
 */
const DROPPED_LOCATOR_KINDS = ["event", "proceeding", "result_row", "source", "party_mapping"] as const;

/**
 * Tables whose rows are removed for this lineage on an upgrade. `office` is
 * intentionally absent: deleting offices makes SQLite's deferred foreign-key
 * check scan global children (result_row, record_locator, derived seats) once
 * per parent. On a multi-gigabyte atlas that scan is the post-staging hang,
 * and derived rows that still point at the deleted offices then fail the check.
 */
const LINEAGE_CHILD_DELETES = [
  "evidence_link",
  "unresolved_evidence",
  "result_row",
  "proceeding",
  "party_mapping",
  "election_event",
  "source",
  "research_date",
] as const;

const RELEASE_RETARGETS = [
  "retained_input",
  "country",
  "geography",
  "office_tier_classification",
  "office",
  "record_locator",
  "identity_crosswalk",
] as const;

/**
 * One foreign_key_check per table, not per deleted parent. `result_row` is
 * omitted: the upgrade only deletes Bulgaria result rows, and the rows that
 * remain were already valid. Checking that table scans the whole atlas.
 */
const FOREIGN_KEY_TABLES = [
  "publication_release",
  "retained_input",
  "country",
  "geography",
  "office_tier_classification",
  "office",
  "research_date",
  "election_event",
  "proceeding",
  "source",
  "party_mapping",
  "record_locator",
  "evidence_link",
  "unresolved_evidence",
  "identity_crosswalk",
  "publication_receipt",
  "derived_jurisdiction",
  "derived_slug_alias",
  "derived_seat_status",
  "derived_cycle",
  "derived_cycle_unplaced",
  "derived_coverage",
  "derived_office_slug",
  "derived_office_slug_alias",
] as const;

type ExistingOffice = {
  id_namespace: string;
  office_id: string;
  geography_id: string;
  office_type: string;
  office_status: string;
};

function note(message: string): void {
  writeSync(1, `bulgaria-bi ${message}\n`);
}

function officeKey(namespace: string, officeId: string): string {
  return `${namespace}\n${officeId}`;
}

export function writeBulgariaBiRelease(
  db: DatabaseSync,
  projection: BulgariaProjection,
  attemptId: string,
  options?: { reuseRelease?: boolean },
): BulgariaBiWriteMode {
  if (options?.reuseRelease) {
    note("write mode=reuse");
    writeBulgariaProjection(db, projection, attemptId, { reuseRelease: true });
    return "reuse";
  }
  const selected = db.prepare("SELECT release_id FROM publication_release WHERE lineage_id = ?").get(LINEAGE_ID) as
    | { release_id?: string }
    | undefined;
  const nextRelease = String(projection.publicationRelease.release_id);
  if (!selected) {
    note("write mode=fresh");
    writeBulgariaProjection(db, projection, attemptId);
    return "fresh";
  }
  if (String(selected.release_id) === nextRelease) {
    note("write mode=reuse");
    writeBulgariaProjection(db, projection, attemptId, { reuseRelease: true });
    return "reuse";
  }
  writeAdditive(db, projection, attemptId, nextRelease);
  return "additive";
}

function writeAdditive(db: DatabaseSync, projection: BulgariaProjection, attemptId: string, nextRelease: string): void {
  const fkRow = db.prepare("PRAGMA foreign_keys").get() as { foreign_keys?: number } | undefined;
  const restoreForeignKeys = Number(fkRow?.foreign_keys ?? 0) === 1;
  if (restoreForeignKeys) db.exec("PRAGMA foreign_keys = OFF");
  try {
    db.exec("BEGIN IMMEDIATE;");
    try {
      const existing = loadExistingOffices(db);
      const preserved = projection.offices.filter((office) => !DRAFT_IDS.has(String(office.office_id)));
      if (preserved.length !== EXPECTED_BI_COUNTS.preserved_offices) {
        throw new Error(`BI projection preserved ${preserved.length} offices, expected ${EXPECTED_BI_COUNTS.preserved_offices}`);
      }
      assertPreservedOffices(existing, preserved, projection.offices);
      note(
        `write mode=additive preserved_offices=${preserved.length} existing_offices=${existing.size} (office rows are not deleted)`,
      );

      const lineage = db.prepare("SELECT lineage_id FROM dataset_lineage WHERE lineage_id = ?").get(LINEAGE_ID);
      if (!lineage) insertRow(db, "dataset_lineage", projection.lineage);
      const release = db
        .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND release_id = ?")
        .get(LINEAGE_ID, nextRelease);
      if (!release) insertRow(db, "dataset_release", projection.release);

      detachBulgariaDerived(db);
      clearOfficeDatePointers(db);
      deleteDroppedCrosswalks(db);
      deleteDroppedLocators(db);
      for (const table of LINEAGE_CHILD_DELETES) {
        const result = db.prepare(`DELETE FROM ${table} WHERE lineage_id = ?`).run(LINEAGE_ID);
        note(`delete ${table} lineage rows=${Number(result.changes)}`);
      }

      db.prepare("UPDATE publication_release SET release_id = ? WHERE lineage_id = ?").run(nextRelease, LINEAGE_ID);
      for (const table of RELEASE_RETARGETS) {
        db.prepare(`UPDATE ${table} SET release_id = ? WHERE lineage_id = ?`).run(nextRelease, LINEAGE_ID);
      }
      const country = db.prepare("SELECT country_id FROM country WHERE country_id = ?").get(projection.country.country_id);
      if (!country) insertRow(db, "country", projection.country);
      else updateMatching(db, "country", projection.country, "country_id");

      let insertedOffices = 0;
      upsertRetainedInputs(db, projection.retainedInputs);
      for (const row of projection.geographies) {
        insertIfMissing(db, "geography", row, "country_id = ? AND geography_id = ?", [row.country_id, row.geography_id]);
      }
      for (const row of projection.tiers) {
        if (!DRAFT_IDS.has(String(row.office_id))) continue;
        insertIfMissing(db, "office_tier_classification", row, "id_namespace = ? AND office_id = ?", [
          row.id_namespace,
          row.office_id,
        ]);
      }
      const insertedIds: Array<{ namespace: string; officeId: string }> = [];
      for (const row of projection.offices) {
        if (!DRAFT_IDS.has(String(row.office_id))) continue;
        const inserted = insertIfMissing(db, "office", row, "id_namespace = ? AND office_id = ?", [
          row.id_namespace,
          row.office_id,
        ]);
        if (inserted) {
          insertedOffices += 1;
          insertedIds.push({ namespace: String(row.id_namespace), officeId: String(row.office_id) });
        }
      }
      for (const row of projection.locators) {
        insertIfMissing(db, "record_locator", row, "record_key = ?", [row.record_key]);
      }
      for (const row of projection.unresolved) {
        insertIfMissing(db, "unresolved_evidence", row, "unresolved_id = ?", [row.unresolved_id]);
      }
      for (const row of projection.crosswalks) {
        insertIfMissing(db, "identity_crosswalk", row, "entity_kind = ? AND upstream_namespace = ? AND upstream_id = ?", [
          row.entity_kind,
          row.upstream_namespace,
          row.upstream_id,
        ]);
      }

      insertDraftSeatStatus(db, insertedIds);
      retargetBulgariaDerivedCounts(db, insertedOffices);
      deleteBulgariaSearchDocs(db);
      upsertReceipt(db, attemptId, nextRelease);
      assertBulgariaBiForeignKeys(db);
      note(`additive committed inserted_offices=${insertedOffices}`);
      db.exec("COMMIT;");
    } catch (error) {
      try {
        db.exec("ROLLBACK;");
      } catch {
        // The transaction may already be closed.
      }
      throw error;
    }
  } finally {
    if (restoreForeignKeys) db.exec("PRAGMA foreign_keys = ON");
  }
}

function loadExistingOffices(db: DatabaseSync): Map<string, ExistingOffice> {
  const rows = db
    .prepare(
      `SELECT id_namespace, office_id, geography_id, office_type, office_status
       FROM office WHERE lineage_id = ?`,
    )
    .all(LINEAGE_ID) as ExistingOffice[];
  const existing = new Map<string, ExistingOffice>();
  for (const row of rows) {
    existing.set(officeKey(String(row.id_namespace), String(row.office_id)), {
      id_namespace: String(row.id_namespace),
      office_id: String(row.office_id),
      geography_id: String(row.geography_id),
      office_type: String(row.office_type),
      office_status: String(row.office_status),
    });
  }
  return existing;
}

function assertPreservedOffices(existing: Map<string, ExistingOffice>, preserved: SqlRow[], published: SqlRow[]): void {
  const allowed = new Set(published.map((office) => officeKey(String(office.id_namespace), String(office.office_id))));
  const unexpected: string[] = [];
  for (const row of existing.values()) {
    if (!allowed.has(officeKey(row.id_namespace, row.office_id))) unexpected.push(row.office_id);
  }
  if (unexpected.length > 0) {
    throw new Error(
      `Refusing to rewrite Bulgaria offices; unexpected IDs would have to be dropped: ${unexpected.slice(0, 8).join(", ")}`,
    );
  }
  const missing: string[] = [];
  for (const office of preserved) {
    const row = existing.get(officeKey(String(office.id_namespace), String(office.office_id)));
    if (!row) {
      missing.push(String(office.office_id));
      continue;
    }
    if (
      row.geography_id !== String(office.geography_id) ||
      row.office_type !== String(office.office_type) ||
      row.office_status !== String(office.office_status)
    ) {
      throw new Error(
        `Preserved office ${row.office_id} drifted (${row.geography_id} ${row.office_type} ${row.office_status}); refusing to rewrite it`,
      );
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `Refusing to rebuild Bulgaria offices; missing preserved IDs: ${missing.slice(0, 8).join(", ")}`,
    );
  }
  for (const office of published) {
    if (!DRAFT_IDS.has(String(office.office_id))) continue;
    const row = existing.get(officeKey(String(office.id_namespace), String(office.office_id)));
    if (!row) continue;
    if (
      row.geography_id !== String(office.geography_id) ||
      row.office_type !== String(office.office_type) ||
      row.office_status !== String(office.office_status)
    ) {
      throw new Error(`Draft office ${row.office_id} already exists and does not match the BI projection`);
    }
  }
}

function detachBulgariaDerived(db: DatabaseSync): void {
  if (tableExists(db, "derived_seat_status")) {
    db.prepare(
      `UPDATE derived_seat_status
       SET current_holder_label = NULL,
           current_holder_party_label = NULL,
           current_since_date_id = NULL,
           last_selected_event_id = NULL,
           last_share = NULL,
           last_share_unit = NULL,
           last_margin = NULL,
           next_date_id = NULL,
           status_reason = 'no_history'
       WHERE country_id = ?
         AND (
           last_selected_event_id IS NOT NULL
           OR current_since_date_id IS NOT NULL
           OR next_date_id IS NOT NULL
           OR current_holder_label IS NOT NULL
           OR last_share IS NOT NULL
         )`,
    ).run(COUNTRY_ID);
  }
  if (tableExists(db, "derived_cycle")) {
    db.prepare("DELETE FROM derived_cycle WHERE country_id = ?").run(COUNTRY_ID);
  }
  if (tableExists(db, "derived_cycle_unplaced")) {
    db.prepare("DELETE FROM derived_cycle_unplaced WHERE country_id = ?").run(COUNTRY_ID);
  }
}

function clearOfficeDatePointers(db: DatabaseSync): void {
  db.prepare(
    `UPDATE office
     SET next_date_id = NULL, next_date_resolution = 'unknown', next_history_key = NULL
     WHERE lineage_id = ?
       AND (next_date_id IS NOT NULL OR next_history_key IS NOT NULL OR next_date_resolution != 'unknown')`,
  ).run(LINEAGE_ID);
}

function deleteDroppedCrosswalks(db: DatabaseSync): void {
  const kinds = DROPPED_LOCATOR_KINDS.map(() => "?").join(", ");
  db.prepare(
    `DELETE FROM identity_crosswalk
     WHERE record_key IN (
       SELECT record_key FROM record_locator
       WHERE lineage_id = ? AND entity_kind IN (${kinds})
     )`,
  ).run(LINEAGE_ID, ...DROPPED_LOCATOR_KINDS);
}

function deleteDroppedLocators(db: DatabaseSync): void {
  const kinds = DROPPED_LOCATOR_KINDS.map(() => "?").join(", ");
  const result = db
    .prepare(`DELETE FROM record_locator WHERE lineage_id = ? AND entity_kind IN (${kinds})`)
    .run(LINEAGE_ID, ...DROPPED_LOCATOR_KINDS);
  note(`delete record_locator dropped kinds rows=${Number(result.changes)}`);
}

function retargetBulgariaDerivedCounts(db: DatabaseSync, insertedOffices: number): void {
  if (!tableExists(db, "derived_jurisdiction")) return;
  db.prepare(
    `UPDATE derived_jurisdiction
     SET event_count = 0, first_event_year = NULL, last_event_year = NULL
     WHERE country_id = ?`,
  ).run(COUNTRY_ID);
  if (insertedOffices > 0) {
    db.prepare(
      `UPDATE derived_jurisdiction
       SET office_count = office_count + ?
       WHERE country_id = ? AND geography_id IS NULL AND level_label = 'country'`,
    ).run(insertedOffices, COUNTRY_ID);
  }
  if (!tableExists(db, "derived_coverage")) return;
  db.prepare(
    `UPDATE derived_coverage
     SET events_total = 0,
         events_with_results = 0,
         offices_with_any_event = 0,
         offices_with_results = 0
     WHERE jurisdiction_key IN (SELECT jurisdiction_key FROM derived_jurisdiction WHERE country_id = ?)`,
  ).run(COUNTRY_ID);
  if (insertedOffices > 0) {
    db.prepare(
      `UPDATE derived_coverage
       SET offices = offices + ?
       WHERE jurisdiction_key IN (
         SELECT jurisdiction_key FROM derived_jurisdiction
         WHERE country_id = ? AND geography_id IS NULL AND level_label = 'country'
       )`,
    ).run(insertedOffices, COUNTRY_ID);
  }
}

function insertDraftSeatStatus(db: DatabaseSync, inserted: Array<{ namespace: string; officeId: string }>): void {
  if (!tableExists(db, "derived_seat_status") || inserted.length === 0) return;
  const exists = db.prepare("SELECT 1 AS ok FROM derived_seat_status WHERE id_namespace = ? AND office_id = ?");
  const insert = db.prepare(
    `INSERT INTO derived_seat_status (
       id_namespace, office_id, country_id,
       current_holder_label, current_holder_party_label, current_since_date_id,
       last_selected_event_id, last_share, last_share_unit, last_margin,
       next_date_id, status_reason
     ) VALUES (?, ?, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'no_history')`,
  );
  for (const office of inserted) {
    if (exists.get(office.namespace, office.officeId)) continue;
    insert.run(office.namespace, office.officeId, COUNTRY_ID);
  }
}

function deleteBulgariaSearchDocs(db: DatabaseSync): void {
  if (tableExists(db, "search_cycle")) deleteSearchMode(db, "cycle", "search_cycle", "search_cycle_trigram");
  if (tableExists(db, "search_candidate")) deleteSearchMode(db, "candidate", "search_candidate", "search_candidate_trigram");
}

function deleteSearchMode(db: DatabaseSync, mode: string, table: string, trigramTable: string): void {
  if (tableExists(db, trigramTable)) {
    db.prepare(
      `DELETE FROM ${trigramTable}
       WHERE search_id IN (SELECT search_id FROM ${table} WHERE country_id = ?)`,
    ).run(COUNTRY_ID);
  }
  if (tableExists(db, "search_token")) {
    db.prepare(
      `DELETE FROM search_token
       WHERE mode = ? AND search_id IN (SELECT search_id FROM ${table} WHERE country_id = ?)`,
    ).run(mode, COUNTRY_ID);
  }
  db.prepare(`DELETE FROM ${table} WHERE country_id = ?`).run(COUNTRY_ID);
  if (tableExists(db, "search_meta")) {
    const count = db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n?: number } | undefined;
    db.prepare("UPDATE search_meta SET doc_count = ? WHERE mode = ?").run(Number(count?.n ?? 0), mode);
  }
}

function updateMatching(db: DatabaseSync, table: string, row: SqlRow, key: string): void {
  const columns = Object.keys(row).filter((column) => column !== key);
  const sql = `UPDATE ${table} SET ${columns.map((column) => `${column} = ?`).join(", ")} WHERE ${key} = ?`;
  db.prepare(sql).run(...columns.map((column) => row[column] ?? null), row[key] ?? null);
}

/**
 * Prompt P stored the approved classifier at `schemas/atlas/tiers/bulgaria.json`.
 * That path is now the BI draft, with a different sha. `retained_input`'s primary
 * key is (lineage, release, path), so insert-if-missing keeps the old sha and the
 * new tier rows (and any retargeted release_id) no longer match. Move citations
 * of the old composite onto the preserved classifier, then replace the schema-path
 * row with the draft bytes.
 */
function upsertRetainedInputs(db: DatabaseSync, rows: SqlRow[]): void {
  const find = db.prepare(
    `SELECT input_kind, sha256 FROM retained_input WHERE lineage_id = ? AND release_id = ? AND input_path = ?`,
  );
  const pending: Array<{ row: SqlRow; inputKind: string; sha256: string }> = [];
  for (const row of rows) {
    const existing = find.get(row.lineage_id, row.release_id, row.input_path) as
      | { input_kind?: string; sha256?: string }
      | undefined;
    if (!existing) {
      insertRow(db, "retained_input", row);
      continue;
    }
    const inputKind = String(existing.input_kind ?? "");
    const sha256 = String(existing.sha256 ?? "");
    if (inputKind === String(row.input_kind) && sha256 === String(row.sha256)) continue;
    pending.push({ row, inputKind, sha256 });
  }
  for (const item of pending) {
    rehomeTierCitations(db, rows, item.row, item.inputKind, item.sha256);
    db.prepare(
      `UPDATE retained_input
       SET input_kind = ?, sha256 = ?, byte_count = ?, recovery_locator = ?, payload_json = ?
       WHERE lineage_id = ? AND release_id = ? AND input_path = ?`,
    ).run(
      item.row.input_kind ?? null,
      item.row.sha256 ?? null,
      item.row.byte_count ?? null,
      item.row.recovery_locator ?? null,
      item.row.payload_json ?? null,
      item.row.lineage_id ?? null,
      item.row.release_id ?? null,
      item.row.input_path ?? null,
    );
    note(
      `retained_input ${String(item.row.input_path)} sha ${item.sha256} -> ${String(item.row.sha256)}`,
    );
  }
}

function rehomeTierCitations(
  db: DatabaseSync,
  projected: SqlRow[],
  colliding: SqlRow,
  oldKind: string,
  oldSha: string,
): void {
  const lineageId = String(colliding.lineage_id);
  const releaseId = String(colliding.release_id);
  const oldPath = String(colliding.input_path);
  const cited = db
    .prepare(
      `SELECT COUNT(*) AS n FROM office_tier_classification
       WHERE lineage_id = ? AND release_id = ?
         AND classification_path = ? AND classification_kind = ? AND classification_sha256 = ?`,
    )
    .get(lineageId, releaseId, oldPath, oldKind, oldSha) as { n?: number } | undefined;
  if (Number(cited?.n ?? 0) === 0) return;
  const home = projected.find(
    (row) =>
      String(row.sha256) === oldSha &&
      String(row.input_kind) === "tier_classification" &&
      String(row.input_path) !== oldPath,
  );
  if (!home) {
    throw new Error(
      `office_tier_classification still cites retained_input ${oldPath} ${oldKind} ${oldSha}, which this release replaces`,
    );
  }
  const homeRow = db
    .prepare(
      `SELECT input_kind, sha256 FROM retained_input WHERE lineage_id = ? AND release_id = ? AND input_path = ?`,
    )
    .get(home.lineage_id, home.release_id, home.input_path) as
    | { input_kind?: string; sha256?: string }
    | undefined;
  if (
    !homeRow ||
    String(homeRow.input_kind) !== String(home.input_kind) ||
    String(homeRow.sha256) !== String(home.sha256)
  ) {
    throw new Error(
      `Cannot retarget tier citations from ${oldPath} onto ${String(home.input_path)}; preserved classifier is not loaded`,
    );
  }
  const updated = db
    .prepare(
      `UPDATE office_tier_classification
       SET classification_path = ?, classification_kind = ?, classification_sha256 = ?
       WHERE lineage_id = ? AND release_id = ?
         AND classification_path = ? AND classification_kind = ? AND classification_sha256 = ?`,
    )
    .run(
      home.input_path ?? null,
      home.input_kind ?? null,
      home.sha256 ?? null,
      lineageId,
      releaseId,
      oldPath,
      oldKind,
      oldSha,
    );
  note(
    `retarget office_tier_classification rows=${Number(updated.changes)} ${oldPath} -> ${String(home.input_path)}`,
  );
}

function insertIfMissing(db: DatabaseSync, table: string, row: SqlRow, whereSql: string, params: unknown[]): boolean {
  const existing = db.prepare(`SELECT 1 AS ok FROM ${table} WHERE ${whereSql}`).get(...params);
  if (existing) return false;
  insertRow(db, table, row);
  return true;
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

export function assertBulgariaBiForeignKeys(db: DatabaseSync): void {
  for (const table of FOREIGN_KEY_TABLES) {
    if (!tableExists(db, table)) continue;
    const violation = db.prepare(`PRAGMA foreign_key_check(${table})`).get() as
      | { table?: string; rowid?: number; parent?: string; fkid?: number }
      | undefined;
    if (violation) {
      throw new Error(
        `Foreign key violation in ${table} (rowid ${String(violation.rowid ?? "?")} parent ${String(violation.parent ?? "?")})`,
      );
    }
  }
}
