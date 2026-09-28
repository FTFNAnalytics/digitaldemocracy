# Moldova — Prompt BC research pack

Snapshot: **2026-09-28**. **applied_changes=0**. All Justin approvals are unchecked.

The reconciled register contains **1,822 current offices** and **14 source-identified historical-only offices**. It covers the Republic of Moldova’s elected institutions and does not create a Transnistria register, parallel institutions or dual-sovereignty rows. EP offices = **0**.

| Scope | Current | Historical-only | Events | Results |
|---|---:|---:|---:|---:|
| national | 2 | 0 | 71 | 224 |
| gagauzia | 2 | 0 | 180 | 597 |
| raion | 32 | 0 | 32 | 224 |
| local | 1,786 | 14 | 3,599 | 8,798 |

Current direct executives: **895** (893 mayors, President, Bashkan). Current representative bodies: **927** (893 local councils, 32 raion councils, one Gagauzia Assembly and Parliament). Historical-only rows contain seven councils and seven mayors. The 26 municipal jurisdictions within Gagauzia belong to the local subtotal; its two autonomous offices are counted separately. Chișinău/Bălți elected subordinate bodies are retained.

Draft tiers, one per office: **national 2; autonomous 2; raion 32; municipal 1,800**. All are draft/unapproved. The current municipal tier has 1,786 rows; its 14 historical rows account for the difference.

## What the history counts mean

**3,882 event records and 9,843 result rows** are retained. There are **273 dated historical poll/component records**, **3,601 undated cycle/roster/seat/snapshot records**, and **8 upcoming records**. These are office-specific evidence records, not 3,882 distinct national election days. Results include votes, winner-only rosters and seat compositions. Do not add a ballot return to a roster or later composition of the same body.

All eleven parliamentary cycles 1994–2025 are represented, as are the nine popular presidential rounds in 1991, 1996, 2016, 2020 and 2024. The 2019 mixed parliamentary list and 51 constituency components remain distinct under one Parliament office. Gagauzia constituency history, selected mayor/council vectors, 2015 named councillors, and the 2019/2023 mayor rosters provide substantial local history. **This is not a complete certified historical archive**: coverage and missing numeric fields are explicit in each record and in the 24 named gates.

## Selection modes and territory

The President is popularly elected in the retained direct-election eras; the 2000-07-28 to 2016-03-04 parliamentary-selection transition is explicitly gated. No popular presidential event is invented in that interval. Covered mayors and the Bashkan are directly elected. Raion presidents are selected by their councils and are excluded as popular offices. Gagauzia’s 2026 regulatory transition remains documented alongside current CEC notices.

The territorial reconciliation uses the official CEC 898-unit roster (as of 2024-05-19), BNS CUATM and Law 145/2025. Two amalgamations reduce the current municipal count by five to **893**. Seven pre-change territory versions are retained only as source-identified historical council/mayor pairs. **No successor/merger edges** or mandate expiry dates are guessed. Prospective 2027 clusters do not delete current bodies.

## Files and review

- `data/office-register.jsonl`, `data/draft-tiers.jsonl`: complete reconciled register and 1:1 unapproved classifications.
- `data/events.jsonl`, `data/results.jsonl`, `data/office-history-coverage.jsonl`: history with granular provenance and honest missing values.
- `Moldova_Office_Register.md`: readable full current register and historical rows.
- `Moldova_Identity_Rules.md`, `Moldova_Research_Gaps.md`, `Moldova_Acceptance_Examples.md`: scope, eras, source conflicts and review cases.
- `contracts/columns.json`, `contracts/column-map.json`, `Moldova_Field_Map.md`: inherited **20-table / 223-column** contract mapped without target writes.
- `sources/source-inventory.jsonl`, `Moldova_Source_Inventory.md`, `sources/originals/`, `evidence/`: source hashes, retained records and factual extracts.
- `SHA256SUMS`, `validate.py`, `validation-report.json`, `JUSTIN_REPORT.md`: integrity, acceptance checks and handoff.

Run `python3 validate.py` from the extracted pack directory. The validator reads files only and exits nonzero on failed checks; no network or database access. SHA256SUMS covers every retained file except itself. The ZIP SHA is supplied outside the ZIP to avoid self-reference.

No numeric blank becomes zero. An explicit zero remains zero. Derived seat counts are labelled as counts of named members; no mayoral winner is assigned a synthetic seat. A hash proves byte consistency, not certification. A roster date is not a polling date. The ~18-month alert horizon never determines whether an office or historic record exists.
