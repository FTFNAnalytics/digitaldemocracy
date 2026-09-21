# Latvia acceptance examples — DRAFT

21 worked documentary examples. Exact emitted IDs/source locators are real; hypothetical importer mutations are labeled **Not run**. Research paths below start data/research/latvia/ unless stated otherwise.

## 1. Current Riga council, no extra mayor

Locator: `office-register.json#/149`.

One council office. Council chair and executive director are not popular contests.

Expected row/behavior:

```json
{
  "office_id": "LV-LOCAL-2021-riga-C",
  "office_name": "Rīga — dome",
  "current": true,
  "proposed_tier": "municipal",
  "origins": [
    {
      "input_path": "data/research/latvia/sources/dati.cvk.lv/PV2025/velesanu-rezultati/riga/riga/index.html",
      "sha256": "44cba8c23612ff0ffacd3e1ed3c1909a6915d7bf589c77f942d7d29b3a34b81f",
      "source_id": "latvia--url-44f636dfe5a1ce39283bd93a",
      "html_locator": "council results heading"
    },
    {
      "input_path": "data/research/latvia/sources/likumi.lv/ta/id/315654-administrativo-teritoriju-un-apdzivoto-vietu-likums/index.html",
      "sha256": "c21d42a397add21471cffda06c237490ae1c7c44f131384de0ca673d5f74e7bb",
      "source_id": "latvia--url-9e02614f402f201ccf62f6c6",
      "html_locator": "current law annex: named municipality; not its subdivisions"
    },
    {
      "input_path": "data/research/latvia/sources/arhivs.cvk.lv/lv/rd-2020-velesanu-rezultati/index.html",
      "sha256": "f2d618097e38e5754fb595db8dfeb34f2731510a7100ee855ae21055cda66395",
      "source_id": "latvia--url-11125fefcfd7ced60be8f269",
      "html_table": 2
    }
  ]
}
```

## 2. Pre-reform identity is retained without a guessed successor

Locator: `office-register.json#/89`.

This is a 2017 source-scoped council identity, not an automatically accepted abolition/merger assertion. The current same-named council remains distinct pendingLV-G01.

Expected row/behavior:

```json
{
  "office_id": "LV-LOCAL-2017-cvk-b1d419b64aeed8ddeb9738e5-C",
  "historical": true,
  "source_code": "zI/kuQrDUDamCw1ETXn/yg==",
  "holds": [
    "LV-G01"
  ],
  "origins": [
    {
      "input_path": "data/research/latvia/sources/data.gov.lv/dati/dataset/a7c824f2-cd4d-4556-a6ba-fcfe2b8bbd94/resource/e6dd9296-ee2f-4892-9082-6da4c5feef26/download/electionresults636363813214220000.xml",
      "sha256": "7c22845828cefeff1c745512090db704bfa3d95c5adde1066bb18e83c26fc5d4",
      "source_id": "latvia--url-a8638a876e1d5deb68c1ccb1",
      "xpath": "/ElectionResultVersionData/DepartmentResults/DepartmentResultModel[97]"
    }
  ]
}
```

## 3. Varakļāni historical council retained

Locator: `office-register.json#/160`.

The 2021 Varakļāni contest remains. No event is transferred to enlarged Madona without an accepted identity rule; no successor edge emitted.

Expected row/behavior:

```json
{
  "office_id": "LV-LOCAL-2021-varaklanu-novads-C",
  "current": false,
  "historical": true,
  "observed_cycles": [
    "VRD2021"
  ]
}
```

## 4. Pre/post roster counts are dated snapshots

Locator: `register-source-rows.json`.

119 is the 2017 election roster, not claimed immediately-pre-reform legal count.2021 main40 + delayed2 + Riga 2020 one =43 post-reform council observations;2025 current42.

Expected row/behavior:

```json
{
  "PV2025": 42,
  "PV2017": 119,
  "PV2021": 40,
  "VRD2021": 2,
  "RD2020": 1
}
```

## 5. Delayed 2021 date is preserved

Locator: `events.json#/201`.

September11 is sourced. Do not assign June5 to all 2021 councils.

Expected row/behavior:

```json
{
  "history_key": "LV-LOCAL-2021-varaklanu-novads-C::VRD2021",
  "event_id": "event-ef88c10c6f4d4031baeeccbf",
  "date": {
    "label": "2021-09-11",
    "year": 2021,
    "month": 9,
    "day": 11,
    "precision": "day",
    "certainty": "called"
  },
  "raw": {
    "date_origin": {
      "input_path": "data/research/latvia/sources/arhivs.cvk.lv/lv/varaklanu-novada-domes-un-rezeknes-novada-domes-velesanas-0/index.html",
      "sha256": "904b9108a548ee5d4b1078f181ceb486024e1bbfda73a9319f76eb87027ff507",
      "source_id": "latvia--url-724bece9c1012a2fedb21b7c",
      "html_locator": "election-day narrative"
    },
    "ballot_basis_exact": "valid_envelopes",
    "coverage_complete": false
  }
}
```

## 6. Riga extraordinary election is not a 2021 duplicate

Locator: `events.json#/180`.

2020-08-29 is actual election date from CVK. No 2021 Riga event is generated.

Expected row/behavior:

```json
{
  "event_id": "event-87893be979d9c2905f2e8360",
  "date": {
    "label": "2020-08-29",
    "year": 2020,
    "month": 8,
    "day": 29,
    "precision": "day",
    "certainty": "called"
  },
  "event_kind": "special",
  "history_key": "LV-LOCAL-2021-riga-C::RD2020"
}
```

## 7. Blank seats stay unknown

Locator: `results.json#/4`.

Blank printed seat cell is not interpreted as0.

Expected row/behavior:

```json
{
  "result_row_id": "result-00da8dfeb7edc5bfa2d11d82",
  "votes": 354,
  "seats": null,
  "seats_status": "unknown",
  "origin": {
    "input_path": "data/research/latvia/sources/dati.cvk.lv/PV2025/velesanu-rezultati/vidzeme/marupes-novads/index.html",
    "sha256": "4ededbfde89faf19f975db563cd0790774d23499bf1ecda44aff13ba846abadf",
    "source_id": "latvia--url-b5a1e2c507553ea86d3bf9b0",
    "html_table": 1,
    "html_row": 9
  },
  "raw": {
    "source_cells": [
      "8",
      "Zaļo un Zemnieku savienība",
      "354",
      "2,721%",
      ""
    ],
    "result_grain": "list",
    "blank_seats_policy": "unknown; not inferred zero"
  }
}
```

## 8. Explicit zero seats survive

Locator: `results.json#/1`.

Explicit0 is0/zero; votes remain independently supplied.

Expected row/behavior:

```json
{
  "result_row_id": "result-00725d323bb7e12f940359d6",
  "votes": 101,
  "seats": 0,
  "seats_status": "zero",
  "origin": {
    "input_path": "data/research/latvia/sources/data.gov.lv/dati/dataset/a7c824f2-cd4d-4556-a6ba-fcfe2b8bbd94/resource/e6dd9296-ee2f-4892-9082-6da4c5feef26/download/electionresults636363813214220000.xml",
    "sha256": "7c22845828cefeff1c745512090db704bfa3d95c5adde1066bb18e83c26fc5d4",
    "source_id": "latvia--url-a8638a876e1d5deb68c1ccb1",
    "xpath": "/ElectionResultVersionData/DepartmentResults/DepartmentResultModel[82]/CandidateListResults/CandidateListResultModel[1]"
  }
}
```

## 9. Year precision without fabricated day

Locator: `events.json#/210`.

Primary biography gives 2003 reelection; month/day stay NULL.88 winner support does not fabricate the rest of the ballot.

Expected row/behavior:

```json
{
  "event_id": "event-3dc20d50c280d2069c4c1dd1",
  "date": {
    "label": "2003",
    "year": 2003,
    "month": null,
    "day": null,
    "precision": "year",
    "certainty": "called"
  },
  "origins": [
    {
      "input_path": "data/research/latvia/sources/www.president.lv/en/vaira-vike-freiberga/index.html",
      "sha256": "3919b781cde9ca3f2b2fd8a0d1878ab33b71c71039d8cce733de6a8df6bf94f5",
      "source_id": "latvia--url-a740f3b9638c3194f75904e0",
      "html_locator": "In 2003 ... 88 votes out of 96"
    }
  ]
}
```

## 10. Indirect presidential first ballot

Locator: `proceedings.json#/1`.

Source protocol 8, form 6, first round 1 are distinct.25/42/10 support counts are parliamentary; no popular percentages or missing rounds.

Expected row/behavior:

```json
{
  "proceeding_id": "proceeding-3da7d0fa832ce5544c9a996e",
  "office_id": "LV-PRESIDENT",
  "history_key": "LV-PRESIDENT::PRES2023",
  "event_id": "event-512a46cff5d8b25eb1f60d35",
  "sequence": 1,
  "proceeding_kind": "first_round",
  "date_label": "2023-05-31",
  "origin": {
    "input_path": "data/research/latvia/sources/titania.saeima.lv/LIVS14/saeimalivs_lmp.nsf/0/a6fd83b30943d24fc22589c0002cbc17/$FILE/Balsojums.pdf",
    "sha256": "c86cef9fdc2ebb45b83d6f3653dda2707fe5e0333714f5dcd373795ed7b37be5",
    "source_id": "latvia--url-d1b8c7f7ce466da02fd4c8a7",
    "pdf_page": 4,
    "locator": "signed outcome: first round no President elected"
  },
  "raw": {
    "protocol_number": 8,
    "source_ballot_form_number": 6,
    "valid_ballots": 87,
    "against_all": 10,
    "form_number_is_not_round_number": true
  }
}
```

## 11. Fifth ballot does not synthesize four earlier rows

Locator: `proceedings.json#/0`.

Official biography supplies fifth-ballot 55 forVējonis. Winner-only result is labeled incomplete.

Expected row/behavior:

```json
{
  "proceeding_id": "proceeding-d7da8b78eaf3b484d34e8c8e",
  "office_id": "LV-PRESIDENT",
  "history_key": "LV-PRESIDENT::PRES2015",
  "event_id": "event-37060bdb3aff7f17cbc9e0fe",
  "sequence": 5,
  "proceeding_kind": "runoff",
  "date_label": "2015-06-03",
  "origin": {
    "input_path": "data/research/latvia/sources/www.president.lv/en/biography-0/index.html",
    "sha256": "bfa3200d3f5745304fe12b541b7b858a565fd962be4aece007fa9b38a97d5cd1",
    "source_id": "latvia--url-cce8d5a271fbecac92151cb0",
    "html_locator": "President of Latvia: fifth voting on June 3, 55 MPs"
  },
  "raw": {
    "ballot_mechanism": "fifth parliamentary ballot; earlier ballots not recovered"
  }
}
```

## 12. No in-window next date does not drop EP

Locator: `office-register.json#/0`.

Ordinary future EP cycle falls outside the alert horizon; no exact future day fabricated. Same retention rule applies to every municipal council.

Expected row/behavior:

```json
{
  "office_id": "LV-EP",
  "next_date": null,
  "retained_cycles": [
    "EP2014",
    "EP2019",
    "EP2024"
  ],
  "office_retained": true
}
```

## 13. Real announced upcoming national date

Locator: `events.json#/216`.

CVKannounced 2026-10-03; no votes/seats fabricated for prospective contest.

Expected row/behavior:

```json
{
  "event_id": "event-44b77f5cab63aae83685f132",
  "date": {
    "label": "2026-10-03",
    "year": 2026,
    "month": 10,
    "day": 3,
    "precision": "day",
    "certainty": "called"
  },
  "selected_history_role": "none",
  "legal_outcome": "not_held",
  "result_rows": 0,
  "origins": [
    {
      "input_path": "data/research/latvia/sources/www.cvk.lv/index.html",
      "sha256": "b3d8ef9988a373c19816b464c707380c4b6597b76823e6dbebe8edb4b47687fc",
      "source_id": "latvia--url-bc97432ac64ab69259f9bffa",
      "html_locator": "15. Saeimas vēlēšanas 3 October 2026"
    }
  ]
}
```

## 14. Honest regional empty state

Locator: `schemas/atlas/tiers/latvia.json#/counts_by_proposed_tier`.

No planning-region offices inferred from election navigation;0 regional is valid.

Expected row/behavior:

```json
{
  "national": 2,
  "regional": 0,
  "municipal": 163,
  "other": 1,
  "unknown": 0
}
```

## 15. Competing official percentages withheld from authoritative metric use

Locator: `results.json#/102`.

Keep archive numeric value as disputed and both claims. No automatic alternative, denominator repair or unqualified public percentage.

Expected row/behavior:

```json
{
  "claim_id": "LV-SV2022-SHARE-15",
  "target_result_row_id": "result-118cd475c2f29cce811acec6",
  "field": "share",
  "disposition": "needs_human_review",
  "original_claim": {
    "value": 6.16,
    "origin": {
      "input_path": "data/research/latvia/sources/arhivs.cvk.lv/lv/14-saeimas-velesanu-rezultati/index.html",
      "sha256": "29a61f6026bceb417ba29239a1497ce6fbfa496649d778c8f5dd7c86b1ec4428",
      "source_id": "latvia--url-9706c8e9e6235dfcc1888160",
      "html_table": 1,
      "html_row": 16
    }
  },
  "alternate_claim": {
    "value": 6.23,
    "origin": {
      "input_path": "data/research/latvia/sources/www.cvk.lv/saeimas-rezultati/index.html",
      "sha256": "1d89924795acd33dde382e5187b95a3a85f4e083b92186bd197df20e14e8052c",
      "source_id": "latvia--url-4a92aa3ffb8c1d9b98c1228f",
      "html_table": 2,
      "html_row": 8
    }
  },
  "reason": "Detailed official archive/API and current CVK summary disagree; no alternate auto-selected. Archive value retained as disputed. Denominator/version explanation is still required."
}
```

## 16. List/station overlap counted once

Locator: `vote-reconciliation.json#/0`.

Only the all-council list vector creates results; precinct, candidate-preference and duplicated archive summaries remain nonadditive retained bytes.

Expected row/behavior:

```json
{
  "event_id": "event-012377be879791efbafe14d9",
  "row_count": 7,
  "vote_sum": 11902,
  "supplied_valid_ballots": 11902,
  "supplied_valid_envelopes": 12013,
  "matches": true,
  "origin": {
    "input_path": "data/research/latvia/sources/dati.cvk.lv/PV2025/velesanu-rezultati/kurzeme/dienvidkurzemes-novads/index.html",
    "sha256": "82021ed1f1e673f43fd075ed21aa250cd256cab51cb6cbe9a9279b4faa07dade",
    "source_id": "latvia--url-3ce5e5d60b563b5471ec871f",
    "html_table": 2,
    "html_row": 30
  }
}
```

## 17. Unchanged versus corrected import

Locator: `Latvia_Input_Inventory.json#/hash_inputs`.

Future CI only, Not run: sameinputs→sameR/newattempt. Accepted correction changesR, not unaffected stable keys.

Expected row/behavior:

```json
{
  "fingerprint_sha256": "cb5cd35449a13d006e128b40b0e271b0d2312e2738d571377c84c26e86edda90",
  "candidate_release_id": "country-package-latvia--sha256-cb5cd35449a13d006e128b40b0e271b0d2312e2738d571377c84c26e86edda90",
  "unchanged_attempt_id": "new at runtime",
  "same_release_id": true
}
```

## 18. Unresolved evidence versus broken resolved FK

Locator: `results.json#/0/origin`.

Future isolated poison mutation only; all actual source references resolve.

Expected row/behavior:

```json
{
  "source_id": "latvia--url-a8638a876e1d5deb68c1ccb1",
  "broken_known_source_FK": "fail publication",
  "unresolved_original_token": "real target + unresolved_evidence; no fabricated source"
}
```

## 19. Incomplete refresh retains omitted history

Locator: `office-register.json#/89`.

Future omission CI, Not run. Omission is not legal abolition or accepted identity consolidation.

Expected row/behavior:

```json
{
  "omitted_office_id": "LV-LOCAL-2017-cvk-b1d419b64aeed8ddeb9738e5-C",
  "delete": false,
  "retained_history": true
}
```

## 20. Fixture rejection and last-good rollback

Locator: `Prompt_AG_Full_Register_Field_Map_and_CI.md`.

Future fixture and poison checks, Not run; no fixture offices added here.

Expected row/behavior:

```json
{
  "research_fixture_rows": 0,
  "hypothetical_FIX_prefix": "reject",
  "serving_release_after_failure": "last good",
  "attempt_log": "durable separate ledger"
}
```

## 21. Unrelated lineages keep their citations

Locator: `Latvia_Input_Inventory.json#/lineage_id`.

No Latvia research action rewrites Europe peers, LatAm/NZ or Mexico. No latest-receipt citation join.

Expected row/behavior:

```json
{
  "lineage": "country-package-latvia",
  "other_lineages": "unchanged",
  "citation_owner": "row.lineage_id,row.release_id",
  "applied_changes": 0
}
```
