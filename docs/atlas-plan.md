# Election Atlas — restructuring plan

**Status:** Phase 0 plan is on main. Phase 1 **scaffolding** (gitignore, `ATLAS_SQLITE_PATH` / `ATLAS_ATTEMPTS_SQLITE_PATH`, migrate/import entrypoints, Prompt B DDL) is tracked in [`docs/atlas-phase1.md`](atlas-phase1.md). Phase 0 inventory and tier files are in [`docs/phase0/`](phase0/REPORT.md) and [`schemas/atlas/tiers/`](../schemas/atlas/tiers/README.md) (Alderney `other` **approved** 2026-09-16; other Europe files remain `draft_for_human_review`). Prompt B draft DDL is in [`schemas/atlas/migrations/`](../schemas/atlas/migrations/README.md); Albania storage proof still waits on Prompt C field map/importer, human review of the Albania tier draft, and the Albania map. No `/atlas` UI or redirects.

**Phase 0** (this plan) merges when Justin says. **Phase 1 is un-gated by Justin’s disposition on this revision** — it does not wait on open-ended further audits. After Phase 1 exits, **stop for Phase 2 review**.

**Product:** Center for Digital Democracy — Election Atlas  
**Repository:** [FTFNAnalytics/digitaldemocracy](https://github.com/FTFNAnalytics/digitaldemocracy)  
**Current public research app:** Subnational Election Observatory at `/electiondatabase`  
**Target public research app:** Election Atlas at `/atlas`

This plan is the working agreement for how the observatory becomes the Atlas. It does not reopen the four product-owner decisions below. Later implementation PRs execute the phases; they do not renegotiate URL, storage, first vertical, or launch depth.

---

## Decisions (accepted)

These four decisions are locked. Do not reopen them in implementation PRs.

### 1. URL — `/atlas`

Use **`/atlas`** as the public research product path.

Retire **`/electiondatabase`**. Permanent redirects from old paths to `/atlas` equivalents ship at **cutover**, not when implementation work begins. Cutover is defined in [Redirect strategy](#redirect-strategy): destinations must already work. Until cutover, `/electiondatabase` remains the live observatory.

### 2. Storage — SQLite on the VPS as master

**SQLite on the VPS** is the master store.

- Checked-in **schemas** and **migration / import scripts** live in git.
- The **database file** lives on the server, not as a giant binary in git.
- JSON / Parquet shards are **optional export / debug artifacts** only. They are not the source of truth and are not a substitute for the master DB.

Proposed production path:

```text
/var/lib/cdd/atlas.sqlite
```

Acceptable alternative if the VPS layout keeps data next to the app (with permissions so `www-data` can read, and the import user can write):

```text
data/master/atlas.sqlite    # under the deployed app tree
```

Override with an environment variable (proposed: `ATLAS_SQLITE_PATH`) so local development, CI, and production do not share a file. Imports run via **npm scripts** that create or update that DB (see [Storage and import](#storage-and-import)).

Creating the directory or an empty file at `/var/lib/cdd/atlas.sqlite` is **path readiness only**. It is not Phase 1 complete.

### 3. First vertical — Europe

Ship **Europe** first: country packages under `data/countries/*` that are European, plus any Europe-bound uploads.

Russia remains excluded from the European build. Latin America and New Zealand are **Phase 2 / cutover-gate ingest inputs** so already-public offices and events exist in SQLite before redirects need them. That continuity is **not** an expansion of the launch vertical and must not displace Europe as the Atlas default landing.

Australia and Japan stay not-yet-supplied. See [Redirect strategy](#redirect-strategy) and [Phases](#phases).

### 4. Depth — regional first; municipal later

Ship **regional** calendars and indexes as we build. Municipal coverage arrives later as packages arrive. **Do not block launch** on full municipal coverage.

How regional coverage is counted is defined under [Regional coverage counting](#regional-coverage-counting). Do not treat workbook calendar labels such as “Regional / municipal” as proof that regional offices exist. Today’s checked-in Europe packages may have a **zero regional-tier numerator**; that is an explicit empty state, not a Phase 1 failure.

---

## Objectives

1. Give the Center a durable public **Election Atlas** at `/atlas` whose records come from a single master store, not from in-process merges of gzip shards and one-off adapters.
2. Make **Europe** the first complete-enough vertical: regional calendars, country indexes, and honest partial coverage — not a pretend continent-wide municipal register.
3. Keep the **marketing site, SEO, and existing research packages**. The Atlas is a product-area restructure, not a site rewrite.
4. Preserve research semantics already encoded in schema v1 (missing ≠ zero, date certainty, score gates, sourced IDs). Atlas storage changes the **runtime**, not the **rules**.
5. Leave a clean ingest path from frozen country packages and the Latin America release into SQLite, so later packages drop in without inventing a second identity system.
6. At **cutover**, one data plane: every surviving research page reads the **published master** (same publication / release set). Existing public links (including non-European office/event URLs) reach the same record or a clear record page — without expanding the Europe-first launch vertical.
7. Compute **derived tightness metrics only after** a successful master load (Phase 4). Do not bake tightness into package adapters or chase-tool exports.

---

## What we keep vs change

### Keep

| Asset | Why it stays |
| --- | --- |
| Marketing homepage and in-page IA (`/`, About, Research, Initiatives, Events, Connect) | Separate product surface. Prototype forms stay prototype forms. |
| Existing SEO (canonicals, sitemap, OG images, JSON-LD) | Retarget paths to `/atlas` at cutover, together with redirects; do not discard the SEO work from PR #5. |
| Research packages as **ingest inputs** | `data/research` (Latin America release), `data/countries/*` (Europe extracts, Armenia packed payload, NZ batch), `data/incoming/` zips. Frozen bytes stay frozen. |
| Schema v1 research semantics | `schemas/v1/normalized.ts`, field mapping, data dictionary, score gates, date precision, missing-vs-zero. |
| Source-backed correction workflow | Git reviews, `data/overrides/`, research-correction issue template. No admin UI in early Atlas phases. |
| Working PR #10 bridge adapters until a replacement is proven | Do not rip them out early. See [What waits](#what-waits). |
| Standalone Next.js deploy on the VPS | `output: "standalone"`, `npm start`. Atlas adds a SQLite file beside the app; it does not require a hosted database service. |
| Tests, lint, and `npm run build` | Must keep passing. Fixtures stay labelled fixtures. |
| Original implementation brief | `docs/implementation-brief.md` remains historical. This Atlas plan supersedes it for **product shape and storage**, not for research ethics. |

### Change

| Asset | What changes |
| --- | --- |
| Public base path | `/electiondatabase` → `/atlas`, with redirects **at cutover** (destinations already work; one data plane). |
| Master store | In-memory gzip + country-package merge → SQLite master on the VPS. |
| Default vertical | Observatory home today highlights South America. Atlas **landing** highlights **Europe**. Already-public non-European records remain reachable. |
| Query path | `lib/observatory/load.ts` process cache of JSON.gz → queries against SQLite (read-only in the web process). After cutover, leftover `/electiondatabase` pages (if any) read the same published master. |
| Country-package adapters (PR #10) | **Temporary bridges** into the master. Keep them working until a replacement ingest is proven. See [PR #10 adapters](#pr-10-adapters-temporary-bridges). |
| Generated JSON in `public/data` | Optional debug/export only; not how the Atlas reads production data. |
| Launch depth | Regional calendars/indexes ship as packages exist. Municipal completeness is not a launch gate. |
| Derived tightness | New Phase 4 work **after** master load. Not part of current adapters. |

### Do not treat as deleted

Latin America research, New Zealand packages, observatory routes, and PR #10 adapter code remain until an implementation PR replaces them **after** continuity is proven. This documentation PR does not remove `/electiondatabase` or rewrite loaders.

---

## Master entities

Canonical records live in SQLite. Identifiers stay stable and namespaced. Names are not primary keys. Unknown upstream fields survive in an extensions/raw payload.

These entities are the Atlas master — a persistence design for the conceptual model already in schema v1, plus Atlas-specific ingest metadata. Implementation PRs check in DDL and TypeScript types **after** the identity rules below are used to review that DDL. This plan does not contain schema code.

### Immutable dataset release vs ingest attempt

Split these. Do not use one row for both.

| Entity | Identity | Role |
| --- | --- | --- |
| **Dataset release** (immutable) | `release_id` | A **published** snapshot of **one source-dataset lineage** (see below). Created only after an ingest attempt of that lineage validates. Never mutated in place. Failed loads do not mint a release. |
| **Ingest attempt / run** (audit) | `attempt_id` | Operational record: started/succeeded/failed, operator/script, input paths and checksums, row counts, error text, timestamps, pointer to the lineage `release_id` on success. Failed attempts are **audit trail only**. An unchanged re-import still creates a **new attempt** and must keep the **same** `release_id`. |
| **Publication** (the swapped DB file) | The **set of `release_id`s** contained in the published master | What the site is serving right now. Atomic rename replaces the whole publication. Pages cite the lineage `release_id` of the record, not “whatever attempt last swapped the file.” |

Public record pages cite that record’s lineage `release_id`. Operators debug with `attempt_id`. The `/atlas/releases` index lists published lineage releases (and may show the current publication set), never failed attempts.

#### `release_id` hash inputs and lineage

Prefer **per source-dataset lineage**, not one global hash of the whole VPS file.

Examples of lineages: the Latin America zip derivative (`latin-america-fe5e91689def` today), each European country package (or a declared Europe-extract lineage), the New Zealand batch.

`release_id` is content-derived from, and only from:

1. The lineage’s package / normalized input checksums
2. Applicable files under `data/overrides/` for that lineage
3. Adapter, method, and schema **versions** used to load it

Do **not** fold unrelated lineages into the hash. Re-importing Albania with unchanged Albania bytes, overrides, and adapter/schema versions yields a new `attempt_id` and the **same** Albania `release_id`, even if Latin America already sits in the same SQLite file.

#### How a Latin America office cites `release_id` after a Europe re-import

A Brazil (or other LatAm) office page cites the **Latin America lineage** `release_id` (today `latin-america-fe5e91689def` until that lineage’s hash inputs change). A later successful Europe ingest:

- writes a new Europe `attempt_id`
- changes the Europe lineage `release_id` only if Europe packages, Europe overrides, or Europe adapter/method/schema versions changed
- atomically publishes a new **publication set** that still includes the unchanged LatAm `release_id`

The LatAm office citation does not jump to the Europe `release_id` and does not change because the file was swapped. Cite-this-record blocks show organization, page title, **lineage `release_id` / snapshot**, URL, and sources.

### Other master entities

| Entity | Identity | Role |
| --- | --- | --- |
| **Region** | `region_id` (`europe`, `south-america`, …) | Availability: available / partial / screened_out / not_supplied / fixture_only. Europe is the Atlas **default landing**. |
| **Country / territory** | stable slug (`country_id`) | Sovereign vs territory stay separate. Screening carries an as-of date. Russia is out of the Europe build. |
| **Geographic unit** | `geography_id` | Parent geography, aliases, source codes, effective dates. Geometry only when sourced. |
| **Office** | `(id_namespace, office_id)` e.g. `AL-01-M` | Tier/type, current vs historical, registry qualification. `current` ≠ current tenure. |
| **Election event / contest** | `(id_namespace, office_id, history_key)` plus `event_id` | Date with precision and certainty, event kind, selected-history role, ballot basis, legal outcome. **Office namespace is part of the event key and every event FK.** |
| **Proceeding / result version** | `proceeding_id` | Round, recount, annulment, certification, supersession. FKs carry the same office namespace as the parent event. |
| **Result row** | `result_row_id` | Candidate/list, party namespace, votes/shares, seats, evidence. Missing ≠ zero. |
| **Party / group mapping** | `party_mapping_id` | Original label/code scoped by country/source/election; mapped group with uncertainty. |
| **Officeholder observation** | `officeholder_id` | Dated roster/term; never automatically current tenure. |
| **Electoral register observation** | `register_id` | Dated elector counts. Not a person. Do not sum overlapping office types. |
| **Poll observation** | `poll_id` | National vs local; local polls attach only to a named office. |
| **Imported metric observation** | `metric_id` | Competition index and grouped Pedersen as **imported** (with `score_gate`, review status). Not tightness. |
| **Derived tightness observation** | `tightness_id` | **Phase 4 only.** Written after master load from eligible events; never invented during ingest. |
| **Evidence / source** | `source_id` when resolved | Publisher, title, URL, hash/locator, data rights (unknown unless supplied). |
| **Unresolved evidence token** | explicit token, not an FK | Source references that do not match a catalogue row. See [Unresolved evidence](#unresolved-evidence). |
| **Research issue / coverage gap** | `issue_id` | Category, resolution state, required evidence. Aligns with chase-tool work items. |
| **Completion / chase item** | `chase_item_id` when supplied | Office- or country-level remaining work. Maps to the existing completion queue. |
| **Briefing / artifact** | `artifact_id` | Path, checksum, availability. Original binaries stay off git. |
| **Identity crosswalk** | `(id_namespace, source_id, atlas_id)` | Required before new Atlas keys are minted. See [Identity scope, uniqueness, and crosswalk](#identity-scope-uniqueness-and-crosswalk). |
| **Office tier classification** | per-country checked-in file | Authoritative `GovernmentTier` mapping for that package. See [Regional coverage counting](#regional-coverage-counting). |
| **Calendar cohort / index projection** | derived view or table | Regional calendars and country indexes. Rebuilt from master, not hand-edited. |

Preserve existing `offices[].id`, `histories[]._key`, source IDs, and package office IDs.

### Identity scope, uniqueness, and crosswalk

Approve DDL only if it implements these rules. Random IDs on each import are forbidden.

| Entity | Scope of uniqueness | Crosswalk / preservation |
| --- | --- | --- |
| Dataset release | Unique among published releases **within a lineage**. `release_id` hashes that lineage’s packages + `data/overrides/` + adapter/method/schema versions. | Map to today’s observatory `release.id` (e.g. `latin-america-fe5e91689def`) and to package archive checksums. |
| Ingest attempt | Global. `attempt_id` is unique, never reused, never equal to a `release_id`. | FK to the lineage `release_id` on success; null on failure. Unchanged re-import → new attempt, same `release_id`. |
| Publication | The published file is identified by its **set of lineage `release_id`s**. | LatAm pages keep citing the LatAm member of that set after a Europe-only re-import. |
| Region | Global `region_id`. | Stable strings already used in schema v1. |
| Country / territory | Global `country_id` (slug). `country_code` unique where present; compound codes allowed (`GG-ALD`). | Package folder slug, `manifest.country` / `country_code`, observatory `countries[].id`. |
| Geographic unit | Unique within `country_id` for a given effective interval. | Source codes and aliases; parent FK. Names are not keys. |
| Office | Unique as `(id_namespace, office_id)`. Default namespace is the upstream observatory/package office ID space. | **Preserve** `AL-01-M`, `AD-M-05`, `GG-ALD-STATES`, Latin America office IDs, NZ race IDs. If an Atlas surrogate is ever required, mint a deterministic namespaced key and **store the crosswalk before use**. |
| Event | Unique as `(id_namespace, office_id, history_key)`. `event_id` unique within the dataset. **Every event FK includes `id_namespace` (or a surrogate that embeds it).** | Preserve `histories[]._key` and today’s event IDs so old `/elections/:id` links resolve. Do not key events on bare `office_id` alone. |
| Proceeding | Unique per namespaced event + proceeding kind/sequence. | Supersession points at the surviving proceeding; withdrawn/annulled rows remain addressable. |
| Result row | Unique per proceeding/event + source row identity. | Missing ≠ zero; do not reuse a result_row_id for a different candidate. |
| Party mapping | Scoped by country + source + election context. The same code in two namespaces is two mappings. | Do not equate successor movements without evidence. |
| Source | Country-namespaced when resolved. Preserve original source ID after the existing `country--` prefix where that contract already applies. | Unresolved tokens are **not** source FKs. |
| Artifact / briefing | Checksum + original path. | Byte identity, not filename guess. |

Additional rules:

- Names, labels, and slugs used for display are not primary keys.
- Repeat import of the same lineage hash inputs yields the same identities, research dates, and `release_id`. Operational timestamps on the **attempt** may change.
- Absence of a row in a later **incomplete** package is not a delete (see [Conflict display and correction precedence](#conflict-display-and-correction-precedence)).
- Fixtures (`FIX-*` / `FXT-*`) stay in a fixture namespace and never enter a published release.

### Unresolved evidence

A source token that does not match a catalogue row is **explicit unresolved evidence**:

- Store it as an unresolved-evidence record (original token, country/office/event locator, why unresolved).
- Do **not** insert a dangling `source_id` FK.
- Do **not** fabricate a URL or publisher to make the FK succeed.
- Display copy states that the reference is unresolved. Validation may **warn**; it must not “fix” the token.

Broken FKs to offices, events, geographies, or **resolved** sources still fail closed (see acceptance checks). Unresolved evidence is a different state, not a broken reference.

---

## Storage and import

### Where the DB lives

| Environment | Path | Notes |
| --- | --- | --- |
| Production VPS (preferred) | `/var/lib/cdd/atlas.sqlite` | Directory owned for the import user; file mode so `www-data` can **read**. The Next.js process does not need write. |
| Production VPS (app-local) | `data/master/atlas.sqlite` under the deployed app | Same permission model if `/var/lib/cdd` is unavailable. |
| Local / CI | `data/master/atlas.sqlite` (gitignored) or a temp path | Created by npm scripts. Never commit the DB file. |
| Override | `ATLAS_SQLITE_PATH` | Single explicit path for import, migrate, and app read. |

**Path readiness vs Phase 1.** mkdir/`chown` of `/var/lib/cdd` (or touching an empty `atlas.sqlite`) only proves the VPS path and permissions. It is **not** a Phase 1 exit. Phase 1 exits only when the [Phase 1 checklist](#phase-1--albania-storage-proof-no-route-changes) is done, including Albania import proof and named CI tests.

Git contains:

- SQL migrations / DDL (versioned)
- import adapters and npm script entrypoints
- schema/types that describe master tables
- per-country tier-classification files
- checksums and release manifests

Git does **not** contain `.sqlite`, Parquet dumps, or the Latin America zip. Optional JSON/Parquet exports may be written under a gitignored `data/exports/` (or similar) for debug.

**Reproducibility.** The published master must be **rebuildable from git + checksummed off-git inputs** (Latin America zip, Europe archive when a package still needs it). VPS backups are for **speed** of restore, not the sole recovery path.

### How imports run

Imports **produce or update** the master DB through npm scripts. Proposed commands (names can be bikeshed in the implementing PR; the contract cannot):

```bash
# apply checked-in migrations to ATLAS_SQLITE_PATH
npm run migrate:atlas

# ingest recognized inputs into the master SQLite file
npm run import:atlas

# validate master + remaining package/release checks
npm run validate:data
```

Until those scripts exist, today’s commands remain:

- `npm run import:data` — Latin America zip → `data/research`
- `npm run import:countries` — inventory `data/countries/*` (PR #10)

The implementing PR should wire those existing importers as **bridges**: they read the same inputs and **upsert the SQLite master**, instead of (or in addition to) merging in memory. Bridges must use the checked-in [tier-classification files](#regional-coverage-counting), not calendar cohort strings.

### Atomic publication (one protocol)

A failed import must leave the **last validated published data** visible. Use this protocol; do not invent a second one.

1. **Serialize.** One writer (lockfile or equivalent). Concurrent `import:atlas` / `migrate:atlas` is an error.
2. **Durable attempt row first.** Append `attempt_id` = started to an attempt log that **does not live only inside the staging file** (sibling log DB/file on the same filesystem, or a table in the published DB that staging never replaces wholesale). Staging rollback must not erase the attempt.
3. **Stage on the same filesystem** as the published file (`atlas.sqlite.staging` next to `atlas.sqlite`, or equivalent). Do not stage on a different mount if rename would copy.
4. Load into staging. Validate (identities, namespaced FKs, missing-vs-zero, date precision, score gates, fixture exclusion, unresolved-evidence tokens).
5. On **failure:** leave published file untouched; mark attempt failed; return non-zero. Site keeps serving the previous publication.
6. On **success:**
   - Copy an **off-VPS recoverable backup** of the current published file (if any) **before** production publication. Also keep on-VPS copies: **last N** plus **one per lineage `release_id`** in the publication set.
   - **WAL checkpoint** the staging DB so the file to rename is a consistent main database, not an uncheckpointed WAL pair.
   - Ensure **release metadata is inside the file being published** (lineage `release_id`s, checksums, schema version) so it is visible atomically with the data.
   - `fsync` staging; **atomic rename** onto `atlas.sqlite`; `fsync` the directory.
   - Mark attempt succeeded with the lineage `release_id`(s) published.
7. Readers are read-only (`query_only`). After rename, reopen connections so the app does not keep a deleted inode.

Never mint a `release_id` for a failed attempt. Unchanged successful re-import: new attempt, same lineage `release_id`, new publication swap (content-identical for that lineage).

**Startup reconciliation.** If a previous publish was interrupted (staging present, rename incomplete, WAL leftover, or attempt = started with no terminal status), the app/importer on start must recover to the last good published file (or refuse to serve research) and mark the attempt failed or resume only from a documented safe point. Do not serve a half-renamed master.

**Migrate-then-deploy.** Apply migrations that the new app requires **before** switching the web process to that app version. If a live migrate of the published file is unavoidable, take an explicit brief **503** (or equivalent) rather than letting mixed schema/app versions serve pages.

**SQLite journaling.** WAL on staging and published as needed so `www-data` can read the published file while the importer writes staging. The web process must not have write permission.

Optional JSON/Parquet dumps are written **after** successful publication, never as the write-ahead path.

### Conflict display and correction precedence

Short rule set — apply in this order:

1. **Package / immutable source wins** for a given field unless a documented editorial override exists under `data/overrides/` with provenance (source, date, claim, affected IDs).
2. **Never infer deletion** from an incomplete package. A package that omits an office, event, or source that a previous validated release still carries does not delete that record. Removal requires an explicit withdrawal (below).
3. **If neither rule selects a single value** (two sourced claims, no override): **retain both with sources** and **withhold** any single resolved calendar date or metric value. Do not average, pick newest, or let the website invent a winner.
4. Overrides never rewrite frozen extract bytes. They apply at ingest into the master and remain reviewable in git.

### Withdrawal and supersession

- **Withdrawal** of a published record is explicit: a sourced withdrawal/supersession row (who, when, why, replacement ID if any). Silence is not withdrawal.
- **Supersession** of results uses the existing proceeding model (recount, annulment, certification). Annulled and superseded evidence remains addressable; it is not a second election and is not deleted.
- Withdrawn or superseded offices/events keep their IDs so old URLs still resolve to a record page that states the status.
- A **corrected** re-import (hash inputs changed) is a new ingest attempt that publishes a **new** lineage `release_id`. An **unchanged** re-import is a new attempt with the **same** `release_id`.

### Where off-git inputs can be recovered

| Input | In git? | Recovery |
| --- | --- | --- |
| Latin America zip `Latin_America_Races_and_Briefings.zip` | No | SHA-256 `fe5e91689def5b3e6824c761b5ffb8fb2118847b9f3e0811fb76ba093453b23f` in `data/research/manifest.json`. Restore from `data/incoming/` or the configured artifact host (`ELECTION_ARTIFACT_BASE_URL`). Normalized `data/research/*.json.gz` is the current committed derivative. |
| Europe archive `Europe_Excluding_Russia_Election_Data_2026-09-15.zip` | No | SHA-256 `93a31ec920c770e752cf7f130ffb8a546dce4510a41d9371d5f49239fa2b4ce9` on country-package manifests. Country folders in git are extracts, not the zip. |
| Europe workbook `Europe_Excluding_Russia.xlsx` | No | SHA-256 `b11dab577fb1746eddeb3aef72af7b097bcc4601828e1efbca1db3d6f6b98665` on extract manifests. |
| Armenia packed payload | Chunks in git | Reassemble via `manifest.chunks`; `payload_sha256` `f55265273c849d248baf0037e4149e17a0329318d21a794e966cebbaa32012ca`. Companion XLSX lives inside the tarball, not as a public artifact host. |
| New Zealand `dataset.json` | Yes | File hash `6d73c7075fc04be9cec3fdda37810e5195748c77e25df2e62998e2d4721d2133` (SHA-256 of the committed file as of this plan revision). |
| SQLite master / backups | No | Rebuild from git + checksummed off-git inputs. On-VPS: last N + one per lineage `release_id`. Off-VPS copy required before production publication. Optional post-publish JSON/Parquet is debug. |
| Synthetic fixtures | Tests only | Must not be used to recover production. |

### PR #10 adapters (temporary bridges)

[PR #10](https://github.com/FTFNAnalytics/digitaldemocracy/pull/10) added Europe / Armenia / New Zealand adapters that map standalone packages into schema v1 at load time. That is the correct **short-term** way to show country folders on the current observatory.

For the Atlas they are **temporary bridges into the master**:

- Keep using them so frozen packages (`site_ingestion_status: pending_adapter`) do not need byte-level rewrites.
- Point their output at SQLite upserts rather than a long-term in-process merge.
- **Ban calendar cohort strings as tier classifiers** in bridges; use the checked-in per-country tier file.
- Do **not** replace working bridges early. Replacement is a later PR after a bounded SQLite ingest is proven.
- Do not treat adapter-in-memory merge as the architecture to extend for municipal coverage or tightness.

---

## Redirect strategy

### Implementation vs cutover

These are different events:

| Event | What it is | Redirects? |
| --- | --- | --- |
| **Implementation starts** | Schema, Albania storage proof, `/atlas` shell, Phase 2 continuity ingest. `/electiondatabase` stays live. | **No.** |
| **Cutover** | Destinations already work; named cutover-gate inputs are in SQLite; one data plane; [cutover checklist](#cutover-gate) signed with evidence. | **Yes**, together with SEO. |

Do not flip `/electiondatabase` redirects when `/atlas` is only a Europe landing page that 404s offices. Do not treat “we started Atlas work” as cutover.

### One data plane (partial cutover)

After cutover there is **one published master** (one publication set). Rules:

- Any `/electiondatabase` route that **survives** cutover (not yet redirected) must **read that published master**, not leftover gzip shards or an in-memory package merge from a different load.
- Prefer redirecting a surface once its `/atlas` destination works. **Explorer is a cutover requirement** (so it is not left on a second data plane). Advanced compare/polling still wait unless a harvested old URL requires a compatibility view.
- Redirects still fire **only** when the destination works.
- Office and event URLs **never** redirect to Atlas home.

### What may redirect, and where

Permanent redirects (HTTP 308 or Next.js `permanent: true`) at cutover. **Preserve query strings** (`?region=europe`, compare office IDs, explorer filters) where the destination still understands them.

**Do not** redirect office/event URLs — or already-public non-European observatory URLs — to Atlas home.

| Old path | Cutover destination | Canonical after cutover | Query params |
| --- | --- | --- | --- |
| `/electiondatabase` | `/atlas` | `/atlas` | n/a (Europe landing) |
| `/electiondatabase/regions` | `/atlas/regions` | `/atlas/regions` | preserve if used |
| `/electiondatabase/countries/:id` | `/atlas/countries/:id` | `/atlas/countries/:id` | preserve |
| `/electiondatabase/explorer` | `/atlas/explorer` (**required** at cutover) | `/atlas/explorer` | preserve `q`, `region`, filters |
| `/electiondatabase/offices/:id` | `/atlas/offices/:id` | `/atlas/offices/:id` | never `/atlas` home |
| `/electiondatabase/offices/:id/original` | `/atlas/offices/:id/original` | `/atlas/offices/:id/original` | n/a |
| `/electiondatabase/elections/:id` | `/atlas/elections/:id` | `/atlas/elections/:id` | never `/atlas` home |
| `/electiondatabase/compare` | `/atlas/compare` only if required by harvested URLs or a shipped compatibility view; else **do not redirect to home** — keep old path on the **master** or omit redirect until the surface exists | matching canonical when shipped | preserve office IDs |
| `/electiondatabase/calendar` | `/atlas/calendar` | `/atlas/calendar` | preserve month/filters; uncertain dates stay labelled |
| `/electiondatabase/polling` | same rule as compare (advanced polling waits) | when shipped | do not dump to home |
| `/electiondatabase/coverage` | `/atlas/coverage` | `/atlas/coverage` | preserve |
| `/electiondatabase/sources` | `/atlas/sources` if present; else leftover reads **master** | when shipped | preserve |
| `/electiondatabase/downloads` | `/atlas/downloads` if present; else leftover reads **master** | when shipped | preserve |
| `/electiondatabase/methodology` | `/atlas/methodology` | `/atlas/methodology` | n/a |
| `/electiondatabase/releases` | `/atlas/releases` | `/atlas/releases` | published lineage releases only |
| `/electiondatabase/about` | `/atlas/about` | `/atlas/about` | n/a |
| `/electiondatabase/artifacts/:id` | `/atlas/artifacts/:id` | `/atlas/artifacts/:id` | same artifact |

Unknown slugs still 404 (as today). Marketing homepage is never the fallback for a research URL.

The cutover PR checks this table in a [checked-in checklist](#cutover-gate) with evidence links (not a verbal “looks fine”).

### Minimal record-detail / compatibility views

Bring these **forward** (Phase 2) so cutover is possible without waiting for full Phase 3 surfaces:

- Office detail sufficient to identify the office, geography, tier, next-election date **with certainty/precision intact**, selected histories, and status (including withdrawn/superseded).
- Event detail sufficient to identify the contest, date uncertainty, legal outcome, and result rows (missing ≠ zero).
- Original briefing route where a briefing already exists.
- Country index pages for **already-public** countries, including non-European ones, even though Europe is the default landing.
- Explorer reading the published master.
- Coverage labels that do not pretend municipal or non-European completeness, and that state an **empty regional numerator** when that is the fact.

These views plus **Phase 2 ingest of Latin America and New Zealand** (named cutover-gate inputs) are how already-public offices/events exist in SQLite **before** redirects need them. They are **not** a decision to make Latin America or Oceania the launch vertical.

SEO follow-through in the **same cutover change** as redirects: canonical URLs, sitemap, robots, Open Graph, and JSON-LD `url` / `urlTemplate` move to `/atlas`. Marketing nav labels may say “Election Atlas” while keeping the rest of the homepage copy.

Do **not** add these redirects in this documentation PR.

---

## Phases

Implementation PRs should land in this order. Each phase must leave `npm run build` green and must not invent election results. Phases 1–2 can proceed on the VPS and in git **without** retiring `/electiondatabase`. Redirects wait for cutover.

See [Immediate build order](#immediate-build-order).

### Phase 0 — Amend this plan (this PR)

- Record accepted decisions (URL, SQLite, Europe, regional depth).
- Inventory actual ingest inputs; define regional coverage counting, identity rules, atomic publication, one data plane, and cutover.
- **Exit:** Justin says merge. Site still serves `/electiondatabase`. No schema or Atlas UI in this PR.

### Phase 1 — Albania storage proof (no route changes)

Separate **European storage proof** from **regional calendar proof**. Phase 1 is storage + identity + publication protocol. It is **not** a regional-calendar launch and is **not** failed if Albania’s regional numerator is zero.

Named bounded proof: **Albania** only (not a grab-bag of Europe; **Armenia is last** among early European targets and is not Phase 1).

Phase 1 PR contents:

- No public route changes
- `.gitignore` for `*.sqlite` / `data/master/`
- `ATLAS_SQLITE_PATH`
- `migrate:atlas` / `import:atlas` entrypoints
- DDL reviewed against the identity table (lineage `release_id` vs `attempt_id`, namespaced office/event keys, unresolved evidence, publication set)
- Albania **tier-classification file** (checked in; DDL-like review)
- Albania import proof into SQLite (atomic publish, failed-import rollback, unchanged re-import → new attempt / same `release_id`)
- Named ingest acceptance rows as **required automated CI tests**
- VPS path readiness allowed as ops hygiene — **not** an exit

**Exit:** CI green on those tests; Albania lineage published in a local/CI DB rebuildable from git + checksums. Then **stop for Phase 2 review**. Empty `/var/lib/cdd/atlas.sqlite` is not an exit.

Keep `/electiondatabase` on the current loaders. **No public redirects. No tightness.**

### Phase 2 — Continuity ingest + `/atlas` shell (still not cutover)

**Named cutover-gate inputs (ingest in this phase, before redirects):** Latin America release, New Zealand package, and remaining early European packages as reviewed (Andorra, Alderney, …; **Armenia last** among those early targets). Europe remains the Atlas **default landing**. Continuity ingest ≠ expanding launch scope.

**Minimum-content floor** for the SQLite-backed `/atlas` shell:

| Surface | Floor |
| --- | --- |
| Landing | Europe default; honest partial coverage |
| Country indexes | Every country in the publication set that is already public today |
| Regional calendar | Projected from `tier = regional` only; **explicit empty state** if the European numerator is zero (expected with today’s packages) |
| Coverage labels | Regional counting rules; no PR-count KPIs |
| Office / event / original briefing | Minimal compatibility views for **all already-public IDs** (LatAm + NZ + Europe in SQLite) |
| Explorer | Required (one data plane / cutover) |

Regional **calendar proof** lives here, not in Phase 1. A zero regional-tier numerator is a labelled empty calendar, not a blocker.

`/electiondatabase` remains canonical until the cutover gate passes. Leftover observatory pages that still run in this phase should be moving onto the master; they must not mix gzip-only reads with Atlas SQLite reads for the same records.

**Exit:** Named cutover-gate inputs are in the published master; `/atlas` meets the floor; already-public office/event IDs resolve on `/atlas` **before** redirects flip.

### Cutover gate (after Phase 2 destinations work)

Not a new research-scope phase. The release allowed to retire `/electiondatabase`.

Redirects + SEO ship **together** only after the [checked-in cutover checklist](#cutover-checklist) has evidence links. Ingest-style rows that can be automated stay in CI; **cutover rows are a checklist with evidence**, not a vibe pass.

### Phase 3 — Expanded Atlas surfaces and **new packages only**

- Fuller coverage, sources, downloads, methodology, and remaining product surfaces reading SQLite.
- Ingest **new** packages only (later Europe uploads, municipal packages as they arrive, any newly supplied Australia/Japan, new overrides). Do **not** describe Latin America or New Zealand as Phase 3 ingest — they are Phase 2 / cutover-gate inputs.
- Municipal completeness still does not block launch.
- Retire in-memory gzip merge as the primary query path once Atlas reads and cutover are proven.
- Advanced compare/polling wait unless already required for a harvested old-link destination.
- **Exit:** One master, one public path after cutover, existing research still cited with original IDs and lineage `release_id`s; coverage remains partial where research is partial.

### Phase 4 — Derived tightness metrics (after master load)

- Compute tightness **only after** a successful master load, from eligible events already in SQLite.
- Store tightness as derived observations with method version, inputs, and eligibility/withholding reasons.
- Do not backfill tightness inside country-package adapters or chase-tool dumps.
- Optional export of tightness tables as JSON/Parquet debug artifacts.
- Keep imported CI / Pedersen distinct: those remain source-gated metrics, not substitutes for tightness.
- **Exit:** Tightness visible only where eligibility is documented; null stays null; no tightness claim on incomplete municipal series.

---

## Immediate build order

**Phase 0:** Amend plan (this PR) → merge when Justin says.

**Phase 1:** Un-gated by Justin’s disposition on this revision. No route changes; `.gitignore` sqlite; `ATLAS_SQLITE_PATH`; migrate/import entrypoints; DDL vs identity table; Albania tier file; Albania import proof; named CI tests; VPS path readiness ≠ exit.

**Then stop for Phase 2 review.**

Phase 2 (after that review): LatAm + NZ + remaining early Europe ingest; `/atlas` shell at the minimum-content floor; regional calendar proof (including empty numerator); explorer on the master.

Then cutover checklist → redirects + SEO together.

---

## What waits

Not launch blockers; not part of Phase 1:

- Full municipal coverage for Europe or anywhere else.
- Expanded non-European research as **launch scope** (Latin America and NZ are Phase 2 continuity ingest / cutover-gate inputs, not the default vertical).
- Advanced compare and polling products beyond what old-link continuity requires.
- Replacing working PR #10 bridge adapters early.
- Derived tightness (Phase 4).

---

## Chase-tool alignment

The chase tool is the research-operations surface for collecting dates, sources, and remaining work. The Atlas is the public publication of what has already been chased and packaged. They must share identities; they must not become two competing masters.

| Topic | Alignment |
| --- | --- |
| **Direction of data** | Chase tool → packages / uploads → Atlas import scripts → SQLite master. Atlas does not become the place researchers first record a date. |
| **Identities** | Office IDs, country slugs, history keys, and source IDs used in chase exports must round-trip, **including office namespace on event keys**. If the chase tool supplies a `chase_item_id`, store it on the completion/issue row. |
| **Calendars** | Regional calendars are projections of chased dates. Do not “confirm” a date the chase tool left uncertain. Use interval-overlap filtering and a separate unknown-date section ([Regional coverage counting](#regional-coverage-counting)). |
| **Coverage queue** | Atlas `coverage` / issues map to chase remaining-work items. Closing a gap happens in research + git/package update, then re-import — not by editing SQLite by hand on the VPS. |
| **Conflicts** | Package wins unless documented override; incomplete package ≠ deletion; if neither selects, retain both and withhold a single resolved calendar/metric value. |
| **Europe first** | Chase and ingest prioritize European regional calendars and indexes. Municipal chase items may exist in packages; Atlas will show them when present and will not wait for a full municipal chase. |
| **Adapters** | PR #10 adapters may translate chase/package tables into master rows. They are bridges, not a second chase UI, and are not replaced early. |
| **Tightness** | Not a chase-tool field. Chase captures evidence and eligibility; Atlas **derives** tightness in Phase 4 after load. |
| **Exports** | Optional JSON/Parquet shards may be fed back to chase-tool for diffing, but SQLite remains authoritative for the site. |
| **Non-replacement** | Early Atlas phases do not ship an authenticated chase/admin console. Source-backed corrections stay on GitHub. |

---

## Success metrics

Software success is not research completeness. Research coverage remains partial until a reconciled import says otherwise.

### Product targets

| Metric | Target |
| --- | --- |
| Public path | After cutover, `/atlas` is canonical; `/electiondatabase` redirects per the table. Before cutover, `/electiondatabase` remains live. |
| One data plane | After cutover, every surviving research page reads the published master (same publication set). |
| Master store | Production reads `/var/lib/cdd/atlas.sqlite` (or the app-local equivalent). No SQLite binary in git. Path existence alone is not success. Rebuildable from git + checksummed off-git inputs. |
| Ingest | `npm` import scripts create/update that DB from checked-in schemas. Phase 1 = Albania storage proof; Phase 2 = named cutover-gate inputs (LatAm, NZ, remaining early Europe). |
| First vertical | Europe is the Atlas default landing; Russia excluded; coverage labelled using [Regional coverage counting](#regional-coverage-counting). |
| Depth | Regional calendars and indexes are usable at launch, including an honest **empty** regional numerator. Municipal completeness is **not** a launch criterion. |
| Continuity | Marketing site still ships. Already-public office/event URLs keep reaching the same record (or a clear record page), including non-European IDs. |
| Tightness | Absent until Phase 4; then only from master-loaded eligible events. |
| Quality bar | `npm test`, `npm run lint`, `npm run validate:data`, and `npm run build` stay green. |

### Ingest acceptance — required automated CI tests (Phase 1 PR)

These rows **must** be automated tests in the Phase 1 PR (not manual-only):

| Check | Passes when |
| --- | --- |
| **Unchanged re-import** | Same lineage hash inputs twice → same identities, research dates, content hashes, and **`release_id`**. New `attempt_id` each time. |
| **Corrected import** | Changed package bytes or `data/overrides/` → new lineage `release_id`; previous release auditable; unchanged record IDs preserved. |
| **Failed-import rollback** | Deliberate failure leaves last validated published data visible; failed attempt logged **outside** discarded staging; not a release. |
| **Broken references** | Dangling office/event/geography/**resolved-source** FKs fail closed. Unresolved evidence tokens are explicit records, not fabricated FKs/URLs. |
| **Preserved IDs + namespace** | Upstream office IDs, history keys, source IDs, already-public event IDs round-trip. Event keys/FKs carry `id_namespace`. No random IDs. |
| **Missing vs zero** | Recorded zero stays zero; unknown/null stays missing; they never collapse. |
| **Uncertain dates** | Month/year/range/conditional/unknown stay at that precision. No invented day. Interval-overlap filtering; unknown dates are not confirmed in-window. |
| **Score gates** | `score_gate: false` never displays as cleared CI. Incomplete series stay withheld. Withheld when conflicts do not resolve to one metric. |
| **Fixture exclusion** | `FIX-*` / `FXT-*` / `OBSERVATORY_FIXTURES` never appear in a published production release or public Atlas totals. |
| **Tier file** | Albania (then other countries) classification file drives tier; calendar cohort strings are not classifiers. |

### Cutover checklist

Checked in with the cutover PR. Each row needs an **evidence link** (log excerpt, test output, screenshot path, or CI run). Not a substitute for Phase 1 CI.

| Row | Evidence |
| --- | --- |
| **Pre-cutover access-log harvest** | Harvest of real `/electiondatabase` URLs (offices, events, explorer query strings, countries) used to drive destination tests. |
| **Named cutover-gate inputs in master** | LatAm + NZ + required Europe lineages present; publication set listed. |
| **Record parity** | Harvested office/event IDs resolve on `/atlas`; missing ≠ zero; dates/score gates/fixtures as in CI. |
| **Route-level destination / canonical / query-param** | Every row in the redirect table: destination exists, canonical matches, query params preserved where specified; office/event never → `/atlas` home. |
| **Sitemap / canonical parity** | Sitemap URLs, `alternates.canonical`, OG/JSON-LD match `/atlas` after cutover; no leftover canonicals pointing at retired paths for redirected pages. |
| **One data plane** | No surviving `/electiondatabase` page reads gzip/package merge instead of the published master. Explorer is on `/atlas`. |
| **Backup / restore** | Off-VPS backup taken before production publication; restore into scratch path serves a known office ID and schema version. |
| **Startup reconciliation** | Documented recovery from interrupted rename/WAL (test or drill). |
| **Post-cutover 404 monitoring** | Watch harvested URLs and sitemap paths for 404/redirect loops after flip; owner + window named. |
| **Redirect + query-string continuity** | Same as route-level row, exercised against the harvest. |

Honesty: UI never presents fixture data as production research; never presents Latin America completeness as European completeness; never presents PR-era office counts as current Atlas coverage.

---

## Non-goals

- Implementing Atlas UI, SQLite DDL, npm import scripts, or redirects **in this PR**.
- Blocking launch on a complete municipal register for Europe (or anywhere else).
- Committing giant DB files, Parquet lakes, or original zip archives to git.
- Replacing or restyling the marketing homepage as part of Atlas work.
- Reopening `/atlas` vs `/electiondatabase`, SQLite vs JSON-in-git, Europe vs Latin America first, or regional vs municipal launch depth.
- Treating PR #10 in-memory adapters as the permanent query layer, **or** replacing those working bridges before a SQLite ingest is proven.
- Computing tightness (or any new derived index) during package ingest or inside chase-tool.
- Redirecting office/event (or other already-public record) URLs to Atlas home.
- Mixing gzip-shard reads and SQLite reads after cutover.
- Hosted Postgres/MySQL, login, or a chase-tool admin clone on the public site.
- Live scraping or API credentials as a prerequisite to build.
- Including Russia in the Europe vertical.
- Invented geometry, national-to-local swing models, or treating national polling as a local forecast.
- Claiming research coverage is complete because the software build passed.
- Treating VPS path creation as Phase 1 complete.
- Treating Albania storage proof as regional calendar proof.
- Promoting historical PR office counts (including PR #10’s “202 European package offices”) into current coverage claims.
- Open-ended “pending further audits” before Phase 1 after Justin disposes this revision.

---

## Current repository snapshot

Context for Phase 0 inventory. **Not** Atlas launch coverage. Do not freeze these row counts as product KPIs; re-inventory from checksums and registers when implementation starts. Do not promote historical PR counts into current coverage claims.

Operational detail for the live observatory remains in [`docs/electiondatabase-progress.md`](electiondatabase-progress.md) and [`docs/electiondatabase-country-packages.md`](electiondatabase-country-packages.md). Those docs describe the system as it is; this plan describes the system as it will be.

### Runtime (as of mainline including PR #10)

- Observatory routes live under `/electiondatabase` (`lib/observatory/routes.ts`).
- Latin America release loads from `data/research`; country packages merge at runtime via `lib/observatory/adapters/`.
- Observatory home still highlights South America. Atlas landing will highlight Europe; that is independent of keeping already-public URLs working.
- There is **no** `/atlas` route yet. Phase 1 scaffolding can create gitignored SQLite files (`atlas.sqlite` + sibling `atlas-attempts.sqlite`) from Prompt B DDL with **zero** research rows; that is not Albania storage proof.
- `data/incoming/` has no zip (only README / `.gitkeep`). `data/overrides/` is not present yet. Fixtures stay under `tests/fixtures/` (test-only).
- `.gitignore` ignores `*.sqlite` / WAL / SHM and `data/master/` database files (Phase 1 scaffolding).

### Regional coverage counting

Use this definition in Atlas coverage labels, calendars, and success checks.

1. **Checked-in per-country tier-classification file** (reviewed like DDL). It maps each office ID in that package to schema v1 `GovernmentTier` (`national_context` / `regional` / `municipal` / `council` / `other`) from sourced office type + geography — **not** from workbook calendar cohort **Tier** strings. Bridges **must not** classify from labels such as Albania/Andorra `Regional / municipal`.
2. **Numerator (regional offices):** current tracked offices in the published master with `tier = regional` for the stated country or region.
3. **Denominator:** the sourced regional-office universe when the package or register states one (count of regional offices on the planning map / statutory list, with as-of date). If the universe is unknown, the denominator stays **unknown** — do not invent “all European regions” or “all NUTS-2 units”.
4. **No applicable regional tier / empty numerator:** if a country’s supplied register contains no regional offices, say **no regional tier in this package**. That is not “0% of a fake regional universe.” **Today’s checked-in Europe packages (Albania, Andorra, Alderney; Armenia pending classification file) may yield a European regional numerator of zero.** Phase 2’s regional calendar must show that empty state explicitly. It does not fail Phase 1 storage proof and does not block shipping the calendar shell.
5. **Calendar filtering:**
   - **Interval overlap** for partial dates: a month- or year-precision value is in a filter window if its interval **overlaps** the window, not only if a missing day was invented as day 1.
   - **Unknown dates** go in a **separate labelled section**. Unknown is **not** confirmed in-window.
   - Called, statutory, expected, and conditional dates remain distinct. Conditional stays labelled. Year-only and missing-day values keep that precision.
   - Filter by office tier from the classification file, independently of calendar cohort strings.
6. **Municipal rows** may appear in the same country package; they are not counted in the regional numerator. Launch does not wait for them.
7. **Storage proof ≠ calendar proof.** Phase 1 Albania import can succeed with zero regional-tier offices. Phase 2 proves the regional calendar against whatever numerator the classification files yield.

### Input inventory (this revision)

Shared Europe archive (off-git): `Europe_Excluding_Russia_Election_Data_2026-09-15.zip`, SHA-256 `93a31ec920c770e752cf7f130ffb8a546dce4510a41d9371d5f49239fa2b4ce9`. Shared workbook SHA-256 `b11dab577fb1746eddeb3aef72af7b097bcc4601828e1efbca1db3d6f6b98665`. Window 2026-09-08–2028-03-08 inclusive. Russia excluded. Package `coverage_complete` is false. Frozen extracts keep `site_ingestion_status: pending_adapter` (Armenia: `website_ingestion: pending`). Website adapters consume them at load time; that is **not** a published SQLite release.

**Early European target order:** **Albania** (Phase 1 bounded proof) → Andorra / Alderney (Phase 2, after review) → **Armenia last** among those early targets (packed payload; overlapping history index).

| Input | Country / scope | Adapter / kind | Checksums (plan revision) | Register / tier (from package files, not PR copy) | Validation status | Coverage gaps (as stated on the package) |
| --- | --- | --- | --- | --- | --- | --- |
| `data/countries/albania` | Albania (Europe, sovereign) — **Phase 1 proof** | `europe-country-extract/1` → `europe.ts` | Archive/xlsx as above; `tables/office-register.json` SHA-256 `7d5a3735e83f95ee82deb76c60c6d391fa5faadfd3f660fe71ca8ca0ca05ad62`; `coverage.json` `7687efabe16f9e0a91037964814907d9d928b050864d3637a60703683c4973b0` | 122 office-register rows: mayor + municipal council. Calendar cohort string `Regional / municipal` is **not** a classifier. Phase 1 adds a checked-in tier file expected to mark these **municipal**. **No regional-tier offices in this package.** | Package `coverage_complete: false`. `npm run import:countries` adapter validation reported no errors at last local run; research is not complete. Country `validate.py` exists. | Next polling date uncollected; 2019 boycott blocks comparable scores (0 competition / 0 volatility); proposed 46-municipality 2027 map unverified; remaining officeholders. |
| `data/countries/andorra` | Andorra (Europe, sovereign) | `europe-country-extract/1` → `europe.ts` | Archive/xlsx as above; `tables/office-register.json` SHA-256 `318db6770a7458b3479a4dcdefeff1b54072f3e50dd05319cd26952776d3076f` | 7 communal councils. Calendar `Regional / municipal` is not a classifier; expected **municipal**. **No regional-tier offices in this package.** | Same as Albania (`coverage_complete: false`, `pending_adapter`). | Exact late-2027 polling day uncollected; no parish vote estimate from national sample. |
| `data/countries/alderney` | Alderney (Europe, **territory** `GG-ALD`) | `europe-country-extract/1` → `europe.ts` | Archive/xlsx as above; `tables/office-register.json` SHA-256 `46dcd2afececa8e2ab46383d306003b941e6ca0ef9dac8e77dfc4435444a72f9` | 2 offices (States members, plebiscite). Expected **other** (territorial legislature). Calendar dates 2026-11-21 / 2026-12-12 are **conditional**. **No regional-tier offices in this package.** | Same pending_adapter / incomplete coverage. | Final 2026 approval text and primary numerical comparison pending. |
| `data/countries/armenia` | Armenia (Europe, sovereign) — **last among early targets** | `armenia-packed-europe/1` → `armenia.ts` | `payload_sha256` `f55265273c849d248baf0037e4149e17a0329318d21a794e966cebbaa32012ca`; inventory `e265bc4de47deaf710b248f88c059cd19d6c203236a1a3d7a5ad9ed824ad782e` | Manifest summary: 71 office records, 33 histories, 2 calendar cohorts. Companion histories overlap the regional history index (do not add). Tier mix **only** from a future classification file, not from PR office totals or calendar strings. | `website_ingestion: pending`. Packed payload verifies by chunk SHA-256. | Upcoming community roster partly confirmed; consolidation blocks three comparable cycles; `three_entries: 0`; remaining 2027 decrees. |
| `data/countries/new-zealand` | New Zealand (Oceania) — **Phase 2 cutover-gate input, not launch vertical** | `nz-research-batch/1` → `new-zealand.ts` | SHA-256 of committed `dataset.json` `6d73c7075fc04be9cec3fdda37810e5195748c77e25df2e62998e2d4721d2133` | 4 local by-election offices (`councillor` / `community_board_member` → council). Not a national or regional register. | `site_ingestion_status: pending_adapter`. `coverage.national_screen_complete: false`. | National screen missing; 2022 Buller mirror preliminary; STV stage reports missing; metrics withheld. Already public at `/electiondatabase`. |
| `data/research` Latin America release `latin-america-fe5e91689def` | Americas — **Phase 2 cutover-gate input**; South America is default on **today’s** observatory home only | zip adapter `scripts/import/normalize.ts` → `data/research` | Immutable zip SHA-256 `fe5e91689def5b3e6824c761b5ffb8fb2118847b9f3e0811fb76ba093453b23f` | Release manifest `validatedCounts` (recomputed from normalized records, `researchCoverageComplete: false`): 18,229 current offices, 414 historical offices, 40,509 histories, 269,740 result rows, 18,643 briefings. Those figures are **this lineage’s own validated counts**, not Atlas Europe coverage. | Current observatory production load. Evidence validator exists. Zip itself is off-git. | Research remaining work is in the completion queue / country notes. Australia and Japan still **not supplied**. |
| Synthetic fixtures | Fixtureland only | `data/normalized/synthetic-fixture-v0.ts` | n/a | Excluded from all published totals. | Tests / `OBSERVATORY_FIXTURES=1` non-production only. | Must never be imported into the Atlas master as research. |
| Europe-bound uploads in `data/incoming/` | none on disk at this revision | — | — | — | Absent | **New** packages after cutover-gate inputs are Phase 3 ingest once present and checksummed. |

Package-register office totals above (122 / 7 / 2 / 71 / 4) are **file inventory**, not a claim that Atlas regional coverage equals 202 European offices or that municipal registers are launch-complete.
