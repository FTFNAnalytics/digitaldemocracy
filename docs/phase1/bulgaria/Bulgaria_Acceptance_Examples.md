# Bulgaria acceptance examples

**17 worked examples**. Expected projections for future implementation, not executed Atlas imports. Justin accepted the 530 municipality-wide rows on 2026-09-19 and held the 3,067 district/village rows. All real examples reference exact pinned file SHA and zero-based JSON pointers, with original sheet/source_rows. P/V aliases are in [Field Map](Bulgaria_Field_Map.md). Complete identity vectors are in [Bulgaria_Identity_Vectors.json](Bulgaria_Identity_Vectors.json). Synthetic mutations are explicitly labelled isolated future CI probes; frozen research is unchanged.

## Example 1 — Municipality-wide mayor/council pair

Source locator(s):

```json
{"column":null,"html_anchor_index":null,"input_path":"data/countries/bulgaria/unpacked/tables/master/office-register.json","json_pointer":"/rows/4","sha256":"00ddcca3c48141302a7432f97effd017a009fee3d64fb7f9000a72ef79663559","sheet":"Office register","source_row":2259}
{"column":null,"html_anchor_index":null,"input_path":"data/countries/bulgaria/unpacked/tables/master/office-register.json","json_pointer":"/rows/5","sha256":"00ddcca3c48141302a7432f97effd017a009fee3d64fb7f9000a72ef79663559","sheet":"Office register","source_row":2260}
```

Expected shape / disposition:

```json
[
  {
    "office_id": "BG-VAR01-M",
    "office_type": "Mayor",
    "proposed_tier": "municipal",
    "pack_status": "approved",
    "human_review_required": false,
    "next_date_id": null
  },
  {
    "office_id": "BG-VAR01-C",
    "office_type": "Municipal council",
    "proposed_tier": "municipal",
    "pack_status": "approved",
    "human_review_required": false,
    "next_date_id": null
  }
]
```

**Assertion:** Two supplied offices, no extra mayor/council. No council geographic tier is emitted. Justin accepted both municipality-wide rows on 2026-09-19.

## Example 2 — Village scope review and same-name geography separation

Source locator(s):

```json
{"column":null,"html_anchor_index":null,"input_path":"data/countries/bulgaria/unpacked/tables/master/office-register.json","json_pointer":"/rows/0","sha256":"00ddcca3c48141302a7432f97effd017a009fee3d64fb7f9000a72ef79663559","sheet":"Office register","source_row":2255}
{"column":null,"html_anchor_index":null,"input_path":"data/countries/bulgaria/unpacked/tables/master/office-register.json","json_pointer":"/rows/1","sha256":"00ddcca3c48141302a7432f97effd017a009fee3d64fb7f9000a72ef79663559","sheet":"Office register","source_row":2256}
```

Expected shape / disposition:

```json
[
  {
    "office_id": "BG-BLG52-fc5837f6a1-V",
    "name": "Абланица",
    "geography_id": "geo-849c6275fa0e0b1c17044a6d",
    "proposed_tier": "municipal",
    "human_review_required": true,
    "tier_uncertain": true
  },
  {
    "office_id": "BG-PAZ08-fc5837f6a1-V",
    "name": "Абланица",
    "geography_id": "geo-f13bd4ca89d1c4e4498203f7",
    "proposed_tier": "municipal",
    "human_review_required": true,
    "tier_uncertain": true
  }
]
```

**Assertion:** Same label Абланица is not the same place. Exact office-based Gs differ; no ambiguous legacy alias. Justin HOLD 2026-09-19: village rows stay `human_review_required` / `submunicipal_scope`. 2023 roster does not verify 2027 eligibility.

## Example 3 — District office is not silently promoted to regional

Source locator(s):

```json
{"column":null,"html_anchor_index":null,"input_path":"data/countries/bulgaria/unpacked/tables/master/office-register.json","json_pointer":"/rows/60","sha256":"00ddcca3c48141302a7432f97effd017a009fee3d64fb7f9000a72ef79663559","sheet":"Office register","source_row":2315}
```

Expected shape / disposition:

```json
{
  "office_id": "BG-VAR06-cc638e039f-D",
  "tier": "municipal",
  "schema_v1_tier": "municipal",
  "jurisdiction": "Аспарухово",
  "office": "District mayor",
  "rationale": "Register and identical companion register label Аспарухово / District mayor. Proposed municipal grouping for a village/district local office; preserve submunicipal scope. Justin must review this category policy; no claim that it is a separate full municipality. Calendar labels are not classification evidence.",
  "human_review_required": true,
  "tier_uncertain": true,
  "review_category": "submunicipal_scope",
  "evidence": [
    {
      "input_path": "data/countries/bulgaria/unpacked/tables/master/office-register.json",
      "sha256": "00ddcca3c48141302a7432f97effd017a009fee3d64fb7f9000a72ef79663559",
      "json_pointer": "/rows/60/3",
      "sheet": "Office register",
      "source_row": 2315,
      "column": "Office",
      "html_anchor_index": null
    },
    {
      "input_path": "data/countries/bulgaria/unpacked/tables/master/office-register.json",
      "sha256": "00ddcca3c48141302a7432f97effd017a009fee3d64fb7f9000a72ef79663559",
      "json_pointer": "/rows/60/2",
      "sheet": "Office register",
      "source_row": 2315,
      "column": "Jurisdiction",
      "html_anchor_index": null
    },
    {
      "input_path": "data/countries/bulgaria/unpacked/tables/companion/office-register.json",
      "sha256": "b37ae2acade8be9210092deb8595f21c3bf43ec1f13ebbd54956247a52161c6b",
      "json_pointer": "/rows/60/3",
      "sheet": "Office register",
      "source_row": 62,
      "column": "Office",
      "html_anchor_index": null
    }
  ]
}
```

**Assertion:** Register says District mayor, not regional legislature. Proposed municipal with focused submunicipal_scope review, no inferred regional layer.

## Example 4 — H/IX overlap contributes one event

Source locator(s):

```json
{"column":null,"html_anchor_index":null,"input_path":"data/countries/bulgaria/unpacked/tables/companion/history-index.json","json_pointer":"/rows/0","sha256":"85a3265ee93d7e31b886ba9457ccba4b0885282241940005661488cdf5c5e70a","sheet":"History index","source_row":2}
{"column":null,"html_anchor_index":null,"input_path":"data/countries/bulgaria/unpacked/history-index.json","json_pointer":"/0","sha256":"74bf9badf2f2ce84c6a6565d0554ebd516456aff45ed37af9c27c0938373661f","sheet":null,"source_row":null}
```

Expected shape / disposition:

```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "BG-BLG52-fc5837f6a1-V",
  "history_key": "BG-BLG52-fc5837f6a1-V::2023::2023-10-29",
  "event_id": "event-45bf491c498614054a89b7b9",
  "date_id": "date-06eefd10bd107e9e6664fbf5fdd3d8fc479d0fdf27fa34371eadc8627d6c007f",
  "date": {
    "label": "2023-10-29",
    "precision": "day",
    "certainty": "unknown",
    "year": 2023,
    "month": 10,
    "day": 29
  },
  "date_origin": {
    "input_path": "data/countries/bulgaria/unpacked/tables/companion/history-index.json",
    "sha256": "85a3265ee93d7e31b886ba9457ccba4b0885282241940005661488cdf5c5e70a",
    "json_pointer": "/rows/0/3",
    "sheet": "History index",
    "source_row": 2,
    "column": "Ballot date if recorded",
    "html_anchor_index": null
  },
  "selected_history_role": "selected",
  "event_kind": "unknown",
  "ballot_basis": "valid_votes",
  "share_unit": "percent_0_100",
  "legal_outcome": "unknown",
  "origin": {
    "input_path": "data/countries/bulgaria/unpacked/tables/companion/history-index.json",
    "sha256": "85a3265ee93d7e31b886ba9457ccba4b0885282241940005661488cdf5c5e70a",
    "json_pointer": "/rows/0",
    "sheet": "History index",
    "source_row": 2,
    "column": null,
    "html_anchor_index": null
  },
  "reconciliation_origin": {
    "input_path": "data/countries/bulgaria/unpacked/history-index.json",
    "sha256": "74bf9badf2f2ce84c6a6565d0554ebd516456aff45ed37af9c27c0938373661f",
    "json_pointer": "/0",
    "sheet": null,
    "source_row": null,
    "column": null,
    "html_anchor_index": null
  }
}
```

**Assertion:** Companion and CSV key/values reconcile; one selected event/date. O/J duplicate register contributes one office. No master history file exists.

## Example 5 — First round and decisive runoff stay one selected cycle

Source locator(s):

```json
{"column":null,"html_anchor_index":null,"input_path":"data/countries/bulgaria/unpacked/tables/companion/first-round-returns.json","json_pointer":"/rows/0","sha256":"9e4d60567f63fbf6cb99c20f2522f04309574df58a4e3f20ee185969d934f404","sheet":"First round returns","source_row":2}
{"column":null,"html_anchor_index":null,"input_path":"data/countries/bulgaria/unpacked/tables/companion/history-index.json","json_pointer":"/rows/11","sha256":"85a3265ee93d7e31b886ba9457ccba4b0885282241940005661488cdf5c5e70a","sheet":"History index","source_row":13}
```

Expected shape / disposition:

```json
{
  "selected_event": {
    "id_namespace": "cdd-observatory-v1",
    "office_id": "BG-VAR01-M",
    "history_key": "BG-VAR01-M::2023::2023-11-05",
    "event_id": "event-4dfb3f891b3e9636d4f0727b",
    "date_id": "date-6fdfb24f0a8102c17fc8bbf5159c19de3ca4e10c9bdcdeee4c4c9094049c231a",
    "date": {
      "label": "2023-11-05",
      "precision": "day",
      "certainty": "unknown",
      "year": 2023,
      "month": 11,
      "day": 5
    },
    "date_origin": {
      "input_path": "data/countries/bulgaria/unpacked/tables/companion/history-index.json",
      "sha256": "85a3265ee93d7e31b886ba9457ccba4b0885282241940005661488cdf5c5e70a",
      "json_pointer": "/rows/11/3",
      "sheet": "History index",
      "source_row": 13,
      "column": "Ballot date if recorded",
      "html_anchor_index": null
    },
    "selected_history_role": "selected",
    "event_kind": "unknown",
    "ballot_basis": "valid_votes",
    "share_unit": "percent_0_100",
    "legal_outcome": "unknown",
    "origin": {
      "input_path": "data/countries/bulgaria/unpacked/tables/companion/history-index.json",
      "sha256": "85a3265ee93d7e31b886ba9457ccba4b0885282241940005661488cdf5c5e70a",
      "json_pointer": "/rows/11",
      "sheet": "History index",
      "source_row": 13,
      "column": null,
      "html_anchor_index": null
    },
    "reconciliation_origin": {
      "input_path": "data/countries/bulgaria/unpacked/history-index.json",
      "sha256": "74bf9badf2f2ce84c6a6565d0554ebd516456aff45ed37af9c27c0938373661f",
      "json_pointer": "/11",
      "sheet": null,
      "source_row": null,
      "column": null,
      "html_anchor_index": null
    }
  },
  "first_round_row": {
    "Office ID": "BG-VAR01-M",
    "Country": "Bulgaria",
    "Jurisdiction": "Аврен",
    "Year": 2023,
    "Candidate or list": "Мирослав Сотиров Коларов",
    "Party": "БСП ЗА БЪЛГАРИЯ",
    "Votes": 176,
    "Share on source basis": 4.51,
    "Coverage": "Full candidate/list vector in the public CIK republication; exact original certification unverified",
    "Source URL": "https://storage.googleapis.com/data-electionsbg-com/2023_10_29_mi/municipalities/VAR01.json"
  },
  "first_round_disposition": "retained_input_only",
  "typed_additional_events": 0,
  "typed_additional_results": 0,
  "typed_proceedings": 0
}
```

**Assertion:** BG-VAR01-M2023 selected ballot is2023-11-05; F first-round vector stays contextual. Candidate office/year link is not a new event or automatic formal proceeding binding. HTML records Ordinary decisive runoff; raw evidence preserved.

## Example 6 — Unbound first round and qualification-change hold

Source locator(s):

```json
{"column":null,"html_anchor_index":null,"input_path":"data/countries/bulgaria/unpacked/tables/companion/first-round-returns.json","json_pointer":"/rows/1665","sha256":"9e4d60567f63fbf6cb99c20f2522f04309574df58a4e3f20ee185969d934f404","sheet":"First round returns","source_row":1667}
```

Expected shape / disposition:

```json
{
  "disposition": "retained_input_only_no_typed_event_proceeding_or_result",
  "kind": "first_round",
  "office_id": "BG-SLV11-b88d0d4475-V",
  "origin": {
    "input_path": "data/countries/bulgaria/unpacked/tables/companion/first-round-returns.json",
    "sha256": "9e4d60567f63fbf6cb99c20f2522f04309574df58a4e3f20ee185969d934f404",
    "json_pointer": "/rows/1665",
    "sheet": "First round returns",
    "source_row": 1667,
    "column": null,
    "html_anchor_index": null
  },
  "source_id": "bulgaria--S12d7241a76",
  "office_year_candidate_history_key": null,
  "office_year_candidate_event_id": null,
  "candidate_is_authoritative_stage_binding": false,
  "raw": {
    "Office ID": "BG-SLV11-b88d0d4475-V",
    "Country": "Bulgaria",
    "Jurisdiction": "Градец",
    "Year": 2015,
    "Candidate or list": "Галин Божидаров Христов",
    "Party": "ВМРО – БЪЛГАРСКО НАЦИОНАЛНО ДВИЖЕНИЕ",
    "Votes": 23,
    "Share on source basis": 1.947502116850127,
    "Coverage": "The published runoff field differs from the first-round top two; a withdrawal, correction or intervening decision has not been verified. Both rounds are preserved outside completed histories.",
    "Source URL": "https://web.archive.org/web/20230416154707/https://results.cik.bg/minr2015/tur1/mestni/2011_17436.html"
  }
}
```

**Assertion:** BG-SLV11-b88d0d4475-V2015 has 6 F rows but no H; keep these and 2 X runoff rows outside completed histories. Do not invent missing outcome, withdrawal or certification.

## Example 7 — Unresolved history remains addressable raw evidence

Source locator(s):

```json
{"column":null,"html_anchor_index":null,"input_path":"data/countries/bulgaria/unpacked/tables/companion/unresolved-history.json","json_pointer":"/rows/0","sha256":"32184e817be6042cd924819cf7c8353aaea39d6a961d23b8dff76be2d8ca3ec8","sheet":"Unresolved history","source_row":2}
```

Expected shape / disposition:

```json
{
  "raw": {
    "Office ID": "BG-VTR28-9b928b951a-V",
    "Jurisdiction": "Алеково",
    "Ballot date": "2015-10-25",
    "Phase": "Unresolved historical first round",
    "Candidate": "Димитър Костадинов Василев",
    "Party": "За Свищов (РБ, ВМРО-БНД, СЕ, НДСВ, ЗЕЛЕНИТЕ, ОЗ, НИКОЛА ПЕТКОВ, БСДП, ОБТ-БЛ)",
    "Votes": 194,
    "Share": 47.432762836185816,
    "Missing evidence": "Final outcome unresolved; excluded from completed histories",
    "Vote basis": "Published candidate shares",
    "Source URL": "https://web.archive.org/web/20220625013328/https://results.cik.bg/minr2015/tur1/mestni/0428_00237.html"
  },
  "disposition": "retained_input_only",
  "event_id": null,
  "proceeding_id": null
}
```

**Assertion:** Exact phase and missing-evidence label preserved for BG-VTR28-9b928b951a-V. Citation targets the X input locator; no fabricated event FK or third completed history.

## Example 8 — Percentage-only vector preserves missing votes

Source locator(s):

```json
{"column":null,"html_anchor_index":null,"input_path":"data/countries/bulgaria/unpacked/tables/companion/detailed-returns.json","json_pointer":"/rows/200","sha256":"464184162577bcb517049db7864a7dc6f66b7a8c38e67c832da5c0cd7795a6d7","sheet":"Detailed returns","source_row":202}
```

Expected shape / disposition:

```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "BG-SLS01-9b928b951a-V",
  "history_key": "BG-SLS01-9b928b951a-V::2015::2015-10-25",
  "event_id": "event-7a8b0beb2ebe4045dd4f643d",
  "result_row_id": "event-7a8b0beb2ebe4045dd4f643d-r0",
  "proceeding_id": null,
  "candidate_or_list_label": "Иван Захариев Христов",
  "original_party_label": "ПП ГЕРБ",
  "original_party_code": "ПП ГЕРБ",
  "party_namespace": "bulgaria/2015",
  "votes": null,
  "votes_status": "unknown",
  "share": 62.4,
  "share_status": "recorded",
  "share_unit": "percent_0_100",
  "seats": 1,
  "seats_status": "recorded",
  "evidence_status": "recorded",
  "origin": {
    "input_path": "data/countries/bulgaria/unpacked/tables/companion/detailed-returns.json",
    "sha256": "464184162577bcb517049db7864a7dc6f66b7a8c38e67c832da5c0cd7795a6d7",
    "json_pointer": "/rows/200",
    "sheet": "Detailed returns",
    "source_row": 202,
    "column": null,
    "html_anchor_index": null
  },
  "semantic_binding": [
    "cdd-observatory-v1",
    "BG-SLS01-9b928b951a-V",
    "BG-SLS01-9b928b951a-V::2015::2015-10-25",
    null,
    "Иван Захариев Христов",
    "ПП ГЕРБ"
  ]
}
```

**Assertion:** votes=NULL, votes_status=unknown; supplied share unchanged. No deriving votes from percent, total or seat count. 587 rows across 221 events have this limitation; ballot_basis unknown and certificate caveat retained.

## Example 9 — Reported zero is not NULL

Source locator(s):

```json
{"column":null,"html_anchor_index":null,"input_path":"data/countries/bulgaria/unpacked/tables/companion/detailed-returns.json","json_pointer":"/rows/281","sha256":"464184162577bcb517049db7864a7dc6f66b7a8c38e67c832da5c0cd7795a6d7","sheet":"Detailed returns","source_row":283}
```

Expected shape / disposition:

```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "BG-DOB15-1bc4e4491f-V",
  "history_key": "BG-DOB15-1bc4e4491f-V::2019::2019-10-27",
  "event_id": "event-4eeadb8f73b97cbb05401533",
  "result_row_id": "event-4eeadb8f73b97cbb05401533-r2",
  "proceeding_id": null,
  "candidate_or_list_label": "Евгени Емилов Игнатов",
  "original_party_label": "Местна коалиция ГЕРБ (ЗНС)",
  "original_party_code": "Местна коалиция ГЕРБ (ЗНС)",
  "party_namespace": "bulgaria/2019",
  "votes": 0,
  "votes_status": "zero",
  "share": 0,
  "share_status": "zero",
  "share_unit": "percent_0_100",
  "seats": 0,
  "seats_status": "zero",
  "evidence_status": "recorded",
  "origin": {
    "input_path": "data/countries/bulgaria/unpacked/tables/companion/detailed-returns.json",
    "sha256": "464184162577bcb517049db7864a7dc6f66b7a8c38e67c832da5c0cd7795a6d7",
    "json_pointer": "/rows/281",
    "sheet": "Detailed returns",
    "source_row": 283,
    "column": null,
    "html_anchor_index": null
  },
  "semantic_binding": [
    "cdd-observatory-v1",
    "BG-DOB15-1bc4e4491f-V",
    "BG-DOB15-1bc4e4491f-V::2019::2019-10-27",
    null,
    "Евгени Емилов Игнатов",
    "Местна коалиция ГЕРБ (ЗНС)"
  ]
}
```

**Assertion:** Keep reported0 vote/zero status; no automatic blank-to-zero. Contrast previous example. Numeric fields and evidence status are separate.

## Example 10 — Zero share does not imply zero votes

Source locator(s):

```json
{"column":null,"html_anchor_index":null,"input_path":"data/countries/bulgaria/unpacked/tables/companion/detailed-returns.json","json_pointer":"/rows/4050","sha256":"464184162577bcb517049db7864a7dc6f66b7a8c38e67c832da5c0cd7795a6d7","sheet":"Detailed returns","source_row":4052}
```

Expected shape / disposition:

```json
{
  "id_namespace": "cdd-observatory-v1",
  "office_id": "BG-PER32-ba56f6e25c-V",
  "history_key": "BG-PER32-ba56f6e25c-V::2015::2015-10-25",
  "event_id": "event-4d7e122c44bbe601635f7351",
  "result_row_id": "event-4d7e122c44bbe601635f7351-r3",
  "proceeding_id": null,
  "candidate_or_list_label": "Роза Методиева Златкова",
  "original_party_label": "„партия БЪЛГАРСКИ СОЦИАЛДЕМОКРАТИ, ПП ПАРТИЯ НА ЗЕЛЕНИТЕ”",
  "original_party_code": "„партия БЪЛГАРСКИ СОЦИАЛДЕМОКРАТИ, ПП ПАРТИЯ НА ЗЕЛЕНИТЕ”",
  "party_namespace": "bulgaria/2015",
  "votes": null,
  "votes_status": "unknown",
  "share": 0,
  "share_status": "zero",
  "share_unit": "percent_0_100",
  "seats": 0,
  "seats_status": "zero",
  "evidence_status": "recorded",
  "origin": {
    "input_path": "data/countries/bulgaria/unpacked/tables/companion/detailed-returns.json",
    "sha256": "464184162577bcb517049db7864a7dc6f66b7a8c38e67c832da5c0cd7795a6d7",
    "json_pointer": "/rows/4050",
    "sheet": "Detailed returns",
    "source_row": 4052,
    "column": null,
    "html_anchor_index": null
  },
  "semantic_binding": [
    "cdd-observatory-v1",
    "BG-PER32-ba56f6e25c-V",
    "BG-PER32-ba56f6e25c-V::2015::2015-10-25",
    null,
    "Роза Методиева Златкова",
    "„партия БЪЛГАРСКИ СОЦИАЛДЕМОКРАТИ, ПП ПАРТИЯ НА ЗЕЛЕНИТЕ”"
  ]
}
```

**Assertion:** Missing votes with a reported0 share remain exactly supplied; no percentage recomputation/clamp/rescale. Retain source basis and original precision.

## Example 11 — Pending next date and empty regional calendar

Source locator(s):

```json
{"column":"Next polling date","html_anchor_index":null,"input_path":"data/countries/bulgaria/unpacked/tables/master/office-register.json","json_pointer":"/rows/4/4","sha256":"00ddcca3c48141302a7432f97effd017a009fee3d64fb7f9000a72ef79663559","sheet":"Office register","source_row":2259}
{"column":null,"html_anchor_index":null,"input_path":"data/countries/bulgaria/unpacked/tables/master/election-calendar.json","json_pointer":"/rows/0","sha256":"4b2f379b9eb3dfa925625c6cb951ab45f0ba8703b94ba09f7a83135ef163434e","sheet":"Election calendar","source_row":23}
```

Expected shape / disposition:

```json
{
  "office_id": "BG-VAR01-M",
  "next_date_id": null,
  "next_history_key": null,
  "next_date_resolution": "unknown",
  "prospective_events": 0,
  "regional_offices_proposed": 0,
  "regional_universe_denominator": null
}
```

**Assertion:** Expected autumn 2027 narrative and cohort Regional / municipal do not generate day/month/year event or tier. Regional empty state is correct; no percentage against an invented universe.

## Example 12 — Full day precision keeps unknown certainty

Source locator(s):

```json
{"column":"Ballot date if recorded","html_anchor_index":null,"input_path":"data/countries/bulgaria/unpacked/tables/companion/history-index.json","json_pointer":"/rows/0/3","sha256":"85a3265ee93d7e31b886ba9457ccba4b0885282241940005661488cdf5c5e70a","sheet":"History index","source_row":2}
```

Expected shape / disposition:

```json
{
  "label": "2023-10-29",
  "precision": "day",
  "certainty": "unknown",
  "year": 2023,
  "month": 10,
  "day": 29
}
```

**Assertion:** ISO day is source precision only; unknown certainty does not become certified/called. Isolated future CI mutation of this date to2023-10 must retain month precision and dayNULL; not a baseline research claim. Key-bearing correction needs accepted identity binding.

## Example 13 — Source resolves without fabricated metadata

Source locator(s):

```json
{"column":null,"html_anchor_index":null,"input_path":"data/countries/bulgaria/unpacked/tables/master/sources.json","json_pointer":"/rows/0","sha256":"0f50e3fad6e3e4f37e22ff42013e29992a35e0105445dc2885543f0166a30afc","sheet":"Sources","source_row":1202}
```

Expected shape / disposition:

```json
{
  "source_id": "bulgaria--S9ce82f9afe",
  "url": "https://storage.googleapis.com/data-electionsbg-com/2023_10_29_mi/municipalities/BGS01.json",
  "title": "Тополица 2023_10_29_mi Village mayor",
  "evidence_grade": "Public machine-readable republication of CIK returns; original certificates not independently rechecked",
  "checked_as_of_label": "2026-09-10",
  "original_source_id": "S9ce82f9afe",
  "origins": [
    {
      "input_path": "data/countries/bulgaria/unpacked/tables/master/sources.json",
      "sha256": "0f50e3fad6e3e4f37e22ff42013e29992a35e0105445dc2885543f0166a30afc",
      "json_pointer": "/rows/0",
      "sheet": "Sources",
      "source_row": 1202,
      "column": null,
      "html_anchor_index": null
    },
    {
      "input_path": "data/countries/bulgaria/unpacked/tables/companion/sources.json",
      "sha256": "92a6d49f68ba8e490a6a3252e7d654efa259481103acc0bea910188a6b74e9cf",
      "json_pointer": "/rows/0",
      "sheet": "Sources",
      "source_row": 2,
      "column": null,
      "html_anchor_index": null
    }
  ],
  "url_alias": "bulgaria--url-329863f711d3cbf0694506fc"
}
```

**Assertion:** Shared SM/SC rows merge by exact equal Source ID; both origins survive. Publisher/file_sha256NULL, rightsunknown; title/grade/access label verbatim. URL-year is not used as ballot date.

## Example 14 — Unresolved token differs from broken resolved-source FK

Source locator(s):

```json
{"column":"Source URL","html_anchor_index":null,"input_path":"data/countries/bulgaria/unpacked/tables/companion/detailed-returns.json","json_pointer":"/rows/200/13","sha256":"464184162577bcb517049db7864a7dc6f66b7a8c38e67c832da5c0cd7795a6d7","sheet":"Detailed returns","source_row":202}
```

Expected shape / disposition:

```json
{
  "baseline_url": "https://web.archive.org/web/20151029143913/http://results.cik.bg:80/minr2015/tur1/mestni/1901_00240.html",
  "baseline_source_id": "bulgaria--Sa4f0ca88a5",
  "isolated_test_token": "TEST_UNRESOLVED_BULGARIA",
  "test_reason": "unmatched_catalogue_token"
}
```

**Assertion:** Baseline source resolves. Future invalid token test uses explicit unresolved row against real result locator. Separately deleting already-resolved source from staging must fail FK and roll back; cannot relabel unresolved to pass. Tests Not run.

## Example 15 — Open research watches remain despite complete mapping

Source locator(s):

```json
{"column":"Scope and remaining gaps","html_anchor_index":null,"input_path":"data/countries/bulgaria/unpacked/tables/master/country-notes.json","json_pointer":"/rows/0/1","sha256":"01f533b0895f355524081ba0a48469ee07b6672364b3c73878bfe4f7e0d86622","sheet":"Country notes","source_row":11}
```

Expected shape / disposition:

```json
{
  "country_notes": "The register names 3,597 offices from all 265 municipalities and the 2023 district/village roster. Archived official CIK pages recover 1,776 usable 2015 village/district histories, including 1,555 exact candidate-vote vectors and 221 percentage-only vectors. First rounds and runoffs are one cycle. Some archived pages, older histories and decisive outcomes remain missing; unresolved first rounds are excluded from completed histories. Original certificates, final 2027 village eligibility and announcements after the 28 August replacement-register snapshot remain unverified.",
  "coverage_status": "partial",
  "research_coverage_complete": 0
}
```

**Assertion:** Missing CIK pages, certificates, decisive outcomes, final 2027 village eligibility and announcements after28 August snapshot remain open. No votes/control/risk invented from inventory count 0.

## Example 16 — Unchanged re-import and failure isolation

Source locator(s):

```json
Bulgaria_Input_Inventory.json /hash_inputs plus exact input descriptors
```

Expected shape / disposition:

```json
{
  "candidate_fingerprint": "51cb9381de3e680a9332fd7aaeff3035246f55f9512c723d874a25fb2447afba",
  "candidate_release_id": "country-package-bulgaria--sha256-51cb9381de3e680a9332fd7aaeff3035246f55f9512c723d874a25fb2447afba",
  "same_effective_inputs": "same R; new attempt UUID",
  "poison_failure": "discard staging; durable failed ledger; prior publication serves",
  "draft_publishable": false
}
```

**Assertion:** Two-import/poison CI is specified Not run. Re-import only Bulgaria: unrelated Europe/LatAm/NZ release IDs and citations unchanged. Approved tier bytes are a future different hash input.

## Example 17 — Fixture exclusion and incomplete refresh

Source locator(s):

```json
Identity Rules → Fingerprint and incomplete refresh; isolated CI probes only
```

Expected shape / disposition:

```json
{
  "fixture_markers": [
    "FIX-",
    "FXT-",
    "OBSERVATORY_FIXTURES"
  ],
  "production_fixture_rows": 0,
  "omitted_existing_office": "retain original IDs, input hashes, tiers, results and evidence",
  "silent_deletion": false
}
```

**Assertion:** Reject fixtures anywhere in production effective identities/semantic raw inputs; no real fixture office is added here. Omitted rows in incomplete package are not withdrawal. Actual execution Not run.
