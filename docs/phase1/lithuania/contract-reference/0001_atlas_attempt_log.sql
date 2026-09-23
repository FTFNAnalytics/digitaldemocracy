-- DRAFT: apply once to atlas-attempts.sqlite, NEVER to atlas.sqlite.staging.
-- Durable sibling ledger, separately committed; it is NEVER renamed/replaced
-- when the master publication is swapped. Use a distinct connection and file.
-- SQLite >= 3.38; execute outside an existing transaction. No app/import code.
PRAGMA foreign_keys = ON;
PRAGMA recursive_triggers = ON;
PRAGMA synchronous = FULL;
BEGIN IMMEDIATE;

CREATE TABLE schema_migration (
    version INTEGER PRIMARY KEY,
    description TEXT NOT NULL
) STRICT;
INSERT INTO schema_migration VALUES (1, 'Atlas durable attempt ledger draft');

-- One lineage per attempt. A later multi-lineage batch uses one child attempt
-- per lineage and the same complete publication set in each success receipt.
-- Failed attempts are audit only: no successful_release_id, no minted release.
-- Release pointers are intentionally logical cross-file references, not FKs:
-- SQLite cannot enforce an FK across separate database files. Validate them
-- against master.dataset_release/publication_receipt during reconciliation.
CREATE TABLE ingest_attempt (
    attempt_id TEXT PRIMARY KEY CHECK (length(trim(attempt_id))>0),
    lineage_id TEXT NOT NULL CHECK (length(trim(lineage_id))>0),
    operator TEXT NOT NULL,
    script_version TEXT NOT NULL,
    started_at TEXT NOT NULL,
    finished_at TEXT,
    status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started','succeeded','failed')),
    input_inventory_json TEXT NOT NULL CHECK (json_valid(input_inventory_json)),
    -- Includes attempted paths/checksums/adapter/method/schema versions;
    -- preserve unavailable-input errors too. No fabricated checksum required.
    successful_release_id TEXT,
    publication_set_json TEXT CHECK (publication_set_json IS NULL OR
        (json_valid(publication_set_json) AND json_type(publication_set_json)='array')),
    row_counts_json TEXT CHECK (row_counts_json IS NULL OR
        (json_valid(row_counts_json) AND json_type(row_counts_json)='object')),
    error_text TEXT,
    CHECK (successful_release_id IS NULL OR successful_release_id<>attempt_id),
    CHECK (
      (status='started' AND finished_at IS NULL AND successful_release_id IS NULL
        AND publication_set_json IS NULL AND error_text IS NULL) OR
      (status='failed' AND finished_at IS NOT NULL AND successful_release_id IS NULL
        AND publication_set_json IS NULL AND error_text IS NOT NULL AND length(trim(error_text))>0) OR
      (status='succeeded' AND finished_at IS NOT NULL AND successful_release_id IS NOT NULL
        AND publication_set_json IS NOT NULL AND row_counts_json IS NOT NULL AND error_text IS NULL)
    )
) STRICT;
CREATE INDEX ingest_attempt_lineage ON ingest_attempt(lineage_id,started_at);
CREATE TRIGGER ingest_attempt_start_only BEFORE INSERT ON ingest_attempt
WHEN NEW.status<>'started'
BEGIN SELECT RAISE(ABORT,'attempt must first be durably started'); END;
CREATE TRIGGER ingest_attempt_no_terminal_edit BEFORE UPDATE ON ingest_attempt
WHEN OLD.status<>'started'
BEGIN SELECT RAISE(ABORT,'terminal attempt is immutable'); END;
CREATE TRIGGER ingest_attempt_identity_immutable BEFORE UPDATE ON ingest_attempt
WHEN NEW.attempt_id IS NOT OLD.attempt_id
  OR NEW.lineage_id IS NOT OLD.lineage_id
  OR NEW.operator IS NOT OLD.operator
  OR NEW.script_version IS NOT OLD.script_version
  OR NEW.started_at IS NOT OLD.started_at
  OR NEW.input_inventory_json IS NOT OLD.input_inventory_json
BEGIN SELECT RAISE(ABORT,'attempt identity/input inventory is immutable'); END;
CREATE TRIGGER ingest_attempt_no_delete BEFORE DELETE ON ingest_attempt
BEGIN SELECT RAISE(ABORT,'attempt audit cannot be deleted'); END;

-- Commit 'started' BEFORE staging work. On poison/validation failure, roll
-- back staging and commit 'failed' here on this independent connection.
-- Commit 'succeeded' only AFTER verified atomic publication. Hash-identical
-- repeat uses a NEW attempt_id and the SAME successful_release_id.
-- A crash after rename but before final audit update leaves a started attempt;
-- compare master.publication_receipt.last_publish_attempt_id and the selected
-- lineage set before marking success or restoring the previous publication.
PRAGMA user_version = 1;
COMMIT;
