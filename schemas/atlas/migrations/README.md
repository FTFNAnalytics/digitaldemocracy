# Atlas SQL migrations

Prompt B uses **two databases**. Do not apply both files to the same SQLite file.

| File | Database | Path override | Default |
| --- | --- | --- | --- |
| `0001_atlas_attempt_log.sql` | Durable attempt ledger only | `ATLAS_ATTEMPTS_SQLITE_PATH` | `data/master/atlas-attempts.sqlite` |
| `0002_atlas_master.sql` | Master / staging only | `ATLAS_SQLITE_PATH` | `data/master/atlas.sqlite` |
| `0003_atlas_derived.sql` | Master / staging only, after 0002 | `ATLAS_SQLITE_PATH` | `data/master/atlas.sqlite` |
| `0004_atlas_search.sql` | Master / staging only, after 0003 | `ATLAS_SQLITE_PATH` | `data/master/atlas.sqlite` |
| `0005_atlas_boundary.sql` | Master / staging only, after 0004 | `ATLAS_SQLITE_PATH` | `data/master/atlas.sqlite` |
| `0006_atlas_office_slug.sql` | Master / staging only, after 0005 | `ATLAS_SQLITE_PATH` | `data/master/atlas.sqlite` |

Each file is a self-contained draft (`BEGIN IMMEDIATE` / `COMMIT`, `schema_migration`, STRICT tables). Execute it on a **new empty** database, outside an existing transaction. Never run either file against an unidentified or live database.

The previous bootstrap (`0001_schema_version.sql` / `schema_version` + `atlas_meta`) is replaced by these two numbered migrations. That bootstrap was not the Atlas entity schema.

Apply with `npm run migrate:atlas`. `0002_atlas_master.sql` records `schema_migration` version 1. Later master files are incremental and run after that version, in filename order. Each one inserts its own version number. `0003_atlas_derived.sql` records version 3 (`Atlas derived projections`), creates empty `derived_` tables, and does not modify master rows. `npm run derive:atlas` rebuilds those tables, the office slugs, and the search indexes. `0004_atlas_search.sql` records version 4 (`Atlas search indexes`). FTS5 is not compiled into `node:sqlite` here, so 0004 creates trigram posting tables (`search_seat`, `search_cycle`, `search_candidate`) instead of FTS5 virtual tables. `0005_atlas_boundary.sql` records version 5 (`Atlas boundary crosswalk`) and does not alter `geography`. `0006_atlas_office_slug.sql` records version 6 (`Atlas office slugs`) and stores the readable seat slug for each office. `npm run import:atlas` loads the frozen Albania package into the master DB (atomic publish + durable attempt ledger) and rebuilds derived rows in the staged file before the swap. Albania municipal tiers are approved; Prompt C documentation is complete: [field map](../../../docs/phase1/Albania_Field_Map.md), [identity rules](../../../docs/phase1/Albania_Identity_Rules.md), [acceptance examples](../../../docs/phase1/Albania_Acceptance_Examples.md), [checklist](../../../docs/phase1/Prompt_C_Field_Map_and_CI.md). Use temporary `ATLAS_SQLITE_PATH` / `ATLAS_ATTEMPTS_SQLITE_PATH` in CI.
