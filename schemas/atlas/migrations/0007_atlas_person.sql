-- Election Atlas person entities (OV-09).
-- Apply to the master database AFTER 0006_atlas_office_slug.sql.
-- 0006 is office slugs. Person tables are this file, version 7, not 0006.
-- schema_migration version matches this filename (0007 → 7).
--
-- derive:atlas reloads these tables from approved files in schemas/atlas/people/.
-- A file that is not approved is not imported. A (country_id, candidate_or_list_label)
-- pair maps to at most one approved person. A cross-country alias is allowed only
-- when manual_cross_country = 1 and evidence_note is set: that is the manual row.
-- This file creates empty tables. It does not insert people.
-- Run outside an existing transaction. The file opens its own transaction.
PRAGMA foreign_keys = ON;
BEGIN IMMEDIATE;

INSERT INTO schema_migration (version, description)
VALUES (7, 'Atlas person entities');

CREATE TABLE person (
    person_id TEXT PRIMARY KEY CHECK (length(trim(person_id)) > 0),
    canonical_label TEXT NOT NULL CHECK (length(trim(canonical_label)) > 0),
    country_id TEXT NOT NULL REFERENCES country(country_id)
        DEFERRABLE INITIALLY DEFERRED,
    review_status TEXT NOT NULL CHECK (review_status IN (
        'approved',
        'draft_for_human_review',
        'rejected'
    )),
    created_from_release_id TEXT,
    reviewed_on TEXT CHECK (
        reviewed_on IS NULL OR (
            length(reviewed_on) = 10
            AND reviewed_on GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
        )
    )
) STRICT;
CREATE INDEX person_country ON person(country_id, review_status);

CREATE TABLE person_alias (
    person_id TEXT NOT NULL REFERENCES person(person_id)
        DEFERRABLE INITIALLY DEFERRED,
    country_id TEXT NOT NULL REFERENCES country(country_id)
        DEFERRABLE INITIALLY DEFERRED,
    candidate_or_list_label TEXT NOT NULL CHECK (length(trim(candidate_or_list_label)) > 0),
    office_scope TEXT NOT NULL CHECK (length(trim(office_scope)) > 0),
    review_status TEXT NOT NULL CHECK (review_status IN (
        'approved',
        'draft_for_human_review',
        'rejected'
    )),
    evidence_note TEXT NOT NULL DEFAULT '',
    manual_cross_country INTEGER NOT NULL DEFAULT 0 CHECK (manual_cross_country IN (0, 1)),
    PRIMARY KEY (person_id, country_id, candidate_or_list_label)
) STRICT;

-- One approved person per country and source label. Drafts may overlap until review.
CREATE UNIQUE INDEX person_alias_one_approved
    ON person_alias(country_id, candidate_or_list_label)
    WHERE review_status = 'approved';

CREATE INDEX person_alias_label ON person_alias(country_id, candidate_or_list_label);

CREATE TRIGGER person_alias_country_guard
BEFORE INSERT ON person_alias
BEGIN
    SELECT RAISE(ABORT, 'cross-country person alias requires a manual row')
    WHERE NEW.manual_cross_country = 0
      AND EXISTS (
          SELECT 1 FROM person
          WHERE person_id = NEW.person_id AND country_id != NEW.country_id
      );
    SELECT RAISE(ABORT, 'manual cross-country alias needs an evidence note')
    WHERE NEW.manual_cross_country = 1
      AND EXISTS (
          SELECT 1 FROM person
          WHERE person_id = NEW.person_id AND country_id != NEW.country_id
      )
      AND length(trim(NEW.evidence_note)) = 0;
END;

COMMIT;
