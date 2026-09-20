# Norway acceptance examples — DRAFT

22 worked documentary examples. Source projection/identity checks are package validation; all importer/transaction/publication cases below are future isolated CI specifications, **Not run**.

## 1. Out-of-window national office retained

Exact locator: `data/research/norway/office-register.json#/386`.

```json
{
  "office_id": "NO-STORTING",
  "tier": "national_context",
  "next_election": {
    "value": "2029",
    "precision": "year",
    "certainty": "expected",
    "evidence": [
      {
        "input_path": "data/research/norway/sources/storting-mode.html",
        "sha256": "cd087782368a6d63431d52aa27c1411dc0eaa0ff481d98946725d27797b3139c",
        "json_pointer": null,
        "locator": "Every four years; 2025 result series retained"
      }
    ],
    "derivation": "Four-year ordinary cycle after the sourced 2025 election; no polling day asserted."
  },
  "office_status": "current"
}
```

Raw evidence: `data/research/norway/sources/storting-mode.html#Stortingsvalg` (SHA-256 `cd087782368a6d63431d52aa27c1411dc0eaa0ff481d98946725d27797b3139c`)

Expected 2029 is metadata with year precision; no invented day or extra event. Office and all history remain.

## 2. Oslo municipal and county functions counted once

Exact locator: `data/research/norway/office-register.json#/14`.

```json
{
  "office_id": "NO-M0301-C",
  "tier": "municipal",
  "separate_Oslo_county_offices": 0
}
```

Raw evidence: `data/research/norway/sources/klass131-codes.json#/codes/0` (SHA-256 `0e4fa638a913190179156146210d13ba328acfef630328cdf832225dace88865`); `data/research/norway/sources/municipal-mode.html#Kommunestyrevalg` (SHA-256 `b735f3fe8fd7308784dc1728dccaf3f1d002116a26c2a676aa586504e8661d17`); `data/research/norway/sources/oslo-government.html#Fylke og kommune; Bystyret` (SHA-256 `be3958b3c34d752b5f35cbe8b401ac0a0bce0ccd22014e112296c688cc5a45e9`)

County geography is not another elected body; no NO-F03-C office/event.

## 3. Sourced borough office is separate from citywide council

Exact locator: `data/research/norway/office-register.json#/371`.

```json
{
  "office_id": "NO-B030101-C",
  "tier": "other",
  "office_type": "borough_committee",
  "result_history": "not acquired"
}
```

Raw evidence: `data/research/norway/sources/klass103-codes.json#/codes/0` (SHA-256 `0cab5386a3ddc6a1be935fc27bcbed590316f9cc55a403058b79e2dc00c9c9cf`); `data/research/norway/sources/oslo-government.html#Bydelsutvalgene: 15 boroughs, each with 15 representatives elected by residents` (SHA-256 `be3958b3c34d752b5f35cbe8b401ac0a0bce0ccd22014e112296c688cc5a45e9`); `data/research/norway/sources/oslo-boroughs.html#Bydel Gamle Oslo` (SHA-256 `f7a713616c1c6f81912aec01c9a713d44efdf8f86ac936db0ee259ece86d2e99`)

The 15 directly elected borough committees are not appointed city committees; no polling-district results reused.

## 4. Longyearbyen kept without invented election return

Exact locator: `data/research/norway/office-register.json#/388`.

```json
{
  "office_id": "NO-LONGYEARBYEN-C",
  "tier": "other",
  "next_date_id": null,
  "next_date_resolution": "unknown",
  "result_rows": 0
}
```

Raw evidence: `data/research/norway/sources/longyearbyen-politics.html#Politisk organisering: elected by and among eligible Longyearbyen residents` (SHA-256 `0f1db4ebfa3f393a7118cece474cf501e19294cb8fc23eb20dfdf864c6b0eb18`)

A current party-composition page does not automatically become a certified election vector.

## 5. Historical metadata-only jurisdiction version retained

Exact locator: `data/research/norway/office-register.json#/841`.

```json
{
  "office_id": "NO-M0119u-C",
  "office_status": "historical",
  "record_state": "active",
  "successor_office_id": null
}
```

Raw evidence: `data/research/norway/sources/table01180-nb-meta.json#/variables/0/valueTexts/99` (SHA-256 `a200cda7ba530fa7078c0ed09094b2d19f79ade2810604a59b0b3996a71b8749`)

Source identifies the historical office even without an observed party-return cycle. No event or zero-vote vector is invented; absence from current register does not establish a precise abolition date or successor.

## 6. Sourced renumbering aliases one office

Exact locator: `data/research/norway/identity-crosswalk.json#/0`.

```json
{
  "upstream_id": "0101/1945",
  "office_id": "NO-M3101-C"
}
```

Raw evidence: `data/research/norway/sources/table01180-1945-data.json#/dimension/Region/category/label/0101` (SHA-256 `df1df78b4bf8413a23638dc61d7f9a38c25e3f0635abf194b0533b2f22d504ee`); `data/research/norway/sources/klass131-2020changes.json#/codeChanges/89` (SHA-256 `2fa735a6d980be48c919dd7c668a482adbfc58ed05cbc305ce8ed2caece0e902`); `data/research/norway/sources/klass131-2024changes.json#/codeChanges/6` (SHA-256 `f0b56a6cede1b63200d1903fcf4e18726adb08389aaae51ca5fcbbd761408a51`)

Only exact same-name bijective change edges qualify. A merger/split is not a renumbering alias.

## 7. 2020 reform claim remains a claim

Exact locator: `data/research/norway/reform-source-claims.json#/140`.

```json
{
  "source_claim": {
    "oldCode": "1103",
    "oldName": "Stavanger",
    "oldShortName": "",
    "newCode": "1103",
    "newName": "Stavanger",
    "newShortName": "",
    "changeOccurred": "2020-01-01"
  },
  "atlas_successor_asserted": false
}
```

Raw evidence: `data/research/norway/sources/klass131-2020changes.json#/codeChanges/62` (SHA-256 `2fa735a6d980be48c919dd7c668a482adbfc58ed05cbc305ce8ed2caece0e902`)

Retain exact official change evidence without manufacturing legal successor links.

## 8. Historical source year stays partial

Exact locator: `data/research/norway/events.json#/10750`.

```json
{
  "event_id": "event-7fa599c5c8afaa465d535fd0",
  "history_key": "NO-STORTING::1945::1945::ordinary",
  "research_date": {
    "label": "1945",
    "precision": "year",
    "certainty": "called",
    "year": 1945,
    "month": null,
    "day": null
  },
  "legal_outcome": "unknown"
}
```

Raw evidence: `data/research/norway/sources/table08092-all-data.json#/label` (SHA-256 `102ce3ca39b0f23404bf9c7ebb8c8f8c5b10d2a4c2eab1ae92f5871db722a8bd`)

No January 1 placeholder; statistical finality is not automatic certification.

## 9. Reported zero seat preserved

Exact locator: `data/research/norway/results.json#/36828`.

```json
{
  "office_id": "NO-M3105-C",
  "result_row_id": "result-d482f39de5804313ad32ad61",
  "votes": 294,
  "seats": 0,
  "seats_status": "zero"
}
```

Raw evidence: `data/research/norway/sources/table01180-1999-data.json#/value/5372` (SHA-256 `bca1da5b161ae303114e34f91400c00518f4d55c73eaa98f1be78c563a9c090c`); `data/research/norway/sources/table04813-1999-data.json#/value/2380` (SHA-256 `b80c8eb2978ee69a39da27b59195d8544c17c76193f6aed5d3a08fc3d81014fd`)

Source zero maps zero status; not NULL.

## 10. Missing seats and percentages stay missing

Exact locator: `data/research/norway/results.json#/0`.

```json
{
  "office_id": "NO-M3101-C",
  "result_row_id": "result-5de1088f20ec681e43a57a63",
  "votes": 801,
  "seats": null,
  "seats_status": "unknown",
  "share": null,
  "share_status": "unknown"
}
```

Raw evidence: `data/research/norway/sources/table01180-1945-data.json#/value/5125` (SHA-256 `df1df78b4bf8413a23638dc61d7f9a38c25e3f0635abf194b0533b2f22d504ee`)

Absent supported source join is NULL/unknown, never estimated from votes.

## 11. County reporting components do not multiply cycles

Exact locator: `data/research/norway/results.json#/58435`.

```json
{
  "office_id": "NO-F31-C",
  "history_key": "NO-F31-C::2023::2023::ordinary",
  "result_row_id": "result-222dd0b69858bc3116251478",
  "votes": 8980,
  "share": null,
  "seats": 3,
  "raw": {
    "vote_derivation": "Sum of all source municipality components for this county code/year/party; each source value including zero retained. Not a claimed certified county total.",
    "component_regions": [
      "3101",
      "3103",
      "3105",
      "3107",
      "3110",
      "3112",
      "3114",
      "3116",
      "3118",
      "3120",
      "3122",
      "3124"
    ],
    "source_county_code": "31"
  }
}
```

Raw evidence: `data/research/norway/sources/table01181-2023-data.json#/value/0` (SHA-256 `3d830b027b8fd71772a918ddaf43a091e9f924d2c7601cb9983455d6d6baf178`); `data/research/norway/sources/table01181-2023-data.json#/value/45` (SHA-256 `3d830b027b8fd71772a918ddaf43a091e9f924d2c7601cb9983455d6d6baf178`); `data/research/norway/sources/table01181-2023-data.json#/value/90` (SHA-256 `3d830b027b8fd71772a918ddaf43a091e9f924d2c7601cb9983455d6d6baf178`); `data/research/norway/sources/table01181-2023-data.json#/value/135` (SHA-256 `3d830b027b8fd71772a918ddaf43a091e9f924d2c7601cb9983455d6d6baf178`); `data/research/norway/sources/table01181-2023-data.json#/value/180` (SHA-256 `3d830b027b8fd71772a918ddaf43a091e9f924d2c7601cb9983455d6d6baf178`); `data/research/norway/sources/table01181-2023-data.json#/value/225` (SHA-256 `3d830b027b8fd71772a918ddaf43a091e9f924d2c7601cb9983455d6d6baf178`); `data/research/norway/sources/table01181-2023-data.json#/value/270` (SHA-256 `3d830b027b8fd71772a918ddaf43a091e9f924d2c7601cb9983455d6d6baf178`); `data/research/norway/sources/table01181-2023-data.json#/value/315` (SHA-256 `3d830b027b8fd71772a918ddaf43a091e9f924d2c7601cb9983455d6d6baf178`); `data/research/norway/sources/table01181-2023-data.json#/value/360` (SHA-256 `3d830b027b8fd71772a918ddaf43a091e9f924d2c7601cb9983455d6d6baf178`); `data/research/norway/sources/table01181-2023-data.json#/value/405` (SHA-256 `3d830b027b8fd71772a918ddaf43a091e9f924d2c7601cb9983455d6d6baf178`); `data/research/norway/sources/table01181-2023-data.json#/value/450` (SHA-256 `3d830b027b8fd71772a918ddaf43a091e9f924d2c7601cb9983455d6d6baf178`); `data/research/norway/sources/table01181-2023-data.json#/value/495` (SHA-256 `3d830b027b8fd71772a918ddaf43a091e9f924d2c7601cb9983455d6d6baf178`); `data/research/norway/sources/table04809-all-data.json#/value/9` (SHA-256 `48d6bf09204659e8f021051498ad02ff0eb33b9ab4fc9f3131d53b22597edbc4`)

One result per county/cycle/source category; disclosed sum of component cells, no official certified-total claim.

## 12. Sami district systems remain separate

Exact locator: `data/research/norway/events.json#/10771`.

```json
{
  "office_id": "NO-SAMEDIGGI",
  "event_id": "event-c6a5f92c24aa701997338ce0",
  "source_elected_member_sum": 43,
  "district_system": "13 non-VAL source districts",
  "tier": "other"
}
```

Raw evidence: `data/research/norway/sources/table05924-all-data.json#/label` (SHA-256 `bc747f77bb55b3a35ff135d73ed288c6592de1f4f0f495220e315f5458743a7c`)

Use 13 pre-2009 districts, not merely K-prefixed codes; 2011s, SS and Sn also belong. No constituency offices.

## 13. Sami 2025 zero-vote and positive-seat conflict preserved

Exact locator: `data/research/norway/results.json#/59022`.

```json
{
  "office_id": "NO-SAMEDIGGI",
  "history_key": "NO-SAMEDIGGI::2025::2025::ordinary",
  "result_row_id": "result-adf589962b4ccf83cae58988",
  "party_code": "98d",
  "votes": 0,
  "share": 0,
  "seats": 1,
  "evidence_status": "disputed"
}
```

Raw evidence: `data/research/norway/sources/table05924-all-data.json#/value/41` (SHA-256 `bc747f77bb55b3a35ff135d73ed288c6592de1f4f0f495220e315f5458743a7c`); `data/research/norway/sources/table05924-all-data.json#/value/47` (SHA-256 `bc747f77bb55b3a35ff135d73ed288c6592de1f4f0f495220e315f5458743a7c`); `data/research/norway/sources/table05923-all-data.json#/value/41` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/47` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/521` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/527` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/1001` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/1007` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/1481` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/1487` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/1961` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/1967` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/2441` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/2447` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/2921` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/2927` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`)

Both raw claims remain; no fabricated positive votes or party-code correction. Primary protocol review required.

## 14. Real regional calendar entry from a county body

Exact locator: `data/research/norway/office-register.json#/0`.

```json
{
  "office_id": "NO-F11-C",
  "tier": "regional",
  "next_election": {
    "value": "2027-09-13",
    "precision": "day",
    "certainty": "called",
    "evidence": [
      {
        "input_path": "data/research/norway/sources/calendar2027.html",
        "sha256": "e1c98590b5c0bf58031afd928629befa74fca5aedf9ffb3681d8cd30096d4c7e",
        "json_pointer": null,
        "locator": "Valgdagen blir 13. september 2027"
      }
    ]
  }
}
```

Raw evidence: `data/research/norway/sources/klass104-codes.json#/codes/1` (SHA-256 `e41ab1b85e79f913d5869c98bee066674d52561ffe2710a77639c94fe8e684e2`); `data/research/norway/sources/county-mode.html#Fylkestingsvalg: county council elected by residents` (SHA-256 `8397ffd17fdb5f2e48ee60723d05c40a4c2304c5043e9b145da8e94f80b908ba`)

Regional tier comes from draft classification/elected county institution, never a calendar label.

## 15. Unresolved token differs from a broken resolved FK

Exact locator: `data/research/norway/research-gaps.json#/0`.

```json
{
  "unresolved_evidence": {
    "record_key": "rec-978933f165796753142a2b9381372f30c0c744108e568d780fc30f8f044762ef",
    "original_token": "SAMI-2025-ZERO-VOTE-SEAT-98d"
  },
  "invented_source_id": null
}
```

Raw evidence: `data/research/norway/sources/table05924-all-data.json#/value/41` (SHA-256 `bc747f77bb55b3a35ff135d73ed288c6592de1f4f0f495220e315f5458743a7c`); `data/research/norway/sources/table05924-all-data.json#/value/47` (SHA-256 `bc747f77bb55b3a35ff135d73ed288c6592de1f4f0f495220e315f5458743a7c`); `data/research/norway/sources/table05923-all-data.json#/value/41` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/47` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/521` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/527` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/1001` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/1007` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/1481` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/1487` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/1961` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/1967` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/2441` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/2447` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/2921` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`); `data/research/norway/sources/table05923-all-data.json#/value/2927` (SHA-256 `14010bb216c2b0a9ada8c12a37442a2ccbc2f7c581eaad469a9f9eddc68cb3b4`)

Future CI: missing actual resolved source row fails closed; it cannot be disguised as an unresolved token.

## 16. Unchanged re-import identity

Exact locator: `docs/phase1/norway/Norway_Input_Inventory.json#/hash_inputs`.

```json
{
  "fingerprint": "d0f8b70258ef1e67c360b51c9297fe0d6efe825e9eaa74ae7c42ba7b3bbcb2bd",
  "release_id": "country-package-norway--sha256-d0f8b70258ef1e67c360b51c9297fe0d6efe825e9eaa74ae7c42ba7b3bbcb2bd",
  "attempt_id": "fresh runtime UUID each attempt"
}
```

Raw evidence: Operational scenario; exact documentary pointer above anchors the future test.

Importer execution Not run; all research IDs and release identity stay stable for unchanged effective inputs.

## 17. Incomplete refresh retains omitted office

Exact locator: `data/research/norway/office-register.json#/14`.

```json
{
  "omitted_office": "NO-M0301-C",
  "expected": "carry office/history/results/source dependencies into effective inventory"
}
```

Raw evidence: Operational scenario; exact documentary pointer above anchors the future test.

Future CI Not run; missing capture is not explicit withdrawal.

## 18. Fixture exclusion

Exact locator: `data/research/norway/office-register.json#/386`.

```json
{
  "isolated_future_CI_mutation": "fixture marker in an otherwise valid copy",
  "expected": "reject before staging publication",
  "applied_changes": 0
}
```

Raw evidence: Operational scenario; exact documentary pointer above anchors the future test.

No fixture included; execution Not run.

## 19. Poison FK rollback

Exact locator: `data/research/norway/events.json#/0`.

```json
{
  "isolated_future_CI_mutation": "replace actual office FK with nonexistent key",
  "expected": "rollback; last good publication remains; failed attempt ledger survives",
  "applied_changes": 0
}
```

Raw evidence: Operational scenario; exact documentary pointer above anchors the future test.

No poisoned research row included; SQLite/publication execution Not run.

## 20. Other lineages retain their citations

Exact locator: `docs/phase1/norway/Norway_Input_Inventory.json#/lineage_id`.

```json
{
  "attempted_lineage": "country-package-norway",
  "unmodified_lineages": [
    "latin-america-fe5e91689def",
    "country-package-new-zealand",
    "country-package-albania"
  ]
}
```

Raw evidence: Operational scenario; exact documentary pointer above anchors the future test.

Future Norway-only publication preserves unrelated release IDs, rows and source ownership; execution Not run.

## 21. No popular mayor or EP fabrication

Exact locator: `data/research/norway/office-register.json`.

```json
{
  "popular_mayor_offices": 0,
  "popular_PM_cabinet_offices": 0,
  "EP_offices": 0,
  "EP_applicability": "not applicable"
}
```

Raw evidence: `data/research/norway/sources/localgovlaw.html#§ 6-2: election of mayor and deputy mayor` (SHA-256 `88b3a3e67d58f307f5f773b14b1ea060acea1e2a1e07fda726455c1ce36adb8f`); `data/research/norway/sources/eea.html#EEA EFTA States: Iceland, Liechtenstein and Norway; relation to EU` (SHA-256 `32357e9410c6af1c62ba5296e9520636c6dab0212848d4a7995faab8d399bddd`)

Council selection/appointment is not a separate popular contest. Norway has no EP delegation.

## 22. Correction requires a new guarded release

Exact locator: `data/research/norway/results.json#/0`.

```json
{
  "isolated_future_CI_mutation": "evidenced accepted source correction, no number proposed here",
  "same_result_row_id": "result-5de1088f20ec681e43a57a63",
  "new_release_fingerprint_required": true
}
```

Raw evidence: `data/research/norway/sources/table01180-1945-data.json#/value/5125` (SHA-256 `df1df78b4bf8413a23638dc61d7f9a38c25e3f0635abf194b0533b2f22d504ee`)

Retain original claims; full namespaced expected_original guard and explicit Justin acceptance. No executable override included.
