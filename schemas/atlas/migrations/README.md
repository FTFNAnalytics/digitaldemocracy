# Atlas SQL migrations

Prompt B uses **two databases**. Do not apply both files to the same SQLite file.

| File | Database | Path override | Default |
| --- | --- | --- | --- |
| `0001_atlas_attempt_log.sql` | Durable attempt ledger only | `ATLAS_ATTEMPTS_SQLITE_PATH` | `data/master/atlas-attempts.sqlite` |
| `0002_atlas_master.sql` | Master / staging only | `ATLAS_SQLITE_PATH` | `data/master/atlas.sqlite` |

Each file is a self-contained draft (`BEGIN IMMEDIATE` / `COMMIT`, `schema_migration`, STRICT tables). Execute it on a **new empty** database, outside an existing transaction. Never run either file against an unidentified or live database.

The previous bootstrap (`0001_schema_version.sql` / `schema_version` + `atlas_meta`) is replaced by these two numbered migrations. That bootstrap was not the Atlas entity schema.

Apply with `npm run migrate:atlas`. `npm run import:atlas` stays blocked until the Albania importer is implemented. Albania municipal tiers are approved; Prompt C documentation is complete: [field map](../../../docs/phase1/Albania_Field_Map.md), [identity rules](../../../docs/phase1/Albania_Identity_Rules.md), [acceptance examples](../../../docs/phase1/Albania_Acceptance_Examples.md), [checklist](../../../docs/phase1/Prompt_C_Field_Map_and_CI.md).
