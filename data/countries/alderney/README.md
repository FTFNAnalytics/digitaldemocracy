# Alderney: European country/territory upload 02

Research checked through **11 September 2026**. Extracted from the preserved European package dated **15 September 2026**. Fixed election window: **8 September 2026–8 March 2028**, inclusive. This is an extraction of existing research, not a fresh review of election authorities.

| Included record | Count |
| --- | ---: |
| Tracked office/contest records | 2 |
| Selected historical events | 6 |
| Selected candidate/list return rows | 27 |
| Dated governing-control observations | 0 |
| Registered source rows | 6 |
| Original individual briefings | 2 |
| Calendar cohorts | 1 |
| National polling records | 0 |
| Historical competition scores | 0 |
| Grouped-volatility scores | 0 |

## Evidence and interpretation

Alderney is retained as a distinct territory entry. `GG-ALD` is an internal jurisdiction identifier, not a separate ISO sovereign-country code. The two records are the States members renewal and the plebiscite nominating two Guernsey States representatives; they are not two municipalities.

The source records **21 November 2026** for the States renewal and **12 December 2026** for the representatives plebiscite. These dates come from an official July proposal whose final resolution has not been verified. The calendar's first/end date columns cover these different contests; December is not a runoff of the November election.

The selected States history is 2025/2024/2023 actual events. The separate ordinary 2024/2022/2020 context remains inside the original briefing, including the unopposed 2022 renewal. The plebiscite has selected 2024/2022/2020 histories. Candidate totals retain their secondary-source status and require direct primary numerical comparison. Multi-vote ballots and unopposed outcomes prevent ordinary party-share competitiveness and volatility calculations. All such aggregate scores remain null.

No dated current-control observation or polling record was supplied for Alderney. Missing records do not establish the absence of officeholders or polls.

## Files and field contract

- [Open the briefing index](alderney.html) after downloading this folder. Original individual HTML briefings are byte-preserved; the small navigation index is newly generated.
- `tables/*.json` contains the country-filtered workbook records. Each file has one `columns` array, an array of `rows`, and matching `source_rows` with the original Excel row numbers. Zip each row with its columns to form a keyed record. Numbered parts, if present, belong to the same source sheet.
- `coverage.json` preserves the original country-coverage CSV entry. Shared Parameters and Read me tables provide methodology; their Europe-wide totals are contextual, not this entry's totals.
- `history-index-crosscheck.json` is the independently exported history CSV slice. It duplicates selected workbook histories and must not be added to the record count.
- `source-links.json` distinguishes source-register URLs from inline links without a master source row. Missing source metadata is not invented.
- `cached-formulas.json` records original formula text and cached outputs. Formula references point into the original full workbook, not these extracted tables.
- `manifest.json` records the original archive/input hashes, generated data-file hashes, row counts and partial-coverage status.

Excel date serials were converted using the workbook's 1900 epoch to ISO calendar dates. Empty cells and unavailable formula results remain JSON null; reported numeric zero stays zero. Original numerical precision, evidence grades and source dates are preserved. Additional historical context in briefings is distinct from the selected-history count. Sanitize original HTML before embedding it in another application.

## Validation and reproduction

Python 3 and its standard library are sufficient:

```sh
python data/countries/alderney/validate.py
python data/countries/alderney/validate.py /path/to/Europe_Excluding_Russia_Election_Data_2026-09-15.zip
```

The validator checks record counts, identity and return-to-history relationships, source references, score eligibility and all generated-content hashes. It reconciles every selected workbook history against the independent CSV. The optional archive argument verifies input hashes and byte equality for every original briefing. These checks establish extraction fidelity, not legal certification or complete national research.

To reproduce the generated files from the exact source archive:

```sh
python data/countries/alderney/extract.py /path/to/Europe_Excluding_Russia_Election_Data_2026-09-15.zip
python data/countries/alderney/validate.py
```

## Publication status

**GitHub research input; website adapter pending.** The existing application loads `data/research`, not this standalone folder. This PR contains only `alderney` and can be reviewed independently. Merging the data alone does not publish it at `/electiondatabase`.

The next integration must map the records, source states, date precision, original briefings and metric gates into the website schema, then verify public country, office, election and download routes. European uploads remain separate country/territory changes, with Russia excluded.
