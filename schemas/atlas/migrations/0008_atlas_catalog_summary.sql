-- Catalog summaries for hot Atlas reads.
-- Apply to the master database AFTER 0007_atlas_person.sql.
-- schema_migration version matches this filename (0008 → 8).
--
-- These tables are derived. They do not change election facts.
-- derive:atlas and derive:atlas:country refresh the country slice.
-- A live database can be filled once with npm run backfill:catalog-summary
-- without npm run derive:atlas and without ATLAS_IMPORT_SCOPE=all.
-- This file creates empty tables and two small lookup indexes.
-- It does not insert, update, or delete master entity rows.
-- Run outside an existing transaction. The file opens its own transaction.
PRAGMA foreign_keys = ON;
BEGIN IMMEDIATE;

INSERT INTO schema_migration (version, description)
VALUES (8, 'Atlas catalog summary');

-- One row per country. Home, /atlas, and the map sum these rows.
-- They do not COUNT office, election_event, or result_row per request.
CREATE TABLE derived_country_summary (
    country_id TEXT PRIMARY KEY,
    offices INTEGER NOT NULL CHECK (offices >= 0),
    events INTEGER NOT NULL CHECK (events >= 0),
    result_rows INTEGER NOT NULL CHECK (result_rows >= 0),
    FOREIGN KEY (country_id) REFERENCES country(country_id) DEFERRABLE INITIALLY DEFERRED
) STRICT;

-- Office counts split by lineage and country so a country derive can replace its slice.
CREATE TABLE derived_lineage_office (
    lineage_id TEXT NOT NULL,
    country_id TEXT NOT NULL,
    offices INTEGER NOT NULL CHECK (offices >= 0),
    PRIMARY KEY (lineage_id, country_id),
    FOREIGN KEY (country_id) REFERENCES country(country_id) DEFERRABLE INITIALLY DEFERRED
) STRICT;

-- Visible result rows per event (withheld evidence excluded).
-- Switchers and contest lists read this instead of scanning result_row.
CREATE TABLE derived_event_result_count (
    id_namespace TEXT NOT NULL,
    office_id TEXT NOT NULL,
    history_key TEXT NOT NULL,
    country_id TEXT NOT NULL,
    visible_count INTEGER NOT NULL CHECK (visible_count >= 1),
    PRIMARY KEY (id_namespace, office_id, history_key),
    FOREIGN KEY (country_id) REFERENCES country(country_id) DEFERRABLE INITIALLY DEFERRED
) STRICT;
CREATE INDEX derived_event_result_count_country ON derived_event_result_count(country_id);

-- Evidence-status totals per country. The publication ETag sums them.
CREATE TABLE derived_evidence_count (
    country_id TEXT NOT NULL,
    evidence_status TEXT NOT NULL,
    n INTEGER NOT NULL CHECK (n >= 0),
    PRIMARY KEY (country_id, evidence_status),
    FOREIGN KEY (country_id) REFERENCES country(country_id) DEFERRABLE INITIALLY DEFERRED
) STRICT;

-- Public id lookups. These indexes do not include result_row.
CREATE INDEX office_public_id ON office(office_id);
CREATE INDEX election_event_public_id ON election_event(event_id);
CREATE INDEX record_locator_event ON record_locator(entity_kind, id_namespace, office_id, history_key);

COMMIT;
