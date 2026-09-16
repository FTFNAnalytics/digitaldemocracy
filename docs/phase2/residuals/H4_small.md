# H4 — Smaller residual sets

**DRAFT — pending Justin. No changes applied; no tier JSON bytes rewritten.** All exact rows, current rationales, hashed pointers and evidence records are in `residual-open-inventory.json`. Country-pack approval and any optional uncertainty-only edit are separate decisions.

Review **39** rows across seven countries. Recommend keeping 24 open and deferring 15 unresolved-institution rows; propose no full clearance or tier correction. Trinidad and Tobago’s 12 generic historical ballots and Costa Rica’s three generic district ballots need exact institutional evidence. Peru’s 11 named municipal ballots retain their municipal tier but lack historical-code bindings.

The six Nevis records must receive a coherent institution-level disposition; assembly constituencies are not separate governments. Barbuda needs a separate decision, and its frozen source list consists of three secondary election pages. This pack does not promote either island institution from other to regional based on geography alone.

Guyana’s three exact residual predecessor IDs are absent from the retained 21 name bridges; general notes about reviewed declarations do not supply those missing bindings. Preserve PR-component scope. Costa Rica’s Monteverde intendant and Ecuador’s two parish boards retain their identity/history holds. Sevilla Don Bosco’s source note expressly says former parish returns are not histories of the new municipal offices.

Six optional taxonomy-only proposals are separate: Costa Rica one, Ecuador two, Guyana three. Default = deferred; even a later go decision keeps their human-review flags true.

## Proposed batches

| Batch | Rows | Recommendation | Specific acceptance question |
| --- | --- | --- | --- |
| H4-AG | 1 | keep_open | An explicit evidence-supported regional-versus-other disposition for Barbuda, distinct from Nevis. Preserve staggered renewals and ex-officio distinctions. |
| H4-CR1 | 1 | keep_open | Reviewed old-code and institution/successor binding. Any taxonomy-only uncertainty clearance remains in the separate optional appendix. |
| H4-CR2 | 3 | defer_with_reason | Identify the original ballot institution and its dated territorial binding before any known-tier proposal. |
| H4-EC | 2 | keep_open | Review each historical binding separately; former parish events must not be reassigned as elections of new municipal offices. |
| H4-GY | 3 | keep_open | A reviewed identity/name bridge for each record, retaining its PR-component scope and boundary caveat. |
| H4-PE | 11 | keep_open | A reviewed historical code/crosswalk binding for each exact record; no guessed current-office successor. |
| H4-KN | 6 | keep_open | An explicit institution-level disposition with cited institutional evidence; assembly constituencies must follow the same institution without being counted as separate governments. |
| H4-TT | 12 | defer_with_reason | Exact source electoral-code identity and institution evidence; do not infer ward/corporation tier from a prefix. |

## Source-specific exemplars

### AG-BARBUDA-COUNCIL

Classification: `schemas/atlas/tiers/antigua-and-barbuda.json` `/classifications/0`; SHA-256 `0b31a8f398733e1fb3ca8996fcc60ed74fc7b150dd3f669afe745b8b8ac4c53d`. Current tier `other`; human review `true`; tier uncertain `true`. Inventory `/rows/0`.

Retained office note: 2025/2023/2021 actual renewal events retained. Expected 2027 four-seat cohort requires formal call. Nine elected seats and two ex officio members are distinct; result seats are only those renewed.

Source: `data/research/countries/antigua-and-barbuda.json.gz` `/offices/0/extensions/raw/note`; SHA-256 `525145b32596a539a17e568f199175498e4c3cabd761365df70e0c1b59ab194c`.

Recommendation: **keep_open**. The retained office is a staggered council renewal; its three source URLs are secondary election pages and do not settle institutional tier.

### CR-I-PUNTARENAS-PUNTARENAS-MONTEVERDE

Classification: `schemas/atlas/tiers/costa-rica.json` `/classifications/666`; SHA-256 `51065bd53aa60685a9d4c875a64716b92e0477c28d9afdee4eea377167bffd06`. Current tier `other`; human review `true`; tier uncertain `true`. Inventory `/rows/121`.

Retained office note: Historical electoral code is not linked to the current geographic register. Retained as archival evidence and excluded from tracked current units.

Source: `data/research/countries/costa-rica.json.gz` `/offices/666/extensions/raw/note`; SHA-256 `148944324ed2fb996d9c947d40cf7a22389b09a1e554d2c00b0df30e4b898c72`.

Recommendation: **keep_open**. The named intendant remains other under the earlier proposal, but the exact note leaves its historical code unlinked.

### CR-D-ALAJUELA-GRECIA-RIO-CUARTO

Classification: `schemas/atlas/tiers/costa-rica.json` `/classifications/667`; SHA-256 `51065bd53aa60685a9d4c875a64716b92e0477c28d9afdee4eea377167bffd06`. Current tier `unknown`; human review `true`; tier uncertain `true`. Inventory `/rows/122`.

Retained office note: Historical electoral code is not linked to the current geographic register. Retained as archival evidence and excluded from tracked current units.

Source: `data/research/countries/costa-rica.json.gz` `/offices/667/extensions/raw/note`; SHA-256 `148944324ed2fb996d9c947d40cf7a22389b09a1e554d2c00b0df30e4b898c72`.

Recommendation: **defer_with_reason**. District ballot does not uniquely identify the institution, and the historical code is unlinked. Retain unknown and both flags.

### CR-D-PUNTARENAS-PUNTARENAS-MONTEVERDE

Classification: `schemas/atlas/tiers/costa-rica.json` `/classifications/668`; SHA-256 `51065bd53aa60685a9d4c875a64716b92e0477c28d9afdee4eea377167bffd06`. Current tier `unknown`; human review `true`; tier uncertain `true`. Inventory `/rows/123`.

Retained office note: Historical electoral code is not linked to the current geographic register. Retained as archival evidence and excluded from tracked current units.

Source: `data/research/countries/costa-rica.json.gz` `/offices/668/extensions/raw/note`; SHA-256 `148944324ed2fb996d9c947d40cf7a22389b09a1e554d2c00b0df30e4b898c72`.

Recommendation: **defer_with_reason**. District ballot does not uniquely identify the institution, and the historical code is unlinked. Retain unknown and both flags.

### CR-D-PUNTARENAS-GOLFITO-PUERTO-JIMENEZ

Classification: `schemas/atlas/tiers/costa-rica.json` `/classifications/669`; SHA-256 `51065bd53aa60685a9d4c875a64716b92e0477c28d9afdee4eea377167bffd06`. Current tier `unknown`; human review `true`; tier uncertain `true`. Inventory `/rows/124`.

Retained office note: Historical electoral code is not linked to the current geographic register. Retained as archival evidence and excluded from tracked current units.

Source: `data/research/countries/costa-rica.json.gz` `/offices/669/extensions/raw/note`; SHA-256 `148944324ed2fb996d9c947d40cf7a22389b09a1e554d2c00b0df30e4b898c72`.

Recommendation: **defer_with_reason**. District ballot does not uniquely identify the institution, and the historical code is unlinked. Retain unknown and both flags.

### EC-J-14-590-3830

Classification: `schemas/atlas/tiers/ecuador.json` `/classifications/999`; SHA-256 `5cda935a02f86d37659fb23902d7ae605ecdd5bbf80690ff9888cf1e0aa2a762`. Current tier `other`; human review `true`; tier uncertain `true`. Inventory `/rows/125`.

Retained office note: Historical Sevilla Don Bosco parish board. New canton elects mayor and council; former parish returns are not histories of the new municipal offices.

Source: `data/research/countries/ecuador.json.gz` `/offices/999/extensions/raw/note`; SHA-256 `b836ff24d2c52c40fb9672d733b401727998c24bacac533c64eb66941bacd03f`.

Recommendation: **keep_open**. One note explicitly distinguishes the former Sevilla Don Bosco parish from new municipal offices; the other says its historical code is unlinked. Retain other and the hold.

### EC-J-21-745-9997

Classification: `schemas/atlas/tiers/ecuador.json` `/classifications/1296`; SHA-256 `5cda935a02f86d37659fb23902d7ae605ecdd5bbf80690ff9888cf1e0aa2a762`. Current tier `other`; human review `true`; tier uncertain `true`. Inventory `/rows/126`.

Retained office note: Historical electoral code is not linked to the current geographic register. Retained as archival evidence and excluded from tracked current units.

Source: `data/research/countries/ecuador.json.gz` `/offices/1296/extensions/raw/note`; SHA-256 `b836ff24d2c52c40fb9672d733b401727998c24bacac533c64eb66941bacd03f`.

Recommendation: **keep_open**. One note explicitly distinguishes the former Sevilla Don Bosco parish from new municipal offices; the other says its historical code is unlinked. Retain other and the hold.

### GY-HIST-KITTYPROVIDENCE

Classification: `schemas/atlas/tiers/guyana.json` `/classifications/80`; SHA-256 `739d2bfba31ac904aaec3eeaf891f03612897759bbb19a5396d245afbc00dbfe`. Current tier `municipal`; human review `true`; tier uncertain `true`. Inventory `/rows/389`.

Retained office note: PR declarations visually/digitally reviewed. PR seats are explicitly component-only; no whole-council majority or present government is inferred from them. Spelling bridges preserve original source identity. 

Source: `data/research/countries/guyana.json.gz` `/offices/80/extensions/raw/note`; SHA-256 `9ea1f9916b800217d8beac228849ace5ba495fcfa4fad1113b4173bd13154fc3`.

Recommendation: **keep_open**. The supplied PR-component office type supports municipal, but none of these three exact predecessor IDs occurs in the retained 21-row geographic-bridge list. Component allocations cannot establish boundary continuity.

Supplementary evidence and exact source/page bindings are included in this inventory row; no new source ID is created.

### GY-HIST-MORUKAPHOENIXPARK

Classification: `schemas/atlas/tiers/guyana.json` `/classifications/81`; SHA-256 `739d2bfba31ac904aaec3eeaf891f03612897759bbb19a5396d245afbc00dbfe`. Current tier `municipal`; human review `true`; tier uncertain `true`. Inventory `/rows/390`.

Retained office note: PR declarations visually/digitally reviewed. PR seats are explicitly component-only; no whole-council majority or present government is inferred from them. Spelling bridges preserve original source identity. 

Source: `data/research/countries/guyana.json.gz` `/offices/81/extensions/raw/note`; SHA-256 `9ea1f9916b800217d8beac228849ace5ba495fcfa4fad1113b4173bd13154fc3`.

Recommendation: **keep_open**. The supplied PR-component office type supports municipal, but none of these three exact predecessor IDs occurs in the retained 21-row geographic-bridge list. Component allocations cannot establish boundary continuity.

Supplementary evidence and exact source/page bindings are included in this inventory row; no new source ID is created.

### GY-HIST-NO52NO74

Classification: `schemas/atlas/tiers/guyana.json` `/classifications/82`; SHA-256 `739d2bfba31ac904aaec3eeaf891f03612897759bbb19a5396d245afbc00dbfe`. Current tier `municipal`; human review `true`; tier uncertain `true`. Inventory `/rows/391`.

Retained office note: PR declarations visually/digitally reviewed. PR seats are explicitly component-only; no whole-council majority or present government is inferred from them. Spelling bridges preserve original source identity. 

Source: `data/research/countries/guyana.json.gz` `/offices/82/extensions/raw/note`; SHA-256 `9ea1f9916b800217d8beac228849ace5ba495fcfa4fad1113b4173bd13154fc3`.

Recommendation: **keep_open**. The supplied PR-component office type supports municipal, but none of these three exact predecessor IDs occurs in the retained 21-row geographic-bridge list. Component allocations cannot establish boundary continuity.

Supplementary evidence and exact source/page bindings are included in this inventory row; no new source ID is created.

### PE-90e2f5b9294518

Classification: `schemas/atlas/tiers/peru.json` `/classifications/5028`; SHA-256 `9483875e4e6aabdf938324aa1849549519962bfe26dde5b359ca00b4e23addfd`. Current tier `municipal`; human review `true`; tier uncertain `false`. Inventory `/rows/1396`.

Retained office note: Historical electoral code is not linked to the current geographic register. Retained as archival evidence and excluded from tracked current units.

Source: `data/research/countries/peru.json.gz` `/offices/5028/extensions/raw/note`; SHA-256 `df3410f20296e4916878e69d2ccfdbb4330d13509d0d8e325f6dcc9a193d4c23`.

Recommendation: **keep_open**. District/provincial municipal ballot labels support municipal, but each exact note says its historical code is not linked to the current register.

### PE-56b5072b92cfa3

Classification: `schemas/atlas/tiers/peru.json` `/classifications/5029`; SHA-256 `9483875e4e6aabdf938324aa1849549519962bfe26dde5b359ca00b4e23addfd`. Current tier `municipal`; human review `true`; tier uncertain `false`. Inventory `/rows/1397`.

Retained office note: Historical electoral code is not linked to the current geographic register. Retained as archival evidence and excluded from tracked current units.

Source: `data/research/countries/peru.json.gz` `/offices/5029/extensions/raw/note`; SHA-256 `df3410f20296e4916878e69d2ccfdbb4330d13509d0d8e325f6dcc9a193d4c23`.

Recommendation: **keep_open**. District/provincial municipal ballot labels support municipal, but each exact note says its historical code is not linked to the current register.

### PE-b05851543db328

Classification: `schemas/atlas/tiers/peru.json` `/classifications/5030`; SHA-256 `9483875e4e6aabdf938324aa1849549519962bfe26dde5b359ca00b4e23addfd`. Current tier `municipal`; human review `true`; tier uncertain `false`. Inventory `/rows/1398`.

Retained office note: Historical electoral code is not linked to the current geographic register. Retained as archival evidence and excluded from tracked current units.

Source: `data/research/countries/peru.json.gz` `/offices/5030/extensions/raw/note`; SHA-256 `df3410f20296e4916878e69d2ccfdbb4330d13509d0d8e325f6dcc9a193d4c23`.

Recommendation: **keep_open**. District/provincial municipal ballot labels support municipal, but each exact note says its historical code is not linked to the current register.

### KN-NEVIS-ASSEMBLY

Classification: `schemas/atlas/tiers/saint-kitts-and-nevis.json` `/classifications/0`; SHA-256 `6ce07e599a5378ea650167609cdc468fe3abc584975a582cf234f7b54a9c5171`. Current tier `other`; human review `true`; tier uncertain `true`. Inventory `/rows/1407`.

Retained office note: Three full ordinary cycles imported; five constituency candidate tables retained for each. Appointed seats are excluded. 2020 constituency replacement and final certificates remain to be reconciled. The 2020 Nevis 5 by-election is kept at constituency level. Aggregate whole-assembly cycles do not represent three consecutive identical renewal events.

Source: `data/research/countries/saint-kitts-and-nevis.json.gz` `/offices/0/extensions/raw/note`; SHA-256 `faac6189be865894375abaeccc68761bf74ef7e21209ce516a8ed84dffcc3224`.

Recommendation: **keep_open**. The six supplied records identify an island assembly and its elected seats. Election returns do not by themselves settle the Atlas regional-versus-other policy.

### KN-NEVIS-1

Classification: `schemas/atlas/tiers/saint-kitts-and-nevis.json` `/classifications/1`; SHA-256 `6ce07e599a5378ea650167609cdc468fe3abc584975a582cf234f7b54a9c5171`. Current tier `other`; human review `true`; tier uncertain `true`. Inventory `/rows/1408`.

Retained office note: Single elected constituency; appointed members excluded. Full certificate and current-member status remain separate checks.

Source: `data/research/countries/saint-kitts-and-nevis.json.gz` `/offices/1/extensions/raw/note`; SHA-256 `faac6189be865894375abaeccc68761bf74ef7e21209ce516a8ed84dffcc3224`.

Recommendation: **keep_open**. The six supplied records identify an island assembly and its elected seats. Election returns do not by themselves settle the Atlas regional-versus-other policy.

### KN-NEVIS-2

Classification: `schemas/atlas/tiers/saint-kitts-and-nevis.json` `/classifications/2`; SHA-256 `6ce07e599a5378ea650167609cdc468fe3abc584975a582cf234f7b54a9c5171`. Current tier `other`; human review `true`; tier uncertain `true`. Inventory `/rows/1409`.

Retained office note: Single elected constituency; appointed members excluded. Full certificate and current-member status remain separate checks.

Source: `data/research/countries/saint-kitts-and-nevis.json.gz` `/offices/2/extensions/raw/note`; SHA-256 `faac6189be865894375abaeccc68761bf74ef7e21209ce516a8ed84dffcc3224`.

Recommendation: **keep_open**. The six supplied records identify an island assembly and its elected seats. Election returns do not by themselves settle the Atlas regional-versus-other policy.

### TT-HIST-W-CHAGUANAS-EDINBURGH-LONGDENVILLE

Classification: `schemas/atlas/tiers/trinidad-and-tobago.json` `/classifications/155`; SHA-256 `905efa7ac69bde731823eeb41d0dc71cd0d05d0e8217d11b5e2e936b582a236f`. Current tier `unknown`; human review `true`; tier uncertain `true`. Inventory `/rows/1413`.

Retained office note: Historical electoral code is not linked to the current geographic register. Retained as archival evidence and excluded from tracked current units.

Source: `data/research/countries/trinidad-and-tobago.json.gz` `/offices/155/extensions/raw/note`; SHA-256 `86954158796e7f671256a7a0dea542f74996cc139fccaf7ce22802080f221b87`.

Recommendation: **defer_with_reason**. The generic historical-ballot label and explicit unlinked-code note leave the institution and geographic binding unresolved. Unknown remains unknown.

### TT-HIST-W-CHAGUANAS-ENTERPRISE-SOUTH

Classification: `schemas/atlas/tiers/trinidad-and-tobago.json` `/classifications/156`; SHA-256 `905efa7ac69bde731823eeb41d0dc71cd0d05d0e8217d11b5e2e936b582a236f`. Current tier `unknown`; human review `true`; tier uncertain `true`. Inventory `/rows/1414`.

Retained office note: Historical electoral code is not linked to the current geographic register. Retained as archival evidence and excluded from tracked current units.

Source: `data/research/countries/trinidad-and-tobago.json.gz` `/offices/156/extensions/raw/note`; SHA-256 `86954158796e7f671256a7a0dea542f74996cc139fccaf7ce22802080f221b87`.

Recommendation: **defer_with_reason**. The generic historical-ballot label and explicit unlinked-code note leave the institution and geographic binding unresolved. Unknown remains unknown.

### TT-HIST-W-COUVA-TABAQUITE-TALPARO-BALMAIN-CALCUTTA-NO-2

Classification: `schemas/atlas/tiers/trinidad-and-tobago.json` `/classifications/157`; SHA-256 `905efa7ac69bde731823eeb41d0dc71cd0d05d0e8217d11b5e2e936b582a236f`. Current tier `unknown`; human review `true`; tier uncertain `true`. Inventory `/rows/1415`.

Retained office note: Historical electoral code is not linked to the current geographic register. Retained as archival evidence and excluded from tracked current units.

Source: `data/research/countries/trinidad-and-tobago.json.gz` `/offices/157/extensions/raw/note`; SHA-256 `86954158796e7f671256a7a0dea542f74996cc139fccaf7ce22802080f221b87`.

Recommendation: **defer_with_reason**. The generic historical-ballot label and explicit unlinked-code note leave the institution and geographic binding unresolved. Unknown remains unknown.

## Exact row schedule

Current full rationale, all categories, evidence hashes and source catalogue metadata are preserved in the JSON row referenced below. No hash depends on a mutable branch name.

| Office ID | Classification pointer | Inventory pointer | Batch | Recommendation |
| --- | --- | --- | --- | --- |
| AG-BARBUDA-COUNCIL | /classifications/0 | /rows/0 | H4-AG | keep_open |
| CR-I-PUNTARENAS-PUNTARENAS-MONTEVERDE | /classifications/666 | /rows/121 | H4-CR1 | keep_open |
| CR-D-ALAJUELA-GRECIA-RIO-CUARTO | /classifications/667 | /rows/122 | H4-CR2 | defer_with_reason |
| CR-D-PUNTARENAS-PUNTARENAS-MONTEVERDE | /classifications/668 | /rows/123 | H4-CR2 | defer_with_reason |
| CR-D-PUNTARENAS-GOLFITO-PUERTO-JIMENEZ | /classifications/669 | /rows/124 | H4-CR2 | defer_with_reason |
| EC-J-14-590-3830 | /classifications/999 | /rows/125 | H4-EC | keep_open |
| EC-J-21-745-9997 | /classifications/1296 | /rows/126 | H4-EC | keep_open |
| GY-HIST-KITTYPROVIDENCE | /classifications/80 | /rows/389 | H4-GY | keep_open |
| GY-HIST-MORUKAPHOENIXPARK | /classifications/81 | /rows/390 | H4-GY | keep_open |
| GY-HIST-NO52NO74 | /classifications/82 | /rows/391 | H4-GY | keep_open |
| PE-90e2f5b9294518 | /classifications/5028 | /rows/1396 | H4-PE | keep_open |
| PE-56b5072b92cfa3 | /classifications/5029 | /rows/1397 | H4-PE | keep_open |
| PE-b05851543db328 | /classifications/5030 | /rows/1398 | H4-PE | keep_open |
| PE-5ef7ac6d455559 | /classifications/5031 | /rows/1399 | H4-PE | keep_open |
| PE-6190e4c5fd4486 | /classifications/5032 | /rows/1400 | H4-PE | keep_open |
| PE-3ae2de320f9be0 | /classifications/5033 | /rows/1401 | H4-PE | keep_open |
| PE-e55d72197f6081 | /classifications/5034 | /rows/1402 | H4-PE | keep_open |
| PE-e2751b27ab8f69 | /classifications/5035 | /rows/1403 | H4-PE | keep_open |
| PE-bc2819622a378f | /classifications/5036 | /rows/1404 | H4-PE | keep_open |
| PE-f01078ffe7063d | /classifications/5037 | /rows/1405 | H4-PE | keep_open |
| PE-10250df29b5b79 | /classifications/5038 | /rows/1406 | H4-PE | keep_open |
| KN-NEVIS-ASSEMBLY | /classifications/0 | /rows/1407 | H4-KN | keep_open |
| KN-NEVIS-1 | /classifications/1 | /rows/1408 | H4-KN | keep_open |
| KN-NEVIS-2 | /classifications/2 | /rows/1409 | H4-KN | keep_open |
| KN-NEVIS-3 | /classifications/3 | /rows/1410 | H4-KN | keep_open |
| KN-NEVIS-4 | /classifications/4 | /rows/1411 | H4-KN | keep_open |
| KN-NEVIS-5 | /classifications/5 | /rows/1412 | H4-KN | keep_open |
| TT-HIST-W-CHAGUANAS-EDINBURGH-LONGDENVILLE | /classifications/155 | /rows/1413 | H4-TT | defer_with_reason |
| TT-HIST-W-CHAGUANAS-ENTERPRISE-SOUTH | /classifications/156 | /rows/1414 | H4-TT | defer_with_reason |
| TT-HIST-W-COUVA-TABAQUITE-TALPARO-BALMAIN-CALCUTTA-NO-2 | /classifications/157 | /rows/1415 | H4-TT | defer_with_reason |
| TT-HIST-W-COUVA-TABAQUITE-TALPARO-CALIFORNIA-POINT-LISAS | /classifications/158 | /rows/1416 | H4-TT | defer_with_reason |
| TT-HIST-W-COUVA-TABAQUITE-TALPARO-CARLI-BAY-CALCUTTA-NO-3-MC-BEAN | /classifications/159 | /rows/1417 | H4-TT | defer_with_reason |
| TT-HIST-W-MAYARO-RIO-CLARO-MAYARO-GUAYAGUAYARE | /classifications/160 | /rows/1418 | H4-TT | defer_with_reason |
| TT-HIST-W-MAYARO-RIO-CLARO-RIO-CLARO-SOUTH-CAT-S-HILL | /classifications/161 | /rows/1419 | H4-TT | defer_with_reason |
| TT-HIST-W-PENAL-DEBE-DEBE-WEST | /classifications/162 | /rows/1420 | H4-TT | defer_with_reason |
| TT-HIST-W-PENAL-DEBE-LA-FORTUNE | /classifications/163 | /rows/1421 | H4-TT | defer_with_reason |
| TT-HIST-W-SANGRE-GRANDE-MANZANILLA | /classifications/164 | /rows/1422 | H4-TT | defer_with_reason |
| TT-HIST-W-SANGRE-GRANDE-TOCO-FISHING-POND | /classifications/165 | /rows/1423 | H4-TT | defer_with_reason |
| TT-HIST-W-SANGRE-GRANDE-VALENCIA | /classifications/166 | /rows/1424 | H4-TT | defer_with_reason |

## Justin decision record — none selected

- [ ] Accept the named recommendation for exact listed batch(es): ______.
- [ ] Accept only these exact office IDs: ______.
- [ ] Keep open / defer pending the stated evidence: ______.
- [ ] Amend and issue a new guarded proposal: ______.

Reviewer/date: ______. This does not approve a country pack or authorize the optional appendix.
