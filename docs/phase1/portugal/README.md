# Portugal full register — Prompt AD / APPROVED

**10,666 current + 8,168 historical offices; 19,820 events; 66,283 result rows; two proceedings.** Historical records include unresolved aliases, not 8,168 proved abolitions. The current register covers **308 municipalities and 3,258 parishes**, including 37 plenary parishes. Main pinned `785bae49b4b3ac6bc2ef105f33cc826caa948caf`; capture / acceptance 2026-09-21 America/Edmonton. No repository/importer/SQLite/VPS/UI changes.

Draft tiers across all 18,834 records: **municipal 927 / regional 2 / national 2 / other 17,903**. Municipal assemblies, Câmaras and municipal president mandates each have 308 rows. Parish assemblies have 3,221; juntas and parish presidents each have 3,258. Câmara presidents are winning-list heads: no second mayoral ballot is invented. Regional executive appointments are documented without popular election rows. Parish bodies/heads remain drafted **other** (PARISH-TIER hold open).

Start with `docs/phase1/portugal/Portugal_Full_Register_Report.md`. The field map covers all 223 destination columns. Results use compressed JSONL (`results.jsonl.gz`). Bulky raw `sources/`, `retained-archive-members/`, uncompressed `results.json`, and identity vector JSON are omitted from this land transfer — see `data/research/portugal/SOURCES_NOTE.md`.

Open gates (all 17 holds remain OPEN): CURRENT-REGISTER-DATE, INDIRECT-AND-LIST-HEAD, PLENARY-37, PARISH-REFORM-2013-2025, PARISH-TIER, LEGACY-CODE-CONFLICTS, DATES-REPEATS-SPECIALS, PUBLISHED-AGGREGATE-CONFLICTS, PR-2026-RUNOFF, PR-2016-MARGARITA, AZORES-COMPENSATION, MADEIRA-CORRECTION, AR-EUROPE-2022, EP-DETAIL, PRE2009-AND-CANDIDATES, MAI-FEED-HOLES, CERTIFICATION-AND-MARGINS. These are not silently resolved or approved away.

`applied_changes=0` for repo/importer/SQLite/VPS/UI. No importer or executable override. Execution CI **Not run**. Land PR omits `validate_pack.py` and review-ZIP SHA256SUMS; use the original Prompt AD review pack for those checks. PASS does not mean complete research or permission to publish.

- [x] Justin accepts scope, electoral mechanisms and historical identity policy (2026-09-21, with named holds).
- [x] Justin accepts draft tiers (2026-09-21; PARISH-TIER other retained; named holds retained).
- [x] Justin accepts each named numerical and research hold (2026-09-21; all 17 open).

## Navigation

Research: data/research/portugal/. Tier: schemas/atlas/tiers/portugal.json (**approved**, production_accepted). Acceptance: docs/phase1/portugal/JUSTIN_ACCEPTANCE.md. Docs/inventory: docs/phase1/portugal/. Contract references: docs/phase1/portugal/contracts/. No importer included.
