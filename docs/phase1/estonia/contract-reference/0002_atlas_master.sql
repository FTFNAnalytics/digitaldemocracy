-- DRAFT: Election Atlas Phase 1, master database. No research seed rows.
-- Plan: main @ 5f46f9b03f24f4776ffb09feb390906b0ca75fdb (post PR #17).
-- Run once on a NEW master/staging database, outside an existing transaction.
-- Requires SQLite >= 3.38 with JSON functions and STRICT tables enabled.
-- Apply 001_atlas_attempt_log.sql separately to the durable sibling ledger.
-- Never run either migration against an unidentified/live database.
-- Foreign keys MUST be enabled and verified on EVERY writer connection.
PRAGMA foreign_keys = ON;
PRAGMA recursive_triggers = ON;
PRAGMA synchronous = FULL;
BEGIN IMMEDIATE;

-- Publication protocol (importer/OS responsibilities, NOT performed by DDL):
-- 1. Acquire one writer lock covering both DBs. Commit a started attempt to
--    atlas-attempts.sqlite BEFORE opening the staging transaction. Never put
--    the only attempt record in staging; never include the ledger in the swap.
-- 2. Obtain a consistent SQLite backup of the published DB (not a naked copy
--    of a live WAL database); build atlas.sqlite.staging on the SAME filesystem.
--    Retain unrelated lineages, their release IDs and their rows unchanged.
-- 3. Load under deferred FKs. All content validation must succeed before the
--    candidate dataset_release row is committed. On any error, roll back and
--    discard staging, log failure durably, and keep the last good file serving.
--    A tentative ID/hash in memory/staging is NOT a minted public release.
-- 4. Validate foreign_key_check, integrity_check and all CI gates. Persist the
--    publication_release set and publication_receipt IN the staged DB.
-- 5. Back up the prior publication off-VPS before swapping; retain on-VPS last
--    N and one full snapshot per lineage release. Preserve immutable inputs,
--    overrides and adapter/method/schema versions for independent rebuilding.
-- 6. If staging used WAL, checkpoint TRUNCATE and check no busy/uncheckpointed
--    frames remain; close its connections. Prefer journal_mode=DELETE on the
--    closed-for-publication staging file. Do not rename a DB with live WAL.
--    Quiesce/reopen readers and eliminate stale destination WAL/SHM safely.
--    fsync staging; atomic rename over atlas.sqlite; fsync parent directory.
-- 7. Only then finish the durable attempt as succeeded. Web process: read-only
--    file access + PRAGMA query_only=ON; reopen connections after each swap.
-- 8. Startup reconciles ledger 'started' attempts against publication_receipt
--    and the release set. An interrupted pre-rename attempt fails; a verified
--    completed rename can finalize its ledger receipt. Never label a swapped
--    publication failed while serving it: reconcile it or restore last good.
--    Receipt distinguishes unchanged re-import swaps without changing release.
-- 9. Migrate before app switch; use a brief 503 if a live schema change is
--    unavoidable. These notes authorize no deployment or route changes.

-- Minimum stores the ACTIVE projection plus immutable release metadata.
-- Old row versions are in the plan's full release backups/rebuild inputs, not
-- duplicated in every live table. Updates occur only in staging. Retaining a
-- row omitted by a later INCOMPLETE package is mandatory, not a DELETE signal.
-- Carry retained raw provenance forward; include inherited source checksums
-- in the effective package input set. Changed content cannot reuse a release.
-- Do not use INSERT OR REPLACE (it deletes/reinserts identities).

CREATE TABLE schema_migration (
    version INTEGER PRIMARY KEY,
    description TEXT NOT NULL
) STRICT;
INSERT INTO schema_migration VALUES (1, 'Atlas Phase 1 master draft');

CREATE TABLE dataset_lineage (
    lineage_id TEXT PRIMARY KEY CHECK (length(trim(lineage_id)) > 0),
    provenance_kind TEXT NOT NULL
        CHECK (provenance_kind IN ('country_package','latin_america_release')),
    description TEXT NOT NULL
) STRICT;

CREATE TABLE dataset_release (
    lineage_id TEXT NOT NULL REFERENCES dataset_lineage(lineage_id),
    release_id TEXT NOT NULL CHECK (length(trim(release_id)) > 0),
    fingerprint_sha256 TEXT NOT NULL
        CHECK (length(fingerprint_sha256)=64 AND fingerprint_sha256 NOT GLOB '*[^0-9a-f]*'),
    -- Canonical UTF-8 JSON object: sorted package/normalized-input checksums
    -- (including checked-in tier files), sorted applicable override checksums
    -- (explicit empty list when none), adapter, method and schema versions.
    -- Include hash/canonicalization algorithm version. Exclude attempts,
    -- wall-clock times, file mtimes, DB bytes and unrelated lineage inputs.
    -- SHA-256 and canonicalization are importer responsibilities tested in CI.
    hash_inputs_json TEXT NOT NULL
        CHECK (json_valid(hash_inputs_json) AND json_type(hash_inputs_json)='object'),
    adapter_version TEXT NOT NULL,
    method_version TEXT NOT NULL,
    schema_version TEXT NOT NULL,
    research_snapshot_label TEXT,
    upstream_release_id TEXT, -- preserves legacy citation/alias, e.g. LatAm ID
    validated_counts_json TEXT NOT NULL
        CHECK (json_valid(validated_counts_json) AND json_type(validated_counts_json)='object'),
    research_coverage_complete INTEGER NOT NULL DEFAULT 0
        CHECK (research_coverage_complete IN (0,1)),
    raw_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(raw_json)),
    PRIMARY KEY (lineage_id,release_id),
    UNIQUE (lineage_id,fingerprint_sha256)
) STRICT;
CREATE TRIGGER dataset_release_no_update BEFORE UPDATE ON dataset_release
BEGIN SELECT RAISE(ABORT,'dataset_release is immutable'); END;
CREATE TRIGGER dataset_release_no_delete BEFORE DELETE ON dataset_release
BEGIN SELECT RAISE(ABORT,'dataset_release is immutable'); END;

-- One selected release per lineage, many lineages in the same published DB.
-- The set of these pairs IS the publication; no Europe-only constraint.
CREATE TABLE publication_release (
    lineage_id TEXT PRIMARY KEY,
    release_id TEXT NOT NULL,
    UNIQUE (lineage_id,release_id),
    FOREIGN KEY (lineage_id,release_id)
        REFERENCES dataset_release(lineage_id,release_id)
        DEFERRABLE INITIALLY DEFERRED
) STRICT;

-- Operational rename receipt, not a release or public citation identifier.
-- No cross-database SQLite FK is possible to the independent attempt ledger.
CREATE TABLE publication_receipt (
    singleton INTEGER PRIMARY KEY CHECK (singleton=1),
    last_publish_attempt_id TEXT NOT NULL,
    attempted_lineage_id TEXT NOT NULL,
    attempted_release_id TEXT NOT NULL,
    CHECK (last_publish_attempt_id <> attempted_release_id),
    FOREIGN KEY (attempted_lineage_id,attempted_release_id)
        REFERENCES publication_release(lineage_id,release_id)
        DEFERRABLE INITIALLY DEFERRED
) STRICT;

-- Input identity + lossless retention of JSON sheets not yet projected into
-- typed tables (45 control observations, national poll, source score gates,
-- coverage gaps, formulas, etc.). No metric computation or competition table.
-- HTML/XLSX/ZIP remains at its recoverable locator; payload_json is NULL for
-- non-JSON input. Checksums refer to ORIGINAL bytes, not reserialized JSON.
CREATE TABLE retained_input (
    lineage_id TEXT NOT NULL,
    release_id TEXT NOT NULL,
    input_path TEXT NOT NULL,
    input_kind TEXT NOT NULL
        CHECK (input_kind IN ('package','override','tier_classification','artifact')),
    sha256 TEXT NOT NULL CHECK (length(sha256)=64 AND sha256 NOT GLOB '*[^0-9a-f]*'),
    byte_count INTEGER NOT NULL CHECK (byte_count>=0),
    recovery_locator TEXT NOT NULL,
    payload_json TEXT CHECK (payload_json IS NULL OR json_valid(payload_json)),
    PRIMARY KEY (lineage_id,release_id,input_path),
    UNIQUE (lineage_id,release_id,input_path,input_kind,sha256),
    FOREIGN KEY (lineage_id,release_id)
        REFERENCES publication_release(lineage_id,release_id)
        DEFERRABLE INITIALLY DEFERRED
) STRICT;

CREATE TABLE country (
    country_id TEXT PRIMARY KEY, -- preserve supplied country/territory slug
    country_code TEXT UNIQUE,   -- nullable; GG-ALD is allowed
    name TEXT NOT NULL,
    polity_kind TEXT NOT NULL CHECK (polity_kind IN ('sovereign_country','territory')),
    region_id TEXT NOT NULL,     -- Europe, Americas, Oceania etc.; not a tier
    coverage_status TEXT NOT NULL
        CHECK (coverage_status IN ('available','partial','screened_out','not_supplied')),
    screening_as_of_label TEXT,
    notes TEXT,
    lineage_id TEXT NOT NULL,
    release_id TEXT NOT NULL,
    raw_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(raw_json)),
    FOREIGN KEY (lineage_id,release_id)
        REFERENCES publication_release(lineage_id,release_id)
        DEFERRABLE INITIALLY DEFERRED
) STRICT;

CREATE TABLE geography (
    country_id TEXT NOT NULL REFERENCES country(country_id)
        DEFERRABLE INITIALLY DEFERRED,
    geography_id TEXT NOT NULL, -- preserve source/bridge ID; never name as PK
    name TEXT NOT NULL,
    parent_geography_id TEXT,
    effective_from_label TEXT,
    effective_to_label TEXT,
    lineage_id TEXT NOT NULL,
    release_id TEXT NOT NULL,
    raw_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(raw_json)),
    PRIMARY KEY (country_id,geography_id),
    CHECK (parent_geography_id IS NULL OR parent_geography_id <> geography_id),
    FOREIGN KEY (country_id,parent_geography_id)
        REFERENCES geography(country_id,geography_id)
        DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (lineage_id,release_id)
        REFERENCES publication_release(lineage_id,release_id)
        DEFERRABLE INITIALLY DEFERRED
) STRICT;
CREATE INDEX geography_parent ON geography(country_id,parent_geography_id);
-- geography_id identifies a sourced effective-interval version when supplied;
-- aliases/source codes and qualified effective labels remain in raw_json.
-- Unknown parents stay NULL. CI also rejects multi-node parent cycles.
-- Geometry and the proposed 46-municipality map are explicitly deferred.

-- Shared date value prevents ISO-day coercion of year/month/range/unknown.
-- date_id is a deterministic internal key including the owning namespace and
-- record/field or claim identity. It is not an invented election ID.
CREATE TABLE research_date (
    date_id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    precision TEXT NOT NULL CHECK (precision IN ('day','month','year','range','unknown')),
    certainty TEXT NOT NULL CHECK (certainty IN ('called','statutory','expected','conditional','unknown')),
    year INTEGER CHECK (year BETWEEN 1 AND 9999),
    month INTEGER CHECK (month BETWEEN 1 AND 12),
    day INTEGER CHECK (day BETWEEN 1 AND 31),
    range_start_id TEXT REFERENCES research_date(date_id) DEFERRABLE INITIALLY DEFERRED,
    range_end_id TEXT REFERENCES research_date(date_id) DEFERRABLE INITIALLY DEFERRED,
    lineage_id TEXT NOT NULL,
    release_id TEXT NOT NULL,
    raw_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(raw_json)),
    CHECK (
      (precision='unknown' AND year IS NULL AND month IS NULL AND day IS NULL
        AND range_start_id IS NULL AND range_end_id IS NULL) OR
      (precision='year' AND year IS NOT NULL AND month IS NULL AND day IS NULL
        AND range_start_id IS NULL AND range_end_id IS NULL) OR
      (precision='month' AND year IS NOT NULL AND month IS NOT NULL AND day IS NULL
        AND range_start_id IS NULL AND range_end_id IS NULL) OR
      (precision='day' AND year IS NOT NULL AND month IS NOT NULL AND day IS NOT NULL
        AND range_start_id IS NULL AND range_end_id IS NULL) OR
      (precision='range' AND year IS NULL AND month IS NULL AND day IS NULL
        AND range_start_id IS NOT NULL AND range_end_id IS NOT NULL
        AND range_start_id<>date_id AND range_end_id<>date_id)
    ),
    CHECK (precision<>'day' OR day <= CASE month
      WHEN 2 THEN CASE WHEN year%400=0 OR (year%4=0 AND year%100<>0) THEN 29 ELSE 28 END
      WHEN 4 THEN 30 WHEN 6 THEN 30 WHEN 9 THEN 30 WHEN 11 THEN 30 ELSE 31 END),
    FOREIGN KEY (lineage_id,release_id)
        REFERENCES publication_release(lineage_id,release_id)
        DEFERRABLE INITIALLY DEFERRED
) STRICT;
-- CI: range endpoints are non-range known values, ordered by their intervals.
-- Interval overlap is evaluated without changing stored precision; unknown
-- stays in a separate labelled section. No regional calendar is materialized.

CREATE TABLE office (
    id_namespace TEXT NOT NULL CHECK (length(trim(id_namespace))>0),
    office_id TEXT NOT NULL CHECK (length(trim(office_id))>0),
    country_id TEXT NOT NULL,
    geography_id TEXT NOT NULL,
    name TEXT NOT NULL,
    office_type TEXT NOT NULL, -- Mayor / Municipal council; separate from tier
    office_status TEXT NOT NULL CHECK (office_status IN ('current','historical')),
    record_state TEXT NOT NULL DEFAULT 'active'
        CHECK (record_state IN ('active','withdrawn','superseded')),
    state_note TEXT,
    registry_qualified INTEGER CHECK (registry_qualified IN (0,1)),
    next_date_id TEXT REFERENCES research_date(date_id) DEFERRABLE INITIALLY DEFERRED,
    next_date_resolution TEXT NOT NULL DEFAULT 'unknown'
        CHECK (next_date_resolution IN ('resolved','unknown','conflicting')),
    next_history_key TEXT,
    lineage_id TEXT NOT NULL,
    release_id TEXT NOT NULL,
    raw_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(raw_json)),
    PRIMARY KEY (id_namespace,office_id),
    UNIQUE (country_id,id_namespace,office_id),
    CHECK (upper(office_id) NOT GLOB 'FIX-*' AND upper(office_id) NOT GLOB 'FXT-*'),
    CHECK (record_state='active' OR (state_note IS NOT NULL AND length(trim(state_note))>0)),
    CHECK ((next_date_resolution='resolved' AND next_date_id IS NOT NULL)
        OR (next_date_resolution='unknown')
        OR (next_date_resolution='conflicting' AND next_date_id IS NULL AND next_history_key IS NULL)),
    FOREIGN KEY (country_id,geography_id) REFERENCES geography(country_id,geography_id)
        DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (id_namespace,office_id,next_history_key)
        REFERENCES election_event(id_namespace,office_id,history_key)
        DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (id_namespace,office_id)
        REFERENCES office_tier_classification(id_namespace,office_id)
        DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (lineage_id,release_id)
        REFERENCES publication_release(lineage_id,release_id)
        DEFERRABLE INITIALLY DEFERRED
) STRICT;
CREATE INDEX office_country ON office(country_id,office_status);

-- Mutual deferred FKs require exactly one classification for each office.
-- Import reviewed files; SQL NEVER looks at calendar cohort strings.
CREATE TABLE office_tier_classification (
    id_namespace TEXT NOT NULL,
    office_id TEXT NOT NULL,
    tier TEXT CHECK (tier IN ('national_context','regional','municipal','other')),
    review_status TEXT NOT NULL CHECK (review_status IN ('approved','needs_review','unknown')),
    rationale TEXT NOT NULL CHECK (length(trim(rationale))>0),
    lineage_id TEXT NOT NULL,
    release_id TEXT NOT NULL,
    classification_path TEXT NOT NULL,
    classification_kind TEXT NOT NULL DEFAULT 'tier_classification'
        CHECK (classification_kind='tier_classification'),
    classification_sha256 TEXT NOT NULL,
    raw_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(raw_json)),
    PRIMARY KEY (id_namespace,office_id),
    CHECK ((tier IS NULL AND review_status='unknown')
        OR (tier IS NOT NULL AND review_status IN ('approved','needs_review'))),
    FOREIGN KEY (id_namespace,office_id) REFERENCES office(id_namespace,office_id)
        DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (lineage_id,release_id,classification_path,classification_kind,classification_sha256)
        REFERENCES retained_input(lineage_id,release_id,input_path,input_kind,sha256)
        DEFERRABLE INITIALLY DEFERRED
) STRICT;
CREATE INDEX office_tier ON office_tier_classification(tier,review_status);
-- Interchange national -> national_context; unknown -> NULL + unknown review.
-- Do not coerce unknown to other. Preserve original review row in raw_json.
-- A known other tier may still need human review (Alderney). The old schema's
-- council label is an office-type clue, not a geographic tier; later NZ ingest
-- must use a reviewed mapping too. Phase 1 imports Albania's 122 municipal rows.

CREATE TABLE election_event (
    id_namespace TEXT NOT NULL,
    office_id TEXT NOT NULL,
    history_key TEXT NOT NULL CHECK (length(history_key)>0),
    event_id TEXT NOT NULL CHECK (length(event_id)>0), -- preserve public ID
    date_id TEXT REFERENCES research_date(date_id) DEFERRABLE INITIALLY DEFERRED,
    date_resolution TEXT NOT NULL CHECK (date_resolution IN ('resolved','unknown','conflicting')),
    event_kind TEXT NOT NULL CHECK (event_kind IN ('ordinary','special','repeated','indirect','unknown')),
    selected_history_role TEXT NOT NULL CHECK (selected_history_role IN ('selected','other','none')),
    electoral_system TEXT,
    comparability TEXT,
    ballot_basis TEXT NOT NULL CHECK (ballot_basis IN
        ('valid_votes','list_votes','candidate_marks','electors','including_blank_invalid','unknown')),
    share_unit TEXT NOT NULL CHECK (share_unit IN ('percent_0_100','proportion_0_1')),
    legal_outcome TEXT NOT NULL CHECK (legal_outcome IN
        ('unknown','not_held','certified','annulled','preliminary','disputed','superseded')),
    record_state TEXT NOT NULL DEFAULT 'active' CHECK (record_state IN ('active','withdrawn','superseded')),
    state_note TEXT,
    lineage_id TEXT NOT NULL,
    release_id TEXT NOT NULL,
    raw_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(raw_json)),
    PRIMARY KEY (id_namespace,office_id,history_key),
    UNIQUE (id_namespace,event_id),
    CHECK (upper(event_id) NOT GLOB 'FIX-*' AND upper(event_id) NOT GLOB 'FXT-*'),
    CHECK (record_state='active' OR (state_note IS NOT NULL AND length(trim(state_note))>0)),
    CHECK ((date_resolution IN ('resolved','unknown') AND date_id IS NOT NULL)
        OR (date_resolution='conflicting' AND date_id IS NULL)),
    FOREIGN KEY (id_namespace,office_id) REFERENCES office(id_namespace,office_id)
        DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (lineage_id,release_id) REFERENCES publication_release(lineage_id,release_id)
        DEFERRABLE INITIALLY DEFERRED
) STRICT;
CREATE INDEX event_date ON election_event(date_id);
-- Each event FK below carries id_namespace AND office_id AND history_key.
-- Different namespaces may legitimately reuse the same office/history strings.

CREATE TABLE proceeding (
    id_namespace TEXT NOT NULL,
    office_id TEXT NOT NULL,
    history_key TEXT NOT NULL,
    proceeding_id TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('first_round','runoff','repeat','recount','annulment','certification')),
    sequence_no INTEGER CHECK (sequence_no>=1), -- NULL when not supplied
    supersedes_id TEXT,
    legal_outcome TEXT NOT NULL CHECK (legal_outcome IN
        ('unknown','not_held','certified','annulled','preliminary','disputed','superseded')),
    lineage_id TEXT NOT NULL,
    release_id TEXT NOT NULL,
    raw_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(raw_json)),
    PRIMARY KEY (id_namespace,office_id,history_key,proceeding_id),
    UNIQUE (id_namespace,proceeding_id),
    CHECK (supersedes_id IS NULL OR supersedes_id<>proceeding_id),
    FOREIGN KEY (id_namespace,office_id,history_key)
        REFERENCES election_event(id_namespace,office_id,history_key) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (id_namespace,office_id,history_key,supersedes_id)
        REFERENCES proceeding(id_namespace,office_id,history_key,proceeding_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (lineage_id,release_id) REFERENCES publication_release(lineage_id,release_id)
        DEFERRABLE INITIALLY DEFERRED
) STRICT;
-- superseded_by is the inverse edge; do not store an inconsistent second edge.
-- CI rejects cycles. No dummy 'certification' is invented for an unverified row.

CREATE TABLE source (
    country_id TEXT NOT NULL REFERENCES country(country_id) DEFERRABLE INITIALLY DEFERRED,
    source_namespace TEXT NOT NULL,
    source_id TEXT NOT NULL, -- preserve existing country-- prefix where present
    publisher TEXT,         -- NULL when not supplied, never invented
    title TEXT,
    url TEXT,
    checked_as_of_label TEXT,
    evidence_grade TEXT,
    file_sha256 TEXT CHECK (file_sha256 IS NULL OR
        (length(file_sha256)=64 AND file_sha256 NOT GLOB '*[^0-9a-f]*')),
    locator TEXT,
    data_rights TEXT NOT NULL DEFAULT 'unknown',
    lineage_id TEXT NOT NULL,
    release_id TEXT NOT NULL,
    raw_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(raw_json)),
    PRIMARY KEY (country_id,source_namespace,source_id),
    FOREIGN KEY (lineage_id,release_id) REFERENCES publication_release(lineage_id,release_id)
        DEFERRABLE INITIALLY DEFERRED
) STRICT;

CREATE TABLE party_mapping (
    country_id TEXT NOT NULL REFERENCES country(country_id) DEFERRABLE INITIALLY DEFERRED,
    party_namespace TEXT NOT NULL,
    mapping_id TEXT NOT NULL,
    source_context TEXT NOT NULL,
    election_context TEXT NOT NULL,
    original_label TEXT,
    original_code TEXT,
    mapped_group TEXT, -- nullable; no unsupported successor/coalition equivalence
    uncertainty TEXT NOT NULL,
    lineage_id TEXT NOT NULL,
    release_id TEXT NOT NULL,
    raw_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(raw_json)),
    PRIMARY KEY (country_id,party_namespace,mapping_id),
    FOREIGN KEY (lineage_id,release_id) REFERENCES publication_release(lineage_id,release_id)
        DEFERRABLE INITIALLY DEFERRED
) STRICT;

CREATE TABLE result_row (
    id_namespace TEXT NOT NULL,
    office_id TEXT NOT NULL,
    history_key TEXT NOT NULL,
    result_row_id TEXT NOT NULL,
    proceeding_id TEXT, -- NULL: source attaches result to event without a proceeding
    country_id TEXT NOT NULL,
    candidate_or_list_label TEXT,
    original_party_label TEXT,
    original_party_code TEXT,
    party_namespace TEXT,
    party_mapping_id TEXT, -- nullable until a sourced mapping is available
    votes INTEGER CHECK (votes>=0),
    votes_status TEXT NOT NULL,
    share REAL CHECK (share>=0),
    share_status TEXT NOT NULL,
    share_unit TEXT NOT NULL CHECK (share_unit IN ('percent_0_100','proportion_0_1')),
    seats INTEGER CHECK (seats>=0),
    seats_status TEXT NOT NULL,
    elected_flag INTEGER CHECK (elected_flag IN (0,1)),
    is_substitute INTEGER CHECK (is_substitute IN (0,1)),
    evidence_status TEXT NOT NULL CHECK (evidence_status IN
        ('recorded','zero','unknown','not_applicable','structurally_unavailable','preliminary','disputed','superseded')),
    lineage_id TEXT NOT NULL,
    release_id TEXT NOT NULL,
    raw_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(raw_json)),
    PRIMARY KEY (id_namespace,office_id,history_key,result_row_id),
    UNIQUE (id_namespace,result_row_id),
    CHECK (party_mapping_id IS NULL OR party_namespace IS NOT NULL),
    CHECK (share IS NULL OR (share_unit='percent_0_100' AND share<=100)
        OR (share_unit='proportion_0_1' AND share<=1)),
    CHECK ((votes IS NULL AND votes_status IN ('unknown','not_applicable','structurally_unavailable'))
        OR (votes IS NOT NULL AND ((votes_status='zero' AND votes=0)
          OR (votes_status='recorded' AND votes>0)
          OR votes_status IN ('preliminary','disputed','superseded')))),
    CHECK ((share IS NULL AND share_status IN ('unknown','not_applicable','structurally_unavailable'))
        OR (share IS NOT NULL AND ((share_status='zero' AND share=0)
          OR (share_status='recorded' AND share>0)
          OR share_status IN ('preliminary','disputed','superseded')))),
    CHECK ((seats IS NULL AND seats_status IN ('unknown','not_applicable','structurally_unavailable'))
        OR (seats IS NOT NULL AND ((seats_status='zero' AND seats=0)
          OR (seats_status='recorded' AND seats>0)
          OR seats_status IN ('preliminary','disputed','superseded')))),
    FOREIGN KEY (country_id,id_namespace,office_id)
        REFERENCES office(country_id,id_namespace,office_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (id_namespace,office_id,history_key)
        REFERENCES election_event(id_namespace,office_id,history_key) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (id_namespace,office_id,history_key,proceeding_id)
        REFERENCES proceeding(id_namespace,office_id,history_key,proceeding_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (country_id,party_namespace,party_mapping_id)
        REFERENCES party_mapping(country_id,party_namespace,mapping_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (lineage_id,release_id) REFERENCES publication_release(lineage_id,release_id)
        DEFERRABLE INITIALLY DEFERRED
) STRICT;

-- The remaining typed locator/evidence/crosswalk tables follow below.

-- Shared, FK-checked record locator lets crosswalks and evidence reference real
-- typed rows. Each locator has exactly ONE target shape; no dangling generic
-- (entity_type, string_id) polymorphic link. record_key is a deterministic
-- encoding of its target key, NOT a replacement public ID.
CREATE TABLE record_locator (
    record_key TEXT PRIMARY KEY,
    entity_kind TEXT NOT NULL CHECK (entity_kind IN
        ('country','geography','office','event','proceeding','result_row','party_mapping','source','input')),
    country_id TEXT,
    geography_id TEXT,
    id_namespace TEXT,
    office_id TEXT,
    history_key TEXT,
    proceeding_id TEXT,
    result_row_id TEXT,
    party_namespace TEXT,
    party_mapping_id TEXT,
    source_namespace TEXT,
    source_id TEXT,
    input_path TEXT,
    lineage_id TEXT NOT NULL,
    release_id TEXT NOT NULL,
    source_row_locator TEXT,
    UNIQUE (record_key,entity_kind),
    CHECK (
      (entity_kind='country' AND country_id IS NOT NULL AND geography_id IS NULL AND id_namespace IS NULL AND office_id IS NULL AND history_key IS NULL AND proceeding_id IS NULL AND result_row_id IS NULL AND party_namespace IS NULL AND party_mapping_id IS NULL AND source_namespace IS NULL AND source_id IS NULL AND input_path IS NULL)
      OR (entity_kind='geography' AND country_id IS NOT NULL AND geography_id IS NOT NULL AND id_namespace IS NULL AND office_id IS NULL AND history_key IS NULL AND proceeding_id IS NULL AND result_row_id IS NULL AND party_namespace IS NULL AND party_mapping_id IS NULL AND source_namespace IS NULL AND source_id IS NULL AND input_path IS NULL)
      OR (entity_kind='office' AND country_id IS NOT NULL AND geography_id IS NULL AND id_namespace IS NOT NULL AND office_id IS NOT NULL AND history_key IS NULL AND proceeding_id IS NULL AND result_row_id IS NULL AND party_namespace IS NULL AND party_mapping_id IS NULL AND source_namespace IS NULL AND source_id IS NULL AND input_path IS NULL)
      OR (entity_kind='event' AND country_id IS NOT NULL AND geography_id IS NULL AND id_namespace IS NOT NULL AND office_id IS NOT NULL AND history_key IS NOT NULL AND proceeding_id IS NULL AND result_row_id IS NULL AND party_namespace IS NULL AND party_mapping_id IS NULL AND source_namespace IS NULL AND source_id IS NULL AND input_path IS NULL)
      OR (entity_kind='proceeding' AND country_id IS NOT NULL AND geography_id IS NULL AND id_namespace IS NOT NULL AND office_id IS NOT NULL AND history_key IS NOT NULL AND proceeding_id IS NOT NULL AND result_row_id IS NULL AND party_namespace IS NULL AND party_mapping_id IS NULL AND source_namespace IS NULL AND source_id IS NULL AND input_path IS NULL)
      OR (entity_kind='result_row' AND country_id IS NOT NULL AND geography_id IS NULL AND id_namespace IS NOT NULL AND office_id IS NOT NULL AND history_key IS NOT NULL AND proceeding_id IS NULL AND result_row_id IS NOT NULL AND party_namespace IS NULL AND party_mapping_id IS NULL AND source_namespace IS NULL AND source_id IS NULL AND input_path IS NULL)
      OR (entity_kind='party_mapping' AND country_id IS NOT NULL AND geography_id IS NULL AND id_namespace IS NULL AND office_id IS NULL AND history_key IS NULL AND proceeding_id IS NULL AND result_row_id IS NULL AND party_namespace IS NOT NULL AND party_mapping_id IS NOT NULL AND source_namespace IS NULL AND source_id IS NULL AND input_path IS NULL)
      OR (entity_kind='source' AND country_id IS NOT NULL AND geography_id IS NULL AND id_namespace IS NULL AND office_id IS NULL AND history_key IS NULL AND proceeding_id IS NULL AND result_row_id IS NULL AND party_namespace IS NULL AND party_mapping_id IS NULL AND source_namespace IS NOT NULL AND source_id IS NOT NULL AND input_path IS NULL)
      OR (entity_kind='input' AND country_id IS NULL AND geography_id IS NULL AND id_namespace IS NULL AND office_id IS NULL AND history_key IS NULL AND proceeding_id IS NULL AND result_row_id IS NULL AND party_namespace IS NULL AND party_mapping_id IS NULL AND source_namespace IS NULL AND source_id IS NULL AND input_path IS NOT NULL)
    ),
    FOREIGN KEY (country_id) REFERENCES country(country_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (country_id,geography_id) REFERENCES geography(country_id,geography_id)
        DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (country_id,id_namespace,office_id) REFERENCES office(country_id,id_namespace,office_id)
        DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (id_namespace,office_id,history_key)
        REFERENCES election_event(id_namespace,office_id,history_key) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (id_namespace,office_id,history_key,proceeding_id)
        REFERENCES proceeding(id_namespace,office_id,history_key,proceeding_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (id_namespace,office_id,history_key,result_row_id)
        REFERENCES result_row(id_namespace,office_id,history_key,result_row_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (country_id,party_namespace,party_mapping_id)
        REFERENCES party_mapping(country_id,party_namespace,mapping_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (country_id,source_namespace,source_id)
        REFERENCES source(country_id,source_namespace,source_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (lineage_id,release_id,input_path)
        REFERENCES retained_input(lineage_id,release_id,input_path) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (lineage_id,release_id) REFERENCES publication_release(lineage_id,release_id)
        DEFERRABLE INITIALLY DEFERRED
) STRICT;

CREATE TABLE evidence_link (
    evidence_id TEXT PRIMARY KEY,
    record_key TEXT NOT NULL REFERENCES record_locator(record_key) DEFERRABLE INITIALLY DEFERRED,
    source_country_id TEXT NOT NULL,
    source_namespace TEXT NOT NULL,
    source_id TEXT NOT NULL,
    source_locator TEXT,
    claim_kind TEXT NOT NULL, -- e.g. date, result, tier, withdrawal, override
    date_claim_id TEXT REFERENCES research_date(date_id) DEFERRABLE INITIALLY DEFERRED,
    claim_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(claim_json)),
    lineage_id TEXT NOT NULL,
    release_id TEXT NOT NULL,
    FOREIGN KEY (source_country_id,source_namespace,source_id)
        REFERENCES source(country_id,source_namespace,source_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (lineage_id,release_id) REFERENCES publication_release(lineage_id,release_id)
        DEFERRABLE INITIALLY DEFERRED
) STRICT;
CREATE INDEX evidence_target ON evidence_link(record_key);
CREATE INDEX evidence_source ON evidence_link(source_country_id,source_namespace,source_id);
-- Conflicting sourced dates remain separate evidence_link/date_claim_id rows;
-- event/office single-date pointer stays NULL while resolution='conflicting'.
-- An override records original source/date/claim/affected IDs and its input path.

CREATE TABLE unresolved_evidence (
    unresolved_id TEXT PRIMARY KEY,
    record_key TEXT NOT NULL REFERENCES record_locator(record_key) DEFERRABLE INITIALLY DEFERRED,
    original_token TEXT NOT NULL CHECK (length(trim(original_token))>0),
    source_locator TEXT NOT NULL,
    reason TEXT NOT NULL CHECK (length(trim(reason))>0),
    lineage_id TEXT NOT NULL,
    release_id TEXT NOT NULL,
    raw_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(raw_json)),
    FOREIGN KEY (lineage_id,release_id) REFERENCES publication_release(lineage_id,release_id)
        DEFERRABLE INITIALLY DEFERRED
) STRICT;
CREATE INDEX unresolved_target ON unresolved_evidence(record_key);
-- Deliberately NO source_id FK here. Unresolved tokens are preserved verbatim;
-- the importer must not manufacture publishers/URLs or convert broken known
-- source FKs into 'unresolved' just to pass validation.

CREATE TABLE identity_crosswalk (
    entity_kind TEXT NOT NULL,
    upstream_namespace TEXT NOT NULL,
    upstream_id TEXT NOT NULL,
    record_key TEXT NOT NULL,
    reason TEXT NOT NULL,
    lineage_id TEXT NOT NULL,
    release_id TEXT NOT NULL,
    raw_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(raw_json)),
    PRIMARY KEY (entity_kind,upstream_namespace,upstream_id),
    FOREIGN KEY (record_key,entity_kind) REFERENCES record_locator(record_key,entity_kind)
        DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (lineage_id,release_id) REFERENCES publication_release(lineage_id,release_id)
        DEFERRABLE INITIALLY DEFERRED
) STRICT;
CREATE INDEX crosswalk_target ON identity_crosswalk(record_key);
-- Office IDs/history keys/public event IDs remain their supplied values.
-- Scope upstream_namespace to country/source/election when IDs are reused.
-- Store deterministic mappings BEFORE any new surrogate is used. Legacy
-- release aliases use dataset_release.upstream_release_id. An ambiguous
-- bare public event ID must not silently resolve to the wrong namespace.

-- No geometry, competition/tightness tables, regional calendar materialization
-- or minimum-positive regional-count check. Schema creates ZERO office rows.
-- Regional count is an ordinary join over office + office_tier_classification;
-- restrict to current, active offices and approved classifications. For this
-- Phase 1 Albania input the required result is ZERO, not an import failure.
-- Country rows do not require office children: LatAm's 15 status-only countries
-- are representable. LatAm/NZ data loads are explicitly outside Phase 1.

-- Required importer/CI checks beyond relational constraints:
-- - semantic identity/content hashes stable on unchanged input; new attempt,
--   same lineage release; changed inputs/overrides -> new release, stable IDs;
-- - old lineages and status-only countries survive a single-lineage refresh;
-- - every active row belongs to its intended selected release, every tier
--   equals its checked-in file, no unreviewed row promoted to regional coverage;
-- - FK integrity + semantic refs in retained JSON; no fixture content anywhere;
-- - missing/zero, precision/certainty, event/result/proceeding fidelity;
-- - explicit withdrawal only, no loss from an incomplete snapshot;
-- - date/parent/supersession acyclicity and conflict withholding;
-- - poison rollback + durable audit, WAL/rename recovery, restore drill.
-- Full executable acceptance requirements are in the accompanying checklist.

PRAGMA user_version = 1;
COMMIT;
