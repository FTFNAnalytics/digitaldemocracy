# Albania: European country upload 01

Research checked through **11 September 2026**; extracted from the European package dated **15 September 2026**. Election window: **8 September 2026–8 March 2028**, inclusive. Russia remains excluded from the European build.

| Included record | Count |
| --- | ---: |
| Municipalities on the source planning map | 61 |
| Offices: 61 mayors and 61 councils | 122 |
| Selected historical events | 366 |
| Selected historical candidate/list result rows | 3,843 |
| Dated governing-control observations | 45 |
| Source-register rows | 182 |
| Individual original office briefings | 122 |
| Calendar cohorts / national polling observations | 1 / 1 |
| Computed competition / grouped-volatility scores | 0 / 0 |

This is a faithful extraction of existing research, not a new verification of election authorities. Full reported vote vectors are not necessarily certified final numerical returns. Three selected events do not automatically form a comparable three-election series.

The expected ordinary cycle is 2027; the formal polling date remains uncollected. The 61-municipality map is a planning register. The source discusses a proposed 46-municipality reform and explicitly leaves enacted boundaries and a crosswalk unverified. Do not convert that proposal into a confirmed future electoral map.

The 2019 opposition boycott and party/coalition changes block the aggregate three-event competition and volatility measures. Null scores remain null. Some latest-event gaps are available as historical observations, not election forecasts. Replacement and repeated elections remain in actual-event order. Annulled Rrogozhinë May 2023 is excluded from selected histories. Additional ordinary-cycle context is retained within original briefings and must not be counted a second time.

The 45 control observations are dated website evidence with staleness limits. A candidate's prior nomination is not proof of current party affiliation. The IRI record concerns national government evaluation, not municipal voting intention; its retrieval limits remain attached.

## Read the data

- [Open the briefing index](albania.html) after downloading this folder. Each original HTML briefing links back to that index and retains its external citations.
- `tables/*.json` holds country-filtered workbook tables. Files use one `columns` array and a parallel array of `rows`. Zip these together to obtain keyed records. `source_rows` preserves the original Excel row numbers. Numbered files are consecutive parts of the same source sheet.
- `coverage.json` retains the original country-coverage CSV record.
- `history-index-crosscheck.json` retains the separate historical CSV slice for independent reconciliation. It duplicates the selected workbook history, so do not add it to totals.
- `source-links.json` distinguishes URLs with source-register rows from inline citations without such a row. Missing titles, publishers and retrieval dates are not invented.
- `cached-formulas.json` preserves original formulas and cached outputs. References target the original full workbook. These formulas were not recalculated or made executable in this extract.
- `manifest.json` lists archive and input hashes, all generated data-file hashes, row counts and the partial-coverage state.

Dates stored as Excel serials were converted using the workbook's 1900 date system to ISO calendar dates. Unknown values and empty formula outputs are JSON null, not zero. Numeric source values retain their precision. The shared Parameters and Read me tables preserve the workbook's methodology; their Europe-wide totals are contextual and must not be presented as Albania totals.

Original office HTML files are byte-preserved. Their country index is newly generated. HTML must be sanitized before embedding in another application; this input is not permission to inject arbitrary source HTML into a page.

## Reproduce and check

Requires Python 3 and its standard library only:

```sh
python data/countries/albania/validate.py
python data/countries/albania/validate.py /path/to/Europe_Excluding_Russia_Election_Data_2026-09-15.zip
```

The optional source archive check verifies original input bytes and every briefing. The validator also reconciles all 366 selected workbook histories against the independently exported CSV, verifies IDs and return-to-history relationships, checks null score gates, and confirms all manifest hashes.

To reproduce generated files from the exact source package:

```sh
python data/countries/albania/extract.py /path/to/Europe_Excluding_Russia_Election_Data_2026-09-15.zip
python data/countries/albania/validate.py
```

## Publication status and sequence

**GitHub research input; website adapter pending.** The current application reads `data/research` and does not load this standalone folder. This upload does not change the public site's European coverage. A later integration must map these tables, sources, evidence states and sanitized briefings into the application schema and test the country, office, calendar and download pages.

This PR contains Albania only. The next separately scoped upload is **Alderney**, following the European package's alphabetical country/territory register. Retain territories as distinct screens and do not silently skip them or merge them into unrelated country counts.
