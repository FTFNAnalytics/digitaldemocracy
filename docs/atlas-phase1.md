# Election Atlas — Phase 1 scaffolding

Working notes for the first implementation PR. The contract remains
[atlas-plan.md](atlas-plan.md). This file only records what scaffolding has
landed and what is still blocked.

`/electiondatabase` stays the live observatory. **No `/atlas` routes or redirects.**

## What this PR lands

| Item | Location |
| --- | --- |
| Gitignore SQLite binaries | `.gitignore` (`*.sqlite`, `-wal`, `-shm`, `-journal`; `data/master/` contents) |
| Path override | `ATLAS_SQLITE_PATH` via `lib/atlas/paths.ts`. Default: `data/master/atlas.sqlite`. Production: `/var/lib/cdd/atlas.sqlite` |
| `npm run migrate:atlas` | `scripts/atlas/migrate.ts` — applies bootstrap SQL only |
| `npm run import:atlas` | `scripts/atlas/import.ts` — exits non-zero with a blocked message |
| Migrations folder | `schemas/atlas/migrations/0001_schema_version.sql` (`schema_version` + `atlas_meta`) |
| Tier-file placeholder | `schemas/atlas/tiers/README.md` (no Albania classifications yet) |

`migrate:atlas` may create a local gitignored DB with meta tables. That is **not**
Albania storage proof and is **not** a Phase 1 exit.

## Phase 1 exit criteria (not claimed here)

From [atlas-plan.md](atlas-plan.md) Phase 1. Exit only when all of these are done:

1. No public route changes (still true after this PR).
2. `.gitignore` for `*.sqlite` / `data/master/` (this PR).
3. `ATLAS_SQLITE_PATH` (this PR).
4. `migrate:atlas` / `import:atlas` entrypoints (this PR; import is still a stub).
5. **DDL reviewed** against the identity table (lineage `release_id` vs `attempt_id`, namespaced office/event keys, unresolved evidence, publication set).
6. **Albania tier-classification file** checked in (not calendar cohort strings).
7. **Albania import proof** into SQLite (atomic publish, failed-import rollback, unchanged re-import → new `attempt_id` / same `release_id`).
8. Named ingest acceptance rows as **required automated CI tests**.
9. VPS path readiness allowed as ops hygiene — **not** an exit.

Then **stop for Phase 2 review**. Empty `/var/lib/cdd/atlas.sqlite` is not an exit.
A zero regional-tier numerator for Albania does not fail storage proof.

## Blocked on ChatGPT artifacts

Do not invent these in a follow-up until the drafts are reviewed:

| Artifact | Why it waits |
| --- | --- |
| Full entity DDL | Must implement identity/uniqueness/crosswalk rules in the plan |
| Albania tier file | Authoritative `GovernmentTier` map for 122 office IDs |
| Albania map | Proposed 46-municipality 2027 map is unverified in the package; geometry is not invented |

Also out of scope until later phases: `/atlas` UI, redirects, VPS deploy, Latin America / NZ ingest, tightness.
