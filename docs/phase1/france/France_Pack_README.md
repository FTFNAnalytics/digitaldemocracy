# France — Atlas Prompt AR research pack

Research snapshot **22 September 2026**; territorial baseline **INSEE COG 1 January 2026**. `applied_changes=0`. All Justin approvals are unchecked. This archive contains research and documentation only; no importer, SQLite, VPS, UI or repository change.

**35,112 current offices** are enumerated across the requested elected-body scope. **2,738 historical-only offices**, **119,554 office-round events**, **173,409 reporting units** and **1,193,657 result rows** are retained. Result rows mix explicitly identified grains; they are not all national aggregate vote totals.

The full current office register is independent of the 18-month alert window. History is substantial but **not exhaustive**. Read the named gates before promotion: **38 source arithmetic discrepancies**, PF 2026 metrics-only returns, missing NC provincial quantitative attachments, WF Sigave repeat results, legal successor review, partial elections and certification remain open. Integrity validation is not election certification or approval.

| Current office type | Count |
|---|---:|
| municipal council | 34952 |
| departmental council | 95 |
| single territorial assembly | 3 |
| metropolitan council | 1 |
| regional council | 14 |
| arrondissement or sector council | 34 |
| overseas territorial assembly | 5 |
| new caledonia congress | 1 |
| provincial assembly | 3 |
| national lower house | 1 |
| national upper house | 1 |
| president | 1 |
| european parliament delegation | 1 |

Municipal footing: **34,875** metropolitan/DROM COG COM units minus **6** named appointed Meuse commissions plus **83** real overseas communes = **34,952 municipal council offices**. The overseas communes are **48 Polynésie française, 33 Nouvelle-Calédonie, 2 Saint-Pierre-et-Miquelon**. Saint-Barthélemy and Saint-Martin each have a territorial council, not an additional municipal council. Municipal totals include Paris once.

Regional/departmental footing: **14** ordinary regional councils; **95** departmental councils including Alsace and transitional Mayotte; **3** single territorial assemblies (Corse, Guyane, Martinique); **1** Lyon metropolitan council. **34** PLM sector councils are additional clean elected bodies. **3** national offices plus **1** EP delegation. **9** COM/NC assemblies are listed individually. The broader overlapping overseas flag covers **228** offices, including overseas municipalities and DROM councils.

Direct executives: **1** (national President). **35,111** other elected bodies/delegation rows; local direct executives **0**. Mayors and local executive presidents are council/assembly-selected. Senate is indirect, with its electorate explicitly identified.

Draft tier histogram across current and historical offices: **{'1': 4, '2': 45, '3': 96, '4': 37705}**. Exactly one draft row per office; 0 approved classifications. Tiers: 1 national/EP; 2 regional/single/COM/NC; 3 departmental/Lyon; 4 municipal/PLM. This is a proposal for Justin.

## Files

- `data/office-register.jsonl`, `draft-tiers.jsonl`: complete in-scope current register plus sourced historical identities, one tier each.
- `events.jsonl`, `reporting-units.jsonl`, `results.jsonl`: separate rounds, electorates and result grains; null is not zero.
- `office-history-coverage.jsonl`, `history-coverage.json`: transparent normalization coverage.
- `territorial-movements.jsonl`, `territory-exclusions.json`, `successor-crosswalk.json`: INSEE evidence and exclusions; no guessed office successor edges.
- `field-map-223.json` and `contract/columns.json`: all 223 inherited columns / 20 tables, documentation only.
- `calendar.jsonl`: one row per current office, no alerts created; dates carry precision.
- `source-inventory.json`, `sources/`: recovery URLs, hashes and retained bytes.
- `source-arithmetic-discrepancies.json`, `extraction-issues.json`, `research-gaps.json`: preserved evidence problems and open gates.
- `docs/phase1/france/`: identity rules, extraction specification, 36 acceptance examples, field map, source inventory, research gaps and Justin report.
- `validate.py`, `validation-report.json`, `SHA256SUMS`: offline integrity and substantive checks.

## Validate

From the extracted folder run `python3 validate.py` (Python standard library only). It reads files and prints JSON; it makes no operational changes. Alternatively run `sha256sum -c SHA256SUMS` for byte integrity. Manifest excludes itself; the external ZIP SHA-256 covers the archive including the manifest.

Office and result identifiers are provisional research identities, not production Atlas IDs. No judicial or legal successor gate is silently closed. Full raw files may cover more history or geography than the normalized records; omission from normalized data is explicitly not a zero result.

Chatain (86063), 2026 round one: the official file supplies panel 1, 65 votes and 9 council seats but no list name. The empty label is preserved and documented in extraction-issues.json. No contestant identity is invented.
