# Germany — Prompt AS research handoff

**Coverage is incomplete.** This pack delivers a current territorial core, verified direct-executive rows, substantial historic returns and named unresolved gates. It does not claim to be the full requested Germany office register. The largest current-scope gaps are a complete Schleswig-Holstein direct-mayor roster and the Land-specific elected submunicipal bodies. Historic local coverage and legal succession are also incomplete.

Research as of **23 September 2026**; current territorial snapshot **31 August 2026**. `applied_changes=0`. All Justin approvals are unchecked. No importer, SQLite, VPS, UI, repository, production release or publication changes were made.

| Measure | Count |
|---|---:|
| Current offices | 21,960 |
| Historical-only office/code identities | 670 |
| Election event / ballot versions | 13,845 |
| Reporting units | 47,762 |
| Result records, including metrics and seat rows | 1,299,670 |
| Current direct executives | 9,585 |
| Current local councils / elected assemblies | 12,356 |
| All current collective elected bodies, including Land/BT/EP | 12,374 |
| Indirect presidential office | 1 |
| Territorial municipalities | 10,747 |
| Municipal council offices | 10,718 |
| Kreis councils | 294 |
| Land parliaments | 16 |
| Federal offices, Bundestag + Bundespräsident | 2 |
| EP delegation offices | 1 |
| Association councils / direct association executives | 262 / 262 |
| Other Bezirk / regional / borough / Ortschaft / inhabitants’ bodies | 1,082 |
| Retained source files | 5073 |
| Field mappings / acceptance examples | 223 / 51 |

Draft tiers, one per current/historical office: **Tier 1: 3, Tier 2: 20, Tier 3: 552, Tier 4: 22,055**. Historical rows comprise 54 council code identities, 610 historic mayor code identities and six source-established former assemblies. The crosswalk contains 26 explicitly sourced territorial relationships without asserting office continuity. Direct executives are 9,075 municipal mayors, 248 Kreis executives and 262 association executives in the current register. These counts describe the delivered subset, not a completed nationwide direct-executive census.

The 10,747 municipalities include Berlin and Hamburg, whose city-level bodies are represented through their Land parliaments, and 27 SH Gemeindeversammlungen without a separate elected council. The 401 Kreis-level territorial units comprise 294 Kreis/special equivalents and 107 independent-city-level units; independent city councils are counted once at municipal level.

Federal history includes every ordinary Bundestag cycle 1949–2025, the 2024 partial-repeat update, all ten German EP cycles 1979–2024, and all 26 ballots of the 17 Federal Conventions, 1949–2022. Land compilation tables provide 256 events from 1946 onward, with separate later returns including recovered preliminary MV 2026 totals. Conflicting source figures are explicitly withheld. Local source and cycle coverage is detailed in the gaps report. A result row may be a metric, party vote, seat allocation or total: do not call all 1,299,670 records candidates or sum incomparable reporting units.

Files:

- `data/office-register.jsonl`, `draft-tiers.jsonl`: office identities and exactly one unapproved tier each.
- `data/events.jsonl`, `reporting-units.jsonl`, `results.jsonl`: source-qualified event and return records.
- `data/territorial-register.jsonl`, `territory-exclusions.json`, `municipal-executive-mode-audit.jsonl`, `office-history-coverage.jsonl`: explicit territorial denominators and coverage dispositions.
- `data/field-map-223.json`, `contract/columns.json`: inherited 20-table, 223-column documentary mapping; no schema or importer change.
- `data/research-gaps.json`, `quarantined-land-table.json`, `territorial-movements.jsonl`, `successor-crosswalk.jsonl`, `official-territorial-changes.jsonl`, `historical-source-discrepancies.json`, `election-source-dispositions.jsonl`: resolved/open gates, source-coded territorial relations, numerical conflicts and extraction dispositions.
- `data/source-inventory.json`, `SHA256SUMS`: source provenance and retained-byte hashes.
- `data/counts.json`, `result-audit.json`, `arithmetic-checks.jsonl`, `arithmetic-exceptions.json`: reproducible counts and arithmetic evidence.
- `docs/phase1/germany/`: identity rules, Land counts/mechanisms, extraction specification, field map, acceptance examples, source inventory, research gaps and Justin report.
- `validate.py`, `validation-report.json`: read-only delivery validator and captured result.

Run from the extracted pack directory: `python validate.py`. Python standard library only; the validator writes nothing. A passing delivery check is not evidence that open research gaps have been resolved. The ZIP hash is external to the ZIP; SHA256SUMS covers every other frozen pack file except itself.

Future alert window: 2026-09-23 through 2028-03-23. Every current office remains present irrespective of next cycle. Date precision and unresolved dates are preserved.
