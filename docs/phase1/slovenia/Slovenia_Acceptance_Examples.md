# Slovenia acceptance examples

Draft expected row shapes, not executed importer tests. Synthetic cases are clearly labelled and are not research rows.

## 1. Full current municipal pair

Ajdovščina source code001 creates one council and one direct mayor. No statistical-region layer is manufactured.

```json
{
  "offices": [
    {
      "id_namespace": "cdd-observatory-v1",
      "office_id": "SI-001-C",
      "country_id": "slovenia",
      "geography_id": "SI-OB-001",
      "source_territorial_code": "001",
      "jurisdiction_name": "Ajdovščina",
      "office_name": "Ajdovščina — občinski svet",
      "office_type": "municipal_council",
      "office_status": "current",
      "electoral_mode": "direct_popular",
      "proposed_tier": "municipal",
      "next_date": {
        "label": "2026-11-15",
        "precision": "day",
        "certainty": "called",
        "year": 2026,
        "month": 11,
        "day": 15,
        "origins": [
          {
            "source_id": "src-c98b43020208d6091f5e36b7",
            "input_path": "data/research/slovenia/sources/www.dvk-rs.si/volitve-in-referendumi/lokalne-volitve/lokalne-volitve/lokalne-volitve/index.html",
            "sha256": "93098cae5a1f058f229021e4984fb7e2eb26d60dae4d8e361b8c604336dc758d",
            "html_text_anchor": "15. 11. 2026"
          }
        ]
      },
      "next_cycle": "LV2026",
      "origins": [
        {
          "source_id": "src-00dc0d2fe40a42a59e21e476",
          "input_path": "data/research/slovenia/sources/www.gov.si/podrocja/drzava-in-druzba/lokalna-samouprava-in-regionalni-razvoj/lokalna-samouprava/obcine/index.html",
          "sha256": "933dafb19c1e0442e4dee5aa5177e1ad2b46f913c9d2581b910c2b6f9922adae",
          "html_tag": "h3",
          "html_element_index": 12
        },
        {
          "source_id": "src-7f2ac2ba5180becf44aa7ffc",
          "input_path": "data/research/slovenia/sources/www.dvk-rs.si/arhivi/volitve2022/lv2022/data/prvikrog/data.json",
          "sha256": "a1067a7bf75ea7f4a7b99b75758e264718beec7536a67a5e2b37ac829e84af2b",
          "json_pointer": "/slovenija/obcine/26"
        },
        {
          "source_id": "src-275c0921156cf85b58a83325",
          "input_path": "data/research/slovenia/sources/www.dvk-rs.si/volitve-in-referendumi/lokalne-volitve/index.html",
          "sha256": "979db2ac0616b71bbd059894f0ccb2537144f856d2a6aef2d90d8861f46597ac",
          "html_text_anchor": "župana in člane občinskega sveta"
        }
      ],
      "notes": [
        "Documentary body label; official jurisdiction spelling preserved.",
        "Source codes identify municipalities, not government-issued Atlas office IDs."
      ],
      "raw": {
        "government_title": "Občina Ajdovščina",
        "election_name": "AJDOVŠČINA"
      }
    },
    {
      "id_namespace": "cdd-observatory-v1",
      "office_id": "SI-001-M",
      "country_id": "slovenia",
      "geography_id": "SI-OB-001",
      "source_territorial_code": "001",
      "jurisdiction_name": "Ajdovščina",
      "office_name": "Ajdovščina — župan",
      "office_type": "direct_mayor",
      "office_status": "current",
      "electoral_mode": "direct_popular",
      "proposed_tier": "municipal",
      "next_date": {
        "label": "2026-11-15",
        "precision": "day",
        "certainty": "called",
        "year": 2026,
        "month": 11,
        "day": 15,
        "origins": [
          {
            "source_id": "src-c98b43020208d6091f5e36b7",
            "input_path": "data/research/slovenia/sources/www.dvk-rs.si/volitve-in-referendumi/lokalne-volitve/lokalne-volitve/lokalne-volitve/index.html",
            "sha256": "93098cae5a1f058f229021e4984fb7e2eb26d60dae4d8e361b8c604336dc758d",
            "html_text_anchor": "15. 11. 2026"
          }
        ]
      },
      "next_cycle": "LV2026",
      "origins": [
        {
          "source_id": "src-00dc0d2fe40a42a59e21e476",
          "input_path": "data/research/slovenia/sources/www.gov.si/podrocja/drzava-in-druzba/lokalna-samouprava-in-regionalni-razvoj/lokalna-samouprava/obcine/index.html",
          "sha256": "933dafb19c1e0442e4dee5aa5177e1ad2b46f913c9d2581b910c2b6f9922adae",
          "html_tag": "h3",
          "html_element_index": 12
        },
        {
          "source_id": "src-7f2ac2ba5180becf44aa7ffc",
          "input_path": "data/research/slovenia/sources/www.dvk-rs.si/arhivi/volitve2022/lv2022/data/prvikrog/data.json",
          "sha256": "a1067a7bf75ea7f4a7b99b75758e264718beec7536a67a5e2b37ac829e84af2b",
          "json_pointer": "/slovenija/obcine/26"
        },
        {
          "source_id": "src-275c0921156cf85b58a83325",
          "input_path": "data/research/slovenia/sources/www.dvk-rs.si/volitve-in-referendumi/lokalne-volitve/index.html",
          "sha256": "979db2ac0616b71bbd059894f0ccb2537144f856d2a6aef2d90d8861f46597ac",
          "html_text_anchor": "župana in člane občinskega sveta"
        }
      ],
      "notes": [
        "Documentary body label; official jurisdiction spelling preserved.",
        "Source codes identify municipalities, not government-issued Atlas office IDs."
      ],
      "raw": {
        "government_title": "Občina Ajdovščina",
        "election_name": "AJDOVŠČINA"
      }
    }
  ]
}
```

## 2. National Assembly differs from National Council

SI-DZ is directly elected; SI-DS is indirect and still a national chamber. No nationwide first-preference universe is synthesized.

```json
{
  "offices": [
    {
      "id_namespace": "cdd-observatory-v1",
      "office_id": "SI-DZ",
      "country_id": "slovenia",
      "geography_id": "SI",
      "source_territorial_code": null,
      "jurisdiction_name": "Slovenija",
      "office_name": "Državni zbor",
      "office_type": "national_assembly",
      "office_status": "current",
      "electoral_mode": "direct_popular",
      "proposed_tier": "national",
      "next_date": null,
      "next_cycle": null,
      "origins": [
        {
          "source_id": "src-43aa20063c5924fd6bd781ef",
          "input_path": "data/research/slovenia/sources/www.dvk-rs.si/volitve-in-referendumi/drzavni-zbor-rs/index.html",
          "sha256": "e4ba0257d06d04376055d3f91a0454ff4034146de7a29d78f9b7bd1325b51820",
          "html_tag": "h1",
          "html_element_index": 0
        }
      ],
      "notes": [
        "Body-level register; components and rounds do not create duplicate offices."
      ]
    },
    {
      "id_namespace": "cdd-observatory-v1",
      "office_id": "SI-DS",
      "country_id": "slovenia",
      "geography_id": "SI",
      "source_territorial_code": null,
      "jurisdiction_name": "Slovenija",
      "office_name": "Državni svet",
      "office_type": "national_council",
      "office_status": "current",
      "electoral_mode": "indirect_functional_and_local_electors",
      "proposed_tier": "national",
      "next_date": null,
      "next_cycle": null,
      "origins": [
        {
          "source_id": "src-607236eb77e004bf61f9ec03",
          "input_path": "data/research/slovenia/sources/www.dvk-rs.si/volitve-in-referendumi/drzavni-svet-rs/index.html",
          "sha256": "b6ebcbf886c8d47e6531e6794ca73b4b5d056106a328917e820c1536d31164f9",
          "html_tag": "h1",
          "html_element_index": 0
        }
      ],
      "notes": [
        "Body-level register; components and rounds do not create duplicate offices."
      ]
    }
  ]
}
```

## 3. Out-of-window or unknown next date retains office

SI-EP remains in the current register with 3historic cycles even though next_date is NULL. Do not invent a2029polling day or drop the office.

```json
{
  "office": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "SI-EP",
    "country_id": "slovenia",
    "geography_id": "SI",
    "source_territorial_code": null,
    "jurisdiction_name": "Slovenija",
    "office_name": "Poslanci iz Republike Slovenije v Evropskem parlamentu",
    "office_type": "ep_delegation",
    "office_status": "current",
    "electoral_mode": "direct_popular",
    "proposed_tier": "other",
    "next_date": null,
    "next_cycle": null,
    "origins": [
      {
        "source_id": "src-9c66b558b58325407de9b72c",
        "input_path": "data/research/slovenia/sources/www.dvk-rs.si/volitve-in-referendumi/evropski-parlament/index.html",
        "sha256": "55450f109df8babee75936a0cb6fd4f01111f2a0242bf2c9302eaa0ffbaa9c86",
        "html_tag": "h1",
        "html_element_index": 0
      }
    ],
    "notes": [
      "EP delegation is a supranational representation, not an invented domestic regional body."
    ]
  },
  "historical_HKs": [
    "SI-EP::EP2019",
    "SI-EP::EP2024",
    "SI-EP::EP2014"
  ]
}
```

## 4. Presidential runoff stays one cycle

The source supplies483812 votes and 0.538862fraction in the second round. Keep its proceeding separate from the first; do not count two selected presidential cycles.

```json
{
  "research_pointer": "data/research/slovenia/results.json#/13580",
  "source_locator": {
    "source_id": "src-dd13db02643f358e3a55798a",
    "input_path": "data/research/slovenia/sources/www.dvk-rs.si/arhivi/volitve2022/vp2022/data/data.json",
    "sha256": "63440bd844e385e08f0ce424e9ff689367d5f2839e2414c456e898f9ebf800ba",
    "json_pointer": "/slovenija/rez/rez/1"
  },
  "expected_result_row": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "SI-PRESIDENT",
    "history_key": "SI-PRESIDENT::PRE2022",
    "result_row_id": "result-b76a06cc2f1da9e694024032",
    "proceeding_id": "proceeding-a5252224e2299cbc63228f69",
    "candidate_or_list_label": "Nataša Pirc Musar",
    "votes": 483812,
    "votes_status": "recorded",
    "share": 0.538862,
    "share_status": "recorded",
    "share_unit": "proportion_0_1",
    "seats": 1,
    "seats_status": "recorded",
    "elected_flag": null
  },
  "raw_component": "president"
}
```

## 5. Mayoral runoff retains unofficial status

Koper2018second-round row has13921 votes and 50.03percent; source explicitly says neuradni. Recorded claim is not a court certification.

```json
{
  "research_pointer": "data/research/slovenia/results.json#/8921",
  "source_locator": {
    "source_id": "src-39110fafb04594f946ca6e9d",
    "input_path": "data/research/slovenia/sources/dvk-rs.si/arhivi/lv2018/rezultati/obcina_koper.html",
    "sha256": "3203e4fbaa88f2e946d325af170eb881559a65002d6ae6815a32221d3561c421",
    "html_table_index": 2,
    "html_row_index": 1
  },
  "expected_result_row": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "SI-050-M",
    "history_key": "SI-050-M::LV2018",
    "result_row_id": "result-4d85db65402b6f9c49a64288",
    "proceeding_id": "proceeding-51b1f0545dbcd60b981368b4",
    "candidate_or_list_label": "ALEŠ BRŽAN",
    "votes": 13921,
    "votes_status": "recorded",
    "share": 50.03,
    "share_status": "recorded",
    "share_unit": "percent_0_100",
    "seats": null,
    "seats_status": "unknown",
    "elected_flag": null
  },
  "raw_component": "mayor"
}
```

## 6. Indirect zero is a real zero

The local-interest electorate reports0 votes. Keep votes=0/zero, shares=NULL/unknown; no popular electorate or nationwide percent.

```json
{
  "research_pointer": "data/research/slovenia/results.json#/13631",
  "source_locator": {
    "source_id": "src-05de6293dbd7ff30b873394b",
    "input_path": "data/research/slovenia/sources/www.uradni-list.si/glasilo-uradni-list-rs/vsebina/2022-01-3744/zapisnik-o-ugotovitvi-koncnega-izida-volitev-v-drzavni-svet/index.html",
    "sha256": "73eac1d13c555aa2f7d10992310ed10cfe222c57265bb633c6e09670148d9447",
    "html_tag": "div",
    "html_element_index": 224,
    "paired_value_element_index": 225
  },
  "expected_result_row": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "SI-DS",
    "history_key": "SI-DS::DS2022",
    "result_row_id": "result-c4bfcd4fc12f9ad9fe356c29",
    "proceeding_id": null,
    "candidate_or_list_label": "Rajko Janžekovič",
    "votes": 0,
    "votes_status": "zero",
    "share": null,
    "share_status": "unknown",
    "share_unit": "proportion_0_1",
    "seats": null,
    "seats_status": "unknown",
    "elected_flag": null
  },
  "raw_component": "local-VE-7"
}
```

## 7. Absent seats differ from zero

Selected2014 EP table supplies votes/share but no numeric mandates. Allocation calculator is not loaded; seats=NULL/unknown.

```json
{
  "research_pointer": "data/research/slovenia/results.json#/13586",
  "source_locator": {
    "source_id": "src-2250c42f6043c798128dd529",
    "input_path": "data/research/slovenia/sources/dvk-rs.si/arhivi/ep2014/rez_sl.html",
    "sha256": "219b446a8e45702978e82665fda8099afcd2d87dde1f81ab8bcdc9b9a9a5134e",
    "html_table_index": 1,
    "html_row_index": 1
  },
  "expected_result_row": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "SI-EP",
    "history_key": "SI-EP::EP2014",
    "result_row_id": "result-3a1d8021ad5474f7054a09c5",
    "proceeding_id": null,
    "candidate_or_list_label": "SDS",
    "votes": 99643,
    "votes_status": "recorded",
    "share": 24.78,
    "share_status": "recorded",
    "share_unit": "percent_0_100",
    "seats": null,
    "seats_status": "unknown",
    "elected_flag": null
  },
  "raw_component": "national-list"
}
```

## 8. Explicit zero seats survive

JSON man=0 means zero recorded mandates; it is not missing. The exact row locator guards the conversion.

```json
{
  "research_pointer": "data/research/slovenia/results.json#/7",
  "source_locator": {
    "source_id": "src-db30bf25b9bf3ddd78f316c7",
    "input_path": "data/research/slovenia/sources/www.dvk-rs.si/arhivi/volitve2022/lv2022/data/prvikrog/obcine-data/data_118.json",
    "sha256": "122051d058e4254abf68fe5321da729731a7fd28e46c0e47477b47b0b0921686",
    "json_pointer": "/os/enote/0/rez/4"
  },
  "expected_result_row": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "SI-118-C",
    "history_key": "SI-118-C::LV2022",
    "result_row_id": "result-a4303ada806658300730b039",
    "proceeding_id": null,
    "candidate_or_list_label": "NOVA SLOVENIJA - KRŠČANSKI DEMOKRATI",
    "votes": 121,
    "votes_status": "recorded",
    "share": 0.035641,
    "share_status": "recorded",
    "share_unit": "proportion_0_1",
    "seats": 0,
    "seats_status": "zero",
    "elected_flag": null
  },
  "raw_component": "council-01-rez"
}
```

## 9. National Council date range remains a range

Initial2022 elector votes occurred on 23and24 November. Event dates have two explicit endpoint rows; 2023 repeat date is separate.

```json
{
  "event": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "SI-DS",
    "history_key": "SI-DS::DS2022",
    "event_id": "event-50228b8214bc046a2d74f7e6",
    "cycle": "DS2022",
    "date": {
      "label": "2022-11-23 / 2022-11-24",
      "precision": "range",
      "certainty": "called",
      "year": null,
      "month": null,
      "day": null,
      "range_start": {
        "label": "2022-11-23",
        "precision": "day",
        "certainty": "called",
        "year": 2022,
        "month": 11,
        "day": 23,
        "origins": [
          {
            "source_id": "src-05de6293dbd7ff30b873394b",
            "input_path": "data/research/slovenia/sources/www.uradni-list.si/glasilo-uradni-list-rs/vsebina/2022-01-3744/zapisnik-o-ugotovitvi-koncnega-izida-volitev-v-drzavni-svet/index.html",
            "sha256": "73eac1d13c555aa2f7d10992310ed10cfe222c57265bb633c6e09670148d9447",
            "html_text_anchor": "Končni izid"
          }
        ]
      },
      "range_end": {
        "label": "2022-11-24",
        "precision": "day",
        "certainty": "called",
        "year": 2022,
        "month": 11,
        "day": 24,
        "origins": [
          {
            "source_id": "src-05de6293dbd7ff30b873394b",
            "input_path": "data/research/slovenia/sources/www.uradni-list.si/glasilo-uradni-list-rs/vsebina/2022-01-3744/zapisnik-o-ugotovitvi-koncnega-izida-volitev-v-drzavni-svet/index.html",
            "sha256": "73eac1d13c555aa2f7d10992310ed10cfe222c57265bb633c6e09670148d9447",
            "html_text_anchor": "Končni izid"
          }
        ]
      },
      "origins": [
        {
          "source_id": "src-05de6293dbd7ff30b873394b",
          "input_path": "data/research/slovenia/sources/www.uradni-list.si/glasilo-uradni-list-rs/vsebina/2022-01-3744/zapisnik-o-ugotovitvi-koncnega-izida-volitev-v-drzavni-svet/index.html",
          "sha256": "73eac1d13c555aa2f7d10992310ed10cfe222c57265bb633c6e09670148d9447",
          "html_text_anchor": "Končni izid"
        }
      ]
    },
    "event_kind": "indirect",
    "selected_history_role": "selected",
    "electoral_system": "indirect_functional_and_local_electors",
    "share_unit": "proportion_0_1",
    "legal_outcome": "unknown",
    "ballot_basis": "electors",
    "coverage": "official final record; electoral colleges distinct; later component repeats preserved",
    "origins": [
      {
        "source_id": "src-05de6293dbd7ff30b873394b",
        "input_path": "data/research/slovenia/sources/www.uradni-list.si/glasilo-uradni-list-rs/vsebina/2022-01-3744/zapisnik-o-ugotovitvi-koncnega-izida-volitev-v-drzavni-svet/index.html",
        "sha256": "73eac1d13c555aa2f7d10992310ed10cfe222c57265bb633c6e09670148d9447",
        "html_text_anchor": "Končni izid"
      }
    ]
  },
  "date_vectors": [
    {
      "owner": "event",
      "owner_id": "event-50228b8214bc046a2d74f7e6",
      "slot": "election/range_start",
      "date_id": "date-f08c08c304e9c35283a0925ba04765c9b41783163f708a79cac369225da49412",
      "value": {
        "label": "2022-11-23",
        "precision": "day",
        "certainty": "called",
        "year": 2022,
        "month": 11,
        "day": 23,
        "origins": [
          {
            "source_id": "src-05de6293dbd7ff30b873394b",
            "input_path": "data/research/slovenia/sources/www.uradni-list.si/glasilo-uradni-list-rs/vsebina/2022-01-3744/zapisnik-o-ugotovitvi-koncnega-izida-volitev-v-drzavni-svet/index.html",
            "sha256": "73eac1d13c555aa2f7d10992310ed10cfe222c57265bb633c6e09670148d9447",
            "html_text_anchor": "Končni izid"
          }
        ]
      },
      "range_start_id": null,
      "range_end_id": null
    },
    {
      "owner": "event",
      "owner_id": "event-50228b8214bc046a2d74f7e6",
      "slot": "election/range_end",
      "date_id": "date-5ca66f36bf918d9347e02b7ce6b739566d7625adb6c5d5c7d13c748ff2ff2668",
      "value": {
        "label": "2022-11-24",
        "precision": "day",
        "certainty": "called",
        "year": 2022,
        "month": 11,
        "day": 24,
        "origins": [
          {
            "source_id": "src-05de6293dbd7ff30b873394b",
            "input_path": "data/research/slovenia/sources/www.uradni-list.si/glasilo-uradni-list-rs/vsebina/2022-01-3744/zapisnik-o-ugotovitvi-koncnega-izida-volitev-v-drzavni-svet/index.html",
            "sha256": "73eac1d13c555aa2f7d10992310ed10cfe222c57265bb633c6e09670148d9447",
            "html_text_anchor": "Končni izid"
          }
        ]
      },
      "range_start_id": null,
      "range_end_id": null
    },
    {
      "owner": "event",
      "owner_id": "event-50228b8214bc046a2d74f7e6",
      "slot": "election",
      "date_id": "date-be6c1ae0b23205ef27e5fc1d8352c90c3bd2790d4776735602608a8537c25272",
      "value": {
        "label": "2022-11-23 / 2022-11-24",
        "precision": "range",
        "certainty": "called",
        "year": null,
        "month": null,
        "day": null,
        "range_start": {
          "label": "2022-11-23",
          "precision": "day",
          "certainty": "called",
          "year": 2022,
          "month": 11,
          "day": 23,
          "origins": [
            {
              "source_id": "src-05de6293dbd7ff30b873394b",
              "input_path": "data/research/slovenia/sources/www.uradni-list.si/glasilo-uradni-list-rs/vsebina/2022-01-3744/zapisnik-o-ugotovitvi-koncnega-izida-volitev-v-drzavni-svet/index.html",
              "sha256": "73eac1d13c555aa2f7d10992310ed10cfe222c57265bb633c6e09670148d9447",
              "html_text_anchor": "Končni izid"
            }
          ]
        },
        "range_end": {
          "label": "2022-11-24",
          "precision": "day",
          "certainty": "called",
          "year": 2022,
          "month": 11,
          "day": 24,
          "origins": [
            {
              "source_id": "src-05de6293dbd7ff30b873394b",
              "input_path": "data/research/slovenia/sources/www.uradni-list.si/glasilo-uradni-list-rs/vsebina/2022-01-3744/zapisnik-o-ugotovitvi-koncnega-izida-volitev-v-drzavni-svet/index.html",
              "sha256": "73eac1d13c555aa2f7d10992310ed10cfe222c57265bb633c6e09670148d9447",
              "html_text_anchor": "Končni izid"
            }
          ]
        },
        "origins": [
          {
            "source_id": "src-05de6293dbd7ff30b873394b",
            "input_path": "data/research/slovenia/sources/www.uradni-list.si/glasilo-uradni-list-rs/vsebina/2022-01-3744/zapisnik-o-ugotovitvi-koncnega-izida-volitev-v-drzavni-svet/index.html",
            "sha256": "73eac1d13c555aa2f7d10992310ed10cfe222c57265bb633c6e09670148d9447",
            "html_text_anchor": "Končni izid"
          }
        ]
      },
      "range_start_id": "date-f08c08c304e9c35283a0925ba04765c9b41783163f708a79cac369225da49412",
      "range_end_id": "date-5ca66f36bf918d9347e02b7ce6b739566d7625adb6c5d5c7d13c748ff2ff2668"
    }
  ]
}
```

## 10. Repeat with original claims retained

Official renderedPDFpage1 supplies10 elector votes forLukaSteiner on 31May2023. Earlier2022culture/sport claims remain provenance, not current winners. No new chamber office or extra full cycle.

```json
{
  "research_pointer": "data/research/slovenia/results.json#/13829",
  "source_locator": {
    "source_id": "src-0beb53303374f21a1bb59b0d",
    "input_path": "data/research/slovenia/sources/www.dvk-rs.si/fileadmin/user_upload/Zapisnik_koncni_izid_ponovnih_volitev_v_DS_kultura_in_sport_8.6.2023.pdf",
    "sha256": "94355da5878b09f1ea5fde98b6b8e0b77936c4019982a37f2a02ce5faba0d03c",
    "pdf_page": 1,
    "section": "I. candidate table",
    "candidate_rank": 4
  },
  "expected_result_row": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "SI-DS",
    "history_key": "SI-DS::DS2022",
    "result_row_id": "result-79fb47d2a599c471c28b847f",
    "proceeding_id": "proceeding-a0b6f298f7c228b96086b3b9",
    "candidate_or_list_label": "Luka Steiner",
    "votes": 10,
    "votes_status": "recorded",
    "share": null,
    "share_status": "unknown",
    "share_unit": "proportion_0_1",
    "seats": null,
    "seats_status": "unknown",
    "elected_flag": true
  },
  "raw_component": "culture-sport-repeat-2023"
}
```

## 11. 2022fraction remains a fraction

Ljubljana mayor row preserves54680 votes and 0.618279share withproportion_0_1. No×100conversion or computed replacement.

```json
{
  "research_pointer": "data/research/slovenia/results.json#/1692",
  "source_locator": {
    "source_id": "src-c8a69d0a01010263977f795f",
    "input_path": "data/research/slovenia/sources/www.dvk-rs.si/arhivi/volitve2022/lv2022/data/prvikrog/obcine-data/data_061.json",
    "sha256": "369dca14a01d7aa77bd9ea778176eb93dab3b52bdbaad9744bc55b164cfd3d2f",
    "json_pointer": "/zup/kand_rez/0"
  },
  "expected_result_row": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "SI-061-M",
    "history_key": "SI-061-M::LV2022",
    "result_row_id": "result-f18acc3386d9f339777ef081",
    "proceeding_id": "proceeding-6e13f5698b23c077d8d5bfcf",
    "candidate_or_list_label": "Zoran Janković",
    "votes": 54680,
    "votes_status": "recorded",
    "share": 0.618279,
    "share_status": "recorded",
    "share_unit": "proportion_0_1",
    "seats": null,
    "seats_status": "unknown",
    "elected_flag": true
  },
  "raw_component": "mayor"
}
```

## 12. Minority component is not a new council

Koper minority candidate vector remains attached toSI-050-C and its own source tip/district. Do not sum with general council list vote denominator.

```json
{
  "research_pointer": "data/research/slovenia/results.json#/1243",
  "source_locator": {
    "source_id": "src-5b4dbb4ffb20049c8c971950",
    "input_path": "data/research/slovenia/sources/www.dvk-rs.si/arhivi/volitve2022/lv2022/data/prvikrog/obcine-data/data_040.json",
    "sha256": "57fa044a1b1f2f445fcfd363716348736fd17169ad9b23013e2efa85366f0282",
    "json_pointer": "/manjs/0/enote/0/kand_rez/0"
  },
  "expected_result_row": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "SI-040-C",
    "history_key": "SI-040-C::LV2022",
    "result_row_id": "result-a7524ce96f9bc7067710bb3e",
    "proceeding_id": null,
    "candidate_or_list_label": "Agnese Babič",
    "votes": 234,
    "votes_status": "recorded",
    "share": 0.405546,
    "share_status": "recorded",
    "share_unit": "proportion_0_1",
    "seats": null,
    "seats_status": "unknown",
    "elected_flag": true
  },
  "raw_component": "minority-503-01"
}
```

## 13. Honest empty regional calendar

Tiers contain424 municipal,3 national,1 other and 0 regional. Current governmental directory contains no source-evidenced elected regional assembly in this pack. Regional numerator0 passes; statistical regions do not generate offices.

```json
{
  "tier_path": "schemas/atlas/tiers/slovenia.json",
  "tier_sha256": "17a836af07d10fa5ec3c0560c8281f67d60e17cd76b727360aa823b40ab201ee",
  "regional_count": 0,
  "approval": "draft_for_human_review"
}
```

## 14. Real next call without fake results

DVK explicitly calls15 November2026 local ballots. This supplies next-date metadata and 424 prospective event rows; it supplies no results.

```json
{
  "office": {
    "label": "2026-11-15",
    "precision": "day",
    "certainty": "called",
    "year": 2026,
    "month": 11,
    "day": 15,
    "origins": [
      {
        "source_id": "src-c98b43020208d6091f5e36b7",
        "input_path": "data/research/slovenia/sources/www.dvk-rs.si/volitve-in-referendumi/lokalne-volitve/lokalne-volitve/lokalne-volitve/index.html",
        "sha256": "93098cae5a1f058f229021e4984fb7e2eb26d60dae4d8e361b8c604336dc758d",
        "html_text_anchor": "15. 11. 2026"
      }
    ]
  },
  "event": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "SI-001-M",
    "history_key": "SI-001-M::LV2026",
    "event_id": "event-f0053469e144c968029bc2b5",
    "cycle": "LV2026",
    "date": {
      "label": "2026-11-15",
      "precision": "day",
      "certainty": "called",
      "year": 2026,
      "month": 11,
      "day": 15,
      "origins": [
        {
          "source_id": "src-c98b43020208d6091f5e36b7",
          "input_path": "data/research/slovenia/sources/www.dvk-rs.si/volitve-in-referendumi/lokalne-volitve/lokalne-volitve/lokalne-volitve/index.html",
          "sha256": "93098cae5a1f058f229021e4984fb7e2eb26d60dae4d8e361b8c604336dc758d",
          "html_text_anchor": "15. 11. 2026"
        }
      ]
    },
    "event_kind": "ordinary",
    "selected_history_role": "none",
    "electoral_system": "direct_popular",
    "share_unit": "proportion_0_1",
    "legal_outcome": "unknown",
    "ballot_basis": "unknown",
    "coverage": "official call only; no candidate/result claim",
    "origins": [
      {
        "source_id": "src-c98b43020208d6091f5e36b7",
        "input_path": "data/research/slovenia/sources/www.dvk-rs.si/volitve-in-referendumi/lokalne-volitve/lokalne-volitve/lokalne-volitve/index.html",
        "sha256": "93098cae5a1f058f229021e4984fb7e2eb26d60dae4d8e361b8c604336dc758d",
        "html_text_anchor": "15. 11. 2026"
      }
    ]
  }
}
```

## 15. Missing local cycle is not abolition

The2018 Ribnica council source has no recovered results table. RetainSI-106-C and its other histories, with no invented2018zero rows.

```json
{
  "office_id": "SI-106-C",
  "cycle": "LV2018",
  "reason": "No council result table recovered; office retained; not zero turnout/abolition.",
  "origins": [
    {
      "source_id": "src-00dc0d2fe40a42a59e21e476",
      "input_path": "data/research/slovenia/sources/www.gov.si/podrocja/drzava-in-druzba/lokalna-samouprava-in-regionalni-razvoj/lokalna-samouprava/obcine/index.html",
      "sha256": "933dafb19c1e0442e4dee5aa5177e1ad2b46f913c9d2581b910c2b6f9922adae",
      "html_tag": "h3",
      "html_element_index": 146
    },
    {
      "source_id": "src-7f2ac2ba5180becf44aa7ffc",
      "input_path": "data/research/slovenia/sources/www.dvk-rs.si/arhivi/volitve2022/lv2022/data/prvikrog/data.json",
      "sha256": "a1067a7bf75ea7f4a7b99b75758e264718beec7536a67a5e2b37ac829e84af2b",
      "json_pointer": "/slovenija/obcine/200"
    },
    {
      "source_id": "src-275c0921156cf85b58a83325",
      "input_path": "data/research/slovenia/sources/www.dvk-rs.si/volitve-in-referendumi/lokalne-volitve/index.html",
      "sha256": "979db2ac0616b71bbd059894f0ccb2537144f856d2a6aef2d90d8861f46597ac",
      "html_text_anchor": "župana in člane občinskega sveta"
    }
  ]
}
```

## 16. Damaged source label remains exact

U+FFFD is present in retained2018bytes. Keep label, numbers and frozen occurrence identity; proposed spelling correction stays NULL pending primary evidence.

```json
{
  "research_pointer": "data/research/slovenia/results.json#/8874",
  "source_locator": {
    "source_id": "src-50acbbc08334dd461898765f",
    "input_path": "data/research/slovenia/sources/dvk-rs.si/arhivi/lv2018/rezultati/obcina_celje.html",
    "sha256": "f1a55add46ab8786dfa0571794e5df0f78f7e2a7f81d9c8cccf1e9e21f5a516e",
    "html_table_index": 2,
    "html_row_index": 1
  },
  "expected_result_row": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "SI-011-M",
    "history_key": "SI-011-M::LV2018",
    "result_row_id": "result-383119a41deaa504d8b8bc30",
    "proceeding_id": "proceeding-9ad3d891edd19294e900b3d7",
    "candidate_or_list_label": "BOJAN �ROT",
    "votes": 9079,
    "votes_status": "recorded",
    "share": 56.42,
    "share_status": "recorded",
    "share_unit": "percent_0_100",
    "seats": null,
    "seats_status": "unknown",
    "elected_flag": null
  },
  "raw_component": "mayor"
}
```

## 17. Media fixture rejected, final Gazette used

Prepoll2026media sample with 2022 party set is excluded. The final Gazette supplies17 partyrows totaling1179769 votes; this is an actual source row, not the instructional sample.

```json
{
  "research_pointer": "data/research/slovenia/results.json#/13602",
  "source_locator": {
    "source_id": "src-3fb271be9c84c2b2a6cd06dc",
    "input_path": "data/research/slovenia/sources/pisrs.si/api/uradni-list/objava/u20260197.pdf",
    "sha256": "1f446ca2fbf33a424b8fdb43ea2a8960d67e79b4602671ba29b309acd9a51f1d",
    "pdf_page": 1,
    "pdf_table_index": 0,
    "pdf_row_index": 1
  },
  "expected_result_row": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "SI-DZ",
    "history_key": "SI-DZ::DZ2026",
    "result_row_id": "result-d637d6610dfe28818be085e5",
    "proceeding_id": null,
    "candidate_or_list_label": "GIBANJE SVOBODA",
    "votes": 338102,
    "votes_status": "recorded",
    "share": 28.66,
    "share_status": "recorded",
    "share_unit": "percent_0_100",
    "seats": null,
    "seats_status": "unknown",
    "elected_flag": null
  },
  "raw_component": "national-list"
}
```

## 18. Overlap exclusion

ForSI-050-C::LV2022, only first-round os lists and manjs candidate components project results; proportional preference arrays, summary/precinct totals and runoff-file council copies remain retained only. No event or row is added from repeated summary evidence.

```json
{
  "HK": "SI-050-C::LV2022",
  "results": 21
}
```

## 19. Unchanged and corrected fingerprint

Future CI only: identical effective input descriptors return same R with fresh attempt. A source correction changes hash/R while frozen documentary IDs survive a reviewed crosswalk.

```json
{
  "fingerprint": "38df9c7cfa588534b5b001a75678acfde165c49d515d0bd65b747d1af6ed8aea",
  "candidate_release_id": "country-package-slovenia--sha256-38df9c7cfa588534b5b001a75678acfde165c49d515d0bd65b747d1af6ed8aea",
  "actual_attempt_id": null
}
```

## 20. Unresolved citation versus broken resolved source

Synthetic futureCI: replacing a real origin.source_id with src-missing must fail staging and retain last-good serving set. An actual unrecognized citation token can be retained only with its real occurrence; never fabricate a source FK.

```json
{
  "real_source_locator": {
    "source_id": "src-db30bf25b9bf3ddd78f316c7",
    "input_path": "data/research/slovenia/sources/www.dvk-rs.si/arhivi/volitve2022/lv2022/data/prvikrog/obcine-data/data_118.json",
    "sha256": "122051d058e4254abf68fe5321da729731a7fd28e46c0e47477b47b0b0921686",
    "json_pointer": "/zup/kand_rez/0"
  },
  "synthetic_poison": "src-missing",
  "expected": "rollback + durable failed attempt; no published data change"
}
```

## 21. Historical-only discovery and incomplete refresh

No historical-only office is invented in this pack. Future primary evidence of an abolished municipality adds its real source-bound historical council/mayor rows, even outside the window. Synthetic omit-test: remove realSI-001-C from an incomplete refresh; preserve its existing row/history/evidence, not delete it.

## 22. Partial-date mutation and unrelated lineages

Future isolatedCI only: source label2027-11 maps month precision,day=NULL,certainty as supplied; never2027-11-01. A Slovenia-only publication leaves every peer lineage/release and citation unchanged. No actual2027 event is appended to this research pack.
