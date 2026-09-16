# Phase 2 tier pack report

**Drafts only. Continuity publish remains blocked until tiers are approved and Mexico overrides are accepted. No importer/publication CI has been run for these drafts.**

## Governing baseline

Merged main `9065dcdfc0cbc78171dad35b60742ae232b6dd00` (PR #18) matches PR head `f26b14d1323cc4bd26371cc175d28cce042fe607`. Read the accepted Atlas plan, both continuity maps, continuity identity rules, acceptance examples and Prompt D checklist, and the approved Albania pattern/Prompt C documents. Earlier absence warnings inside Prompt B/C/D describe their authoring baseline; the requested migrations and governing documents are now on main. The 22 continuity tier files and Mexico accepted overrides remain absent there at this baseline.

The supplied current prompt's exact five-value tier vocabulary and continuity schema are used; Albania is unchanged. These are proposals based on frozen institutional/geographic evidence, not a new statutory research verification or approval of completeness. All raw source values, events, score gates and dates remain untouched.

## File inventory and proposed tiers

All IDs are exact existing office IDs; LatAm includes historical offices. File stems below resolve to `schemas/atlas/tiers/<stem>.json`. National=0 is a draft result, not a claim that these countries have no national elections. Regional totals are draft office-record totals across continuity inputs, never European coverage or a denominator.

| Country / file stem | Offices | Current | Historical | National | Regional | Municipal | Other | Unknown | Focused review |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| antigua-and-barbuda | 1 | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 1 |
| argentina | 3560 | 3440 | 120 | 0 | 154 | 3293 | 29 | 84 | 499 |
| bahamas | 33 | 33 | 0 | 0 | 0 | 33 | 0 | 0 | 33 |
| belize | 19 | 19 | 0 | 0 | 0 | 19 | 0 | 0 | 0 |
| brazil | 62 | 62 | 0 | 0 | 54 | 8 | 0 | 0 | 2 |
| colombia | 2307 | 2307 | 0 | 0 | 64 | 2206 | 37 | 0 | 37 |
| costa-rica | 670 | 666 | 4 | 0 | 0 | 168 | 499 | 3 | 502 |
| cuba | 168 | 168 | 0 | 0 | 0 | 168 | 0 | 0 | 0 |
| dominica | 25 | 25 | 0 | 0 | 0 | 25 | 0 | 0 | 0 |
| dominican-republic | 786 | 786 | 0 | 0 | 0 | 316 | 470 | 0 | 470 |
| ecuador | 1297 | 1295 | 2 | 0 | 23 | 446 | 828 | 0 | 828 |
| el-salvador | 306 | 44 | 262 | 0 | 0 | 306 | 0 | 0 | 262 |
| guatemala | 340 | 340 | 0 | 0 | 0 | 340 | 0 | 0 | 0 |
| guyana | 83 | 80 | 3 | 0 | 0 | 83 | 0 | 0 | 83 |
| haiti | 1153 | 1153 | 0 | 0 | 0 | 149 | 1004 | 0 | 1004 |
| jamaica | 243 | 243 | 0 | 0 | 0 | 243 | 0 | 0 | 0 |
| mexico | 1852 | 1852 | 0 | 0 | 48 | 1804 | 0 | 0 | 0 |
| paraguay | 526 | 526 | 0 | 0 | 0 | 526 | 0 | 0 | 0 |
| peru | 5039 | 5028 | 11 | 0 | 50 | 1903 | 3086 | 0 | 3097 |
| saint-kitts-and-nevis | 6 | 6 | 0 | 0 | 0 | 0 | 6 | 0 | 6 |
| trinidad-and-tobago | 167 | 155 | 12 | 0 | 0 | 155 | 0 | 12 | 26 |
| new-zealand | 4 | 4 | 0 | 0 | 0 | 3 | 1 | 0 | 1 |
| TOTAL | 18647 | 18233 | 414 | 0 | 393 | 12194 | 5961 | 99 | 6851 |

## Classification rationale and human-review queue

Clear municipal institutions and council ward seats are proposed municipal. Explicit provincial/state/departmental/regional executives and chambers follow the institution, including seats elected in smaller constituencies. Island bodies are conservatively other pending regional-versus-other review. Distinct submunicipal bodies are conservatively other pending the scope decision; this includes Peru populated-centre municipal slates despite the municipal word in their office type. School districts are other, with scope review. Generic unlinked historical institutions are unknown. These group decisions are not silently applied at import: every office has an explicit row with rationale and hashed evidence.

Every pack needs approval. Focused flags are recorded for 6851 unique offices; 6542 have an explicit tier uncertainty. Categories below can overlap (do not sum them as unique offices). The JSON fragment enumerates every flagged ID, country, rationale, classification-row pointer and evidence pointer. No item is resolved.

| Review category | Offices | Countries | Example existing ID |
| --- | --- | --- | --- |
| autonomous_city_scope | 2 | argentina | AR-CABA-G |
| corporation_scope | 14 | trinidad-and-tobago | TT-C-ARIMA |
| district_local_government | 33 | bahamas | BS-D-NORTH-ABACO |
| federal_district_scope | 2 | brazil | BR-DF-G |
| historical_boundary_binding | 315 | argentina, costa-rica, ecuador, el-salvador, guyana, peru | AR-SF-M-BELGRANO-ARMSTRONG |
| historical_institution_unresolved | 99 | argentina, costa-rica, trinidad-and-tobago | AR-ER-LEGACY-1-0080C-V |
| island_institution | 7 | antigua-and-barbuda, saint-kitts-and-nevis | AG-BARBUDA-COUNCIL |
| local_council_component | 83 | guyana | GY-PR-2.06 |
| rural_local_government | 338 | argentina | AR-ER-1-COLONIACELINA-V |
| school_district | 14 | argentina | AR-NQ-SCHOOL-DISTRICT-01-CE |
| special_provincial_body | 10 | argentina | AR-CB-CORDOBA-TP |
| submunicipal_scope | 5940 | argentina, colombia, costa-rica, dominican-republic, ecuador, haiti, new-zealand, peru | AR-CABA-C01 |

Review handling:

1. Inspect the cited office/geography/raw row before approving a classification. Resolve unknowns only with institutional evidence; do not coerce unknown to other. A deliberately reviewed unknown may remain NULL/unknown under Prompt D.
2. Confirm the institution-level policy for special/local/island bodies. For known unresolved proposals, retain needs_review rather than silently clearing flags. Approving a file and resolving individual flags are separate explicit decisions.
3. Historical office IDs remain historical and retained; tier review does not establish boundary continuity, merge predecessors or select dates/events.
4. Approve only through a later human-reviewed change with provenance. Approval edits change tier-file hashes and therefore the target lineage fingerprint. None of the draft hashes is an accepted production release fingerprint.

## Status-only entries

These 15 existing LatAm country/territory records get no tier file and no dummy office: `barbados`, `bolivia`, `chile`, `grenada`, `honduras`, `nicaragua`, `panama`, `saint-lucia`, `saint-vincent-and-the-grenadines`, `suriname`, `uruguay`, `venezuela`, `french-guiana`, `falkland-islands-islas-malvinas`, `south-georgia-and-the-south-sandwich-islands`. Their country pages and provenance remain a Phase 2 continuity requirement.

## Draft file SHA-256

SHA-256 covers the exact UTF-8 JSON bytes delivered, including the final newline. All files have status draft_for_human_review.

| Draft path | SHA-256 |
| --- | --- |
| schemas/atlas/tiers/antigua-and-barbuda.json | 0b31a8f398733e1fb3ca8996fcc60ed74fc7b150dd3f669afe745b8b8ac4c53d |
| schemas/atlas/tiers/argentina.json | b7222942b019f3a4d23c6b97048f84752ba5860637b39715e73d792bb3a714df |
| schemas/atlas/tiers/bahamas.json | 3ec8962a79073d08546c964fe1e60a49d16c9c9234c5a18e7af15cadb885e1c1 |
| schemas/atlas/tiers/belize.json | f2c23e0b0907aa5e7b6dfa18df59edb19aaef5887b62f8cd8dc3690942e0bb95 |
| schemas/atlas/tiers/brazil.json | 352d9e61f7ec55948bc3549d81c1f1386917efa64d5650a1f619f37239b67bcc |
| schemas/atlas/tiers/colombia.json | 37a3b00a7122f5126dd88eb4ba1459017a73a6e04e91985ad2bdb4483248a1fb |
| schemas/atlas/tiers/costa-rica.json | ca8d52d5365cd061e610b42350418337d2783d8a285c6780a0f8ac713d9dc7f1 |
| schemas/atlas/tiers/cuba.json | 6ec6d9f0af63a833a30bb91a571961ce2373d2005b7502080d25afabe4b35cda |
| schemas/atlas/tiers/dominica.json | 3b5358c8dff50814c6cf09f716160c21738ec8f2556f4b2d8583caa027e3e3dc |
| schemas/atlas/tiers/dominican-republic.json | ca908314a25789d25468e86eb8f90e8822ffc5c35fa46efe188d3c73fcdaaee1 |
| schemas/atlas/tiers/ecuador.json | 553abb676e222b451f7cf1c974148c420bf585349e65bbd7b2c66d80a37596d8 |
| schemas/atlas/tiers/el-salvador.json | fb83d13490131fe99bf3da5d1c8e03818125ec4eba3290c362cc2bb535a82906 |
| schemas/atlas/tiers/guatemala.json | 2e42b19df3047bf94b2b7225d4d845f561e390c3316fd194dbb0eae0b7259edc |
| schemas/atlas/tiers/guyana.json | bc46eca22cfee494aa382718c79bba8bebc389f5a2746c069f99761e4c7dfff8 |
| schemas/atlas/tiers/haiti.json | dd4938cd5fa0abc969d8ae6e57543d617d3157db130778d780c85e1dc90f02ae |
| schemas/atlas/tiers/jamaica.json | d2a5ec1393302a67ee37531afeda963f390942cd8bd92261bce087936b846e73 |
| schemas/atlas/tiers/mexico.json | 7d9dba9c24e837e4bcdbbb7198de839ed60ce41c102edc0134dc79d310d53896 |
| schemas/atlas/tiers/paraguay.json | 244f2ef218ffe089ee72e3f05fd360e76e8da4f59188d9e6f9f783af00b920a3 |
| schemas/atlas/tiers/peru.json | dc99659216d9ca3229fc0405961bbe07ff7819df6077f309a50e78985d70f190 |
| schemas/atlas/tiers/saint-kitts-and-nevis.json | 6ce07e599a5378ea650167609cdc468fe3abc584975a582cf234f7b54a9c5171 |
| schemas/atlas/tiers/trinidad-and-tobago.json | 13e1fd7091e1031d8311dc831f4f1d2502dc9f7003a3a2d3c3f85c35f4fda10c |
| schemas/atlas/tiers/new-zealand.json | 0b06d2312a1a5b3f57696f53581a341a5393e22daac35ac8cf0fa844d67c775a |

## Mexico prerequisite

All 67 percentage-domain violations are enumerated in [Mexico_Share_Domain_Override_Draft.md](Mexico_Share_Domain_Override_Draft.md) and the draft JSON inventory. There are 27 affected events and 27 offices. No supplied or alternate share is corrected, selected, clamped, scaled, coerced to NULL or dropped. Every proposed decision remains needs_human_review. The inventory is deliberately not an executable atlas-override/1 file.

## Verification and remaining gates

Completed read-only/draft checks: source compressed hashes against manifest; original object decoded hashes/member sizes; source office-set equality; all 22 draft ID sets and uniqueness; 18,647 total mappings with 414 historical offices retained; every evidence pointer resolves; tier histograms and review flags reconcile; no cross-lineage/European office-ID collision; no fixture office IDs; all 67 exception IDs equal Prompt D's list and frozen source values; all raw alternate fields match; all files remain drafts; frozen inputs/DDL/governing files unchanged. Detailed checks appear in validation.json.

These checks establish draft integrity, not statutory correctness, approval, successful ingestion, publication or research completeness. Prompt D's multi-lineage, unchanged-reimport, poison rollback, missing≠zero, date, source, fixture, publication/citation and cutover gates remain required. A Europe-only refresh must retain LatAm/NZ rows and own-lineage citations. Regional zero remains allowed, Europe stays the default landing, and Armenia is not expanded here.
