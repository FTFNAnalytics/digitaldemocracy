# Cyprus import on the VPS

Cyprus is lineage `country-package-cyprus`. Justin accepted Prompt AQ offices on 2026-09-22 with named holds: **714 current + 174 historical** (888 classifications). Every classification stays `needs_review`: 877 municipal / 5 regional / 5 national / 1 other. Current scope is 20 municipal councils, 20 mayors, 93 deputy mayors, 285 community councils, 285 community leaders, 5 District Local Government Organisation presidents, the House (`CY-HOUSE`), the President (`CY-PRESIDENT`), 3 religious-group representatives, and one Cyprus EP delegation (`CY-EP`, drafted `other`). Historical scope is 28 municipal councils, 28 mayors, 59 community councils, and 59 community leaders. Current direct executives: 404. The communities file stays at 285 named free-area councils. The ministry overview of 286 stays unresolved. The successor crosswalk stays empty. Spilia Agios Antonios (`CY-COM-1401`) and Spilia Kourdali (`CY-COM-SPILIA-KOURDALI`) stay separate. Named holds stay open: CY-G01 through CY-G15. Do not invent a 286th community, a TRNC office, a 2024 reform successor edge, a Spilia code join, or a zero-filled missing local return.

`CY-EP` stays `other`. `CY-HOUSE`, `CY-PRESIDENT`, and the three religious representatives stay `national_context`. Religious representatives stay without a plenary vote. Legal outcomes stay `unknown` (Gazette certification is open). Calendar dates stay null and are not prospective events. Year-only event labels stay year-only.

The slim pack omits `data/results.json` (11,112 result rows; manifest SHA-256 `13abc8a38053bdf44146be63fb15a1673137ed868054ebd4880146c2e44a3b04`) and `sources/` (156 hashed captures). This importer publishes **0 result rows**. `reporting-units.json` (1,679 rows) and `reconciliation.json` are not substitutes for the omitted file. Source rows are not invented from the inventory. The review ZIP SHA-256 `0e6108950460e0a23d0af512959a91957d892c67dc63a21654b450edb9afadad` is not this release. The slim candidate fingerprint is `e1de107d562ffe88d990aa211a7c23e3d6c30911d0d0bf3b7f362e7863ff1cd1`. Approved tier bytes are `383512b2601296f78fa33da1376a387ebdb488bd80b426c0a94e2b22efb3eebb`.

`/electiondatabase` redirects and other countries are unchanged. `ATLAS_IMPORT_SCOPE=all` does not import Cyprus.

## VPS `168.231.74.70`

Use the existing Atlas SQLite paths. Do **not** point a laptop or CI job at production. This PR does not deploy.

```bash
# After this PR is on the VPS checkout (pull/deploy the app tree first)
export ATLAS_SQLITE_PATH=/var/lib/cdd/atlas.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/var/lib/cdd/atlas-attempts.sqlite
export ATLAS_OPERATOR=genevieve

# Schema is already applied if Albania/Belgium/LatAm are live. Migrate only if
# this host has never run migrate:atlas / import:atlas.
# npm run migrate:atlas

# Staging import of Cyprus only. Other published lineages stay in place.
ATLAS_IMPORT_SCOPE=cyprus npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all`. That command re-imports the other approved lineages and does not publish Cyprus.

Expected Cyprus lines:

```
lineage=country-package-cyprus
cyprus_offices=888
cyprus_current=714
cyprus_historical=174
cyprus_municipal=877
cyprus_regional=5
cyprus_national=5
cyprus_other=1
cyprus_selected_histories=1599
cyprus_prospective_events=0
cyprus_result_rows=0
cyprus_documented_result_rows_omitted=11112
cyprus_sources=0
cyprus_unresolved=15
cyprus_approved=0
cyprus_needs_review=888
cyprus_current_local_councils=305
cyprus_current_municipal_councils=20
cyprus_current_mayors=20
cyprus_current_deputy_mayors=93
cyprus_current_community_councils=285
cyprus_current_community_leaders=285
cyprus_current_dlgo_presidents=5
cyprus_direct_executive_offices=404
cyprus_historical_direct_executives=87
cyprus_explicit_predecessor_edges=0
cyprus_named_communities=285
cyprus_ministry_overview_communities=286
cyprus_year_only_events=7
cyprus_offices_without_events=88
cyprus_geographies=494
```

A second run with unchanged `data/research/cyprus/` + approved `schemas/atlas/tiers/cyprus.json` reuses the same release and writes a new attempt UUID.

Local / CI proof (never the VPS DB):

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-cyprus.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-cyprus-attempts.sqlite
ATLAS_IMPORT_SCOPE=cyprus npm run import:atlas
```

Standing policy: historic and out-of-window offices are retained. The ~18-month alert window does not filter the import universe. No next-date metadata is invented, and next-date metadata is not a prospective event. Missing results stay gaps, not zeros. The 11,112 omitted result rows are not invented. Authored events are the selected history of the accepted register. No prospective event is created.
