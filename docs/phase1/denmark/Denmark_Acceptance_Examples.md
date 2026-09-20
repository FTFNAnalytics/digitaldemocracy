# Denmark worked acceptance specifications

20 worked examples. Package checks are separate from importer tests: **all future execution examples Not run**. Exact locators and row shapes below refer to authored source-backed records; poison/mutation cases are clearly isolated specifications. Justin accepted the register on 2026-09-19; named research gates stay open.

## 1. Out-of-window office retained

DK-K101-C remains current.2029-11-20 is statutory next metadata; no 2029 event, no date-based deletion.

```json
{
  "source_locator": "data/research/denmark/office-register.json#/0",
  "office_id": "DK-K101-C",
  "name": "København — kommunalbestyrelse",
  "office_status": "current",
  "tier": "municipal",
  "next_election": {
    "label": "2029-11-20",
    "precision": "day",
    "certainty": "statutory",
    "year": 2029,
    "month": 11,
    "day": 20,
    "in_alert_window": false,
    "evidence": [
      {
        "input_path": "data/research/denmark/sources/ministry-local.html",
        "sha256": "34a72a6ed78753c0ce734a0e02b6a2e64eef1b2c20e027b8c37507f299f2372b",
        "json_pointer": null,
        "locator": "Hvornår er der valg? next election 20. november 2029"
      }
    ]
  }
}
```

## 2. Five regions plus preparatory successor

DK-R086-C is current as an elected preparatory body in 2026; operating region begins 2027. Same office and 2025 event survive the functional transition.

```json
{
  "source_locator": "data/research/denmark/events.json#/1848",
  "id_namespace": "cdd-observatory-v1",
  "office_id": "DK-R086-C",
  "history_key": "DK-R086-C::2025::2025-11-18::body",
  "event_id": "event-6bdd9d063d0545acb406022d",
  "date": {
    "label": "2025-11-18",
    "precision": "day",
    "certainty": "called"
  },
  "source_evidence": [
    {
      "input_path": "data/research/denmark/sources/AKVA3-meta.json",
      "sha256": "85ffae4331d04ff420b202ca750b83f22855cdfd70d824ed7961acab56ad95e9",
      "json_pointer": "/variables/0/values/1"
    },
    {
      "input_path": "data/research/denmark/sources/local-dates.html",
      "sha256": "f4ccffa0f10f59d56c336ea1cae9e560436d43995bb65f752a81b0865d2ec45d",
      "json_pointer": null,
      "locator": "election date list: 2025"
    }
  ]
}
```

## 3. Retiring region has no invented 2025 election

DK-R084-C latest event is 2021; current through 2026. Future retirement is not premature deletion. Assert no 2025 event for 084 or 085.

```json
{
  "source_locator": "data/research/denmark/events.json#/1842",
  "id_namespace": "cdd-observatory-v1",
  "office_id": "DK-R084-C",
  "history_key": "DK-R084-C::2021::2021-11-16::body",
  "event_id": "event-eef8e272601b9352701353ab",
  "date": {
    "label": "2021-11-16",
    "precision": "day",
    "certainty": "called"
  },
  "source_evidence": [
    {
      "input_path": "data/research/denmark/sources/AKVA3-meta.json",
      "sha256": "85ffae4331d04ff420b202ca750b83f22855cdfd70d824ed7961acab56ad95e9",
      "json_pointer": "/variables/0/values/2"
    },
    {
      "input_path": "data/research/denmark/sources/local-dates.html",
      "sha256": "f4ccffa0f10f59d56c336ea1cae9e560436d43995bb65f752a81b0865d2ec45d",
      "json_pointer": null,
      "locator": "election date list: 2021"
    }
  ]
}
```

## 4. Regional offices with empty upcoming numerator

From office-register.json select proposed_tier regional/current. Sixrows exist; next-date entries are 2029, outsidewindow. Expected in-window dated upcoming regional count 0; explicitly label empty, not data failure.

## 5. Historical-only council retained

Old Grenaa 707 is distinct from current Norddjurs 707. Historical flag does not remove the 1989–2001 events or returns.

```json
{
  "source_locator": "data/research/denmark/office-register.json#/273",
  "office_id": "DK-KPRE2007-707-C",
  "name": "Grenaa — kommunalbestyrelse",
  "office_status": "historical",
  "tier": "municipal",
  "next_election": null
}
```

## 6. County is regional, not municipal

DK-AMT015-C comes from AKVA3X amtsråd. The same county’s geographic aggregate in VALGK3X is not another municipal office.

```json
{
  "source_locator": "data/research/denmark/events.json#/3",
  "id_namespace": "cdd-observatory-v1",
  "office_id": "DK-AMT015-C",
  "history_key": "DK-AMT015-C::2001::2001-11-20::body",
  "event_id": "event-3679d1af9e31017d5f62edfa",
  "date": {
    "label": "2001-11-20",
    "precision": "day",
    "certainty": "called"
  },
  "source_evidence": [
    {
      "input_path": "data/research/denmark/sources/AKVA3X-meta.json",
      "sha256": "7ef7a1ab4f6654fc8c35949404f452feb26823b658d65b93922b4cb47e87172a",
      "json_pointer": "/variables/0/values/0"
    },
    {
      "input_path": "data/research/denmark/sources/local-dates.html",
      "sha256": "f4ccffa0f10f59d56c336ea1cae9e560436d43995bb65f752a81b0865d2ec45d",
      "json_pointer": null,
      "locator": "election date list: 2001"
    }
  ]
}
```

## 7. Ordinary history deduplicates totals and candidates

For DK-K101-C2025, VALGK3 party rows, KVRES totals and KV25 PERSelected personal votes join one HK; no extra events or additive vote vector.

```json
{
  "source_locator": "data/research/denmark/events.json#/141",
  "id_namespace": "cdd-observatory-v1",
  "office_id": "DK-K101-C",
  "history_key": "DK-K101-C::2025::2025-11-18::body",
  "event_id": "event-18b2bd10c2c98017e8e70fc1",
  "date": {
    "label": "2025-11-18",
    "precision": "day",
    "certainty": "called"
  },
  "source_evidence": [
    {
      "input_path": "data/research/denmark/sources/VALGK3-meta.json",
      "sha256": "53213ddedb3fcbda33e1cd57971efea496d0a75ad35b563dbd375972468c4e6b",
      "json_pointer": "/variables/0/values/3"
    },
    {
      "input_path": "data/research/denmark/sources/local-dates.html",
      "sha256": "f4ccffa0f10f59d56c336ea1cae9e560436d43995bb65f752a81b0865d2ec45d",
      "json_pointer": null,
      "locator": "election date list: 2025"
    }
  ]
}
```

## 8. Missing versus reported zero

This reported party has votes and exactly 0 seats; its absent share is NULL/unknown, never 0. Both elected-sex cells are retained as seat-sum evidence.

```json
{
  "locator": "data/research/denmark/results.json#/18",
  "result_row_id": "result-1e41b93a7a9e4cc8906f2761",
  "office_id": "DK-K101-C",
  "history_key": "DK-K101-C::2017::2017-11-21::body",
  "votes": 2874,
  "votes_status": "recorded",
  "seats": 0,
  "seats_status": "zero",
  "share": null,
  "share_status": "unknown",
  "source_evidence": [
    {
      "input_path": "data/research/denmark/sources/VALGK3-data.json",
      "sha256": "e6eba093d9b05224aa9068b3bfd0a1260a4b739ae8d1806454c01850df0b8e2b",
      "json_pointer": "/dataset/value/1839",
      "dimensions": {
        "OMRÅDE": "101",
        "PARTI": "DD",
        "STEMMER": "1",
        "ContentsCode": "VALGK3",
        "Tid": "2017"
      }
    },
    {
      "input_path": "data/research/denmark/sources/VALGK3-data.json",
      "sha256": "e6eba093d9b05224aa9068b3bfd0a1260a4b739ae8d1806454c01850df0b8e2b",
      "json_pointer": "/dataset/value/1863",
      "dimensions": {
        "OMRÅDE": "101",
        "PARTI": "DD",
        "STEMMER": "6",
        "ContentsCode": "VALGK3",
        "Tid": "2017"
      }
    },
    {
      "input_path": "data/research/denmark/sources/VALGK3-data.json",
      "sha256": "e6eba093d9b05224aa9068b3bfd0a1260a4b739ae8d1806454c01850df0b8e2b",
      "json_pointer": "/dataset/value/1869",
      "dimensions": {
        "OMRÅDE": "101",
        "PARTI": "DD",
        "STEMMER": "7",
        "ContentsCode": "VALGK3",
        "Tid": "2017"
      }
    }
  ]
}
```

## 9. Elected candidate is not elected borgmester

Candidate true elected_flag proves council membership only. Mayor is council-selected per retained PDFQ25–28. Do not create DK-…-M office or mayoral event.

```json
{
  "locator": "data/research/denmark/results.json#/13725",
  "result_row_id": "result-2abe23e798aac6eb6ff4afbd",
  "label": "Agnete Brandt Grann, Auning (V) (Norddjurs kommune)",
  "elected_flag": true,
  "source_evidence": [
    {
      "input_path": "data/research/denmark/sources/KV25PERS-meta.json",
      "sha256": "540d132eafec7fdfb144b36adea69f38e04fd71ee3e7811d9c6ce24a66e27820",
      "json_pointer": "/variables/0/values/0"
    },
    {
      "input_path": "data/research/denmark/sources/KV25PERS-data.json",
      "sha256": "55cdad218f6edc835671dd66065fca4013741318010ef0289c4ec169fd236006",
      "json_pointer": "/dataset/value/0",
      "dimensions": {
        "KANDIDAT": "1",
        "STEMMETYPE": "PERS",
        "ContentsCode": "KV25PERS",
        "Tid": "2025"
      }
    },
    {
      "input_path": "data/research/denmark/sources/KV25PERS-data.json",
      "sha256": "55cdad218f6edc835671dd66065fca4013741318010ef0289c4ec169fd236006",
      "json_pointer": "/dataset/value/1",
      "dimensions": {
        "KANDIDAT": "1",
        "STEMMETYPE": "PERSP",
        "ContentsCode": "KV25PERS",
        "Tid": "2025"
      }
    },
    {
      "input_path": "data/research/denmark/sources/KV25PERS-data.json",
      "sha256": "55cdad218f6edc835671dd66065fca4013741318010ef0289c4ec169fd236006",
      "json_pointer": "/dataset/value/2",
      "dimensions": {
        "KANDIDAT": "1",
        "STEMMETYPE": "PERSS",
        "ContentsCode": "KV25PERS",
        "Tid": "2025"
      }
    }
  ]
}
```

## 10. Party denominator versus all-valid-vote share

Candidate R /raw/source_measures/PERSS maps to share; PERSP stays raw because it uses party votes. Never substitute or add these shares.

```json
{
  "result_row_id": "result-2abe23e798aac6eb6ff4afbd",
  "source_measures": {
    "PERS": {
      "value": 195,
      "source_status": null,
      "evidence": {
        "input_path": "data/research/denmark/sources/KV25PERS-data.json",
        "sha256": "55cdad218f6edc835671dd66065fca4013741318010ef0289c4ec169fd236006",
        "json_pointer": "/dataset/value/0",
        "dimensions": {
          "KANDIDAT": "1",
          "STEMMETYPE": "PERS",
          "ContentsCode": "KV25PERS",
          "Tid": "2025"
        }
      }
    },
    "PERSP": {
      "value": 4,
      "source_status": null,
      "evidence": {
        "input_path": "data/research/denmark/sources/KV25PERS-data.json",
        "sha256": "55cdad218f6edc835671dd66065fca4013741318010ef0289c4ec169fd236006",
        "json_pointer": "/dataset/value/1",
        "dimensions": {
          "KANDIDAT": "1",
          "STEMMETYPE": "PERSP",
          "ContentsCode": "KV25PERS",
          "Tid": "2025"
        }
      }
    },
    "PERSS": {
      "value": 1,
      "source_status": null,
      "evidence": {
        "input_path": "data/research/denmark/sources/KV25PERS-data.json",
        "sha256": "55cdad218f6edc835671dd66065fca4013741318010ef0289c4ec169fd236006",
        "json_pointer": "/dataset/value/2",
        "dimensions": {
          "KANDIDAT": "1",
          "STEMMETYPE": "PERSS",
          "ContentsCode": "KV25PERS",
          "Tid": "2025"
        }
      }
    }
  }
}
```

## 11. Year precision survives

EP2024 table says sourceyear. Expected research_date label 2024, precisionyear, month/day NULL. No guessed 9 June date.

```json
{
  "source_locator": "data/research/denmark/events.json#/59",
  "id_namespace": "cdd-observatory-v1",
  "office_id": "DK-EP",
  "history_key": "DK-EP::2024::year::body",
  "event_id": "event-2cd2e1fc4f805295b254550c",
  "date": {
    "label": "2024",
    "precision": "year",
    "certainty": "called"
  },
  "source_evidence": [
    {
      "input_path": "data/research/denmark/sources/EVKOM1-meta.json",
      "sha256": "2ecf655b308ccdb69764cbe11de6afcef9eb6722ee02b6b95cfd7c98b1ad3068",
      "json_pointer": "/variables/2/values/3"
    }
  ]
}
```

## 12. Dates-only historic contest

Folketinget 1849 date is real and retained even without result rows. No zero-vote totals or fabricated party rows.

```json
{
  "source_locator": "data/research/denmark/events.json#/60",
  "id_namespace": "cdd-observatory-v1",
  "office_id": "DK-FT",
  "history_key": "DK-FT::1849::1849-12-04::body",
  "event_id": "event-1c36de294b3e4d92adb8a069",
  "date": {
    "label": "1849-12-04",
    "precision": "day",
    "certainty": "called"
  },
  "source_evidence": [
    {
      "input_path": "data/research/denmark/sources/national-dates.html",
      "sha256": "6f52e7aff6d2e825bd11035e744e383a38d006cadfe9e0f82c5a6de474a6b9fb",
      "json_pointer": null,
      "locator": "date list: 1849-12-04"
    }
  ]
}
```

## 13. Partial Realm national totals

FT2026 uses Denmark-proper data.175 derived elected seats must not become 179. Greenland/Faroe contributions stay named research gates.

```json
{
  "source_locator": "data/research/denmark/events.json#/131",
  "id_namespace": "cdd-observatory-v1",
  "office_id": "DK-FT",
  "history_key": "DK-FT::2026::2026-03-24::body",
  "event_id": "event-b89c746ce6fe0cf37d327be1",
  "date": {
    "label": "2026-03-24",
    "precision": "day",
    "certainty": "called"
  },
  "source_evidence": [
    {
      "input_path": "data/research/denmark/sources/national-dates.html",
      "sha256": "6f52e7aff6d2e825bd11035e744e383a38d006cadfe9e0f82c5a6de474a6b9fb",
      "json_pointer": null,
      "locator": "date list: 2026-03-24"
    }
  ]
}
```

## 14. Unresolved name binding remains explicit

This 98-row queue retains original candidate claims; no guessed office/source FK. Keep the source table and country-level research gap until reviewed binding.

```json
{
  "table": "KV01PERS",
  "candidate_code": "130",
  "original_label": "Annalis Vinther Jensen (M) (Thyborøn-Harboør Kommune)",
  "reason": "No unique municipality-name binding",
  "evidence": [
    {
      "input_path": "data/research/denmark/sources/KV01PERS-meta.json",
      "sha256": "2d43ea51b3fab3d3504edda81a8df8abb91b053a10326c6be175559d0c03c6fe",
      "json_pointer": "/variables/0/values/129"
    }
  ]
}
```

## 15. Broken resolved-source FK fails closed

Isolated future CI mutation: remove the S row named by an existing R evidence.input_path while retaining the evidence claim. Import must fail, not downgrade a previously resolved reference to an anonymous citation.

```json
{
  "real_result_row_id": "result-1e41b93a7a9e4cc8906f2761",
  "resolved_input_path": "data/research/denmark/sources/VALGK3-data.json",
  "expected": "failure before publication",
  "execution": "Not run"
}
```

## 16. Unchanged re-import

SameInventory/hash_inputs means samecandidate releaseR; attempt-UUID1 andattempt-UUID2 are symbolic test placeholders, not authored real attempts.

```json
{
  "fingerprint_sha256": "02f73c10bfe286d2438c417d9fa83782b96674f7bf4bbb2200735f0e01f80737",
  "candidate_release_id": "country-package-denmark--sha256-02f73c10bfe286d2438c417d9fa83782b96674f7bf4bbb2200735f0e01f80737",
  "expected": "different actual attempt IDs; identical release_id",
  "execution": "Not run"
}
```

## 17. Corrected import, guarded override

Future accepted Denmark correction requires exact expected-original scalar and full(N, oid, HK, rid), claims and acceptance. It changes effective override hash and Denmark R only; no production override is authored.

```json
{
  "real_target": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "DK-K101-C",
    "history_key": "DK-K101-C::2017::2017-11-21::body",
    "result_row_id": "result-1e41b93a7a9e4cc8906f2761"
  },
  "expected_original": 2874,
  "replacement": "not supplied; Justin/evidence required",
  "execution": "Not run"
}
```

## 18. Poison rollback and unrelated citations

Future CI inserts an isolated orphan result under a nonexistent FK, never research data. Entire staging publication rejected; durable failure retained; prior Denmark and all LatAm/NZ/Europe releases still served. No SQL executed.

## 19. Incomplete refresh is not deletion

Future fixture omits real DK-K101-C from a refresh. Retain its prior office, events, results and source dependency inputs unless explicit accepted withdrawal exists.

```json
{
  "source_locator": "data/research/denmark/office-register.json#/0",
  "office_id": "DK-K101-C",
  "name": "København — kommunalbestyrelse",
  "office_status": "current",
  "tier": "municipal",
  "next_election": {
    "label": "2029-11-20",
    "precision": "day",
    "certainty": "statutory",
    "year": 2029,
    "month": 11,
    "day": 20,
    "in_alert_window": false,
    "evidence": [
      {
        "input_path": "data/research/denmark/sources/ministry-local.html",
        "sha256": "34a72a6ed78753c0ce734a0e02b6a2e64eef1b2c20e027b8c37507f299f2372b",
        "json_pointer": null,
        "locator": "Hvornår er der valg? next election 20. november 2029"
      }
    ]
  }
}
```

## 20. Fixture exclusion and frozen-byte protection

Future fixture IDs FIX-* / FXT-* must fail before publication. This pack contains no fixture offices; read-only package validation never modifies existing repository, tiers, payloads or overrides. Execution importer/SQLite CI Not run.
