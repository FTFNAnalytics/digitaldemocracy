# Election Atlas — Phase 1 scaffolding

Working notes for the first implementation PR. The contract remains
[atlas-plan.md](atlas-plan.md). This file records what has landed and which
Prompt C gates are automated versus deferred.

`/electiondatabase` stays the live observatory until cutover. **`/atlas` index /
countries / offices exist.** **No redirects.** `/atlas/explorer` is not on main.

Phase 0 inventory drafts (Europe packages, tier files, LatAm/NZ continuity) live
in [docs/phase0/REPORT.md](phase0/REPORT.md). Prompt B / Prompt C artifacts live in
[docs/phase1/](phase1/Phase1_DDL_Rationale.md). Prompt D continuity documentation
and approved-pack import live in [docs/phase2/](phase2/README.md)
(`npm run test:atlas-import` runs in CI). Live `main` as of 2026-09-17 is
summarized at the top of [atlas-plan.md](atlas-plan.md).

## What this PR lands

| Item | Location |
| --- | --- |
| Gitignore SQLite binaries | `.gitignore` (`*.sqlite`, `-wal`, `-shm`, `-journal`; `data/master/` contents) |
| Path override | `ATLAS_SQLITE_PATH` via `lib/atlas/paths.ts`. Default: `data/master/atlas.sqlite`. Production: `/var/lib/cdd/atlas.sqlite` |
| Attempt ledger path | `ATLAS_ATTEMPTS_SQLITE_PATH`. Default: `data/master/atlas-attempts.sqlite`. Production: `/var/lib/cdd/atlas-attempts.sqlite` |
| `npm run migrate:atlas` | `scripts/atlas/migrate.ts` — applies attempt-log SQL to the attempts DB and master SQL to the master DB |
| `npm run import:atlas` | `scripts/atlas/import.ts` — Albania Phase 1 importer plus Andorra / Alderney / Armenia / Belgium / Bosnia and Herzegovina / Bulgaria and approved LatAm/NZ continuity (`ATLAS_IMPORT_SCOPE`) |
| Albania importer | `lib/atlas/albania/` (`import.ts`, `inventory.ts`, `project.ts`, `write.ts`) plus shared `lib/atlas/{ledger,publish,sqlite,identity,apply-migrations}.ts` |
| Attempt-log DDL | `schemas/atlas/migrations/0001_atlas_attempt_log.sql` (**attempts DB only**) |
| Master DDL | `schemas/atlas/migrations/0002_atlas_master.sql` (**master/staging only**) |
| Prompt B rationale | [docs/phase1/Phase1_DDL_Rationale.md](phase1/Phase1_DDL_Rationale.md) |
| Prompt C checklist | [docs/phase1/Prompt_C_Field_Map_and_CI.md](phase1/Prompt_C_Field_Map_and_CI.md) |
| Albania field map | [docs/phase1/Albania_Field_Map.md](phase1/Albania_Field_Map.md) |
| Albania identity rules | [docs/phase1/Albania_Identity_Rules.md](phase1/Albania_Identity_Rules.md) |
| Albania acceptance examples | [docs/phase1/Albania_Acceptance_Examples.md](phase1/Albania_Acceptance_Examples.md) |
| Andorra Prompt J field map | [docs/phase1/andorra/](phase1/andorra/Prompt_J_Field_Map_and_CI.md) — Europe #2 mapping **Done**; importer landed (PR #23) |
| Armenia Prompt L field map | [docs/phase1/armenia/](phase1/armenia/Prompt_L_Tiers_Field_Map_and_CI.md) — Europe #4 mapping **Done**; importer landed (PR #26) |
| Austria Prompt N field map | [docs/phase1/austria/](phase1/austria/Prompt_N_Tiers_Field_Map_and_CI.md) — mapping **Done**; importer CI **Not run** (package on main via PR #11; Atlas importer waits) |
| Bosnia Prompt O field map | [docs/phase1/bosnia-and-herzegovina/](phase1/bosnia-and-herzegovina/Prompt_O_Tiers_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=bosnia`) |
| Bulgaria Prompt P field map | [docs/phase1/bulgaria/](phase1/bulgaria/Prompt_P_Tiers_Field_Map_and_CI.md) — mapping **Done**; importer loads **530** accepted municipal offices only (`ATLAS_IMPORT_SCOPE=bulgaria`; package PR #16 head `de354127`; 3,067 submunicipal held) |
| Belgium Prompt S2 field map | [docs/phase1/belgium-s2/](phase1/belgium-s2/Prompt_S2_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer landed (`ATLAS_IMPORT_SCOPE=belgium`; **1,179 current + 55 historical**) |
| Netherlands Prompt T field map | [docs/phase1/netherlands/](phase1/netherlands/Prompt_T_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer CI **Not run** (research at `data/research/netherlands/`; **432 current + 69 historical accepted**; Atlas importer waits) |
| Switzerland Prompt U field map | [docs/phase1/switzerland/](phase1/switzerland/Prompt_U_Full_Register_Field_Map_and_CI.md) — mapping **Done**; importer CI **Not run** (research at `data/research/switzerland/`; **2,805 current + 11 historical accepted subset**; 308 commune-executive holds; full-register certification OPEN; Atlas importer waits) |
| Named CI | `tests/atlas/import.test.ts` (Prompt C gates) and `tests/atlas/cli.test.ts` (migrate + import CLI) |
| Phase 0 inventory | `docs/phase0/` (`REPORT.md`, `inventory.json`, `continuity-counts.json`, `human-review.json`) |
| Prompt D continuity docs | [docs/phase2/](phase2/README.md) — field maps, identity rules, acceptance examples, checklist; approved-pack importer CI runs (`npm run test:atlas-import`) |
| Tier-classification files | `schemas/atlas/tiers/albania.json` (**approved** municipal); `alderney.json` (**approved** `other`); `andorra.json` (**approved** municipal, Justin 2026-09-16); `armenia.json` (**approved** municipal, Prompt L 2026-09-17; five boundary/calendar reviews remain open); `austria.json` (**approved** 2,034 municipal / 4 regional, Prompt N 2026-09-17; package on main via PR #11; St. Georgen 2015 hold retained; Atlas importer waits); `bosnia-and-herzegovina.json` (**approved** all 13 regional, Prompt O 2026-09-17; package on main via PR #15; RS presidential / coalition / calendar notes retained; importer via `ATLAS_IMPORT_SCOPE=bosnia`); `bulgaria.json` (**530 municipality-wide municipal accepted** / **3,067 district/village held**, Prompt P 2026-09-19; package PR #16 head `de354127`; no regional layer; importer loads 530 only); `belgium.json` (**1,179 current + 55 historical accepted**, Prompt S2 2026-09-19; 1,185 municipal / 15 regional / 2 national / 32 other; research at `data/research/belgium-s2/`; remaining-universe notes retained; importer via `ATLAS_IMPORT_SCOPE=belgium`); `netherlands.json` (**432 current + 69 historical accepted**, Prompt T 2026-09-19; 414 municipal / 12 regional / 3 national / 72 other; research at `data/research/netherlands/`; Hilversum/Wijdemeren and ~147 focused-tier reviews retained; Atlas importer waits); `switzerland.json` (**2,805 current + 11 historical accepted subset**, Prompt U 2026-09-19; 2,402 municipal / 52 regional / 2 national / 360 other; research at `data/research/switzerland/`; 308 commune-executive holds, thin historic, 1,938 parliament caveats retained; full-register certification OPEN; Atlas importer waits) |

`migrate:atlas` may create local gitignored DBs with empty typed tables. Empty schema is **not** Phase 1 exit. `import:atlas` against the frozen Albania package is the storage proof: 122 offices, 366 selected histories, 3,843 result rows, 122 municipal / 0 regional, 185 sources (182 catalogue + 3 inline), 122 briefings retained, proceedings=0, party_mappings=0.

CI and local tests **must** set `ATLAS_SQLITE_PATH` / `ATLAS_ATTEMPTS_SQLITE_PATH` to temporary files. Never point them at the VPS production paths unless deliberately operating production.

**Albania tiers are approved.** Justin approved `schemas/atlas/tiers/albania.json`
on 2026-09-16: 122 municipal offices, regional=0 by design. The importer hashes
the accepted bytes (SHA-256 `53a31d441761952a9f511c58a397e7877616c0ad6af30dce7587bcb6bcbbd93d`).
Do not reuse a draft-path fingerprint.

Alderney `other` is **approved** (2026-09-16); Channel Islands are low priority
for the broader Atlas. Andorra Prompt J docs are in
[docs/phase1/andorra/](phase1/andorra/README.md); the Andorra importer landed
(PR #23). Alderney Prompt K docs are in
[docs/phase1/alderney/](phase1/alderney/README.md); the Alderney importer landed
(PR #24). Armenia Prompt L docs are in
[docs/phase1/armenia/](phase1/armenia/README.md); the Armenia importer landed
(PR #26). Geographic tiers are **approved** (71 municipal / 0 regional). Five
boundary/calendar research reviews remain open separately from tier approval.
Austria Prompt N docs are in
[docs/phase1/austria/](phase1/austria/README.md) (mapping Done; execution CI Not run);
geographic tiers are **approved** (2,034 municipal / 4 regional). The Austria
package is on main (PR #11, `f0f2c86`); the Atlas importer waits. Publication hold
`AT-OOE-41119-M::2015::` and open calendar/boundary notes remain.
Bosnia Prompt O docs are in
[docs/phase1/bosnia-and-herzegovina/](phase1/bosnia-and-herzegovina/README.md)
(mapping Done; importer landed). Geographic tiers are **approved** (all 13
regional). The Bosnia package is on main (PR #15, `33454ab`). Import with
`ATLAS_IMPORT_SCOPE=bosnia` (do not use `all` on the VPS for this lineage).
Open RS presidential replacement/repeat, governing coalition, and
2026-10-04 calendar-certainty notes remain; do not invent Brčko or municipal
offices.
Bulgaria Prompt P docs are in
[docs/phase1/bulgaria/](phase1/bulgaria/README.md)
(mapping Done; importer landed). Justin accepted **530** municipality-wide
municipal rows (265 Mayor + 265 Municipal council) on 2026-09-19 and **held
3,067** district/village rows for submunicipal policy. Regional count is 0; do
not invent a regional layer. `ATLAS_IMPORT_SCOPE=bulgaria` loads only the 530
accepted rows unless policy changes. Градец / qualification-change notes remain
open. The country package is the PR #16 tree (`de354127`). See
[Bulgaria_Import.md](phase1/bulgaria/Bulgaria_Import.md).
Belgium Prompt S2 docs are in
[docs/phase1/belgium-s2/](phase1/belgium-s2/README.md)
(mapping Done; importer landed). Justin accepted **1,179 current + 55
historical** offices on 2026-09-19 (municipality pairs plus
district/OCMW/provincial/parliament/other). Standing policy retains offices and
historic rows outside the ~18-month window. Remaining-universe indirect-body
gaps, Bilzen / Saint-Josse / 35 unbound IBZ 2000 notes stay open. Research
tables land at `data/research/belgium-s2/`. Import with
`ATLAS_IMPORT_SCOPE=belgium` (do not use `all` on the VPS for this lineage).
Frozen PR #14 screening extract is not overwritten.
Netherlands Prompt T docs are in
[docs/phase1/netherlands/](phase1/netherlands/README.md)
(mapping Done; execution CI Not run). Justin accepted **432 current + 69
historical** offices on 2026-09-19. Standing policy retains offices and
historic rows outside the ~18-month window. Hilversum/Wijdemeren merger
successor binding, named historic gaps, and ~147 focused-tier reviews stay
open. Appointed mayors: no mayoral election rows. Research tables land at
`data/research/netherlands/`; Atlas importer waits. Slim pack omitted bulky
sources; do not invent those bytes.
Switzerland Prompt U docs are in
[docs/phase1/switzerland/](phase1/switzerland/README.md)
(mapping Done; execution CI Not run). Justin accepted the **evidenced subset:
2,805 current + 11 historical** offices on 2026-09-19. Accepted-with-holds /
approved subset only. Full-register certification remains OPEN. HOLD: 308
commune-executive gaps (VD 284, SZ 24), thin historic/merger archive, 1,938
parliament caveats, and mode-variance / disputed result rows. Do not invent
missing commune executives or fabricate merger histories. Research tables land
at `data/research/switzerland/`; Atlas importer waits. Slim pack omitted bulky
sources; do not invent those bytes.

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
| Existing project gates | **Required in CI.** `npm test`, `npm run lint`, `npm run validate:data`, `npm run build`. `/atlas` index/countries/offices exist; `/electiondatabase` still live; no redirects. | `.github/workflows/ci.yml`, `tests/atlas/routes.test.ts` |

## Phase 1 exit criteria (not all claimed here)

From [atlas-plan.md](atlas-plan.md) Phase 1. Exit only when all of these are done:

1. Phase 1 PRs added no public routes. Later PRs added `/atlas` index/countries/offices; `/electiondatabase` remains live; **no redirects**.
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
| Prompt D continuity docs | **Documentation complete** in [docs/phase2/](phase2/README.md). Approved LatAm/NZ packs import; residual-heavy drafts skipped. No invented tiers. Production Mexico override still original 67. |
| Andorra Prompt J field map | **Documentation complete** in [docs/phase1/andorra/](phase1/andorra/README.md). Importer landed (PR #23). |
| Alderney Prompt K / Armenia Prompt L | Importers landed (PRs #24 / #26). Tiers approved. |
| Austria Prompt N field map | **Documentation complete** in [docs/phase1/austria/](phase1/austria/README.md). Mapping Done; importer CI Not run. Package on main via PR #11. Approved `austria.json` is 2,034 municipal / 4 regional. |
| Bosnia Prompt O field map | **Documentation complete** in [docs/phase1/bosnia-and-herzegovina/](phase1/bosnia-and-herzegovina/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=bosnia`). Package on main via PR #15. Approved `bosnia-and-herzegovina.json` is all 13 regional. |
| Bulgaria Prompt P field map | **Importer landed** in [docs/phase1/bulgaria/](phase1/bulgaria/README.md). Mapping Done. `ATLAS_IMPORT_SCOPE=bulgaria` publishes 530 accepted municipal offices / 0 regional. Package PR #16 head `de354127`. 3,067 district/village rows stay held. |
| Belgium Prompt S2 field map | **Documentation complete** in [docs/phase1/belgium-s2/](phase1/belgium-s2/README.md). Mapping Done; importer landed (`ATLAS_IMPORT_SCOPE=belgium`). Research at `data/research/belgium-s2/`. `belgium.json` is 1,179 current + 55 historical accepted (1,185 municipal / 15 regional / 2 national / 32 other). |
| Netherlands Prompt T field map | **Documentation complete** in [docs/phase1/netherlands/](phase1/netherlands/README.md). Mapping Done; importer CI Not run. Research at `data/research/netherlands/`. `netherlands.json` is 432 current + 69 historical accepted (414 municipal / 12 regional / 3 national / 72 other). |
| Switzerland Prompt U field map | **Documentation complete** in [docs/phase1/switzerland/](phase1/switzerland/README.md). Mapping Done; importer CI Not run. Research at `data/research/switzerland/`. `switzerland.json` is 2,805 current + 11 historical accepted subset (2,402 municipal / 52 regional / 2 national / 360 other). 308 commune-executive holds remain. Full-register certification OPEN. |

Still out of scope: `/atlas/explorer`, redirects, cutover, residual-heavy draft packs, tightness, and an Austria Atlas importer. Austria **package** and Prompt N approved tiers are on main (PRs #11 / #28). Prompt M 95 sibling withholds: disposition accepted 2026-09-17 and docs PR #27 landed; production override remains 67.
