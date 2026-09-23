# Iceland full register — Prompt AV / ACCEPTED WITH HOLDS

**63 current + 24 historical-only offices (87 total); 277 events; 393 result records in the full pack.** Draft tiers: 85 municipal / 2 national (87 rows, 1:1). Justin accepted 2026-09-23 (America/Edmonton) with holds **IS-G01** and **IS-G06** left open.

Start: [JUSTIN_ACCEPTANCE.md](JUSTIN_ACCEPTANCE.md) and [JUSTIN_REPORT.md](JUSTIN_REPORT.md). Tiers: `schemas/atlas/tiers/iceland.json` (included as supplied). This land is docs and tiers only. There is no `data/research/iceland/` tree and no importer.

`research_coverage_complete` stays false. Current offices are 61 municipal councils + Alþingi + the President of Iceland. Historical-only municipal offices are 24. Municipal events 2014/2018/2022/2026 are 74/72/64/61 (271). Direct municipal executives are 0. The only current direct executive is the President. European Parliament offices are 0. The identity crosswalk has 24 source-supported predecessor→successor links. No guessed merger edge was added.

Named holds stay open:

- IS-G01 — municipal numeric vectors (`open_nonblocking_for_office_event_register`). Untranscribed vote and share cells stay null / `not_transcribed`, never 0.
- IS-G06 — 2018 turnout source views (`open_documented_discrepancy`). Official views stay distinct. No forced reconciliation.

IS-G02, IS-G03, IS-G04, and IS-G05 were already closed in the pack. This land does not reopen them and does not close IS-G01 or IS-G06.

`applied_changes=0`. No importer, SQLite, VPS, or UI. Execution CI **Not run**. Slim land omits `sources/`, `events.json`, and `results.json` (see [SLIM_LAND_NOTE.md](SLIM_LAND_NOTE.md) and [SHA256SUMS](SHA256SUMS)). `metadata.json`, `human-review.json`, and `JUSTIN_REPORT.md` stay the pre-acceptance receipt: approvals unchecked. Per-office `justin_approved` stays false and `review_status` stays `draft_for_human_review`.

Checked-in tier bytes: `ec63cad685bd7eb484958b871f14d056c894ddb84ca63dd0522b76e0b73b8b59` (same bytes as pack `data/draft-tiers.json` and the manifest entry for `schemas/atlas/tiers/iceland.json`). Full review ZIP SHA-256 `a86c0637188ace9f206ec3de496cc5f27e32ebdf15f5a6aa0e8a05ee02b2bb0a`. Slim zip SHA-256 `177121468a00621f96d2585e5cd247a8028d7d466984c3ccaa428acff4db2dab`. Rebased onto main `09e05015d52045eb9643f23ff77ccfbec303cea2` (United Kingdom Prompt AU #78). Italy was not on that tip.

`SHA256SUMS` is the full-pack manifest, including omitted `sources/`, `data/events.json`, and `data/results.json`. Its `README.md` line is the pre-land pack README (`ecbf0dd581b222459e2ccb28e41a68f23c8a7fb2bd299d17520aa354240d99b8`). `validate.py` expects that full pack root. It is not an npm script and was not re-run on this slim tree. `validation-report.json` is the full-pack PASS receipt.

- [x] Justin accepts the register with holds IS-G01 and IS-G06 left open (2026-09-23).
- [x] Justin accepts the supplied draft tiers (85 municipal / 2 national; every `justin_approved` stays false).
- [ ] Justin separately authorizes implementation.

## Pack README (pre-acceptance research text)

Research/documentation only. **applied_changes=0**. All Justin approval boxes remain unchecked.

This rebuild corrects the first AV draft by adding the complete source-reconciled municipal office/event universes for **2014 (74 municipalities), 2018 (72), 2022 (64), and 2026 (61)**, together with the source-identified merger identities required to reconcile those cycles. It does not convert missing numeric values to zero.

### Counts

- Current offices: **63** = 61 municipal councils + Alþingi + President.
- Historical-only municipal offices: **24**.
- Total office rows: **87**.
- Municipal event rows: **271** (74 + 72 + 64 + 61).
- Total events: **277**.
- Result rows: **393**. Every municipal event has an explicit result-state row; detailed numeric rows are retained where transcribed, otherwise numeric fields are null with `not_transcribed` / `no_poll` status.
- Draft tiers: **85 municipal, 2 national**.
- Direct executives: **1 current national (President); 0 municipal**.
- European Parliament offices: **0**.

### Historic municipal reconstruction

Cycle counts are tied to Statistics Iceland's official election series. Temporal office identities are split across source-identified amalgamations rather than attaching old results to a later municipality merely because the name is similar. The represented 2014→2026 merger bridge includes the Sandgerði/Garður, Breiðdalshreppur/Fjarðabyggð, Múlaþing, five 2022 merger groups, Vesturbyggð/Tálknafjarðarhreppur, Húnabyggð/Skagabyggð, and Borgarbyggð/Skorradalshreppur transitions. No unsourced edge is invented.

### Numeric-result policy

The pack completes the **record layer** that was missing: office identities, cycle membership, event date/mode, source binding and result-state rows. It does not pretend that a non-transcribed PxWeb cell is zero. Full candidate/list numeric vectors remain an explicitly named research gap where not already transcribed.

Run `python validate.py` from the full pack root (events, results, and sources included). This slim land does not contain those files.
