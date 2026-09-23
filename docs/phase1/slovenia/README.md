# Slovenia full register — Prompt AJ / APPROVED WITH HOLDS

**428 current + 0 historical-only offices; 1,706 events; 13,830 result rows (review ZIP).** Draft tiers: 424 municipal / 0 regional / 3 national / 1 other. Pack pin `3b21c584c1b59663c5c4ae1bad775618293ac0fa`. Landed from main `917f8b100e7c08b07f155ade84044bb09d533518`. Justin accepted 2026-09-22 (America/Edmonton) with named holds left open.

Start: [Slovenia_Full_Register_Report.md](Slovenia_Full_Register_Report.md). Tiers: `schemas/atlas/tiers/slovenia.json` (**approved**, production_accepted). Receipt: [JUSTIN_ACCEPTANCE.md](JUSTIN_ACCEPTANCE.md).

Current scope is 212 municipal councils, 212 direct mayors, Državni zbor, the indirectly elected Državni svet, the directly elected president, and the Slovenia EP delegation. Direct executives: 213. Councils, chambers, or delegation: 215. No elected regional office, appointed PM/cabinet, or neighborhood body is invented. Zero recovered historical-only offices is not proof that no body was abolished (SI-HISTORICAL-MUNICIPAL-UNIVERSE).

Named holds stay open: SI-HISTORICAL-MUNICIPAL-UNIVERSE, SI-LOCAL-CERTIFICATION-REPEATS, SI-MISSING-LOCAL-CYCLE, SI-SOURCE-TEXT-DAMAGE, SI-ROSTER-ALIASES, SI-DS-COMPONENTS, SI-DZ-MINORITY-MANDATES, SI-EP-DETAIL, SI-LOCAL-PREFERENCE, and SI-NEXT-CALLS. EP stays drafted `other` with `human_review_required` and `tier_uncertain` (SI-EP-DETAIL). The 2018 Ribnica council return stays missing (SI-MISSING-LOCAL-CYCLE). 1,172 damaged source labels stay unrepaired (SI-SOURCE-TEXT-DAMAGE). Documentary roster aliases stay unapproved (SI-ROSTER-ALIASES).

`applied_changes=0` for importer/SQLite/VPS/UI. No importer or executable override. Execution CI **Not run**. This land is docs and tiers only. It omits `Slovenia_Identity_Vectors.json`, `data/research/slovenia/` sources, results, events, and other research JSON (see [SOURCES_NOTE.md](SOURCES_NOTE.md)). `docs/phase1/slovenia/validation.json` is the pre-acceptance PASS receipt. `docs/phase1/slovenia/SHA256SUMS` is the full review-pack manifest. `validate.py` expects the pack root (including omitted research bytes and identity vectors) and the pre-acceptance draft flags. It is not an npm script and was not re-run after this accept-with-holds. Do not invent omitted bytes. PASS does not mean complete research or permission to publish.

Approved tier bytes: `99d7ae507e2e25c7bb3f112a2fc2f771295fded9499cacc23e3bd1fb59f4a096` (predecessor draft `17a836af07d10fa5ec3c0560c8281f67d60e17cd76b727360aa823b40ab201ee`). Full review ZIP SHA-256 `e89b8d39663ee27b1abd7016cb37e4b1ba2b03f8feea46453c60bb9be1118150`.

- [x] Justin accepts register scope and named holds (2026-09-22, with named holds).
- [x] Justin accepts draft tiers, including EP as `other` (2026-09-22; SI-EP-DETAIL retained).
- [x] Justin accepts the named research holds as open (2026-09-22).
- [ ] Justin separately authorizes implementation.
