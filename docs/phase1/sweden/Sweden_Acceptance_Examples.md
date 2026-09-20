# Sweden acceptance examples — DRAFT

20 worked/documentary examples. Package source/identity checks were performed; all importer/SQLite/filesystem mutation scenarios below are **Not run** and explicitly isolated future CI cases. No fabricated research office is inserted by an example.

## 1. Out-of-window office retained

Source locator: `data/research/sweden/office-register.json#/17`. Source bytes/hashes and raw evidence are linked through the located row.

```json
{
  "office_id": "SE-K0180-C",
  "next_date": {
    "value": "2030",
    "precision": "year",
    "certainty": "statutory",
    "evidence": [
      {
        "input_path": "data/research/sweden/sources/years.html",
        "sha256": "47e5fb640d70b8adee67179e78cfcdf98e547571b6ea40f800e00890f95640d1",
        "json_pointer": null,
        "locator": "Kommande valår, table row 2030"
      }
    ]
  },
  "office_status": "current"
}
```

2030 does not remove Stockholm from register or its histories; no prospective event added.

## 2. Gotland is one council

Source locator: `data/research/sweden/office-register.json#/90`. Source bytes/hashes and raw evidence are linked through the located row.

```json
{
  "office_id": "SE-K0980-C",
  "tier": "municipal",
  "human_review_required": true,
  "separate_RF_office_count": 0
}
```

Follow legal municipality/electoral body; combined responsibilities retained raw. Never double count RF/KF.

## 3. Historical abolished council retained

Source locator: `data/research/sweden/office-register.json#/97`. Source bytes/hashes and raw evidence are linked through the located row.

```json
{
  "office_id": "SE-K1229-C",
  "office_status": "historical",
  "record_state": "active"
}
```

SCB Region/note/2 binds Bara merger; no exact dissolution day fabricated.

## 4. Pre-merger Svedala identity

Source locator: `data/research/sweden/office-register.json#/107`. Source bytes/hashes and raw evidence are linked through the located row.

```json
{
  "office_id": "SE-K1263-PRE1976-C",
  "current_successor": "SE-K1263-C"
}
```

SCB 1263/1973 exception wins over generic code crosswalk; source explicitly names new municipality1976.

## 5. Source2018 means Falun repeat2019

Source locator: `data/research/sweden/events.json#/3648`. Source bytes/hashes and raw evidence are linked through the located row.

```json
{
  "office_id": "SE-K2080-C",
  "event_id": "event-a106bd1a4bb0d640ea2081b2",
  "history_key": "SE-K2080-C::2018::2019-04-07::repeated",
  "event_kind": "repeated",
  "date": {
    "value": "2019-04-07",
    "precision": "day",
    "certainty": "called",
    "conflicting": false
  },
  "source_cycle_year": 2018
}
```

Read /dimension/Tid/category/note/2018; no second invented ordinary 2018 vector.

## 6. Partial repeat is not an extra complete vector

Source locator: `data/research/sweden/events.json#/3246`. Source bytes/hashes and raw evidence are linked through the located row.

```json
{
  "event_id": "event-824eee1260c05556aeb963ff",
  "date": {
    "value": "2010",
    "precision": "year",
    "certainty": "called",
    "conflicting": false
  },
  "notes": [
    "Kommunfullmäktigvalet i Örebro överklagades och omval utlystes i den nordöstra valkretsen. Omvalet genomfördes den 15 maj 2011. Här inkluderas resultaten från omvalet i Örebros nordöstra valkrets 2011. För resultat från det ordinarie valet 2010, se Allmänna valen 2010, del 3 (finns tillgänglig på www.scb.se).",
    "Mixed cycle aggregate includes 2011 partial repeat; year is source cycle, not a single decisive polling day. Keep first/partial returns in source context; no second additive event vector."
  ]
}
```

Örebro 2010 includes2011 partial repeat; keep source qualification and no additive duplicate.

## 7. Repeat anchor with missing results

Source locator: `data/research/sweden/events.json#/1824`. Source bytes/hashes and raw evidence are linked through the located row.

```json
{
  "event_id": "event-24764c1f10122d43a67a8282",
  "date": {
    "value": "2015-05-10",
    "precision": "day",
    "certainty": "called",
    "conflicting": false
  },
  "typed_result_rows": 0
}
```

Båstad repeat exists without a fabricated zero-vote result; ordinary 2014 role remains other.

## 8. Reported zero seat is not missing

Source locator: `data/research/sweden/results.json#/2`. Source bytes/hashes and raw evidence are linked through the located row.

```json
{
  "result_row_id": "result-61c0af9eaf31a241233ebc7d",
  "votes": 73284,
  "votes_status": "recorded",
  "seats": 0,
  "seats_status": "zero"
}
```

Exact source zero stays integer 0/zero.

## 9. Unreported seats stay NULL

Source locator: `data/research/sweden/results.json#/40958`. Source bytes/hashes and raw evidence are linked through the located row.

```json
{
  "result_row_id": "result-0a0fb98ee69be337c9b91063",
  "seats": null,
  "seats_status": "unknown",
  "share": 2.62,
  "share_status": "recorded"
}
```

Archive vote table lacks seats; do not infer from vote share.

## 10. Hypothetical seats retained as disputed evidence

Source locator: `data/research/sweden/results.json#/18873`. Source bytes/hashes and raw evidence are linked through the located row.

```json
{
  "result_row_id": "result-16f393e8c3a19511285b6d41",
  "seats": null,
  "seats_status": "unknown",
  "evidence_status": "disputed",
  "raw": {
    "identity_token": [
      "SCB",
      "K",
      "ÖVRIGA"
    ],
    "vote_table": "ME0104T1",
    "seat_table": "Kfmandat",
    "source_region": "1439",
    "source_year": "1973",
    "source_party": "ÖVRIGA",
    "scope_note": "SCB category labels may use modern party names. ÖVRIGA is a statistical group; do not interpret as a single party or sum overlapping seat-only historic party categories.",
    "withheld_source_seats": 2,
    "withhold_reason": "SCB hypothetical double-election-adjusted seat allocation, not actual installed mandate count."
  }
}
```

SCB 1973 Färgelanda explanatory note prevents presenting adjusted allocation as installed seats.

## 11. Annulled Sami original survives

Source locator: `data/research/sweden/events.json#/4949`. Source bytes/hashes and raw evidence are linked through the located row.

```json
{
  "event_id": "event-fc4e090f4d00b8bb6e98e09c",
  "date": {
    "value": "2025-05-18",
    "precision": "day",
    "certainty": "called",
    "conflicting": false
  },
  "legal_outcome": "annulled",
  "selected_history_role": "other"
}
```

Annulled May contest is other, never resurrected as selected history; October repeat separately retained.

## 12. Partial date remains year precision

Source locator: `data/research/sweden/events.json#/6`. Source bytes/hashes and raw evidence are linked through the located row.

```json
{
  "event_id": "event-629178011a4dd64a81c79719",
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

No January1 or guessed polling day. Next2029 metadata does not filter this history.

## 13. Incomplete live count is preliminary

Source locator: `data/research/sweden/events.json#/22`. Source bytes/hashes and raw evidence are linked through the located row.

```json
{
  "event_id": "event-a2285d25847c481d4fc5fbfe",
  "legal_outcome": "preliminary",
  "selected_history_role": "none",
  "reporting": {
    "counted_districts": 29,
    "expected_districts": 29,
    "source_counting_stage": "preliminär",
    "has_mandate_allocation": true
  }
}
```

Endpoint counting stage alone does not establish completion. Result claims retain preliminary status.

## 14. Appointed/council-selected executive excluded

Source locator: `data/research/sweden/sources/kommunallag.html — 3kap3–4§;4kap;6kap`. Source bytes/hashes and raw evidence are linked through the located row.

```json
{
  "popular_kommunalrad_offices": 0,
  "popular_PM_cabinet_events": 0
}
```

No popular executive mandate invented from political prominence or a chair title.

## 15. Unresolved evidence differs from broken FK

Source locator: `data/research/sweden/research-gaps.json#/0`. Source bytes/hashes and raw evidence are linked through the located row.

```json
{
  "unresolved_evidence": {
    "original_token": "SE-HISTORICAL-BOUNDARIES",
    "record_key": "rec-70de9f041a20a57305e8755889a1411a87108238a64b114dc2cae31b63c7e366"
  },
  "source_fk": null
}
```

A named unresolved research token stays explicit. Isolated CI mutation: delete an actually resolved S row referenced by evidence_link; future importer must fail/rollback, not downgrade to unresolved.

## 16. Unchanged re-import fingerprint

Source locator: `Sweden_Input_Inventory.json#/hash_inputs`. Source bytes/hashes and raw evidence are linked through the located row.

```json
{
  "fingerprint_sha256": "75a2d2db6d1d889c9181d271d59d88d395048914590a50734cb77aed7c588a75",
  "release_id": "country-package-sweden--sha256-75a2d2db6d1d889c9181d271d59d88d395048914590a50734cb77aed7c588a75",
  "attempt_id": "fresh runtime UUID on each attempt"
}
```

Future CI only: two unchanged attempts same release; no random event/result IDs. No attempt authored by this pack.

## 17. Poison rollback preserves other lineages

Source locator: `data/research/sweden/events.json#/0`. Source bytes/hashes and raw evidence are linked through the located row.

```json
{
  "mutation": "isolated CI copy replaces office_id with a nonexistent key",
  "expected": "transaction rejected, last publication still served",
  "applied_here": 0
}
```

No poisoned research file is distributed; future SQLite/publication execution Not run.

## 18. Incomplete refresh keeps omitted office

Source locator: `data/research/sweden/office-register.json#/17`. Source bytes/hashes and raw evidence are linked through the located row.

```json
{
  "omitted_on_future_refresh": "SE-K0180-C",
  "expected": "retain office, histories and source dependencies until explicit accepted withdrawal"
}
```

An incomplete source capture is not deletion evidence; effective fingerprint carries retained dependencies.

## 19. Fixture rejection

Source locator: `data/research/sweden/sources/rd2026.json#/test`. Source bytes/hashes and raw evidence are linked through the located row.

```json
{
  "observed": false,
  "isolated_test_mutation": true,
  "expected": "reject fixture input before publication"
}
```

Fixture/name/test checks apply to all inputs. No fixture result loaded in this task.

## 20. Other lineage citations remain stable

Source locator: `Sweden_Input_Inventory.json#/lineage_id`. Source bytes/hashes and raw evidence are linked through the located row.

```json
{
  "attempted_lineage": "country-package-sweden",
  "unchanged_members": [
    "latin-america-fe5e91689def",
    "country-package-new-zealand",
    "country-package-albania"
  ]
}
```

Future Sweden-only import preserves other release IDs, rows and source FKs; cite each own publication member.
