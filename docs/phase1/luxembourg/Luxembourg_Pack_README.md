# Luxembourg Atlas — Prompt AO

Research/documentation handoff. Read docs/phase1/luxembourg/JUSTIN_REPORT.md first.

- data/office-register.json: 100 current communal councils, Parliament, EP; 28 historic council identities.
- data/events.json and results.json: sourced election/return observations, including candidate and list vectors, with reporting scope and certification status.
- data/observations.json: source statistics and raw evidence context.
- data/draft-tiers.json: exact 1:1 office draft, all approvals false.
- data/merger-crosswalk.json: explicit evidence-backed predecessor relations; not automatic identity equivalence.
- data/source-inventory.json and sources/: exact retained evidence bytes/hashes. File suffix .html is a capture key; content_format identifies XML/PDF/ZIP/JSON bytes.
- docs/phase1/luxembourg/: field map, identity rules, 30 examples, gap ledger and Justin report.
- contract/: inherited 223-column/20-table reference and extracted column list.
- validate.py and SHA256SUMS: offline integrity and semantic checks. Run `python validate.py` from the pack root (Python standard library only).

Do not add candidate votes to list totals; do not sum national and constituent observations. Uncontested raw zero placeholders are not zero support. Official-publisher unofficial figures remain unofficial. Historical-office retention is independent of any alert window.

applied_changes=0. No importer/SQLite/VPS/UI/repo change. No executable data importer supplied. Validator only reads this local pack.

- [ ] Justin approves the pack
- [ ] Justin approves tier classifications
- [ ] Justin authorizes implementation
