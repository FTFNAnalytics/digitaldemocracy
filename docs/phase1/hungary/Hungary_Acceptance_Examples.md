# Hungary acceptance examples — documentary expectations

All real examples point to exact normalized rows and their retained primary /origins. Mutations explicitly labelled hypothetical are CI specifications, not collected research. No importer/SQLite/publication test was run.


## 1. Out-of-window or unknown next cycle retains office

Source: `data/research/hungary/office-register.json#/0`.

```json
{
  "office_id": "HU-NVI-01-001-C",
  "office_status": "current",
  "next_date_id": null,
  "next_date_resolution": "unknown",
  "next_history_key": null
}
```

No date/window predicate removes this sourced body. No 2029 day is inferred from term arithmetic. Origins identify NVI register ZIP line and statute.


## 2. Historic contest retained outside alert window

Source: `data/research/hungary/results.json#/49374`.

```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "HU-NVI-01-001-M",
  "history_key": "HU-NVI-01-001-M::ONK2014",
  "result_row_id": "result-afabde3ac760e8d44bb46723",
  "candidate_or_list_label": "Remenyik Ildikó",
  "votes": 802,
  "votes_status": "recorded",
  "share": 7.53,
  "share_status": "recorded",
  "seats": null,
  "seats_status": "unknown",
  "elected_flag": null,
  "original_party_label": "MSZP",
  "evidence_status": "recorded"
}
```

2014 history stays attached to its actual office; old contest does not mark the office historical. Historical-only offices have a separate unresolved earlier-register gate. Exact primary cell locators: same row /origins; component=mayor.


## 3. Council and popular mayor are two evidenced offices

Source: `data/research/hungary/office-register.json#/1`.

```json
{
  "office_id": "HU-NVI-01-001-M",
  "office_type": "direct_mayor",
  "tier": "municipal",
  "council_id": "HU-NVI-01-001-C"
}
```

Act L 2010 §12 and NVI candidate-return sheet evidence direct election. Do not use this pattern for county chairs.


## 4. County is regional; no direct county chair

Source: `data/research/hungary/office-register.json#/6354`.

```json
{
  "office_id": "HU-NVI-02-A",
  "tier": "regional",
  "direct_county_chair_rows": 0
}
```

Act CLXXXIX 2011 §27(2) assembly elects chair. No additional direct office/ballot invented.


## 5. Budapest dual remit counted once

Source: `data/research/hungary/office-register.json#/6373`.

```json
{
  "office_id": "HU-BUDAPEST-A",
  "tier": "regional",
  "review_status": "needs_review"
}
```

One citywide assembly; 23 district councils are separately evidenced. Justin tier box unchecked.


## 6. Presidency is indirect; missing votes not zero

Source: `data/research/hungary/results.json#/47807`.

```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "HU-PRES",
  "history_key": "HU-PRES::PRES2024",
  "result_row_id": "result-305032a25ea60752ef0338b1",
  "candidate_or_list_label": "dr. Sulyok Tamás",
  "votes": null,
  "votes_status": "unknown",
  "share": null,
  "share_status": "unknown",
  "seats": null,
  "seats_status": "unknown",
  "elected_flag": 1,
  "original_party_label": null,
  "evidence_status": "recorded"
}
```

NJT 3/2024 resolution paragraph 1/adoption footnote supplies election outcome/date. Vote totals, opponents and rounds absent: keep NULL; no popular first-preference universe. Exact primary cell locators: same row /origins; component=election_resolution.


## 7. Reported zero vs absent seats

Source: `data/research/hungary/results.json#/1537`.

```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "HU-NVI-03-116-C",
  "history_key": "HU-NVI-03-116-C::ONK2024",
  "result_row_id": "result-93526f13c71caae38e587963",
  "candidate_or_list_label": "SIMON SÁNDOR RÓBERTNÉ",
  "votes": 0,
  "votes_status": "zero",
  "share": null,
  "share_status": "unknown",
  "seats": null,
  "seats_status": "unknown",
  "elected_flag": null,
  "original_party_label": "Független jelölt",
  "evidence_status": "recorded"
}
```

Retain numeric 0/statuszero; seats NULL/statusunknown. Padded columns without named candidates are not rows. Exact primary cell locators: same row /origins; component=council_multi_candidate.


## 8. Printed percentage retained without recomputation

Source: `data/research/hungary/results.json#/49374`.

```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "HU-NVI-01-001-M",
  "history_key": "HU-NVI-01-001-M::ONK2014",
  "result_row_id": "result-afabde3ac760e8d44bb46723",
  "candidate_or_list_label": "Remenyik Ildikó",
  "votes": 802,
  "votes_status": "recorded",
  "share": 7.53,
  "share_status": "recorded",
  "seats": null,
  "seats_status": "unknown",
  "elected_flag": null,
  "original_party_label": "MSZP",
  "evidence_status": "recorded"
}
```

Preserve printed percent_0_100 value; no 100×votes/denominator replacement or renormalization. Exact primary cell locators: same row /origins; component=mayor.


## 9. National list votes are not compensation totals

Source: `data/research/hungary/results.json#/48472`.

```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "HU-OGY",
  "history_key": "HU-OGY::OGY2022",
  "result_row_id": "result-eae5bc53704e59264deecf31",
  "candidate_or_list_label": "FIDESZ - MAGYAR POLGÁRI SZÖVETSÉG-KERESZTÉNYDEMOKRATA NÉPPÁRT",
  "votes": 3060706,
  "votes_status": "recorded",
  "share": null,
  "share_status": "unknown",
  "seats": 48,
  "seats_status": "recorded",
  "elected_flag": null,
  "original_party_label": "FIDESZ - MAGYAR POLGÁRI SZÖVETSÉG-KERESZTÉNYDEMOKRATA NÉPPÁRT",
  "evidence_status": "recorded"
}
```

PÁRT_LISTA_SZAVAZAT is votes; TÖREDÉK/ÖSSZES_SZAVAZAT remain raw. NYERT_MANDÁTUM is list seats only, not all chamber seats. Exact primary cell locators: same row /origins; component=national_party_list.


## 10. EP domestic subset does not become national total

Source: `data/research/hungary/results.json#/49154`.

```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "HU-EP",
  "history_key": "HU-EP::EP2024",
  "result_row_id": "result-78d547e2d748e1e81ad3a68b",
  "candidate_or_list_label": "Megoldás Mozgalom",
  "votes": 5070,
  "votes_status": "recorded",
  "share": null,
  "share_status": "unknown",
  "seats": null,
  "seats_status": "unknown",
  "elected_flag": null,
  "original_party_label": "Megoldás Mozgalom",
  "evidence_status": "recorded"
}
```

Only named domestic county scope; overseas and certified nationwide allocation remain open. Do not duplicate 20 subsets as 20 offices. Exact primary cell locators: same row /origins; component=domestic_county_subset:BUDAPEST.


## 11. Missing party label is not inferred

Source: `data/research/hungary/results.json#/48490`.

```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "HU-OGY",
  "history_key": "HU-OGY::OGY2026",
  "result_row_id": "result-6bf701653cd5d20c9aba38c5",
  "candidate_or_list_label": "VARGA TAMÁS",
  "votes": 2475,
  "votes_status": "recorded",
  "share": null,
  "share_status": "unknown",
  "seats": null,
  "seats_status": "unknown",
  "elected_flag": null,
  "original_party_label": null,
  "evidence_status": "recorded"
}
```

OEVK export candidate name/ordinal/votes retained. Do not infer party from politician identity; party mapping remains NULL. Exact primary cell locators: same row /origins; component=oevk: 02-01.


## 12. Precinct returns aggregate only inside one component

Source: `data/research/hungary/results.json#/1598`.

```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "HU-NVI-03-004-C",
  "history_key": "HU-NVI-03-004-C::ONK2024",
  "result_row_id": "result-fe8cdc9efa84ec2b4e1f36b4",
  "candidate_or_list_label": "KISS RUBEN MIHÁLY",
  "votes": 502,
  "votes_status": "recorded",
  "share": null,
  "share_status": "unknown",
  "seats": null,
  "seats_status": "unknown",
  "elected_flag": null,
  "original_party_label": "MARÉG-Magyarországi Régiókért Egyesület",
  "evidence_status": "recorded"
}
```

Sum only rows listed in vote origin. Other wards/list allocations are different components; valid ballots are not the sum of multi-candidate marks. Exact primary cell locators: same row /origins; component=council_ward: 01.


## 13. Unchanged re-import identity

Source: `docs/phase1/hungary/Hungary_Input_Inventory.json#/hash_inputs`.

```json
{
  "fingerprint_sha256": "2cb9841dd136b34e21ac1a1373713920cbbd82a60246c55832f9e8e481987ecc",
  "release_id": "country-package-hungary--sha256-2cb9841dd136b34e21ac1a1373713920cbbd82a60246c55832f9e8e481987ecc",
  "new_attempt_id": "runtime fresh UUID"
}
```

Documentary hash vector verified; actual importer/ledger CI Not run. Attempt fields never enter fingerprint.


## 14. Corrected import without identity loss

Source: `same inventory + explicitly isolated CI mutation`.

```json
{
  "same_office_event_result_ids": true,
  "new_release_id_required": true,
  "production_override_applied": false
}
```

Synthetic test: replace a retained vote claim only with accepted full-target guarded override and new input hash. Not a claim that any Hungary return is wrong; no override emitted.


## 15. Unresolved token versus broken resolved FK

Source: `data/research/hungary/unresolved-evidence.json#/0`.

```json
{
  "unresolved_token_retained": true,
  "fabricated_source_fk": false,
  "broken_resolved_fk": "reject whole stage"
}
```

CAPTCHA transcript access is explicit unresolved evidence; separately resolved NJT outcome remains. An absent claimed resolved source cannot be relabelled unresolved to pass.


## 16. Poison rollback preserves other lineages

Source: `isolated future CI mutation of a real result source tuple`.

```json
{
  "staging_commit": false,
  "last_good_publication_serves": true,
  "durable_failed_attempt": true
}
```

Future importer test, Not run. Break one resolved source FK; Hungary stage rejects and unrelated lineage rows/releases remain unchanged.


## 17. Incomplete refresh cannot delete an office

Source: `data/research/hungary/office-register.json#/0`.

```json
{
  "retain_omitted_office": true,
  "effective_input_manifest": "cumulative prior+new accepted inputs"
}
```

Synthetic future omission test. No legal abolition/successor edge is inferred; lineage release reflects inherited provenance.


## 18. Fixture exclusion

Source: `isolated future CI mutation of an office_id to FIX-HU-TEST`.

```json
{
  "publication": "reject",
  "research_rows_changed": 0
}
```

No fixture office in factual arrays. Prefix matching case-insensitive FIX-/FXT-; test artifacts cannot enter hash-effective research as offices.


## 19. Partial date precision remains partial

Source: `isolated future CI replacement of a day claim with source-supported year-only claim`.

```json
{
  "precision": "year",
  "year": 2029,
  "month": null,
  "day": null,
  "certainty": "expected"
}
```

Hypothetical precision gate, not a sourced Hungary 2029 call. Require actual source before acceptance; never synthesize January 1. Execution Not run.


## 20. Malformed duplicate token is not a new jurisdiction

Source: `data/research/hungary/territorial-roster.json; source Zalaszabar20-241 locator`.

```json
{
  "office_ids": [
    "HU-NVI-20-241-C",
    "HU-NVI-20-241-M"
  ],
  "additional_nul_token_offices": 0
}
```

Retain immutable TXT; one leading NUL/quote parsing artifact maps to existing same source code/name. 3177 unique jurisdiction names match 2026 roster. Not a merge edge.


## 21. Europe and continuity citation ownership survives Hungary import

Source: `publication_release contract; Hungary Input Inventory lineage_id`.

```json
{
  "other_lineage_release_ids": "unchanged",
  "receipt_is_citation_owner": false
}
```

Future multi-lineage publication gate Not run. Hungary owns only Hungary rows and release; no LatAm/NZ/Mexico mutation.
