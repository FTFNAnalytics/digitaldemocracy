# Greece — Atlas research pack, rebuilt

Research snapshot: 22 September 2026. This replaces the earlier 17-row draft as a research deliverable. It contains the full current authority-level office register, all authority result vectors from the four 2010–2023 local election archives, and sourced parliamentary, presidential and European election history.

**Current register: complete. Historical numerical coverage: not universally complete.** Specific missing older returns, incomplete source allocations and certification gaps are listed in `docs/phase1/greece/Greece_Research_Gaps.md` and `data/research/greece/research-gaps.json`. No unknown figure is filled with zero. This pack does not claim that a larger row count closes those gaps.

`applied_changes=0`. All classifications are drafts and every Justin approval box is unchecked. No importer, database, VPS, UI, repository change, release or publication is included. SQL files are unchanged reference contracts only.

| Measure | Count |
|---|---:|
| Current offices | 693 |
| Historical offices | 10 |
| Office-cycle events | 2,774 |
| Proceedings | 3,555 |
| Office result rows | 14,004 |
| Distinct source result observations | 8,021 |
| Authority-cycle vectors | 1,366 |
| Observed local/regional runoffs | 781 |
| Hashed source artifacts | 2,807 |
| Open local source holds | 14 |
| Mapped contract columns | 223 |
| Applied changes | 0 |

## Current offices and retained history

| Level | Councils/bodies | Direct executives | Other elected office | Current total |
|---|---:|---:|---:|---:|
| 332 municipalities | 332 councils | 332 mayors | 0 | 664 |
| 13 regions | 13 councils | 13 governors | 0 | 26 |
| National | 1 Parliament | 0 | 1 indirectly elected President | 2 |
| European | 1 Greek EP delegation | 0 | 0 | 1 |
| Total | 347 | 345 | 1 | 693 |

The 347 bodies comprise 345 subnational councils, Parliament and the EP delegation. The EP delegation is one office with party-seat results; individual seats are not invented as separate offices. Five abolished municipalities add five historical councils and five historical mayors. Greece has no Romanian județ category: the regional counts above are περιφέρειες.

All 332 current municipality names are reconciled individually to the Ministry's March 2026 register. The two municipalities named Ηρακλείου remain distinct. Current offices and their history are retained regardless of the approximately 18-month alert window. No unsupported future election date is created.

| Cycle | Municipalities | Regions | First-round candidates | Runoffs | Runoff candidates |
|---|---:|---:|---:|---:|---:|
| 2010 | 325 | 13 | 1,413 | 232 | 464 |
| 2014 | 325 | 13 | 1,545 | 223 | 446 |
| 2019 | 332 | 13 | 1,736 | 236 | 472 |
| 2023 | 332 | 13 | 1,289 | 90 | 180 |

Parliament: 20 elections, 1974–June 2023; ten complete national vote vectors from 2004 onward, and ten earlier seat-winning-party compilations. President: 12 evidenced indirect cycles/outcomes, 1974–2025, with 32 candidate rows and original minutes for the six most recent cycles. EP: 10 cycles, 1981–2024; 1981 is event-only, six historical cycles have constitutive-session seats/available shares, and 2014/2019/2024 have complete published Ministry party vectors.

## How to interpret a result row

Municipal and regional voters select a joint council list and its head. A first-round source observation therefore has two explicitly linked office projections: a council list result and a mayor/governor result. **14,004 result rows represent 8,021 distinct source observations; they are not 14,004 independent ballot totals.** Use `observation_id` or `shared_ballot_id` to prevent double counting. All 781 observed executive runoffs are retained separately. Council seats are the source's whole-contest allocation, never described as seats won only in round one.

Presidential votes count MPs, not citizens. Abstentions and attendance are proceeding attributes; no nationwide popular share, turnout or first-preference denominator is invented. Repeated parliamentary ballots are not popular runoffs. National parliamentary elections in the same year remain separate elections.

## Pack contents

- `data/research/greece/office-register.json` and `.csv`: 703 current/historical office rows.
- `schemas/atlas/tiers/greece.json`: exactly one draft classification per office.
- `events.json`, `proceedings.json`, `results.jsonl.gz`, `ballot-observations.jsonl.gz`: linked election history and retained source observations.
- `coverage-by-authority-cycle.json`, `source-holds.json`, `cycle-registers.json`: exhaustive local extraction coverage and unresolved source details.
- `municipality-register-2026-reconciliation.json`, `identity-crosswalk.json`: territorial identity evidence.
- `docs/phase1/greece/`: Justin report, all 223 field mappings, identity rules, 30 acceptance examples, coverage tables, source inventory, gap report and validation report.
- `sources/`: retained original files, plus one explicitly labelled web-text extraction when direct PDF retrieval failed.
- `scripts/validate_greece_pack.py`: offline, read-only validation. `SHA256SUMS` covers every delivered file except itself.

## Verify

From the unpacked directory, run:

```sh
python3 -B scripts/validate_greece_pack.py --self-test --deep-pdf
```

Python 3 standard library is sufficient for the normal checks. The optional `--deep-pdf` check requires Poppler's `pdftotext`; it rereads cited PDF pages. No network access or SQL execution occurs. `--self-test` confirms that missing tier rows, altered vote totals and missing office projections are rejected. The validator checks extraction integrity and explicit coverage limits; it cannot certify an unresolved electoral outcome.

The ZIP's own SHA-256 is supplied beside the ZIP. Internal `SHA256SUMS` is not the ZIP digest.
