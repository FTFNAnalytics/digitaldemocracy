# Greece full register — Prompt AM Rebuilt / APPROVED WITH HOLDS

**693 current + 10 historical offices; 2,774 events; 3,555 proceedings; 14,004 result rows / 8,021 distinct observations.** Draft tiers: 674 municipal / 26 regional / 2 national / 1 other. Justin accepted 2026-09-22 (America/Edmonton) with named holds left open.

Start: [Greece_Pack_README.md](Greece_Pack_README.md) and [JUSTIN_REPORT.md](JUSTIN_REPORT.md). Data: `data/research/greece/`. Tiers: `schemas/atlas/tiers/greece.json` (**approved** with holds, `production_accepted`). Receipt: [JUSTIN_ACCEPTANCE.md](JUSTIN_ACCEPTANCE.md).

Current scope is 332 municipal councils, 332 direct mayors, 13 regional councils, 13 direct governors, Parliament, an indirect presidency, and one Greek EP delegation. Current direct executives: 345. Historical offices are five abolished municipal council/mayor pairs. No PM, cabinet, or prefect row is invented. Identity crosswalk rows do not assert successor edges.

Named holds stay open: GR-G01, GR-G02, GR-G03, GR-G04, GR-G05, GR-G06, GR-G07, GR-G08, GR-G09, and GR-G10, plus 14 local source holds (13 regional 2019 station-denominator snapshots and the Messini 2014 tied runoff, `GR-M-9255-C` / `GR-M-9255-M`). GR-G04 stays `partially_resolved` as supplied and is not closed. EP stays drafted `other`. President `GR-PRES` stays `parliamentary_indirect`.

`applied_changes=0` for importer/SQLite/VPS/UI. No importer or executable override. Execution CI **Not run**. Slim land omits raw `sources/` (see [SOURCES_NOTE.md](SOURCES_NOTE.md)). `docs/phase1/greece/validation.json` is the pre-acceptance PASS receipt (`historical_numeric_coverage_complete=false`). Do not invent omitted source bytes, Kallikratis successor edges, or zero-filled gaps. PASS does not mean complete historic coverage or permission to publish.

Approved tier bytes: `97c2587226c8e7cb1bf50233e6ff23844eeda52437a6e852efb41266dd3c88b6` (predecessor draft `57f425425b5bbb646df5dee39a04789e6aa4ed8501c7033867b2327f1aee6c59`). Full Rebuilt ZIP SHA-256 `356ca5f15f68939eb0acacfc5a9817cba35d03e489ecbd3673069cfc136713eb`.

- [x] Justin accepts register scope and named holds (2026-09-22, with named holds).
- [x] Justin accepts draft tiers, including the indirect presidency and EP as drafted `other` (2026-09-22; GR-G01 and GR-G06 retained).
- [x] Justin accepts the named research holds as open (2026-09-22).
- [ ] Justin separately authorizes implementation.
