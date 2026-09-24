# Malta full register — Prompt AP / APPROVED WITH HOLDS

**213 current + 2 historical offices; 223 events; 4,084 result rows and 64,204 STV count observations (full pack).** Draft tiers: 204 municipal / 8 regional / 2 national / 1 other. Landed from main `5935187e8f0df09c4436c4feaba1869dafb4090e`. Justin accepted 2026-09-22 (America/Edmonton) with the gates in [Malta_Research_Gaps.md](Malta_Research_Gaps.md) left open.

Start: [JUSTIN_REPORT.md](JUSTIN_REPORT.md). Data: `data/research/malta/`. Tiers: `schemas/atlas/tiers/malta.json` (**approved**, production_accepted). Receipt: [JUSTIN_ACCEPTANCE.md](JUSTIN_ACCEPTANCE.md).

Current scope is 68 local councils (54 Malta, 14 Gozo), 68 mayors, 68 deputy mayors, six indirect regional presidents, the House, the indirect President, and the Malta EP delegation. Historical scope is the Gozo Civic Council and its president. Standalone direct-executive offices: 0. Mayors and deputies use the conditional first-preference rule or council election. They are not separate popular contests. The successor crosswalk stays empty. Four 2021 regional sole nominees stay nominations.

Named holds stay open: presidential earlier resolutions and House division tallies, STV paper-level transfers, post-election casual/co-option normalization, the mayoral first-meeting audit, local creation and boundary history, regional sole-nominee and successor gaps, Gozo Civic Council depth, EP replacements and the sixth-seat transition, certified-versus-preliminary labels, and the production-schema pin. EP stays drafted `other`. The House and the President stay drafted `national`. Per-office `review_status` stays `needs_review`.

The accept-with-holds land kept `applied_changes=0` and did not run the importer. The follow-up importer is `ATLAS_IMPORT_SCOPE=malta` — see [Malta_Import.md](Malta_Import.md). It publishes 213 current + 2 historical offices, 223 events, and **0 result rows** (the full pack's 4,084 result rows stay in omitted `results.json` and 64,204 STV observations stay in omitted `stv-counts.json`; `count-totals.json` and party aggregates are not substitutes). Named holds stay open. `ATLAS_IMPORT_SCOPE=all` does not import Malta. VPS deploy is out of scope. Land PR omits `stv-counts.json`, `results.json`, and raw `sources/` (see [SOURCES_NOTE.md](SOURCES_NOTE.md)). `validation.json` is the pre-acceptance PASS receipt. `validate.py` expects the pack root (including omitted results, STV counts, and sources) and the pre-acceptance draft flags. It is not an npm script and was not re-run after this accept-with-holds. Do not invent omitted bytes, popular presidential or mayor ballots, STV transfer papers, House division tallies, or a Gozo successor edge. PASS does not mean complete research.

Approved tier bytes: `49e0238e4c00ede6839a8c9d77fb11fe43646a8add8c906320da696cad1839c8` (predecessor draft `5714dde427d288850b4c9c8aa9a5c9000ba803321f9cb6adc66c760b74e06d18`). Full review ZIP SHA-256 `ad2fa809d572305e9002fb9cae6ede149ecedb9394cf402eec15ae3ca6716ecb`.

- [x] Justin accepts register scope and named holds (2026-09-22, with named holds).
- [x] Justin accepts draft tiers, including EP as `other` and the indirect presidency (2026-09-22; Malta_Research_Gaps gates retained).
- [x] Justin accepts mayors and deputy mayors as conditional offices, not separate popular ballots (2026-09-22).
- [x] Justin separately authorizes implementation (`ATLAS_IMPORT_SCOPE=malta`; not part of `all`).
