-- Atlas bootstrap only.
-- Full entity DDL waits for the reviewed ChatGPT draft against the identity
-- table in docs/atlas-plan.md (lineage release_id vs attempt_id, namespaced
-- office/event keys, unresolved evidence, publication set).
-- Phase 1 exit criteria: docs/atlas-plan.md Phase 1 and docs/atlas-phase1.md.

CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER NOT NULL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS atlas_meta (
  key TEXT NOT NULL PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO atlas_meta (key, value) VALUES
  ('product', 'election-atlas'),
  ('schema_bootstrap', '1'),
  ('entity_ddl', 'pending_review'),
  ('albania_ingest', 'blocked');
