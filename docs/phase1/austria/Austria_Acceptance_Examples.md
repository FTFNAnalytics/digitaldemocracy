# Austria worked acceptance examples

Prompt N documentation draft. Package `6b38848d76a815f7dd0bcae3d49a25e6dca9e1af`; contracts main `6e6426fe17f6f542b58b68f8607124e007b852ff`. **No importer/SQLite/publication CI run.** Expected row shapes describe future behavior; all current tier rows remain needs_review until Justin accepts T. Operational examples are labelled isolated future CI mutations and are not new research assertions. Source-locator SHA values refer to exact unpacked member bytes; recovery is defined in Field Map.

Common emitted research columns unless stated: lineage_id=country-package-austria, release_id=the future validated effective R; office/event record_state=active and state_note=NULL. Raw envelopes retain exact source objects and locators. These examples omit unchanged common columns, not their required mapping; all 223 columns are specified in Field Map. Expected-source observations below were checked against frozen inputs; projected rows are not database writes.

## 1. Regional office exists; dated upcoming calendar stays empty

`data/countries/austria/unpacked/tables/master/office-register.json` `/rows/208`; SHA `19e208d578151c01b669e13c3345d88a2cba591517a129f66a228b80b2cc1d68`; sheet `Office register`, source row `412`, column `None`.

```json
{
  "office": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "AT-KTN-A",
    "country_id": "austria",
    "geography_id": "geo-7842b5b67d2aa6b79214f9f3",
    "office_type": "State legislature",
    "next_date_id": null,
    "next_date_resolution": "unknown",
    "next_history_key": null
  },
  "office_tier_classification": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "AT-KTN-A",
    "tier": "regional",
    "review_status": "needs_review",
    "classification_path": "schemas/atlas/tiers/austria.json",
    "classification_sha256": "9181e0af7f9dd0e3b2a92520de1cb990901c08b6f68afd165608eaf66282283d"
  }
}
```
O explicitly says Carinthia / State legislature. T `/classifications/208` proposes regional and flags focused review. The other three regional rows are Lower Austria, Tyrol and Upper Austria, documented with exact IDs in Field Map. Expected counts:4 proposed regional,0 approved Austria regional today,0 baseline prospective events. After approval, regional office index4 but dated upcoming regional calendar0. Do not fill null dates from “Expected2027” cohorts.
## 2. Companion and master overlap once; year precision

`data/countries/austria/unpacked/tables/companion/histories.json` `/rows/0`; SHA `2c3cbd0fbb1bbcd3feb2ccfd52a93ce71fbedb127167f9dcf1148ddffadcbf5c`; sheet `Histories`, source row `2`, column `None`.

Reconciliation: `data/countries/austria/unpacked/history-index.json` `/230`; SHA `954e6ea8f5b9528980b506a31c886a2a1ffe5a09efa7a0a0fac1954f80e00fd8`; sheet `None`, source row `None`, column `None`.

```json
{
  "election_event": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "AT-TY-C-70201",
    "history_key": "AT-TY-C-70201::2022::",
    "event_id": "event-4b14e098bb06b69d66290f60",
    "date_id": "date-29d3c163a2be793e1137d5ee3ba116af370e7e448246c45c2f504f29ca9f1fba",
    "selected_history_role": "selected",
    "event_kind": "ordinary",
    "ballot_basis": "list_votes",
    "legal_outcome": "unknown"
  },
  "research_date": {
    "date_id": "date-29d3c163a2be793e1137d5ee3ba116af370e7e448246c45c2f504f29ca9f1fba",
    "label": "2022",
    "year": 2022,
    "month": null,
    "day": null,
    "precision": "year",
    "certainty": "unknown"
  }
}
```
H 0 is AT-TY-C-70201,2022. Actual ballot date is null and IX ballot-date string empty. Both bind one HK/event, not two; date label2022, precision year, month/day NULL, certainty unknown. The full baseline H-set5944 is a subset of IX-set5956; index adds only 12.
## 3. Exact detailed return and deterministic result ID

`data/countries/austria/unpacked/tables/companion/full-results.json` `/rows/0`; SHA `52b565335e2a667fb31fff46c6b8e8f5a103758f197d01b7af9ccdb161e3dc40`; sheet `Full results`, source row `2`, column `None`.

```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "AT-TY-C-70201",
  "history_key": "AT-TY-C-70201::2022::",
  "result_row_id": "event-4b14e098bb06b69d66290f60-r0",
  "candidate_or_list_label": "Gemeinsam für unsere Gemeinde-Bürgermeisterliste Josef Knabl - GFG",
  "party_namespace": "austria/2022",
  "original_party_label": "Gemeinsam für unsere Gemeinde-Bürgermeisterliste Josef Knabl - GFG",
  "original_party_code": "Gemeinsam für unsere Gemeinde-Bürgermeisterliste Josef Knabl - GFG",
  "votes": 1042,
  "votes_status": "recorded",
  "share": 62.43,
  "share_status": "recorded",
  "share_unit": "percent_0_100",
  "seats": 10,
  "seats_status": "recorded",
  "evidence_status": "recorded"
}
```
D 0 belongs to H 0. Candidate is null, so exact Party / list becomes display label. Party code/label remain original, not a canonicalized family. Numeric values1042 votes,62.43 percent and 10 seats round-trip exactly. proceeding_id,party_mapping_id,elected_flag,is_substitute=NULL; no certification inferred.
## 4. Missing seat differs from reported zero

`data/countries/austria/unpacked/tables/companion/full-results.json` `/rows/22`; SHA `52b565335e2a667fb31fff46c6b8e8f5a103758f197d01b7af9ccdb161e3dc40`; sheet `Full results`, source row `24`, column `None`.

```json
{
  "office_id": "AT-TY-C-70202",
  "history_key": "AT-TY-C-70202::2022::",
  "result_row_id": "event-8162895a3aeba5d488afd24f-r6",
  "votes": 80,
  "share": 3.05,
  "seats": 0,
  "seats_status": "zero"
}
```

`data/countries/austria/unpacked/tables/companion/full-results.json` `/rows/6`; SHA `52b565335e2a667fb31fff46c6b8e8f5a103758f197d01b7af9ccdb161e3dc40`; sheet `Full results`, source row `8`, column `None`.

```json
{
  "office_id": "AT-TY-C-70201",
  "history_key": "AT-TY-C-70201::2010::",
  "result_row_id": "event-376a7201dbb826f0af5d9976-r0",
  "votes": 859,
  "share": 50.26,
  "seats": null,
  "seats_status": "unknown"
}
```
All 400 supplied zero-seat observations remain0/zero;7180 null seats remainNULL/unknown. All baseline votes/shares are positive, so a missing-vote test would be a synthetic CI mutation, not a supplied zero.
## 5. Repeat held in a later year; keep cycle identity

`data/countries/austria/unpacked/tables/companion/histories.json` `/rows/2049`; SHA `2c3cbd0fbb1bbcd3feb2ccfd52a93ce71fbedb127167f9dcf1148ddffadcbf5c`; sheet `Histories`, source row `2051`, column `None`.

Date source: `data/countries/austria/unpacked/tables/companion/histories.json` `/rows/2049/12`; SHA `2c3cbd0fbb1bbcd3feb2ccfd52a93ce71fbedb127167f9dcf1148ddffadcbf5c`; sheet `Histories`, source row `2051`, column `Round / basis`.

```json
{
  "election_event": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "AT-BG-10602-M",
    "history_key": "AT-BG-10602-M::2022::",
    "event_id": "event-e41173a85dde8b05f2639a6d",
    "date_id": "date-e39336cf6be194fceac1629c2660e3c5e0272d99dd6abb891913353244adf040",
    "selected_history_role": "selected",
    "event_kind": "repeated",
    "ballot_basis": "valid_votes",
    "legal_outcome": "unknown"
  },
  "research_date": {
    "date_id": "date-e39336cf6be194fceac1629c2660e3c5e0272d99dd6abb891913353244adf040",
    "label": "3 September 2023",
    "year": 2023,
    "month": 9,
    "day": 3,
    "precision": "day",
    "certainty": "unknown"
  }
}
```
Exact phrase: “2022 cycle: decisive repeat mayoral runoff 3 September 2023; Valid candidate/list votes”. HK retains2022 and empty raw date segment; date records3 September2023, precision day, certainty unknown, event_kind repeated. D joins cycle 2022. Original2022 runoff is described as annulled but no additional predecessor row/proceeding is fabricated. Two Deutschkreutz2017-cycle repeats use the same policy for 9 September2018 and 7 October2018.
## 6. Index-only regional history is retained without synthetic results

`data/countries/austria/unpacked/history-index.json` `/5322`; SHA `954e6ea8f5b9528980b506a31c886a2a1ffe5a09efa7a0a0fac1954f80e00fd8`; sheet `None`, source row `None`, column `None`.

```json
{
  "election_event": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "AU-ab9fc7cefb",
    "history_key": "AU-ab9fc7cefb::2022::",
    "event_id": "event-971743b1a1be1a05388e750b",
    "date_id": "date-65f0b4746c85cddb2c45a7fc062bc4b641e46817f05731108d8e94824c91cd8c",
    "selected_history_role": "selected",
    "event_kind": "unknown",
    "ballot_basis": "valid_votes",
    "legal_outcome": "unknown"
  },
  "research_date": {
    "date_id": "date-65f0b4746c85cddb2c45a7fc062bc4b641e46817f05731108d8e94824c91cd8c",
    "label": "2022",
    "year": 2022,
    "month": null,
    "day": null,
    "precision": "year",
    "certainty": "unknown"
  },
  "result_rows_from_this_input": 0
}
```
Tyrol office ID AU-ab9fc7cefb stays exact, country austria. Source URL resolves source catalogue. IX says leading parties only; full results not reconciled. Leader34.7 and runner18.8 remain summary raw, not invented full-result rows/votes/seats. All four outside-companion offices survive, three histories each.
## 7. Tyrol boundary watch does not fabricate an in-window date

`data/countries/austria/unpacked/tables/companion/jurisdictions.json` `/rows/0/20`; SHA `39d2a8e68f16ae0cea0e24b6486114d3e1ae0c7becdc3cc339e12b3140caa739`; sheet `Jurisdictions`, source row `2`, column `Notes`.

Office date: `data/countries/austria/unpacked/tables/master/office-register.json` `/rows/79/4`; SHA `19e208d578151c01b669e13c3345d88a2cba591517a129f66a228b80b2cc1d68`; sheet `Office register`, source row `283`, column `Next polling date`.

```json
{
  "office_id": "AT-TY-C-70201",
  "next_date_id": null,
  "next_history_key": null,
  "next_date_resolution": "unknown",
  "raw_notes": "Expected February/March 2028 ordinary six-year cycle; exact day has not been verified and may fall after the 8 March cutoff. Included as a boundary watch, not a confirmed in-window date. Innsbruck has a separate cycle."
}
```
The note says expected February/March2028 and may fall after8 March cutoff. No range endpoints or day are supplied; no next event is created. T remains municipal. Country window metadata is not a polling date.
## 8. Carinthia 2009 mayoral gap remains open

`data/countries/austria/unpacked/tables/master/office-register.json` `/rows/771/18`; SHA `19e208d578151c01b669e13c3345d88a2cba591517a129f66a228b80b2cc1d68`; sheet `Office register`, source row `975`, column `Historical coverage`.

```json
{
  "office_id": "AT-KTN-20642-M",
  "source_history_entries": 2,
  "history_keys": [
    "AT-KTN-20642-M::2021::",
    "AT-KTN-20642-M::2015::"
  ],
  "coverage": "PARTIAL: 2021 and 2015 decisive mayoral results; 2009 mayoral return not yet recovered; 2 historical entries",
  "research_coverage_complete": 0
}
```
Krems in Kärnten is an existing office, not the unresolved Krems/Waidhofen cohort. Two supplied histories2015/2021 remain two; no 2009 zero-vote history. Missing third cycle is an open research gap, not missing office identity.
## 9. No candidate return does not become zero-vote candidate

`data/countries/austria/unpacked/tables/companion/jurisdictions.json` `/rows/423/20`; SHA `39d2a8e68f16ae0cea0e24b6486114d3e1ae0c7becdc3cc339e12b3140caa739`; sheet `Jurisdictions`, source row `425`, column `Notes`.

```json
{
  "office_id": "AT-TY-M-70812",
  "note": "Expected February/March 2028 ordinary six-year cycle; exact day has not been verified and may fall after the 8 March cutoff. Included as a boundary watch, not a confirmed in-window date. Innsbruck has a separate cycle. The official 2016 Gramais page reports zero votes and no candidate return; no voting result is invented for that cycle.",
  "existing_history_keys": [
    "AT-TY-M-70812::2022::",
    "AT-TY-M-70812::2010::"
  ]
}
```
Gramais note reports zero votes and no candidate return for 2016. This contextual statement stays raw; absence of a candidate row does not authorize creation of a zero-vote result. No2016 history is fabricated if absent in H/IX.
## 10. Resolved source versus unresolved token; broken FK fails

`data/countries/austria/unpacked/tables/companion/full-results.json` `/rows/0/7`; SHA `52b565335e2a667fb31fff46c6b8e8f5a103758f197d01b7af9ccdb161e3dc40`; sheet `Full results`, source row `2`, column `Source ID`.

Source: `data/countries/austria/unpacked/tables/master/sources.json` `/rows/12`; SHA `5abe98d2fe345349e5f6e6b5e558fc3d242b5b7d145e31e9744c74ae830fa036`; sheet `Sources`, source row `798`, column `None`.

```json
{
  "record_key": "rec-02e994bdc4578e54e98c1a111f595c51294e1c912bc77806b1cdffc62330f113",
  "source_country_id": "austria",
  "source_namespace": "country-package-austria",
  "source_id": "austria--Saa268dd490",
  "claim_kind": "result",
  "date_claim_id": null
}
```

Baseline Saa268dd490 resolves to its actual Tirol2022 CSV catalogue row. **Isolated future CI probes:** replace only citation token in an in-memory copy with TEST_UNRESOLVED_AUSTRIA (not a new source) and remove its companion URL: expect unresolved_evidence(original_token exact,reason unmatched_catalogue_token,real target record_key), no source row/FK. Separately remove the already-resolved canonical source from staging while retaining its links: expect fatal FK rollback, not automatic demotion to unresolved. Source inventory and production bytes stay untouched.

## 11. Unchanged re-import fingerprint is separate from attempt

```json
{
  "draft_tier_sha256": "9181e0af7f9dd0e3b2a92520de1cb990901c08b6f68afd165608eaf66282283d",
  "fingerprint_sha256": "85eb8f67a6521e85f38babde77546767c862f3e373fee0bfa02e8ac7786ca005",
  "candidate_release_id": "country-package-austria--sha256-85eb8f67a6521e85f38babde77546767c862f3e373fee0bfa02e8ac7786ca005",
  "publishable": false,
  "approval_required": true
}
```
Input inventory supplies exact canonical hash object. Repeating descriptor canonicalization gives the same hash. Future two invocations with **approved unchanged** effective inputs must create distinct attempt UUIDs and reuse one release. Current draft fails approval gate before publication; these hash vectors do not simulate a successful import. No attempt IDs are invented in this report.
## 12. Changed effective input changes release, not research identities

```json
{
  "probe_only": true,
  "changed_field": "method_version",
  "before": "atlas-preserve-evidence/1",
  "after": "atlas-preserve-evidence/2",
  "before_fingerprint": "85eb8f67a6521e85f38babde77546767c862f3e373fee0bfa02e8ac7786ca005",
  "after_fingerprint": "7d77583cc836a98dd0282fa84344fd15dda38325b9cf5b54088ce1f263876ffc",
  "office_id": "AT-TY-C-70201",
  "event_id": "event-4b14e098bb06b69d66290f60",
  "result_row_id": "event-4b14e098bb06b69d66290f60-r0"
}
```
This is an isolated hash-only version mutation, not an accepted methodology or numeric correction. For a future evidenced correction, expected_original must equal frozen typed value and claims identify actual sources; no replacement votes are invented here. Stable office/event/result aliases do not include the release hash. A wrong guard fails before publication.
## 13. Incomplete refresh retains the omitted office and dependencies

Exact original: `data/countries/austria/unpacked/tables/master/office-register.json` `/rows/208`; SHA `19e208d578151c01b669e13c3345d88a2cba591517a129f66a228b80b2cc1d68`; sheet `Office register`, source row `412`, column `None`.

**Future CI mutation only:** omit AT-KTN-A and its incoming histories from a refresh after a successful approved baseline. Expected: retain AT-KTN-A, its three event/date/source/tier/evidence/alias rows and all supporting original input bytes. Paths whose contents collide use inherited/sha256/<oldhash>/<original_path>. Effective fingerprint includes incoming+carried inputs; no withdrawal or deletion follows omission. An initial import cannot invent carried data. Other lineages and their citation releases are unchanged.
## 14. Fixture exclusion and poison rollback

Probe target: `data/countries/austria/unpacked/tables/companion/full-results.json` `/rows/0`; SHA `52b565335e2a667fb31fff46c6b8e8f5a103758f197d01b7af9ccdb161e3dc40`; sheet `Full results`, source row `2`, column `None`.

**Future CI mutations only:** change the in-memory office ID to FIX-AUSTRIA-PROBE, or break D 0 history_key so it references no event. Expect failed attempt in separate durable ledger, no successful_release_id, staging rolled back/discarded, no candidate public release and no serving-file change. FIX-/FXT- identifiers and fixture provenance are rejected across typed and retained content. An unresolved source token cannot repair a missing event/office target. No production files changed or tests run.
## 15. Poll and control/score inputs stay retained with limits

`data/countries/austria/unpacked/tables/master/polling-evidence.json` `/rows/0`; SHA `044994a66c6783935b79699e26cbc62611301f21d718ca9aa5eafd2e524280ea`; sheet `Polling evidence`, source row `6`, column `None`.

```json
{
  "retained_input": {
    "input_path": "data/countries/austria/unpacked/tables/master/polling-evidence.json",
    "input_kind": "package",
    "sha256": "044994a66c6783935b79699e26cbc62611301f21d718ca9aa5eafd2e524280ea",
    "payload_json": "entire original table, including this row"
  },
  "poll_scope": "Lower Austria regional parliamentary voting intention",
  "sample_n": 1098,
  "control_observations_supplied": 0,
  "typed_poll_rows": 0
}
```
The1098 sample and party-preference n=820 remain original method text; do not turn polling percentages into election results or national-to-local forecasts. Poll fieldwork/publication dates are not ballot dates. Coverage current_control_records=0 is an inventory count; no observed control=0 row. Score0 in an upstream table remains supplied raw, not a calculated Atlas metric.
## 16. Competing dates and month precision—future CI specification

Baseline owner: `data/countries/austria/unpacked/tables/companion/histories.json` `/rows/0`; SHA `2c3cbd0fbb1bbcd3feb2ccfd52a93ce71fbedb127167f9dcf1148ddffadcbf5c`; sheet `Histories`, source row `2`, column `None`.

**Isolated future CI mutations, not collected Austria dates:** provide two differently labelled source claims against event-4b14e098bb06b69d66290f60 using separate real-source locators in the test setup. Keep both claim rows; event.date_id=NULL, date_resolution=conflicting until an accepted resolution. No fabricated source FK. A test YYYY-MM label has precision=month,day=NULL; a year label remains year. None of these probes is included as an Austria research date or accepted override. Exact full-string syntax/calendar validity must be checked; do not parse arbitrary expected-date prose. Existing date/identity and original claims remain auditable.
## 17. Real source-stage disagreement remains a publication hold

`data/countries/austria/unpacked/tables/companion/histories.json` `/rows/4560`; SHA `2c3cbd0fbb1bbcd3feb2ccfd52a93ce71fbedb127167f9dcf1148ddffadcbf5c`; sheet `Histories`, source row `4562`, column `None`.

Index: `data/countries/austria/unpacked/history-index.json` `/4682`; SHA `954e6ea8f5b9528980b506a31c886a2a1ffe5a09efa7a0a0fac1954f80e00fd8`; sheet `None`, source row `None`, column `None`.

Briefing: `data/countries/austria/unpacked/Office_Briefings/Offices/AT-OOE-41119-M.html` ``; SHA `b9e199a48b8603a5a7944c66f0419edc2321a4118930264c067b1d45659b1f0c`; sheet `None`, source row `None`, column `None`.

```json
{
  "office_id": "AT-OOE-41119-M",
  "history_key": "AT-OOE-41119-M::2015::",
  "event_id": "event-c38c8dd1ab8537426d14d5c0",
  "candidate_result_row_ids": [
    "event-c38c8dd1ab8537426d14d5c0-r0",
    "event-c38c8dd1ab8537426d14d5c0-r1",
    "event-c38c8dd1ab8537426d14d5c0-r2",
    "event-c38c8dd1ab8537426d14d5c0-r3"
  ],
  "companion_leader_share": 35.133287764866715,
  "index_leader_share": "79.12087912087912",
  "publication_hold": true,
  "applied_changes": 0
}
```
Companion H 4560 and D 12683–12686 describe the2015 first ballot (514/463/430/56 votes). Index4682 describes a later leader share79.12087912087912 with no runner; HTML2015 decisive yes/no section shows1008 votes/79.12 and cites the official final report at external HTTP anchor1. Keep both source claims and original detailed rows. Neither source is an unresolved citation. Until Justin accepts a sourced stage/identity binding, no final return is selected and no publication proceeds. Do not replace votes, fabricate a separate proceeding or drop the four first-ballot rows.45 other citation differences agree on compared summary values; retain both sources without duplicate events.
## Execution boundary

These 17 examples specify acceptance behavior. The supplied package validator, set/count/hash and documentation-vector checks ran; **importer, SQLite constraints/transactions, publication, VPS and UI execution are Not run**. All proposals remain draft and applied_changes=0. No tier approval or other-country change is made.
