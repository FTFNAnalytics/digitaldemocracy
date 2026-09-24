# France full register — Prompt AR / APPROVED WITH HOLDS

**35,112 current + 2,738 historical offices; 119,554 events; 1,193,657 result rows (full pack).** Draft tiers: T1 4 / T2 45 / T3 96 / T4 37,705. Landed from main `bee1215e74e57609b15aed1c9788715ff15b0be1`. Justin accepted 2026-09-22 (America/Edmonton) with holds G01–G21 left open.

Start: [Justin_Report.md](Justin_Report.md). Pack narrative: [France_Pack_README.md](France_Pack_README.md). Data: `data/research/france/`. Tiers: `schemas/atlas/tiers/france.json` (**approved**, production_accepted). Receipt: [JUSTIN_ACCEPTANCE.md](JUSTIN_ACCEPTANCE.md).

Current scope is 34,952 municipal councils, 95 departmental councils, 14 regional councils, 3 single territorial assemblies, the Lyon metropolitan council, 34 arrondissement/sector councils, 5 overseas territorial assemblies, the New Caledonia congress, 3 provincial assemblies, Assemblée nationale, Sénat, the President, and the France EP delegation. Direct executives current: 1. Local direct executives: 0. Historical scope is 2,719 municipal councils, 18 regional councils, and 1 single territorial assembly. The successor crosswalk stays empty.

Named holds stay open: G01, G02, G03, G04, G05, G06, G07, G08, G09, G10, G11, G12, G13, G14, G15, G16, G17, G18, G19, G20, and G21. Draft tier labels are unchanged. `FR-EP` stays draft tier 1 and was not moved to `other`. PLM sector councils stay draft tier 4. Per-office `review_status` stays `needs_review`.

The accept-with-holds land kept `applied_changes=0` and did not run the importer. The follow-up importer is `ATLAS_IMPORT_SCOPE=france` — see [France_Import.md](France_Import.md). It publishes 35,112 current + 2,738 historical offices, **0 election events**, and **0 result rows** (the full pack's 119,554 events, 173,409 reporting units, and 1,193,657 result rows stay in omitted files; coverage tables and territorial movements are not substitutes). Named holds stay open. `ATLAS_IMPORT_SCOPE=all` does not import France. VPS deploy is out of scope. Land PR omits `sources/`, `results.jsonl`, `events.jsonl`, and `reporting-units.jsonl` (see [SOURCES_NOTE.md](SOURCES_NOTE.md)). `validation-report.json` is the pre-acceptance PASS receipt. `validate.py` expects the pack root (including omitted results, events, reporting units, and sources) and the pre-acceptance draft flags. It is not an npm script and was not re-run after this accept-with-holds. Do not invent omitted bytes, a popular mayor contest, an EPCI popular contest, a guessed commune-nouvelle edge, or a zero-filled missing result. PASS does not mean complete research.

Approved tier bytes: `727dd2d4152b46c65a77ec0fb73d606631dad2c567474fb61a12d7bd596a970a` (predecessor draft `8d103d5733f8bcd15dccf167d8e6e7cab2814b124f3a8f20564a05d5ec0ec16a`). Full review ZIP SHA-256 `c18df21fa6233e2b7536a23621d4a8aafcec76316d6d8f3921b3bed92753acf9`.

- [x] Justin accepts register scope and named holds (2026-09-22, with named holds).
- [x] Justin accepts draft tiers T1–T4, including EP inside tier 1 and PLM sectors inside tier 4 (2026-09-22; G01–G21 retained).
- [x] Justin accepts G01–G21 as open (2026-09-22).
- [x] Justin separately authorizes implementation (`ATLAS_IMPORT_SCOPE=france`; not part of `all`).
