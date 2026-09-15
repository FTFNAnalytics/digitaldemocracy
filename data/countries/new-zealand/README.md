# New Zealand: initial research batch

Snapshot: **15 September 2026**. Upcoming-election window: **8 September 2026–8 March 2028**, inclusive.

This small, standalone research input adds four local by-election records, 11 candidate names and 36 historical candidate rows across three events. Coverage is **partial**: two historical tables were reviewed on official production pages; the third comes from a provisional council-branded legacy mirror. This is not a complete national inventory or a finished latest-three-election dataset.

## Upcoming records

| Authority / contest | Scheduled close | Imported candidates | Evidence |
| --- | --- | ---: | --- |
| Buller / Westport Ward | 16 October 2026, noon | 6 | [Council page reviewed](https://bullerdc.govt.nz/your-council/council-elections/2026-westport-ward-by-election/) |
| Clutha / Lawrence–Tuapeka Community Board | 16 October 2026; time uncollected | Uncollected | [Initial official notice reviewed](https://www.cluthadc.govt.nz/council/news?item=id:2ys4k3f7k1cxbyb5totq); later nomination notice pending |
| Porirua / Onepoto General Ward | 16 October 2026, noon | 5 | [Official indexed timetable](https://poriruacity.govt.nz/your-council/mayor-councillors/elections-2026/); full notice recheck pending |
| Wellington / Takapū/Northern General Ward | 11 December 2026, noon | Nominations not final | [Official indexed notice](https://wellington.govt.nz/have-your-say/public-inputs/public-notices/open/other/notice-of-by-election-for-the-takapu-northern-general-ward); full notice recheck pending |

All times are local, Pacific/Auckland. Scheduled elections are not results. Empty candidate arrays mean uncollected or not final, never automatically unopposed. These vacancy records do not enumerate the other serving members of each council or board.

## Historical evidence

| Contest | Election | Candidate rows | Status |
| --- | --- | ---: | --- |
| Westport Ward | 2025 | 17 | Official final table |
| Westport Ward | 2022 | 12 | Provisional legacy mirror |
| Lawrence–Tuapeka Community Board | 2025 | 7 | Official final table |

Sources, review limitations and outstanding tasks are embedded in [dataset.json](./dataset.json). In Clutha, the final 17 October declaration supersedes the preliminary and progress tables on the same page. The community-board contest is separate from the council ward contest.

All three historical contests elected six members. Candidate marks can overlap across a voter's selections; they are not unique voters or mutually exclusive party shares. Candidate totals are not used as a turnout denominator. All competitiveness and Pedersen metrics are withheld. STV histories will require stage reports and a suitable method before comparison.

## Field contract

- `schema_version: nz-research-batch/1` identifies this standalone input format.
- `races` contains prospective by-elections; `histories` references races using `related_race_id`.
- `sources` has stable IDs, URLs, publishers, check dates and review status. Historical candidate rows inherit the event's sources; prospective candidates carry their own references.
- `null` means unknown, uncollected or withheld. Zero means a reported zero only.
- `elected` in historical rows describes the result at that election, not current officeholding.
- Historical names follow the published tables. Similar names across cycles are not automatically linked identities. Unreported affiliation stays null; it is not inferred as Independent.
- `coverage` counts only included records. `research_gaps` is the next-work queue.
- Official search excerpts are identified as such. Their existence does not mean the whole original notice was retrieved or authenticated. The 2022 mirror must be replaced or corroborated before analytical use.

## Validate

Run from any working directory with Node.js:

```sh
node data/countries/new-zealand/validate.mjs
```

The validator checks references, date bounds, future-result nulls, candidate marks versus ballots, elected-seat counts, metric gates and coverage claims. It does not certify source authenticity or national completeness.

For this initial commit, the exported validation function passed in the JavaScript tool runtime, including seven deliberate corruption checks. The workspace disconnected before a local Node CLI run could be performed; that limitation is recorded rather than represented as a completed test.

## Integration and next work

This country folder is a research input. The existing Latin America importer does **not** load it, and this commit does not publish New Zealand in the website.

Next: verify the Clutha candidate notice; recheck blocked Porirua/Wellington pages; replace the Buller mirror; recover missing historical returns and boundary relationships; finish a national screen; then add and test an explicit application adapter. Clutha's archive includes a 2020 board by-election, so selecting the latest three events requires more than choosing ordinary election years.
