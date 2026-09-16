# I3 — Smaller residuals

**DRAFT — pending Justin; applied_changes=0. No tier JSON bytes rewritten.** Every row remains open. Exact current rationales, flags, categories, source notes and evidence locators are preserved in `residual-open-inventory.json`.

Account for **39** rows: Trinidad and Tobago 12, Peru 11, Saint Kitts and Nevis six, Costa Rica four, Guyana three, Ecuador two, Antigua and Barbuda one. Recommend 24 keep-open and 15 deferrals; no new full clearances or tier corrections.

Trinidad’s 12 generic historical ballots and Costa Rica’s three generic district ballots need exact institutional evidence before unknown can change. Peru’s 11 named municipal ballots have known proposed tier but explicitly unlinked historical codes. Monteverde’s historical intendant remains other with its identity hold.

Guyana’s three exact residual IDs are absent from the retained 21-row name-bridge list; verified PR-component declarations are not a missing identity bridge. Keep component scope and boundary caveats. Ecuador’s two historical parish boards require individual bindings: the Sevilla Don Bosco note expressly distinguishes former parish events from new municipal-office histories, while the other code remains unlinked.

Nevis’s assembly and five constituencies need one coherent institution-level tier disposition; no separate governments are invented from seats. Barbuda requires its own institutional evidence. Existing election-return sources alone do not settle regional-versus-other, and this prompt proposes no promotion.

The six optional I4 small-country rows are Costa Rica one, Guyana three and Ecuador two. Their human flags remain true even if a future taxonomy-only decision is accepted.

## Review batches

| Batch | Rows | Disposition | Evidence needed |
| --- | --- | --- | --- |
| I3-AG | 1 | keep_open | An explicit evidence-supported regional-versus-other disposition for Barbuda, distinct from Nevis. Preserve staggered renewals and ex-officio distinctions. |
| I3-CR1 | 1 | keep_open | Reviewed old-code and institution/successor binding. Any taxonomy-only uncertainty clearance remains in the separate optional appendix. |
| I3-CR2 | 3 | defer_with_reason | Identify the original ballot institution and its dated territorial binding before any known-tier proposal. |
| I3-EC | 2 | keep_open | Review each historical binding separately; former parish events must not be reassigned as elections of new municipal offices. |
| I3-GY | 3 | keep_open | A reviewed identity/name bridge for each record, retaining its PR-component scope and boundary caveat. |
| I3-PE | 11 | keep_open | A reviewed historical code/crosswalk binding for each exact record; no guessed current-office successor. |
| I3-KN | 6 | keep_open | An explicit institution-level disposition with cited institutional evidence; assembly constituencies must follow the same institution without being counted as separate governments. |
| I3-TT | 12 | defer_with_reason | Exact source electoral-code identity and institution evidence; do not infer ward/corporation tier from a prefix. |

## Source-specific examples

### AG-BARBUDA-COUNCIL

Current classification: `schemas/atlas/tiers/antigua-and-barbuda.json` `/classifications/0`; SHA-256 `0b31a8f398733e1fb3ca8996fcc60ed74fc7b150dd3f669afe745b8b8ac4c53d`. Tier `other`; human_review_required `true`; tier_uncertain `true`. Inventory `/rows/0`.

Retained local note: 2025/2023/2021 actual renewal events retained. Expected 2027 four-seat cohort requires formal call. Nine elected seats and two ex officio members are distinct; result seats are only those renewed.

Evidence: `data/research/countries/antigua-and-barbuda.json.gz` `/offices/0/extensions/raw/note`; SHA-256 `525145b32596a539a17e568f199175498e4c3cabd761365df70e0c1b59ab194c`.

Disposition: **keep_open**. The retained office is a staggered council renewal; its three source URLs are secondary election pages and do not settle institutional tier.

### CR-I-PUNTARENAS-PUNTARENAS-MONTEVERDE

Current classification: `schemas/atlas/tiers/costa-rica.json` `/classifications/666`; SHA-256 `51065bd53aa60685a9d4c875a64716b92e0477c28d9afdee4eea377167bffd06`. Tier `other`; human_review_required `true`; tier_uncertain `true`. Inventory `/rows/98`.

Retained local note: Historical electoral code is not linked to the current geographic register. Retained as archival evidence and excluded from tracked current units.

Evidence: `data/research/countries/costa-rica.json.gz` `/offices/666/extensions/raw/note`; SHA-256 `148944324ed2fb996d9c947d40cf7a22389b09a1e554d2c00b0df30e4b898c72`.

Disposition: **keep_open**. The named intendant remains other under the earlier proposal, but the exact note leaves its historical code unlinked.

### CR-D-ALAJUELA-GRECIA-RIO-CUARTO

Current classification: `schemas/atlas/tiers/costa-rica.json` `/classifications/667`; SHA-256 `51065bd53aa60685a9d4c875a64716b92e0477c28d9afdee4eea377167bffd06`. Tier `unknown`; human_review_required `true`; tier_uncertain `true`. Inventory `/rows/99`.

Retained local note: Historical electoral code is not linked to the current geographic register. Retained as archival evidence and excluded from tracked current units.

Evidence: `data/research/countries/costa-rica.json.gz` `/offices/667/extensions/raw/note`; SHA-256 `148944324ed2fb996d9c947d40cf7a22389b09a1e554d2c00b0df30e4b898c72`.

Disposition: **defer_with_reason**. District ballot does not uniquely identify the institution, and the historical code is unlinked. Retain unknown and both flags.

### CR-D-PUNTARENAS-PUNTARENAS-MONTEVERDE

Current classification: `schemas/atlas/tiers/costa-rica.json` `/classifications/668`; SHA-256 `51065bd53aa60685a9d4c875a64716b92e0477c28d9afdee4eea377167bffd06`. Tier `unknown`; human_review_required `true`; tier_uncertain `true`. Inventory `/rows/100`.

Retained local note: Historical electoral code is not linked to the current geographic register. Retained as archival evidence and excluded from tracked current units.

Evidence: `data/research/countries/costa-rica.json.gz` `/offices/668/extensions/raw/note`; SHA-256 `148944324ed2fb996d9c947d40cf7a22389b09a1e554d2c00b0df30e4b898c72`.

Disposition: **defer_with_reason**. District ballot does not uniquely identify the institution, and the historical code is unlinked. Retain unknown and both flags.

### CR-D-PUNTARENAS-GOLFITO-PUERTO-JIMENEZ

Current classification: `schemas/atlas/tiers/costa-rica.json` `/classifications/669`; SHA-256 `51065bd53aa60685a9d4c875a64716b92e0477c28d9afdee4eea377167bffd06`. Tier `unknown`; human_review_required `true`; tier_uncertain `true`. Inventory `/rows/101`.

Retained local note: Historical electoral code is not linked to the current geographic register. Retained as archival evidence and excluded from tracked current units.

Evidence: `data/research/countries/costa-rica.json.gz` `/offices/669/extensions/raw/note`; SHA-256 `148944324ed2fb996d9c947d40cf7a22389b09a1e554d2c00b0df30e4b898c72`.

Disposition: **defer_with_reason**. District ballot does not uniquely identify the institution, and the historical code is unlinked. Retain unknown and both flags.

### EC-J-14-590-3830

Current classification: `schemas/atlas/tiers/ecuador.json` `/classifications/999`; SHA-256 `5cda935a02f86d37659fb23902d7ae605ecdd5bbf80690ff9888cf1e0aa2a762`. Tier `other`; human_review_required `true`; tier_uncertain `true`. Inventory `/rows/102`.

Retained local note: Historical Sevilla Don Bosco parish board. New canton elects mayor and council; former parish returns are not histories of the new municipal offices.

Evidence: `data/research/countries/ecuador.json.gz` `/offices/999/extensions/raw/note`; SHA-256 `b836ff24d2c52c40fb9672d733b401727998c24bacac533c64eb66941bacd03f`.

Disposition: **keep_open**. One note explicitly distinguishes the former Sevilla Don Bosco parish from new municipal offices; the other says its historical code is unlinked. Retain other and the hold.

### EC-J-21-745-9997

Current classification: `schemas/atlas/tiers/ecuador.json` `/classifications/1296`; SHA-256 `5cda935a02f86d37659fb23902d7ae605ecdd5bbf80690ff9888cf1e0aa2a762`. Tier `other`; human_review_required `true`; tier_uncertain `true`. Inventory `/rows/103`.

Retained local note: Historical electoral code is not linked to the current geographic register. Retained as archival evidence and excluded from tracked current units.

Evidence: `data/research/countries/ecuador.json.gz` `/offices/1296/extensions/raw/note`; SHA-256 `b836ff24d2c52c40fb9672d733b401727998c24bacac533c64eb66941bacd03f`.

Disposition: **keep_open**. One note explicitly distinguishes the former Sevilla Don Bosco parish from new municipal offices; the other says its historical code is unlinked. Retain other and the hold.

### GY-HIST-KITTYPROVIDENCE

Current classification: `schemas/atlas/tiers/guyana.json` `/classifications/80`; SHA-256 `739d2bfba31ac904aaec3eeaf891f03612897759bbb19a5396d245afbc00dbfe`. Tier `municipal`; human_review_required `true`; tier_uncertain `true`. Inventory `/rows/104`.

Retained local note: PR declarations visually/digitally reviewed. PR seats are explicitly component-only; no whole-council majority or present government is inferred from them. Spelling bridges preserve original source identity. 

Evidence: `data/research/countries/guyana.json.gz` `/offices/80/extensions/raw/note`; SHA-256 `9ea1f9916b800217d8beac228849ace5ba495fcfa4fad1113b4173bd13154fc3`.

Disposition: **keep_open**. The supplied PR-component office type supports municipal, but none of these three exact predecessor IDs occurs in the retained 21-row geographic-bridge list. Component allocations cannot establish boundary continuity.

### GY-HIST-MORUKAPHOENIXPARK

Current classification: `schemas/atlas/tiers/guyana.json` `/classifications/81`; SHA-256 `739d2bfba31ac904aaec3eeaf891f03612897759bbb19a5396d245afbc00dbfe`. Tier `municipal`; human_review_required `true`; tier_uncertain `true`. Inventory `/rows/105`.

Retained local note: PR declarations visually/digitally reviewed. PR seats are explicitly component-only; no whole-council majority or present government is inferred from them. Spelling bridges preserve original source identity. 

Evidence: `data/research/countries/guyana.json.gz` `/offices/81/extensions/raw/note`; SHA-256 `9ea1f9916b800217d8beac228849ace5ba495fcfa4fad1113b4173bd13154fc3`.

Disposition: **keep_open**. The supplied PR-component office type supports municipal, but none of these three exact predecessor IDs occurs in the retained 21-row geographic-bridge list. Component allocations cannot establish boundary continuity.

### GY-HIST-NO52NO74

Current classification: `schemas/atlas/tiers/guyana.json` `/classifications/82`; SHA-256 `739d2bfba31ac904aaec3eeaf891f03612897759bbb19a5396d245afbc00dbfe`. Tier `municipal`; human_review_required `true`; tier_uncertain `true`. Inventory `/rows/106`.

Retained local note: PR declarations visually/digitally reviewed. PR seats are explicitly component-only; no whole-council majority or present government is inferred from them. Spelling bridges preserve original source identity. 

Evidence: `data/research/countries/guyana.json.gz` `/offices/82/extensions/raw/note`; SHA-256 `9ea1f9916b800217d8beac228849ace5ba495fcfa4fad1113b4173bd13154fc3`.

Disposition: **keep_open**. The supplied PR-component office type supports municipal, but none of these three exact predecessor IDs occurs in the retained 21-row geographic-bridge list. Component allocations cannot establish boundary continuity.

### PE-90e2f5b9294518

Current classification: `schemas/atlas/tiers/peru.json` `/classifications/5028`; SHA-256 `9483875e4e6aabdf938324aa1849549519962bfe26dde5b359ca00b4e23addfd`. Tier `municipal`; human_review_required `true`; tier_uncertain `false`. Inventory `/rows/1111`.

Retained local note: Historical electoral code is not linked to the current geographic register. Retained as archival evidence and excluded from tracked current units.

Evidence: `data/research/countries/peru.json.gz` `/offices/5028/extensions/raw/note`; SHA-256 `df3410f20296e4916878e69d2ccfdbb4330d13509d0d8e325f6dcc9a193d4c23`.

Disposition: **keep_open**. District/provincial municipal ballot labels support municipal, but each exact note says its historical code is not linked to the current register.

### PE-56b5072b92cfa3

Current classification: `schemas/atlas/tiers/peru.json` `/classifications/5029`; SHA-256 `9483875e4e6aabdf938324aa1849549519962bfe26dde5b359ca00b4e23addfd`. Tier `municipal`; human_review_required `true`; tier_uncertain `false`. Inventory `/rows/1112`.

Retained local note: Historical electoral code is not linked to the current geographic register. Retained as archival evidence and excluded from tracked current units.

Evidence: `data/research/countries/peru.json.gz` `/offices/5029/extensions/raw/note`; SHA-256 `df3410f20296e4916878e69d2ccfdbb4330d13509d0d8e325f6dcc9a193d4c23`.

Disposition: **keep_open**. District/provincial municipal ballot labels support municipal, but each exact note says its historical code is not linked to the current register.

### PE-b05851543db328

Current classification: `schemas/atlas/tiers/peru.json` `/classifications/5030`; SHA-256 `9483875e4e6aabdf938324aa1849549519962bfe26dde5b359ca00b4e23addfd`. Tier `municipal`; human_review_required `true`; tier_uncertain `false`. Inventory `/rows/1113`.

Retained local note: Historical electoral code is not linked to the current geographic register. Retained as archival evidence and excluded from tracked current units.

Evidence: `data/research/countries/peru.json.gz` `/offices/5030/extensions/raw/note`; SHA-256 `df3410f20296e4916878e69d2ccfdbb4330d13509d0d8e325f6dcc9a193d4c23`.

Disposition: **keep_open**. District/provincial municipal ballot labels support municipal, but each exact note says its historical code is not linked to the current register.

### KN-NEVIS-ASSEMBLY

Current classification: `schemas/atlas/tiers/saint-kitts-and-nevis.json` `/classifications/0`; SHA-256 `6ce07e599a5378ea650167609cdc468fe3abc584975a582cf234f7b54a9c5171`. Tier `other`; human_review_required `true`; tier_uncertain `true`. Inventory `/rows/1122`.

Retained local note: Three full ordinary cycles imported; five constituency candidate tables retained for each. Appointed seats are excluded. 2020 constituency replacement and final certificates remain to be reconciled. The 2020 Nevis 5 by-election is kept at constituency level. Aggregate whole-assembly cycles do not represent three consecutive identical renewal events.

Evidence: `data/research/countries/saint-kitts-and-nevis.json.gz` `/offices/0/extensions/raw/note`; SHA-256 `faac6189be865894375abaeccc68761bf74ef7e21209ce516a8ed84dffcc3224`.

Disposition: **keep_open**. The six supplied records identify an island assembly and its elected seats. Election returns do not by themselves settle the Atlas regional-versus-other policy.

### KN-NEVIS-1

Current classification: `schemas/atlas/tiers/saint-kitts-and-nevis.json` `/classifications/1`; SHA-256 `6ce07e599a5378ea650167609cdc468fe3abc584975a582cf234f7b54a9c5171`. Tier `other`; human_review_required `true`; tier_uncertain `true`. Inventory `/rows/1123`.

Retained local note: Single elected constituency; appointed members excluded. Full certificate and current-member status remain separate checks.

Evidence: `data/research/countries/saint-kitts-and-nevis.json.gz` `/offices/1/extensions/raw/note`; SHA-256 `faac6189be865894375abaeccc68761bf74ef7e21209ce516a8ed84dffcc3224`.

Disposition: **keep_open**. The six supplied records identify an island assembly and its elected seats. Election returns do not by themselves settle the Atlas regional-versus-other policy.

### KN-NEVIS-2

Current classification: `schemas/atlas/tiers/saint-kitts-and-nevis.json` `/classifications/2`; SHA-256 `6ce07e599a5378ea650167609cdc468fe3abc584975a582cf234f7b54a9c5171`. Tier `other`; human_review_required `true`; tier_uncertain `true`. Inventory `/rows/1124`.

Retained local note: Single elected constituency; appointed members excluded. Full certificate and current-member status remain separate checks.

Evidence: `data/research/countries/saint-kitts-and-nevis.json.gz` `/offices/2/extensions/raw/note`; SHA-256 `faac6189be865894375abaeccc68761bf74ef7e21209ce516a8ed84dffcc3224`.

Disposition: **keep_open**. The six supplied records identify an island assembly and its elected seats. Election returns do not by themselves settle the Atlas regional-versus-other policy.

### TT-HIST-W-CHAGUANAS-EDINBURGH-LONGDENVILLE

Current classification: `schemas/atlas/tiers/trinidad-and-tobago.json` `/classifications/155`; SHA-256 `905efa7ac69bde731823eeb41d0dc71cd0d05d0e8217d11b5e2e936b582a236f`. Tier `unknown`; human_review_required `true`; tier_uncertain `true`. Inventory `/rows/1128`.

Retained local note: Historical electoral code is not linked to the current geographic register. Retained as archival evidence and excluded from tracked current units.

Evidence: `data/research/countries/trinidad-and-tobago.json.gz` `/offices/155/extensions/raw/note`; SHA-256 `86954158796e7f671256a7a0dea542f74996cc139fccaf7ce22802080f221b87`.

Disposition: **defer_with_reason**. The generic historical-ballot label and explicit unlinked-code note leave the institution and geographic binding unresolved. Unknown remains unknown.

### TT-HIST-W-CHAGUANAS-ENTERPRISE-SOUTH

Current classification: `schemas/atlas/tiers/trinidad-and-tobago.json` `/classifications/156`; SHA-256 `905efa7ac69bde731823eeb41d0dc71cd0d05d0e8217d11b5e2e936b582a236f`. Tier `unknown`; human_review_required `true`; tier_uncertain `true`. Inventory `/rows/1129`.

Retained local note: Historical electoral code is not linked to the current geographic register. Retained as archival evidence and excluded from tracked current units.

Evidence: `data/research/countries/trinidad-and-tobago.json.gz` `/offices/156/extensions/raw/note`; SHA-256 `86954158796e7f671256a7a0dea542f74996cc139fccaf7ce22802080f221b87`.

Disposition: **defer_with_reason**. The generic historical-ballot label and explicit unlinked-code note leave the institution and geographic binding unresolved. Unknown remains unknown.

### TT-HIST-W-COUVA-TABAQUITE-TALPARO-BALMAIN-CALCUTTA-NO-2

Current classification: `schemas/atlas/tiers/trinidad-and-tobago.json` `/classifications/157`; SHA-256 `905efa7ac69bde731823eeb41d0dc71cd0d05d0e8217d11b5e2e936b582a236f`. Tier `unknown`; human_review_required `true`; tier_uncertain `true`. Inventory `/rows/1130`.

Retained local note: Historical electoral code is not linked to the current geographic register. Retained as archival evidence and excluded from tracked current units.

Evidence: `data/research/countries/trinidad-and-tobago.json.gz` `/offices/157/extensions/raw/note`; SHA-256 `86954158796e7f671256a7a0dea542f74996cc139fccaf7ce22802080f221b87`.

Disposition: **defer_with_reason**. The generic historical-ballot label and explicit unlinked-code note leave the institution and geographic binding unresolved. Unknown remains unknown.

## Exact open-row schedule

| Office ID | Classification pointer | Inventory pointer | Batch | Proposed changes |
| --- | --- | --- | --- | --- |
| AG-BARBUDA-COUNCIL | /classifications/0 | /rows/0 | I3-AG | [] — none |
| CR-I-PUNTARENAS-PUNTARENAS-MONTEVERDE | /classifications/666 | /rows/98 | I3-CR1 | [] — none |
| CR-D-ALAJUELA-GRECIA-RIO-CUARTO | /classifications/667 | /rows/99 | I3-CR2 | [] — none |
| CR-D-PUNTARENAS-PUNTARENAS-MONTEVERDE | /classifications/668 | /rows/100 | I3-CR2 | [] — none |
| CR-D-PUNTARENAS-GOLFITO-PUERTO-JIMENEZ | /classifications/669 | /rows/101 | I3-CR2 | [] — none |
| EC-J-14-590-3830 | /classifications/999 | /rows/102 | I3-EC | [] — none |
| EC-J-21-745-9997 | /classifications/1296 | /rows/103 | I3-EC | [] — none |
| GY-HIST-KITTYPROVIDENCE | /classifications/80 | /rows/104 | I3-GY | [] — none |
| GY-HIST-MORUKAPHOENIXPARK | /classifications/81 | /rows/105 | I3-GY | [] — none |
| GY-HIST-NO52NO74 | /classifications/82 | /rows/106 | I3-GY | [] — none |
| PE-90e2f5b9294518 | /classifications/5028 | /rows/1111 | I3-PE | [] — none |
| PE-56b5072b92cfa3 | /classifications/5029 | /rows/1112 | I3-PE | [] — none |
| PE-b05851543db328 | /classifications/5030 | /rows/1113 | I3-PE | [] — none |
| PE-5ef7ac6d455559 | /classifications/5031 | /rows/1114 | I3-PE | [] — none |
| PE-6190e4c5fd4486 | /classifications/5032 | /rows/1115 | I3-PE | [] — none |
| PE-3ae2de320f9be0 | /classifications/5033 | /rows/1116 | I3-PE | [] — none |
| PE-e55d72197f6081 | /classifications/5034 | /rows/1117 | I3-PE | [] — none |
| PE-e2751b27ab8f69 | /classifications/5035 | /rows/1118 | I3-PE | [] — none |
| PE-bc2819622a378f | /classifications/5036 | /rows/1119 | I3-PE | [] — none |
| PE-f01078ffe7063d | /classifications/5037 | /rows/1120 | I3-PE | [] — none |
| PE-10250df29b5b79 | /classifications/5038 | /rows/1121 | I3-PE | [] — none |
| KN-NEVIS-ASSEMBLY | /classifications/0 | /rows/1122 | I3-KN | [] — none |
| KN-NEVIS-1 | /classifications/1 | /rows/1123 | I3-KN | [] — none |
| KN-NEVIS-2 | /classifications/2 | /rows/1124 | I3-KN | [] — none |
| KN-NEVIS-3 | /classifications/3 | /rows/1125 | I3-KN | [] — none |
| KN-NEVIS-4 | /classifications/4 | /rows/1126 | I3-KN | [] — none |
| KN-NEVIS-5 | /classifications/5 | /rows/1127 | I3-KN | [] — none |
| TT-HIST-W-CHAGUANAS-EDINBURGH-LONGDENVILLE | /classifications/155 | /rows/1128 | I3-TT | [] — none |
| TT-HIST-W-CHAGUANAS-ENTERPRISE-SOUTH | /classifications/156 | /rows/1129 | I3-TT | [] — none |
| TT-HIST-W-COUVA-TABAQUITE-TALPARO-BALMAIN-CALCUTTA-NO-2 | /classifications/157 | /rows/1130 | I3-TT | [] — none |
| TT-HIST-W-COUVA-TABAQUITE-TALPARO-CALIFORNIA-POINT-LISAS | /classifications/158 | /rows/1131 | I3-TT | [] — none |
| TT-HIST-W-COUVA-TABAQUITE-TALPARO-CARLI-BAY-CALCUTTA-NO-3-MC-BEAN | /classifications/159 | /rows/1132 | I3-TT | [] — none |
| TT-HIST-W-MAYARO-RIO-CLARO-MAYARO-GUAYAGUAYARE | /classifications/160 | /rows/1133 | I3-TT | [] — none |
| TT-HIST-W-MAYARO-RIO-CLARO-RIO-CLARO-SOUTH-CAT-S-HILL | /classifications/161 | /rows/1134 | I3-TT | [] — none |
| TT-HIST-W-PENAL-DEBE-DEBE-WEST | /classifications/162 | /rows/1135 | I3-TT | [] — none |
| TT-HIST-W-PENAL-DEBE-LA-FORTUNE | /classifications/163 | /rows/1136 | I3-TT | [] — none |
| TT-HIST-W-SANGRE-GRANDE-MANZANILLA | /classifications/164 | /rows/1137 | I3-TT | [] — none |
| TT-HIST-W-SANGRE-GRANDE-TOCO-FISHING-POND | /classifications/165 | /rows/1138 | I3-TT | [] — none |
| TT-HIST-W-SANGRE-GRANDE-VALENCIA | /classifications/166 | /rows/1139 | I3-TT | [] — none |

## Justin decision — none selected

- [ ] Retain the named keep-open/defer dispositions.
- [ ] Request the listed evidence for named office IDs: ______.
- [ ] After new evidence, commission a separate exact-row clearance proposal: ______.

No checkbox or memo reading changes a flag, tier, pack status or publication state. I4 requires a separate explicit go decision.
