# Lithuania Full Register Review Pack — Prompt AH

Draft research and documentation for Justin. Main pin: `b76ee2540e7a8fcaee8f9430f5bbe275f4542c33`.

The sourced current register contains **123 offices**: 60 municipal councils, 60 directly elected mayors, Seimas, the directly elected President and Lithuania’s European Parliament delegation. There are **61 direct-executive offices**. Draft tiers: **120 municipal / 2 national / 1 other / 0 regional**.

**History is partial:** 30 historical contests and 130 result claims were recovered. These cover five EP cycles, five Seimas cycles with varying depth, the two presidential rounds in 2019, and 19 mayoral winner observations in 2019. There are no complete municipal candidate/list vectors. No historical-only office records were recovered; the abolished-office universe remains unresolved, not empty by assumption. Eleven presidential shares remain disputed. No numeric repairs or successor links were invented. All current offices remain regardless of the next date or alert window.

Start with `docs/phase1/lithuania/Lithuania_Full_Register_Report.md`, followed by the research gaps, 223-column field map, identity rules/vectors, 21 acceptance examples and Prompt AH checklist. Research JSON and retained source bytes are under `data/research/lithuania/`; the draft tier file is `schemas/atlas/tiers/lithuania.json`. Reference DDL copies are unchanged.

Run the offline integrity checks with `python validate.py`. This validates the research pack, not importer or SQLite behavior. `SHA256SUMS` lists every other file; a checksum manifest cannot hash itself. The ZIP hash is supplied externally. Importer, SQLite, VPS, UI and publication execution: **Not run**. Repository/importer/SQLite/VPS/UI `applied_changes=0`.

- [ ] Justin accepts the sourced register with named holds.
- [ ] Justin accepts the draft tiers.
- [ ] Justin accepts the recovered historical claims and remaining gaps.
