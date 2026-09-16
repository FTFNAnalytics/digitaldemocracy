# Election Atlas — Phase 1 scaffolding

Working notes for the first implementation PR. The contract remains
[atlas-plan.md](atlas-plan.md). This file records what has landed and which
Prompt C gates are automated versus deferred.

`/electiondatabase` stays the live observatory. **No `/atlas` routes or redirects.**

Phase 0 inventory drafts (Europe packages, tier files, LatAm/NZ continuity) live
in [docs/phase0/REPORT.md](phase0/REPORT.md). Prompt B / Prompt C artifacts live in
[docs/phase1/](phase1/Phase1_DDL_Rationale.md). Prompt D continuity documentation
(LatAm/NZ field maps; implementation CI Not run) lives in
[docs/phase2/](phase2/README.md).

## What this PR lands

| Item | Location |
| --- | --- |
| Gitignore SQLite binaries | `.gitignore` (`*.sqlite`, `-wal`, `-shm`, `-journal`; `data/master/` contents) |
| Path override | `ATLAS_SQLITE_PATH` via `lib/atlas/paths.ts`. Default: `data/master/atlas.sqlite`. Production: `/var/lib/cdd/atlas.sqlite` |
| Attempt ledger path | `ATLAS_ATTEMPTS_SQLITE_PATH`. Default: `data/master/atlas-attempts.sqlite`. Production: `/var/lib/cdd/atlas-attempts.sqlite` |
| `npm run migrate:atlas` | `scripts/atlas/migrate.ts` — applies attempt-log SQL to the attempts DB and master SQL to the master DB |
| `npm run import:atlas` | `scripts/atlas/import.ts` — Albania Phase 1 importer (atomic publish + durable attempt ledger) |
| Albania importer | `lib/atlas/albania/` (`import.ts`, `inventory.ts`, `project.ts`, `write.ts`) plus shared `lib/atlas/{ledger,publish,sqlite,identity,apply-migrations}.ts` |
| Attempt-log DDL | `schemas/atlas/migrations/0001_atlas_attempt_log.sql` (**attempts DB only**) |
| Master DDL | `schemas/atlas/migrations/0002_atlas_master.sql` (**master/staging only**) |
| Prompt B rationale | [docs/phase1/Phase1_DDL_Rationale.md](phase1/Phase1_DDL_Rationale.md) |
| Prompt C checklist | [docs/phase1/Prompt_C_Field_Map_and_CI.md](phase1/Prompt_C_Field_Map_and_CI.md) |
| Albania field map | [docs/phase1/Albania_Field_Map.md](phase1/Albania_Field_Map.md) |
| Albania identity rules | [docs/phase1/Albania_Identity_Rules.md](phase1/Albania_Identity_Rules.md) |
| Albania acceptance examples | [docs/phase1/Albania_Acceptance_Examples.md](phase1/Albania_Acceptance_Examples.md) |
| Named CI | `tests/atlas/import.test.ts` (Prompt C gates) and `tests/atlas/cli.test.ts` (migrate + import CLI) |
| Phase 0 inventory | `docs/phase0/` (`REPORT.md`, `inventory.json`, `continuity-counts.json`, `human-review.json`) |
| Prompt D continuity docs | [docs/phase2/](phase2/README.md) — field maps, identity rules, acceptance examples, checklist (**documentation complete; importer CI Not run**) |
| Tier-classification files | `schemas/atlas/tiers/albania.json` (**approved** municipal); `alderney.json` (**approved** `other`); `andorra.json` (**approved** municipal, Justin 2026-09-16); `armenia.json` (`draft_for_human_review`) |

`migrate:atlas` may create local gitignored DBs with empty typed tables. Empty schema is **not** Phase 1 exit. `import:atlas` against the frozen Albania package is the storage proof: 122 offices, 366 selected histories, 3,843 result rows, 122 municipal / 0 regional, 185 sources (182 catalogue + 3 inline), 122 briefings retained, proceedings=0, party_mappings=0.

CI and local tests **must** set `ATLAS_SQLITE_PATH` / `ATLAS_ATTEMPTS_SQLITE_PATH` to temporary files. Never point them at the VPS production paths unless deliberately operating production.

**Albania tiers are approved.** Justin approved `schemas/atlas/tiers/albania.json`
on 2026-09-16: 122 municipal offices, regional=0 by design. The importer hashes
the accepted bytes (SHA-256 `53a31d441761952a9f511c58a397e7877616c0ad6af30dce7587bcb6bcbbd93d`).
Do not reuse a draft-path fingerprint.

Alderney `other` is **approved** (2026-09-16); Channel Islands are low priority
for the broader Atlas. Andorra and Armenia remain drafts.

### Fingerprint `schema_inputs` paths

[Albania_Identity_Rules.md](phase1/Albania_Identity_Rules.md) names DDL
`schema_inputs` as `001_atlas_attempt_log.sql` and `001_atlas_master.sql`,
with SHA-256 `e36a15fa7952a1561c17ee663b2544bc43544a7bf1d2e3688ceabf648a8ff4d1`
and `1c59e81705d2f6172ca4c0e4aea9b4e390c6fa7606ba305a244756ff7e7af8da`.

Checked-in migrations are `0001_atlas_attempt_log.sql` and
`0002_atlas_master.sql`. Those files currently have the **same bytes** (and
therefore the same hashes) as the Identity Rules entries. Fingerprint
`schema_inputs` **paths** use the checked-in migration filenames.
Do not rewrite the Identity Rules hashes unless the SQL bytes differ.

## Prompt C automated CI vs deferred

Gates from [Prompt_C_Field_Map_and_CI.md](phase1/Prompt_C_Field_Map_and_CI.md)
§ “Phase 1 required automated CI assertions”:

| Gate | Status | Where |
| --- | --- | --- |
| Fresh migration | **Automated.** Both SQL files on separate new DBs; unexpected existing schema refused; version/description match. | `tests/atlas/cli.test.ts` |
| Actual Albania fidelity | **Automated.** Counts plus spot ID/value equality (AL-13-M geo, event-9b7cd1a6a6d27850e712e6a7, r0 Arif 4564 / NULL seats, r1 Bedri 4515, AL-13-C r8 zero seats, URL alias → Sfaae00802d, Rrogozhinë May 2023 absent, 163 files + T retained, crosscheck not an event). | `tests/atlas/import.test.ts`, `assertAlbaniaFidelity` |
| Unchanged re-import | **Automated.** New `attempt_id`, same `release_id` / fingerprint, one immutable `dataset_release` row. | `tests/atlas/import.test.ts` |
| Corrected import | **Partial.** Calendar-cohort mutant in an isolated package copy yields a new release, retains prior `dataset_release`, preserves office/event IDs, still 122 municipal. **TODO (Prompt C “Corrected import”):** mutant D-row votes + documented override restoring 4564; D-row reorder keeping Arif r0; identity-label mutation without binding must fail. | `tests/atlas/import.test.ts` calendar copy; override path not implemented |
| Poison rollback | **Automated.** Dangling source FK after staged writes; failure before rename; broken history URL. Failed attempt, `successful_release_id` NULL, prior published bytes unchanged, staging discarded. | `tests/atlas/import.test.ts` |
| Namespace and public IDs | **Partial.** Documented geo/event IDs and catalogue URL alias. **TODO (Prompt C “Namespace and public IDs”):** separate-namespace non-cross-link fixture; wrong-namespace child FK insert. | identity unit tests + fidelity |
| Broken references | **Automated** for known omitted source / FK check / integrity_check. Typed locators exist for imported rows. | `assertIntegrity`, poison/broken-source tests |
| Unresolved evidence | **Deferred.** **TODO (Prompt C “Unresolved evidence” / Example 7):** empty-catalogue resolver unit fixture for an unmatched token. Baseline has no unmatched citation; omitting a known source is fail-closed, not unresolved. | — |
| Missing ≠ zero | **Automated.** Arif seats NULL/unknown vs Agrare 0/zero; 399 missing / 1876 zero; CHECK rejects NULL+zero and 0+unknown. | `tests/atlas/import.test.ts` |
| Precision, certainty, conflicts | **Partial.** All 366 baseline dates stored as day precision. **TODO (Prompt C “Precision, certainty, conflicts” / Examples 5–6):** month/year information-loss overrides; invalid-day fail; conflicting-claim withhold fixture on AL-52-M July event. | baseline day dates only |
| Tier source and empty state | **Automated.** Register SHA + 122 municipal / 0 regional; calendar `Tier` mutation does not change stored classifications; missing T and non-approved T fail closed with a durable failed attempt. | `tests/atlas/import.test.ts` |
| Fixture exclusion | **Automated.** `OBSERVATORY_FIXTURES=1` cannot publish; FIX-/FXT- tokens in retained JSON fail; SQL prefix CHECKs remain. | `tests/atlas/import.test.ts` |
| Score gates | **Automated as retained-input check.** No tightness/competition table is created; 45 control + 1 poll survive in `retained_input.payload_json`. Albania extract has no `score_gate` boolean to invent. | `tests/atlas/import.test.ts` |
| Incomplete refresh | **Deferred.** **TODO (Prompt C “Incomplete refresh” / Example 8):** omit AL-13-M from a later incomplete package and require carry-forward. | — |
| Publication continuity | **Deferred.** **TODO (Prompt C “Publication continuity”):** small metadata fixture for additional lineage IDs without a LatAm load. | — |
| Filesystem publication / recovery | **Partial.** Same-FS staging, WAL checkpoint, atomic rename, fsync, writer lock, interrupted `started` reconciliation. **TODO (Prompt C “Filesystem publication / recovery”):** busy WAL, fsync failure injection, crash-before/after-rename, never-delete-live-WAL probes. | `lib/atlas/publish.ts`, `lib/atlas/ledger.ts` |
| Restore | **Deferred.** **TODO (Prompt C “Restore”):** restore a known prior snapshot into a scratch path and verify schema/release/office content. Prior release metadata is retained on corrected import; full snapshot restore is not yet a named test. | — |
| Existing project gates | **Required in CI.** `npm test`, `npm run lint`, `npm run validate:data`, `npm run build`. No public route changes. | `.github/workflows/ci.yml`, `tests/atlas/routes.test.ts` |

## Phase 1 exit criteria (not all claimed here)

From [atlas-plan.md](atlas-plan.md) Phase 1. Exit only when all of these are done:

1. No public route changes (still true after this PR).
2. `.gitignore` for `*.sqlite` / `data/master/` (this PR).
3. `ATLAS_SQLITE_PATH` (this PR) and `ATLAS_ATTEMPTS_SQLITE_PATH` (this PR).
4. `migrate:atlas` / `import:atlas` entrypoints (this PR; import is the Albania importer).
5. **DDL reviewed** against the identity table (Prompt B draft is checked in).
6. **Albania tier-classification file** checked in and **approved** (122 municipal; not calendar cohort strings).
7. **Albania import proof** into SQLite (atomic publish, failed-import rollback, unchanged re-import → new `attempt_id` / same `release_id`) — implemented; CI covers the named rows above.
8. Named ingest acceptance rows as **required automated CI tests** — implemented for the automated subset; deferred rows are TODOs tied to the Prompt C table.
9. VPS path readiness allowed as ops hygiene — **not** an exit.

Then **stop for Phase 2 review**. Empty `/var/lib/cdd/atlas.sqlite` is not an exit.
A zero regional-tier numerator for Albania does not fail storage proof.

Deferred Prompt C rows above are **not** waived. They remain required before claiming a full Phase 1 exit against every checklist row.

## Remaining artifacts / review

| Artifact | Status in this PR |
| --- | --- |
| Full entity DDL | Prompt B draft checked in (`0001_atlas_attempt_log.sql` + `0002_atlas_master.sql`). |
| Prompt C field map | **Documentation complete.** Mapping specified; importer CI now runs the automated subset. |
| Albania importer | **Landed** for the frozen Albania package. `import:atlas` publishes lineage `country-package-albania`. |
| Albania tier file | **Approved** 2026-09-16 at `schemas/atlas/tiers/albania.json` (122 municipal office IDs; regional=0 intentional). |
| Alderney `other` | **Approved** 2026-09-16 at `schemas/atlas/tiers/alderney.json`. |
| Albania map | Proposed 46-municipality 2027 map is unverified in the package; geometry is not invented. |
| Prompt D continuity docs | **Documentation complete** in [docs/phase2/](phase2/README.md). No LatAm/NZ importer, invented tiers, or Mexico share edits. |

Also out of scope until later phases: `/atlas` UI, redirects, VPS deploy, Latin America / NZ ingest, tightness. Armenia remains last among early European targets. Prompt D prerequisites still open: 21 LatAm country tier files + NZ tier file (approved), Mexico share overrides, multi-lineage import.
