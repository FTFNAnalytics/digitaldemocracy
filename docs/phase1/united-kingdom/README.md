# United Kingdom — Atlas Prompt AU research pack

As of **2026-09-23**. **Research/documentation only. applied_changes=0. All Justin approvals are unchecked.**

The current core office register covers the Commons, all three devolved legislatures, GLA institutions, all 382 operational principal councils, all 27 direct mayors and all 37 standalone PCC/PFCC offices. It also distinguishes two elected Surrey shadow authorities, four special elected components and a source-identified subset of 27 parish/town councils. There are 26 explicitly evidenced historical-only offices.

**This is not a complete all-time history or UK-wide parish/community register.** The overall research coverage flag remains false. Historical coverage and unresolved evidence are explicitly documented; missing never means zero. All operational principal councils and all current direct executives have sourced normalized history. The 18-month window filters alerts only and has not removed any office or historic result.

| Category | Count |
|---|---:|
| Current offices (operational) | 482 |
| Current elected shadow authorities | 2 |
| Historical-only offices | 26 |
| Office rows / draft-tier rows | 510 |
| Operational principal councils | 382 |
| Commons | 1 |
| Devolved legislatures | 3 |
| London Assembly | 1 |
| Direct executive offices | 64 |
| Direct mayors (13 local + 13 strategic + London) | 27 |
| Standalone PCC/PFCC | 37 |
| Parish/town subset | 27 |
| Special elected components | 4 |
| Historical EP office | 1 |
| Event records | 899 |
| Result records | 103,648 |
| Retained evidence files | 252 |

| Nation | Operational principal councils | All current office rows | Shadow rows | Historical rows |
|---|---:|---:|---:|---:|
| England | 317 | 406 | 2 | 25 |
| Scotland | 32 | 36 | 0 | 0 |
| Wales | 22 | 27 | 0 | 0 |
| Northern Ireland | 11 | 12 | 0 | 0 |
| United Kingdom | 0 | 1 | 0 | 1 |

## Pack contents

- `data/office-register.jsonl`, `data/draft-tiers.jsonl`: 1:1 office/tier rows, with current/historical/shadow distinctions.
- `data/events.jsonl`, `data/results.jsonl.gz`, `data/reporting-units.jsonl`: source-linked historical evidence. Gzip is standard UTF-8 JSON Lines compressed for size; it is not a SQLite or importer artifact.
- `OFFICE_REGISTER.md`, `HISTORY_COVERAGE.md`, `ELECTORAL_MECHANISMS.md`, `IDENTITY_RULES.md`, `DRAFT_TIERS.md`: readable documentation.
- `contract/columns.json`, `contract/field-map-223.jsonl`, `FIELD_MAP_223.md`: exact inherited 20-table / 223-column contract and documentary mapping.
- `acceptance-examples.jsonl`, `ACCEPTANCE_EXAMPLES.md`: 35 real acceptance cases.
- `source-inventory.jsonl`, `SOURCE_INVENTORY.md`, `sources/`: original evidence and honestly labelled rendered captures, byte counts and hashes.
- `research-gaps.jsonl`, `RESEARCH_GAPS.md`, `data/coverage-by-office.jsonl`, `data/quarantined-extracts.jsonl`: explicit limitations and preserved errors.
- `data/approval-state.json`, `release-metadata.json`, `JUSTIN_REPORT.md`: review state and counts.
- `validate.py`, `validation-report.json`, `SHA256SUMS`: standard-library read-only validation and complete file-integrity manifest.

## Verify after extracting

Run `python3 validate.py` from the extracted pack directory. It checks counts, office/tier coverage, foreign keys, source hashes, the 223-column map, approvals, source-grounded acceptance invariants and every manifest entry. `python3 validate.py --archive /path/to/United_Kingdom_Atlas_Prompt_AU.zip` also checks the ZIP central directory, CRCs, safe paths and every archived manifest hash without writing extraction files.

The ZIP's SHA-256 is supplied in the adjacent `.zip.sha256` file. `SHA256SUMS` excludes only itself; the ZIP checksum is external to avoid a self-referential hash. Files in `sources/` are not all legally certified returns; see their individual evidence status. Counts are of office/event/result records, not seats, voters or unique polling days.

## Approval

- [ ] Justin approves scope and current office register
- [ ] Justin approves historic coverage and remaining gaps
- [ ] Justin approves draft tiers
- [ ] Justin approves identity and party mapping rules
- [ ] Justin authorizes any future import
- [ ] Justin authorizes any future publication
