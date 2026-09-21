# Estonia acceptance examples — DRAFT

20 documentary worked examples. Concrete source rows are real; hypothetical importer mutations are expressly labelled and **Not run**. Paths below are relative to `data/research/estonia/` unless a repo/docs path is shown. Every row carries a source hash and exact XML/HTML locator; identity vectors enumerate every target ID.

## 1. Current merged council retained

Locator: `office-register.json#/45`.

Exact 2025 code 0250; source RESULTS adminUnit XPath in origins. Do not create a mayor or collapse old codes.

Expected documentary shape:

```json
{
  "office_id": "EE-M0250-C",
  "office_name": "Jõhvi vald (ühinevad Jõhvi vald ja Toila vald) — volikogu",
  "current": true,
  "proposed_tier": "municipal"
}
```

## 2. Historical Toila survives

Locator: `office-register.json#/225`.

Retain historical office and its events. No legal successor edge or guessed abolition day.

Expected documentary shape:

```json
{
  "office_id": "EE-M0803-C",
  "current": false,
  "historical": true,
  "observed_cycles": [
    2017,
    2021
  ]
}
```

## 3. Tallinn once, not eight new offices

Locator: `office-register.json#/215`.

KOV 2025 has 78 detailed municipal files. Metadata additionally lists eight linnaosa units; these are not separate volikogu ballots.

Expected documentary shape:

```json
{
  "office_id": "EE-M0784-C",
  "tier": "municipal",
  "district_offices_created": 0
}
```

## 4. Out-of-window 2029 office remains

Locator: `office-register.json#/0/next_date`.

Expected year 2029 retained; month/day NULL, next_history_key NULL. Window only filters alerts.

Expected documentary shape:

```json
{
  "label": "2029",
  "year": 2029,
  "month": null,
  "day": null,
  "precision": "year",
  "certainty": "expected",
  "origin": {
    "input_path": "data/research/estonia/sources/www.valimised.ee/en/index.html",
    "sha256": "ec6dab53088179d2c923e811d3fd3ccf7b47fd919946e486b68b04bdbcb24606",
    "html_locator": "next EP election link",
    "source_id": "estonia--url-3d71b01fa0f5d3640b63594d"
  }
}
```

## 5. Historic year precision

Locator: `events.json#/3`.

Sourced cycle 2013; do not promote XML generated timestamp to a polling day. A future sourced date refinement leaves HK unchanged.

Expected documentary shape:

```json
{
  "history_key": "EE-M0105-C::KOV_2013",
  "event_id": "event-95a57d911a1f52355490c894",
  "research_date": {
    "label": "2013",
    "year": 2013,
    "month": null,
    "day": null,
    "precision": "year",
    "certainty": "called"
  }
}
```

## 6. Explicit day precision

Locator: `events.json#/463`.

RESULTS/electionDate=2023-03-05; certainty called is not a certification assertion.

Expected documentary shape:

```json
{
  "event_id": "event-6d5bad208a9551c351ab4161",
  "date": {
    "label": "2023-03-05",
    "year": 2023,
    "month": 3,
    "day": 5,
    "precision": "day",
    "certainty": "called"
  },
  "origin": {
    "input_path": "data/research/estonia/sources/opendata.valimised.ee/api/RK_2023/RESULTS.xml",
    "sha256": "02b8bb70d94e103aa502e218ba7cc5b056d8387cb872f55eaa0f250f24f499e0",
    "xpath": "/OutputReport/electionDate",
    "source_id": "estonia--url-12ca58eb37e8d309ed034a50"
  }
}
```

## 7. Missing seats versus zero votes

Locator: `results.json#/374`.

Explicit XML 0 becomes votes 0/zero; absent scalar seats/share stay NULL/unknown, even if elected flag is false.

Expected documentary shape:

```json
{
  "result_row_id": "result-b85bcc58cebe3adea42e28e2",
  "office_id": "EE-M0122-C",
  "votes": 0,
  "votes_status": "zero",
  "seats": null,
  "seats_status": "unknown",
  "share": null,
  "share_status": "unknown"
}
```

## 8. Nonqualifying national party candidate retained

Locator: `results.json#/47447`.

RK2019 election-result file only covers qualifying parties; full district vote file covers 1099 candidates. Missing explicit flag remains NULL, not a dropped candidate.

Expected documentary shape:

```json
{
  "result_row_id": "result-851905e7683c1340bf1a01d3",
  "candidate_or_list_label": "ANDRES HERKEL",
  "votes": 222,
  "elected_flag": null,
  "origin": {
    "input_path": "data/research/estonia/unpacked/RK2019_election_result_data/RK2019_VOTING_RESULT_IN_COUNTIES_1552053540486.xml",
    "sha256": "0f280aecbefe851e82dd277005bdb1ad8e5d8a19ad2cbeeb01e095e379d81bdf",
    "xpath": "/OutputReport/data/votingResult/districts/district[1]/votesDistributionByParties/party[1]/candidates/candidate[1]",
    "archive_path": "data/research/estonia/sources/www.valimised.ee/sites/default/files/uploads/misc/RK2019_election_result_data.zip",
    "archive_sha256": "750ba01a9efd8487d7c06a251b3ad2261d599baeaca7bf217ce254fec2f4dd29",
    "archive_member": "RK2019_VOTING_RESULT_IN_COUNTIES_1552053540486.xml",
    "source_id": "estonia--url-f27be3d2cbb5991d7310ab02"
  }
}
```

## 9. Independent candidate block retained

Locator: `results.json#/48600`.

Do not omit independentCandidates block; no invented party identity.

Expected documentary shape:

```json
{
  "candidate_source_id": "1059",
  "candidate_or_list_label": "TEHO PAULUS",
  "votes": 30,
  "original_party_label": null,
  "origin": {
    "input_path": "data/research/estonia/sources/opendata.valimised.ee/api/RK_2023/RESULTS.xml",
    "sha256": "02b8bb70d94e103aa502e218ba7cc5b056d8387cb872f55eaa0f250f24f499e0",
    "xpath": "/OutputReport/data/electionResult/votesAndMandates/independentCandidates/candidates/candidate[1]",
    "source_id": "estonia--url-12ca58eb37e8d309ed034a50"
  }
}
```

## 10. Indirect presidential vote

Locator: `events.json#/460`.

71 supplied votes for Ülle Madise are parliamentary electors, not a nationwide popular vote. No percentage inferred.

Expected documentary shape:

```json
{
  "event_id": "event-0be59d7c59d10cbeecf5f200",
  "event_kind": "indirect",
  "proceeding_id": "proceeding-22059ac88bfcce03c1c9c72f",
  "candidate": "Ülle Madise",
  "votes": 71,
  "share": null,
  "origin": {
    "input_path": "data/research/estonia/sources/www.valimised.ee/en/archive/president-republic-estonia-elections/election-president-republic-2026/index.html",
    "sha256": "cf078922e974bdce09a385792d2490b7e9b8c40c1a64310e4e57ec00877d0293",
    "html_table": 2,
    "html_row": 2,
    "source_id": "estonia--url-dd397c67c565c9120f333a0f"
  }
}
```

## 11. Six ballots, one presidential cycle

Locator: `proceedings.json entries history_key=EE-PRESIDENT::PRES_2016`.

Keep separate candidate vectors per ballot; no sum across Riigikogu/electoral-body stages. Renewed Riigikogu ballot is repeat.

Expected documentary shape:

```json
{
  "event_count": 1,
  "proceeding_count": 6,
  "last_ballot": {
    "proceeding_id": "proceeding-27053c97c40b19529b38d082",
    "event_id": "event-09b21320841577a56279e713",
    "office_id": "EE-PRESIDENT",
    "history_key": "EE-PRESIDENT::PRES_2016",
    "sequence": 6,
    "proceeding_kind": "repeat",
    "label": "Riigikogu ballot 6",
    "date_label": "2016-10-03",
    "electoral_body": "Riigikogu",
    "origin": {
      "input_path": "data/research/estonia/sources/www.valimised.ee/en/archive/president-republic-estonia-elections/election-president-republic-2016/index.html",
      "sha256": "435d027392599002441da787f7fdb10b2fce61fe0adb6e7261068d1b5117d889",
      "html_table": 12,
      "source_id": "estonia--url-7c0f4b879119bdd5a2c509bf"
    },
    "raw": {
      "round_kind_note": "Subsequent statutory ballot; not a separate ordinary election. Last 2016 ballot is renewed Riigikogu election."
    }
  }
}
```

## 12. Real 1992 popular exception

Locator: `results.json#/46512`.

Only this sourced transitional ballot uses a popular denominator; do not generalize its mechanism to today.

Expected documentary shape:

```json
{
  "candidate_or_list_label": "Arnold Rüütel",
  "votes": 195743,
  "share": 41.8,
  "proceeding_id": "proceeding-80bd9a1beb414a4be8f80a25",
  "origin": {
    "input_path": "data/research/estonia/sources/www.valimised.ee/en/archive/president-republic-estonia-elections/election-president-republic-1992/index.html",
    "sha256": "bf6707cda6b58c43cdffbcc16a22174420313357ed63973abac73c4d4ff64d0b",
    "html_locator": "national total heading + candidate Arnold Rüütel",
    "source_id": "estonia--url-7f8dd3364fdd9a8dc1f3a299"
  },
  "raw": {
    "share_denominator": "actual turnout incl invalid ballots; supplied percentage, not recomputed"
  }
}
```

## 13. Council-selected mayor is not a new ballot

Locator: `office-register.json office_type=local_government_council`.

No generic -M office generated from each council. Legal exception evidence is a named gate EE-G04.

Expected documentary shape:

```json
{
  "current_councils": 78,
  "current_direct_executive_offices": 0,
  "president_indirect_offices": 1
}
```

## 14. Honest regional empty state

Locator: `schemas/atlas/tiers/estonia.json#/counts_by_proposed_tier`.

County statistical groupings are not elected regional bodies in this research. Show 0 regional offices; no failing positive-regional requirement.

Expected documentary shape:

```json
{
  "national": 2,
  "regional": 0,
  "municipal": 278,
  "other": 1,
  "unknown": 0
}
```

## 15. Source conflict kept open

Locator: `vote-reconciliation.json cycle=KOV_2013; official2013generalinfo`.

Retain both claims; no two-vote repair, no clamping or dropped candidates. Per-municipality internal reconciliation does not erase the global mismatch.

Expected documentary shape:

```json
{
  "XML_candidate_vote_sum": 625334,
  "official_general_statistics_valid_votes": 625336,
  "difference_not_applied": 2,
  "aggregate_certified": false
}
```

## 16. Unchanged and corrected reimport fingerprints

Locator: `Estonia_Input_Inventory.json#/hash_inputs`.

Future CI mutation only: change one evidence/tier byte with accepted provenance → new fingerprint/release, stable unaffected natural-key IDs. Not an executed importer test.

Expected documentary shape:

```json
{
  "fingerprint_sha256": "f28f6134f30031e3b012d9631d69bbf548d18a0bb1e66728d5b097dc9f0ba7ce",
  "same_inputs_same_release": true,
  "new_attempt_each_time": true
}
```

## 17. Unresolved citation differs from poison FK

Locator: `results.json#/0/origin`.

Hypothetical CI mutations only. Never invent a source for a token or use unresolved_evidence to excuse a known missing source.

Expected documentary shape:

```json
{
  "resolved_source_id": "estonia--url-4aebfa368f4efb879a563f7d",
  "broken_resolved_FK": "fail staged publication",
  "unresolvable_original_token": "unresolved_evidence on real input/entity"
}
```

## 18. Incomplete refresh retains omitted office

Locator: `office-register.json#/225`.

Future omission test must preserve prior published records and emit diagnostics. It is not evidence of abolition or a successor.

Expected documentary shape:

```json
{
  "omitted_office": "EE-M0803-C",
  "delete": false,
  "prior_history_retained": true
}
```

## 19. Fixture rejection and rollback

Locator: `Prompt_AF_Full_Register_Field_Map_and_CI.md`.

Future CI injection is isolated; no fixture offices added to this pack and no importer run.

Expected documentary shape:

```json
{
  "fixture_ids_in_research": 0,
  "hypothetical_FIX_prefix": "reject",
  "last_good_publication": "continues serving",
  "failure_log": "durable sibling ledger"
}
```

## 20. Other lineages/citations untouched

Locator: `Estonia_Input_Inventory.json#/lineage_id`.

Europe/LatAm/NZ/Mexico bytes and rows are out of scope. No latest-receipt citation join.

Expected documentary shape:

```json
{
  "attempted_lineage": "country-package-estonia",
  "other_publication_members": "unchanged",
  "citation_owner": "row.lineage_id + row.release_id"
}
```
