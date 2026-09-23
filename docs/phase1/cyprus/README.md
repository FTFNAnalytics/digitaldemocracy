# Cyprus full register — Prompt AQ / APPROVED WITH HOLDS

**714 current + 174 historical offices; 1,599 events; 11,112 result rows (full pack).** Draft tiers: 877 municipal / 5 regional / 5 national / 1 other. Landed from main `a62bd29f5b0848a69ff14062397d331647cf7ee0`. Justin accepted 2026-09-22 (America/Edmonton) with holds CY-G01–CY-G15 left open.

Start: [JUSTIN_REPORT.md](JUSTIN_REPORT.md). Data: `data/research/cyprus/`. Tiers: `schemas/atlas/tiers/cyprus.json` (**approved**, production_accepted). Receipt: [JUSTIN_ACCEPTANCE.md](JUSTIN_ACCEPTANCE.md).

Current scope is 20 municipal councils, 20 mayors, 93 deputy mayors, 285 community councils, 285 community leaders, five District Local Government Organisation presidents, the House, the President, three religious-group representatives, and the Cyprus EP delegation. Historical scope is 28 municipal councils, 28 mayors, 59 community councils, and 59 community leaders. Direct executives: 404. The communities file stays at 285 named free-area councils against a ministry overview of 286 (CY-G01). The successor crosswalk stays empty. Spilia Agios Antonios and Spilia Kourdali stay separate. Occupied local offices and TRNC offices stay out.

Named holds stay open: CY-G01, CY-G02, CY-G03, CY-G04, CY-G05, CY-G06, CY-G07, CY-G08, CY-G09, CY-G10, CY-G11, CY-G12, CY-G13, CY-G14, and CY-G15. EP stays drafted `other`. The House, the President, and the three religious representatives stay drafted `national`. Five DLGO presidents stay drafted `regional`. Per-office `review_status` stays `needs_review`.

`applied_changes=0` for repo/importer/SQLite/VPS/UI. No importer or executable override. Execution CI **Not run**. Land PR omits `results.json` and raw `sources/` (see [SOURCES_NOTE.md](SOURCES_NOTE.md)). `validation.json` is the pre-acceptance PASS receipt. `validate.py` expects the pack root (including omitted results and sources) and the pre-acceptance draft flags. It is not an npm script and was not re-run after this accept-with-holds. Do not invent omitted bytes. PASS does not mean complete research or permission to publish.

Approved tier bytes: `383512b2601296f78fa33da1376a387ebdb488bd80b426c0a94e2b22efb3eebb` (predecessor draft `bee8a11e4909bf3b587a31c258ace4214dd510489c185301e4bec491afc2ddde`). Full review ZIP SHA-256 `0e6108950460e0a23d0af512959a91957d892c67dc63a21654b450edb9afadad`.

- [x] Justin accepts register scope and named holds (2026-09-22, with named holds).
- [x] Justin accepts draft tiers, including EP as `other` and DLGO presidents as regional (2026-09-22; CY-G01–CY-G15 retained).
- [x] Justin accepts the 285-versus-286 community count, the empty successor crosswalk, the unresolved Spilia Kourdali code, and missing local returns as open (2026-09-22).
- [ ] Justin separately authorizes implementation.
