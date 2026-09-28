-- Election Atlas search indexes (OV-02).
-- Apply to the master database AFTER 0003_atlas_derived.sql and BEFORE 0005.
-- schema_migration version matches this filename (0004 → 4).
--
-- node:sqlite in this runtime reports sqlite_compileoption_used('ENABLE_FTS5') = 0
-- and CREATE VIRTUAL TABLE ... USING fts5 fails with "no such module: fts5".
-- These are therefore ordinary STRICT tables plus trigram posting lists, not FTS5
-- virtual tables. derive:atlas deletes and rebuilds every search_* row from the
-- master and the derived projections. This file does not edit master entity rows.
--
-- Query shape: a token of 3+ characters is a trigram intersection, then a prefix
-- check on the folded text (case, diacritic, and punctuation folding only).
-- Shorter tokens use that same folded text. Ranking is BM25 over search_token,
-- with a small exact-name boost, a small later-year boost, and Europe-first
-- tie-break in application code.
--
-- Run outside an existing transaction. The file opens its own transaction.
PRAGMA foreign_keys = ON;
BEGIN IMMEDIATE;

INSERT INTO schema_migration (version, description)
VALUES (4, 'Atlas search indexes');

CREATE TABLE search_seat (
    search_id INTEGER PRIMARY KEY,
    id_namespace TEXT NOT NULL CHECK (length(trim(id_namespace)) > 0),
    office_id TEXT NOT NULL CHECK (length(trim(office_id)) > 0),
    country_id TEXT NOT NULL,
    region_id TEXT NOT NULL,
    level_label TEXT,
    tier TEXT,
    slug_path TEXT,
    office_name TEXT NOT NULL,
    office_type TEXT NOT NULL,
    geography_name TEXT,
    country_name TEXT NOT NULL,
    holder_label TEXT,
    disambiguation TEXT NOT NULL,
    event_year INTEGER CHECK (event_year IS NULL OR event_year BETWEEN 1 AND 9999),
    folded TEXT NOT NULL,
    token_count INTEGER NOT NULL CHECK (token_count >= 0),
    UNIQUE (id_namespace, office_id)
) STRICT;
CREATE INDEX search_seat_country ON search_seat(country_id);
CREATE INDEX search_seat_level ON search_seat(level_label);
CREATE INDEX search_seat_tier ON search_seat(tier);

CREATE TABLE search_seat_trigram (
    trigram TEXT NOT NULL CHECK (length(trigram) = 3),
    search_id INTEGER NOT NULL REFERENCES search_seat(search_id) ON DELETE CASCADE,
    PRIMARY KEY (trigram, search_id)
) STRICT;

CREATE TABLE search_cycle (
    search_id INTEGER PRIMARY KEY,
    cycle_key TEXT NOT NULL CHECK (length(trim(cycle_key)) > 0),
    country_id TEXT NOT NULL,
    region_id TEXT NOT NULL,
    country_name TEXT NOT NULL,
    level_label TEXT,
    iso_date TEXT NOT NULL,
    event_year INTEGER NOT NULL CHECK (event_year BETWEEN 1 AND 9999),
    label TEXT NOT NULL,
    scope_name TEXT NOT NULL,
    scope_key TEXT NOT NULL,
    slug_path TEXT,
    tiers_json TEXT NOT NULL CHECK (json_valid(tiers_json)),
    contest_count INTEGER NOT NULL CHECK (contest_count >= 1),
    disambiguation TEXT NOT NULL,
    folded TEXT NOT NULL,
    token_count INTEGER NOT NULL CHECK (token_count >= 0),
    UNIQUE (cycle_key)
) STRICT;
CREATE INDEX search_cycle_country ON search_cycle(country_id);
CREATE INDEX search_cycle_level ON search_cycle(level_label);
CREATE INDEX search_cycle_year ON search_cycle(event_year);

CREATE TABLE search_cycle_trigram (
    trigram TEXT NOT NULL CHECK (length(trigram) = 3),
    search_id INTEGER NOT NULL REFERENCES search_cycle(search_id) ON DELETE CASCADE,
    PRIMARY KEY (trigram, search_id)
) STRICT;

-- One row per distinct (country, candidate label, party label).
-- Labels are not merged across countries. party_key is '' when the source
-- supplied no party label. The original label is stored unchanged.
CREATE TABLE search_candidate (
    search_id INTEGER PRIMARY KEY,
    country_id TEXT NOT NULL,
    region_id TEXT NOT NULL,
    label TEXT NOT NULL CHECK (length(trim(label)) > 0),
    party_label TEXT,
    party_key TEXT NOT NULL,
    offices_json TEXT NOT NULL CHECK (json_valid(offices_json) AND json_type(offices_json) = 'array'),
    years_json TEXT NOT NULL CHECK (json_valid(years_json) AND json_type(years_json) = 'array'),
    levels_json TEXT NOT NULL CHECK (json_valid(levels_json) AND json_type(levels_json) = 'array'),
    event_year INTEGER CHECK (event_year IS NULL OR event_year BETWEEN 1 AND 9999),
    country_name TEXT NOT NULL,
    disambiguation TEXT NOT NULL,
    folded TEXT NOT NULL,
    token_count INTEGER NOT NULL CHECK (token_count >= 0),
    UNIQUE (country_id, label, party_key)
) STRICT;
CREATE INDEX search_candidate_country ON search_candidate(country_id);

CREATE TABLE search_candidate_trigram (
    trigram TEXT NOT NULL CHECK (length(trigram) = 3),
    search_id INTEGER NOT NULL REFERENCES search_candidate(search_id) ON DELETE CASCADE,
    PRIMARY KEY (trigram, search_id)
) STRICT;

CREATE TABLE search_meta (
    mode TEXT PRIMARY KEY CHECK (mode IN ('seat', 'cycle', 'candidate')),
    doc_count INTEGER NOT NULL CHECK (doc_count >= 0),
    avg_tokens REAL NOT NULL CHECK (avg_tokens > 0)
) STRICT;

-- Document frequency postings for BM25. term is a folded token.
CREATE TABLE search_token (
    mode TEXT NOT NULL CHECK (mode IN ('seat', 'cycle', 'candidate')),
    term TEXT NOT NULL CHECK (length(term) > 0),
    search_id INTEGER NOT NULL CHECK (search_id >= 1),
    tf INTEGER NOT NULL CHECK (tf >= 1),
    PRIMARY KEY (mode, term, search_id)
) STRICT;

COMMIT;
