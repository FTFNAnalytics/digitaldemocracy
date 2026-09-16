# Mexico share-domain override draft inventory

**DRAFT / NOT ACCEPTED. Documentation only; no production override, correction or SQLite update is supplied. Continuity publish remains blocked until tiers are approved and all Mexico overrides are accepted.**

Baseline: merged main `9065dcdfc0cbc78171dad35b60742ae232b6dd00`; lineage `latin-america-fe5e91689def`; office/event namespace `cdd-observatory-v1`. Re-extracted all 67 rows directly from the frozen derivative and matched the exact ID set in Continuity_LatAm_Field_Map.md, Share-domain compatibility blocker. 27 events / 27 offices are affected.

## Source and pointer convention

| Alias | Committed input path | SHA-256 of compressed bytes |
| --- | --- | --- |
| M | data/research/countries/mexico.json.gz | a8080cf83f12ede942158d0457f91074a61ab4311e96074fa4bd713eadae5b9e |
| R | data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz | 4a2850e4a22bbd997716b43b56e487950048816cb112b4d2806265f0e0a45c2a |

M pointers refer to decoded normalized Mexico JSON. R pointers refer to decoded original `Data/Mexico.json`; the original object digest is e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0. All row pointers below use zero-based RFC6901 locations. Supplied value is M `<row>/share/value`, status is `<row>/share/status`, unit is `<row>/shareUnit`. Raw fields are at M `<row>/extensions/raw/<field>` and the corresponding R party row. Their raw fields have no separately supplied status/unit; none is inferred.

For every row, expected_original equals its supplied numeric share exactly. Supplied status is recorded and supplied unit is percent_0_100 for all 67. Expected-original guard must also verify status, unit, full namespaced result/event/office binding and source hash. No result IDs are rebuilt from a sort order.

## Decision path — applies to every row

Current proposed decision is **needs_human_review** for all rows. Available future decisions:

| Option | Required before a later accepted override |
| --- | --- |
| Accepted correction | Justin approves an explicit numeric replacement in [0,100], matching zero/recorded status, and evidence linking the exact party/list, event, territorial segment and denominator. Record claim/source IDs or URLs, locator, rationale, reviewer and acceptance date. Raw alternate share alone is insufficient; do not choose it automatically. |
| Withhold | Justin explicitly approves withholding this resolved share while retaining the result row, original supplied value/status/unit, competing claims and source context. A future accepted override must specify share=NULL and share_status=unknown together and evidence_status=disputed with a reason, consistent with unchanged DDL. This is an explicit reviewed disposition, never automatic NULL coercion. |
| Needs human review | No effective change. The target lineage fails preflight/publication; the prior validated publication and other lineages remain served. |

The optional JSON uses schema_version atlas-share-domain-review-inventory/1, status DRAFT_NOT_ACCEPTED, production_accepted=false, executable_override=false, rows[] instead of changes[]. It must be rejected as a production override. proposed_replacement:null is only a placeholder meaning no choice; it must never be interpreted as a NULL assignment. Future accepted override(s) must be separately created under the existing atlas-override/1 contract, with full target_key, expected_original, replacement, decision, reason, claims/origin and explicit supersession handling. Bundle related value/status/evidence-status changes atomically. Never edit the frozen source.

Fail closed for missing review, mismatched expected-original, unsupported replacement, conflicting accepted decisions, broken source/identity bindings, or any remaining percentage-domain violation. Reject an unaccepted draft discovered in the production overrides path; explicitly remove/relocate the inventory from that path in the later accepted commit rather than silently treating it as empty accepted input. Hash accepted override bytes only under the governed effective-input protocol; this task claims no valid production fingerprint.

No clamp to 100, division/scale repair, vote-based recomputation, row drop, unit relabel or automatic raw-field substitution is authorized. All 269,740 LatAm result IDs must survive a future accepted disposition. An accepted target-lineage correction changes only the LatAm release fingerprint; Europe/NZ release IDs, records and citations stay unchanged. Missing≠zero gates remain intact.

## Complete 67-row inventory

Each row has explicit IDs, source pointers, original guards, alternate raw field values and the same unselected decision options. Full event source IDs and original API request/ballot context are preserved in the machine-readable inventory for investigation; their presence is not proof that any alternate denominator is correct.

### 01. event-c53481f1c2af40473903c6dd-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-c53481f1c2af40473903c6dd-r0 |
| office_id | MX-M-14-8 |
| event_id | event-c53481f1c2af40473903c6dd |
| history_key | MX-M-14-8\|mx_returns_AYUN_14_8_2018\|\|1166 |
| candidate/list | PAN_PRD_MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3018/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1166/parties/0 |
| supplied share / status / unit | 382.2657055 / recorded / percent_0_100 |
| expected_original | 382.2657055 |
| raw.reported_share | 382.2657055 at M /events/3018/resultRows/0/extensions/raw/reported_share ; R /histories/1166/parties/0/reported_share |
| raw.share — not selected | 57.96064959400375 at M /events/3018/resultRows/0/extensions/raw/share ; R /histories/1166/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S1eff289274, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 02. event-c53481f1c2af40473903c6dd-r1

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-c53481f1c2af40473903c6dd-r1 |
| office_id | MX-M-14-8 |
| event_id | event-c53481f1c2af40473903c6dd |
| history_key | MX-M-14-8\|mx_returns_AYUN_14_8_2018\|\|1166 |
| candidate/list | PRI |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3018/resultRows/1 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1166/parties/1 |
| supplied share / status / unit | 199.6498455 / recorded / percent_0_100 |
| expected_original | 199.6498455 |
| raw.reported_share | 199.6498455 at M /events/3018/resultRows/1/extensions/raw/reported_share ; R /histories/1166/parties/1/reported_share |
| raw.share — not selected | 30.271705184259837 at M /events/3018/resultRows/1/extensions/raw/share ; R /histories/1166/parties/1/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S1eff289274, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 03. event-298a2c0f453cc4423e10d6d9-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-298a2c0f453cc4423e10d6d9-r0 |
| office_id | MX-M-14-13 |
| event_id | event-298a2c0f453cc4423e10d6d9 |
| history_key | MX-M-14-13\|mx_returns_AYUN_14_13_2018\|\|1170 |
| candidate/list | PAN_PRD_MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3022/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1170/parties/0 |
| supplied share / status / unit | 289.5065398 / recorded / percent_0_100 |
| expected_original | 289.5065398 |
| raw.reported_share | 289.5065398 at M /events/3022/resultRows/0/extensions/raw/reported_share ; R /histories/1170/parties/0/reported_share |
| raw.share — not selected | 37.86105819694437 at M /events/3022/resultRows/0/extensions/raw/share ; R /histories/1170/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sf5c54791b3, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 04. event-298a2c0f453cc4423e10d6d9-r1

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-298a2c0f453cc4423e10d6d9-r1 |
| office_id | MX-M-14-13 |
| event_id | event-298a2c0f453cc4423e10d6d9 |
| history_key | MX-M-14-13\|mx_returns_AYUN_14_13_2018\|\|1170 |
| candidate/list | PANAL |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3022/resultRows/1 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1170/parties/1 |
| supplied share / status / unit | 116.587396 / recorded / percent_0_100 |
| expected_original | 116.587396 |
| raw.reported_share | 116.587396 at M /events/3022/resultRows/1/extensions/raw/reported_share ; R /histories/1170/parties/1/reported_share |
| raw.share — not selected | 15.24705516463865 at M /events/3022/resultRows/1/extensions/raw/share ; R /histories/1170/parties/1/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sf5c54791b3, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 05. event-298a2c0f453cc4423e10d6d9-r2

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-298a2c0f453cc4423e10d6d9-r2 |
| office_id | MX-M-14-13 |
| event_id | event-298a2c0f453cc4423e10d6d9 |
| history_key | MX-M-14-13\|mx_returns_AYUN_14_13_2018\|\|1170 |
| candidate/list | PT_MORENA_ES |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3022/resultRows/2 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1170/parties/2 |
| supplied share / status / unit | 114.4768133 / recorded / percent_0_100 |
| expected_original | 114.4768133 |
| raw.reported_share | 114.4768133 at M /events/3022/resultRows/2/extensions/raw/reported_share ; R /histories/1170/parties/2/reported_share |
| raw.share — not selected | 14.971037592815769 at M /events/3022/resultRows/2/extensions/raw/share ; R /histories/1170/parties/2/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sf5c54791b3, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 06. event-298a2c0f453cc4423e10d6d9-r3

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-298a2c0f453cc4423e10d6d9-r3 |
| office_id | MX-M-14-13 |
| event_id | event-298a2c0f453cc4423e10d6d9 |
| history_key | MX-M-14-13\|mx_returns_AYUN_14_13_2018\|\|1170 |
| candidate/list | PRI |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3022/resultRows/3 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1170/parties/3 |
| supplied share / status / unit | 111.3852556 / recorded / percent_0_100 |
| expected_original | 111.3852556 |
| raw.reported_share | 111.3852556 at M /events/3022/resultRows/3/extensions/raw/reported_share ; R /histories/1170/parties/3/reported_share |
| raw.share — not selected | 14.566730163666758 at M /events/3022/resultRows/3/extensions/raw/share ; R /histories/1170/parties/3/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sf5c54791b3, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 07. event-92c88013e1707162383365c7-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-92c88013e1707162383365c7-r0 |
| office_id | MX-M-14-16 |
| event_id | event-92c88013e1707162383365c7 |
| history_key | MX-M-14-16\|mx_returns_AYUN_14_16_2018\|\|1173 |
| candidate/list | PT_MORENA_ES |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3025/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1173/parties/0 |
| supplied share / status / unit | 142.9072572 / recorded / percent_0_100 |
| expected_original | 142.9072572 |
| raw.reported_share | 142.9072572 at M /events/3025/resultRows/0/extensions/raw/reported_share ; R /histories/1173/parties/0/reported_share |
| raw.share — not selected | 37.93946449359721 at M /events/3025/resultRows/0/extensions/raw/share ; R /histories/1173/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S42986f9db4, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 08. event-92c88013e1707162383365c7-r1

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-92c88013e1707162383365c7-r1 |
| office_id | MX-M-14-16 |
| event_id | event-92c88013e1707162383365c7 |
| history_key | MX-M-14-16\|mx_returns_AYUN_14_16_2018\|\|1173 |
| candidate/list | PVEM |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3025/resultRows/1 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1173/parties/1 |
| supplied share / status / unit | 142.688007 / recorded / percent_0_100 |
| expected_original | 142.688007 |
| raw.reported_share | 142.688007 at M /events/3025/resultRows/1/extensions/raw/reported_share ; R /histories/1173/parties/1/reported_share |
| raw.share — not selected | 37.881257275902215 at M /events/3025/resultRows/1/extensions/raw/share ; R /histories/1173/parties/1/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S42986f9db4, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 09. event-19049da36d1907576d30cabb-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-19049da36d1907576d30cabb-r0 |
| office_id | MX-M-14-21 |
| event_id | event-19049da36d1907576d30cabb |
| history_key | MX-M-14-21\|mx_returns_AYUN_14_21_2018\|\|1178 |
| candidate/list | MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3030/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1178/parties/0 |
| supplied share / status / unit | 217.0100059 / recorded / percent_0_100 |
| expected_original | 217.0100059 |
| raw.reported_share | 217.0100059 at M /events/3030/resultRows/0/extensions/raw/reported_share ; R /histories/1178/parties/0/reported_share |
| raw.share — not selected | 42.34523946250143 at M /events/3030/resultRows/0/extensions/raw/share ; R /histories/1178/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S0b685ca705, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 10. event-19049da36d1907576d30cabb-r1

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-19049da36d1907576d30cabb-r1 |
| office_id | MX-M-14-21 |
| event_id | event-19049da36d1907576d30cabb |
| history_key | MX-M-14-21\|mx_returns_AYUN_14_21_2018\|\|1178 |
| candidate/list | PRI |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3030/resultRows/1 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1178/parties/1 |
| supplied share / status / unit | 131.8422602 / recorded / percent_0_100 |
| expected_original | 131.8422602 |
| raw.reported_share | 131.8422602 at M /events/3030/resultRows/1/extensions/raw/reported_share ; R /histories/1178/parties/1/reported_share |
| raw.share — not selected | 25.726427012748363 at M /events/3030/resultRows/1/extensions/raw/share ; R /histories/1178/parties/1/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S0b685ca705, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 11. event-918b4b717c7d879be7f0775d-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-918b4b717c7d879be7f0775d-r0 |
| office_id | MX-M-14-31 |
| event_id | event-918b4b717c7d879be7f0775d |
| history_key | MX-M-14-31\|mx_returns_AYUN_14_31_2018\|\|1179 |
| candidate/list | MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3031/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1179/parties/0 |
| supplied share / status / unit | 107.6303318 / recorded / percent_0_100 |
| expected_original | 107.6303318 |
| raw.reported_share | 107.6303318 at M /events/3031/resultRows/0/extensions/raw/reported_share ; R /histories/1179/parties/0/reported_share |
| raw.share — not selected | 29.466718567536006 at M /events/3031/resultRows/0/extensions/raw/share ; R /histories/1179/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S97a7d789a2, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 12. event-918b4b717c7d879be7f0775d-r1

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-918b4b717c7d879be7f0775d-r1 |
| office_id | MX-M-14-31 |
| event_id | event-918b4b717c7d879be7f0775d |
| history_key | MX-M-14-31\|mx_returns_AYUN_14_31_2018\|\|1179 |
| candidate/list | PAN |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3031/resultRows/1 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1179/parties/1 |
| supplied share / status / unit | 106.8878357 / recorded / percent_0_100 |
| expected_original | 106.8878357 |
| raw.reported_share | 106.8878357 at M /events/3031/resultRows/1/extensions/raw/reported_share ; R /histories/1179/parties/1/reported_share |
| raw.share — not selected | 29.263440162622725 at M /events/3031/resultRows/1/extensions/raw/share ; R /histories/1179/parties/1/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S97a7d789a2, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 13. event-b0cbd05b4a1ac790c5a8e655-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-b0cbd05b4a1ac790c5a8e655-r0 |
| office_id | MX-M-14-28 |
| event_id | event-b0cbd05b4a1ac790c5a8e655 |
| history_key | MX-M-14-28\|mx_returns_AYUN_14_28_2018\|\|1186 |
| candidate/list | PAN |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3038/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1186/parties/0 |
| supplied share / status / unit | 125.2457175 / recorded / percent_0_100 |
| expected_original | 125.2457175 |
| raw.reported_share | 125.2457175 at M /events/3038/resultRows/0/extensions/raw/reported_share ; R /histories/1186/parties/0/reported_share |
| raw.share — not selected | 44.45773524720893 at M /events/3038/resultRows/0/extensions/raw/share ; R /histories/1186/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sa97b633a03, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 14. event-b0cbd05b4a1ac790c5a8e655-r1

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-b0cbd05b4a1ac790c5a8e655-r1 |
| office_id | MX-M-14-28 |
| event_id | event-b0cbd05b4a1ac790c5a8e655 |
| history_key | MX-M-14-28\|mx_returns_AYUN_14_28_2018\|\|1186 |
| candidate/list | MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3038/resultRows/1 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1186/parties/1 |
| supplied share / status / unit | 110.5026678 / recorded / percent_0_100 |
| expected_original | 110.5026678 |
| raw.reported_share | 110.5026678 at M /events/3038/resultRows/1/extensions/raw/reported_share ; R /histories/1186/parties/1/reported_share |
| raw.share — not selected | 39.224481658692184 at M /events/3038/resultRows/1/extensions/raw/share ; R /histories/1186/parties/1/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sa97b633a03, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 15. event-64a407db171425962b4ef38f-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-64a407db171425962b4ef38f-r0 |
| office_id | MX-M-14-30 |
| event_id | event-64a407db171425962b4ef38f |
| history_key | MX-M-14-30\|mx_returns_AYUN_14_30_2018\|\|1188 |
| candidate/list | PT_MORENA_ES |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3040/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1188/parties/0 |
| supplied share / status / unit | 362.3159304 / recorded / percent_0_100 |
| expected_original | 362.3159304 |
| raw.reported_share | 362.3159304 at M /events/3040/resultRows/0/extensions/raw/reported_share ; R /histories/1188/parties/0/reported_share |
| raw.share — not selected | 58.830561895446145 at M /events/3040/resultRows/0/extensions/raw/share ; R /histories/1188/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sba8b882e21, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 16. event-64a407db171425962b4ef38f-r1

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-64a407db171425962b4ef38f-r1 |
| office_id | MX-M-14-30 |
| event_id | event-64a407db171425962b4ef38f |
| history_key | MX-M-14-30\|mx_returns_AYUN_14_30_2018\|\|1188 |
| candidate/list | MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3040/resultRows/1 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1188/parties/1 |
| supplied share / status / unit | 171.686747 / recorded / percent_0_100 |
| expected_original | 171.686747 |
| raw.reported_share | 171.686747 at M /events/3040/resultRows/1/extensions/raw/reported_share ; R /histories/1188/parties/1/reported_share |
| raw.share — not selected | 27.87740462993153 at M /events/3040/resultRows/1/extensions/raw/share ; R /histories/1188/parties/1/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sba8b882e21, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 17. event-41b5e28438be4be40ced8c46-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-41b5e28438be4be40ced8c46-r0 |
| office_id | MX-M-14-9 |
| event_id | event-41b5e28438be4be40ced8c46 |
| history_key | MX-M-14-9\|mx_returns_AYUN_14_9_2018\|\|1191 |
| candidate/list | MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3043/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1191/parties/0 |
| supplied share / status / unit | 128.6399303 / recorded / percent_0_100 |
| expected_original | 128.6399303 |
| raw.reported_share | 128.6399303 at M /events/3043/resultRows/0/extensions/raw/reported_share ; R /histories/1191/parties/0/reported_share |
| raw.share — not selected | 32.27605818659084 at M /events/3043/resultRows/0/extensions/raw/share ; R /histories/1191/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sf410af82e1, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 18. event-41b5e28438be4be40ced8c46-r1

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-41b5e28438be4be40ced8c46-r1 |
| office_id | MX-M-14-9 |
| event_id | event-41b5e28438be4be40ced8c46 |
| history_key | MX-M-14-9\|mx_returns_AYUN_14_9_2018\|\|1191 |
| candidate/list | PAN |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3043/resultRows/1 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1191/parties/1 |
| supplied share / status / unit | 106.9747167 / recorded / percent_0_100 |
| expected_original | 106.9747167 |
| raw.reported_share | 106.9747167 at M /events/3043/resultRows/1/extensions/raw/reported_share ; R /histories/1191/parties/1/reported_share |
| raw.share — not selected | 26.84020562178716 at M /events/3043/resultRows/1/extensions/raw/share ; R /histories/1191/parties/1/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sf410af82e1, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 19. event-f948e1f268f5ea5989968def-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-f948e1f268f5ea5989968def-r0 |
| office_id | MX-M-14-39 |
| event_id | event-f948e1f268f5ea5989968def |
| history_key | MX-M-14-39\|mx_returns_AYUN_14_39_2018\|\|1192 |
| candidate/list | PAN_PRD_MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3044/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1192/parties/0 |
| supplied share / status / unit | 159.2100896 / recorded / percent_0_100 |
| expected_original | 159.2100896 |
| raw.reported_share | 159.2100896 at M /events/3044/resultRows/0/extensions/raw/reported_share ; R /histories/1192/parties/0/reported_share |
| raw.share — not selected | 49.52508775552344 at M /events/3044/resultRows/0/extensions/raw/share ; R /histories/1192/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S5b38e302d8, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 20. event-f314e00cea66c0327fca32fd-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-f314e00cea66c0327fca32fd-r0 |
| office_id | MX-M-14-72 |
| event_id | event-f314e00cea66c0327fca32fd |
| history_key | MX-M-14-72\|mx_returns_AYUN_14_72_2018\|\|1194 |
| candidate/list | PAN_PRD_MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3046/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1194/parties/0 |
| supplied share / status / unit | 2465.7544957 / recorded / percent_0_100 |
| expected_original | 2465.7544957 |
| raw.reported_share | 2465.7544957 at M /events/3046/resultRows/0/extensions/raw/reported_share ; R /histories/1194/parties/0/reported_share |
| raw.share — not selected | 51.72289373985207 at M /events/3046/resultRows/0/extensions/raw/share ; R /histories/1194/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sd625a1be94, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 21. event-f314e00cea66c0327fca32fd-r1

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-f314e00cea66c0327fca32fd-r1 |
| office_id | MX-M-14-72 |
| event_id | event-f314e00cea66c0327fca32fd |
| history_key | MX-M-14-72\|mx_returns_AYUN_14_72_2018\|\|1194 |
| candidate/list | PT_MORENA_ES |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3046/resultRows/1 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1194/parties/1 |
| supplied share / status / unit | 1103.6747459 / recorded / percent_0_100 |
| expected_original | 1103.6747459 |
| raw.reported_share | 1103.6747459 at M /events/3046/resultRows/1/extensions/raw/reported_share ; R /histories/1194/parties/1/reported_share |
| raw.share — not selected | 23.15123087268135 at M /events/3046/resultRows/1/extensions/raw/share ; R /histories/1194/parties/1/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sd625a1be94, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 22. event-f314e00cea66c0327fca32fd-r2

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-f314e00cea66c0327fca32fd-r2 |
| office_id | MX-M-14-72 |
| event_id | event-f314e00cea66c0327fca32fd |
| history_key | MX-M-14-72\|mx_returns_AYUN_14_72_2018\|\|1194 |
| candidate/list | PRI |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3046/resultRows/2 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1194/parties/2 |
| supplied share / status / unit | 1043.9405786 / recorded / percent_0_100 |
| expected_original | 1043.9405786 |
| raw.reported_share | 1043.9405786 at M /events/3046/resultRows/2/extensions/raw/reported_share ; R /histories/1194/parties/2/reported_share |
| raw.share — not selected | 21.89821724369803 at M /events/3046/resultRows/2/extensions/raw/share ; R /histories/1194/parties/2/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sd625a1be94, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 23. event-f314e00cea66c0327fca32fd-r3

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-f314e00cea66c0327fca32fd-r3 |
| office_id | MX-M-14-72 |
| event_id | event-f314e00cea66c0327fca32fd |
| history_key | MX-M-14-72\|mx_returns_AYUN_14_72_2018\|\|1194 |
| candidate/list | PVEM |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3046/resultRows/3 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1194/parties/3 |
| supplied share / status / unit | 101.7982799 / recorded / percent_0_100 |
| expected_original | 101.7982799 |
| raw.reported_share | 101.7982799 at M /events/3046/resultRows/3/extensions/raw/reported_share ; R /histories/1194/parties/3/reported_share |
| raw.share — not selected | 2.135371393895659 at M /events/3046/resultRows/3/extensions/raw/share ; R /histories/1194/parties/3/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sd625a1be94, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 24. event-ec64f89df4fc3e6a2f07d2ab-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-ec64f89df4fc3e6a2f07d2ab-r0 |
| office_id | MX-M-14-41 |
| event_id | event-ec64f89df4fc3e6a2f07d2ab |
| history_key | MX-M-14-41\|mx_returns_AYUN_14_41_2018\|\|1199 |
| candidate/list | MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3051/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1199/parties/0 |
| supplied share / status / unit | 11255.4373522 / recorded / percent_0_100 |
| expected_original | 11255.4373522 |
| raw.reported_share | 11255.4373522 at M /events/3051/resultRows/0/extensions/raw/reported_share ; R /histories/1199/parties/0/reported_share |
| raw.share — not selected | 38.013842184196065 at M /events/3051/resultRows/0/extensions/raw/share ; R /histories/1199/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sb7d2d40043, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 25. event-ec64f89df4fc3e6a2f07d2ab-r1

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-ec64f89df4fc3e6a2f07d2ab-r1 |
| office_id | MX-M-14-41 |
| event_id | event-ec64f89df4fc3e6a2f07d2ab |
| history_key | MX-M-14-41\|mx_returns_AYUN_14_41_2018\|\|1199 |
| candidate/list | PT_MORENA_ES |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3051/resultRows/1 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1199/parties/1 |
| supplied share / status / unit | 8587.0764381 / recorded / percent_0_100 |
| expected_original | 8587.0764381 |
| raw.reported_share | 8587.0764381 at M /events/3051/resultRows/1/extensions/raw/reported_share ; R /histories/1199/parties/1/reported_share |
| raw.share — not selected | 29.001784500000664 at M /events/3051/resultRows/1/extensions/raw/share ; R /histories/1199/parties/1/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sb7d2d40043, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 26. event-ec64f89df4fc3e6a2f07d2ab-r2

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-ec64f89df4fc3e6a2f07d2ab-r2 |
| office_id | MX-M-14-41 |
| event_id | event-ec64f89df4fc3e6a2f07d2ab |
| history_key | MX-M-14-41\|mx_returns_AYUN_14_41_2018\|\|1199 |
| candidate/list | PRI |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3051/resultRows/2 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1199/parties/2 |
| supplied share / status / unit | 4213.4751773 / recorded / percent_0_100 |
| expected_original | 4213.4751773 |
| raw.reported_share | 4213.4751773 at M /events/3051/resultRows/2/extensions/raw/reported_share ; R /histories/1199/parties/2/reported_share |
| raw.share — not selected | 14.23048926705089 at M /events/3051/resultRows/2/extensions/raw/share ; R /histories/1199/parties/2/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sb7d2d40043, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 27. event-ec64f89df4fc3e6a2f07d2ab-r3

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-ec64f89df4fc3e6a2f07d2ab-r3 |
| office_id | MX-M-14-41 |
| event_id | event-ec64f89df4fc3e6a2f07d2ab |
| history_key | MX-M-14-41\|mx_returns_AYUN_14_41_2018\|\|1199 |
| candidate/list | PAN |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3051/resultRows/3 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1199/parties/3 |
| supplied share / status / unit | 3767.178881 / recorded / percent_0_100 |
| expected_original | 3767.178881 |
| raw.reported_share | 3767.178881 at M /events/3051/resultRows/3/extensions/raw/reported_share ; R /histories/1199/parties/3/reported_share |
| raw.share — not selected | 12.723178938375533 at M /events/3051/resultRows/3/extensions/raw/share ; R /histories/1199/parties/3/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sb7d2d40043, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 28. event-ec64f89df4fc3e6a2f07d2ab-r4

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-ec64f89df4fc3e6a2f07d2ab-r4 |
| office_id | MX-M-14-41 |
| event_id | event-ec64f89df4fc3e6a2f07d2ab |
| history_key | MX-M-14-41\|mx_returns_AYUN_14_41_2018\|\|1199 |
| candidate/list | PVEM |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3051/resultRows/4 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1199/parties/4 |
| supplied share / status / unit | 882.9787234 / recorded / percent_0_100 |
| expected_original | 882.9787234 |
| raw.reported_share | 882.9787234 at M /events/3051/resultRows/4/extensions/raw/reported_share ; R /histories/1199/parties/4/reported_share |
| raw.share — not selected | 2.9821510078233224 at M /events/3051/resultRows/4/extensions/raw/share ; R /histories/1199/parties/4/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sb7d2d40043, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 29. event-ec64f89df4fc3e6a2f07d2ab-r5

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-ec64f89df4fc3e6a2f07d2ab-r5 |
| office_id | MX-M-14-41 |
| event_id | event-ec64f89df4fc3e6a2f07d2ab |
| history_key | MX-M-14-41\|mx_returns_AYUN_14_41_2018\|\|1199 |
| candidate/list | PANAL |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3051/resultRows/5 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1199/parties/5 |
| supplied share / status / unit | 490.5831363 / recorded / percent_0_100 |
| expected_original | 490.5831363 |
| raw.reported_share | 490.5831363 at M /events/3051/resultRows/5/extensions/raw/reported_share ; R /histories/1199/parties/5/reported_share |
| raw.share — not selected | 1.6568836322359746 at M /events/3051/resultRows/5/extensions/raw/share ; R /histories/1199/parties/5/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sb7d2d40043, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 30. event-ec64f89df4fc3e6a2f07d2ab-r6

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-ec64f89df4fc3e6a2f07d2ab-r6 |
| office_id | MX-M-14-41 |
| event_id | event-ec64f89df4fc3e6a2f07d2ab |
| history_key | MX-M-14-41\|mx_returns_AYUN_14_41_2018\|\|1199 |
| candidate/list | PRD |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3051/resultRows/6 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1199/parties/6 |
| supplied share / status / unit | 412.0567376 / recorded / percent_0_100 |
| expected_original | 412.0567376 |
| raw.reported_share | 412.0567376 at M /events/3051/resultRows/6/extensions/raw/reported_share ; R /histories/1199/parties/6/reported_share |
| raw.share — not selected | 1.3916704703175504 at M /events/3051/resultRows/6/extensions/raw/share ; R /histories/1199/parties/6/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sb7d2d40043, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 31. event-619ff82171e36f20f4716553-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-619ff82171e36f20f4716553-r0 |
| office_id | MX-M-14-46 |
| event_id | event-619ff82171e36f20f4716553 |
| history_key | MX-M-14-46\|mx_returns_AYUN_14_46_2018\|\|1203 |
| candidate/list | PRI |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3055/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1203/parties/0 |
| supplied share / status / unit | 180.2994142 / recorded / percent_0_100 |
| expected_original | 180.2994142 |
| raw.reported_share | 180.2994142 at M /events/3055/resultRows/0/extensions/raw/reported_share ; R /histories/1203/parties/0/reported_share |
| raw.share — not selected | 48.23823068439078 at M /events/3055/resultRows/0/extensions/raw/share ; R /histories/1203/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S6043f4570a, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 32. event-619ff82171e36f20f4716553-r1

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-619ff82171e36f20f4716553-r1 |
| office_id | MX-M-14-46 |
| event_id | event-619ff82171e36f20f4716553 |
| history_key | MX-M-14-46\|mx_returns_AYUN_14_46_2018\|\|1203 |
| candidate/list | PAN_PRD_MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3055/resultRows/1 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1203/parties/1 |
| supplied share / status / unit | 115.5131265 / recorded / percent_0_100 |
| expected_original | 115.5131265 |
| raw.reported_share | 115.5131265 at M /events/3055/resultRows/1/extensions/raw/reported_share ; R /histories/1203/parties/1/reported_share |
| raw.share — not selected | 30.904974748940617 at M /events/3055/resultRows/1/extensions/raw/share ; R /histories/1203/parties/1/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S6043f4570a, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 33. event-c385c21b3823dd30d6d9a447-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-c385c21b3823dd30d6d9a447-r0 |
| office_id | MX-M-14-45 |
| event_id | event-c385c21b3823dd30d6d9a447 |
| history_key | MX-M-14-45\|mx_returns_AYUN_14_45_2018\|\|1213 |
| candidate/list | PAN_PRD_MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3065/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1213/parties/0 |
| supplied share / status / unit | 170.6957547 / recorded / percent_0_100 |
| expected_original | 170.6957547 |
| raw.reported_share | 170.6957547 at M /events/3065/resultRows/0/extensions/raw/reported_share ; R /histories/1213/parties/0/reported_share |
| raw.share — not selected | 50.35658375369629 at M /events/3065/resultRows/0/extensions/raw/share ; R /histories/1213/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S2f44bd3d55, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 34. event-c385c21b3823dd30d6d9a447-r1

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-c385c21b3823dd30d6d9a447-r1 |
| office_id | MX-M-14-45 |
| event_id | event-c385c21b3823dd30d6d9a447 |
| history_key | MX-M-14-45\|mx_returns_AYUN_14_45_2018\|\|1213 |
| candidate/list | PRI |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3065/resultRows/1 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1213/parties/1 |
| supplied share / status / unit | 130.5424528 / recorded / percent_0_100 |
| expected_original | 130.5424528 |
| raw.reported_share | 130.5424528 at M /events/3065/resultRows/1/extensions/raw/reported_share ; R /histories/1213/parties/1/reported_share |
| raw.share — not selected | 38.51104539919986 at M /events/3065/resultRows/1/extensions/raw/share ; R /histories/1213/parties/1/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S2f44bd3d55, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 35. event-86ce39fd123295258857fb16-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-86ce39fd123295258857fb16-r0 |
| office_id | MX-M-14-55 |
| event_id | event-86ce39fd123295258857fb16 |
| history_key | MX-M-14-55\|mx_returns_AYUN_14_55_2018\|\|1215 |
| candidate/list | PAN_PRD_MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3067/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1215/parties/0 |
| supplied share / status / unit | 1311.7908082 / recorded / percent_0_100 |
| expected_original | 1311.7908082 |
| raw.reported_share | 1311.7908082 at M /events/3067/resultRows/0/extensions/raw/reported_share ; R /histories/1215/parties/0/reported_share |
| raw.share — not selected | 63.13420996430424 at M /events/3067/resultRows/0/extensions/raw/share ; R /histories/1215/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S9d59ebbb73, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 36. event-86ce39fd123295258857fb16-r1

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-86ce39fd123295258857fb16-r1 |
| office_id | MX-M-14-55 |
| event_id | event-86ce39fd123295258857fb16 |
| history_key | MX-M-14-55\|mx_returns_AYUN_14_55_2018\|\|1215 |
| candidate/list | PRI |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3067/resultRows/1 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1215/parties/1 |
| supplied share / status / unit | 446.7511886 / recorded / percent_0_100 |
| expected_original | 446.7511886 |
| raw.reported_share | 446.7511886 at M /events/3067/resultRows/1/extensions/raw/reported_share ; R /histories/1215/parties/1/reported_share |
| raw.share — not selected | 21.50135765933429 at M /events/3067/resultRows/1/extensions/raw/share ; R /histories/1215/parties/1/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S9d59ebbb73, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 37. event-86ce39fd123295258857fb16-r2

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-86ce39fd123295258857fb16-r2 |
| office_id | MX-M-14-55 |
| event_id | event-86ce39fd123295258857fb16 |
| history_key | MX-M-14-55\|mx_returns_AYUN_14_55_2018\|\|1215 |
| candidate/list | PT_MORENA_ES |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3067/resultRows/2 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1215/parties/2 |
| supplied share / status / unit | 229.1600634 / recorded / percent_0_100 |
| expected_original | 229.1600634 |
| raw.reported_share | 229.1600634 at M /events/3067/resultRows/2/extensions/raw/reported_share ; R /histories/1215/parties/2/reported_share |
| raw.share — not selected | 11.029075266192757 at M /events/3067/resultRows/2/extensions/raw/share ; R /histories/1215/parties/2/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S9d59ebbb73, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 38. event-3df08b5bc971df4f4b5c05a5-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-3df08b5bc971df4f4b5c05a5-r0 |
| office_id | MX-M-14-60 |
| event_id | event-3df08b5bc971df4f4b5c05a5 |
| history_key | MX-M-14-60\|mx_returns_AYUN_14_60_2018\|\|1217 |
| candidate/list | MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3069/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1217/parties/0 |
| supplied share / status / unit | 170.4235463 / recorded / percent_0_100 |
| expected_original | 170.4235463 |
| raw.reported_share | 170.4235463 at M /events/3069/resultRows/0/extensions/raw/reported_share ; R /histories/1217/parties/0/reported_share |
| raw.share — not selected | 33.11479983261264 at M /events/3069/resultRows/0/extensions/raw/share ; R /histories/1217/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S6e9be464b0, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 39. event-3df08b5bc971df4f4b5c05a5-r1

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-3df08b5bc971df4f4b5c05a5-r1 |
| office_id | MX-M-14-60 |
| event_id | event-3df08b5bc971df4f4b5c05a5 |
| history_key | MX-M-14-60\|mx_returns_AYUN_14_60_2018\|\|1217 |
| candidate/list | PRI |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3069/resultRows/1 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1217/parties/1 |
| supplied share / status / unit | 165.3266332 / recorded / percent_0_100 |
| expected_original | 165.3266332 |
| raw.reported_share | 165.3266332 at M /events/3069/resultRows/1/extensions/raw/reported_share ; R /histories/1217/parties/1/reported_share |
| raw.share — not selected | 32.12442460594225 at M /events/3069/resultRows/1/extensions/raw/share ; R /histories/1217/parties/1/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S6e9be464b0, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 40. event-3df08b5bc971df4f4b5c05a5-r2

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-3df08b5bc971df4f4b5c05a5-r2 |
| office_id | MX-M-14-60 |
| event_id | event-3df08b5bc971df4f4b5c05a5 |
| history_key | MX-M-14-60\|mx_returns_AYUN_14_60_2018\|\|1217 |
| candidate/list | PT_MORENA_ES |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3069/resultRows/2 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1217/parties/2 |
| supplied share / status / unit | 110.1938263 / recorded / percent_0_100 |
| expected_original | 110.1938263 |
| raw.reported_share | 110.1938263 at M /events/3069/resultRows/2/extensions/raw/reported_share ; R /histories/1217/parties/2/reported_share |
| raw.share — not selected | 21.41163342167666 at M /events/3069/resultRows/2/extensions/raw/share ; R /histories/1217/parties/2/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S6e9be464b0, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 41. event-52a50cf2eb98abe76786ac07-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-52a50cf2eb98abe76786ac07-r0 |
| office_id | MX-M-14-61 |
| event_id | event-52a50cf2eb98abe76786ac07 |
| history_key | MX-M-14-61\|mx_returns_AYUN_14_61_2018\|\|1218 |
| candidate/list | PVEM |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3070/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1218/parties/0 |
| supplied share / status / unit | 130.3262183 / recorded / percent_0_100 |
| expected_original | 130.3262183 |
| raw.reported_share | 130.3262183 at M /events/3070/resultRows/0/extensions/raw/reported_share ; R /histories/1218/parties/0/reported_share |
| raw.share — not selected | 44.31662558203232 at M /events/3070/resultRows/0/extensions/raw/share ; R /histories/1218/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sf751f22c8f, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 42. event-e06ac8eeb6c9d6b541c24002-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-e06ac8eeb6c9d6b541c24002-r0 |
| office_id | MX-M-14-65 |
| event_id | event-e06ac8eeb6c9d6b541c24002 |
| history_key | MX-M-14-65\|mx_returns_AYUN_14_65_2018\|\|1222 |
| candidate/list | MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3074/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1222/parties/0 |
| supplied share / status / unit | 228.6322965 / recorded / percent_0_100 |
| expected_original | 228.6322965 |
| raw.reported_share | 228.6322965 at M /events/3074/resultRows/0/extensions/raw/reported_share ; R /histories/1222/parties/0/reported_share |
| raw.share — not selected | 38.2711646815491 at M /events/3074/resultRows/0/extensions/raw/share ; R /histories/1222/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S5cd993e24b, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 43. event-e06ac8eeb6c9d6b541c24002-r1

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-e06ac8eeb6c9d6b541c24002-r1 |
| office_id | MX-M-14-65 |
| event_id | event-e06ac8eeb6c9d6b541c24002 |
| history_key | MX-M-14-65\|mx_returns_AYUN_14_65_2018\|\|1222 |
| candidate/list | PT_MORENA_ES |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3074/resultRows/1 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1222/parties/1 |
| supplied share / status / unit | 145.9735833 / recorded / percent_0_100 |
| expected_original | 145.9735833 |
| raw.reported_share | 145.9735833 at M /events/3074/resultRows/1/extensions/raw/reported_share ; R /histories/1222/parties/1/reported_share |
| raw.share — not selected | 24.434776406818344 at M /events/3074/resultRows/1/extensions/raw/share ; R /histories/1222/parties/1/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S5cd993e24b, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 44. event-e06ac8eeb6c9d6b541c24002-r2

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-e06ac8eeb6c9d6b541c24002-r2 |
| office_id | MX-M-14-65 |
| event_id | event-e06ac8eeb6c9d6b541c24002 |
| history_key | MX-M-14-65\|mx_returns_AYUN_14_65_2018\|\|1222 |
| candidate/list | PAN |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3074/resultRows/2 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1222/parties/2 |
| supplied share / status / unit | 116.8015907 / recorded / percent_0_100 |
| expected_original | 116.8015907 |
| raw.reported_share | 116.8015907 at M /events/3074/resultRows/2/extensions/raw/reported_share ; R /histories/1222/parties/2/reported_share |
| raw.share — not selected | 19.551624943537075 at M /events/3074/resultRows/2/extensions/raw/share ; R /histories/1222/parties/2/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S5cd993e24b, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 45. event-f23d9bed9c5ee4d751673373-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-f23d9bed9c5ee4d751673373-r0 |
| office_id | MX-M-14-66 |
| event_id | event-f23d9bed9c5ee4d751673373 |
| history_key | MX-M-14-66\|mx_returns_AYUN_14_66_2018\|\|1223 |
| candidate/list | PAN_PRD_MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3075/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1223/parties/0 |
| supplied share / status / unit | 315.919761 / recorded / percent_0_100 |
| expected_original | 315.919761 |
| raw.reported_share | 315.919761 at M /events/3075/resultRows/0/extensions/raw/reported_share ; R /histories/1223/parties/0/reported_share |
| raw.share — not selected | 57.63450907108931 at M /events/3075/resultRows/0/extensions/raw/share ; R /histories/1223/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sc1f6d8a67f, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 46. event-059a6b37f94b7f6d382cbe8d-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-059a6b37f94b7f6d382cbe8d-r0 |
| office_id | MX-M-14-69 |
| event_id | event-059a6b37f94b7f6d382cbe8d |
| history_key | MX-M-14-69\|mx_returns_AYUN_14_69_2018\|\|1226 |
| candidate/list | MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3078/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1226/parties/0 |
| supplied share / status / unit | 811.2794336 / recorded / percent_0_100 |
| expected_original | 811.2794336 |
| raw.reported_share | 811.2794336 at M /events/3078/resultRows/0/extensions/raw/reported_share ; R /histories/1226/parties/0/reported_share |
| raw.share — not selected | 47.30081316423613 at M /events/3078/resultRows/0/extensions/raw/share ; R /histories/1226/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sce3331aa35, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 47. event-059a6b37f94b7f6d382cbe8d-r1

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-059a6b37f94b7f6d382cbe8d-r1 |
| office_id | MX-M-14-69 |
| event_id | event-059a6b37f94b7f6d382cbe8d |
| history_key | MX-M-14-69\|mx_returns_AYUN_14_69_2018\|\|1226 |
| candidate/list | PT_MORENA_ES |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3078/resultRows/1 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1226/parties/1 |
| supplied share / status / unit | 508.1837642 / recorded / percent_0_100 |
| expected_original | 508.1837642 |
| raw.reported_share | 508.1837642 at M /events/3078/resultRows/1/extensions/raw/reported_share ; R /histories/1226/parties/1/reported_share |
| raw.share — not selected | 29.629131824771267 at M /events/3078/resultRows/1/extensions/raw/share ; R /histories/1226/parties/1/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sce3331aa35, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 48. event-059a6b37f94b7f6d382cbe8d-r2

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-059a6b37f94b7f6d382cbe8d-r2 |
| office_id | MX-M-14-69 |
| event_id | event-059a6b37f94b7f6d382cbe8d |
| history_key | MX-M-14-69\|mx_returns_AYUN_14_69_2018\|\|1226 |
| candidate/list | PRI |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3078/resultRows/2 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1226/parties/2 |
| supplied share / status / unit | 135.2708711 / recorded / percent_0_100 |
| expected_original | 135.2708711 |
| raw.reported_share | 135.2708711 at M /events/3078/resultRows/2/extensions/raw/reported_share ; R /histories/1226/parties/2/reported_share |
| raw.share — not selected | 7.886829043499967 at M /events/3078/resultRows/2/extensions/raw/share ; R /histories/1226/parties/2/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sce3331aa35, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 49. event-8e777777a3b9d15105f84139-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-8e777777a3b9d15105f84139-r0 |
| office_id | MX-M-14-75 |
| event_id | event-8e777777a3b9d15105f84139 |
| history_key | MX-M-14-75\|mx_returns_AYUN_14_75_2018\|\|1232 |
| candidate/list | PANAL |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3084/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1232/parties/0 |
| supplied share / status / unit | 403.4153692 / recorded / percent_0_100 |
| expected_original | 403.4153692 |
| raw.reported_share | 403.4153692 at M /events/3084/resultRows/0/extensions/raw/reported_share ; R /histories/1232/parties/0/reported_share |
| raw.share — not selected | 28.923298523586606 at M /events/3084/resultRows/0/extensions/raw/share ; R /histories/1232/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S670d610070, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 50. event-8e777777a3b9d15105f84139-r1

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-8e777777a3b9d15105f84139-r1 |
| office_id | MX-M-14-75 |
| event_id | event-8e777777a3b9d15105f84139 |
| history_key | MX-M-14-75\|mx_returns_AYUN_14_75_2018\|\|1232 |
| candidate/list | PVEM |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3084/resultRows/1 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1232/parties/1 |
| supplied share / status / unit | 363.0336514 / recorded / percent_0_100 |
| expected_original | 363.0336514 |
| raw.reported_share | 363.0336514 at M /events/3084/resultRows/1/extensions/raw/reported_share ; R /histories/1232/parties/1/reported_share |
| raw.share — not selected | 26.02808786460209 at M /events/3084/resultRows/1/extensions/raw/share ; R /histories/1232/parties/1/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S670d610070, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 51. event-8e777777a3b9d15105f84139-r2

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-8e777777a3b9d15105f84139-r2 |
| office_id | MX-M-14-75 |
| event_id | event-8e777777a3b9d15105f84139 |
| history_key | MX-M-14-75\|mx_returns_AYUN_14_75_2018\|\|1232 |
| candidate/list | PAN_PRD_MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3084/resultRows/2 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1232/parties/2 |
| supplied share / status / unit | 288.347564 / recorded / percent_0_100 |
| expected_original | 288.347564 |
| raw.reported_share | 288.347564 at M /events/3084/resultRows/2/extensions/raw/reported_share ; R /histories/1232/parties/2/reported_share |
| raw.share — not selected | 20.673388548793664 at M /events/3084/resultRows/2/extensions/raw/share ; R /histories/1232/parties/2/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S670d610070, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 52. event-8e777777a3b9d15105f84139-r3

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-8e777777a3b9d15105f84139-r3 |
| office_id | MX-M-14-75 |
| event_id | event-8e777777a3b9d15105f84139 |
| history_key | MX-M-14-75\|mx_returns_AYUN_14_75_2018\|\|1232 |
| candidate/list | PT_MORENA_ES |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3084/resultRows/3 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1232/parties/3 |
| supplied share / status / unit | 165.2938222 / recorded / percent_0_100 |
| expected_original | 165.2938222 |
| raw.reported_share | 165.2938222 at M /events/3084/resultRows/3/extensions/raw/reported_share ; R /histories/1232/parties/3/reported_share |
| raw.share — not selected | 11.850918257111992 at M /events/3084/resultRows/3/extensions/raw/share ; R /histories/1232/parties/3/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S670d610070, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 53. event-8e777777a3b9d15105f84139-r4

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-8e777777a3b9d15105f84139-r4 |
| office_id | MX-M-14-75 |
| event_id | event-8e777777a3b9d15105f84139 |
| history_key | MX-M-14-75\|mx_returns_AYUN_14_75_2018\|\|1232 |
| candidate/list | PRI |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3084/resultRows/4 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1232/parties/4 |
| supplied share / status / unit | 134.7564038 / recorded / percent_0_100 |
| expected_original | 134.7564038 |
| raw.reported_share | 134.7564038 at M /events/3084/resultRows/4/extensions/raw/reported_share ; R /histories/1232/parties/4/reported_share |
| raw.share — not selected | 9.66150522146201 at M /events/3084/resultRows/4/extensions/raw/share ; R /histories/1232/parties/4/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S670d610070, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 54. event-7a639b48185b8b5ef8849d27-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-7a639b48185b8b5ef8849d27-r0 |
| office_id | MX-M-14-79 |
| event_id | event-7a639b48185b8b5ef8849d27 |
| history_key | MX-M-14-79\|mx_returns_AYUN_14_79_2018\|\|1237 |
| candidate/list | PAN_PRD_MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3089/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1237/parties/0 |
| supplied share / status / unit | 310.9340659 / recorded / percent_0_100 |
| expected_original | 310.9340659 |
| raw.reported_share | 310.9340659 at M /events/3089/resultRows/0/extensions/raw/reported_share ; R /histories/1237/parties/0/reported_share |
| raw.share — not selected | 40.77089337175793 at M /events/3089/resultRows/0/extensions/raw/share ; R /histories/1237/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Seb36c2cbf1, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 55. event-7a639b48185b8b5ef8849d27-r1

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-7a639b48185b8b5ef8849d27-r1 |
| office_id | MX-M-14-79 |
| event_id | event-7a639b48185b8b5ef8849d27 |
| history_key | MX-M-14-79\|mx_returns_AYUN_14_79_2018\|\|1237 |
| candidate/list | PRI |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3089/resultRows/1 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1237/parties/1 |
| supplied share / status / unit | 251.2637363 / recorded / percent_0_100 |
| expected_original | 251.2637363 |
| raw.reported_share | 251.2637363 at M /events/3089/resultRows/1/extensions/raw/reported_share ; R /histories/1237/parties/1/reported_share |
| raw.share — not selected | 32.94668587896253 at M /events/3089/resultRows/1/extensions/raw/share ; R /histories/1237/parties/1/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Seb36c2cbf1, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 56. event-7a639b48185b8b5ef8849d27-r2

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-7a639b48185b8b5ef8849d27-r2 |
| office_id | MX-M-14-79 |
| event_id | event-7a639b48185b8b5ef8849d27 |
| history_key | MX-M-14-79\|mx_returns_AYUN_14_79_2018\|\|1237 |
| candidate/list | PT_MORENA_ES |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3089/resultRows/2 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1237/parties/2 |
| supplied share / status / unit | 121.4835165 / recorded / percent_0_100 |
| expected_original | 121.4835165 |
| raw.reported_share | 121.4835165 at M /events/3089/resultRows/2/extensions/raw/reported_share ; R /histories/1237/parties/2/reported_share |
| raw.share — not selected | 15.929394812680115 at M /events/3089/resultRows/2/extensions/raw/share ; R /histories/1237/parties/2/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Seb36c2cbf1, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 57. event-215fc3e8a6326b7c02da6b1c-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-215fc3e8a6326b7c02da6b1c-r0 |
| office_id | MX-M-14-99 |
| event_id | event-215fc3e8a6326b7c02da6b1c |
| history_key | MX-M-14-99\|mx_returns_AYUN_14_99_2018\|\|1239 |
| candidate/list | PAN_PRD_MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3091/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1239/parties/0 |
| supplied share / status / unit | 578.2951584 / recorded / percent_0_100 |
| expected_original | 578.2951584 |
| raw.reported_share | 578.2951584 at M /events/3091/resultRows/0/extensions/raw/reported_share ; R /histories/1239/parties/0/reported_share |
| raw.share — not selected | 34.041668516896294 at M /events/3091/resultRows/0/extensions/raw/share ; R /histories/1239/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S7f9c7ebcf3, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 58. event-215fc3e8a6326b7c02da6b1c-r1

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-215fc3e8a6326b7c02da6b1c-r1 |
| office_id | MX-M-14-99 |
| event_id | event-215fc3e8a6326b7c02da6b1c |
| history_key | MX-M-14-99\|mx_returns_AYUN_14_99_2018\|\|1239 |
| candidate/list | PT_MORENA_ES |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3091/resultRows/1 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1239/parties/1 |
| supplied share / status / unit | 484.7277465 / recorded / percent_0_100 |
| expected_original | 484.7277465 |
| raw.reported_share | 484.7277465 at M /events/3091/resultRows/1/extensions/raw/reported_share ; R /histories/1239/parties/1/reported_share |
| raw.share — not selected | 28.533770391212553 at M /events/3091/resultRows/1/extensions/raw/share ; R /histories/1239/parties/1/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S7f9c7ebcf3, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 59. event-215fc3e8a6326b7c02da6b1c-r2

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-215fc3e8a6326b7c02da6b1c-r2 |
| office_id | MX-M-14-99 |
| event_id | event-215fc3e8a6326b7c02da6b1c |
| history_key | MX-M-14-99\|mx_returns_AYUN_14_99_2018\|\|1239 |
| candidate/list | PRI |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3091/resultRows/2 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1239/parties/2 |
| supplied share / status / unit | 331.7857633 / recorded / percent_0_100 |
| expected_original | 331.7857633 |
| raw.reported_share | 331.7857633 at M /events/3091/resultRows/2/extensions/raw/reported_share ; R /histories/1239/parties/2/reported_share |
| raw.share — not selected | 19.530754853320524 at M /events/3091/resultRows/2/extensions/raw/share ; R /histories/1239/parties/2/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S7f9c7ebcf3, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 60. event-215fc3e8a6326b7c02da6b1c-r3

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-215fc3e8a6326b7c02da6b1c-r3 |
| office_id | MX-M-14-99 |
| event_id | event-215fc3e8a6326b7c02da6b1c |
| history_key | MX-M-14-99\|mx_returns_AYUN_14_99_2018\|\|1239 |
| candidate/list | CAND_IND11 |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3091/resultRows/3 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1239/parties/3 |
| supplied share / status / unit | 120.0864079 / recorded / percent_0_100 |
| expected_original | 120.0864079 |
| raw.reported_share | 120.0864079 at M /events/3091/resultRows/3/extensions/raw/reported_share ; R /histories/1239/parties/3/reported_share |
| raw.share — not selected | 7.068953685051894 at M /events/3091/resultRows/3/extensions/raw/share ; R /histories/1239/parties/3/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S7f9c7ebcf3, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 61. event-db123f41cdcb10be7e5ad254-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-db123f41cdcb10be7e5ad254-r0 |
| office_id | MX-M-14-84 |
| event_id | event-db123f41cdcb10be7e5ad254 |
| history_key | MX-M-14-84\|mx_returns_AYUN_14_84_2018\|\|1244 |
| candidate/list | PAN_PRD_MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3096/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1244/parties/0 |
| supplied share / status / unit | 140.5196103 / recorded / percent_0_100 |
| expected_original | 140.5196103 |
| raw.reported_share | 140.5196103 at M /events/3096/resultRows/0/extensions/raw/reported_share ; R /histories/1244/parties/0/reported_share |
| raw.share — not selected | 37.76815389263773 at M /events/3096/resultRows/0/extensions/raw/share ; R /histories/1244/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S520fdeeb92, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 62. event-db123f41cdcb10be7e5ad254-r1

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-db123f41cdcb10be7e5ad254-r1 |
| office_id | MX-M-14-84 |
| event_id | event-db123f41cdcb10be7e5ad254 |
| history_key | MX-M-14-84\|mx_returns_AYUN_14_84_2018\|\|1244 |
| candidate/list | PRI |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3096/resultRows/1 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1244/parties/1 |
| supplied share / status / unit | 108.6684986 / recorded / percent_0_100 |
| expected_original | 108.6684986 |
| raw.reported_share | 108.6684986 at M /events/3096/resultRows/1/extensions/raw/reported_share ; R /histories/1244/parties/1/reported_share |
| raw.share — not selected | 29.207372343639843 at M /events/3096/resultRows/1/extensions/raw/share ; R /histories/1244/parties/1/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S520fdeeb92, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 63. event-15649ecc034999cb026fbb51-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-15649ecc034999cb026fbb51-r0 |
| office_id | MX-M-14-92 |
| event_id | event-15649ecc034999cb026fbb51 |
| history_key | MX-M-14-92\|mx_returns_AYUN_14_92_2018\|\|1252 |
| candidate/list | PAN_PRD_MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3104/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1252/parties/0 |
| supplied share / status / unit | 102.1328557 / recorded / percent_0_100 |
| expected_original | 102.1328557 |
| raw.reported_share | 102.1328557 at M /events/3104/resultRows/0/extensions/raw/reported_share ; R /histories/1252/parties/0/reported_share |
| raw.share — not selected | 41.08324055275395 at M /events/3104/resultRows/0/extensions/raw/share ; R /histories/1252/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S63d04da156, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 64. event-22322c49cf14d9e01ad14003-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-22322c49cf14d9e01ad14003-r0 |
| office_id | MX-M-14-94 |
| event_id | event-22322c49cf14d9e01ad14003 |
| history_key | MX-M-14-94\|mx_returns_AYUN_14_94_2018\|\|1254 |
| candidate/list | MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3106/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1254/parties/0 |
| supplied share / status / unit | 115.04662 / recorded / percent_0_100 |
| expected_original | 115.04662 |
| raw.reported_share | 115.04662 at M /events/3106/resultRows/0/extensions/raw/reported_share ; R /histories/1254/parties/0/reported_share |
| raw.share — not selected | 32.742893156864696 at M /events/3106/resultRows/0/extensions/raw/share ; R /histories/1254/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S0c008755f2, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 65. event-22322c49cf14d9e01ad14003-r1

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-22322c49cf14d9e01ad14003-r1 |
| office_id | MX-M-14-94 |
| event_id | event-22322c49cf14d9e01ad14003 |
| history_key | MX-M-14-94\|mx_returns_AYUN_14_94_2018\|\|1254 |
| candidate/list | PAN |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3106/resultRows/1 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1254/parties/1 |
| supplied share / status / unit | 112.7272727 / recorded / percent_0_100 |
| expected_original | 112.7272727 |
| raw.reported_share | 112.7272727 at M /events/3106/resultRows/1/extensions/raw/reported_share ; R /histories/1254/parties/1/reported_share |
| raw.share — not selected | 32.082794307891334 at M /events/3106/resultRows/1/extensions/raw/share ; R /histories/1254/parties/1/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S0c008755f2, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 66. event-7a2836aa7eac1de379d3e3e1-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-7a2836aa7eac1de379d3e3e1-r0 |
| office_id | MX-M-14-70 |
| event_id | event-7a2836aa7eac1de379d3e3e1 |
| history_key | MX-M-14-70\|mx_returns_AYUN_14_70_2018\|\|1276 |
| candidate/list | MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3128/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1276/parties/0 |
| supplied share / status / unit | 120.3323131 / recorded / percent_0_100 |
| expected_original | 120.3323131 |
| raw.reported_share | 120.3323131 at M /events/3128/resultRows/0/extensions/raw/reported_share ; R /histories/1276/parties/0/reported_share |
| raw.share — not selected | 44.617380025940335 at M /events/3128/resultRows/0/extensions/raw/share ; R /histories/1276/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--Sa69e10a2f8, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

### 67. event-0bc8c51c406c0e5f49c66b37-r0

| Field | Frozen value / draft disposition |
| --- | --- |
| result_row_id | event-0bc8c51c406c0e5f49c66b37-r0 |
| office_id | MX-M-14-124 |
| event_id | event-0bc8c51c406c0e5f49c66b37 |
| history_key | MX-M-14-124\|mx_returns_AYUN_14_124_2018\|\|1284 |
| candidate/list | MC |
| source path + pointer | M = data/research/countries/mexico.json.gz ; /events/3136/resultRows/0 |
| original source path + pointer | R = data/research/objects/e44553b2f11a9b31d142f74bc17ba906f1e3b33e2a08ba5b200acfa7c77d64b0.gz ; /histories/1284/parties/0 |
| supplied share / status / unit | 177.4911615 / recorded / percent_0_100 |
| expected_original | 177.4911615 |
| raw.reported_share | 177.4911615 at M /events/3136/resultRows/0/extensions/raw/reported_share ; R /histories/1284/parties/0/reported_share |
| raw.share — not selected | 52.45540033280446 at M /events/3136/resultRows/0/extensions/raw/share ; R /histories/1284/parties/0/share |
| available raw status / unit | Not supplied for either raw field; no status/unit inferred |
| event source IDs | mexico--S1f8d61401c, mexico--url-3635e08ffbefd711526cbeea |
| proposed decision | needs_human_review |
| replacement | None proposed; not a NULL assignment |
| future options | accepted correction with explicit replacement + evidence / withhold / needs_human_review |
| approval | Not accepted; Justin review required |

