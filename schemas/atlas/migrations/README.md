# Atlas SQL migrations

Versioned DDL for the Election Atlas SQLite master (`ATLAS_SQLITE_PATH`).

Filename pattern: `NNNN_name.sql` (four-digit version, snake_case name).

`0001_schema_version.sql` is **bootstrap only** (`schema_version` + `atlas_meta`). It is not the Atlas entity schema.

Do not add office, event, geography, or release tables here until the ChatGPT DDL draft is reviewed against the identity rules in [docs/atlas-plan.md](../../../docs/atlas-plan.md).

Apply with `npm run migrate:atlas`.
