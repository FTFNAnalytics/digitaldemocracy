# Czechia worked acceptance examples — Prompt V

Draft documentary expectations; importer/publication CI **Not run**. Source locators refer to immutable ZIP members. Synthetic failure/correction scenarios are explicitly labelled; none become research rows.

## 1. Prague is one dual-function assembly

Derived: `data/research/czechia/office-register.json` /2659.

Source:

```json
{
  "source_id": "czechia--source-c4c8c4c9bafa8913d93e2d0f",
  "input_path": "data/research/czechia/sources/volby.gov.cz/opendata/kv2026/KV2026reg20260915_csv.zip",
  "sha256": "cc1860670dfdcbc58a62492329510104e32a9abb3f5bc7238e0291948708e4b0",
  "archive_entry": "csv_od/kvrzcoco.csv",
  "locator": {
    "csv_record": 2645
  }
}
```

Expected documentary row / future projection:

```json
{
  "office_id": "CZ-M554782-C",
  "name": "Zastupitelstvo hl.m.Prahy — Praha hl.m.",
  "office_type": "capital_regional_municipal_assembly",
  "tier_proposal": "regional",
  "office_status": "current"
}
```
Expected one office and one approved-later tier mapping, not a second Prague regional body. Its tier is a regional draft, separately reviewed from boroughs.

## 2. Prague borough is a distinct evidenced council

Derived: `data/research/czechia/office-register.json` /26.

Source:

```json
{
  "source_id": "czechia--source-c4c8c4c9bafa8913d93e2d0f",
  "input_path": "data/research/czechia/sources/volby.gov.cz/opendata/kv2026/KV2026reg20260915_csv.zip",
  "sha256": "cc1860670dfdcbc58a62492329510104e32a9abb3f5bc7238e0291948708e4b0",
  "archive_entry": "csv_od/kvrzcoco.csv",
  "locator": {
    "csv_record": 5
  }
}
```

Expected documentary row / future projection:

```json
{
  "office_id": "CZ-M500054-C",
  "name": "Zastupitelstvo městské části nebo městského obvodu — Praha 1",
  "office_type": "borough_council",
  "tier_proposal": "other"
}
```
Do not merge Prague1 into the citywide office. The source type5 supports borough scope; other tier remains pending Justin.

## 3. Regional office survives outside alert scope

Derived: `data/research/czechia/office-register.json` /1.

Source:

```json
{
  "source_id": "czechia--source-f3a17ac6e1a598a8077013cf",
  "input_path": "data/research/czechia/sources/volby.gov.cz/appdata/kz2024/odata/vysledky.xml",
  "sha256": "368e0d5a5e84d4004abf931b2df0ce16c86db4973ab750a9f732d09c6beced69",
  "archive_entry": null,
  "locator": {
    "xpath": "/VYSLEDKY/KRZAST[@CIS_KRZAST='1']"
  }
}
```

Expected documentary row / future projection:

```json
{
  "office_id": "CZ-K01-C",
  "name": "Zastupitelstvo kraje — Středočeský",
  "office_type": "regional_assembly",
  "next_election": null
}
```
NULL next date is unknown, not proof of no election or grounds to exclude this council. If future evidenced next date falls beyond2028-03-08, retain the same office/history and filter only alerts; this conditional is a CI scenario, not an authored date.

## 4. Historical-only source code remains available

Derived: `data/research/czechia/office-register.json` /407.

Source:

```json
{
  "source_id": "czechia--source-6600874107e19be73a0cf5e9",
  "input_path": "data/research/czechia/sources/volby.gov.cz/opendata/kv2006/KV2006_reg_20230224_csv.zip",
  "sha256": "5c2f1ed985cbba5d6960957965f960a8d65a6fd0aa0f880b5844b44f45d930d5",
  "archive_entry": "csv_od/kvrzcoco.csv",
  "locator": {
    "csv_record": 399
  }
}
```

Expected documentary row / future projection:

```json
{
  "office_id": "CZ-M530255-C",
  "name": "Zastupitelstvo obce — Nemíž",
  "office_status": "historical"
}
```
Historical means absent from the captured 2026 roster. No legal abolition date or successor_id is invented. Binding hold remains open.

## 5. Direct President versus council-selected local executive

Derived: `data/research/czechia/office-register.json` /6421.

Source:

```json
{
  "source_id": "czechia--source-5c975ac8f42fe981370b42e9",
  "input_path": "data/research/czechia/sources/www.psp.cz/docs/laws/constitution.html",
  "sha256": "7d2fde5faec295d7b57212a1c79991d09a170d8110248a9955b51b710068403e",
  "archive_entry": null,
  "locator": {
    "section": "Articles 15–18, 54–58; constitution"
  }
}
```

Expected documentary row / future projection:

```json
{
  "office_id": "CZ-PRESIDENT",
  "name": "Prezident republiky",
  "office_type": "direct_national_executive",
  "tier_proposal": "national"
}
```
Expected direct executives=1; direct local/regional executive offices=0. A candidate occupation containing primátor or starosta does not create a popular mayor office.

## 6. Year precision survives

Derived: `data/research/czechia/events.json` /5.

Source:

```json
{
  "source_id": "czechia--source-e0161b8b6a770d3b36a31f97",
  "input_path": "data/research/czechia/sources/volby.gov.cz/pls/kz2008/vysledky",
  "sha256": "9675e6162603fc20402c3155bc316a83f78b50fb1a345efe0d55021ecab788d2",
  "archive_entry": null,
  "locator": {
    "xpath": "/VYSLEDKY/KRZAST[@CIS_KRZAST='1']"
  }
}
```

Expected documentary row / future projection:

```json
{
  "event_id": "event-bc07776154c21acdd246ed88",
  "history_key": "CZ-K01-C::kz:2008",
  "date": {
    "value": "2008",
    "precision": "year",
    "certainty": "called",
    "note": "Only election year is projected; no invented polling day."
  }
}
```
Future research_date.year comes from label; month=NULL, day=NULL. Never use XML DATUM_CAS_GENEROVANI as election date. This is a real partial documentary date, not January1.

## 7. Announced first polling day with no invented result

Derived: `data/research/czechia/events.json` /84.

Source:

```json
{
  "source_id": "czechia--source-c4c8c4c9bafa8913d93e2d0f",
  "input_path": "data/research/czechia/sources/volby.gov.cz/opendata/kv2026/KV2026reg20260915_csv.zip",
  "sha256": "cc1860670dfdcbc58a62492329510104e32a9abb3f5bc7238e0291948708e4b0",
  "archive_entry": "csv_od/kvrzcoco.csv",
  "locator": {
    "csv_record": 2
  }
}
```

Expected documentary row / future projection:

```json
{
  "event_id": "event-3c2d97eca59d8859c509c816",
  "history_key": "CZ-M500011-C::kv:20261009",
  "date": {
    "value": "2026-10-09",
    "precision": "day",
    "certainty": "called",
    "note": "Source first polling day; does not assert ballot lasted only one day."
  },
  "prospective": true,
  "selected_history_role": "none"
}
```
2026 endpoint first day is retained as called/day. No results belong to this future event; zero processed precincts does not mean zero votes.

## 8. Missing mandate attribute differs from reported zero

Derived: `data/research/czechia/results.jsonl.gz` JSONL line 112.

Source:

```json
{
  "archive_entry": null,
  "input_path": "data/research/czechia/sources/volby.gov.cz/appdata/kz2024/odata/vysledky.xml",
  "locator": {
    "xpath": "/VYSLEDKY/KRZAST[@CIS_KRZAST='9']/STRANA[@KSTRANA='47']"
  },
  "sha256": "368e0d5a5e84d4004abf931b2df0ce16c86db4973ab750a9f732d09c6beced69",
  "source_id": "czechia--source-f3a17ac6e1a598a8077013cf"
}
```

Expected documentary row / future projection:

```json
{
  "result_row_id": "result-0026929f451642211a976c09",
  "office_id": "CZ-K09-C",
  "history_key": "CZ-K09-C::kz:2024",
  "votes": 648,
  "seats": null,
  "seats_status": "unknown"
}
```
Derived: `data/research/czechia/results.jsonl.gz` JSONL line 3.

Source:

```json
{
  "archive_entry": "csv_od/kvros.csv",
  "input_path": "data/research/czechia/sources/volby.gov.cz/opendata/kv2018/KV2018_reg_20230224_csv.zip",
  "locator": {
    "csv_record": 13237
  },
  "sha256": "5b51c881ab92d7712ccce944606f2790edbfe93a0deab0f09406ec0d48764dd4",
  "source_id": "czechia--source-e433194a9d875c8b2b454a87"
}
```

Expected documentary row / future projection:

```json
{
  "result_row_id": "result-0000bad0ea7c2d96480d5d9b",
  "office_id": "CZ-M564630-C",
  "history_key": "CZ-M564630-C::kv:20181005",
  "seats": 0,
  "seats_status": "zero"
}
```
The missing XML attribute remains NULL/unknown; explicit0 remains0/zero. No losing-list inference replaces the missing cell.

## 9. Recalculated municipal percentage is retained, not relabelled

Derived: `data/research/czechia/results.jsonl.gz` JSONL line 9.

Source:

```json
{
  "archive_entry": "csv_od/kvros.csv",
  "input_path": "data/research/czechia/sources/volby.gov.cz/opendata/kv2006/KV2006_reg_20230224_csv.zip",
  "locator": {
    "csv_record": 19471
  },
  "sha256": "5c2f1ed985cbba5d6960957965f960a8d65a6fd0aa0f880b5844b44f45d930d5",
  "source_id": "czechia--source-6600874107e19be73a0cf5e9"
}
```

Expected documentary row / future projection:

```json
{
  "result_row_id": "result-0003e3c5e34a94ffdd43715f",
  "office_id": "CZ-M577375-C",
  "history_key": "CZ-M577375-C::kv:20061020",
  "votes": 157,
  "share": null,
  "share_status": "unknown",
  "source_recalculated_percent": {
    "above_100": true,
    "lexeme": "114",
    "semantic_status": "needs_human_review",
    "source_field": "PROCHLSTR",
    "value": 114
  }
}
```
The raw supplied recalculated value is unchanged, with an explicit field-semantic hold. It is not clamped, divided, or treated as a normal vote-share numerator. All163,724 municipal shares follow the same hold, not just6,417 above100.

## 10. Sourced Senate by-election scope

Derived: `data/research/czechia/events.json` /45842.

Source:

```json
{
  "source_id": "czechia--source-bad4aa9b12669a5086486140",
  "input_path": "data/research/czechia/sources/volby.gov.cz/opendata/senat_vse/SENATreg20250118_csv.zip",
  "sha256": "d16cee79d36e75d40e142224be4f89e089296bd71c20bd2bbd2c288fce374168",
  "archive_entry": "csv_od/serk.csv",
  "locator": {
    "csv_record": 730
  }
}
```

Expected documentary row / future projection:

```json
{
  "event_id": "event-8d4d7bcfb8b2bf84a37099cb",
  "history_key": "CZ-SENAT::senat:19990828::obvod:27",
  "contest_scope": "obvod:27",
  "event_kind": "special",
  "date": {
    "value": "1999-08-28",
    "precision": "day",
    "certainty": "called",
    "note": "Source first polling day; does not assert ballot lasted only one day."
  }
}
```
This is one constituency-scoped event attached to the one Senate office. No fabricated by-election outside the30 supplied historical date catalogue entries.

## 11. Two rounds share one Senate event

Derived: `data/research/czechia/results.jsonl.gz` JSONL line 51.

Source:

```json
{
  "archive_entry": "csv_od/serk.csv",
  "input_path": "data/research/czechia/sources/volby.gov.cz/opendata/senat_vse/SENATreg20250118_csv.zip",
  "locator": {
    "csv_record": 1986
  },
  "sha256": "d16cee79d36e75d40e142224be4f89e089296bd71c20bd2bbd2c288fce374168",
  "source_id": "czechia--source-bad4aa9b12669a5086486140"
}
```

Expected documentary row / future projection:

```json
{
  "result_row_id": "result-0013421e59fb36edd3189093",
  "history_key": "CZ-SENAT::senat:20101015::obvod:73",
  "proceeding_id": "proceeding-6c0b1d74190c2e8a3afe7196",
  "seats": 0,
  "elected_flag": 0
}
```
Same candidate round vectors:

```json
[
  {
    "result_row_id": "result-0013421e59fb36edd3189093",
    "history_key": "CZ-SENAT::senat:20101015::obvod:73",
    "proceeding_id": "proceeding-6c0b1d74190c2e8a3afe7196",
    "votes": 11973,
    "seats": 0
  },
  {
    "result_row_id": "result-6b6c0a037f7a0e8458fa1ee2",
    "history_key": "CZ-SENAT::senat:20101015::obvod:73",
    "proceeding_id": "proceeding-693106ca0d0f5a6a10265cfa",
    "votes": 10382,
    "seats": null
  }
]
```
Round1 qualifier2 is not an elected or losing final outcome. Round2 only exists for an actual qualifier; nonqualifier raw round2 zeros never become results.

## 12. Corrected source edition without a second election

Derived: `data/research/czechia/events.json` /45727.

Source:

```json
{
  "source_id": "czechia--source-5ef8122e46b1843d2fbabe22",
  "input_path": "data/research/czechia/sources/volby.gov.cz/pls/prez2023nss/vysledky",
  "sha256": "71f57dcf0f53ef1d53573514815176d6a4446fe6c30730d92c23c7552b6a151e",
  "archive_entry": null,
  "locator": {
    "xpath": "/VYSLEDKY/CR"
  }
}
```

Expected documentary row / future projection:

```json
{
  "event_id": "event-a54506aba06a096d92eefb55",
  "history_key": "CZ-PRESIDENT::prez:2023",
  "date": {
    "value": "2023",
    "precision": "year",
    "certainty": "called",
    "note": "Only election year is projected; no invented polling day."
  },
  "raw": {
    "participation": [
      {
        "KOLO": "1",
        "OKRSKY_CELKEM": "14857",
        "OKRSKY_ZPRAC": "14857",
        "OKRSKY_ZPRAC_PROC": "100.00",
        "ZAPSANI_VOLICI": "8245962",
        "VYDANE_OBALKY": "5626824",
        "UCAST_PROC": "68.24",
        "ODEVZDANE_OBALKY": "5622815",
        "PLATNE_HLASY": "5578689",
        "PLATNE_HLASY_PROC": "99.22"
      },
      {
        "KOLO": "2",
        "OKRSKY_CELKEM": "14857",
        "OKRSKY_ZPRAC": "14857",
        "OKRSKY_ZPRAC_PROC": "100.00",
        "ZAPSANI_VOLICI": "8242566",
        "VYDANE_OBALKY": "5790001",
        "UCAST_PROC": "70.25",
        "ODEVZDANE_OBALKY": "5787540",
        "PLATNE_HLASY": "5759199",
        "PLATNE_HLASY_PROC": "99.51"
      }
    ],
    "source_edition": "NSS corrected"
  }
}
```
Use retained prez2023nss corrected totals. Original prez2023 bytes remain retained for provenance; do not load both as separate contests or reverse accepted upstream correction silently.

## 13. Not-held contest does not become a completed zero result

Derived: `data/research/czechia/events.json` /1185.

Source:

```json
{
  "source_id": "czechia--source-6600874107e19be73a0cf5e9",
  "input_path": "data/research/czechia/sources/volby.gov.cz/opendata/kv2006/KV2006_reg_20230224_csv.zip",
  "sha256": "5c2f1ed985cbba5d6960957965f960a8d65a6fd0aa0f880b5844b44f45d930d5",
  "archive_entry": "csv_od/kvrzcoco.csv",
  "locator": {
    "csv_record": 175
  }
}
```

Expected documentary row / future projection:

```json
{
  "office_id": "CZ-M510980-C",
  "history_key": "CZ-M510980-C::kv:20061020",
  "legal_outcome": "not_held",
  "selected_history_role": "other"
}
```
Office remains; historical indexed event is other/not_held. No result row may bind to this event; original blanks/zero placeholders remain retained-only.

## 14. EP one aggregation level only

Derived: `data/research/czechia/events.json` /0.

Source:

```json
{
  "source_id": "czechia--source-fc501619024492853e4418f2",
  "input_path": "data/research/czechia/sources/volby.gov.cz/pls/ep2004/vysledky",
  "sha256": "097db2905f6ddaeab28aebbe0600e4417ddbbd70e66b881856911713ef5b1321",
  "archive_entry": null,
  "locator": {
    "xpath": "/VYSLEDKY/CR"
  }
}
```

Expected documentary row / future projection:

```json
{
  "office_id": "CZ-EP",
  "history_key": "CZ-EP::ep:2004",
  "ballot_basis": "list_votes"
}
```
Only CR list results project. KRAJ sub-totals and elected members in the same XML are retained, not added again. EP other-tier proposal remains draft.

## 15. Unchanged re-import fingerprint

Exact Inventory `/hash_inputs` → SHA256 `3f4571dd4ac0eebbb7518de0ba08a0a2ac96a306be92bc2ee266559d13d8c3ec` → candidate release `country-package-czechia--sha256-3f4571dd4ac0eebbb7518de0ba08a0a2ac96a306be92bc2ee266559d13d8c3ec`. Recompute from exact bytes twice: same release fingerprint. Future second ingest creates a different actual attempt_id; this pack creates no attempts. Field-map revision alone is excluded from effective inputs. Importer execution **Not run**.

## 16. Corrected input preserves natural IDs

Derived: `data/research/czechia/results.jsonl.gz` JSONL line 9.

Source:

```json
{
  "archive_entry": "csv_od/kvros.csv",
  "input_path": "data/research/czechia/sources/volby.gov.cz/opendata/kv2006/KV2006_reg_20230224_csv.zip",
  "locator": {
    "csv_record": 19471
  },
  "sha256": "5c2f1ed985cbba5d6960957965f960a8d65a6fd0aa0f880b5844b44f45d930d5",
  "source_id": "czechia--source-6600874107e19be73a0cf5e9"
}
```

Expected documentary row / future projection:

```json
{
  "result_row_id": "result-0003e3c5e34a94ffdd43715f",
  "history_key": "CZ-M577375-C::kv:20061020"
}
```
Isolated future CI mutation: a Justin-accepted source/override change alters effective hash and release but not this result natural key. Expected-original guard must match exact old source scalar. No production override is included or accepted in this pack.

## 17. Unresolved evidence differs from broken resolved source FK

Derived: `data/research/czechia/office-register.json` /407.

Source:

```json
{
  "source_id": "czechia--source-6600874107e19be73a0cf5e9",
  "input_path": "data/research/czechia/sources/volby.gov.cz/opendata/kv2006/KV2006_reg_20230224_csv.zip",
  "sha256": "5c2f1ed985cbba5d6960957965f960a8d65a6fd0aa0f880b5844b44f45d930d5",
  "archive_entry": "csv_od/kvrzcoco.csv",
  "locator": {
    "csv_record": 399
  }
}
```

Expected documentary row / future projection:

```json
{
  "office_id": "CZ-M530255-C",
  "evidence": [
    {
      "source_id": "czechia--source-6600874107e19be73a0cf5e9",
      "input_path": "data/research/czechia/sources/volby.gov.cz/opendata/kv2006/KV2006_reg_20230224_csv.zip",
      "sha256": "5c2f1ed985cbba5d6960957965f960a8d65a6fd0aa0f880b5844b44f45d930d5",
      "archive_entry": "csv_od/kvrzcoco.csv",
      "locator": {
        "csv_record": 399
      }
    }
  ]
}
```
HISTORICAL-CODE-BINDING becomes unresolved_evidence on this real office locator, with C([]) if no primary successor document exists. In an isolated CI fixture, replacing its source_id with an absent ID must fail closed; do not downgrade broken resolved FKs into harmless unresolved citations. Execution Not run.

## 18. Failed import leaves other lineages serving

Derived: `data/research/czechia/office-register.json` /26.

Source:

```json
{
  "source_id": "czechia--source-c4c8c4c9bafa8913d93e2d0f",
  "input_path": "data/research/czechia/sources/volby.gov.cz/opendata/kv2026/KV2026reg20260915_csv.zip",
  "sha256": "cc1860670dfdcbc58a62492329510104e32a9abb3f5bc7238e0291948708e4b0",
  "archive_entry": "csv_od/kvrzcoco.csv",
  "locator": {
    "csv_record": 5
  }
}
```

Expected documentary row / future projection:

```json
{
  "office_id": "CZ-M500054-C"
}
```
Isolated CI poison removes this office FK while keeping its events. Future staging fails and is discarded; durable attempt status=failed, successful_release_id=NULL, publication_set_json=NULL. Last good Czech member and every non-Czech member remain serving. No failure transaction or filesystem rename executed here.

## 19. Incomplete refresh cannot delete absent offices

Derived: `data/research/czechia/office-register.json` /407.

Source:

```json
{
  "source_id": "czechia--source-6600874107e19be73a0cf5e9",
  "input_path": "data/research/czechia/sources/volby.gov.cz/opendata/kv2006/KV2006_reg_20230224_csv.zip",
  "sha256": "5c2f1ed985cbba5d6960957965f960a8d65a6fd0aa0f880b5844b44f45d930d5",
  "archive_entry": "csv_od/kvrzcoco.csv",
  "locator": {
    "csv_record": 399
  }
}
```

Expected documentary row / future projection:

```json
{
  "office_id": "CZ-M530255-C",
  "office_status": "historical"
}
```
Omission from a later partial package is not authorization to delete this office/history. Carry its rows and original retained sources or fail pending disposition. Do not reassign it to a similarly named current municipality.

## 20. Fixture exclusion and full tier set

Derived: `data/research/czechia/office-register.json` /1.

Source:

```json
{
  "source_id": "czechia--source-f3a17ac6e1a598a8077013cf",
  "input_path": "data/research/czechia/sources/volby.gov.cz/appdata/kz2024/odata/vysledky.xml",
  "sha256": "368e0d5a5e84d4004abf931b2df0ce16c86db4973ab750a9f732d09c6beced69",
  "archive_entry": null,
  "locator": {
    "xpath": "/VYSLEDKY/KRZAST[@CIS_KRZAST='1']"
  }
}
```

Expected documentary row / future projection:

```json
{
  "office_id": "CZ-K01-C",
  "tier_proposal": "regional"
}
```
Actual register IDs pass FIX-/FXT- prefix exclusion. Isolated fixture copied under FIX-CZ-K01-C must fail future production preflight. Tier classifier must use exact checked-in approved-later tier set, never calendar labels. No fixture added to research.

## 21. Military-to-civilian council evidence without a guessed edge

Derived: `data/research/czechia/office-register.json` /31.

Source:

```json
{
  "source_id": "czechia--source-c4c8c4c9bafa8913d93e2d0f",
  "input_path": "data/research/czechia/sources/volby.gov.cz/opendata/kv2026/KV2026reg20260915_csv.zip",
  "sha256": "cc1860670dfdcbc58a62492329510104e32a9abb3f5bc7238e0291948708e4b0",
  "archive_entry": "csv_od/kvrzcoco.csv",
  "locator": {
    "csv_record": 10
  }
}
```

Expected documentary row / future projection:

```json
{
  "office_id": "CZ-M500101-C",
  "name": "Zastupitelstvo obce — Bražec",
  "office_type": "municipal_council",
  "office_status": "current"
}
```
Bražec council is evidenced by its register row. No elected military-area body or predecessor/successor edge is inferred from geography or similarity. MILITARY-CIVILIAN-TRANSITION remains open.
