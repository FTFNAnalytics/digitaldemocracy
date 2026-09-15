# Election Atlas — restructuring plan

**Status:** Plan revised with Justin’s review acceptance criteria. Still pending further audit feedback before implementation. This PR remains **documentation only** (this document and the existing README pointer). No Atlas UI, SQLite schema, import scripts, or redirects land here.

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

Russia remains excluded from the European build. Latin America, Oceania (New Zealand), Australia, and Japan stay ingestible later; they are not the launch vertical and must not displace Europe as the Atlas default.

Continuity for already-public non-European URLs is a **cutover requirement**, not a reason to expand the launch vertical. See [Redirect strategy](#redirect-strategy).

### 4. Depth — regional first; municipal later

Ship **regional** calendars and indexes as we build. Municipal coverage arrives later as packages arrive. **Do not block launch** on full municipal coverage.

How regional coverage is counted is defined under [Regional coverage counting](#regional-coverage-counting). Do not treat workbook calendar labels such as “Regional / municipal” as proof that regional offices exist.

---

## Objectives

1. Give the Center a durable public **Election Atlas** at `/atlas` whose records come from a single master store, not from in-process merges of gzip shards and one-off adapters.
2. Make **Europe** the first complete-enough vertical: regional calendars, country indexes, and honest partial coverage — not a pretend continent-wide municipal register.
3. Keep the **marketing site, SEO, and existing research packages**. The Atlas is a product-area restructure, not a site rewrite.
4. Preserve research semantics already encoded in schema v1 (missing ≠ zero, date certainty, score gates, sourced IDs). Atlas storage changes the **runtime**, not the **rules**.
5. Leave a clean ingest path from frozen country packages and the Latin America release into SQLite, so later packages drop in without inventing a second identity system.
6. At **cutover**, existing public observatory links (including non-European office/event URLs) still reach the same record or a clear record page — without expanding the Europe-first launch vertical.
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
| Public base path | `/electiondatabase` → `/atlas`, with redirects **at cutover** (destinations already work). |
| Master store | In-memory gzip + country-package merge → SQLite master on the VPS. |
| Default vertical | Observatory home today highlights South America. Atlas **landing** highlights **Europe**. Already-public non-European records remain reachable. |
| Query path | `lib/observatory/load.ts` process cache of JSON.gz → queries against SQLite (read-only in the web process). |
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
| **Dataset release** (immutable) | `release_id` | A **published** snapshot: schema/method versions, research window, input checksums, validated counts, provenance. Created only after an ingest attempt validates. Never mutated in place; a later successful load is a new release (or a new release version) with a crosswalk to the previous `release_id`. Failed loads do not mint a release. |
| **Ingest attempt / run** (audit) | `attempt_id` | Operational record: started/succeeded/failed, operator/script, input paths and checksums, row counts, error text, timestamps, pointer to the published `release_id` on success. Failed attempts are **audit trail only** — they are not public releases and must not change what the site shows. |

Public pages cite `release_id`. Operators debug with `attempt_id`.

### Other master entities

| Entity | Identity | Role |
| --- | --- | --- |
| **Region** | `region_id` (`europe`, `south-america`, …) | Availability: available / partial / screened_out / not_supplied / fixture_only. Europe is the Atlas **default landing**. |
| **Country / territory** | stable slug (`country_id`) | Sovereign vs territory stay separate. Screening carries an as-of date. Russia is out of the Europe build. |
| **Geographic unit** | `geography_id` | Parent geography, aliases, source codes, effective dates. Geometry only when sourced. |
| **Office** | upstream `office_id` (e.g. `AL-01-M`) | Tier/type, current vs historical, registry qualification. `current` ≠ current tenure. |
| **Election event / contest** | `event_id` / `history_key` | Date with precision and certainty, event kind, selected-history role, ballot basis, legal outcome. |
| **Proceeding / result version** | `proceeding_id` | Round, recount, annulment, certification, supersession. |
| **Result row** | `result_row_id` | Candidate/list, party namespace, votes/shares, seats, evidence. Missing ≠ zero. |
| **Party / group mapping** | `party_mapping_id` | Original label/code scoped by country/source/election; mapped group with uncertainty. |
| **Officeholder observation** | `officeholder_id` | Dated roster/term; never automatically current tenure. |
| **Electoral register observation** | `register_id` | Dated elector counts. Not a person. Do not sum overlapping office types. |
| **Poll observation** | `poll_id` | National vs local; local polls attach only to a named office. |
| **Imported metric observation** | `metric_id` | Competition index and grouped Pedersen as **imported** (with `score_gate`, review status). Not tightness. |
| **Derived tightness observation** | `tightness_id` | **Phase 4 only.** Written after master load from eligible events; never invented during ingest. |
| **Evidence / source** | `source_id` | Publisher, title, URL, hash/locator, data rights (unknown unless supplied). |
| **Research issue / coverage gap** | `issue_id` | Category, resolution state, required evidence. Aligns with chase-tool work items. |
| **Completion / chase item** | `chase_item_id` when supplied | Office- or country-level remaining work. Maps to the existing completion queue. |
| **Briefing / artifact** | `artifact_id` | Path, checksum, availability. Original binaries stay off git. |
| **Identity crosswalk** | `(id_namespace, source_id, atlas_id)` | Required before new Atlas keys are minted. See [Identity scope, uniqueness, and crosswalk](#identity-scope-uniqueness-and-crosswalk). |
| **Calendar cohort / index projection** | derived view or table | Regional calendars and country indexes. Rebuilt from master, not hand-edited. |

Preserve existing `offices[].id`, `histories[]._key`, source IDs, and package office IDs.

### Identity scope, uniqueness, and crosswalk

Approve DDL only if it implements these rules. Random IDs on each import are forbidden.

| Entity | Scope of uniqueness | Crosswalk / preservation |
| --- | --- | --- |
| Dataset release | Global among **published** releases. `release_id` is content-derived from schema/method versions + input checksums (plus an explicit label if two validated loads would otherwise collide). | Map to today’s observatory `release.id` (e.g. `latin-america-fe5e91689def`) and to package archive checksums. |
| Ingest attempt | Global. `attempt_id` is unique, never reused, never equal to a `release_id`. | Optional FK to the published `release_id` on success; null on failure. |
| Region | Global `region_id`. | Stable strings already used in schema v1. |
| Country / territory | Global `country_id` (slug). `country_code` unique where present; compound codes allowed (`GG-ALD`). | Package folder slug, `manifest.country` / `country_code`, observatory `countries[].id`. |
| Geographic unit | Unique within `country_id` for a given effective interval. | Source codes and aliases; parent FK. Names are not keys. |
| Office | Unique within an ID namespace as `(id_namespace, office_id)`. Default namespace is the upstream observatory/package office ID. | **Preserve** `AL-01-M`, `AD-M-05`, `GG-ALD-STATES`, Latin America office IDs, NZ race IDs. If an Atlas surrogate is ever required, mint a deterministic namespaced key and **store the crosswalk before use**. |
| Event | `(office_id, history_key)` unique. `event_id` globally unique within the dataset. | Preserve `histories[]._key` and today’s event IDs so old `/elections/:id` links resolve. |
| Proceeding | Unique per event + proceeding kind/sequence. | Supersession points at the surviving proceeding; withdrawn/annulled rows remain addressable. |
| Result row | Unique per proceeding/event + source row identity. | Missing ≠ zero; do not reuse a result_row_id for a different candidate. |
| Party mapping | Scoped by country + source + election context. The same code in two namespaces is two mappings. | Do not equate successor movements without evidence. |
| Source | Country-namespaced. Preserve original source ID after the existing `country--` prefix where that contract already applies. | Unresolved references stay unresolved; do not invent URLs. |
| Artifact / briefing | Checksum + original path. | Byte identity, not filename guess. |

Additional rules:

- Names, labels, and slugs used for display are not primary keys.
- Repeat import of the same bytes yields the same identities and content hashes. Operational timestamps on the **attempt** may change; research dates and `release_id` must not.
- Absence of a row in a later **incomplete** package is not a delete (see [Conflict display and correction precedence](#conflict-display-and-correction-precedence)).
- Fixtures (`FIX-*` / `FXT-*`) stay in a fixture namespace and never enter a published release.

---

## Storage and import

### Where the DB lives

| Environment | Path | Notes |
| --- | --- | --- |
| Production VPS (preferred) | `/var/lib/cdd/atlas.sqlite` | Directory owned for the import user; file mode so `www-data` can **read**. The Next.js process does not need write. |
| Production VPS (app-local) | `data/master/atlas.sqlite` under the deployed app | Same permission model if `/var/lib/cdd` is unavailable. |
| Local / CI | `data/master/atlas.sqlite` (gitignored) or a temp path | Created by npm scripts. Never commit the DB file. |
| Override | `ATLAS_SQLITE_PATH` | Single explicit path for import, migrate, and app read. |

**Path readiness vs Phase 1.** mkdir/`chown` of `/var/lib/cdd` (or touching an empty `atlas.sqlite`) only proves the VPS path and permissions. Phase 1 is complete only when checked-in migrations exist, a bounded European import has published a validated release into that file, and a failed import has been shown **not** to clobber the previous published data.

Git contains:

- SQL migrations / DDL (versioned)
- import adapters and npm script entrypoints
- schema/types that describe master tables
- checksums and release manifests

Git does **not** contain `.sqlite`, Parquet dumps, or the Latin America zip. Optional JSON/Parquet exports may be written under a gitignored `data/exports/` (or similar) for debug.

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

The implementing PR should wire those existing importers as **bridges**: they read the same inputs and **upsert the SQLite master**, instead of (or in addition to) merging in memory.

### Atomic publication

A failed import must leave the **last validated published data** visible.

1. Record an ingest **attempt** (`started`).
2. Write into a staging database or a single SQLite transaction that is not yet the published file.
3. Run validation (identities, references, missing-vs-zero, date precision, score gates, fixture exclusion).
4. On success: backup the current published file (if any), atomically replace it (e.g. `rename` of a fully synced staging file onto `atlas.sqlite`), record `attempt` = succeeded and mint/publish the immutable **release**.
5. On failure: abort; do not replace the published file; record `attempt` = failed with errors. The site keeps serving the previous release.

Never publish a half-written master. Never mint a `release_id` for a failed attempt.

### Conflict display and correction precedence

Short rule set — apply in this order:

1. **Package / immutable source wins** for a given field unless a documented editorial override exists under `data/overrides/` with provenance (source, date, claim, affected IDs).
2. **Never infer deletion** from an incomplete package. A package that omits an office, event, or source that a previous validated release still carries does not delete that record. Removal requires an explicit withdrawal (below).
3. **Conflicting claims are shown with sources.** When two sourced values disagree (chase-tool vs package, two dated observations, mirrored files), keep both with provenance. Do not silently prefer the website, the newest file, or a numeric average.
4. Overrides never rewrite frozen extract bytes. They apply at ingest into the master and remain reviewable in git.

### Withdrawal and supersession

- **Withdrawal** of a published record is explicit: a sourced withdrawal/supersession row (who, when, why, replacement ID if any). Silence is not withdrawal.
- **Supersession** of results uses the existing proceeding model (recount, annulment, certification). Annulled and superseded evidence remains addressable; it is not a second election and is not deleted.
- Withdrawn or superseded offices/events keep their IDs so old URLs still resolve to a record page that states the status.
- A corrected re-import is a new ingest attempt. If it validates, it publishes a new release; the previous release remains auditable.

### Import serialization, journaling, and readers

- **One writer.** Serialize imports and migrations (lockfile or equivalent). Concurrent `import:atlas` is an error.
- **SQLite journaling.** Use WAL (or an equivalent read-safe arrangement) so `www-data` can read the **published** file while an importer writes **staging**. Do not give the web process write permission.
- Readers open the published DB read-only (`query_only` / immutable as appropriate). After atomic replace, recycle or reopen connections so the app does not keep a deleted inode.
- Optional JSON/Parquet dumps are written after successful publication, never as the write-ahead path.

### Backup, restore, migration recovery, compatibility

- **Backup** the published DB before every migration and every publication swap. Store backups on the VPS (not git), named by `release_id` + timestamp.
- **Restore check:** a cutover gate is restoring a backup into a scratch path and confirming the app can read it (record counts, a known office ID, schema version).
- **Migration recovery:** a failed migration does not publish. Restore the pre-migration backup. Do not hand-edit the live file.
- **App/schema compatibility:** the app records the minimum schema version it can serve. If the DB is older, newer-incompatible, or has no published release, refuse to pretend research is loaded (fail clearly in production; fixtures remain opt-in and non-production).

### Where off-git inputs can be recovered

| Input | In git? | Recovery |
| --- | --- | --- |
| Latin America zip `Latin_America_Races_and_Briefings.zip` | No | SHA-256 `fe5e91689def5b3e6824c761b5ffb8fb2118847b9f3e0811fb76ba093453b23f` in `data/research/manifest.json`. Restore from `data/incoming/` or the configured artifact host (`ELECTION_ARTIFACT_BASE_URL`). Normalized `data/research/*.json.gz` is the current committed derivative. |
| Europe archive `Europe_Excluding_Russia_Election_Data_2026-09-15.zip` | No | SHA-256 `93a31ec920c770e752cf7f130ffb8a546dce4510a41d9371d5f49239fa2b4ce9` on country-package manifests. Country folders in git are extracts, not the zip. |
| Europe workbook `Europe_Excluding_Russia.xlsx` | No | SHA-256 `b11dab577fb1746eddeb3aef72af7b097bcc4601828e1efbca1db3d6f6b98665` on extract manifests. |
| Armenia packed payload | Chunks in git | Reassemble via `manifest.chunks`; `payload_sha256` `f55265273c849d248baf0037e4149e17a0329318d21a794e966cebbaa32012ca`. Companion XLSX lives inside the tarball, not as a public artifact host. |
| New Zealand `dataset.json` | Yes | File hash `6d73c7075fc04be9cec3fdda37810e5195748c77e25df2e62998e2d4721d2133` (SHA-256 of the committed file as of this plan revision). |
| SQLite master / backups | No | VPS backup set keyed by `release_id`. Optional post-publish JSON/Parquet is debug, not the restore path unless a runbook says otherwise. |
| Synthetic fixtures | Tests only | Must not be used to recover production. |

### PR #10 adapters (temporary bridges)

[PR #10](https://github.com/FTFNAnalytics/digitaldemocracy/pull/10) added Europe / Armenia / New Zealand adapters that map standalone packages into schema v1 at load time. That is the correct **short-term** way to show country folders on the current observatory.

For the Atlas they are **temporary bridges into the master**:

- Keep using them so frozen packages (`site_ingestion_status: pending_adapter`) do not need byte-level rewrites.
- Point their output at SQLite upserts rather than a long-term in-process merge.
- Do **not** replace working bridges early. Replacement is a later PR after a bounded SQLite ingest is proven.
- Do not treat adapter-in-memory merge as the architecture to extend for municipal coverage or tightness.

---

## Redirect strategy

### Implementation vs cutover

These are different events:

| Event | What it is | Redirects? |
| --- | --- | --- |
| **Implementation starts** | Schema, migrations, bounded import, `/atlas` shell, compatibility views. `/electiondatabase` stays live. | **No.** |
| **Cutover** | The **release** in which every URL that will receive a redirect already has a working `/atlas` destination (same record, or a clear record page — not Atlas home as a dump). Backups/restore, record parity, and query-string behaviour have passed the [cutover gate](#cutover-gate). | **Yes**, together with SEO. |

Do not flip `/electiondatabase` redirects when `/atlas` is only a Europe landing page that 404s offices. Do not treat “we started Atlas work” as cutover.

### What may redirect, and where

Permanent redirects (HTTP 308 or Next.js `permanent: true`) at cutover. **Preserve query strings** (`?region=europe`, compare office IDs, explorer filters) where the destination still understands them.

**Do not** redirect office/event URLs — or already-public non-European observatory URLs — to Atlas home.

| Old path | Cutover destination | Notes |
| --- | --- | --- |
| `/electiondatabase` | `/atlas` | Atlas landing is **Europe**. This is the only home→home redirect. |
| `/electiondatabase/regions` | `/atlas/regions` | |
| `/electiondatabase/countries/:id` | `/atlas/countries/:id` | Includes Latin America and NZ country IDs already public. |
| `/electiondatabase/explorer` | `/atlas/explorer` if that surface exists at cutover; otherwise keep serving the old explorer until it does | Do not send explorer-with-filters to `/atlas` home. |
| `/electiondatabase/offices/:id` | `/atlas/offices/:id` | **Same office record** (or a clear record page). Never `/atlas`. Includes non-European IDs. |
| `/electiondatabase/offices/:id/original` | `/atlas/offices/:id/original` | Same briefing record. |
| `/electiondatabase/elections/:id` | `/atlas/elections/:id` | **Same event record**. Never `/atlas` home. |
| `/electiondatabase/compare` | `/atlas/compare` only if compare exists at cutover | Otherwise defer this redirect. Do not dump to home. |
| `/electiondatabase/calendar` | `/atlas/calendar` | Regional calendar is in scope; date uncertainty preserved. |
| `/electiondatabase/polling` | `/atlas/polling` only if that page exists at cutover | Advanced polling waits; do not redirect to home. |
| `/electiondatabase/coverage` | `/atlas/coverage` | Honest labels; regional counting rules apply. |
| `/electiondatabase/sources` | `/atlas/sources` if present at cutover; else keep old path until it is | |
| `/electiondatabase/downloads` | `/atlas/downloads` if present; else defer | |
| `/electiondatabase/methodology` | `/atlas/methodology` | |
| `/electiondatabase/releases` | `/atlas/releases` | Published releases only, not failed attempts. |
| `/electiondatabase/about` | `/atlas/about` | |
| `/electiondatabase/artifacts/:id` | `/atlas/artifacts/:id` | Same artifact. |

Unknown slugs still 404 (as today). Marketing homepage is never the fallback for a research URL.

### Minimal record-detail / compatibility views

Bring these **forward** so cutover is possible without waiting for full Phase 3 surfaces:

- Office detail sufficient to identify the office, geography, tier, next-election date **with certainty/precision intact**, selected histories, and status (including withdrawn/superseded).
- Event detail sufficient to identify the contest, date uncertainty, legal outcome, and result rows (missing ≠ zero).
- Original briefing route where a briefing already exists.
- Country index pages for **already-public** countries, including non-European ones, even though Europe is the default landing.
- Coverage labels that do not pretend municipal or non-European completeness.

These compatibility views are a cutover requirement. They are **not** a decision to make Latin America or Oceania the launch vertical, to ship advanced compare/polling, or to wait for full municipal coverage.

SEO follow-through in the **same cutover change** as redirects: canonical URLs, sitemap, robots, Open Graph, and JSON-LD `url` / `urlTemplate` move to `/atlas`. Marketing nav labels may say “Election Atlas” while keeping the rest of the homepage copy.

Do **not** add these redirects in this documentation PR.

---

## Phases

Implementation PRs should land in this order. Each phase must leave `npm run build` green and must not invent election results. Phases 1–2 can proceed on the VPS and in git **without** retiring `/electiondatabase`. Redirects wait for cutover.

Gated on Justin’s further audits: see [Immediate build order](#immediate-build-order-accepted-next-steps).

### Phase 0 — Foundations (plan + inventory; no runtime change)

- Record accepted decisions (URL, SQLite, Europe, regional depth).
- Inventory actual ingest inputs by checksum, country, tier, adapter, validation status, and coverage gaps ([Current repository snapshot](#current-repository-snapshot)).
- Define regional coverage counting, identity rules, atomic publication, and cutover.
- Specify VPS path, permissions, `ATLAS_SQLITE_PATH`, and npm script contract. Path readiness ≠ Phase 1.
- **Exit:** Revised plan on the Atlas-plan branch / `main` when merged. Site still serves `/electiondatabase`. No SQLite schema code and no Atlas UI in this documentation PR.

A later Phase 0/1 implementation slice (separate PR, after further audit) may add migrations, gitignore for `*.sqlite`, and script stubs without moving routes or flipping redirects.

### Phase 1 — Minimum schema and a bounded European import proof

- Check in SQLite DDL/migrations covering provenance, release vs ingest-attempt tracking, and stable identities/crosswalks — reviewed against the identity table above.
- Create the VPS path if needed (**path readiness**). Publish data into it only after a validated import.
- **One bounded European import proof** (a single country package or a declared small set), then expand to other European packages / Europe-bound uploads. PR #10 adapters act as bridges; do not replace them yet.
- Demonstrate atomic publication: a failed import leaves the last validated data visible; a corrected import publishes a new release; an unchanged re-import is deterministic.
- Optional JSON/Parquet export for debug; master remains SQLite.
- Keep `/electiondatabase` serving. **No public redirects.**
- **Do not** compute tightness.
- **Exit:** At least one validated European load in SQLite; failed-import rollback proven; Latin America still available as an input, not the default landing.

Empty `atlas.sqlite` on disk without that proof is not an exit.

### Phase 2 — SQLite-backed `/atlas` shell (still not cutover)

- Ship an `/atlas` shell reading SQLite: Europe landing, country indexes, regional calendar, coverage labels, and **minimal record-detail / compatibility views** for continuity (offices, events, original briefings, already-public non-European records).
- Europe is the default landing vertical.
- Regional calendars/indexes render from master using [Regional coverage counting](#regional-coverage-counting). Municipal rows may appear when a package has them; absence is labelled, not blocked.
- `/electiondatabase` remains the public canonical path until the cutover gate passes.
- Marketing site unchanged except optional non-canonical Atlas links for internal review.
- **Exit:** A researcher can open `/atlas`, see Europe regional coverage honestly, open a country index and calendar, and open the same office/event via `/atlas/...` IDs that exist today under `/electiondatabase` — **before** redirects flip.

### Cutover gate (after Phase 2 destinations work)

Not a separate product phase with new research scope. It is the release that is allowed to retire `/electiondatabase`.

Required before redirects + SEO ship **together**:

- Backup and restore check of the published SQLite file.
- Record parity: published IDs for already-public offices/events still resolve; missing ≠ zero; uncertain dates not coerced; score gates still withhold; fixtures excluded.
- Old-link destinations exist (office/event/country/original briefing) and do **not** land on Atlas home.
- Query strings preserved on explorer/calendar/compare where those surfaces exist.
- Then enable the redirect table and SEO retarget in the same change.

### Phase 3 — Expanded Atlas surfaces and further ingest

- Fuller explorer, coverage, sources, downloads, methodology, releases — reading SQLite.
- Ingest remaining packages (Latin America release, New Zealand, later Europe uploads) into the same master without changing the Europe-first **default landing**.
- Municipal packages attach as they arrive; launch is not waiting on them.
- Retire in-memory gzip merge as the primary query path once Atlas reads and cutover are proven.
- Advanced compare/polling wait unless already required for a specific old-link destination.
- **Exit:** One master, one public path after cutover, existing research still cited with original IDs; coverage remains partial where research is partial.

### Phase 4 — Derived tightness metrics (after master load)

- Compute tightness **only after** a successful master load, from eligible events already in SQLite.
- Store tightness as derived observations with method version, inputs, and eligibility/withholding reasons.
- Do not backfill tightness inside country-package adapters or chase-tool dumps.
- Optional export of tightness tables as JSON/Parquet debug artifacts.
- Keep imported CI / Pedersen distinct: those remain source-gated metrics, not substitutes for tightness.
- **Exit:** Tightness visible only where eligibility is documented; null stays null; no tightness claim on incomplete municipal series.

---

## Immediate build order (accepted next steps)

Gated on Justin’s further audits. Do not skip the gate into schema/import PRs.

1. **Finalize plan + inventory** — this revision; remaining audit feedback may still edit counting rules or identity details.
2. **Minimum schema + migrations** — provenance, dataset release vs ingest attempt, stable identities and crosswalks. No public route change.
3. **One bounded European import proof**, then expand to further European packages.
4. **SQLite-backed `/atlas` shell** — Europe landing, country indexes, regional calendar, coverage labels, minimal detail for continuity (including already-public non-European records).
5. **Gate cutover** (backups/restore, record parity, old-link destinations, query params) **then** redirects + SEO together.

---

## What waits

Not launch blockers; not part of the immediate build order:

- Full municipal coverage for Europe or anywhere else.
- Expanded non-European research as **launch scope** (Latin America and NZ remain ingest inputs and cutover-continuity records, not the default vertical).
- Advanced compare and polling products beyond what old-link continuity requires.
- Replacing working PR #10 bridge adapters early.
- Derived tightness (Phase 4).

---

## Chase-tool alignment

The chase tool is the research-operations surface for collecting dates, sources, and remaining work. The Atlas is the public publication of what has already been chased and packaged. They must share identities; they must not become two competing masters.

| Topic | Alignment |
| --- | --- |
| **Direction of data** | Chase tool → packages / uploads → Atlas import scripts → SQLite master. Atlas does not become the place researchers first record a date. |
| **Identities** | Office IDs, country slugs, history keys, and source IDs used in chase exports must round-trip into master entities. If the chase tool supplies a `chase_item_id`, store it on the completion/issue row. |
| **Calendars** | Regional calendars are projections of chased dates (called / statutory / expected / conditional / unknown). Do not “confirm” a date the chase tool left uncertain. Filtering must preserve uncertainty (see [Regional coverage counting](#regional-coverage-counting)). |
| **Coverage queue** | Atlas `coverage` / issues map to chase remaining-work items. Closing a gap happens in research + git/package update, then re-import — not by editing SQLite by hand on the VPS. |
| **Conflicts** | Same precedence as ingest: package wins unless documented override; never infer deletion; conflicting claims shown with sources. |
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
| Master store | Production reads `/var/lib/cdd/atlas.sqlite` (or the app-local equivalent). No SQLite binary in git. Path existence alone is not success. |
| Ingest | `npm` import scripts create/update that DB from checked-in schemas + European packages / Europe-bound uploads. |
| First vertical | Europe is the Atlas default landing; Russia excluded; coverage labelled using [Regional coverage counting](#regional-coverage-counting). |
| Depth | Regional calendars and indexes are usable at launch. Municipal completeness is **not** a launch criterion. |
| Continuity | Marketing site still ships. Already-public office/event URLs keep reaching the same record (or a clear record page), including non-European IDs. |
| Tightness | Absent until Phase 4; then only from master-loaded eligible events. |
| Quality bar | `npm test`, `npm run lint`, `npm run validate:data`, and `npm run build` stay green. |

### Acceptance checks (review bar)

These must be demonstrable before cutover, and as soon as imports exist for the ingest-related rows.

| Check | Passes when |
| --- | --- |
| **Unchanged re-import** | Importing the same inputs twice yields the same identities, research dates, and content hashes. Attempt timestamps may differ; `release_id` does not. |
| **Corrected import** | A sourced correction (override or new package bytes) publishes a new release; previous release remains auditable; IDs of unchanged records are preserved. |
| **Failed-import rollback** | A deliberately failing import leaves the last validated published data visible; the failed attempt is logged and is not a release. |
| **Broken references** | Validation fails closed on dangling office/event/source/geography FKs. The site does not publish a release with broken references. |
| **Preserved IDs** | Upstream office IDs, history keys, source IDs, and already-public event IDs round-trip. No random IDs. |
| **Missing vs zero** | Recorded zero stays zero; unknown/null stays missing; they never collapse. |
| **Uncertain dates** | Month/year/range/conditional/unknown stay at that precision. No invented day. Calendar filters do not drop or “confirm” uncertain dates. |
| **Score gates** | `score_gate: false` never displays as cleared CI. Incomplete series stay withheld. |
| **Fixture exclusion** | `FIX-*` / `FXT-*` / `OBSERVATORY_FIXTURES` never appear in a published production release or public Atlas totals. |
| **Redirect + query-string continuity** | At cutover, mapped old paths reach the correct `/atlas` record; office/event URLs never bounce to Atlas home; explorer/calendar query strings that the destination understands are preserved. |

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
- Hosted Postgres/MySQL, login, or a chase-tool admin clone on the public site.
- Live scraping or API credentials as a prerequisite to build.
- Including Russia in the Europe vertical.
- Invented geometry, national-to-local swing models, or treating national polling as a local forecast.
- Claiming research coverage is complete because the software build passed.
- Treating VPS path creation as Phase 1 complete.
- Promoting historical PR office counts (including PR #10’s “202 European package offices”) into current coverage claims.

---

## Current repository snapshot

Context for Phase 0 inventory. **Not** Atlas launch coverage. Do not freeze these row counts as product KPIs; re-inventory from checksums and registers when implementation starts. Do not promote historical PR counts into current coverage claims.

Operational detail for the live observatory remains in [`docs/electiondatabase-progress.md`](electiondatabase-progress.md) and [`docs/electiondatabase-country-packages.md`](electiondatabase-country-packages.md). Those docs describe the system as it is; this plan describes the system as it will be.

### Runtime (as of mainline including PR #10)

- Observatory routes live under `/electiondatabase` (`lib/observatory/routes.ts`).
- Latin America release loads from `data/research`; country packages merge at runtime via `lib/observatory/adapters/`.
- Observatory home still highlights South America. Atlas landing will highlight Europe; that is independent of keeping already-public URLs working.
- There is **no** SQLite master and **no** `/atlas` route yet.
- `data/incoming/` has no zip (only README / `.gitkeep`). `data/overrides/` is not present yet. Fixtures stay under `tests/fixtures/` (test-only).

### Regional coverage counting

Use this definition in Atlas coverage labels, calendars, and success checks. Do not use concatenated workbook calendar **Tier** strings as the office-tier classifier.

1. **Classify geography and tier on the office**, from sourced office type + geography, using schema v1 `GovernmentTier` (`national_context` / `regional` / `municipal` / `council` / `other`). Calendar cohort labels such as Albania/Andorra `Regional / municipal` are **cohort descriptors**, not evidence that `tier = regional`.
2. **Numerator (regional offices):** current tracked offices in the published master with `tier = regional` for the stated country or region.
3. **Denominator:** the sourced regional-office universe when the package or register states one (count of regional offices on the planning map / statutory list, with as-of date). If the universe is unknown, the denominator stays **unknown** — do not invent “all European regions” or “all NUTS-2 units”.
4. **No applicable regional tier:** if a country’s supplied register contains no regional offices (example below: Albania municipal-only, Andorra parish councils, Alderney territorial legislature), say **no regional tier in this package**. That is not “0% regional coverage” of a fake regional universe, and it does not block shipping a regional calendar for countries that *do* have regional offices.
5. **Calendar filtering:** include called, statutory, expected, conditional, and unknown dates. Filter by office/cohort tier independently of date certainty. Year-only and missing-day values keep that precision. Conditional dates stay in a labelled section. Do not drop uncertain dates from the regional calendar because they sort poorly.
6. **Municipal rows** may appear in the same country package; they are not counted in the regional numerator. Launch does not wait for them.

### Input inventory (this revision)

Shared Europe archive (off-git): `Europe_Excluding_Russia_Election_Data_2026-09-15.zip`, SHA-256 `93a31ec920c770e752cf7f130ffb8a546dce4510a41d9371d5f49239fa2b4ce9`. Shared workbook SHA-256 `b11dab577fb1746eddeb3aef72af7b097bcc4601828e1efbca1db3d6f6b98665`. Window 2026-09-08–2028-03-08 inclusive. Russia excluded. Package `coverage_complete` is false. Frozen extracts keep `site_ingestion_status: pending_adapter` (Armenia: `website_ingestion: pending`). Website adapters consume them at load time; that is **not** a published SQLite release.

| Input | Country / scope | Adapter / kind | Checksums (plan revision) | Register / tier (from package files, not PR copy) | Validation status | Coverage gaps (as stated on the package) |
| --- | --- | --- | --- | --- | --- | --- |
| `data/countries/albania` | Albania (Europe, sovereign) | `europe-country-extract/1` → `europe.ts` | Archive/xlsx as above; `tables/office-register.json` SHA-256 `7d5a3735e83f95ee82deb76c60c6d391fa5faadfd3f660fe71ca8ca0ca05ad62`; `coverage.json` `7687efabe16f9e0a91037964814907d9d928b050864d3637a60703683c4973b0` | 122 office-register rows, all classified **municipal** (mayor + municipal council). Calendar cohort tier string is `Regional / municipal` with **no scheduled day**. **No regional-tier offices in this package.** | Package `coverage_complete: false`. `npm run import:countries` adapter validation reported no errors at last local run; research is not complete. Country `validate.py` exists. | Next polling date uncollected; 2019 boycott blocks comparable scores (0 competition / 0 volatility); proposed 46-municipality 2027 map unverified; remaining officeholders. |
| `data/countries/andorra` | Andorra (Europe, sovereign) | `europe-country-extract/1` → `europe.ts` | Archive/xlsx as above; `tables/office-register.json` SHA-256 `318db6770a7458b3479a4dcdefeff1b54072f3e50dd05319cd26952776d3076f` | 7 communal councils, classified **municipal**. Calendar `Regional / municipal`, date pending. **No regional-tier offices in this package.** | Same as Albania (`coverage_complete: false`, `pending_adapter`). | Exact late-2027 polling day uncollected; no parish vote estimate from national sample. |
| `data/countries/alderney` | Alderney (Europe, **territory** `GG-ALD`) | `europe-country-extract/1` → `europe.ts` | Archive/xlsx as above; `tables/office-register.json` SHA-256 `46dcd2afececa8e2ab46383d306003b941e6ca0ef9dac8e77dfc4435444a72f9` | 2 offices (States members, plebiscite), classified **other** (territorial legislature). Calendar dates 2026-11-21 / 2026-12-12 are **conditional** (proposal not finally verified). **No regional-tier offices in this package.** | Same pending_adapter / incomplete coverage. | Final 2026 approval text and primary numerical comparison pending. |
| `data/countries/armenia` | Armenia (Europe, sovereign) | `armenia-packed-europe/1` → `armenia.ts` | `payload_sha256` `f55265273c849d248baf0037e4149e17a0329318d21a794e966cebbaa32012ca`; inventory `e265bc4de47deaf710b248f88c059cd19d6c203236a1a3d7a5ad9ed824ad782e` | Manifest summary: 71 office records, 33 histories, 2 calendar cohorts. Companion histories overlap the regional history index (do not add). Tier mix must be classified from unpacked office names at ingest — do not copy a PR office total as “regional coverage.” | `website_ingestion: pending`. Packed payload verifies by chunk SHA-256. | Upcoming community roster partly confirmed; consolidation blocks three comparable cycles; `three_entries: 0`; remaining 2027 decrees. |
| `data/countries/new-zealand` | New Zealand (Oceania) — **not** the launch vertical | `nz-research-batch/1` → `new-zealand.ts` | SHA-256 of committed `dataset.json` `6d73c7075fc04be9cec3fdda37810e5195748c77e25df2e62998e2d4721d2133` | 4 local by-election offices (`councillor` / `community_board_member` → council). Not a national or regional register. | `site_ingestion_status: pending_adapter`. `coverage.national_screen_complete: false`. | National screen missing; 2022 Buller mirror preliminary; STV stage reports missing; metrics withheld. Already public at `/electiondatabase`; required for cutover continuity, not for Europe launch scope. |
| `data/research` Latin America release `latin-america-fe5e91689def` | Americas (South America default on **today’s** observatory home) | zip adapter `scripts/import/normalize.ts` → `data/research` | Immutable zip SHA-256 `fe5e91689def5b3e6824c761b5ffb8fb2118847b9f3e0811fb76ba093453b23f` | Release manifest `validatedCounts` (recomputed from normalized records, `researchCoverageComplete: false`): 18,229 current offices, 414 historical offices, 40,509 histories, 269,740 result rows, 18,643 briefings. Those figures are **this release’s own validated counts**, not Atlas Europe coverage and not a PR highlight reel. | Current observatory production load. Evidence validator exists. Zip itself is off-git. | Research remaining work is in the completion queue / country notes. Australia and Japan still **not supplied**. |
| Synthetic fixtures | Fixtureland only | `data/normalized/synthetic-fixture-v0.ts` | n/a | Excluded from all published totals. | Tests / `OBSERVATORY_FIXTURES=1` non-production only. | Must never be imported into the Atlas master as research. |
| Europe-bound uploads in `data/incoming/` | none on disk at this revision | — | — | — | Absent | Future Europe zips/uploads are in-scope ingest once present and checksummed. |

Package-register office totals above (122 / 7 / 2 / 71 / 4) are **file inventory**, not a claim that Atlas regional coverage equals 202 European offices or that municipal registers are launch-complete.
