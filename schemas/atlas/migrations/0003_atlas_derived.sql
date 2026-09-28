-- Derived projections for the Election Atlas reading surface.
-- Apply only to a master/staging database that already has 0002_atlas_master.sql.
-- schema_migration version matches this filename (0003 → 3) so the follow-on
-- runner can apply 0005 afterwards. user_version stays at the master value.
-- Rebuild rows with `npm run derive:atlas`. This file creates empty tables only.
-- It does not insert, update, or delete master entity rows.
-- Run outside an existing transaction. The file opens its own transaction.
PRAGMA foreign_keys = ON;
BEGIN IMMEDIATE;

INSERT INTO schema_migration (version, description)
VALUES (3, 'Atlas derived projections');

CREATE TABLE derived_jurisdiction (
    jurisdiction_key TEXT PRIMARY KEY CHECK (length(trim(jurisdiction_key)) > 0),
    country_id TEXT NOT NULL REFERENCES country(country_id) DEFERRABLE INITIALLY DEFERRED,
    geography_id TEXT,
    parent_key TEXT REFERENCES derived_jurisdiction(jurisdiction_key) DEFERRABLE INITIALLY DEFERRED,
    depth INTEGER NOT NULL CHECK (depth >= 0),
    level_label TEXT NOT NULL CHECK (level_label IN ('country','region','municipality','ward','area')),
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    slug TEXT NOT NULL CHECK (length(trim(slug)) > 0),
    slug_path TEXT NOT NULL CHECK (length(trim(slug_path)) > 0),
    office_count INTEGER NOT NULL CHECK (office_count >= 0),
    event_count INTEGER NOT NULL CHECK (event_count >= 0),
    first_event_year INTEGER CHECK (first_event_year BETWEEN 1 AND 9999),
    last_event_year INTEGER CHECK (last_event_year BETWEEN 1 AND 9999),
    coverage_status TEXT NOT NULL CHECK (coverage_status IN ('available','partial','screened_out','not_supplied')),
    ambiguous INTEGER NOT NULL CHECK (ambiguous IN (0,1)),
    CHECK ((level_label = 'area') = (ambiguous = 1)),
    CHECK ((depth = 0 AND parent_key IS NULL AND geography_id IS NULL AND level_label = 'country')
        OR (depth > 0 AND parent_key IS NOT NULL AND geography_id IS NOT NULL AND level_label <> 'country')),
    CHECK (first_event_year IS NULL OR last_event_year IS NULL OR first_event_year <= last_event_year),
    UNIQUE (slug_path),
    UNIQUE (country_id, geography_id),
    FOREIGN KEY (country_id, geography_id) REFERENCES geography(country_id, geography_id)
        DEFERRABLE INITIALLY DEFERRED
) STRICT;
CREATE INDEX derived_jurisdiction_parent ON derived_jurisdiction(parent_key);
CREATE INDEX derived_jurisdiction_country ON derived_jurisdiction(country_id);

-- A slug_path that has been published keeps its jurisdiction_key.
-- A later rename inserts the old path here; it does not retarget the path.
CREATE TABLE derived_slug_alias (
    slug_path TEXT PRIMARY KEY CHECK (length(trim(slug_path)) > 0),
    jurisdiction_key TEXT NOT NULL REFERENCES derived_jurisdiction(jurisdiction_key)
        DEFERRABLE INITIALLY DEFERRED,
    reason TEXT NOT NULL CHECK (length(trim(reason)) > 0)
) STRICT;
CREATE INDEX derived_slug_alias_jurisdiction ON derived_slug_alias(jurisdiction_key);

CREATE TRIGGER derived_slug_alias_not_canonical
BEFORE INSERT ON derived_slug_alias
BEGIN
    SELECT RAISE(ABORT, 'alias slug_path collides with a canonical jurisdiction path')
    WHERE EXISTS (
        SELECT 1 FROM derived_jurisdiction WHERE slug_path = NEW.slug_path
    );
END;

CREATE TRIGGER derived_jurisdiction_slug_not_alias
BEFORE INSERT ON derived_jurisdiction
BEGIN
    SELECT RAISE(ABORT, 'canonical slug_path collides with a slug alias')
    WHERE EXISTS (
        SELECT 1 FROM derived_slug_alias WHERE slug_path = NEW.slug_path
    );
END;

CREATE TABLE derived_seat_status (
    id_namespace TEXT NOT NULL,
    office_id TEXT NOT NULL,
    country_id TEXT NOT NULL,
    current_holder_label TEXT,
    current_holder_party_label TEXT,
    current_since_date_id TEXT,
    last_selected_event_id TEXT,
    last_share REAL,
    last_share_unit TEXT,
    last_margin REAL CHECK (last_margin IS NULL OR last_margin >= 0),
    next_date_id TEXT,
    status_reason TEXT CHECK (status_reason IS NULL OR status_reason IN (
        'multi_seat','no_elected_flag','withheld','no_history','conflicting_date','superseded'
    )),
    PRIMARY KEY (id_namespace, office_id),
    CHECK (status_reason IS NULL OR (
        current_holder_label IS NULL
        AND current_holder_party_label IS NULL
        AND current_since_date_id IS NULL
    )),
    CHECK (current_holder_label IS NULL OR last_selected_event_id IS NOT NULL),
    CHECK (current_since_date_id IS NULL OR last_selected_event_id IS NOT NULL),
    CHECK (
        (last_share IS NULL AND last_share_unit IS NULL)
        OR (last_share_unit = 'percent_0_100' AND last_share >= 0 AND last_share <= 100)
        OR (last_share_unit = 'proportion_0_1' AND last_share >= 0 AND last_share <= 1)
    ),
    FOREIGN KEY (id_namespace, office_id) REFERENCES office(id_namespace, office_id)
        DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (id_namespace, last_selected_event_id) REFERENCES election_event(id_namespace, event_id)
        DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (current_since_date_id) REFERENCES research_date(date_id)
        DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (next_date_id) REFERENCES research_date(date_id)
        DEFERRABLE INITIALLY DEFERRED
) STRICT;
CREATE INDEX derived_seat_status_country ON derived_seat_status(country_id);

CREATE TABLE derived_cycle (
    cycle_key TEXT PRIMARY KEY CHECK (length(trim(cycle_key)) > 0),
    country_id TEXT NOT NULL REFERENCES country(country_id) DEFERRABLE INITIALLY DEFERRED,
    date_id TEXT NOT NULL REFERENCES research_date(date_id) DEFERRABLE INITIALLY DEFERRED,
    iso_date TEXT NOT NULL CHECK (iso_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
    contest_count INTEGER NOT NULL CHECK (contest_count >= 1),
    scope_key TEXT NOT NULL REFERENCES derived_jurisdiction(jurisdiction_key)
        DEFERRABLE INITIALLY DEFERRED,
    tiers_json TEXT NOT NULL CHECK (json_valid(tiers_json) AND json_type(tiers_json) = 'array'),
    kinds_json TEXT NOT NULL CHECK (json_valid(kinds_json) AND json_type(kinds_json) = 'array'),
    label TEXT NOT NULL CHECK (length(trim(label)) > 0),
    UNIQUE (country_id, iso_date)
) STRICT;
CREATE INDEX derived_cycle_scope ON derived_cycle(scope_key);

-- One row per event that is not a resolved calendar day, so the event stays addressable.
-- (country_id, year) is the grouping key; year is NULL when the source did not supply one.
CREATE TABLE derived_cycle_unplaced (
    id_namespace TEXT NOT NULL,
    office_id TEXT NOT NULL,
    history_key TEXT NOT NULL,
    country_id TEXT NOT NULL REFERENCES country(country_id) DEFERRABLE INITIALLY DEFERRED,
    year INTEGER CHECK (year IS NULL OR year BETWEEN 1 AND 9999),
    date_id TEXT REFERENCES research_date(date_id) DEFERRABLE INITIALLY DEFERRED,
    date_precision TEXT CHECK (date_precision IS NULL OR date_precision IN ('day','month','year','range','unknown')),
    date_resolution TEXT NOT NULL CHECK (date_resolution IN ('resolved','unknown','conflicting')),
    PRIMARY KEY (id_namespace, office_id, history_key),
    FOREIGN KEY (id_namespace, office_id, history_key)
        REFERENCES election_event(id_namespace, office_id, history_key)
        DEFERRABLE INITIALLY DEFERRED
) STRICT;
CREATE INDEX derived_cycle_unplaced_group ON derived_cycle_unplaced(country_id, year);

CREATE TABLE derived_coverage (
    jurisdiction_key TEXT PRIMARY KEY REFERENCES derived_jurisdiction(jurisdiction_key)
        DEFERRABLE INITIALLY DEFERRED,
    offices INTEGER NOT NULL CHECK (offices >= 0),
    offices_with_any_event INTEGER NOT NULL CHECK (offices_with_any_event >= 0 AND offices_with_any_event <= offices),
    offices_with_results INTEGER NOT NULL CHECK (offices_with_results >= 0 AND offices_with_results <= offices),
    events_total INTEGER NOT NULL CHECK (events_total >= 0),
    events_with_results INTEGER NOT NULL CHECK (events_with_results >= 0 AND events_with_results <= events_total),
    not_supplied_next_dates INTEGER NOT NULL CHECK (not_supplied_next_dates >= 0 AND not_supplied_next_dates <= offices),
    latest_snapshot_label TEXT
) STRICT;

COMMIT;
