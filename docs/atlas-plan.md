# Election Atlas — restructuring plan

**Status:** Plan accepted pending further feedback. Implementation is **not** started in this documentation PR; only this document (and a README pointer) land here.

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

Retire **`/electiondatabase`**. When Atlas implementation starts, old paths redirect to `/atlas` equivalents (see [Redirect strategy](#redirect-strategy)). Until then, `/electiondatabase` remains the live observatory.

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

### 3. First vertical — Europe

Ship **Europe** first: country packages under `data/countries/*` that are European, plus any Europe-bound uploads.

Russia remains excluded from the European build. Latin America, Oceania (New Zealand), Australia, and Japan stay ingestible later; they are not the launch vertical and must not displace Europe as the Atlas default.

### 4. Depth — regional first; municipal later

Ship **regional** calendars and indexes as we build. Municipal coverage arrives later as packages arrive. **Do not block launch** on full municipal coverage.

---

## Objectives

1. Give the Center a durable public **Election Atlas** at `/atlas` whose records come from a single master store, not from in-process merges of gzip shards and one-off adapters.
2. Make **Europe** the first complete-enough vertical: regional calendars, country indexes, and honest partial coverage — not a pretend continent-wide municipal register.
3. Keep the **marketing site, SEO, and existing research packages**. The Atlas is a product-area restructure, not a site rewrite.
4. Preserve research semantics already encoded in schema v1 (missing ≠ zero, date certainty, score gates, sourced IDs). Atlas storage changes the **runtime**, not the **rules**.
5. Leave a clean ingest path from frozen country packages and the Latin America release into SQLite, so later packages drop in without inventing a second identity system.
6. Compute **derived tightness metrics only after** a successful master load (Phase 4). Do not bake tightness into package adapters or chase-tool exports.

---

## What we keep vs change

### Keep

| Asset | Why it stays |
| --- | --- |
| Marketing homepage and in-page IA (`/`, About, Research, Initiatives, Events, Connect) | Separate product surface. Prototype forms stay prototype forms. |
| Existing SEO (canonicals, sitemap, OG images, JSON-LD) | Retarget paths to `/atlas` when routes move; do not discard the SEO work from PR #5. |
| Research packages as **ingest inputs** | `data/research` (Latin America release), `data/countries/*` (Europe extracts, Armenia packed payload, NZ batch), `data/incoming/` zips. Frozen bytes stay frozen. |
| Schema v1 research semantics | `schemas/v1/normalized.ts`, field mapping, data dictionary, score gates, date precision, missing-vs-zero. |
| Source-backed correction workflow | Git reviews, `data/overrides/`, research-correction issue template. No admin UI in early Atlas phases. |
| Standalone Next.js deploy on the VPS | `output: "standalone"`, `npm start`. Atlas adds a SQLite file beside the app; it does not require a hosted database service. |
| Tests, lint, and `npm run build` | Must keep passing. Fixtures stay labelled fixtures. |
| Original implementation brief | `docs/implementation-brief.md` remains historical. This Atlas plan supersedes it for **product shape and storage**, not for research ethics. |

### Change

| Asset | What changes |
| --- | --- |
| Public base path | `/electiondatabase` → `/atlas`, with redirects. |
| Master store | In-memory gzip + country-package merge → SQLite master on the VPS. |
| Default vertical | Observatory home today highlights South America. Atlas launch highlights **Europe**. |
| Query path | `lib/observatory/load.ts` process cache of JSON.gz → queries against SQLite (read-only in the web process). |
| Country-package adapters (PR #10) | **Temporary bridges** into the master. They are not the long-term architecture. See [PR #10 adapters](#pr-10-adapters-temporary-bridges). |
| Generated JSON in `public/data` | Optional debug/export only; not how the Atlas reads production data. |
| Launch depth | Regional calendars/indexes ship as packages exist. Municipal completeness is not a launch gate. |
| Derived tightness | New Phase 4 work **after** master load. Not part of current adapters. |

### Do not treat as deleted

Latin America research, New Zealand packages, observatory routes, and PR #10 adapter code remain until an implementation PR replaces them. This documentation PR does not remove `/electiondatabase` or rewrite loaders.

---

## Master entities

Canonical records live in SQLite. Identifiers stay stable and namespaced. Names are not primary keys. Unknown upstream fields survive in an extensions/raw payload.

These entities are the Atlas master — a persistence design for the conceptual model already in schema v1, plus Atlas-specific ingest/run metadata. Implementation PRs check in DDL and TypeScript types; this plan does not.

| Entity | Identity | Role |
| --- | --- | --- |
| **Ingest run / dataset release** | `release_id`, schema/method versions | Window, snapshot, provenance, input checksums, validated counts. One row (or versioned rows) per successful load into the master. |
| **Region** | `region_id` (`europe`, `south-america`, …) | Availability: available / partial / screened_out / not_supplied / fixture_only. Europe is the Atlas default. |
| **Country / territory** | stable slug / ISO-style id | Sovereign vs territory stay separate. Screening carries an as-of date. Russia is out of the Europe build. |
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
| **Calendar cohort / index projection** | derived view or table | Regional calendars and country indexes shipped in Phases 2–3. Rebuilt from master, not hand-edited. |

Preserve existing `offices[].id`, `histories[]._key`, source IDs, and package office IDs. If a new Atlas key is required, use a deterministic namespaced ID and store the crosswalk. Do not generate random identities on each import.

---

## Storage and import

### Where the DB lives

| Environment | Path | Notes |
| --- | --- | --- |
| Production VPS (preferred) | `/var/lib/cdd/atlas.sqlite` | Directory owned for the import user; file mode so `www-data` can **read**. The Next.js process does not need write. |
| Production VPS (app-local) | `data/master/atlas.sqlite` under the deployed app | Same permission model if `/var/lib/cdd` is unavailable. |
| Local / CI | `data/master/atlas.sqlite` (gitignored) or a temp path | Created by npm scripts. Never commit the DB file. |
| Override | `ATLAS_SQLITE_PATH` | Single explicit path for import, migrate, and app read. |

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

The implementing PR should wire those existing importers as **bridges**: they read the same inputs and **upsert the SQLite master**, instead of (or in addition to) merging in memory. Repeat imports of the same inputs must leave the same identities and content hashes. Research dates must not shift because the clock changed.

### PR #10 adapters (temporary bridges)

[PR #10](https://github.com/FTFNAnalytics/digitaldemocracy/pull/10) added Europe / Armenia / New Zealand adapters that map standalone packages into schema v1 at load time. That is the correct **short-term** way to show country folders on the current observatory.

For the Atlas they are **temporary bridges into the master**:

- Keep using them so frozen packages (`site_ingestion_status: pending_adapter`) do not need byte-level rewrites.
- Point their output at SQLite upserts rather than a long-term in-process merge.
- Replace them with first-class master ingest when a package format is stable enough — not in this documentation PR.
- Do not treat adapter-in-memory merge as the architecture to extend for municipal coverage or tightness.

---

## Redirect strategy

When Atlas routes ship (Phase 2), `/electiondatabase` is retired with **permanent redirects** (HTTP 308 or Next.js `permanent: true`) to `/atlas` equivalents. Preserve query strings (`?region=europe`, compare office IDs, explorer filters) wherever the destination page still understands them.

| Old path | New path |
| --- | --- |
| `/electiondatabase` | `/atlas` |
| `/electiondatabase/regions` | `/atlas/regions` |
| `/electiondatabase/countries/:id` | `/atlas/countries/:id` |
| `/electiondatabase/explorer` | `/atlas/explorer` |
| `/electiondatabase/offices/:id` | `/atlas/offices/:id` |
| `/electiondatabase/offices/:id/original` | `/atlas/offices/:id/original` |
| `/electiondatabase/elections/:id` | `/atlas/elections/:id` |
| `/electiondatabase/compare` | `/atlas/compare` |
| `/electiondatabase/calendar` | `/atlas/calendar` |
| `/electiondatabase/polling` | `/atlas/polling` |
| `/electiondatabase/coverage` | `/atlas/coverage` |
| `/electiondatabase/sources` | `/atlas/sources` |
| `/electiondatabase/downloads` | `/atlas/downloads` |
| `/electiondatabase/methodology` | `/atlas/methodology` |
| `/electiondatabase/releases` | `/atlas/releases` |
| `/electiondatabase/about` | `/atlas/about` |
| `/electiondatabase/artifacts/:id` | `/atlas/artifacts/:id` |

Nested paths without a one-to-one Atlas page still redirect to the nearest sensible Atlas equivalent (country index, explorer, or `/atlas`), never to the marketing homepage.

SEO follow-through in the same implementation PR: canonical URLs, sitemap, robots, Open Graph, and JSON-LD `url` / `urlTemplate` values move to `/atlas`. Marketing nav labels may say “Election Atlas” while keeping the rest of the homepage copy.

Do **not** add these redirects in this documentation PR.

---

## Phases

Implementation PRs should land in this order. Each phase must leave `npm run build` green and must not invent election results.

### Phase 0 — Foundations (this document; no runtime change)

- Record accepted decisions (URL, SQLite, Europe, regional depth).
- Inventory ingest inputs: Latin America release, `data/countries/*`, Europe-bound uploads under `data/incoming/`.
- Specify VPS path, permissions, `ATLAS_SQLITE_PATH`, and npm script contract.
- Publish redirect mapping and keep/change list.
- **Exit:** Plan on `main`. Site still serves `/electiondatabase`. No SQLite schema code and no Atlas UI in this phase’s documentation PR.

A later Phase 0 implementation slice (separate PR) may add empty migrations, gitignore for `*.sqlite`, and script stubs without moving routes.

### Phase 1 — Master store and Europe ingest

- Check in SQLite DDL/migrations and import scripts.
- Create `/var/lib/cdd/atlas.sqlite` (or `data/master/atlas.sqlite`) on the VPS; do not commit the file.
- Ingest **European** country packages and Europe-bound uploads into the master. PR #10 adapters act as bridges.
- Optional JSON/Parquet export for debug; master remains SQLite.
- Keep `/electiondatabase` serving until Phase 2 if needed (read from master or continue the current loader during a short dual-run).
- **Do not** compute tightness.
- **Exit:** Deterministic Europe load into SQLite; validation counts recomputed from the DB; Latin America still available as an input, not the default vertical.

### Phase 2 — Public Atlas at `/atlas` and redirects

- Ship Atlas routes under `/atlas` (home, regions, country indexes, regional calendar at minimum).
- Europe is the default landing vertical.
- Enable `/electiondatabase` → `/atlas` redirects, including nested paths in the table above.
- Update SEO canonicals and sitemap.
- Regional calendars/indexes render from master. Municipal rows may appear when a package has them; absence is labelled, not blocked.
- Marketing site unchanged except product links/labels that point at the Atlas.
- **Exit:** A researcher can open `/atlas`, see Europe regional coverage honestly, follow a calendar/index, and reach the same record from an old `/electiondatabase/...` URL.

### Phase 3 — Atlas surfaces and further ingest

- Office, event, explorer, compare, coverage, sources, downloads, methodology, releases — reading SQLite.
- Ingest remaining packages (Latin America release, New Zealand, later Europe uploads) into the same master without changing the Europe-first default.
- Municipal packages attach as they arrive; launch is not waiting on them.
- Retire in-memory gzip merge as the primary query path once Atlas reads are proven.
- **Exit:** One master, one public path, existing research still cited with original IDs; coverage remains partial where research is partial.

### Phase 4 — Derived tightness metrics (after master load)

- Compute tightness **only after** a successful master load, from eligible events already in SQLite.
- Store tightness as derived observations with method version, inputs, and eligibility/withholding reasons.
- Do not backfill tightness inside country-package adapters or chase-tool dumps.
- Optional export of tightness tables as JSON/Parquet debug artifacts.
- Keep imported CI / Pedersen distinct: those remain source-gated metrics, not substitutes for tightness.
- **Exit:** Tightness visible only where eligibility is documented; null stays null; no tightness claim on incomplete municipal series.

---

## Chase-tool alignment

The chase tool is the research-operations surface for collecting dates, sources, and remaining work. The Atlas is the public publication of what has already been chased and packaged. They must share identities; they must not become two competing masters.

| Topic | Alignment |
| --- | --- |
| **Direction of data** | Chase tool → packages / uploads → Atlas import scripts → SQLite master. Atlas does not become the place researchers first record a date. |
| **Identities** | Office IDs, country slugs, history keys, and source IDs used in chase exports must round-trip into master entities. If the chase tool supplies a `chase_item_id`, store it on the completion/issue row. |
| **Calendars** | Regional calendars shipped in Phases 2–3 are projections of chased dates (called / statutory / expected / conditional / unknown). Do not “confirm” a date the chase tool left uncertain. |
| **Coverage queue** | Atlas `coverage` / issues map to chase remaining-work items. Closing a gap happens in research + git/package update, then re-import — not by editing SQLite by hand on the VPS. |
| **Europe first** | Chase and ingest prioritize European regional calendars and indexes. Municipal chase items may exist in packages; Atlas will show them when present and will not wait for a full municipal chase. |
| **Adapters** | PR #10 adapters may translate chase/package tables into master rows. They are bridges, not a second chase UI. |
| **Tightness** | Not a chase-tool field. Chase captures evidence and eligibility; Atlas **derives** tightness in Phase 4 after load. |
| **Exports** | Optional JSON/Parquet shards may be fed back to chase-tool for diffing, but SQLite remains authoritative for the site. |
| **Non-replacement** | Early Atlas phases do not ship an authenticated chase/admin console. Source-backed corrections stay on GitHub. |

If a chase-tool export and a frozen country package disagree, keep both claims with provenance; do not silently prefer the website.

---

## Success metrics

Software success is not research completeness. Research coverage remains partial until a reconciled import says otherwise.

| Metric | Target |
| --- | --- |
| Public path | `/atlas` is the canonical research URL; `/electiondatabase` redirects, including nested paths where mapped. |
| Master store | Production reads `/var/lib/cdd/atlas.sqlite` (or the app-local equivalent). No SQLite binary in git. |
| Ingest | `npm` import scripts create/update that DB from checked-in schemas + European packages / Europe-bound uploads. Repeat import is deterministic. |
| First vertical | Europe is the Atlas default; Russia excluded; coverage labelled partial until a full regional register exists. |
| Depth | Regional calendars and indexes are usable at launch. Municipal completeness is **not** a launch criterion. |
| Continuity | Marketing site still ships. SEO canonicals/sitemap point at Atlas after Phase 2. Existing packages remain ingest inputs. |
| Semantics | Missing ≠ zero; partial dates; score gates; original office IDs. No invented results. |
| Tightness | Absent until Phase 4; then only from master-loaded eligible events. |
| Quality bar | `npm test`, `npm run lint`, `npm run validate:data`, and `npm run build` stay green. |
| Honesty | UI never presents fixture data as production research; never presents Latin America completeness as European completeness. |

---

## Non-goals

- Implementing Atlas UI, SQLite DDL, npm import scripts, or redirects **in this PR**.
- Blocking launch on a complete municipal register for Europe (or anywhere else).
- Committing giant DB files, Parquet lakes, or original zip archives to git.
- Replacing or restyling the marketing homepage as part of Atlas work.
- Reopening `/atlas` vs `/electiondatabase`, SQLite vs JSON-in-git, Europe vs Latin America first, or regional vs municipal launch depth.
- Treating PR #10 in-memory adapters as the permanent query layer.
- Computing tightness (or any new derived index) during package ingest or inside chase-tool.
- Hosted Postgres/MySQL, login, or a chase-tool admin clone on the public site.
- Live scraping or API credentials as a prerequisite to build.
- Including Russia in the Europe vertical.
- Invented geometry, national-to-local swing models, or treating national polling as a local forecast.
- Claiming research coverage is complete because the software build passed.

---

## Current repository snapshot (context, not a commitment to freeze)

As of the mainline that includes [PR #10](https://github.com/FTFNAnalytics/digitaldemocracy/pull/10):

- Observatory routes live under `/electiondatabase` (`lib/observatory/routes.ts`).
- Latin America release loads from `data/research`; country packages merge at runtime via `lib/observatory/adapters/`.
- European packages on disk include Albania, Alderney, Andorra, and Armenia (further Europe uploads may land in parallel). New Zealand is Oceania, not the first Atlas vertical.
- Observatory home still highlights South America. Atlas Phase 2 changes that default to Europe.
- There is **no** SQLite master and **no** `/atlas` route yet.

Operational detail for the current observatory remains in [`docs/electiondatabase-progress.md`](electiondatabase-progress.md) and [`docs/electiondatabase-country-packages.md`](electiondatabase-country-packages.md). Those docs describe the system as it is; this plan describes the system as it will be.
