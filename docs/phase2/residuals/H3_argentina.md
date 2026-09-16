# H3 — Argentina

**Partially applied 2026-09-16:** Justin accepted H3-01 (19) and H3-02 (4) `clear_flag` rows. Keep-open / defer batches were not applied. The Argentina pack remains `draft_for_human_review`. See [Phase2_Residual_Clearance_Application_Report.md](Phase2_Residual_Clearance_Application_Report.md).

**Original Prompt H memo follows.** All exact pre-application rows, current rationales, hashed pointers and evidence records are in `residual-open-inventory.json`. Country-pack approval and any optional uncertainty-only edit are separate decisions.

Split **120** rows into six evidence-based batches. Propose clearing only 23 generic historical-binding flags: 19 named Santa Fe mayors and four Córdoba shared-ballot/audit offices whose exact notes explain that they are outside the tracking window. This recommendation concerns the reason for focused review; frozen historical/reference status remains unchanged. No current-tenure, successor or future-date assertion follows.

Keep or defer the other 97: 84 unjoined Entre Ríos Local vocales records remain unknown; ten explicitly named mayor/council records still lack a unique 2019-to-2023 roster join; two Mi Granja older communal institutions must remain distinct from later municipal records; Oberá’s ombudsman requires checking the cited act/charter and the reason for its cycle/history hold. A known municipality tier is not a unique identity crosswalk.

There are no Argentina rows in the 1,010 optional uncertainty-only appendix: its 84 uncertain residual records are unresolved institutions, not just unsettled grouping policy.

## Proposed batches

| Batch | Rows | Recommendation | Specific acceptance question |
| --- | --- | --- | --- |
| H3-01 | 19 | clear_flag | Justin accepts this as a focused-review category correction only, with no current-status, successor, event or boundary inference. |
| H3-03 | 84 | defer_with_reason | Unique source-code/roster binding plus institutional evidence for the exact historical record; code or name similarity alone is insufficient. |
| H3-04 | 10 | keep_open | A reviewed unique historical identity binding, with evidence for any successor and exceptions. No invented same-name join. |
| H3-06 | 1 | defer_with_reason | Review the cited act/charter and explain whether the hold is a window/cycle label or a real identity issue before clearing it. |
| H3-02 | 4 | clear_flag | Justin accepts this focused-review category correction while preserving shared-ballot separation, frozen status and exceptional-call caveats. |
| H3-05 | 2 | keep_open | A dated institutional crosswalk supporting the distinct old and new records; preserve historical IDs and avoid a second current office. |

## Source-specific exemplars

### AR-SF-M-BELGRANO-ARMSTRONG

Classification: `schemas/atlas/tiers/argentina.json` `/classifications/138`; SHA-256 `e1e27f81bb2df6137c13bb30e58144d1fcdaeec3479f3d9bd42c45588eafffaf`. Current tier `municipal`; human review `true`; tier uncertain `false`. Inventory `/rows/1`.

Retained office note: Mayor elected in 2025: ordinary four-year term points to 2029, outside this window. Retained only as reference. Official votes and elected rosters are retained. Council counts describe elected cohorts. Current governing membership and later replacements require verification.

Source: `data/research/countries/argentina.json.gz` `/offices/138/extensions/raw/note`; SHA-256 `737190b6be8bbb4759df22cb80d1ac5ee4b3907b3d20575972bce7bf58c57753`.

Recommendation: **clear_flag**. The exact local note explains exclusion by the observation window. It supplies a named municipal office, not an unjoined predecessor. Recommend clearing the blanket historical-binding tier flag; retain frozen reference status and all research caveats.

### AR-SF-M-GENERALOBLIGADO-LASTOSCAS

Classification: `schemas/atlas/tiers/argentina.json` `/classifications/272`; SHA-256 `e1e27f81bb2df6137c13bb30e58144d1fcdaeec3479f3d9bd42c45588eafffaf`. Current tier `municipal`; human review `true`; tier uncertain `false`. Inventory `/rows/2`.

Retained office note: Mayor elected in 2025: ordinary four-year term points to 2029, outside this window. Retained only as reference. Official votes and elected rosters are retained. Council counts describe elected cohorts. Current governing membership and later replacements require verification.

Source: `data/research/countries/argentina.json.gz` `/offices/272/extensions/raw/note`; SHA-256 `737190b6be8bbb4759df22cb80d1ac5ee4b3907b3d20575972bce7bf58c57753`.

Recommendation: **clear_flag**. The exact local note explains exclusion by the observation window. It supplies a named municipal office, not an unjoined predecessor. Recommend clearing the blanket historical-binding tier flag; retain frozen reference status and all research caveats.

### AR-SF-M-GENERALOBLIGADO-FLORENCIA

Classification: `schemas/atlas/tiers/argentina.json` `/classifications/276`; SHA-256 `e1e27f81bb2df6137c13bb30e58144d1fcdaeec3479f3d9bd42c45588eafffaf`. Current tier `municipal`; human review `true`; tier uncertain `false`. Inventory `/rows/3`.

Retained office note: Mayor elected in 2025: ordinary four-year term points to 2029, outside this window. Retained only as reference. Official votes and elected rosters are retained. Council counts describe elected cohorts. Current governing membership and later replacements require verification.

Source: `data/research/countries/argentina.json.gz` `/offices/276/extensions/raw/note`; SHA-256 `737190b6be8bbb4759df22cb80d1ac5ee4b3907b3d20575972bce7bf58c57753`.

Recommendation: **clear_flag**. The exact local note explains exclusion by the observation window. It supplies a named municipal office, not an unjoined predecessor. Recommend clearing the blanket historical-binding tier flag; retain frozen reference status and all research caveats.

### AR-ER-LEGACY-1-0080C-V

Classification: `schemas/atlas/tiers/argentina.json` `/classifications/1027`; SHA-256 `e1e27f81bb2df6137c13bb30e58144d1fcdaeec3479f3d9bd42c45588eafffaf`. Current tier `unknown`; human review `true`; tier uncertain `true`. Inventory `/rows/20`.

Retained office note: 2019 result not yet joined uniquely to the 2023 office roster. Retained outside the current-race total.

Source: `data/research/countries/argentina.json.gz` `/offices/1027/extensions/raw/note`; SHA-256 `737190b6be8bbb4759df22cb80d1ac5ee4b3907b3d20575972bce7bf58c57753`.

Recommendation: **defer_with_reason**. The source says the 2019 result is not joined uniquely to the 2023 roster. A generic Local vocales label does not settle the exact institution; unknown and both flags stay.

### AR-ER-LEGACY-1-0085C-V

Classification: `schemas/atlas/tiers/argentina.json` `/classifications/1028`; SHA-256 `e1e27f81bb2df6137c13bb30e58144d1fcdaeec3479f3d9bd42c45588eafffaf`. Current tier `unknown`; human review `true`; tier uncertain `true`. Inventory `/rows/21`.

Retained office note: 2019 result not yet joined uniquely to the 2023 office roster. Retained outside the current-race total.

Source: `data/research/countries/argentina.json.gz` `/offices/1028/extensions/raw/note`; SHA-256 `737190b6be8bbb4759df22cb80d1ac5ee4b3907b3d20575972bce7bf58c57753`.

Recommendation: **defer_with_reason**. The source says the 2019 result is not joined uniquely to the 2023 roster. A generic Local vocales label does not settle the exact institution; unknown and both flags stay.

### AR-ER-LEGACY-1-0086C-V

Classification: `schemas/atlas/tiers/argentina.json` `/classifications/1029`; SHA-256 `e1e27f81bb2df6137c13bb30e58144d1fcdaeec3479f3d9bd42c45588eafffaf`. Current tier `unknown`; human review `true`; tier uncertain `true`. Inventory `/rows/22`.

Retained office note: 2019 result not yet joined uniquely to the 2023 office roster. Retained outside the current-race total.

Source: `data/research/countries/argentina.json.gz` `/offices/1029/extensions/raw/note`; SHA-256 `737190b6be8bbb4759df22cb80d1ac5ee4b3907b3d20575972bce7bf58c57753`.

Recommendation: **defer_with_reason**. The source says the 2019 result is not joined uniquely to the 2023 roster. A generic Local vocales label does not settle the exact institution; unknown and both flags stay.

### AR-ER-LEGACY-4-0020B-M

Classification: `schemas/atlas/tiers/argentina.json` `/classifications/1045`; SHA-256 `e1e27f81bb2df6137c13bb30e58144d1fcdaeec3479f3d9bd42c45588eafffaf`. Current tier `municipal`; human review `true`; tier uncertain `false`. Inventory `/rows/38`.

Retained office note: 2019 result not yet joined uniquely to the 2023 office roster. Retained outside the current-race total.

Source: `data/research/countries/argentina.json.gz` `/offices/1045/extensions/raw/note`; SHA-256 `737190b6be8bbb4759df22cb80d1ac5ee4b3907b3d20575972bce7bf58c57753`.

Recommendation: **keep_open**. Mayor/council labels support the existing municipal tier, but the exact source note still says the historical record is not uniquely joined.

### AR-ER-LEGACY-4-0020B-C

Classification: `schemas/atlas/tiers/argentina.json` `/classifications/1046`; SHA-256 `e1e27f81bb2df6137c13bb30e58144d1fcdaeec3479f3d9bd42c45588eafffaf`. Current tier `municipal`; human review `true`; tier uncertain `false`. Inventory `/rows/39`.

Retained office note: 2019 result not yet joined uniquely to the 2023 office roster. Retained outside the current-race total.

Source: `data/research/countries/argentina.json.gz` `/offices/1046/extensions/raw/note`; SHA-256 `737190b6be8bbb4759df22cb80d1ac5ee4b3907b3d20575972bce7bf58c57753`.

Recommendation: **keep_open**. Mayor/council labels support the existing municipal tier, but the exact source note still says the historical record is not uniquely joined.

### AR-ER-LEGACY-4-0021B-M

Classification: `schemas/atlas/tiers/argentina.json` `/classifications/1047`; SHA-256 `e1e27f81bb2df6137c13bb30e58144d1fcdaeec3479f3d9bd42c45588eafffaf`. Current tier `municipal`; human review `true`; tier uncertain `false`. Inventory `/rows/40`.

Retained office note: 2019 result not yet joined uniquely to the 2023 office roster. Retained outside the current-race total.

Source: `data/research/countries/argentina.json.gz` `/offices/1047/extensions/raw/note`; SHA-256 `737190b6be8bbb4759df22cb80d1ac5ee4b3907b3d20575972bce7bf58c57753`.

Recommendation: **keep_open**. Mayor/council labels support the existing municipal tier, but the exact source note still says the historical record is not uniquely joined.

### AR-MI-OBERA-O

Classification: `schemas/atlas/tiers/argentina.json` `/classifications/1599`; SHA-256 `e1e27f81bb2df6137c13bb30e58144d1fcdaeec3479f3d9bd42c45588eafffaf`. Current tier `municipal`; human review `true`; tier uncertain `false`. Inventory `/rows/114`.

Retained office note: 2025 Act 1231 and municipal charter article 179: ombudsman cycle separate from the mayoral election.

Source: `data/research/countries/argentina.json.gz` `/offices/1599/extensions/raw/note`; SHA-256 `737190b6be8bbb4759df22cb80d1ac5ee4b3907b3d20575972bce7bf58c57753`.

Recommendation: **defer_with_reason**. The note cites Act 1231 and charter article 179 for a separate cycle, but this review has not checked those instruments or resolved the historical flag purpose.

### AR-CB-MARCOS-JUAREZ-MC

Classification: `schemas/atlas/tiers/argentina.json` `/classifications/2325`; SHA-256 `e1e27f81bb2df6137c13bb30e58144d1fcdaeec3479f3d9bd42c45588eafffaf`. Current tier `municipal`; human review `true`; tier uncertain `false`. Inventory `/rows/115`.

Retained office note: Preserved as an outside-window reference. The next ordinary cycle is after 8 March 2028; exceptional calls require new evidence.

Source: `data/research/countries/argentina.json.gz` `/offices/2325/extensions/raw/note`; SHA-256 `737190b6be8bbb4759df22cb80d1ac5ee4b3907b3d20575972bce7bf58c57753`.

Recommendation: **clear_flag**. The exact note states outside-window reference status. Named municipal/shared-ballot or audit institutions remain municipal; the blanket historical-binding flag is not supported by a missing identity statement in that note.

### AR-CB-MARCOS-JUAREZ-TM

Classification: `schemas/atlas/tiers/argentina.json` `/classifications/2326`; SHA-256 `e1e27f81bb2df6137c13bb30e58144d1fcdaeec3479f3d9bd42c45588eafffaf`. Current tier `municipal`; human review `true`; tier uncertain `false`. Inventory `/rows/116`.

Retained office note: Preserved as an outside-window reference. The next ordinary cycle is after 8 March 2028; exceptional calls require new evidence.

Source: `data/research/countries/argentina.json.gz` `/offices/2326/extensions/raw/note`; SHA-256 `737190b6be8bbb4759df22cb80d1ac5ee4b3907b3d20575972bce7bf58c57753`.

Recommendation: **clear_flag**. The exact note states outside-window reference status. Named municipal/shared-ballot or audit institutions remain municipal; the blanket historical-binding flag is not supported by a missing identity statement in that note.

### AR-CB-RIO-CUARTO-MC

Classification: `schemas/atlas/tiers/argentina.json` `/classifications/2411`; SHA-256 `e1e27f81bb2df6137c13bb30e58144d1fcdaeec3479f3d9bd42c45588eafffaf`. Current tier `municipal`; human review `true`; tier uncertain `false`. Inventory `/rows/117`.

Retained office note: Preserved as an outside-window reference. The next ordinary cycle is after 8 March 2028; exceptional calls require new evidence.

Source: `data/research/countries/argentina.json.gz` `/offices/2411/extensions/raw/note`; SHA-256 `737190b6be8bbb4759df22cb80d1ac5ee4b3907b3d20575972bce7bf58c57753`.

Recommendation: **clear_flag**. The exact note states outside-window reference status. Named municipal/shared-ballot or audit institutions remain municipal; the blanket historical-binding flag is not supported by a missing identity statement in that note.

### AR-CB-MI-GRANJA-TC

Classification: `schemas/atlas/tiers/argentina.json` `/classifications/3009`; SHA-256 `e1e27f81bb2df6137c13bb30e58144d1fcdaeec3479f3d9bd42c45588eafffaf`. Current tier `municipal`; human review `true`; tier uncertain `false`. Inventory `/rows/119`.

Retained office note: The current national directory classifies Mi Granja as a municipality. Its older communal ballot is retained separately and is not a second current office.

Source: `data/research/countries/argentina.json.gz` `/offices/3009/extensions/raw/note`; SHA-256 `737190b6be8bbb4759df22cb80d1ac5ee4b3907b3d20575972bce7bf58c57753`.

Recommendation: **keep_open**. The note distinguishes older communal ballots from a later municipality. The municipal tier proposal does not certify institutional or boundary continuity.

### AR-CB-MI-GRANJA-CC

Classification: `schemas/atlas/tiers/argentina.json` `/classifications/3011`; SHA-256 `e1e27f81bb2df6137c13bb30e58144d1fcdaeec3479f3d9bd42c45588eafffaf`. Current tier `municipal`; human review `true`; tier uncertain `false`. Inventory `/rows/120`.

Retained office note: The current national directory classifies Mi Granja as a municipality. Its older communal ballot is retained separately and is not a second current office.

Source: `data/research/countries/argentina.json.gz` `/offices/3011/extensions/raw/note`; SHA-256 `737190b6be8bbb4759df22cb80d1ac5ee4b3907b3d20575972bce7bf58c57753`.

Recommendation: **keep_open**. The note distinguishes older communal ballots from a later municipality. The municipal tier proposal does not certify institutional or boundary continuity.

## Exact row schedule

Current full rationale, all categories, evidence hashes and source catalogue metadata are preserved in the JSON row referenced below. No hash depends on a mutable branch name.

| Office ID | Classification pointer | Inventory pointer | Batch | Recommendation |
| --- | --- | --- | --- | --- |
| AR-SF-M-BELGRANO-ARMSTRONG | /classifications/138 | /rows/1 | H3-01 | clear_flag |
| AR-SF-M-GENERALOBLIGADO-LASTOSCAS | /classifications/272 | /rows/2 | H3-01 | clear_flag |
| AR-SF-M-GENERALOBLIGADO-FLORENCIA | /classifications/276 | /rows/3 | H3-01 | clear_flag |
| AR-SF-M-LACAPITAL-SANJOSEDELRINCON | /classifications/297 | /rows/4 | H3-01 | clear_flag |
| AR-SF-M-LACAPITAL-RECREO | /classifications/299 | /rows/5 | H3-01 | clear_flag |
| AR-SF-M-SANCRISTOBAL-SANGUILLERMO | /classifications/399 | /rows/6 | H3-01 | clear_flag |
| AR-SF-M-SANCRISTOBAL-SUARDI | /classifications/402 | /rows/7 | H3-01 | clear_flag |
| AR-SF-M-SANJAVIER-ROMANG | /classifications/422 | /rows/8 | H3-01 | clear_flag |
| AR-SF-M-SANLORENZO-FRAYLUISBELTRAN | /classifications/471 | /rows/9 | H3-01 | clear_flag |
| AR-SF-M-SANLORENZO-PUERTOGENERALSANMARTIN | /classifications/474 | /rows/10 | H3-01 | clear_flag |
| AR-SF-M-SANLORENZO-ROLDAN | /classifications/478 | /rows/11 | H3-01 | clear_flag |
| AR-SF-M-SANMARTIN-ELTREBOL | /classifications/495 | /rows/12 | H3-01 | clear_flag |
| AR-SF-M-LACAPITAL-SAUCEVIEJO | /classifications/563 | /rows/13 | H3-01 | clear_flag |
| AR-SF-M-GARAY-HELVECIA | /classifications/564 | /rows/14 | H3-01 | clear_flag |
| AR-SF-M-CASTELLANOS-SANVICENTE | /classifications/565 | /rows/15 | H3-01 | clear_flag |
| AR-SF-M-9DEJULIO-VILLAMINETTI | /classifications/566 | /rows/16 | H3-01 | clear_flag |
| AR-SF-M-ROSARIO-ALVEAR | /classifications/567 | /rows/17 | H3-01 | clear_flag |
| AR-SF-M-CASEROS-SANJOSEDELAESQUINA | /classifications/568 | /rows/18 | H3-01 | clear_flag |
| AR-SF-M-GENERALLOPEZ-TEODELINA | /classifications/569 | /rows/19 | H3-01 | clear_flag |
| AR-ER-LEGACY-1-0080C-V | /classifications/1027 | /rows/20 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-1-0085C-V | /classifications/1028 | /rows/21 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-1-0086C-V | /classifications/1029 | /rows/22 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-1-0092C-V | /classifications/1030 | /rows/23 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-1-0093C-V | /classifications/1031 | /rows/24 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-1-0094C-V | /classifications/1032 | /rows/25 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-1-0095C-V | /classifications/1033 | /rows/26 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-1-0099C-V | /classifications/1034 | /rows/27 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-3-0102C-V | /classifications/1035 | /rows/28 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-3-0103C-V | /classifications/1036 | /rows/29 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-3-0104C-V | /classifications/1037 | /rows/30 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-3-0105C-V | /classifications/1038 | /rows/31 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-3-0106C-V | /classifications/1039 | /rows/32 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-3-0107C-V | /classifications/1040 | /rows/33 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-3-0109C-V | /classifications/1041 | /rows/34 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-3-0110C-V | /classifications/1042 | /rows/35 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-3-0112C-V | /classifications/1043 | /rows/36 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-3-0113C-V | /classifications/1044 | /rows/37 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-4-0020B-M | /classifications/1045 | /rows/38 | H3-04 | keep_open |
| AR-ER-LEGACY-4-0020B-C | /classifications/1046 | /rows/39 | H3-04 | keep_open |
| AR-ER-LEGACY-4-0021B-M | /classifications/1047 | /rows/40 | H3-04 | keep_open |
| AR-ER-LEGACY-4-0021B-C | /classifications/1048 | /rows/41 | H3-04 | keep_open |
| AR-ER-LEGACY-4-0114C-V | /classifications/1049 | /rows/42 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-4-0116C-V | /classifications/1050 | /rows/43 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-4-0120C-V | /classifications/1051 | /rows/44 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-4-0122C-V | /classifications/1052 | /rows/45 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-4-0123C-V | /classifications/1053 | /rows/46 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-5-0125C-V | /classifications/1054 | /rows/47 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-6-0133C-V | /classifications/1055 | /rows/48 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-6-0134C-V | /classifications/1056 | /rows/49 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-6-0137C-V | /classifications/1057 | /rows/50 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-6-0138C-V | /classifications/1058 | /rows/51 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-6-0139C-V | /classifications/1059 | /rows/52 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-6-0140C-V | /classifications/1060 | /rows/53 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-6-0141C-V | /classifications/1061 | /rows/54 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-6-0142C-V | /classifications/1062 | /rows/55 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-7-0144C-V | /classifications/1063 | /rows/56 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-7-0145C-V | /classifications/1064 | /rows/57 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-7-0146C-V | /classifications/1065 | /rows/58 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-7-0147C-V | /classifications/1066 | /rows/59 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-7-0148C-V | /classifications/1067 | /rows/60 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-7-0149C-V | /classifications/1068 | /rows/61 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-7-0150C-V | /classifications/1069 | /rows/62 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-7-0151C-V | /classifications/1070 | /rows/63 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-8-0031B-M | /classifications/1071 | /rows/64 | H3-04 | keep_open |
| AR-ER-LEGACY-8-0031B-C | /classifications/1072 | /rows/65 | H3-04 | keep_open |
| AR-ER-LEGACY-8-0152C-V | /classifications/1073 | /rows/66 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-8-0154C-V | /classifications/1074 | /rows/67 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-8-0155C-V | /classifications/1075 | /rows/68 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-8-0156C-V | /classifications/1076 | /rows/69 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-8-0157C-V | /classifications/1077 | /rows/70 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-8-0158C-V | /classifications/1078 | /rows/71 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-8-0159C-V | /classifications/1079 | /rows/72 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-8-0160C-V | /classifications/1080 | /rows/73 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-9-0165C-V | /classifications/1081 | /rows/74 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-9-0167C-V | /classifications/1082 | /rows/75 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-10-0171B-M | /classifications/1083 | /rows/76 | H3-04 | keep_open |
| AR-ER-LEGACY-10-0171B-C | /classifications/1084 | /rows/77 | H3-04 | keep_open |
| AR-ER-LEGACY-10-0174C-V | /classifications/1085 | /rows/78 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-10-0178C-V | /classifications/1086 | /rows/79 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-10-0179C-V | /classifications/1087 | /rows/80 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-10-0180C-V | /classifications/1088 | /rows/81 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-10-0181C-V | /classifications/1089 | /rows/82 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-10-0182C-V | /classifications/1090 | /rows/83 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-12-0049A-M | /classifications/1091 | /rows/84 | H3-04 | keep_open |
| AR-ER-LEGACY-12-0049A-C | /classifications/1092 | /rows/85 | H3-04 | keep_open |
| AR-ER-LEGACY-12-0186C-V | /classifications/1093 | /rows/86 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-12-0187C-V | /classifications/1094 | /rows/87 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-12-0188C-V | /classifications/1095 | /rows/88 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-12-0190C-V | /classifications/1096 | /rows/89 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-12-0192C-V | /classifications/1097 | /rows/90 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-12-0193C-V | /classifications/1098 | /rows/91 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-13-0195C-V | /classifications/1099 | /rows/92 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-13-0196C-V | /classifications/1100 | /rows/93 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-13-0197C-V | /classifications/1101 | /rows/94 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-14-0203C-V | /classifications/1102 | /rows/95 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-14-0204C-V | /classifications/1103 | /rows/96 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-14-0208C-V | /classifications/1104 | /rows/97 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-14-0209C-V | /classifications/1105 | /rows/98 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-15-0210C-V | /classifications/1106 | /rows/99 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-15-0211C-V | /classifications/1107 | /rows/100 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-15-0213C-V | /classifications/1108 | /rows/101 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-15-0215C-V | /classifications/1109 | /rows/102 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-15-0233C-V | /classifications/1110 | /rows/103 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-16-0216C-V | /classifications/1111 | /rows/104 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-16-0217C-V | /classifications/1112 | /rows/105 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-16-0219C-V | /classifications/1113 | /rows/106 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-16-0220C-V | /classifications/1114 | /rows/107 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-17-0221C-V | /classifications/1115 | /rows/108 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-17-0222C-V | /classifications/1116 | /rows/109 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-17-0225C-V | /classifications/1117 | /rows/110 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-17-0232C-V | /classifications/1118 | /rows/111 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-18-0228C-V | /classifications/1119 | /rows/112 | H3-03 | defer_with_reason |
| AR-ER-LEGACY-18-0229C-V | /classifications/1120 | /rows/113 | H3-03 | defer_with_reason |
| AR-MI-OBERA-O | /classifications/1599 | /rows/114 | H3-06 | defer_with_reason |
| AR-CB-MARCOS-JUAREZ-MC | /classifications/2325 | /rows/115 | H3-02 | clear_flag |
| AR-CB-MARCOS-JUAREZ-TM | /classifications/2326 | /rows/116 | H3-02 | clear_flag |
| AR-CB-RIO-CUARTO-MC | /classifications/2411 | /rows/117 | H3-02 | clear_flag |
| AR-CB-RIO-CUARTO-TM | /classifications/2412 | /rows/118 | H3-02 | clear_flag |
| AR-CB-MI-GRANJA-TC | /classifications/3009 | /rows/119 | H3-05 | keep_open |
| AR-CB-MI-GRANJA-CC | /classifications/3011 | /rows/120 | H3-05 | keep_open |

## Justin decision record — none selected

- [ ] Accept the named recommendation for exact listed batch(es): ______.
- [ ] Accept only these exact office IDs: ______.
- [ ] Keep open / defer pending the stated evidence: ______.
- [ ] Amend and issue a new guarded proposal: ______.

Reviewer/date: ______. This does not approve a country pack or authorize the optional appendix.
