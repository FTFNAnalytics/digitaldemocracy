# Lithuania acceptance examples — Prompt AH (DRAFT)

These are documentary worked examples. Source-derived assertions are checked by the pack validator; importer/transaction/publication scenarios are **Not run** and are explicitly hypothetical. No synthetic mutation is stored as research.

## 1. Council and direct mayor remain separate

Exact derived locator: `data/research/lithuania/office-register.json#/0`.

```json
{
  "office_id": "LT-lsa-61244a98ecf1b6948da37f0c-C",
  "office_type": "municipal_council",
  "geography_id": "LT-lsa-61244a98ecf1b6948da37f0c",
  "current": true
}
```

Companion mayor `LT-lsa-61244a98ecf1b6948da37f0c-M` shares the geography and has `office_type=direct_mayor`. LSA table 1, row 2 and article 3 of the law support both offices. Expect two office rows and one geography, with both offices classified municipal.

Source locator(s):

```json
[
  {
    "input_path": "data/research/lithuania/sources/www.lsa.lt/nariai-savivaldybes/index.html",
    "sha256": "159b262d014f1249983a1d6f41206a21fea9e91f08f8d65838ec6a6c645b8796",
    "source_id": "lithuania--url-202f5f0e48e2fa72f67d6d3e",
    "locator": {
      "html_table": 1,
      "html_row": 2,
      "columns": [
        "Savivaldybė",
        "Meras",
        "Apskritis (regionas)"
      ]
    }
  },
  {
    "input_path": "data/research/lithuania/sources/e-seimas.lrs.lt/rs/actualedition/TAIS.5884/fQXuVTUDDS/index.html",
    "sha256": "2c168456ba632b5efb094a60a453b413a31b9c16fc7128db047275cac11ee1c4",
    "source_id": "lithuania--url-b620a02f09d0970ae12c48bb",
    "locator": {
      "article": 3,
      "paragraph": 6
    }
  }
]
```

## 2. All current offices survive the alert window

Exact derived locator: `data/research/lithuania/office-register.json#/1`.

```json
{
  "office_id": "LT-lsa-61244a98ecf1b6948da37f0c-M",
  "next_date_id": null,
  "next_date_resolution": "unknown"
}
```

Retain the mayor with no known upcoming date. The 2026-09-08–2028-03-08 window filters alerts only; it is not an office/history filter.

Source locator(s):

```json
[
  {
    "input_path": "data/research/lithuania/sources/www.lsa.lt/nariai-savivaldybes/index.html",
    "sha256": "159b262d014f1249983a1d6f41206a21fea9e91f08f8d65838ec6a6c645b8796",
    "source_id": "lithuania--url-202f5f0e48e2fa72f67d6d3e",
    "locator": {
      "html_table": 1,
      "html_row": 2,
      "columns": [
        "Savivaldybė",
        "Meras",
        "Apskritis (regionas)"
      ]
    }
  },
  {
    "input_path": "data/research/lithuania/sources/e-seimas.lrs.lt/rs/actualedition/TAIS.5884/fQXuVTUDDS/index.html",
    "sha256": "2c168456ba632b5efb094a60a453b413a31b9c16fc7128db047275cac11ee1c4",
    "source_id": "lithuania--url-b620a02f09d0970ae12c48bb",
    "locator": {
      "article": 3,
      "paragraph": 3
    }
  }
]
```

## 3. Historic event survives despite no upcoming alert

Exact derived locator: `data/research/lithuania/events.json#/0`.

```json
{
  "office_id": "LT-EP",
  "history_key": "LT-EP::EP2004",
  "event_id": "event-3d387a9f91ad362847a8fb6a",
  "cycle": "EP2004",
  "date": {
    "label": "2004",
    "precision": "year",
    "certainty": "called",
    "year": 2004,
    "month": null,
    "day": null
  },
  "election_mode": "direct_popular",
  "role": "historical",
  "event_kind": "ordinary",
  "legal_outcome": "unknown",
  "origins": [
    {
      "input_path": "data/research/lithuania/sources/results.elections.europa.eu/en/national-results/lithuania/2004-2009/constitutive-session/index.html",
      "sha256": "61b584f0033a94e33fde5ec565636831d1af8c12ccf50c9a70a4379ff8070c8c",
      "source_id": "lithuania--url-383d0a7becb098a8142eeae6",
      "locator": {
        "html_table": 3,
        "caption": "Composition of national seats"
      }
    }
  ],
  "raw": {
    "result_grain": "national_party_or_other_aggregate",
    "basis": "Published national party percentage; no vote denominator recovered",
    "source_status": "Constitutive session / official publisher aggregation; not numeric candidate-level certification"
  }
}
```

Retain this 2004 event and seven source aggregate/party seat rows. Year precision only; do not invent an election day or popular vote totals.

Source locator(s):

```json
[
  {
    "input_path": "data/research/lithuania/sources/results.elections.europa.eu/en/national-results/lithuania/2004-2009/constitutive-session/index.html",
    "sha256": "61b584f0033a94e33fde5ec565636831d1af8c12ccf50c9a70a4379ff8070c8c",
    "source_id": "lithuania--url-383d0a7becb098a8142eeae6",
    "locator": {
      "html_table": 3,
      "caption": "Composition of national seats"
    }
  }
]
```

## 4. Popular presidency: first round and runoff are one cycle

Exact derived locator: `data/research/lithuania/events.json#/10`.

```json
{
  "office_id": "LT-PRESIDENT",
  "history_key": "LT-PRESIDENT::PRE2019",
  "event_id": "event-161ed64ee44d4e92e516d7de",
  "proceeding_ids": [
    "proceeding-a9fb2536bc45cf80b6bbdcbc",
    "proceeding-c14a7c59881496c1c079089c"
  ]
}
```

One event, two proceedings,9 first-round and 2 runoff candidate rows. Do not sum both ballots into one denominator or create two offices.

Source locator(s):

```json
[
  {
    "input_path": "data/research/lithuania/sources/odihr.osce.org/sites/default/files/f/documents/a/e/433352.pdf",
    "sha256": "a1335ba28288c9d41df53f456ba7b17214b4ca0e1172a088fcab586a0aac240f",
    "source_id": "lithuania--url-87da88d80a3baff31f5a1d29",
    "locator": {
      "pdf_page": 25,
      "printed_page": 23,
      "section": "ANNEX I – FINAL RESULTS"
    }
  }
]
```

## 5. Conflicting percentage basis stays disputed

Exact derived locator: `data/research/lithuania/results.json#/100`.

```json
{
  "result_row_id": "result-aba5f2db8a9d584157da8c94",
  "votes": 446719,
  "share": 31.31,
  "share_status": "disputed",
  "evidence_status": "disputed"
}
```

ODIHR PDF page 25 reports 446,719 votes and 31.31%, but labels the denominator valid votes. The supplied valid-vote total of 1,416,622 gives a different percentage. Retain 31.31 as disputed; do not replace it with a computed percentage. Resolution requires accepted primary protocol evidence.

Source locator(s):

```json
[
  {
    "input_path": "data/research/lithuania/sources/odihr.osce.org/sites/default/files/f/documents/a/e/433352.pdf",
    "sha256": "a1335ba28288c9d41df53f456ba7b17214b4ca0e1172a088fcab586a0aac240f",
    "source_id": "lithuania--url-87da88d80a3baff31f5a1d29",
    "locator": {
      "pdf_page": 25,
      "table": "First Round",
      "row": 1
    }
  }
]
```

## 6. Missing versus reported zero

Exact derived locator: `data/research/lithuania/results.json#/90`.

```json
{
  "result_row_id": "result-fd05130a6947f037c74ad3cf",
  "votes": 26769,
  "seats": 0,
  "seats_status": "zero",
  "raw": {
    "PR_seats": null,
    "SMC_seats": null,
    "total_seats": 0,
    "dash_policy": "NULL, not fabricated zero",
    "votes_grain": "PR nationwide",
    "seats_grain": "whole chamber; do not infer seat-vote ratio"
  }
}
```

PDF page 20 prints total seats as 0, but PR and SMC cells contain dashes. Normalize total seats as 0/zero and the missing components as NULL/unknown. An unreported vote is likewise NULL, never an inferred zero.

Source locator(s):

```json
[
  {
    "input_path": "data/research/lithuania/sources/odihr.osce.org/sites/default/files/f/documents/e/a/477730_0.pdf",
    "sha256": "a895f0bb9be8d7686730f51d81aaf128b3a49d98ac7b0cdf158201d723ae28a9",
    "source_id": "lithuania--url-42fff0a20ce99dee2b9b0881",
    "locator": {
      "pdf_page": 20,
      "printed_page": 18,
      "table": "Political Party or Coalition",
      "row": 9
    }
  }
]
```

## 7. Seats-only historical return

Exact derived locator: `data/research/lithuania/results.json#/0`.

```json
{
  "result_row_id": "result-0d3deb4469bf70b6269128a4",
  "votes": null,
  "votes_status": "unknown",
  "share": null,
  "share_status": "unknown",
  "seats": 5
}
```

EP 2004 matrix supplies seats but no votes/share; expected NULL/unknown for both missing scalars. Do not reconstruct votes from seats.

Source locator(s):

```json
[
  {
    "input_path": "data/research/lithuania/sources/results.elections.europa.eu/en/national-results/lithuania/2004-2009/constitutive-session/index.html",
    "sha256": "61b584f0033a94e33fde5ec565636831d1af8c12ccf50c9a70a4379ff8070c8c",
    "source_id": "lithuania--url-383d0a7becb098a8142eeae6",
    "locator": {
      "html_table": 3,
      "tbody_row": 1,
      "party_code": "DP"
    }
  }
]
```

## 8. Month precision is preserved

Exact derived locator: `data/research/lithuania/events.json#/7`.

```json
{
  "event_id": "event-0f5a78d003fd58aac869a7b5",
  "date": {
    "label": "2016-10",
    "precision": "month",
    "certainty": "called",
    "year": 2016,
    "month": 10,
    "day": null
  }
}
```

The official narrative says October 2016. Preserve month precision and a NULL day. The first sitting on 14 November is not the election day. A later evidenced date refinement retains the history key and event ID.

Source locator(s):

```json
[
  {
    "input_path": "data/research/lithuania/sources/www.lrs.lt/SIPIS/portal/responsive/static_pages/kad8/files/k8.show-p_r=38243&p_k=2.html",
    "sha256": "70b01ab72fa7d511968bc142374bbd394cb9c0242798106f035f8b65d95904a1",
    "source_id": "lithuania--url-e5026ceccba3ed202f1b3c54",
    "locator": {
      "heading": "Seimas 2016–2020",
      "section": "Election outcome narrative"
    }
  }
]
```

## 9. Approximate share is not an exact numeric claim

Exact derived locator: `data/research/lithuania/results.json#/111`.

```json
{
  "result_row_id": "result-381e84b314b4bf879188393b",
  "candidate_or_list_label": "Visvaldas Matijošaitis",
  "share": null,
  "share_status": "unknown",
  "raw": {
    "share_text": "beveik 80",
    "approximate_share_not_promoted": true,
    "source_report_precision_not_certified_exact_percentage": true,
    "winner_only": true
  }
}
```

The LSA article describes the Kaunas 2019 share as nearly 80%. Expect NULL/unknown for the numeric share and preserve the exact raw phrase. Do not invent 80.00. A true winner flag does not supply a missing seat count.

Source locator(s):

```json
[
  {
    "input_path": "data/research/lithuania/sources/www.lsa.lt/naujienos/2019/03/05/per-pirmaji-tura-isrinkti-19-meru/index.html",
    "sha256": "ca736de3a91c215ab90cd61a029090e72999bbfc646ffebbc824b318e36f12ea",
    "source_id": "lithuania--url-8e96a5864455a85f6d40c89c",
    "locator": {
      "html_p": 2,
      "candidate": "Visvaldas Matijošaitis"
    }
  }
]
```

## 10. Occurrence without numeric results

Exact derived locator: `data/research/lithuania/events.json#/9`.

```json
{
  "event_id": "event-808c5d3f18a6690850c86634",
  "date": {
    "label": "2024-10-13",
    "precision": "day",
    "certainty": "called",
    "year": 2024,
    "month": 10,
    "day": 13
  },
  "result_count": 0
}
```

Seimas official page gives 13 and 27 October 2024. Retain 1 cycle+2 proceedings,0 recoveredresults. Missing results do not mean zero votes, no candidates, or an uncontested election.

Source locator(s):

```json
[
  {
    "input_path": "data/research/lithuania/sources/www.lrs.lt/sip/portal.show__c563564e58",
    "sha256": "772d6289e7ae7f4db5c467df44560cfc63b05bf08bc90883c7aa28297df82bdd",
    "source_id": "lithuania--url-7da9912ed11f84144e89cf67",
    "locator": {
      "heading": "Seimas 2024–2028",
      "section": "Election outcome narrative"
    }
  }
]
```

## 11. Partial 139-seat narrative is not padded

Exact derived locator: `data/research/lithuania/events.json#/6`.

```json
{
  "event_id": "event-4d903d92d04a8ec301133edd",
  "reported_seat_sum": 139
}
```

Source narrative sums 139 and mentions 2013 re-runs. Retain those claims and gap; do not add two fictional mandates/results or silently combine later faction membership.

Source locator(s):

```json
[
  {
    "input_path": "data/research/lithuania/sources/www.lrs.lt/SIPIS/portal/responsive/static_pages/kad7/kadencija2012.show7-p_r=15827&p_k=2.html",
    "sha256": "6f8ed42353004b43592ad08a38fc0950e8ef4814fdcb09312faa1cff28922a06",
    "source_id": "lithuania--url-1902f7b4d1a0c291dab7a264",
    "locator": {
      "heading": "Seimas 2012–2016",
      "section": "Election outcome narrative"
    }
  }
]
```

## 12. County labels do not create a regional tier

Exact derived locator: `data/research/lithuania/office-register.json#/0`.

```json
{
  "office_id": "LT-lsa-61244a98ecf1b6948da37f0c-C",
  "tier": "municipal",
  "regional_office_count": 0
}
```

The LSA county context Šiaulių is retained in geography.raw. It does not evidence an elected county office. An empty regional calendar is correct for this register.

Source locator(s):

```json
[
  {
    "input_path": "data/research/lithuania/sources/www.lsa.lt/nariai-savivaldybes/index.html",
    "sha256": "159b262d014f1249983a1d6f41206a21fea9e91f08f8d65838ec6a6c645b8796",
    "source_id": "lithuania--url-202f5f0e48e2fa72f67d6d3e",
    "locator": {
      "html_table": 1,
      "html_row": 2,
      "columns": [
        "Savivaldybė",
        "Meras",
        "Apskritis (regionas)"
      ]
    }
  },
  {
    "input_path": "data/research/lithuania/sources/e-seimas.lrs.lt/rs/actualedition/TAIS.5884/fQXuVTUDDS/index.html",
    "sha256": "2c168456ba632b5efb094a60a453b413a31b9c16fc7128db047275cac11ee1c4",
    "source_id": "lithuania--url-b620a02f09d0970ae12c48bb",
    "locator": {
      "article": 3,
      "paragraph": 6
    }
  }
]
```

## 13. Acting incumbent does not create a new election

Exact derived locator: `data/research/lithuania/office-register.json#/13`.

```json
{
  "office_id": "LT-lsa-ab0ef52353bf4d4eee179b45-M",
  "raw": {
    "lsa_row": 8,
    "incumbent_text_context_only": "laikinai einanti mero pareigas Violeta Grigorienė",
    "incumbent_not_an_election_result": true,
    "name_construction": "Exact source jurisdiction label plus statutory body descriptor; no invented translation."
  }
}
```

The LSA roster identifies an acting mayor in Druskininkai. That context alone creates no election, date or result. The underlying directly elected office remains while occupied temporarily by an acting person.

Source locator(s):

```json
[
  {
    "input_path": "data/research/lithuania/sources/www.lsa.lt/nariai-savivaldybes/index.html",
    "sha256": "159b262d014f1249983a1d6f41206a21fea9e91f08f8d65838ec6a6c645b8796",
    "source_id": "lithuania--url-202f5f0e48e2fa72f67d6d3e",
    "locator": {
      "html_table": 1,
      "html_row": 8,
      "columns": [
        "Savivaldybė",
        "Meras",
        "Apskritis (regionas)"
      ]
    }
  },
  {
    "input_path": "data/research/lithuania/sources/e-seimas.lrs.lt/rs/actualedition/TAIS.5884/fQXuVTUDDS/index.html",
    "sha256": "2c168456ba632b5efb094a60a453b413a31b9c16fc7128db047275cac11ee1c4",
    "source_id": "lithuania--url-b620a02f09d0970ae12c48bb",
    "locator": {
      "article": 3,
      "paragraph": 3
    }
  }
]
```

## 14. Direct-election introduction is not backfilled

Exact derived locator: `data/research/lithuania/office-register.json#/1`.

```json
{
  "office_id": "LT-lsa-61244a98ecf1b6948da37f0c-M",
  "office_type": "direct_mayor",
  "pre2015_popular_events": 0
}
```

Amendment index item 81 identifies effectiveness at the first meetings of newly elected councils in 2015; the LSA account of the first directly elected mayors corroborates that cycle. Do not fabricate a 2011 popular mayoral contest. Exact call and repeat-election records are required before normalizing 2015 events.

Source locator(s):

```json
[
  {
    "input_path": "data/research/lithuania/sources/www.lsa.lt/nariai-savivaldybes/index.html",
    "sha256": "159b262d014f1249983a1d6f41206a21fea9e91f08f8d65838ec6a6c645b8796",
    "source_id": "lithuania--url-202f5f0e48e2fa72f67d6d3e",
    "locator": {
      "html_table": 1,
      "html_row": 2,
      "columns": [
        "Savivaldybė",
        "Meras",
        "Apskritis (regionas)"
      ]
    }
  },
  {
    "input_path": "data/research/lithuania/sources/e-seimas.lrs.lt/rs/actualedition/TAIS.5884/fQXuVTUDDS/index.html",
    "sha256": "2c168456ba632b5efb094a60a453b413a31b9c16fc7128db047275cac11ee1c4",
    "source_id": "lithuania--url-b620a02f09d0970ae12c48bb",
    "locator": {
      "article": 3,
      "paragraph": 3
    }
  }
]
```

## 15. Historical-office absence is an open gate

Exact derived locator: `data/research/lithuania/counts.json`.

```json
{
  "historical_offices": 0,
  "historical_office_universe_complete": false
}
```

This pack recovers no separate extinct body. It makes no claim that reforms never happened. Future documented predecessors get stable temporal IDs and remain even after abolition; no guessed successors.

## 16. Unchanged fingerprint versus new attempt

Exact derived locator: `docs/phase1/lithuania/Lithuania_Input_Inventory.json`.

```json
{
  "fingerprint_sha256": "921981fee160b1f146ab20fdeae230b6928381190d124030f48ffbae5d8bf918",
  "candidate_release_id": "country-package-lithuania--sha256-921981fee160b1f146ab20fdeae230b6928381190d124030f48ffbae5d8bf918"
}
```

Future CI only: importing the same effective bytes twice must produce the same release ID and two distinct durable attempt IDs. No attempt is fabricated or executed here.

## 17. Corrected import preserves entity identity

Exact derived locator: `data/research/lithuania/results.json#/0`.

```json
{
  "result_row_id": "result-0d3deb4469bf70b6269128a4",
  "expected_original": 5
}
```

Synthetic CI mutation only: substitute an accepted, documented field change in isolated input. The fingerprint changes, while the office ID, history key and result ID remain stable. This example proposes no numeric replacement.

Source locator(s):

```json
[
  {
    "input_path": "data/research/lithuania/sources/results.elections.europa.eu/en/national-results/lithuania/2004-2009/constitutive-session/index.html",
    "sha256": "61b584f0033a94e33fde5ec565636831d1af8c12ccf50c9a70a4379ff8070c8c",
    "source_id": "lithuania--url-383d0a7becb098a8142eeae6",
    "locator": {
      "html_table": 3,
      "tbody_row": 1,
      "party_code": "DP"
    }
  }
]
```

## 18. Broken resolved source fails; unresolved token stays explicit

Exact derived locator: `data/research/lithuania/results.json#/0`.

```json
{
  "result_row_id": "result-0d3deb4469bf70b6269128a4",
  "source_id": "lithuania--url-383d0a7becb098a8142eeae6"
}
```

Future CI mutation: remove this known source and require failure and rollback. Never fabricate a foreign key. A genuinely unresolved upstream citation belongs in unresolved_evidence, attached to a real record without an invented source row.

Source locator(s):

```json
[
  {
    "input_path": "data/research/lithuania/sources/results.elections.europa.eu/en/national-results/lithuania/2004-2009/constitutive-session/index.html",
    "sha256": "61b584f0033a94e33fde5ec565636831d1af8c12ccf50c9a70a4379ff8070c8c",
    "source_id": "lithuania--url-383d0a7becb098a8142eeae6",
    "locator": {
      "html_table": 3,
      "tbody_row": 1,
      "party_code": "DP"
    }
  }
]
```

## 19. Poison rollback preserves all served lineages

Exact derived locator: `data/research/lithuania/office-register.json#/0`.

```json
{
  "office_id": "LT-lsa-61244a98ecf1b6948da37f0c-C",
  "lineage_id": "country-package-lithuania"
}
```

Future CI only: a broken foreign key or invalid scalar aborts staging, while the durable attempt ledger records failure. The previous Lithuania and other LatAm, NZ and Europe publication members remain available. SQLite execution is Not run here.

Source locator(s):

```json
[
  {
    "input_path": "data/research/lithuania/sources/www.lsa.lt/nariai-savivaldybes/index.html",
    "sha256": "159b262d014f1249983a1d6f41206a21fea9e91f08f8d65838ec6a6c645b8796",
    "source_id": "lithuania--url-202f5f0e48e2fa72f67d6d3e",
    "locator": {
      "html_table": 1,
      "html_row": 2,
      "columns": [
        "Savivaldybė",
        "Meras",
        "Apskritis (regionas)"
      ]
    }
  },
  {
    "input_path": "data/research/lithuania/sources/e-seimas.lrs.lt/rs/actualedition/TAIS.5884/fQXuVTUDDS/index.html",
    "sha256": "2c168456ba632b5efb094a60a453b413a31b9c16fc7128db047275cac11ee1c4",
    "source_id": "lithuania--url-b620a02f09d0970ae12c48bb",
    "locator": {
      "article": 3,
      "paragraph": 6
    }
  }
]
```

## 20. Incomplete refresh and fixture exclusion

Exact derived locator: `data/research/lithuania/office-register.json#/0`.

```json
{
  "office_id": "LT-lsa-61244a98ecf1b6948da37f0c-C",
  "record_state": "active"
}
```

Future CI only: an office omitted from a partial refresh remains available; omission is not deletion. A fixture identity injected into isolated test input must be rejected from production research. This pack contains no fixture rows.

Source locator(s):

```json
[
  {
    "input_path": "data/research/lithuania/sources/www.lsa.lt/nariai-savivaldybes/index.html",
    "sha256": "159b262d014f1249983a1d6f41206a21fea9e91f08f8d65838ec6a6c645b8796",
    "source_id": "lithuania--url-202f5f0e48e2fa72f67d6d3e",
    "locator": {
      "html_table": 1,
      "html_row": 2,
      "columns": [
        "Savivaldybė",
        "Meras",
        "Apskritis (regionas)"
      ]
    }
  },
  {
    "input_path": "data/research/lithuania/sources/e-seimas.lrs.lt/rs/actualedition/TAIS.5884/fQXuVTUDDS/index.html",
    "sha256": "2c168456ba632b5efb094a60a453b413a31b9c16fc7128db047275cac11ee1c4",
    "source_id": "lithuania--url-b620a02f09d0970ae12c48bb",
    "locator": {
      "article": 3,
      "paragraph": 6
    }
  }
]
```

## 21. Unrelated citations remain owned by their release

Exact derived locator: `data/research/lithuania/country.json`.

```json
{
  "country_id": "lithuania",
  "lineage_id": "country-package-lithuania"
}
```

A future publication replaces only the Lithuania member. A LatAm office continues citing its own `latin-america-fe5e91689def` member, not the latest publication receipt. Execution of this future CI scenario is Not run.
