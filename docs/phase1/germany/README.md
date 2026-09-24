# Germany full register — Prompt AS / ACCEPTED WITH HOLDS

**21,960 current + 670 historical offices (22,630 total); 13,845 events; 1,299,670 result records in the full pack.** Draft jurisdiction tiers: 3 / 20 / 552 / 22,055 (tiers 1 / 2 / 3 / 4). Justin accepted 2026-09-22 (MT) with holds DE-G01–DE-G23 left open.

Start: [Germany_Pack_README.md](Germany_Pack_README.md) and [Justin_Report.md](Justin_Report.md). Receipt: [JUSTIN_ACCEPTANCE.md](JUSTIN_ACCEPTANCE.md). Tiers: `schemas/atlas/tiers/germany.json` (pack classifier, included as supplied; numeric jurisdiction tiers stay in the row and are not rewritten). This land is docs and tiers only. There is no `data/research/germany/` tree.

`research_coverage_complete` stays false. The delivered direct-executive count (9,585) is a subset. Schleswig-Holstein stays at 86 verified direct mayors (DE-G06). Named subdivision rosters for the open Länder stay unenumerated (DE-G10). The 26 territorial relations do not assert office continuity (DE-G09). Fifteen Land seat panels and Bavaria 1950 party votes stay withheld (DE-G23).

Named holds stay open: DE-G01, DE-G02, DE-G03, DE-G04, DE-G05, DE-G06, DE-G07, DE-G08, DE-G09, DE-G10, DE-G11, DE-G12, DE-G13, DE-G14, DE-G15, DE-G16, DE-G17, DE-G18, DE-G19, DE-G20, DE-G21, DE-G22, and DE-G23. Per-office `review_status` stays `draft_unapproved`.

The accept-with-holds land kept `applied_changes=0`. Slim land omits `sources/`, `results.jsonl`, `events.jsonl`, and other bulky dumps (see [SLIM_LAND_NOTE.md](SLIM_LAND_NOTE.md) and [SHA256SUMS](SHA256SUMS)). `metadata.json` is the pre-acceptance receipt. The follow-up importer is `ATLAS_IMPORT_SCOPE=germany` — see [Germany_Import.md](Germany_Import.md). It publishes 21,960 current + 670 historical offices, **0 election events**, and **0 result rows**. It does not emit documented-omitted totals for the missing result and event files. Named holds stay open. Per-office file `review_status` stays `draft_unapproved`; the published classification stays `needs_review` and is not promoted to `approved`. `ATLAS_IMPORT_SCOPE=all` does not import Germany. VPS deploy is out of scope. Do not invent omitted bytes, missing SH mayors, subdivision rosters, successor edges, or repaired seat panels.

Checked-in tier bytes: `99a83b35f8d5e71c7249a70db6c8b7fb71d2f2f1f5a6234eeec8fd3a17a2e89a` (predecessor `data/draft-tiers.jsonl` `0f27312e722d89f7dee08543febf8eeacde0e953b82c5a78a6564ccadd0a5806`, omitted here). Full review ZIP SHA-256 `c942da67e09e37b6d1eb914ec12ad6d1e2a1baae2671300e10e303e89dd13ea6`.

- [x] Justin accepts register scope and named holds (2026-09-22, with DE-G01–DE-G23 left open).
- [x] Justin accepts the supplied draft jurisdiction tiers (numeric 1/2/3/4; not remapped).
- [x] Justin separately authorizes implementation (`ATLAS_IMPORT_SCOPE=germany`; not part of `all`).
