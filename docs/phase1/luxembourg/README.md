# Luxembourg full register — Prompt AO / APPROVED WITH HOLDS

**102 current + 28 historical offices; 438 events; 48,197 result observations (full pack).** Draft tiers: 128 municipal / 0 regional / 1 national / 1 other. Landed from main `5935187e8f0df09c4436c4feaba1869dafb4090e`. Justin accepted 2026-09-22 (America/Edmonton) with holds LU-G03–LU-G11 left open.

Start: [JUSTIN_REPORT.md](JUSTIN_REPORT.md). Data: `data/research/luxembourg/`. Tiers: `schemas/atlas/tiers/luxembourg.json` (**approved**, production_accepted). Receipt: [JUSTIN_ACCEPTANCE.md](JUSTIN_ACCEPTANCE.md).

Current scope is 100 communal councils, the Chambre des Députés, and the Luxembourg EP delegation. Historical scope is 28 predecessor communal councils. Direct executives: 0. Regional offices: 0. Cantons and districts stay geography. LU-G01 (Grand Duke) and LU-G02 (mayors) are resolved exclusions: no popular contest was added. The merger crosswalk keeps 28 explicit portal edges only. The 1994 Grevenmacher EP LSAP block stays missing.

Named holds stay open: LU-G03, LU-G04, LU-G05, LU-G06, LU-G07, LU-G08, LU-G09, LU-G10, and LU-G11. EP stays drafted `other`. Parliament stays drafted `national`. Per-office `review_status` stays `needs_review`.

`applied_changes=0` for repo/importer/SQLite/VPS/UI. No importer or executable override. Execution CI **Not run**. Land PR omits `results.json` and raw `sources/` (see [SOURCES_NOTE.md](SOURCES_NOTE.md)). `validation.json` is the pre-acceptance PASS receipt. `validate.py` expects the pack root (including omitted results and sources) and the pre-acceptance draft flags. It is not an npm script and was not re-run after this accept-with-holds. Do not invent omitted bytes. PASS does not mean complete research or permission to publish.

Approved tier bytes: `e1d109b024c466677ef084838192bb2bad101c8ad12010b28f6d35879c736169` (predecessor draft `9d3692b95e7188841cfbeea6bf4bee8c52e299811a56474d87948cbc3b43f3ad`). Full review ZIP SHA-256 `93439d6982d581f669d8f303b1d27542aff360e8be3f33ee3961c594ed0dc6da`.

- [x] Justin accepts register scope and named holds (2026-09-22, with named holds).
- [x] Justin accepts draft tiers, including EP as `other` and zero regional offices (2026-09-22; LU-G03–LU-G11 retained).
- [x] Justin accepts LU-G01 and LU-G02 as resolved exclusions (no Grand Duke or mayor popular contest).
- [ ] Justin separately authorizes implementation.
