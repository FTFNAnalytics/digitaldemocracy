-- Election Atlas boundary crosswalk (OV-07).
-- Apply to the master database AFTER 0002_atlas_master.sql.
-- 0003 and 0004 are reserved for OV-01 (derived tables) and OV-02 (search).
-- This file does not create derived_jurisdiction and does not add a foreign
-- key to it: that table is not on main yet. jurisdiction_key is the OV-01
-- key and is stored here so approved rows can be joined once it exists.
-- Do not update, delete, or alter geography. Geometry is not stored here.
-- Only review_status = 'approved' rows may be used to draw a shape.
-- Requires SQLite >= 3.38 with STRICT tables. Foreign keys stay ON.
-- Run outside an existing transaction. The file opens its own transaction.
PRAGMA foreign_keys = ON;
BEGIN IMMEDIATE;

CREATE TABLE boundary_crosswalk (
    jurisdiction_key TEXT PRIMARY KEY
        CHECK (length(trim(jurisdiction_key)) > 0),
    boundary_source TEXT NOT NULL
        CHECK (boundary_source IN (
            'gisco_nuts',
            'gisco_lau',
            'geoboundaries',
            'natural_earth',
            'national'
        )),
    boundary_code TEXT NOT NULL
        CHECK (length(trim(boundary_code)) > 0),
    boundary_version TEXT NOT NULL
        CHECK (length(trim(boundary_version)) > 0),
    match_method TEXT NOT NULL
        CHECK (match_method IN (
            'code_supplied',
            'name_parent_exact',
            'name_parent_fuzzy',
            'manual'
        )),
    confidence REAL NOT NULL
        CHECK (confidence >= 0 AND confidence <= 1),
    review_status TEXT NOT NULL
        CHECK (review_status IN (
            'approved',
            'draft_for_human_review',
            'rejected'
        )),
    reviewer_note TEXT NOT NULL DEFAULT ''
) STRICT;

CREATE INDEX boundary_crosswalk_status ON boundary_crosswalk(review_status);
CREATE INDEX boundary_crosswalk_source_code
    ON boundary_crosswalk(boundary_source, boundary_code);

INSERT INTO schema_migration (version, description)
VALUES (5, 'Atlas boundary crosswalk');

COMMIT;
