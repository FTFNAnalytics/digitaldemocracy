# Slovakia acceptance examples

Draft worked shapes, not importer test results. Every real record below resolves to retained bytes. Examples explicitly called synthetic are future CI mutations and are not appended to research data.

## 1. Current office survives unknown/out-of-window next call

SK-NRSR remains current with three historical cycles even though next_date is NULL. No four-year arithmetic fabricates a polling day. Source occurrence and register origins are retained.

```json
{
  "office": {
    "office_id": "SK-NRSR",
    "id_namespace": "cdd-observatory-v1",
    "country_id": "slovakia",
    "geography_id": "SK",
    "office_name": "Národná rada Slovenskej republiky",
    "office_type": "national_parliament",
    "electoral_mode": "direct_popular",
    "current": true,
    "office_status": "current",
    "source_code": null,
    "proposed_tier": "national",
    "next_date": null,
    "next_cycle": null,
    "origins": [
      {
        "source_id": "src-5b5073ff3178f75b87375b81",
        "input_path": "data/research/slovakia/sources/volby.statistics.sk/nrsr/nrsr2023/sk/index.html",
        "sha256": "c13b6a02cafe9e22ac222d1921b0057eae566307ca8f3ea6c24cc5c31e8ec686"
      }
    ],
    "holds": [],
    "valid_from": null,
    "valid_to": null
  },
  "expected": {
    "office_status": "current",
    "next_date_id": null,
    "next_date_resolution": "unknown"
  }
}
```

## 2. Municipal council and direct mayor are separate

Bratislava city has two sourced popular ballots. SK-582000-C and SK-582000-M are distinct; no council-selected executive is substituted.

```json
{
  "council": {
    "office_id": "SK-582000-C",
    "id_namespace": "cdd-observatory-v1",
    "country_id": "slovakia",
    "geography_id": "SK-OBEC-582000",
    "office_name": "Bratislava — zastupiteľstvo",
    "office_type": "municipal_council",
    "electoral_mode": "direct_popular",
    "current": true,
    "office_status": "current",
    "source_code": "582000",
    "proposed_tier": "municipal",
    "next_date": {
      "label": "2026-10-24",
      "precision": "day",
      "certainty": "called",
      "year": 2026,
      "month": 10,
      "day": 24,
      "origins": [
        {
          "source_id": "src-752f5d97a54e17d9f2122d86",
          "input_path": "data/research/slovakia/sources/www.minv.sk/index.html__e1394043d5",
          "sha256": "b1acf18f57287b04dcac1bac98e1985e6865e6ee6b7a31032225368f9cf6adf8",
          "pdf_page": 1,
          "locator": "point 1: 24. októbra 2026"
        }
      ]
    },
    "next_cycle": "OSO2026",
    "origins": [
      {
        "source_id": "src-22d1db034c2c0b803a6051e1",
        "input_path": "data/research/slovakia/sources/volby.statistics.sk/opendata/oso/2022/OSO2022_SK_tab0dx.csv",
        "sha256": "5dd64667fd2818819cb0ce14d5fc630085f70dd1926c65332dc028a4831f515a",
        "csv_record": 4,
        "header_record": 3
      },
      {
        "source_id": "src-5878576dc2a7c25a772e073c",
        "input_path": "data/research/slovakia/sources/static.slov-lex.sk/static/SK/ZZ/2014/180/20260601.html",
        "sha256": "d4e4b800d10c4cc765f6b042d80ea62ce234e0dc130decc61460dd77e112f368",
        "html_id": "paragraf-182.odsek-4"
      }
    ],
    "holds": [],
    "valid_from": null,
    "valid_to": null
  },
  "mayor": {
    "office_id": "SK-582000-M",
    "id_namespace": "cdd-observatory-v1",
    "country_id": "slovakia",
    "geography_id": "SK-OBEC-582000",
    "office_name": "Bratislava — starosta / primátor",
    "office_type": "direct_mayor",
    "electoral_mode": "direct_popular",
    "current": true,
    "office_status": "current",
    "source_code": "582000",
    "proposed_tier": "municipal",
    "next_date": {
      "label": "2026-10-24",
      "precision": "day",
      "certainty": "called",
      "year": 2026,
      "month": 10,
      "day": 24,
      "origins": [
        {
          "source_id": "src-752f5d97a54e17d9f2122d86",
          "input_path": "data/research/slovakia/sources/www.minv.sk/index.html__e1394043d5",
          "sha256": "b1acf18f57287b04dcac1bac98e1985e6865e6ee6b7a31032225368f9cf6adf8",
          "pdf_page": 1,
          "locator": "point 1: 24. októbra 2026"
        }
      ]
    },
    "next_cycle": "OSO2026",
    "origins": [
      {
        "source_id": "src-22d1db034c2c0b803a6051e1",
        "input_path": "data/research/slovakia/sources/volby.statistics.sk/opendata/oso/2022/OSO2022_SK_tab0dx.csv",
        "sha256": "5dd64667fd2818819cb0ce14d5fc630085f70dd1926c65332dc028a4831f515a",
        "csv_record": 4,
        "header_record": 3
      },
      {
        "source_id": "src-5878576dc2a7c25a772e073c",
        "input_path": "data/research/slovakia/sources/static.slov-lex.sk/static/SK/ZZ/2014/180/20260601.html",
        "sha256": "d4e4b800d10c4cc765f6b042d80ea62ce234e0dc130decc61460dd77e112f368",
        "html_id": "paragraf-182.odsek-4"
      }
    ],
    "holds": [],
    "valid_from": null,
    "valid_to": null
  }
}
```

## 3. City part is not merged into parent city

Bratislava-Staré Mesto uses official code528595; its council and direct mayor remain separate from Bratislava city. Proposed other is a tier-policy hold, not missing-office evidence.

```json
{
  "office_ids": [
    "SK-528595-C",
    "SK-528595-M"
  ],
  "geography": {
    "geography_id": "SK-OBEC-528595",
    "name": "Bratislava - Staré Mesto",
    "parent_geography_id": "SK-OBEC-582000",
    "geography_kind": "city_part",
    "valid_from": null,
    "valid_to": null,
    "origins": [
      {
        "source_id": "src-dea4ed1842a53d28b21e1de5",
        "input_path": "data/research/slovakia/sources/volby.statistics.sk/opendata/oso/2022/OSO2022_SK_tab0dd.csv",
        "sha256": "870549c41aa2394fce6ff26305ba4eb3d0c7ddf525ba80f49168520f786a6c5a",
        "csv_record": 4,
        "header_record": 3
      },
      {
        "source_id": "src-8dd0503f839e8dc61b1797ed",
        "input_path": "data/research/slovakia/sources/volbysr.sk/files/REF2026_SK_tab0b.csv",
        "sha256": "5e49e0fdf08ccb306ee33d4273fb3ee9bffda70c5c33e24fe05736465c17728d",
        "csv_record": 2,
        "header_record": 1
      }
    ],
    "raw": {
      "Kód kraja": "1",
      "Názov kraja": "Bratislavský kraj",
      "Kód územného obvodu": "101",
      "Názov územného obvodu": "Bratislava",
      "Kód okresu": "101",
      "Názov okresu": "Bratislava I",
      "Kód obce": "528595",
      "Názov obce": "Bratislava - Staré Mesto",
      "Počet volebných obvodov": "  8",
      "Počet okrskov": "  34",
      "Počet volených poslancov": "  25",
      "Typ volieb": "Starosta a zastupiteľstvo"
    }
  }
}
```

## 4. Regional calendar is evidenced and still draft

Eight VUC assemblies and eight direct chairs have a sourced24 October 2026 call. Proposed regional count16; production approved numerator remains0 until Justin accepts tiers.

```json
{
  "office": {
    "office_id": "SK-VUC-1-P",
    "id_namespace": "cdd-observatory-v1",
    "country_id": "slovakia",
    "geography_id": "SK-VUC-1",
    "office_name": "Bratislavský kraj — predseda",
    "office_type": "direct_regional_chair",
    "electoral_mode": "direct_popular",
    "current": true,
    "office_status": "current",
    "source_code": "1",
    "proposed_tier": "regional",
    "next_date": {
      "label": "2026-10-24",
      "precision": "day",
      "certainty": "called",
      "year": 2026,
      "month": 10,
      "day": 24,
      "origins": [
        {
          "source_id": "src-752f5d97a54e17d9f2122d86",
          "input_path": "data/research/slovakia/sources/www.minv.sk/index.html__e1394043d5",
          "sha256": "b1acf18f57287b04dcac1bac98e1985e6865e6ee6b7a31032225368f9cf6adf8",
          "pdf_page": 1,
          "locator": "point 1: 24. októbra 2026"
        }
      ]
    },
    "next_cycle": "VUC2026",
    "origins": [
      {
        "source_id": "src-eb6d2a07d3a38a5ed506b29b",
        "input_path": "data/research/slovakia/sources/volby.statistics.sk/opendata/osk/2017/OSK_2017_tab0da.csv",
        "sha256": "c4b37ed911f538c188c4d3c35e7e64f9f3374dff65ffbeca9bae91f2fae4b8a8",
        "csv_record": 2,
        "header_record": 1
      },
      {
        "source_id": "src-5878576dc2a7c25a772e073c",
        "input_path": "data/research/slovakia/sources/static.slov-lex.sk/static/SK/ZZ/2014/180/20260601.html",
        "sha256": "d4e4b800d10c4cc765f6b042d80ea62ce234e0dc130decc61460dd77e112f368",
        "html_id": "paragraf-150.odsek-4"
      }
    ],
    "holds": [],
    "valid_from": null,
    "valid_to": null
  },
  "event": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "SK-VUC-1-P",
    "history_key": "SK-VUC-1-P::VUC2026",
    "event_id": "event-de197aa9e08f4574e7c6ba51",
    "cycle": "VUC2026",
    "date": {
      "label": "2026-10-24",
      "precision": "day",
      "certainty": "called",
      "year": 2026,
      "month": 10,
      "day": 24,
      "origins": [
        {
          "source_id": "src-752f5d97a54e17d9f2122d86",
          "input_path": "data/research/slovakia/sources/www.minv.sk/index.html__e1394043d5",
          "sha256": "b1acf18f57287b04dcac1bac98e1985e6865e6ee6b7a31032225368f9cf6adf8",
          "pdf_page": 1,
          "locator": "point 1: 24. októbra 2026"
        }
      ]
    },
    "event_kind": "ordinary",
    "selected_history_role": "none",
    "temporal_role": "prospective",
    "legal_outcome": "unknown",
    "ballot_basis": "valid_votes",
    "share_unit": "percent_0_100",
    "coverage": "called_no_returns",
    "origins": [
      {
        "source_id": "src-752f5d97a54e17d9f2122d86",
        "input_path": "data/research/slovakia/sources/www.minv.sk/index.html__e1394043d5",
        "sha256": "b1acf18f57287b04dcac1bac98e1985e6865e6ee6b7a31032225368f9cf6adf8",
        "pdf_page": 1,
        "locator": "point 1: 24. októbra 2026"
      }
    ],
    "result_count": 0
  }
}
```

## 5. Presidential runoff is not a second cycle

PRE2024 has one event, two actual proceedings; this result belongs to the runoff. Do not add two selected history events.

```json
{
  "derived_locator": "data/research/slovakia/results.json#/106436",
  "source_locator": {
    "source_id": "src-ee0310d8c6f55506f098fd42",
    "input_path": "data/research/slovakia/sources/volby.statistics.sk/opendata/pre/2024/2.kolo/PREZ2024_kolo2_SK_tab03a.csv",
    "sha256": "59dec21b8a8c79cb97de7bae978f4745b685d934957d21ca92003aa008c9d7b8",
    "csv_record": 3,
    "header_record": 1
  },
  "expected_result_row": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "SK-PRESIDENT",
    "history_key": "SK-PRESIDENT::PRE2024",
    "result_row_id": "result-2c3fa4557a3b930db79aeea9",
    "proceeding_id": "proceeding-e31d87af6d0efb0b7e9d1f0a",
    "candidate_or_list_label": "Peter Pellegrini",
    "votes": 1409255,
    "votes_status": "recorded",
    "share": 53.12,
    "share_status": "recorded",
    "seats": null,
    "seats_status": "unknown",
    "elected_flag": true
  }
}
```

## 6. VUC2013 runoff preserves historical mechanism

2013 first/second rounds remain two proceedings of one chair cycle. Do not retrofit the later single-round chair system.

```json
{
  "derived_locator": "data/research/slovakia/results.json#/107482",
  "source_locator": {
    "source_id": "src-edc2e2bcb0305c1a36af4d4e",
    "input_path": "data/research/slovakia/sources/volby.statistics.sk/opendata/osk/2013/2.kolo/OSK_2013_2kolo_tab07.csv",
    "sha256": "d05187e8cf72d3cdf87e325cbffdae0f466bb7d7333a67792ad9ed315356cca7",
    "csv_record": 2,
    "header_record": 1
  },
  "expected_result_row": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "SK-VUC-1-P",
    "history_key": "SK-VUC-1-P::VUC2013",
    "result_row_id": "result-891f0a73209006cce35af4b8",
    "proceeding_id": "proceeding-69764b645451f2124766c391",
    "candidate_or_list_label": "Pavol Frešo",
    "votes": 74132,
    "votes_status": "recorded",
    "share": 74.24,
    "share_status": "recorded",
    "seats": null,
    "seats_status": "unknown",
    "elected_flag": true
  }
}
```

## 7. Reported zero survives

The source explicitly reports zero votes; votes=0/votes_status=zero. This is not a missing value.

```json
{
  "derived_locator": "data/research/slovakia/results.json#/4012",
  "source_locator": {
    "source_id": "src-9beacaf986159bd3c2cddea5",
    "input_path": "data/research/slovakia/sources/volby.statistics.sk/opendata/oso/2018/OSO_2018_tab05.csv",
    "sha256": "3777c18a6edbd6a2c439a56289e5ce93e4a3f24a3d27501085aa5075b9900018",
    "csv_record": 1655,
    "header_record": 1
  },
  "expected_result_row": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "SK-501310-M",
    "history_key": "SK-501310-M::OSO2018",
    "result_row_id": "result-73f1b71d4fd9f7c6b833e396",
    "proceeding_id": null,
    "candidate_or_list_label": "Attila Orosz",
    "votes": 0,
    "votes_status": "zero",
    "share": 0,
    "share_status": "zero",
    "seats": null,
    "seats_status": "unknown",
    "elected_flag": null
  }
}
```

## 8. Absent numeric seats remain missing

EP2014 chosen party table does not supply numeric mandate counts. A qualifying marker is not a seat total; seats=NULL/seats_status=unknown.

```json
{
  "derived_locator": "data/research/slovakia/results.json#/106236",
  "source_locator": {
    "source_id": "src-fbc3c521749bee7c0ec8377b",
    "input_path": "data/research/slovakia/sources/volby.statistics.sk/opendata/eup/2014/EUP_2014_tab08.csv",
    "sha256": "d4fa5373a9c5d1fa8e40c8aecde652c4da78b3dce0ceb2767ae9a782351612ba",
    "csv_record": 9,
    "header_record": 1
  },
  "expected_result_row": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "SK-EP",
    "history_key": "SK-EP::EP2014",
    "result_row_id": "result-99daffa756048b64e917fb2d",
    "proceeding_id": null,
    "candidate_or_list_label": "7 STATOČNÝCH REGIONÁLNA STRANA SLOVENSKA",
    "votes": 2696,
    "votes_status": "recorded",
    "share": 0.48,
    "share_status": "recorded",
    "seats": null,
    "seats_status": "unknown",
    "elected_flag": null
  }
}
```

## 9. Elected-only is not a complete council vector

2014 elected councillor votes are retained, but missing losing candidates do not become zeros. Elected_flag=true does not manufacture seats=1.

```json
{
  "derived_locator": "data/research/slovakia/results.json#/103755",
  "source_locator": {
    "source_id": "src-c5e69863fc519cb76e3a1d3a",
    "input_path": "data/research/slovakia/sources/volby.statistics.sk/opendata/oso/2014/OSO_2014_tab10.csv",
    "sha256": "1a4e674735d447f82ab3d6be6aab76b426fbee3a79701ad664a69ea03aa0bff4",
    "csv_record": 10,
    "header_record": 1
  },
  "expected_result_row": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "SK-582000-C",
    "history_key": "SK-582000-C::OSO2014",
    "result_row_id": "result-e4048b274a74098e8e1c5e12",
    "proceeding_id": null,
    "candidate_or_list_label": "Izabella Jégh",
    "votes": 1710,
    "votes_status": "recorded",
    "share": null,
    "share_status": "unknown",
    "seats": null,
    "seats_status": "unknown",
    "elected_flag": true
  }
}
```

## 10. Workbook and CSV overlap do not duplicate results

2022 all-candidate mayor workbook supplies this row. Elected-mayor table 04d and precinct table 05f are retained only; neither adds another result or cycle.

```json
{
  "derived_locator": "data/research/slovakia/results.json#/87907",
  "source_locator": {
    "source_id": "src-5ca08e4e996fcf6140da9cdc",
    "input_path": "data/research/slovakia/sources/volby.statistics.sk/oso/oso2022/files/OSO2022_SK_tab05d.xlsx",
    "sha256": "d459074c77d06fecd706e22894840d0171217fdcdbd18c27ff56c22412a42eae",
    "sheet": "OSO2022_SK_tab05d",
    "row": 5
  },
  "expected_result_row": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "SK-528595-M",
    "history_key": "SK-528595-M::OSO2022",
    "result_row_id": "result-96b132f78e9a9110947f98f4",
    "proceeding_id": null,
    "candidate_or_list_label": "Zuzana Aufrichtová",
    "votes": 3374,
    "votes_status": "recorded",
    "share": 22.23,
    "share_status": "recorded",
    "seats": null,
    "seats_status": "unknown",
    "elected_flag": null
  }
}
```

## 11. Homonyms retain distinct source identities

Two same-name/same-party candidates have distinct source-record keys. Never merge on name; a changed ordering requires a reviewed source crosswalk.

```json
[
  {
    "derived_locator": "data/research/slovakia/results.json#/57376",
    "source_locator": {
      "source_id": "src-f2ccc85bc97b933ecc7a80c1",
      "input_path": "data/research/slovakia/sources/volby.statistics.sk/opendata/oso/2014/OSO_2014_tab11.csv",
      "sha256": "d95e452fa5395fd41e3400a5ad921793ce8431b2eb5ff51ae3c998f18fd5fb6e",
      "csv_record": 5357,
      "header_record": 1
    },
    "expected_result_row": {
      "id_namespace": "cdd-observatory-v1",
      "office_id": "SK-519014-M",
      "history_key": "SK-519014-M::OSO2014",
      "result_row_id": "result-6365de7b37b92e60bd0ac474",
      "proceeding_id": null,
      "candidate_or_list_label": "Ján Novotný",
      "votes": 65,
      "votes_status": "recorded",
      "share": null,
      "share_status": "unknown",
      "seats": null,
      "seats_status": "unknown",
      "elected_flag": true
    }
  },
  {
    "derived_locator": "data/research/slovakia/results.json#/57380",
    "source_locator": {
      "source_id": "src-f2ccc85bc97b933ecc7a80c1",
      "input_path": "data/research/slovakia/sources/volby.statistics.sk/opendata/oso/2014/OSO_2014_tab11.csv",
      "sha256": "d95e452fa5395fd41e3400a5ad921793ce8431b2eb5ff51ae3c998f18fd5fb6e",
      "csv_record": 5361,
      "header_record": 1
    },
    "expected_result_row": {
      "id_namespace": "cdd-observatory-v1",
      "office_id": "SK-519014-M",
      "history_key": "SK-519014-M::OSO2014",
      "result_row_id": "result-939e7fc69f8832a27902404b",
      "proceeding_id": null,
      "candidate_or_list_label": "Ján Novotný",
      "votes": 9,
      "votes_status": "recorded",
      "share": null,
      "share_status": "unknown",
      "seats": null,
      "seats_status": "unknown",
      "elected_flag": false
    }
  }
]
```

## 12. Missing cycle does not delete an office

The missing-cycle inventory retains this exact source-bound office. No completed event, zero turnout or legal abolition is inferred.

```json
{
  "office_id": "SK-502201-M",
  "cycle": "OSO2022",
  "reason": "No result row recovered in selected official return tables; no completed event invented. Roster/no-election flags remain source evidence.",
  "roster_origin": {
    "source_id": "src-dea4ed1842a53d28b21e1de5",
    "input_path": "data/research/slovakia/sources/volby.statistics.sk/opendata/oso/2022/OSO2022_SK_tab0dd.csv",
    "sha256": "870549c41aa2394fce6ff26305ba4eb3d0c7ddf525ba80f49168520f786a6c5a",
    "csv_record": 675,
    "header_record": 3
  }
}
```

## 13. Precise call versus a partial-date CI mutation

Actual2026 call is day/called. Isolated CI mutation only: if a future source says2027-10, expected year2027/month10/dayNULL, precision=month; never2027-10-01. This is not a Slovakia research claim.

```json
{
  "actual_call": {
    "label": "2026-10-24",
    "precision": "day",
    "certainty": "called",
    "year": 2026,
    "month": 10,
    "day": 24,
    "origins": [
      {
        "source_id": "src-752f5d97a54e17d9f2122d86",
        "input_path": "data/research/slovakia/sources/www.minv.sk/index.html__e1394043d5",
        "sha256": "b1acf18f57287b04dcac1bac98e1985e6865e6ee6b7a31032225368f9cf6adf8",
        "pdf_page": 1,
        "locator": "point 1: 24. októbra 2026"
      }
    ]
  },
  "synthetic_expected": {
    "label": "2027-10",
    "precision": "month",
    "certainty": "expected",
    "year": 2027,
    "month": 10,
    "day": null
  }
}
```

## 14. Unchanged versus corrected inputs

Recompute H(I.hash_inputs) byte-for-byte: unchanged→same candidate release, fresh future attempt. A corrected accepted source/tier file yields new fingerprint while office IDs and reviewed result keys stay stable.

```json
{
  "fingerprint": "94f39ca9f08bfc266a3f6f0280a9feb141f08189d69a86acff95c1d718240179",
  "candidate_release_id": "country-package-slovakia--sha256-94f39ca9f08bfc266a3f6f0280a9feb141f08189d69a86acff95c1d718240179",
  "attempt_id": "runtime only; not generated in this research pack"
}
```

## 15. Unresolved token versus broken resolved FK

Isolated CI mutations only. An unrecognized exact citation string may be retained in unresolved_evidence with a real target locator and source occurrence. Replacing a real origin.source_id with nonexistent src-missing must fail and roll back; never relabel it unresolved.

```json
{
  "real_result": "result-66a96e5762ababff53fc7be9",
  "real_origin": {
    "source_id": "src-c5e69863fc519cb76e3a1d3a",
    "input_path": "data/research/slovakia/sources/volby.statistics.sk/opendata/oso/2014/OSO_2014_tab10.csv",
    "sha256": "1a4e674735d447f82ab3d6be6aab76b426fbee3a79701ad664a69ea03aa0bff4",
    "csv_record": 6365,
    "header_record": 1
  },
  "synthetic_poison_source_id": "src-missing",
  "expected": "staging rollback + durable failed attempt; no published change"
}
```

## 16. Future historical office and incomplete refresh

No historical-only office was recovered from these three local rosters; that does not authorize dropping future sourced abolished bodies. Synthetic gate: omit real SK-582000-C from an incomplete refresh; retain its row, events, result IDs and provenance. A future primary abolished-office row gets historical status only with its actual code/body evidence, not a fabricated example ID.

## 17. Fixture exclusion and unrelated lineages

Isolated gate: injected FIX-/FXT- office/event or fixture markers anywhere in raw payload must fail closed. A successful future Slovakia publication retains every unrelated(lineage_id,release_id) pair and rows; no LatAm citation rebinding to the newest global receipt.

## 18. Presidential withdrawal markers remain evidence

2024 first-round candidate Andrej Danko has a published numeric vote claim with raw X marker. Preserve both; do not silently delete or reinterpret the raw votes as a certification decision.

```json
{
  "derived_locator": "data/research/slovakia/results.json#/106424",
  "source_locator": {
    "source_id": "src-6fd2840612d94f5e135a9663",
    "input_path": "data/research/slovakia/sources/volby.statistics.sk/opendata/pre/2024/1.kolo/PREZ2024_kolo1_SK_tab03a.csv",
    "sha256": "381cf298211cdfaaba2d2f5981a507d84133d50cf7f0362281b1bf642df59c96",
    "csv_record": 2,
    "header_record": 1
  },
  "expected_result_row": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "SK-PRESIDENT",
    "history_key": "SK-PRESIDENT::PRE2024",
    "result_row_id": "result-a9447a051b330f1d3f600f55",
    "proceeding_id": "proceeding-d8b0e867ff3af6f677fc38cb",
    "candidate_or_list_label": "Andrej Danko",
    "votes": 1905,
    "votes_status": "recorded",
    "share": 0.08,
    "share_status": "recorded",
    "seats": null,
    "seats_status": "unknown",
    "elected_flag": null
  }
}
```
