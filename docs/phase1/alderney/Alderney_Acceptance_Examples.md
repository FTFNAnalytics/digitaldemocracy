# Alderney worked acceptance examples

**Documentation specifications; importer/publication execution Not run.** Main `73b69bdd607c2ed5f70a93b52b5cd0c66f4155c9`. Examples1–7 use actual package identities/locators. Examples8–10 are isolated future CI scenarios, not additional research or accepted overrides. Locators name original input bytes, not a web page freshly fetched here.

Row-shape blocks show typed columns. Unless shown, add owning lineage_id=country-package-alderney, release_id=R from Example1 and full raw_json envelope using the stated original row/locator, as defined in the field map. Tables without raw_json (e.g. retained_input) follow their exact per-column contract instead. IDs/dates/numbers shown below are derived only from real supplied rows; no database load is implied.

## Example 1 — Reproducible unchanged-release identity

[Alderney_Input_Inventory.json](Alderney_Input_Inventory.json) enumerates all21 exact /hash_inputs/inputs descriptors, both schema_inputs, canonical byte string and approved T hash `e321762fb97ea8971e999fb699113312c80ddf171bcc3f40cd929252c6cd7fb7`. Two future unchanged imports must generate different actual attempt-UUIDv4 IDs but share this candidate dataset_release shape:

```json
{
  "lineage_id": "country-package-alderney",
  "release_id": "country-package-alderney--sha256-c692ba2d1329e5af1a23f3f9484771b330bd8388348197552aef56dd25bc2706",
  "fingerprint_sha256": "c692ba2d1329e5af1a23f3f9484771b330bd8388348197552aef56dd25bc2706",
  "adapter_version": "atlas-alderney-field-map/1",
  "method_version": "atlas-preserve-evidence/1",
  "schema_version": "atlas-master/1",
  "research_snapshot_label": "2026-09-11",
  "upstream_release_id": "country-package-alderney",
  "research_coverage_complete": 0
}
```

hash_inputs_json equals the companion canonical string exactly; validated_counts_json is recomputed against its verified_counts before publication. One immutable release row per fingerprint. Actual attempt timestamps/operator are operational input, not invented here and not hash inputs. Candidate R is not a published release.

## Example 2 — Two conditional dates, two prospective events

STATES date: `data/countries/alderney/tables/office-register.json#/rows/1/4` (sheet `Office register`, workbook source_row=125; SHA-256 `46dcd2afececa8e2ab46383d306003b941e6ca0ef9dac8e77dfc4435444a72f9`). PLEB date: `data/countries/alderney/tables/office-register.json#/rows/0/4` (sheet `Office register`, workbook source_row=124; SHA-256 `46dcd2afececa8e2ab46383d306003b941e6ca0ef9dac8e77dfc4435444a72f9`). Cal confirmation is `/rows/0/4` and `/rows/0/5` respectively; certainty source: `data/countries/alderney/tables/election-calendar.json#/rows/0/6` (sheet `Election calendar`, workbook source_row=70; SHA-256 `ed18050130ba80a3726c45154d841c0f3c64b3d505437f62fa34f1c2540623bc`). Exact status “Official July proposal; final resolution not yet verified”; both O.Calendar evidence and Cal.Source URL resolve to the actual official proposal URL. README Evidence and interpretation explains these are different contests.

Expected research_date rows (STATES then PLEB):
```json
[
  {
    "date_id": "date-ff80f2bcf352db84b3fd35265a67c4353ff39a17a88b91c63ff5195029045745",
    "label": "2026-11-21",
    "precision": "day",
    "certainty": "conditional",
    "year": 2026,
    "month": 11,
    "day": 21,
    "range_start_id": null,
    "range_end_id": null
  },
  {
    "date_id": "date-ccd6826dfd61d30518eda1a224817bc1c8e121531c5076deafcef8e8ce3446a7",
    "label": "2026-12-12",
    "precision": "day",
    "certainty": "conditional",
    "year": 2026,
    "month": 12,
    "day": 12,
    "range_start_id": null,
    "range_end_id": null
  }
]
```

Expected election_event rows:
```json
[
  {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "GG-ALD-STATES",
    "history_key": "next-166ad22fe0872fb2402d3f93",
    "event_id": "next-166ad22fe0872fb2402d3f93",
    "date_id": "date-ff80f2bcf352db84b3fd35265a67c4353ff39a17a88b91c63ff5195029045745",
    "date_resolution": "resolved",
    "event_kind": "unknown",
    "selected_history_role": "none",
    "electoral_system": null,
    "comparability": "Three reported actual events plus three ordinary-cycle outcomes; primary numerical comparison pending; 3 historical entries",
    "ballot_basis": "unknown",
    "share_unit": "percent_0_100",
    "legal_outcome": "not_held",
    "record_state": "active",
    "state_note": null
  },
  {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "GG-ALD-PLEB",
    "history_key": "next-f2267589582f25eae0c65e96",
    "event_id": "next-f2267589582f25eae0c65e96",
    "date_id": "date-ccd6826dfd61d30518eda1a224817bc1c8e121531c5076deafcef8e8ce3446a7",
    "date_resolution": "resolved",
    "event_kind": "unknown",
    "selected_history_role": "none",
    "electoral_system": null,
    "comparability": "Three full secondary candidate returns; primary numerical comparison pending; 3 historical entries",
    "ballot_basis": "unknown",
    "share_unit": "percent_0_100",
    "legal_outcome": "not_held",
    "record_state": "active",
    "state_note": null
  }
]
```

Expected office date projections:
```json
[
  {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "GG-ALD-STATES",
    "next_date_id": "date-ff80f2bcf352db84b3fd35265a67c4353ff39a17a88b91c63ff5195029045745",
    "next_date_resolution": "resolved",
    "next_history_key": "next-166ad22fe0872fb2402d3f93"
  },
  {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "GG-ALD-PLEB",
    "next_date_id": "date-ccd6826dfd61d30518eda1a224817bc1c8e121531c5076deafcef8e8ce3446a7",
    "next_date_resolution": "resolved",
    "next_history_key": "next-f2267589582f25eae0c65e96"
  }
]
```

Both retain **day precision / conditional certainty**; resolved means a selected supplied date, not final legal approval. No range, runoff, duplicated office-owned date or prospective result row. Same source may support both separate event/date claims; each target/occurrence is distinct. No artificial called/statutory status or invented formal post-plebiscite proceeding.

## Example 3 — Selected replacement event and candidate marks

Source historical States event: `data/countries/alderney/tables/history-index.json#/rows/3` (sheet `History index`, workbook source_row=371; SHA-256 `69b395678fad074a0166fe7c2da5eb370999a9b05f9b91d551a6d8b8a588c56f`). Kind evidence BF `briefings/GG-ALD-STATES.html` h3_index0 inside Recorded historical entries, “2025-03-08 — Replacement election”, SHA-256 `2c8a28053072aa7c4cbdbca20baea69c69779355ac5874c6af201f5a7fe42689`. Result: `data/countries/alderney/tables/detailed-returns.json#/rows/12` (sheet `Detailed returns`, workbook source_row=3857; SHA-256 `e29313264a4ef724736d6dd34074a24888168264af414f91f0c7d53af2c2ea8f`). Exact source URL `https://www.bailiwickexpress.com/news-ge/pair-elected-to-states-of-alderney/`, catalogue S93e7bbcb1f.

Expected historical event:
```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "GG-ALD-STATES",
  "history_key": "GG-ALD-STATES::2025::2025-03-08",
  "event_id": "event-1e4346e3f46e487f877780f8",
  "date_id": "date-f1311bb3d4c70d101faebecab0a79a7923b6235eddd3cbdcb6f08d0043c6adb4",
  "date_resolution": "resolved",
  "event_kind": "special",
  "selected_history_role": "selected",
  "electoral_system": null,
  "comparability": "Full reported party/candidate vector · Unscored / inapplicable",
  "ballot_basis": "candidate_marks",
  "share_unit": "percent_0_100",
  "legal_outcome": "unknown",
  "record_state": "active",
  "state_note": null
}
```

Expected date:
```json
{
  "date_id": "date-f1311bb3d4c70d101faebecab0a79a7923b6235eddd3cbdcb6f08d0043c6adb4",
  "label": "2025-03-08",
  "precision": "day",
  "certainty": "unknown",
  "year": 2025,
  "month": 3,
  "day": 8,
  "range_start_id": null,
  "range_end_id": null
}
```

Expected result:
```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "GG-ALD-STATES",
  "history_key": "GG-ALD-STATES::2025::2025-03-08",
  "result_row_id": "event-1e4346e3f46e487f877780f8-r0",
  "proceeding_id": null,
  "country_id": "alderney",
  "candidate_or_list_label": "Jeannie Cameron",
  "original_party_label": "Independent",
  "original_party_code": "Independent",
  "party_namespace": "alderney/2025",
  "party_mapping_id": null,
  "votes": 501,
  "votes_status": "recorded",
  "share": 38.92773892773893,
  "share_status": "recorded",
  "share_unit": "percent_0_100",
  "seats": 1,
  "seats_status": "recorded",
  "elected_flag": null,
  "is_substitute": null,
  "evidence_status": "recorded"
}
```

501 is supplied candidate marks, not unique electors. 38.92773892773893 is preserved at source precision; no party-share/turnout inference. Legal outcome remains unknown; local-news evidence grade is not certification. Replacement→special, not repeated, and no synthetic proceeding is necessary. Independent stays a contextual label, not a concordance grouping all candidates.

## Example 4 — Recorded zero seats and genuinely missing values

Actual zero-seat result: `data/countries/alderney/tables/detailed-returns.json#/rows/2` (sheet `Detailed returns`, workbook source_row=3847; SHA-256 `e29313264a4ef724736d6dd34074a24888168264af414f91f0c7d53af2c2ea8f`). Expected result shape:
```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "GG-ALD-PLEB",
  "history_key": "GG-ALD-PLEB::2024::2024-12-07",
  "result_row_id": "event-7fa40c8eb8a5b88a5a05ec45-r2",
  "proceeding_id": null,
  "country_id": "alderney",
  "candidate_or_list_label": "Stuart Clark",
  "original_party_label": "Independent",
  "original_party_code": "Independent",
  "party_namespace": "alderney/2024",
  "party_mapping_id": null,
  "votes": 260,
  "votes_status": "recorded",
  "share": 21.757322175732217,
  "share_status": "recorded",
  "share_unit": "percent_0_100",
  "seats": 0,
  "seats_status": "zero",
  "elected_flag": null,
  "is_substitute": null,
  "evidence_status": "recorded"
}
```

13 supplied result seats are zero; 14 are one. All27 votes/shares/seats are present, so no missing numeric D value is claimed. elected_flag/is_substitute are not supplied booleans and remain NULL, not false.

Actual missing scores: O `/rows/0/10` and `/rows/1/10` (Competition score) are null, as are weighted gaps/Pedersen values. Preserve those cells inside retained_input.payload_json; do not turn them into scores0. BF States h3_index4 in Additional ordinary-cycle context has unopposed 2022 votes/shares shown as em dashes; retain exact HTML, not zero-vote typed results. Synthetic missing-result probes are in Example10.

## Example 5 — Territory, approved other tier, empty regional numerator

Country metadata: `data/countries/alderney/manifest.json#/country_code`=GG-ALD, /country=Alderney, /region=Europe; README explicitly calls it a territory/internal identifier. Expected country projection: country_id=alderney,country_code=GG-ALD,polity_kind=territory,region_id=europe,coverage_status=partial,screening_as_of_label=NULL. No sovereign parent-country row is fabricated.

T `/classifications/0` binds GG-ALD-PLEB; original approved hash `e321762fb97ea8971e999fb699113312c80ddf171bcc3f40cd929252c6cd7fb7`. Expected classification:
```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "GG-ALD-PLEB",
  "tier": "other",
  "review_status": "approved",
  "rationale": "Plebiscite nominating two Guernsey States representatives is territorial representation. Accepted Phase 0 Prompt A maps GG-ALD-PLEB to other. The two representatives are a description of this single office_id; do not mint two IDs from the seat count.",
  "classification_path": "schemas/atlas/tiers/alderney.json",
  "classification_kind": "tier_classification",
  "classification_sha256": "e321762fb97ea8971e999fb699113312c80ddf171bcc3f40cd929252c6cd7fb7"
}
```

Two offices remain two, despite “two representatives” and “five of ten ordinary seats.” All tiers=other; country-scoped tier=regional query returns [] and count0. Label “No regional tier in this package; two territorial office/contest records classified other.” Unknown regional denominator is not zero or a percentage. Conditional dates do not make either office regional. This is a passing empty-state case.

## Example 6 — Canonical sources and metadata/date limitations

Catalogue origin: `data/countries/alderney/tables/sources.json#/rows/0` (sheet `Sources`, workbook source_row=7831; SHA-256 `2f5834dbb9ac87ba23559bb111b85e8bcf2c06b2b63aa8c44e877076f3f758bd`). Expected source:
```json
{
  "country_id": "alderney",
  "source_namespace": "country-package-alderney",
  "source_id": "alderney--S5951ed7d0e",
  "publisher": null,
  "title": "Alderney 2024-12-07 election result",
  "url": "https://en.wikipedia.org/wiki/2024_Alderney_general_election",
  "checked_as_of_label": "2026-09-08",
  "evidence_grade": "Secondary reference",
  "file_sha256": null,
  "locator": null,
  "data_rights": "unknown"
}
```

This source title mentions 2024-12-07 but also supports States H `/rows/4/3=2024-11-16`. Preserve both exact source title and actual event date; do not overwrite dates from titles or repair source bytes. Keep bridge URL alias pointing to this canonical source.

One inline source, `source-links.json#/urls_without_master_source_row/0`, is the official proposal URL. Expected source_id=`alderney--url-5eba820f0cac748728ed06f2`, url exact, title/publisher/checked_as_of_label/file_sha256/locator=NULL, data_rights=unknown, evidence_grade=NULL. No invented source catalogue ID/title/access date. Calendar claim JSON carries the real O/Cal origins and conditional qualifier.

## Example 7 — Inert extra history context and absent observation tables

Original States briefing retained_input shape:
```json
{
  "input_path": "data/countries/alderney/briefings/GG-ALD-STATES.html",
  "input_kind": "artifact",
  "sha256": "2c8a28053072aa7c4cbdbca20baea69c69779355ac5874c6af201f5a7fe42689",
  "byte_count": 10197,
  "recovery_locator": "sha256:2c8a28053072aa7c4cbdbca20baea69c69779355ac5874c6af201f5a7fe42689",
  "payload_json": null
}
```

Bind briefing filename alias to its input locator. The details summary Additional ordinary-cycle context contains h3_index3 (2024-11-16 duplicate context),4 (2022-11-26 unopposed),5 (2020-11-28). None becomes an extra selected event/result. Six H + two prospective remain eight total. Preserve full unopposed context and original markup; no HTML/script execution or use of rounded display shares as replacements.

Actual manifest.table_row_counts has no Governing control/Polling evidence entry, and corresponding table files are absent. Expected retained-input rows for these nonexistent files: **none**. Do not fabricate observation IDs or claim no polls/officeholders exist. Record supplied counts0 with the explicit not-supplied interpretation and raw limitations.

## Example 8 — Incomplete refresh (isolated CI, Not run)

Starting from a real validated Alderney baseline, remove only a test copy of GG-ALD-STATES O `/rows/1`, matching T `/classifications/1`, its H `/rows/3..5` and D `/rows/12..26`. No accepted withdrawal is supplied. Preserve previous STATES office, both its upcoming/selected event identities, results, source dependencies, approved classification, locators and aliases using inherited source bytes. Effective office count2, tier other2; all prior addresses still resolve. New effective R includes inherited descriptors and original hashes.

If old/new source bytes share a path use inherited/sha256/<old_hash>/<original_path>, retain original path in raw and repoint typed retained-input FK. Preserve old full snapshot. Without a prior publication, this reduced first import fails baseline fidelity; no guessed office is manufactured. A deliberate sourced withdrawal would change state/note while retaining IDs, not delete silently.

## Example 9 — Unresolved token, poison rollback and fixture exclusion (Not run)

Real source locator: H `/rows/3/12` from Example3; target N/GG-ALD-STATES/GG-ALD-STATES::2025::2025-03-08. In a marked test copy replace only its citation with token TEST-UNMATCHED-CITATION. Expected unresolved_evidence has exact token/test input hash/pointer, existing event record_key and reason=unmatched_catalogue_token. No source/URL/publisher is invented. This is a synthetic test token, not package research.

Separate poison: leave real URL unchanged, resolve alderney--S93e7bbcb1f, then omit that known source during staged writes. Required result is failed import, no new published release, prior master/release set still served, durable failed attempt with successful_release_id=NULL. Never demote this known broken FK to unresolved. Repeat for dangling country/geography/office/event and wrong namespace. All implementation tests run in isolated temporary paths.

Separate fixture probes: test-only FIX-/FXT- IDs, fixture namespace/provenance/payload or OBSERVATORY_FIXTURES injection must fail production acceptance across all projected/retained data. No fixture enters official totals or a release. Do not alter real package IDs.

## Example 10 — Corrected values, partial dates, conflict and publication (Not run)

Use Example4's real result binding in an isolated test copy: seats0→null must yield same result_row_id,seats=NULL,seats_status=unknown; missing is not zero. Test votes/share similarly because no such missing/zero baseline values exist. Test numeric value+unknown or null+zero status rejection. These are not proposed production corrections.

Use STATES prospective owner from Example2 with an explicit isolated test override claiming `2026-11` with conditional certainty. Expected same next event/date owner, precision=month,year2026,month11,day=NULL; no fabricated21 or day1. Existing recorded full-day claim remains retained. No month-only claim is asserted as actual package research. Future unknown/year/range cases use equivalent labelled isolated fixtures. For two independent conflicting test dates with no accepted winner, retain both claims/dates/sources, event.date_id=NULL,event.date_resolution=conflicting; office.next_date_id=NULL,next_date_resolution=conflicting,next_history_key=NULL. Event remains addressable; a November/December pair does not automatically become a range.

A real correction requires separately accepted atlas-override/1 full target key, expected_original and evidence. Changed bytes/override/version→new Alderney R, unchanged record identities retained, original claim and full prior snapshot recoverable. No replacement research value is proposed here. The hash-only method-version probe in Identity Rules verifies change sensitivity without claiming a correction was applied.

Preserve every actually selected Albania/Andorra/LatAm/NZ pair and row on Alderney-only publication; do not invent their release hashes. Each page cites its own L/R, not latest receipt. Same-FS staging, WAL checkpoint, fsync/rename and ledger crash recovery gates must pass before actual success; failure leaves last good publication serving. No successful publication is claimed here.
