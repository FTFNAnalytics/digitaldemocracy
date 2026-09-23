# Justin acceptance — Malta Prompt AP

**Date:** 2026-09-22 (America/Edmonton)  
**Decision:** Accept with named holds  
**Scope:** 213 current + 2 historical offices (215 total); 223 events; 4,084 result rows and 64,204 STV count observations in the full pack

## Accepted
- Full current office register: 68 local councils (54 Malta / 14 Gozo), 68 mayors, 68 deputy mayors, 6 indirect regional presidents, the House, the President of Malta, and one EP delegation
- Two historical offices: the Gozo Civic Council and its president
- Draft tiers: 204 municipal / 8 regional / 2 national / 1 other (one classification per office)
- Standalone direct-executive offices: 0
- Mayors and deputy mayors stay `conditional_first_preference_rule_or_council_election` with `standalone_popular_executive_ballot=false`. No separate popular mayor or deputy contest was added
- President `MT-PRESIDENT` stays `indirect_House_resolution`. No popular presidential ballot and no House division tally was added
- Regional presidents stay indirect elections by councillors. Four 2021 sole nominees stay nominations in `regional-nominations-not-results.json`
- Successor crosswalk stays empty. No successor link from the Gozo Civic Council to the modern Gozo Region
- EP stays one delegation on tier `other`. The later sixth-seat transition is not a new popular election
- Standing Atlas policy (full register even outside the ~18-month alert window)
- Structural `validation.json`: **PASS** (`applied_changes=0`; Justin boxes were unchecked in that pre-acceptance receipt)

## Named holds (open, not blockers)

These are the open gates in [Malta_Research_Gaps.md](Malta_Research_Gaps.md). None was closed or amended.

1. Presidential indirect election — 2019 and 2024 resolutions are documented. Numeric House division tallies and the earlier presidential-resolution series remain uncollected. A unanimous description is not a vote count. The current two-thirds rule is not projected backwards.
2. STV transfers — published count tallies and signed deltas are retained, including ellipses. Paper-level transfers and recounts are not invented. The pack does not claim independent recertification.
3. Post-election changes — casual-election count tables, co-option instruments, and legal/court adjustments are not exhaustively normalized. Unannotated later entries stay source observations.
4. Mayoral selection — council-by-council first meetings, refusals, tie rules, no-confidence replacements, and current incumbencies are not exhaustively audited.
5. Local creation and boundaries — 1993 founding 67 and Mtarfa's December 1999 addition are source-established gates. Earlier elections (1993–2012), historic boundary amendments, and exact effective territorial versions remain open. Zero historical local-council rows is not proof that boundaries never changed.
6. Regional bodies — six current regional presidencies have indirect electoral footing. Appointed regional membership and deputies stay excluded. No old/new regional successor map is guessed.
7. Gozo Civic Council — establishment, the 4 June 1961 election, and Anton Tabone's 4 July council election are recorded. Candidate votes, remaining cycles, and the original dissolution instrument remain outstanding.
8. European Parliament — five ordinary returns are captured. Original 2004/2009 five-seat elections are not overwritten with the current six-seat entitlement. Subsequent MEP replacements are not reconstructed as a new popular election.
9. Certified versus preliminary — EC official-result publication status is retained. Independent Government Gazette certification is not asserted for every row.
10. Exact inherited field contract — 223 table-column pairs are retained from the prior Atlas contract. A new production-schema pin was not checked.

No popular presidential or mayor ballot, STV transfer paper, or missing House division tally was invented for this landing.

## Authoritative pack counts
- 213 current + 2 historical offices
- Local councils: 54 Malta / 14 Gozo (68). Mayors 68. Deputy mayors 68. Indirect regional presidents 6
- House / President / EP: 1 / 1 / 1
- Historical Gozo Civic Council rows: 1 council + 1 president. Historical local-council rows: 0
- 223 events; 4,084 result rows; 4,050 numeric first-preference rows; 64,204 STV count observations
- 1,144 source-inventory entries; 1,139 distinct source files in the full pack (omitted from this slim land)
- Draft tiers: municipal 204 / regional 8 / national 2 / other 1
- Full review ZIP SHA-256: `ad2fa809d572305e9002fb9cae6ede149ecedb9394cf402eec15ae3ca6716ecb` (validation note MATCH; `Malta_Atlas_Prompt_AP_2026-09-22.zip`, 6,968,330 bytes)
- Slim land attachment SHA-256: `945d54bf8c238e4dee8143d0af82bcd4458f35710edc5d2a32c1149ebe831e7b` (`malta-ap-land-slim` upload, 1,311,399 bytes). Present members matched `SHA256SUMS` (28 files). The outer slim-zip digest is not the full-pack digest
- Landed from main `5935187e8f0df09c4436c4feaba1869dafb4090e`, then rebased onto main `b4c655b` after Romania #68, Greece #69, Luxembourg #70, France #73, and Cyprus #72. Shared indexes keep those country lines and Malta.
- Structural validation.json: PASS
- Predecessor draft tier SHA-256: `5714dde427d288850b4c9c8aa9a5c9000ba803321f9cb6adc66c760b74e06d18`
- Approved tier file SHA-256: `49e0238e4c00ede6839a8c9d77fb11fe43646a8add8c906320da696cad1839c8`
- Omitted `data/results.json` SHA-256 (manifest only): `4ecb57ee354b0cc5b9787abae57342cc08fb53eb3c430a2d061e00d8a8bd187f`
- Omitted `data/stv-counts.json` SHA-256 (present in the slim zip, left out of the repo): `3fec21da7cd4461bf548df0fb4d1d7c623b62d551b0ce3d91d09a29a0c51693b`

## Land slim notes
- `sources/` omitted (1,139 hashed captures listed in `SHA256SUMS` and `source-inventory.json`; not in the slim zip)
- `data/results.json` omitted (4,084 result rows remain in the full ZIP; not in the slim zip)
- `data/stv-counts.json` omitted from the repo (64,204 observations; bytes were in the slim zip and were not rewritten)
- `docs/phase1/malta/SHA256SUMS` is the full-pack manifest, including omitted paths
- Documentary contract bytes are `contracts/Inherited_223_Column_Contract.md` and `contracts/columns.json` (no `*.ts`; `tsconfig.json` unchanged)
- `JUSTIN_REPORT.md`, `Malta_Justin_Report.md`, and `validation.json` stay the pre-acceptance receipt: approvals unchecked, `applied_changes=0`
- `validate.py` expects the pack root, including omitted `results.json`, `stv-counts.json`, and `sources/`, and draft `justin_approved=false`. It is not an npm script and was not re-run after this accept-with-holds
- Per-office `review_status` stays `needs_review`. File status is `approved` with holds open
- Research JSON keeps `justin_approved=false`. Acceptance is this file and `schemas/atlas/tiers/malta.json`

## Out of scope this land
- Malta `import:atlas` importer (no `lib/atlas/malta/`; no `package.json` import script; no `ATLAS_IMPORT_SCOPE=malta` or `all`)
- `/electiondatabase` redirects
- VPS deploy or live import
- Other countries
