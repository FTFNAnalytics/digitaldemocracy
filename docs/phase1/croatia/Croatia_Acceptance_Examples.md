# Croatia acceptance examples — Prompt W

Worked documentary examples from retained sources. All importer/publication execution is **Not run**. Isolated mutations below are CI inputs only, never research rows. No approvals are applied.

## 1. Separate city council and popularly elected executive

Two different evidenced ballots in Dugo Selo, no appointed cabinet office.

- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/app/dao/lokalni/lokalni-2025-dao.js` → `JavaScript literal var vrsta[52] (zero-based; no execution)`; SHA256 `b2f3314c938314c18f4e7041bd535f9b1771f03935c9487a5895a97feae9a5d8`.
- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/app/dao/lokalni/lokalni-2025-dao.js` → `JavaScript literal var vrsta[607] (zero-based; no execution)`; SHA256 `b2f3314c938314c18f4e7041bd535f9b1771f03935c9487a5895a97feae9a5d8`.

```json
{
  "office_ids": [
    "HR-G1015-C",
    "HR-G1015-E"
  ],
  "office_type": [
    "council",
    "direct_executive"
  ],
  "tier": [
    "municipal",
    "municipal"
  ]
}
```

## 2. County pair distinct from surrounding city units

Zagrebačka županija is a distinct regional jurisdiction.

- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/app/dao/lokalni/lokalni-2025-dao.js` → `JavaScript literal var vrsta[0] (zero-based; no execution)`; SHA256 `b2f3314c938314c18f4e7041bd535f9b1771f03935c9487a5895a97feae9a5d8`.
- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/app/dao/lokalni/lokalni-2025-dao.js` → `JavaScript literal var vrsta[21] (zero-based; no execution)`; SHA256 `b2f3314c938314c18f4e7041bd535f9b1771f03935c9487a5895a97feae9a5d8`.

```json
{
  "office_ids": [
    "HR-Z01-C",
    "HR-Z01-E"
  ],
  "tier": "regional"
}
```

## 3. Zagreb dual function counted once

DIP1333 aliases21. Draft tier requires Justin; no second body for county functions.

- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/app/dao/lokalni/lokalni-2025-dao.js` → `JavaScript literal var vrsta[20] (zero-based; no execution)`; SHA256 `b2f3314c938314c18f4e7041bd535f9b1771f03935c9487a5895a97feae9a5d8`.
- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/app/dao/lokalni/lokalni-2025-dao.js` → `JavaScript literal var vrsta[41] (zero-based; no execution)`; SHA256 `b2f3314c938314c18f4e7041bd535f9b1771f03935c9487a5895a97feae9a5d8`.

```json
{
  "office_ids": [
    "HR-Z21-C",
    "HR-Z21-E"
  ],
  "tier": "regional",
  "forbidden_duplicate_ids": [
    "HR-G1333-C",
    "HR-G1333-E"
  ]
}
```

## 4. Independent minority/Croat deputy

Separate electorate-specific ballot supported by source; not an extra joint-ticket candidate office.

- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/app/dao/lokalni/lokalni-2025-dao.js` → `JavaScript literal var vrsta[1220] (zero-based; no execution)`; SHA256 `b2f3314c938314c18f4e7041bd535f9b1771f03935c9487a5895a97feae9a5d8`.

```json
{
  "office_id": "HR-G0051-D-04e76abb7f14",
  "office_type": "direct_deputy",
  "office_status": "current",
  "name": "ZAMJENIK GRADONAČELNIKA / OPĆINSKOG NAČELNIKA (talijanska n.m.) — BALE - VALLE",
  "proposed_tier": "municipal"
}
```

## 5. Joint ticket deputy stays inside result raw

Ticket deputy candidates are not separate popular ballots.

- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/data/lokalni/2025/rezultati/1/r_15_01_0000_000.json` → `/lista/1`; SHA256 `0c85d4044a5aecc76c08e134c88217247d0c1fd2aa6191872373f9d13f1abb64`.

```json
{
  "office_id": "HR-Z01-E",
  "result_row_id": "result-03cc1e72c1a97b4f09180354",
  "raw_zamjenici": [
    {
      "naziv": "Kandidat za zamjenika KRUNOSLAV SOHORA"
    },
    {
      "naziv": "Kandidatkinja za zamjenicu VILDANA BOTONJIĆ"
    }
  ],
  "new_offices": 0
}
```

## 6. Historic-only deputy survives alert filtering

Source-era eligibility identity absent from2025; no invented abolition date or successor.

- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/app/dao/lokalni/lokalni-2021-dao.js` → `JavaScript literal var vrsta[2575] (zero-based; no execution)`; SHA256 `b20db6a5acbad7307e2e44a737e55f1241a85a4137a9abf875d8ca0569a979c7`.

```json
{
  "office_id": "HR-G1384-D-64f24d618ef7",
  "office_status": "historical",
  "record_state": "active",
  "successor_id": null
}
```

## 7. Runoff is proceeding within original event

Second-round return never becomes another ordinary cycle; date remains unprojected if not sourced.

- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/data/lokalni/2021/rezultati/2/r_17_05_4731_000.json` → `/`; SHA256 `023c25162d9472851ccbfde2d7f693987a67b2781082ccb16b67d0aed1b49675`.
- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/data/lokalni/2021/rezultati/1/r_17_05_4731_000.json` → `/ (aggregate return)`; SHA256 `1a8f16f1b679f6f6a0ee37e71929f2cf02e0a90f86d587cfca81f9b40b93006a`.
- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/view/lokalni/lokalni-2021.html` → `h2`; SHA256 `c8d33b676d2502f23c0a7d3052c8fd20fac6532ec95ec22babe30e7d7d9c6861`.

```json
{
  "office_id": "HR-G4731-E",
  "history_key": "HR-G4731-E::lokalni:2021",
  "event_id": "event-09ef86bf434f55d960b70840",
  "proceeding_id": "proceeding-00fedc7733b1f7ebee8832b9",
  "kind": "runoff",
  "sequence_no": 2,
  "additional_ordinary_events": 0
}
```

## 8. Source-advertised Stari Grad third round

Exact /2017/rezultati/3/r_37_17_4138_000.csv; same cycle, no guessed day.

- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/data/lokalni/2017/rezultati/3/r_37_17_4138_000.csv` → `/`; SHA256 `c68ed1fee9c00376ae9e504b2b04b2845b5912099232d4003e4ed8cfd24821f6`.

```json
{
  "office_id": "HR-G4138-E",
  "event_id": "event-6d3c02cd70c71e7e193d7e98",
  "history_key": "HR-G4138-E::lokalni:2017",
  "proceeding_id": "proceeding-7362c4486d03658e5f3b6d42",
  "sequence_no": 3
}
```

## 9. Preserve national source-year precision

This is a deliberate source-cycle year projection; do not use generation timestamp or invent Jan1.

- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/data/predsjednik/2024/rezultati/1/r_01_00_0000_000.json` → `/ (aggregate return)`; SHA256 `470ba8a330995d38b525e9c38790ab8623662e23d5098f07ffca956d10957f18`.

```json
{
  "event_id": "event-313b9cc4d1a9e704456b6881",
  "research_date": {
    "label": "2024",
    "precision": "year",
    "certainty": "called",
    "year": 2024,
    "month": null,
    "day": null
  }
}
```

## 10. Local day comes from heading, not generation time

View h2 supplies18May; return generation27June is not polling date.

- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/data/lokalni/2025/rezultati/1/r_06_01_0000_000.json` → `/ (aggregate return)`; SHA256 `78c60f4782c74d721623bd70a80cdd3f777ea0d019a4f3b61505dd168d8625d5`.
- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/view/lokalni/lokalni-2025.html` → `h2`; SHA256 `adeec70705bf4e3556dc9318b7226e41b24edc8d4814cf0c2b1daac37c6b61ae`.

```json
{
  "event_id": "event-3e0a1d0942b11d5b1118c5c4",
  "date_label": "2025-05-18",
  "precision": "day",
  "raw_generated_date": "27.06.2025."
}
```

## 11. Empty Tar-Vabriga deputy return is not zero-vote result

Source lista=[] and zeroBM preserved. Office still exists; no declaration of abolition/not-held.

- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/data/lokalni/2025/rezultati/1/r_21_18_6319_000.json` → `/ (aggregate return)`; SHA256 `70285697b02daec2a1b6e5584c1f439a399d3bcb273089abc9eb5bd9b2fdffd7`.
- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/view/lokalni/lokalni-2025.html` → `h2`; SHA256 `adeec70705bf4e3556dc9318b7226e41b24edc8d4814cf0c2b1daac37c6b61ae`.
- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/app/dao/lokalni/lokalni-2025-dao.js` → `JavaScript literal var vrsta[1225] (zero-based; no execution)`; SHA256 `b2f3314c938314c18f4e7041bd535f9b1771f03935c9487a5895a97feae9a5d8`.

```json
{
  "office_id": "HR-G6319-D-04e76abb7f14",
  "history_key": "HR-G6319-D-04e76abb7f14::lokalni:2025",
  "selected_history_role": "none",
  "typed_result_rows": 0
}
```

## 12. Unresolved Biskupija citation versus broken source FK

Future unresolved_evidence attaches to real office locator. If a resolved sourceFK is missing instead, fail closed; do not relabel corruption as research uncertainty.

- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/app/dao/lokalni/lokalni-2025-dao.js` → `JavaScript literal var vrsta[1204] (zero-based; no execution)`; SHA256 `b2f3314c938314c18f4e7041bd535f9b1771f03935c9487a5895a97feae9a5d8`.

```json
{
  "office_id": "HR-G0515-D-64f24d618ef7",
  "original_token": "MISSING-BISKUPIJA-2017",
  "missing_url": "https://www.izbori.hr/arhiva-izbora/data/lokalni/2017/rezultati/1/r_21_15_0515_000.csv",
  "fabricated_source_id": null
}
```

## 13. Known votes, unknown seats; true zero isolated test

Actual row has positive source votes; test mutation is not research. Missing seat cannot become0.

- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/data/lokalni/2025/rezultati/1/r_08_01_1015_000.json` → `/lista/3`; SHA256 `89454535c964eaeda5d74bde90553689b363b57475f16bd8c2dc32418a4b25fe`.

```json
{
  "result_row_id": "result-1a9ae434baacceb5fecbd12a",
  "votes": 564,
  "votes_status": "recorded",
  "seats": null,
  "seats_status": "unknown",
  "isolated_CI_mutation_only": {
    "votes": 0,
    "votes_status": "zero"
  }
}
```

## 14. Sabor minority multi-mark scope

Retain all claims. Do not force candidate sum to valid ballots, renormalize shares or invent another chamber.

- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/data/parlament/2024/rezultati/1/r_13_012_0000_000.json` → `/ (aggregate return)`; SHA256 `68e3a098dcfe3d5df6b0a5d105e2509807e99873bb60f1b17e92ced5e8b99323`.
- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/data/parlament/2024/rezultati/1/r_13_012_0000_000.json` → `/lista/1`; SHA256 `68e3a098dcfe3d5df6b0a5d105e2509807e99873bb60f1b17e92ced5e8b99323`.

```json
{
  "event_id": "event-3b83d6820ede0ae8c00f5cf3",
  "history_key": "HR-SABOR::parlament:2024::constituency:012:ballot:13",
  "candidate_vote_sum": 36904,
  "supplied_valid_votes": 15353,
  "ballot_basis": "unknown"
}
```

## 15. EP preference vector does not duplicate list votes

Preferences remain raw with source binding; seat allocations remain unknown.

- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/data/euparlament/2019/rezultati/1/r_14_00_0000_000.json` → `/lista/13`; SHA256 `797de57343eccb700d99c8a379b7803d4c9b3c4ad4ad9dcf1c7265936f2005d9`.

```json
{
  "result_row_id": "result-05909fa78b00d7ef4cdb3965",
  "typed_list_votes": 19313,
  "retained_preference_children": 12,
  "extra_typed_list_rows_from_children": 0
}
```

## 16. Same abbreviation does not collapse two lists

Full legacy nomination fields identify distinct lists; no accepted global party mapping.

- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/data/parlament/2003/rezultati/1/r_02_001_0000_000.csv` → `line 6; source-year field-layout contract`; SHA256 `bbc5349f8fcb57622b53ae9b466a840c47813c9dec6d14f9a6fb1f14449431fc`.
- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/data/parlament/2003/rezultati/1/r_02_001_0000_000.csv` → `line 5; source-year field-layout contract`; SHA256 `bbc5349f8fcb57622b53ae9b466a840c47813c9dec6d14f9a6fb1f14449431fc`.

```json
{
  "rows": [
    {
      "result_row_id": "result-1c3e4960bc8164a9ceb5a566",
      "identity_token": "legacy-list:3b61a1675145736ac4d1578f76401bbc455b31d46c33c881c610689068f32e8e",
      "votes": 10211
    },
    {
      "result_row_id": "result-7a7b33819ec5e013c7411f1f",
      "identity_token": "legacy-list:f3c10a26d7485da487714c763dd6dd6afcfe001b523a46a1758a3bfebe39d8d1",
      "votes": 11076
    }
  ],
  "distinct_rows": 2
}
```

## 17. Unchanged reimport fingerprint

Rehash exact Inventory hash_inputs. AttemptUUID/time excluded. This is a documentary vector, not a published release.


```json
{
  "fingerprint": "68badc579e88b5078d2dd00ff4e710acfe3727dfeaa8bf403e87fba7d02edf65",
  "candidate_release_id": "country-package-croatia--sha256-68badc579e88b5078d2dd00ff4e710acfe3727dfeaa8bf403e87fba7d02edf65",
  "new_attempt_required": true
}
```

## 18. Corrected method input gives new release without rekeying

Isolated version mutation only, not accepted method/research. Real correction requires evidence/expected-original guard and retained old claims.


```json
{
  "isolated_candidate_fingerprint": "6180e1b4ca3a245f174258a31594e34eae24670611e32dd178bd4efa9ce3a715",
  "original_event_id_preserved": "event-7e3b75edc18e36ac1dd9ddc1",
  "original_office_id_preserved": "HR-EP"
}
```

## 19. Poison FK rollback and durable failed attempt

Execution gate Not run. Durable ledger separate from discarded staging; no other lineage affected.

- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/data/lokalni/2021/rezultati/1/r_17_08_3697_000.json` → `/lista/2`; SHA256 `e67947a34eb0585ea0ba1405515879835cdab7fe135c7da359d46be37d164eff`.

```json
{
  "isolated_poison": "replace resolved source_id with nonexistent id",
  "expected": "staging rejected; ledger failed; last-good publication remains",
  "applied_changes": 0
}
```

## 20. Fixture exclusion

Fixture token exists only in this CI example, never office register or tier.

- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/app/dao/lokalni/lokalni-2025-dao.js` → `JavaScript literal var vrsta[52] (zero-based; no execution)`; SHA256 `b2f3314c938314c18f4e7041bd535f9b1771f03935c9487a5895a97feae9a5d8`.

```json
{
  "isolated_fixture_id": "fixture:HR-G1015-C",
  "expected": "reject before publication/fingerprint acceptance"
}
```

## 21. Out-of-window next date cannot remove office

2029 here is a CI mutation. Actual unknown date remainsNULL. Ordinary four-year cadence is not a called event.

- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/app/dao/lokalni/lokalni-2025-dao.js` → `JavaScript literal var vrsta[52] (zero-based; no execution)`; SHA256 `b2f3314c938314c18f4e7041bd535f9b1771f03935c9487a5895a97feae9a5d8`.

```json
{
  "office_id": "HR-G1015-C",
  "current_next_date": null,
  "isolated_out_of_window_year": 2029,
  "expected": "office/history retained; upcoming filter may exclude alert"
}
```

## 22. Unrelated release citations survive Croatia refresh

No fabricated release hashes for unrelated inputs; preserve their actual runtime members verbatim.


```json
{
  "changed_member": "country-package-croatia",
  "unchanged_members": [
    "latin-america-fe5e91689def",
    "country-package-new-zealand",
    "country-package-albania"
  ],
  "citation_owner": "each office.lineage_id/release_id"
}
```

## 23. Positive historic votes despite zero BM metadata

Legacy zeroBM counters do not erase positive historical returns. Placeholder rule requires absence of positive candidate data.

- Source: `data/research/croatia/sources/www.izbori.hr/arhiva-izbora/data/parlament/2003/rezultati/1/r_13_012_0000_000.csv` → `line 12; source-year field-layout contract`; SHA256 `6bd7bbc978ecbcf44b2725dd2d9ada96ae87e6ac93d56050955058d67a40a6c0`.

```json
{
  "result_row_id": "result-005c36dcc406426f9ffb101e",
  "votes": 2113,
  "votes_status": "recorded"
}
```

