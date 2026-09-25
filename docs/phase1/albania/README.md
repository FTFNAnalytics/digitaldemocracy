# Albania full register — Prompt BA / ACCEPTED WITH HOLDS

**123 current + 768 historical-only offices (891 total); 1,180 events; 8,229 results in the full pack.** Draft tiers: 1 national / 868 municipal / 22 other (891 rows, 1:1). Justin accepted 2026-09-25 (America/Edmonton) with holds **AL-BA-G01 through AL-BA-G21** left open.

Start: [JUSTIN_ACCEPTANCE.md](JUSTIN_ACCEPTANCE.md) and [JUSTIN_REPORT.md](JUSTIN_REPORT.md). Tiers: `schemas/atlas/tiers/albania.json` (Prompt BA draft, included as supplied). Phase 1 approved classifier bytes stay at [Phase1_approved_tiers.json](Phase1_approved_tiers.json) (SHA-256 `53a31d441761952a9f511c58a397e7877616c0ad6af30dce7587bcb6bcbbd93d`; 122 municipal). The existing Albania importer still classifies those 122 rows. This land does not add an import scope and does not publish the 891 draft offices.

`research_coverage_complete` stays false. Current offices are the Assembly, 61 municipal councils, and 61 directly elected mayors. The President is Assembly-elected; there is no popular president office. European Parliament offices are 0. Popular qark and prefecture offices are 0. Historical-only rows are 768 source-vintage 2011 identities, not 768 proved abolitions. `office_successor_edges` stays empty. Dimal remains the sourced rename of Ura Vajgurore on AL-05-M/C. Untranscribed vote and seat cells stay null, never 0.

Named holds stay open: AL-BA-G01 through AL-BA-G21. See [Albania_Research_Gaps.md](Albania_Research_Gaps.md). This land does not close any of them and does not invent offices, votes, or successor edges.

`applied_changes=0`. No Prompt BA importer, SQLite publication of the BA register, or VPS deploy. `ATLAS_IMPORT_SCOPE` is unchanged. Slim land omits `sources/`, `data/events.jsonl`, and `data/results.jsonl` (see [SLIM_LAND_NOTE.md](SLIM_LAND_NOTE.md) and [SHA256SUMS](SHA256SUMS)). `metadata.json`, `data/approval-state.json`, and `JUSTIN_REPORT.md` stay the pre-acceptance receipt: approvals unchecked. Per-office `justin_approved` stays false and `review_status` stays `draft_unapproved`.

Checked-in tier bytes: `38534cec38c039c6807c4b2347fb46bf172ea20aa2252735ca6a6d26a362c8ae`. Pack `data/draft-tiers.jsonl` SHA-256 `e30634545547376cc5271fbd7c281fec483ebc30e518276e1e78d1eec349e965`. Full review ZIP SHA-256 `411d72969c246c71b8c050993707242dc338f01ddc8f7e0858b17f3e909a654e`.

`SHA256SUMS` is the full-pack manifest, including omitted `sources/`, `data/events.jsonl`, and `data/results.jsonl`. Its `README.md` line is the pre-land pack README (`1a0fd4f70aa08d18839f4bd2e46db805abfeeba08201f636dd771e361eb9ebdd`). `validate.py` expects that full pack root. It is not an npm script and was not re-run on this slim tree. `validation-report.json` is the full-pack PASS receipt.

- [x] Justin accepts the register with holds AL-BA-G01–AL-BA-G21 left open (2026-09-25).
- [x] Justin accepts the supplied draft tiers (1 national / 868 municipal / 22 other; every `justin_approved` stays false).
- [ ] Justin separately authorizes implementation.

## Pack README (pre-acceptance research text)

As of 24 September 2026. Research/documentation only. **applied_changes=0. All Justin approvals remain unchecked.**

| Measure | Current | Historical-only |
| --- | --- | --- |
| National offices | 1 | 0 |
| Local councils | 61 | 384 |
| Direct local executives | 61 | 384 |
| All office rows | 123 | 768 |

Events: **1,180** (24 national; 1,156 local). Results: **8,229** (185 national; 8,044 local). Draft tiers: **891**, one per office: national **1**, municipal **868**, other **22** (2011 Tirana boroughs).

The current register contains the Assembly plus all 61 municipal councils and all 61 directly elected mayors. The President is elected by the Assembly and is excluded as a popular office. Mayors are elected directly by plurality; an exact tie is resolved by public lot, not an invented runoff. **EP offices=0. Popular qark/prefecture offices=0.**

The 768 historical-only rows describe 384 jurisdictions in the CEC's 2011 register: 65 municipalities, 308 communes and 11 separately elected Tirana boroughs, each with a council and elected head. They are source-vintage identities held apart pending continuity evidence, **not a claim that 768 offices were abolished**. No merger or successor edges are supplied. Dimal is a sourced rename of Ura Vajgurore and retains AL-05-M/C.

## What is complete and what is held

The current national/municipal office inventory is complete against the 61-entry territorial classification and legal selection rules. The package does not claim an exhaustive inventory of advisory village or voluntary neighbourhood bodies under Articles 68–70 of Law 139/2015. Locality-specific existence, election arrangements and scope are unresolved. This is a named coverage hold, not a claim that no such elected community bodies exist.

Historical numeric coverage is partial: ten post-1991 national cycles, the full 2011 local winner/seat register, all 2015/2019/2023 current-map local contests, and sourced special contests. Many 2011 votes and early national vote totals are untranscribed. Earlier local cycles and remaining repeat phases need more research. Nulls remain null. Preliminary and final evidence are labelled separately.

## Files

- `data/office-register.jsonl`, `data/draft-tiers.jsonl`: authoritative row-level register and 1:1 draft classifications.
- `data/events.jsonl`, `data/results.jsonl`: event and result records; foreign keys join by event_id and office_id.
- `Albania_Office_Register.md`, `Albania_Coverage.md`: readable inventory and coverage/count explanations.
- `Albania_Field_Map.md`, `contracts/columns.json`, `contracts/column-map.json`: inherited 20-table, 223-column contract and BA research mapping. No operational rows are written.
- `Albania_Identity_Rules.md`, `Albania_Acceptance_Examples.md`, `Albania_Research_Gaps.md`: identities, acceptance scenarios and holds.
- `data/source-inventory.json`, `sources/normalized/`, `Albania_Source_Inventory.md`: source URLs, original-byte hashes where retrieved, and retained factual extracts with separate hashes.
- `data/current-register-reconciliation.json`, `data/baseline-reconciliation.json`: 61-unit coverage and recovered workbook/briefing checks.
- `data/2025-preliminary-comparison.json`, `data/arithmetic-diagnostics.json`: preserved discrepancies; comparison rows are outside the main result count.
- `reference/`: unchanged earlier Albania field-map and identity documents. BA addenda govern expanded coverage; their old selected-history counts are not BA counts.
- `JUSTIN_REPORT.md`, `data/approval-state.json`: review state; nothing approved.
- `SHA256SUMS`, `validate.py`, `validation-report.json`: archive integrity and read-only structural validation.

## Validation

From the extracted directory run `python3 validate.py`. It uses the Python standard library, reads local files and prints JSON. It does not access the network or write files, import election data, modify a database or publish anything. A passing result confirms the stated structural/evidence checks; it does not clear research holds or grant approval.

Every retained file except SHA256SUMS itself is covered by SHA256SUMS. The delivered ZIP has its own external SHA-256. Source original-byte hashes are audit references; original PDFs/HTML/workbooks are not redistributed and cannot be rehashed from this ZIP. Retained normalized factual extracts have their own independently verifiable hashes.

The approximately 18-month window applies only to future alerts. Expected 2027 local and 2029 Assembly cycles are retained in `cycle-outlook.json` with no invented polling days; the office register and history are not filtered by that horizon.
