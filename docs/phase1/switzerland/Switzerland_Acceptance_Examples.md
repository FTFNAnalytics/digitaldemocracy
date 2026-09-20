# Switzerland acceptance examples

All shapes below are expected documentary/CI outcomes, not executed Atlas rows. CI mutation cases are labelled. O/G/E/R/Q/U/A aliases are defined in the Field Map. Each real ID belongs to this pack. Justin accepted the evidenced subset on 2026-09-19; full-register certification remains OPEN.

## 1. Unchanged research re-import

Source: `Inventory /hash_inputs`.

```json
{
  "lineage_id": "country-package-switzerland",
  "candidate_release_id": "country-package-switzerland--sha256-24a99825316890d8cba0e5b1bf7e76f5072002b1c0811ebbeaa67f2a7d4c9ff6",
  "future_attempt_A": "distinct from future_attempt_B",
  "executed_attempts": 0
}
```

Assert: Recompute identical fingerprint; two actual future invocations use different attempt IDs. Evidenced-subset tiers are accepted-with-holds; full-register certification remains OPEN.


## 2. Corrected import changes release, preserves identity

Source: `O /0`.

```json
{
  "office_id": "CH-CT-AG-E",
  "old_fingerprint": "24a99825316890d8cba0e5b1bf7e76f5072002b1c0811ebbeaa67f2a7d4c9ff6",
  "corrected_release": "H(actual reviewed effective-input bytes), not fabricated here"
}
```

Assert: Isolated CI mutation only: accept a reviewed correction; preserve office key and original source claim; new release differs.


## 3. Honest regional register without invented upcoming calendar

Source: `O /51`.

```json
{
  "office_id": "CH-CT-ZH-L",
  "tier": "regional",
  "next_date_id": null,
  "regional_offices_in_pack": 52,
  "authored_prospective_events": 0
}
```

Assert: Do not fabricate dates to populate a regional numerator. Tier comes solely from checked-in T after acceptance.


## 4. Out-of-window office and month-only expectation retained

Source: `O /2265; {"input_path":"sources/ti-loc.html","locator":{"article":"10","text_anchor":"Art. 10"},"sha256":"a529c0a19dfba03915150cf04072f30e0c7e930064ce85a6bc39a892e7f3321f"}`.

```json
{
  "office_id": "CH-GM5002-E",
  "precision": "month",
  "year": 2028,
  "month": 4,
  "day": null,
  "certainty": "expected",
  "in_alert_window": false
}
```

Assert: 2024 source cycle + LOC article10 supports expected April2028, not a called polling day. Keep office and all history; no new event.


## 5. Historic predecessor survives

Source: `O /233; {"input_path":"sources/bfs-dam-36552088.bin","locator":{"row":26,"sheet":"2017"},"sha256":"f5ae27667019dc8d0d8459407cf9fdf81d349b516b9ef7fe82d6933cdf511f27"}`.

```json
{
  "office_id": "CH-GM0133-E",
  "office_status": "historical",
  "abolition_day": null,
  "record_state": "active"
}
```

Assert: Preserve observed historical code/body; absence from latest BFS is not an exact merger or abolition date.


## 6. All 26 cantonal units, six one-seat States cantons

Source: `sources/bfs-dam-28765099.bin; 2023!I5:I30`.

```json
{
  "office_id": "CH-FED-SR",
  "national_seats_source_total": 46,
  "one_seat_cantons": [
    "OW",
    "NW",
    "BS",
    "BL",
    "AR",
    "AI"
  ]
}
```

Assert: No52-seat inference; cantonal components remain attached to the single chamber office.


## 7. Indirect federal executive excluded

Source: `sources/federal-national.html and sources/federal-states.html; report scope`.

```json
{
  "popular_federal_council_offices": 0,
  "popular_federal_council_events": 0
}
```

Assert: No popular Federal Council event or dummy executive office; election by Federal Assembly is noted, not converted to a popular contest.


## 8. Citizen assembly is not an elected parliament

Source: `A /0; sources/law-BE.json art24 / sources/law-TI sourceLOC art42`.

```json
{
  "unproven_legislature_office_id": null,
  "coverage_complete": false
}
```

Assert: A geography and generic law allowing a parliament do not prove that the commune instituted one.


## 9. Fribourg syndic not fabricated as popular mayor

Source: `O /898; sources/law-FR.json art58`.

```json
{
  "office_id": "CH-GM2008-E",
  "communal_executive": "retained",
  "invented_popular_syndic": false
}
```

Assert: Executive elected by voters; syndic chosen within executive. No automatic presidency clone.


## 10. Neuchâtel executive mode hold

Source: `O /2626; sources/ne-law.pdf pages5–6,arts25–26`.

```json
{
  "office_id": "CH-GM6404-E",
  "tier": "other",
  "human_review_required": true,
  "invented_popular_event": false
}
```

Assert: Retain evidenced body without claiming popular election; local rule acceptance remains open.


## 11. Basel political bodies are not duplicated

Source: `sources/bfs-dam-36552093.bin; 2025 row10`.

```json
{
  "office_id": "CH-CT-BS-L",
  "duplicate_CH_GM2701_L": false,
  "municipal_source_observation": "retained overlap"
}
```

Assert: Same100-seat political legislature is cantonal. Separate civic Bürgergemeinde not silently merged.


## 12. Missing votes versus explicit zero seats

Source: `R /7; {"input_path":"sources/bfs-dam-28765099.bin","locator":{"column":"J","row":19,"sheet":"2007"},"sha256":"a19722729dd8c1b606d383b7ff9c83b60e718889a52dbcfee497a2b5ffe04b3c"}`.

```json
{
  "result_row_id": "result-007577c428b9fb2b9558511e",
  "office_id": "CH-FED-SR",
  "history_key": "CH-FED-SR::2007::SH",
  "seats": 0,
  "seats_status": "zero",
  "votes": null,
  "votes_status": "unknown"
}
```

Assert: Zero seats remains0/zero; votes stayNULL/unknown. No inferred vote denominator.


## 13. First round and runoff remain one event

Source: `Q /3; {"input_path":"sources/bfs-dam-28765111.bin","locator":{"row":59,"sheet":"2015"},"sha256":"08676ca55d16980e796bc7edbbb82b0377eedec76c3e5c5144a6b6da5024d7a8"}`.

```json
{
  "office_id": "CH-FED-SR",
  "history_key": "CH-FED-SR::2015::OW",
  "proceeding_id": "proceeding-0c568480b428795099a3d21c",
  "kind": "runoff",
  "sequence_no": 2
}
```

Assert: Proceeding sequence2 does not add a second completed cycle or annul first round. Supplied round day survives raw; event may remain year-precision.


## 14. Year-only historic precision

Source: `E /135; {"input_path":"sources/bfs-dam-36654111.bin","locator":{"row":9,"sheet":"2007-2010"},"sha256":"2883936b889d4b42d039afa004fb217781e3924003f1e7629532176ed3daa37a"}`.

```json
{
  "event_id": "event-1a478be47fd08946e2b3dd93",
  "date_label": "2007",
  "precision": "year",
  "month": null,
  "day": null
}
```

Assert: NoJanuary1 or presumed common Swiss polling date; preserve year precision.


## 15. Conflicting scalar withheld with original claims

Source: `R /562; conflicting-claims.json`.

```json
{
  "result_row_id": "result-122d859682a24cba2cb9d774",
  "office_id": "CH-FED-SR",
  "history_key": "CH-FED-SR::2007::SH",
  "votes": null,
  "seats": null,
  "share": null,
  "evidence_status": "disputed"
}
```

Assert: Review numeric variants; no newest-snapshot preference or silent numeric correction.


## 16. Unresolved research question versus broken resolved FK

Source: `U /0; data/research/switzerland/commune-coverage-audit.json#/0`.

```json
{
  "original_token": "CH-GM0001 institutional roster incomplete",
  "record_key": "rec-c6a67939b120a04a10a5c7cf3f3a61dc3068c5581d9762bb82126291983d6b23",
  "broken_source_id": "isolated CI poison only"
}
```

Assert: Real gap token binds real geography. Removing a resolved S row must fail staging and leave last good release serving; never invent a replacement source.


## 17. Incomplete refresh retains omitted office

Source: `O /2265`.

```json
{
  "retained_office_id": "CH-GM5002-E",
  "implicit_deletions": 0
}
```

Assert: Isolated CI omission retains old record and its inherited retained-input dependencies; no supersession without accepted evidence.


## 18. Fixture rejection

Source: `O /0; isolated CI mutation of office_id only`.

```json
{
  "test_only_office_id": "FIX-CH-POISON",
  "accepted_fixture_rows": 0
}
```

Assert: Reject fixture tokens before staging. Synthetic test ID is not in register/tiers/vectors.


## 19. Unrelated lineage citation remains stable

Source: `Inventory /lineage_id and future publication_release set`.

```json
{
  "attempted_lineage": "country-package-switzerland",
  "latin_america_release_change": false,
  "new_zealand_release_change": false,
  "other_europe_release_change": false
}
```

Assert: Future Switzerland import replaces only its publication member; no latest-global-receipt citation ownership.


## 20. Government composition is not a decisive return

Source: `sources/bfs-dam-36654116.bin; 2026!B4:S4`.

```json
{
  "office_id": "CH-CT-ZH-E",
  "source_Wahljahr": 2023,
  "projected_decisive_result_rows": 0,
  "snapshot_numbers": "retained_input"
}
```

Assert: Government replacement/party-switch composition is not an election-result vector. ReportedWahljahr anchor remains roleother; original cells preserved.


## 21. Multilingual geography and canton transfer

Source: `G /237`.

```json
{
  "geography_id": "CH-GM0371",
  "name": "Biel/Bienne",
  "invented_translation": false
}
```

Assert: Preserve source Biel/Bienne orthography. For every code retain all name/parent claims; same-code canton transfer never generates a new office key.
