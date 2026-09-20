# Finland acceptance examples — DRAFT

20 documentary examples. Source extraction and identity checks are package checks; every importer/transaction/publication mutation below is an isolated future CI specification, **Not run**.

## 1. Out-of-window Helsinki council retained

Exact locator: `data/research/finland/office-register.json#/70`.

```json
{
  "office_id": "FI-M091-C",
  "tier": "municipal",
  "next_date": {
    "value": "2029-04-15",
    "precision": "day",
    "certainty": "statutory",
    "evidence": [
      {
        "input_path": "data/research/finland/sources/calendar.html",
        "sha256": "c108e0fbec18df99a3a8ff5c74a1234c4db0a0c61629e63942003ccc75f13c74",
        "json_pointer": null,
        "locator": "2029: County elections and municipal elections 15.4.2029"
      }
    ]
  },
  "office_status": "current"
}
```

Raw evidence: `data/research/finland/sources/municipalities2026.json#/33` (SHA-256 `a222c902740e35ac223ee7240cf5c99a240f86d56325f1cfaefe2d36acbeed2e`); `data/research/finland/sources/municipal-rules.html#Municipal councils: 292 continental and 16 Åland municipalities` (SHA-256 `6bdb3064a2b8ec1514ee5655dbb12f77ebdcf5a6e3b4f17cc18ed6790ec32bf9`); `data/research/finland/sources/county-rules.html#The City of Helsinki is not a wellbeing services county` (SHA-256 `8df9f5808270cd95a4403afc73658ad5458edc9bdb0ed93b96493783e6fafb48`)

2029 next date never removes current office or histories.

## 2. Combined responsibilities do not duplicate a ballot

Exact locator: `data/research/finland/office-register.json#/70`.

```json
{
  "municipal_office_count": 1,
  "Helsinki_county_office_count": 0
}
```

Raw evidence: `data/research/finland/sources/municipalities2026.json#/33` (SHA-256 `a222c902740e35ac223ee7240cf5c99a240f86d56325f1cfaefe2d36acbeed2e`); `data/research/finland/sources/municipal-rules.html#Municipal councils: 292 continental and 16 Åland municipalities` (SHA-256 `6bdb3064a2b8ec1514ee5655dbb12f77ebdcf5a6e3b4f17cc18ed6790ec32bf9`); `data/research/finland/sources/county-rules.html#The City of Helsinki is not a wellbeing services county` (SHA-256 `8df9f5808270cd95a4403afc73658ad5458edc9bdb0ed93b96493783e6fafb48`)

Follow ministry exception; no duplicate regional office.

## 3. Historical abolished council retained

Exact locator: `data/research/finland/office-register.json#/24`.

```json
{
  "office_id": "FI-M004-C",
  "office_status": "historical",
  "record_state": "active",
  "successor_office_id": null
}
```

Raw evidence: `data/research/finland/sources/kvaa-1976-data.json#/value/23544` (SHA-256 `a4bfd4f36b9bc6e8704240a8f69fc7bb9fe0d67b6c8369ab548bff6133983b2e`); `data/research/finland/sources/kvaa-1976-data.json#/dimension/kunta_128_20250101/category/label/102004` (SHA-256 `a4bfd4f36b9bc6e8704240a8f69fc7bb9fe0d67b6c8369ab548bff6133983b2e`)

Absence from 2026 register is not a guessed successor or precise abolition day.

## 4. 2022 county election is not a 2023 election

Exact locator: `data/research/finland/events.json#/1923`.

```json
{
  "event_id": "event-5e6e06781e22744e1a58992e",
  "history_key": "FI-HVA20-C::2022::2022::ordinary",
  "date": {
    "value": "2022",
    "precision": "year",
    "certainty": "called"
  },
  "tier": "regional"
}
```

Raw evidence: `data/research/finland/sources/alvaa-14y4-data.json#/value/38` (SHA-256 `5397d82ccda591cf7470bc1fa2ae7a10ca706bcbe8575958dbf46494fc1c8d83`)

Services transition does not create another contest or predecessor identity.

## 5. Åland seat-only history stays

Exact locator: `data/research/finland/results.json#/12149`.

```json
{
  "office_id": "FI-M035-C",
  "result_row_id": "result-53e5819d5429236bfe2f3534",
  "votes": null,
  "votes_status": "unknown",
  "seats": 11,
  "seats_status": "recorded"
}
```

Raw evidence: `data/research/finland/sources/asub-VA006-data.json#/value/215` (SHA-256 `ca6fc255079a628e2ee9e4edb7855b034794ec4118df99dadd6dd7cacf2131e5`)

1991 seat history remains even without vote table; no zero votes invented.

## 6. Åland actual cycle year, no shifted mainland duplicate

Exact locator: `data/research/finland/events.json#/1477`.

```json
{
  "office_id": "FI-AX-LAGTING",
  "date": {
    "value": "2023",
    "precision": "year",
    "certainty": "called"
  },
  "tier": "regional"
}
```

Raw evidence: `data/research/finland/sources/asub-VA007-data.json#/value/121` (SHA-256 `5aa83b5e422f1f6b88507178de80a26f7c4c782f66bf20ee92ca5294b0356ac9`); `data/research/finland/sources/asub-VA012-data.json#/value/187` (SHA-256 `ec573ee3b82b623b1dfa7e17ce32f6ea789535aa04325e4ebd8bbf9c78b26a8b`)

Use ÅSUB cycle; ignore overlapping mainland shifted-year series for normalized Åland history.

## 7. Reported zero seat stays zero

Exact locator: `data/research/finland/results.json#/10`.

```json
{
  "result_row_id": "result-000e727b9719a724b67b828c",
  "votes": 163,
  "votes_status": "recorded",
  "seats": 0,
  "seats_status": "zero"
}
```

Raw evidence: `data/research/finland/sources/alvaa-14y4-data.json#/value/1366` (SHA-256 `5397d82ccda591cf7470bc1fa2ae7a10ca706bcbe8575958dbf46494fc1c8d83`); `data/research/finland/sources/alvaa-14y4-data.json#/value/1367` (SHA-256 `5397d82ccda591cf7470bc1fa2ae7a10ca706bcbe8575958dbf46494fc1c8d83`); `data/research/finland/sources/alvaa-153i-data.json#/value/1432` (SHA-256 `6e1fbac715f4863820df0270cb5766db69f0028ee91c7ff6ccb02219efae456e`)

Source zero is not missing.

## 8. Missing votes stay NULL

Exact locator: `data/research/finland/results.json#/714`.

```json
{
  "result_row_id": "result-050e95b0379c60ebc0a8c3ea",
  "votes": null,
  "votes_status": "unknown",
  "seats": 6
}
```

Raw evidence: `data/research/finland/sources/asub-VA006-data.json#/value/217` (SHA-256 `ca6fc255079a628e2ee9e4edb7855b034794ec4118df99dadd6dd7cacf2131e5`)

Positive seats do not authorize inferred vote totals.

## 9. Partial historical date keeps year precision

Exact locator: `data/research/finland/events.json#/4489`.

```json
{
  "event_id": "event-dc3b3d132a17466e4d3966ee",
  "research_date": {
    "label": "1983",
    "precision": "year",
    "certainty": "called",
    "year": 1983,
    "month": null,
    "day": null
  }
}
```

Raw evidence: `data/research/finland/sources/evaa-13sw-data.json#/value/0` (SHA-256 `84937f0a8a33fa6813ec72c1166dd29f0885895d85b11158b3f99375aec3d368`)

No January 1 placeholder or guessed polling day.

## 10. Presidential rounds form one cycle

Exact locator: `data/research/finland/events.json#/1339`.

```json
{
  "event_count": 1,
  "proceedings": [
    {
      "proceeding_id": "proceeding-ffc7d7d7db7b7aec348f5a22",
      "kind": "first_round",
      "sequence_no": 1
    },
    {
      "proceeding_id": "proceeding-b29c9ea03621a332cbf5fade",
      "kind": "runoff",
      "sequence_no": 2
    }
  ]
}
```

Raw evidence: `data/research/finland/sources/pvaa-14db-data.json#/value/912` (SHA-256 `5791328c3c3a713f176c516b3f13056da7527783e406bae01f563b69da52a9b8`)

Do not sum rounds or create two ordinary histories. Totals 98/99 are not candidates.

## 11. No invented 2018 runoff

Exact locator: `data/research/finland/events.json#/3601`.

```json
{
  "proceeding_count": 1
}
```

Raw evidence: `data/research/finland/sources/pvaa-14db-data.json#/value/664` (SHA-256 `5791328c3c3a713f176c516b3f13056da7527783e406bae01f563b69da52a9b8`)

Only positively observed first-round candidate values create a proceeding.

## 12. EP delegation and raw candidate detail do not duplicate results

Exact locator: `data/research/finland/events.json#/4932`.

```json
{
  "office_id": "FI-EP",
  "tier": "other",
  "candidate_detail_normalization": "deferred",
  "next_date": "2029-06-10"
}
```

Raw evidence: `data/research/finland/sources/euvaa-14gv-data.json#/value/408` (SHA-256 `c22ea21dd204ab3759bcdcc3b13d2d7ea101d943047a5d2aef92642de298ca5a`)

14gv party vector once; 14h8 retained-only. No derived complete seat total.

## 13. Unresolved token differs from broken resolved source

Exact locator: `data/research/finland/research-gaps.json#/0`.

```json
{
  "unresolved_evidence": {
    "record_key": "rec-fe25faeca21109343d1db9279e2e83d6755fcb3ebb4945fc35d06341eaa8ec6a",
    "original_token": "FI-HISTORIC-MERGERS"
  },
  "invented_source_id": null
}
```

Raw evidence: `data/research/finland/sources/kvaa-14z7-meta.json#/title` (SHA-256 `0f65cda16a3cd856cb7c8ea457edae2df7f231c2da02dd41c431aad6924d9478`); `data/research/finland/sources/municipalities2026.json#/0/classification` (SHA-256 `a222c902740e35ac223ee7240cf5c99a240f86d56325f1cfaefe2d36acbeed2e`)

Future CI mutation deleting an actual resolved source FK must fail closed, not be downgraded to a research gap.

## 14. Unchanged re-import fingerprint

Exact locator: `docs/phase1/finland/Finland_Input_Inventory.json#/hash_inputs`.

```json
{
  "fingerprint": "f4b424e47bb6101959d9a2ae4e1e15f91b7200d4a5554e0e8a3a4e86fe527d5a",
  "release_id": "country-package-finland--sha256-f4b424e47bb6101959d9a2ae4e1e15f91b7200d4a5554e0e8a3a4e86fe527d5a",
  "attempt_id": "fresh runtime UUID each attempt"
}
```

Raw evidence: Operational scenario; source-row pointer above anchors the isolated test.

Future execution Not run: unchanged effective inputs retain release and every documentary ID.

## 15. Incomplete refresh retains omitted office

Exact locator: `data/research/finland/office-register.json#/43`.

```json
{
  "omitted_office": "FI-M049-C",
  "expected": "retain office/history/evidence dependencies in effective inputs"
}
```

Raw evidence: Operational scenario; source-row pointer above anchors the isolated test.

Future execution Not run. An incomplete capture is not explicit withdrawal.

## 16. Fixture exclusion

Exact locator: `data/research/finland/office-register.json#/70`.

```json
{
  "isolated_CI_mutation": "fixture marker or FIX-/FXT- identifier in a copy",
  "expected": "reject before publication",
  "applied_changes": 0
}
```

Raw evidence: Operational scenario; source-row pointer above anchors the isolated test.

No fixture row is distributed; future importer gate Not run.

## 17. Poison FK rollback

Exact locator: `data/research/finland/events.json#/0`.

```json
{
  "isolated_CI_mutation": "replace event office FK with a nonexistent key",
  "expected": "rollback; last good publication served; failed attempt durable",
  "applied_changes": 0
}
```

Raw evidence: Operational scenario; source-row pointer above anchors the isolated test.

Future SQLite/filesystem execution Not run; no poison row authored.

## 18. Other lineages retain their own citations

Exact locator: `docs/phase1/finland/Finland_Input_Inventory.json#/lineage_id`.

```json
{
  "attempted_lineage": "country-package-finland",
  "unmodified_lineages": [
    "latin-america-fe5e91689def",
    "country-package-new-zealand",
    "country-package-albania"
  ]
}
```

Raw evidence: Operational scenario; source-row pointer above anchors the isolated test.

Future Finland-only import preserves unrelated release IDs, rows and evidence FKs.

## 19. Appointed executives are not popular contests

Exact locator: `data/research/finland/office-register.json`.

```json
{
  "popular_mayor_manager_offices": 0,
  "popular_PM_cabinet_offices": 0,
  "elected_presidency_offices": 1
}
```

Raw evidence: Operational scenario; source-row pointer above anchors the isolated test.

Do not derive an electoral office from an appointed title. The evidenced presidency is separately included.

## 20. Conflicting claim is retained, not silently selected

Exact locator: `data/research/finland/results.json#/0`.

```json
{
  "isolated_CI_mutation": "a competing unsourced scalar claim",
  "expected": "retain both claims; withhold resolved value pending accepted override"
}
```

Raw evidence: `data/research/finland/sources/kvaa-2025-data.json#/value/11452` (SHA-256 `409538d1ccd5454b46565f89c6f2c3acce0b77979c8fb35bb94e9bbca855cd46`); `data/research/finland/sources/kvaa-2025-data.json#/value/11453` (SHA-256 `409538d1ccd5454b46565f89c6f2c3acce0b77979c8fb35bb94e9bbca855cd46`); `data/research/finland/sources/kvaa-152l-data.json#/value/57332` (SHA-256 `a2e4b0fceaa180cb345804a4cd5176c09e42e820beffaea8d8b6211ee12e040f`)

No numeric alternative or override is invented in this pack. Future CI Not run.
