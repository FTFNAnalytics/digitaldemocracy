# Election Atlas read API

Route handlers in the Next.js app. There is no separate API service. Every handler reads the same functions the Atlas pages use (`loadJurisdictionView`, `readSeatPage`, `loadCyclePage`, and the derived readers in `lib/atlas/derive/read.ts`). A JSON body for a page is that reader value. CSV is the same rows flattened, with provenance columns added.

Person tables are not in the master yet. Person routes keep the response shape and return no rows until those tables are published. See [Person](#person).

Base path: `/api/atlas`.

Lists use cursor pagination. The default and maximum page size is 200. Pass `limit` (1–200) only to request a smaller page. `country` filters on `country_id`. `cursor` is an opaque token from `nextCursor`. A missing `nextCursor` means the last page. An unknown cursor or a `limit` outside 1–200 is HTTP 400 `{ "error": "invalid_cursor" }` or `{ "error": "invalid_limit" }`.

Order:

| List | Order |
| --- | --- |
| Jurisdictions | `slug_path` |
| Seats | `id_namespace`, then `office_id` |
| Cycles | `cycle_key` |
| People | `person_id` (approved rows only) |

## Caching

Every response sets:

- `ETag` — SHA-256 of the publication stamp plus the request path and query. The stamp covers release fingerprints, snapshot labels, evidence-status counts, and derived row counts.
- `Cache-Control: public, no-cache` — store the response, but revalidate with `If-None-Match` before reuse.
- `X-Atlas-Cache-Tag: atlas-derived` — the Next.js cache tag.
- `X-Atlas-Publication` — the publication stamp (not the per-URL ETag).
- `X-Robots-Tag: noindex`

`npm run derive:atlas` rebuilds derived tables for every country and calls `revalidateTag("atlas-derived")`. A one-country import already rebuilds that country's rows; do not run the full command after it. `npm run derive:atlas:country -- --country=<country_id>` rebuilds one country. A running server is flushed when `ATLAS_REVALIDATE_URL` and `ATLAS_REVALIDATE_SECRET` are set (`POST /api/atlas/revalidate`). After that stamp changes, the ETag changes and a conditional request gets a new body. A matching `If-None-Match` on a successful representation returns 304.

Nginx should rate-limit `/api/`. The recommended block is in [docs/deploy.md](deploy.md#api-rate-limit).

## Provenance columns

Empty means the database did not supply a value. Exports do not write `0` or a guessed licence in that case.

| Column | Meaning |
| --- | --- |
| `source_ids` | `source.source_id` values linked through `evidence_link` and `record_locator`, sorted and joined with `\|`. |
| `snapshot_label` | `dataset_release.research_snapshot_label` or `derived_coverage.latest_snapshot_label` for the place. |
| `evidence_status` | `result_row.evidence_status` when the row is a result. Empty on jurisdiction, seat-status, and cycle rows, which are not result rows. |
| `record_id` | The identifier to cite: jurisdiction key, `id_namespace:office_id`, cycle key, event id, or result row id. |
| `release_id` | `publication_release.release_id` / the row's `release_id`. |
| `id_namespace` | Office id namespace, when the row is an office, event, or result. |
| `result_row_id`, `event_id`, `history_key`, `office_id`, `jurisdiction_key` | Record identifiers carried beside `record_id` so a file can be joined without parsing `record_id`. |

Withheld evidence (`preliminary`, `disputed`, `superseded`, `structurally_unavailable`, `not_applicable`) is omitted from every export: seat JSON proceedings, seat and cycle CSV, contest rows in country zips, and person history.

## Worked examples

Placeholders in angle brackets are field positions, not published figures. `tests/atlas/api.test.ts` loads the Albania fixture and asserts that each JSON twin equals the page reader.

### `GET /api/atlas/jurisdictions`

```json
{
  "items": [
    {
      "jurisdictionKey": "<jurisdiction_key>",
      "countryId": "<country_id>",
      "geographyId": null,
      "parentKey": null,
      "depth": 0,
      "levelLabel": "country",
      "name": "<name>",
      "slug": "<slug>",
      "slugPath": "<slug_path>",
      "officeCount": "<office_count>",
      "eventCount": "<event_count>",
      "firstEventYear": null,
      "lastEventYear": null,
      "coverageStatus": "<coverage_status>",
      "ambiguous": 0,
      "provenance": {
        "sourceIds": ["<source_id>"],
        "snapshotLabel": "<research_snapshot_label or null>",
        "evidenceStatus": null,
        "recordId": "<jurisdiction_key>",
        "releaseId": "<release_id>",
        "idNamespace": null
      }
    }
  ],
  "pageSize": 200,
  "nextCursor": null
}
```

`nextCursor` is a base64url key. The following page is `?cursor=<nextCursor>`.

| Field | Reader |
| --- | --- |
| Jurisdiction fields | `AtlasJurisdiction` in `lib/atlas/derive/read.ts` |
| `provenance` | Added on the list. Not a column of `derived_jurisdiction`. |
| `pageSize` | Applied limit, default 200. |
| `nextCursor` | Last `slug_path` on this page, or null. |

### `GET /api/atlas/jurisdictions/{slug_path}`

`{slug_path}` is the public path without `/atlas/`, for example `albania` or `albania/tirane`. A former slug returns 301 to the canonical API path. Unknown slugs return 404 `{ "error": "not_found" }`.

The body is `JurisdictionView` from `loadJurisdictionView` (the jurisdiction page):

| Field | Meaning |
| --- | --- |
| `jurisdiction` | `AtlasJurisdiction` |
| `countryName`, `parentName` | Names from the place chain |
| `ancestors` | `{ name, slugPath }[]` above this place |
| `coverage` | `AtlasCoverage` or null |
| `children` | Child places (`JurisdictionPlace`: id, name, slugPath, level, coverage counts, years, next date, margin, turnout). Null stays null. |
| `seats` | Offices at this place (`JurisdictionSeat`) |
| `cycles` | Cycles whose contests sit in this place or below (`JurisdictionCycle`) |
| `nextElectionLabel` | Earliest supplied next-election label, or null |

### `GET /api/atlas/jurisdictions/{slug_path}.csv`

Header:

```text
row_kind,name,level,slug_path,jurisdiction_key,office_id,id_namespace,held_by,since,last_share,last_share_unit,cycle_key,iso_date,contest_count,label,source_ids,snapshot_label,evidence_status,record_id,release_id
```

`row_kind` is `child`, `seat`, or `cycle`, matching the three lists on the page. One example seat row, with empty cells where that list does not carry the column:

```text
seat,<office name>,,,,<office_id>,<id_namespace>,<held_by>,<since>,<last_share>,<last_share_unit>,,,,,,<source_ids>,<snapshot_label>,,<id_namespace>:<office_id>,<release_id>
```

### `GET /api/atlas/seats`

Same list envelope. Each item is `AtlasSeatStatus` plus `officeName` and `provenance`.

| Field | Meaning |
| --- | --- |
| `idNamespace`, `officeId`, `countryId` | Office identity |
| `currentHolderLabel`, `currentHolderPartyLabel`, `currentSinceDateId` | From `derived_seat_status`. Null when no single settled holder was supplied. |
| `lastSelectedEventId`, `lastShare`, `lastShareUnit`, `lastMargin` | Last settled result fields. Null when not supplied. |
| `nextDateId` | Office next date id, or null |
| `statusReason` | `multi_seat`, `no_elected_flag`, `withheld`, `no_history`, `conflicting_date`, `superseded`, or null when a holder is shown |
| `officeName` | `office.name` |
| `provenance.recordId` | `id_namespace:office_id` |
| `provenance.evidenceStatus` | Null. This row is not a result row. |

```json
{
  "items": [
    {
      "idNamespace": "<id_namespace>",
      "officeId": "<office_id>",
      "countryId": "<country_id>",
      "currentHolderLabel": null,
      "currentHolderPartyLabel": null,
      "currentSinceDateId": null,
      "lastSelectedEventId": "<event_id or null>",
      "lastShare": null,
      "lastShareUnit": null,
      "lastMargin": null,
      "nextDateId": null,
      "statusReason": "<status_reason or null>",
      "officeName": "<office name>",
      "provenance": {
        "sourceIds": [],
        "snapshotLabel": "<snapshot or null>",
        "evidenceStatus": null,
        "recordId": "<id_namespace>:<office_id>",
        "releaseId": "<release_id>",
        "idNamespace": "<id_namespace>"
      }
    }
  ],
  "pageSize": 200,
  "nextCursor": "<cursor or null>"
}
```

### `GET /api/atlas/seats/{office_id}`

Body is `SeatPageModel` from `readSeatPage` (the seat page), with withheld proceeding rows removed. When `office_id` matches more than one namespace the response is HTTP 409:

```json
{
  "status": "ambiguous",
  "namespaces": ["<id_namespace>"],
  "candidates": [
    {
      "idNamespace": "<id_namespace>",
      "officeId": "<office_id>",
      "name": "<office name>",
      "jurisdiction": "<place>",
      "href": "<path or null>"
    }
  ]
}
```

Request one candidate as `GET /api/atlas/seats/{id_namespace}/{office_id}`.

`SeatPageModel` fields: `officeId`, `officeName`, `countryId`, `countryName`, `idNamespace`, `lineageId`, `releaseId`, `kind`, `electoralSystem`, `termYears`, `holderPhrase`, `holderShown`, `nextElectionLabel`, `crumbs`, `readablePath`, `history`, `timeline`, `related`, `provenance`, `historyKeys`. History cells use the page's "not supplied" text when a value is missing. `provenance[]` on the model carries publisher, title, url, snapshot label, evidence grade, and `recordId` for each event.

### `GET /api/atlas/seats/{office_id}.csv`

Header:

```text
cycle,winner,party,votes,share,margin,turnout,source_ids,snapshot_label,evidence_status,event_id,history_key,office_id,id_namespace,result_row_id,record_id,release_id
```

One row per history cycle on the seat page. `record_id` is the event id. `result_row_id` and `evidence_status` are set only when that cycle has exactly one standing elected row.

```text
<cycle>,<winner>,<party>,<votes>,<share>,<margin>,<turnout>,<source_ids>,<snapshot_label>,<evidence_status>,<event_id>,<history_key>,<office_id>,<id_namespace>,<result_row_id>,<event_id>,<release_id>
```

### `GET /api/atlas/cycles`

List envelope of `AtlasCycle` plus `provenance`.

| Field | Meaning |
| --- | --- |
| `cycleKey`, `countryId`, `dateId`, `isoDate`, `contestCount`, `scopeKey` | `derived_cycle` |
| `tiers`, `kinds` | Arrays decoded from `tiers_json` and `kinds_json` |
| `label` | The derived label (facts only; not a name the source did not supply) |
| `provenance.recordId` | `cycle_key` |
| `provenance.sourceIds` | Source ids of events on that resolved day |
| `provenance.evidenceStatus` | Null |

```json
{
  "items": [
    {
      "cycleKey": "<cycle_key>",
      "countryId": "<country_id>",
      "dateId": "<date_id>",
      "isoDate": "<YYYY-MM-DD>",
      "contestCount": "<contest_count>",
      "scopeKey": "<jurisdiction_key>",
      "tiers": ["<tier>"],
      "kinds": ["<event_kind>"],
      "label": "<label>",
      "provenance": {
        "sourceIds": ["<source_id>"],
        "snapshotLabel": "<snapshot or null>",
        "evidenceStatus": null,
        "recordId": "<cycle_key>",
        "releaseId": "<release_id>",
        "idNamespace": null
      }
    }
  ],
  "pageSize": 200,
  "nextCursor": null
}
```

### `GET /api/atlas/cycles/{country}/{date}`

`{date}` is `YYYY-MM-DD`, a year `YYYY`, or `undated`. Optional further segments are the place scope, as on `/atlas/{country}/elections/{date}/{scope}`.

The body is `CyclePageModel` from `loadCyclePage`: `kind` (`day` or `year`), `label`, `dateChip`, `description`, `path`, `csvHref`, `countryName`, `placeName`, `crumbs`, `ballots`, `turnout`, `contests`, `switcher`, `queued`, `countryNotes`.

Each contest includes `results` (withheld rows already dropped), `proceedings`, `provenance` (publisher, title, url, snapshot, evidence grade, record id), and `record` (`officeId`, `idNamespace`, `lineageId`, `releaseId`, `historyKey`). `ballots` and `turnout` are null when the source did not supply them.

An alias slug returns 301. An unknown cycle returns 404 `{ "error": "not_found" }`.

### `GET /api/atlas/cycles/{country}/{date}.csv`

Header:

```text
contest,candidate_or_list,party,votes,votes_status,share,share_status,share_unit,seats,seats_status,elected,source_ids,snapshot_label,evidence_status,event_id,history_key,office_id,id_namespace,result_row_id,record_id,release_id
```

One row per visible result. Numeric columns are the reader values, not the page's display phrases. `elected` is `true` or `false`. `record_id` is `result_row_id`.

```text
<office name>,<candidate_or_list>,<party>,<votes>,<votes_status>,<share>,<share_status>,<share_unit>,<seats>,<seats_status>,false,<source_ids>,<snapshot_label>,recorded,<event_id>,<history_key>,<office_id>,<id_namespace>,<result_row_id>,<result_row_id>,<release_id>
```

The word `recorded` above is the evidence status stored on a result row, not a sample count.

### Person

`GET /api/atlas/people` and `GET /api/atlas/people/{slug}` are the person twins. They read `person` and `person_alias` when those tables have the columns `person_id`, `canonical_label`, `country_id`, `review_status` and `person_id`, `country_id`, `candidate_or_list_label`, `review_status`. Draft rows are not exported. History is result rows whose approved alias matches `candidate_or_list_label` in that country, excluding withheld evidence. `margin` is null in this reader.

Until those tables exist the list is HTTP 200:

```json
{
  "available": false,
  "dependency": "OV-09",
  "items": [],
  "pageSize": 200,
  "nextCursor": null
}
```

A detail request while those tables are absent is HTTP 404:

```json
{
  "available": false,
  "dependency": "OV-09",
  "person": null
}
```

Once the tables exist, an unknown slug is HTTP 404 `{ "error": "not_found" }`.

When a person is published, the body is:

| Field | Meaning |
| --- | --- |
| `personId`, `slug`, `canonicalLabel`, `countryId`, `reviewStatus` | Person row. `slug` is `person_id` when the table has no `slug` column. |
| `aliases` | `{ label, officeScope }` for approved aliases. `officeScope` is null when that column is absent. |
| `history[].year` | Year from the event date, or null |
| `history[].election` | Date label, or the event id when no label was supplied |
| `history[].seat` | Office name |
| `history[].result` | `elected`, `not elected`, or null from `elected_flag` |
| `history[].votes`, `share` | The result row. Null when not supplied. |
| `history[].margin` | Null in this reader |
| `history[].sourceIds`, `snapshotLabel`, `evidenceStatus`, `recordId`, `releaseId` | Provenance. `recordId` is `result_row_id`. |

`GET /api/atlas/people/{slug}.csv` header:

```text
person_id,slug,canonical_label,country_id,review_status,alias_labels,year,election,seat,result,votes,share,margin,source_ids,snapshot_label,evidence_status,record_id,release_id
```

## Country bundles

`GET /atlas/downloads` lists one zip per country. The page is indexable. `derive:atlas` writes:

- `public/atlas/downloads/{slug}.zip`
- `public/atlas/downloads/{slug}.zip.sha256` — SHA-256 of the zip, `sha256sum` layout

Zip members:

| File | Contents |
| --- | --- |
| `jurisdictions.csv` | `AtlasJurisdiction` columns plus provenance. Header starts `jurisdiction_key,country_id,...` |
| `seats.csv` | `AtlasSeatStatus` plus `office_name` and provenance |
| `cycles.csv` | `AtlasCycle` columns (`tiers` and `kinds` pipe-joined) plus provenance |
| `contests.csv` | Result rows that are not withheld, with provenance. `record_id` is `result_row_id`. |
| `unplaced.csv` | `derived_cycle_unplaced` rows plus provenance |
| `people.csv` | Person CSV header, and rows only when approved person tables are present |
| `LICENSE` | `data_rights`, publisher, title, and url copied from `source` for that country. `unknown` means the source row did not name a licence. |
| `SHA256SUMS` | SHA-256 of the CSV members and `LICENSE` |

`/electiondatabase/downloads` is unchanged.

## Robots and sitemap

`app/robots.ts` disallows `/api/`. API responses also send `X-Robots-Tag: noindex`. `/atlas/downloads` is in the sitemap and does not set `noindex`.
