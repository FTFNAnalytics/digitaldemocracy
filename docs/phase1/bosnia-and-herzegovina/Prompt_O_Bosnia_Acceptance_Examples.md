# Bosnia worked acceptance examples

**Prompt O documentation draft.** Package PR #15 `98408339e233e8580ec535cc24e8762ff5c6533f`; main contracts `6e6426fe17f6f542b58b68f8607124e007b852ff`. Tier SHA `3d0be674f3d5b77b3a92362b82815d7bd3305473820e3279999fc82e5f3c51c1` remains draft. These 17 examples specify expected projections and future CI behavior; no importer, SQLite or publication tests run. Examples explicitly labelled probes use isolated in-memory mutations, not invented research or production overrides.

Common columns omitted from fragments are fully specified in Field Map:lineage_id=L=country-package-bosnia-and-herzegovina, release_id=future validated effectiveR; office/event state active, state_noteNULL; raw envelopes preserve exact original row and locator. All current classification review_status values needs_review; production import requires Justin approval. V virtual paths reopen hash-verified tar members, not claimed git files.

## 1. Cantonal assembly is regional, not municipal

`data/countries/bosnia-and-herzegovina/unpacked/tables/master/office-register.json` `/rows/0`; SHA `504673d6437f951aa7cd1dda8aee03d8da23c30885c405aa67ef9df4597d86e4`; sheet `Office register`, source row `2242`, column `None`.

```json
{
  "office": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "BA-205",
    "geography_id": "geo-6e53e543ce8632cc16493b67",
    "office_type": "Cantonal assembly"
  },
  "tier": {
    "office_id": "BA-205",
    "tier": "regional",
    "review_status": "needs_review",
    "classification_path": "schemas/atlas/tiers/bosnia-and-herzegovina.json",
    "classification_sha256": "3d0be674f3d5b77b3a92362b82815d7bd3305473820e3279999fc82e5f3c51c1"
  }
}
```
Source jurisdiction Bosnian-Podrinje Goražde plus Cantonal assembly supports regional. T /classifications/0 is the classifier. The ten BA-201…BA-210 IDs each survive once. Cohort Regional / municipal is not copied into tier.
## 2. Entity institutions remain distinct from national country context

`data/countries/bosnia-and-herzegovina/unpacked/tables/master/office-register.json` `/rows/3`; SHA `504673d6437f951aa7cd1dda8aee03d8da23c30885c405aa67ef9df4597d86e4`; sheet `Office register`, source row `2245`, column `None`.

`data/countries/bosnia-and-herzegovina/unpacked/tables/master/office-register.json` `/rows/6`; SHA `504673d6437f951aa7cd1dda8aee03d8da23c30885c405aa67ef9df4597d86e4`; sheet `Office register`, source row `2248`, column `None`.

```json
[
  {
    "office_id": "BA-F",
    "jurisdiction": "Federation of Bosnia and Herzegovina",
    "office_type": "House of Representatives",
    "proposed_tier": "regional",
    "geography_id": "geo-b429969299189787eef7f326",
    "parent_geography_id": null
  },
  {
    "office_id": "BA-R",
    "jurisdiction": "Republika Srpska",
    "office_type": "National Assembly",
    "proposed_tier": "regional",
    "geography_id": "geo-4a8173515c1229a41834fd01",
    "parent_geography_id": null
  }
]
```
BA-F is Federation House of Representatives; BA-R is RS National Assembly. National in the latter title does not imply Bosnia-wide national_context. Preserve entity jurisdiction/office scope; do not invent country or parent-geography rows. Both focused tier flags stay true pending review.
## 3. BA-G is the RS President; no Brčko row

`data/countries/bosnia-and-herzegovina/unpacked/tables/master/office-register.json` `/rows/7`; SHA `504673d6437f951aa7cd1dda8aee03d8da23c30885c405aa67ef9df4597d86e4`; sheet `Office register`, source row `2249`, column `None`.

```json
{
  "office_id": "BA-G",
  "jurisdiction": "Republika Srpska",
  "office_type": "President",
  "geography_id": "geo-8c7f8505280a44a31501a4e5",
  "proposed_tier": "regional",
  "other_tier_rows": 0,
  "municipal_rows": 0
}
```
The supplied ID belongs to the entity president. It is not Brčko, nor a country-wide presidency. BA-G and BA-R share a jurisdiction label but retain separate type-scoped geography keys. No Brčko or mayor office is created.
## 4. History index overlaps once; year precision stays year

`data/countries/bosnia-and-herzegovina/unpacked/tables/master/history-index.json` `/rows/0`; SHA `833cfe5104faf5d506b12f4407629b1ee4531fb2df6bfa59c5ecd0961ba3082f`; sheet `History index`, source row `395`, column `None`.

Standalone crosscheck: `data/countries/bosnia-and-herzegovina/unpacked/history-index.json` `/0`; SHA `4970ace42cc87e80ddb70a859c6fcd02d165197354bf34aab7caa432e70d9c2d`; sheet `None`, source row `None`, column `None`.

```json
{
  "election_event": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "BA-205",
    "history_key": "BA-205::2022::",
    "event_id": "event-14c7b27732da1f7ba5ce6b91",
    "date_id": "date-2f729ce954ff75c9a34efdf80f663453caa8f30ed3ece530bd3bb01734dfa807",
    "selected_history_role": "selected",
    "event_kind": "unknown",
    "ballot_basis": "valid_votes",
    "legal_outcome": "unknown"
  },
  "research_date": {
    "date_id": "date-2f729ce954ff75c9a34efdf80f663453caa8f30ed3ece530bd3bb01734dfa807",
    "label": "2022",
    "precision": "year",
    "certainty": "unknown",
    "year": 2022,
    "month": null,
    "day": null
  }
}
```
Both rows identify BA-205::2022::. Table null date versusCSV empty string reconciles under explicit conversion. One event, not two. Master 39 plus matching standalone39 remains39 selected histories; no day inferred from general-election convention or URL.
## 5. Supplied upcoming day retains expected certainty

`data/countries/bosnia-and-herzegovina/unpacked/tables/master/office-register.json` `/rows/0/4`; SHA `504673d6437f951aa7cd1dda8aee03d8da23c30885c405aa67ef9df4597d86e4`; sheet `Office register`, source row `2242`, column `Next polling date`.

Qualifier: `data/countries/bosnia-and-herzegovina/unpacked/tables/master/election-calendar.json` `/rows/0/6`; SHA `d0498141997f7437cd61d67959617cf7b2f52ebc94afe0fe44b005f5a6d468fd`; sheet `Election calendar`, source row `21`, column `Date status`.

Citation: `data/countries/bosnia-and-herzegovina/unpacked/tables/master/election-calendar.json` `/rows/0/10`; SHA `d0498141997f7437cd61d67959617cf7b2f52ebc94afe0fe44b005f5a6d468fd`; sheet `Election calendar`, source row `21`, column `Source URL`.

```json
{
  "election_event": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "BA-205",
    "history_key": "next-832e95dbde07b6149bf81b22",
    "event_id": "next-832e95dbde07b6149bf81b22",
    "date_id": "date-e061df6eee4369fc338c894fa3947bcc60fc654acd13e0c30021fc9bbca11087",
    "selected_history_role": "none",
    "event_kind": "unknown",
    "ballot_basis": "unknown",
    "legal_outcome": "not_held"
  },
  "research_date": {
    "date_id": "date-e061df6eee4369fc338c894fa3947bcc60fc654acd13e0c30021fc9bbca11087",
    "label": "2026-10-04",
    "precision": "day",
    "certainty": "expected",
    "year": 2026,
    "month": 10,
    "day": 4
  },
  "office": {
    "office_id": "BA-205",
    "next_date_id": "date-e061df6eee4369fc338c894fa3947bcc60fc654acd13e0c30021fc9bbca11087",
    "next_history_key": "next-832e95dbde07b6149bf81b22",
    "next_date_resolution": "resolved"
  }
}
```
Every O row supplies2026-10-04. Cal status remains Scheduled cycle / expected; details vary.13 next events may appear in regional calendar after tier approval, clearly labelled expected, not freshly called. No duplicated office-owned date row. Expected dates within the inclusive window are not confirmed legal calls.
## 6. Detailed return binds once with exact values

`data/countries/bosnia-and-herzegovina/unpacked/tables/master/detailed-returns.json` `/rows/0`; SHA `7d3123dcded64515eafd3d0d2041181bef236d868750964f4e0858576440e479`; sheet `Detailed returns`, source row `3925`, column `None`.

```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "BA-205",
  "history_key": "BA-205::2022::",
  "result_row_id": "event-14c7b27732da1f7ba5ce6b91-r0",
  "candidate_or_list_label": "SDA - STRANKA DEMOKRATSKE AKCIJE",
  "party_namespace": "bosnia-and-herzegovina/2022",
  "original_party_label": "SDA - STRANKA DEMOKRATSKE AKCIJE",
  "original_party_code": "SDA - STRANKA DEMOKRATSKE AKCIJE",
  "votes": 2128,
  "votes_status": "recorded",
  "share": 15.155615696887686,
  "share_status": "recorded",
  "share_unit": "percent_0_100",
  "seats": 5,
  "seats_status": "recorded",
  "evidence_status": "recorded"
}
```
The result belongs to H 0; 2128 votes, 15.155615696887686 percent, 5 seats. Full event FK=(N, BA-205, BA-205::2022::). Result r0 is encounter order, not rank recomputed by votes. party_mapping_id/proceeding_id/elected_flag/is_substitute remainNULL. No result rows are created for prospective events.
## 7. Zero seats and missing seats remain different

`data/countries/bosnia-and-herzegovina/unpacked/tables/master/detailed-returns.json` `/rows/13`; SHA `7d3123dcded64515eafd3d0d2041181bef236d868750964f4e0858576440e479`; sheet `Detailed returns`, source row `3938`, column `None`.

```json
{
  "office_id": "BA-205",
  "history_key": "BA-205::2022::",
  "result_row_id": "event-14c7b27732da1f7ba5ce6b91-r13",
  "candidate_or_list_label": "REPUBLIKANSKA STRANKA",
  "seats": 0,
  "seats_status": "zero"
}
```

`data/countries/bosnia-and-herzegovina/unpacked/tables/master/detailed-returns.json` `/rows/408`; SHA `7d3123dcded64515eafd3d0d2041181bef236d868750964f4e0858576440e479`; sheet `Detailed returns`, source row `4333`, column `None`.

```json
{
  "office_id": "BA-G",
  "history_key": "BA-G::2022::",
  "result_row_id": "event-b8860fec4f88ded2c130151e-r0",
  "candidate_or_list_label": "MILORAD DODIK",
  "seats": null,
  "seats_status": "unknown"
}
```
REPUBLIKANSKA STRANKA has supplied 0 seats→zero status. MILORAD DODIK has seatsNULL→unknown, not0 or inferred elected seat. Baseline totals369 zero seats/87 missing/293 positive. All 749 votes and shares are positive; missing-vote/zero-vote tests would be isolated CI mutations, not baseline claims.
## 8. Published Others stays one source row

`data/countries/bosnia-and-herzegovina/unpacked/tables/master/detailed-returns.json` `/rows/36`; SHA `7d3123dcded64515eafd3d0d2041181bef236d868750964f4e0858576440e479`; sheet `Detailed returns`, source row `3961`, column `None`.

```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "BA-205",
  "history_key": "BA-205::2014::",
  "result_row_id": "event-b3192e9a1f294ef5deebd1c7-r0",
  "candidate_or_list_label": "Others",
  "party_namespace": "bosnia-and-herzegovina/2014",
  "original_party_label": "Others",
  "original_party_code": "Others",
  "votes": 3373,
  "votes_status": "recorded",
  "share": 23.859,
  "share_status": "recorded",
  "share_unit": "percent_0_100",
  "seats": 5,
  "seats_status": "recorded",
  "evidence_status": "recorded"
}
```
BA-2052014 Others has 3373 votes, 23.859 percent, 5 seats. Result coverage explicitly says no within-Others breakdown. Retain one row with original label/party token, do not invent component parties or compute a residual. Ten 2014 canton histories carry this limitation; three histories remain unscored/inapplicable despite having three entries.
## 9. Open RS replacement/repeat gap creates no fictional events

`data/countries/bosnia-and-herzegovina/unpacked/tables/master/country-notes.json` `/rows/0/1`; SHA `b6bd5d27606758b3962441c2c61e002e78e594bd70040d5698487be880153556`; sheet `Country notes`, source row `10`, column `Scope and remaining gaps`.

```json
{
  "office_id": "BA-G",
  "existing_history_keys": [
    "BA-G::2022::",
    "BA-G::2018::",
    "BA-G::2014::"
  ],
  "supplied_next_history_key": "next-b55b658d7de5f2bd1cd1e205",
  "additional_gap_events": 0,
  "proceedings": 0,
  "review_status": "open"
}
```
Only2014, 2018, 2022 regular histories and source expected2026 next are supplied. No new date, annulment, repeat proceeding or certified result is inferred. Preserve BA-G and every existing row; the distinct BA-R legislature does not absorb presidential events. Ordinary-cycle history never establishes current officeholder/control.
## 10. Resolve exact URL including fragment; inline metadata remains missing

`data/countries/bosnia-and-herzegovina/unpacked/tables/master/detailed-returns.json` `/rows/0/13`; SHA `7d3123dcded64515eafd3d0d2041181bef236d868750964f4e0858576440e479`; sheet `Detailed returns`, source row `3925`, column `Source URL`.

Catalogue: `data/countries/bosnia-and-herzegovina/unpacked/tables/master/sources.json` `/rows/20`; SHA `589fa89fe80df78e52a543099d1ff21d9f217b095f317e046ca9bc4069dfc133`; sheet `Sources`, source row `733`, column `None`.

```json
{
  "country_id": "bosnia-and-herzegovina",
  "source_namespace": "country-package-bosnia-and-herzegovina",
  "source_id": "bosnia-and-herzegovina--S7dc4e82fd3",
  "url": "https://www.izbori.ba/Rezultati_izbora/?resId=32&langId=3#/7/205/0/0/0",
  "title": "CEC Bosnia and Herzegovina: certified 2022 Bosnian-Podrinje Goražde Cantonal assembly",
  "publisher": null,
  "file_sha256": null
}
```

The resId/langId query and #/7/205/0/0/0 fragment are identity-bearing exact URL bytes. No endpoint/catalogue remapping. The CEC homepage calendar citation is one genuine inline source with missing title/grade/access fieldsNULL; the source catalogue/table hash is not a downloaded webpage hash.28 catalogue+2 inline=30 sources.

## 11. Unresolved token versus broken resolved source FK

`data/countries/bosnia-and-herzegovina/unpacked/tables/master/detailed-returns.json` `/rows/0/13`; SHA `7d3123dcded64515eafd3d0d2041181bef236d868750964f4e0858576440e479`; sheet `Detailed returns`, source row `3925`, column `Source URL`.

```json
{
  "record_key": "rec-6d72256c7844a594ef5aafd917a784dc40983d53fe8277c46e855cc677e85bd1",
  "source_namespace": "country-package-bosnia-and-herzegovina",
  "baseline_source_id": "bosnia-and-herzegovina--S7dc4e82fd3",
  "claim_kind": "result"
}
```
**Future CI probes only:** replace D 0 Source URL in an in-memory copy with TEST_UNRESOLVED_BOSNIA. Expect unresolved_evidence(original_token exact, reason invalid_url (the designated Source URL field contains a non-HTTP token)), real target locator, no fabricated source/FK. In a separate probe delete already-resolved bosnia-and-herzegovina--S 7dc4e82fd3 from staging while retaining its evidence links:fail closed and roll back; do not relabel that missing known source unresolved. No source bytes or overrides changed here.
## 12. Unchanged effective inputs reuse release but create new attempt

```json
{
  "tier_status": "draft_for_human_review",
  "draft_fingerprint_sha256": "a51de5f8c31439521fb50220dabe3ea6c742095983ced8892a932235752dc99b",
  "draft_candidate_release_id": "country-package-bosnia-and-herzegovina--sha256-a51de5f8c31439521fb50220dabe3ea6c742095983ced8892a932235752dc99b",
  "publishable": false
}
```
Inventory contains exact canonical hash object and 35 input descriptors. Repeating hash gives sameR. After approval, two unchanged effective imports must have different attempt UUIDs and the same approvedR; current draft cannot publish. Approval changesT bytes and thereforeR. No actual attempt or successful publication is claimed.
## 13. A corrected input/version changes release, not stable IDs

```json
{
  "probe_only": true,
  "changed_field": "method_version",
  "before": "atlas-preserve-evidence/1",
  "after": "atlas-preserve-evidence/2",
  "old_hash": "a51de5f8c31439521fb50220dabe3ea6c742095983ced8892a932235752dc99b",
  "new_hash": "57371f03f479f2830285d41557afb7a103155541ef86d1924838be65c9b4eeb2",
  "office_id": "BA-205",
  "event_id": "event-14c7b27732da1f7ba5ce6b91",
  "result_row_id": "event-14c7b27732da1f7ba5ce6b91-r0"
}
```

This is a hash-only test vector, not an accepted method change or fabricated numeric correction. A future source-backed correction requires exact expected_original and replacement evidence; wrong guard fails. Public identities excludeR and do not shift on result reorder/value change.

## 14. Incomplete refresh retains BA-G and dependent provenance

`data/countries/bosnia-and-herzegovina/unpacked/tables/master/office-register.json` `/rows/7`; SHA `504673d6437f951aa7cd1dda8aee03d8da23c30885c405aa67ef9df4597d86e4`; sheet `Office register`, source row `2249`, column `None`.

**Future CI mutation only:** omit BA-G and its incoming rows after an approved baseline exists. Expected carry-forward:office, tier, geography, three historical events, the supplied next event, all existing result/evidence/source/alias dependencies and exact old input bytes. Inherited path convention resolves content collisions and enters effective fingerprint. No withdrawal/current-incumbent assertion follows omission; initial import cannot invent carried data. Other-lineage releases and citations remain unchanged.
## 15. Fixture and poison failures preserve last good publication

Target origin: `data/countries/bosnia-and-herzegovina/unpacked/tables/master/detailed-returns.json` `/rows/0`; SHA `7d3123dcded64515eafd3d0d2041181bef236d868750964f4e0858576440e479`; sheet `Detailed returns`, source row `3925`, column `None`.

**Future CI probes only:** replace in-memory office ID with FIX-BOSNIA-PROBE or give D 0 an HK absent from H. Reject fixture identifiers/provenance or broken full event FK. Rollback/discard staging; durable ledger failed with no successful_release_id; prior served master and unrelated lineages remain unchanged. No public release minted. No fixture rows written or SQL test executed by this pack.
## 16. Partial-date and conflict handling—future CI specification

Actual upcoming owner: `data/countries/bosnia-and-herzegovina/unpacked/tables/master/office-register.json` `/rows/0/4`; SHA `504673d6437f951aa7cd1dda8aee03d8da23c30885c405aa67ef9df4597d86e4`; sheet `Office register`, source row `2242`, column `Next polling date`.

**Isolated future CI mutations:** use a month-only 2026-10 label in a test copy→precision month, year 2026, month10, dayNULL; this is not a newly collected Bosnia polling claim. Competing date claims against the same event preserve separate source-backed claim/date rows with full locators; selected event.date_idNULL, date_resolution conflicting, and office.next_date_id/next_history_keyNULL. No artificial source FK. Unknown historical year/date requires a nonnull explicit unknown research_date, not an invalidNULL event pointer. The real baseline remains39 year dates+13 expected day dates.
## 17. Control and score summaries are not observed control or computed metrics

`data/countries/bosnia-and-herzegovina/unpacked/tables/master/country-coverage.json` `/rows/0/6`; SHA `15933c3b7f5c0d1e5ada9d83b3fec3b73407584f3a84004e04617bdf3f37df12`; sheet `Country coverage`, source row `10`, column `Sourced current control`.

Score example: `data/countries/bosnia-and-herzegovina/unpacked/tables/master/office-register.json` `/rows/5/10`; SHA `504673d6437f951aa7cd1dda8aee03d8da23c30885c405aa67ef9df4597d86e4`; sheet `Office register`, source row `2247`, column `Competition score`.

```json
{
  "source_current_control_records": 0,
  "control_observations_emitted": 0,
  "source_office_id": "BA-202",
  "source_competition_score": 0,
  "new_metric_rows": 0
}
```

The source score0 remains a supplied raw value; the control inventory0 means no supplied control observations, not zero government/control. Governing coalition histories remain open. No Polling evidence or Governing control table exists in payload. No poll, current-holder, coalition forecast or tightness value is invented.

## Execution boundary

All 17 examples are documentation specifications with inspected source values/locators. Input hash/count/identity checks run separately; importer, SQLite constraints/transactions, publication, VPS andUI execution remain **Not run**. Tiers remain draft and applied_changes=0.
