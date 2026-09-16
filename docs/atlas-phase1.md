# Election Atlas — Phase 1 scaffolding

Working notes for the first implementation PR. The contract remains
[atlas-plan.md](atlas-plan.md). This file only records what scaffolding has
landed and what is still blocked.

`/electiondatabase` stays the live observatory. **No `/atlas` routes or redirects.**

Phase 0 inventory drafts (Europe packages, tier files, LatAm/NZ continuity) live
in [docs/phase0/REPORT.md](phase0/REPORT.md). Prompt B / Prompt C artifacts live in
[docs/phase1/](phase1/Phase1_DDL_Rationale.md).

## What this PR lands

| Item | Location |
| --- | --- |
| Gitignore SQLite binaries | `.gitignore` (`*.sqlite`, `-wal`, `-shm`, `-journal`; `data/master/` contents) |
| Path override | `ATLAS_SQLITE_PATH` via `lib/atlas/paths.ts`. Default: `data/master/atlas.sqlite`. Production: `/var/lib/cdd/atlas.sqlite` |
| Attempt ledger path | `ATLAS_ATTEMPTS_SQLITE_PATH`. Default: `data/master/atlas-attempts.sqlite`. Production: `/var/lib/cdd/atlas-attempts.sqlite` |
| `npm run migrate:atlas` | `scripts/atlas/migrate.ts` — applies attempt-log SQL to the attempts DB and master SQL to the master DB |
| `npm run import:atlas` | `scripts/atlas/import.ts` — exits non-zero until an **approved** Albania tier file and importer implementation |
| Attempt-log DDL | `schemas/atlas/migrations/0001_atlas_attempt_log.sql` (**attempts DB only**) |
| Master DDL | `schemas/atlas/migrations/0002_atlas_master.sql` (**master/staging only**) |
| Prompt B rationale | [docs/phase1/Phase1_DDL_Rationale.md](phase1/Phase1_DDL_Rationale.md) |
| Prompt C checklist | [docs/phase1/Prompt_C_Field_Map_and_CI.md](phase1/Prompt_C_Field_Map_and_CI.md) (**documentation complete**) |
| Albania field map | [docs/phase1/Albania_Field_Map.md](phase1/Albania_Field_Map.md) |
| Albania identity rules | [docs/phase1/Albania_Identity_Rules.md](phase1/Albania_Identity_Rules.md) |
| Albania acceptance examples | [docs/phase1/Albania_Acceptance_Examples.md](phase1/Albania_Acceptance_Examples.md) |
| Phase 0 inventory | `docs/phase0/` (`REPORT.md`, `inventory.json`, `continuity-counts.json`, `human-review.json`) |
| Tier-classification files | `schemas/atlas/tiers/{albania,andorra,armenia}.json` (`draft_for_human_review`); `alderney.json` (`approved`) |

`migrate:atlas` may create local gitignored DBs with empty typed tables. That is
**not** Albania storage proof and is **not** a Phase 1 exit. Schema creates
**zero** office / country / release rows.

**Prompt C documentation is complete.** That is the field map, identity rules,
acceptance examples, and the completed checklist. It is **not** Albania ingest
and does **not** unblock `import:atlas`.

`import:atlas` stays blocked until **both**:

1. `schemas/atlas/tiers/albania.json` is accepted with `status: "approved"` (Justin must explicitly approve; this PR does not change the draft), and
2. the Albania importer is implemented.

The Albania tier file remains `draft_for_human_review`. It is not an accepted
classifier until reviewed like DDL. Alderney `other` is **approved**
(2026-09-16); Channel Islands are low priority for the broader Atlas.

### Fingerprint `schema_inputs` paths

[Albania_Identity_Rules.md](phase1/Albania_Identity_Rules.md) names DDL
`schema_inputs` as `001_atlas_attempt_log.sql` and `001_atlas_master.sql`,
with SHA-256 `e36a15fa7952a1561c17ee663b2544bc43544a7bf1d2e3688ceabf648a8ff4d1`
and `1c59e81705d2f6172ca4c0e4aea9b4e390c6fa7606ba305a244756ff7e7af8da`.

Checked-in migrations are `0001_atlas_attempt_log.sql` and
`0002_atlas_master.sql`. Those files currently have the **same bytes** (and
therefore the same hashes) as the Identity Rules entries. Fingerprint
`schema_inputs` **paths** should track the checked-in migration filenames.
Do not rewrite the Identity Rules hashes unless the SQL bytes differ.

## Phase 1 exit criteria (not claimed here)

From [atlas-plan.md](atlas-plan.md) Phase 1. Exit only when all of these are done:

1. No public route changes (still true after this PR).
2. `.gitignore` for `*.sqlite` / `data/master/` (this PR).
3. `ATLAS_SQLITE_PATH` (this PR) and `ATLAS_ATTEMPTS_SQLITE_PATH` (this PR).
4. `migrate:atlas` / `import:atlas` entrypoints (this PR; import is still a stub).
5. **DDL reviewed** against the identity table (lineage `release_id` vs `attempt_id`, namespaced office/event keys, unresolved evidence, publication set). Prompt B draft is checked in; it is not Albania ingest.
6. **Albania tier-classification file** checked in (draft in this PR; still needs human review, not calendar cohort strings).
7. **Albania import proof** into SQLite (atomic publish, failed-import rollback, unchanged re-import → new `attempt_id` / same `release_id`).
8. Named ingest acceptance rows as **required automated CI tests**.
9. VPS path readiness allowed as ops hygiene — **not** an exit.

Then **stop for Phase 2 review**. Empty `/var/lib/cdd/atlas.sqlite` is not an exit.
A zero regional-tier numerator for Albania does not fail storage proof.

## Blocked on remaining artifacts / review

| Artifact | Status in this PR |
| --- | --- |
| Full entity DDL | Prompt B draft checked in (`0001_atlas_attempt_log.sql` + `0002_atlas_master.sql`). Not Albania storage proof. |
| Prompt C field map | **Documentation complete.** [Checklist](phase1/Prompt_C_Field_Map_and_CI.md), [field map](phase1/Albania_Field_Map.md), [identity rules](phase1/Albania_Identity_Rules.md), [acceptance examples](phase1/Albania_Acceptance_Examples.md). Mapping specified; importer CI has not run. |
| Albania importer | Still blocked. Needs approved `schemas/atlas/tiers/albania.json` **and** importer implementation. `import:atlas` exits non-zero. |
| Albania tier file | Draft at `schemas/atlas/tiers/albania.json` (122 municipal office IDs). Needs explicit human approval before ingest. Do not silently set `approved`. |
| Alderney `other` | **Approved** 2026-09-16 at `schemas/atlas/tiers/alderney.json`. Channel Islands are low priority for the broader Atlas. |
| Albania map | Proposed 46-municipality 2027 map is unverified in the package; geometry is not invented. |

Also out of scope until later phases: `/atlas` UI, redirects, VPS deploy, Latin America / NZ ingest, tightness. Armenia remains last among early European targets.
