-- Derived office slugs for readable seat aliases (OV-05).
-- Apply to the master database after 0003_atlas_derived.sql.
-- 0004 stays reserved for OV-02 search. 0005 is the boundary crosswalk.
-- This file creates empty tables only. It does not insert, update, or delete
-- master rows. Rebuild rows with `npm run derive:atlas`.
-- schema_migration version matches this filename (0006 → 6).
-- Run outside an existing transaction. The file opens its own transaction.
PRAGMA foreign_keys = ON;
BEGIN IMMEDIATE;

INSERT INTO schema_migration (version, description)
VALUES (6, 'Atlas office slugs');

-- One readable slug per office, unique within its jurisdiction.
-- slug_path is {jurisdiction slug_path}/seats/{slug}.
CREATE TABLE derived_office_slug (
    id_namespace TEXT NOT NULL,
    office_id TEXT NOT NULL,
    jurisdiction_key TEXT NOT NULL REFERENCES derived_jurisdiction(jurisdiction_key)
        DEFERRABLE INITIALLY DEFERRED,
    slug TEXT NOT NULL CHECK (length(trim(slug)) > 0),
    slug_path TEXT NOT NULL CHECK (length(trim(slug_path)) > 0),
    PRIMARY KEY (id_namespace, office_id),
    UNIQUE (jurisdiction_key, slug),
    UNIQUE (slug_path),
    FOREIGN KEY (id_namespace, office_id) REFERENCES office(id_namespace, office_id)
        DEFERRABLE INITIALLY DEFERRED
) STRICT;
CREATE INDEX derived_office_slug_jurisdiction ON derived_office_slug(jurisdiction_key);

-- A slug_path that has been published keeps its office. A rename inserts the old path here.
CREATE TABLE derived_office_slug_alias (
    slug_path TEXT PRIMARY KEY CHECK (length(trim(slug_path)) > 0),
    id_namespace TEXT NOT NULL,
    office_id TEXT NOT NULL,
    reason TEXT NOT NULL CHECK (length(trim(reason)) > 0),
    FOREIGN KEY (id_namespace, office_id) REFERENCES office(id_namespace, office_id)
        DEFERRABLE INITIALLY DEFERRED
) STRICT;
CREATE INDEX derived_office_slug_alias_office ON derived_office_slug_alias(id_namespace, office_id);

CREATE TRIGGER derived_office_slug_alias_not_canonical
BEFORE INSERT ON derived_office_slug_alias
BEGIN
    SELECT RAISE(ABORT, 'alias slug_path collides with a canonical office slug')
    WHERE EXISTS (
        SELECT 1 FROM derived_office_slug WHERE slug_path = NEW.slug_path
    );
END;

CREATE TRIGGER derived_office_slug_not_alias
BEFORE INSERT ON derived_office_slug
BEGIN
    SELECT RAISE(ABORT, 'canonical office slug_path collides with an office slug alias')
    WHERE EXISTS (
        SELECT 1 FROM derived_office_slug_alias WHERE slug_path = NEW.slug_path
    );
END;

COMMIT;
