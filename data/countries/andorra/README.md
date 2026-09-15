# Andorra: European country/territory upload 03

Research checked through **11 September 2026**. Extracted from the preserved European package dated **15 September 2026**. Fixed election window: **8 September 2026–8 March 2028**, inclusive. This is an extraction of existing research, not a fresh review of election authorities.

| Included record | Count |
| --- | ---: |
| Tracked office/contest records | 7 |
| Selected historical events | 21 |
| Selected candidate/list return rows | 53 |
| Dated governing-control observations | 7 |
| Registered source rows | 10 |
| Original individual briefings | 7 |
| Calendar cohorts | 1 |
| National polling records | 1 |
| Historical competition scores | 5 |
| Grouped-volatility scores | 0 |

## Evidence and interpretation

The seven records are Andorra's communal councils, with the selected 2015, 2019 and 2023 vote/seat vectors. Exact ballot days missing from the source history remain null with their recorded years retained. The next ordinary cycle is expected in late 2027, but its formal polling day and future nominations remain unverified.

Five historical competition scores are preserved, including a valid zero for Encamp. Canillo and La Massana remain unscored where their series lacks comparable contested gaps. The validator independently recomputes the five weighted-gap scores from their component gaps. Cached spreadsheet formulas are retained for provenance; the full workbook was not recalculated.

Grouped Pedersen volatility remains unavailable because the party-alliance concordance is unresolved. Margin dispersion is a separate diagnostic, not voter switching. Historical scores are not calibrated forecasts.

Seven dated consul/governing-list observations retain their source dates and affiliation limitations. The single national polling record uses different denominators for the citizen sample, decided voters and vote-plus-sympathy responses. Four governing-list exposure notes are early national context only. They do not estimate parish swings or government-change probabilities; the source explicitly says parish samples are inadequate.

## Files and field contract

- [Open the briefing index](andorra.html) after downloading this folder. Original individual HTML briefings are byte-preserved; the small navigation index is newly generated.
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
python data/countries/andorra/validate.py
python data/countries/andorra/validate.py /path/to/Europe_Excluding_Russia_Election_Data_2026-09-15.zip
```

The validator checks record counts, identity and return-to-history relationships, source references, score eligibility and all generated-content hashes. It reconciles every selected workbook history against the independent CSV. The optional archive argument verifies input hashes and byte equality for every original briefing. These checks establish extraction fidelity, not legal certification or complete national research.

To reproduce the generated files from the exact source archive:

```sh
python data/countries/andorra/extract.py /path/to/Europe_Excluding_Russia_Election_Data_2026-09-15.zip
python data/countries/andorra/validate.py
```

## Publication status

**GitHub research input; website adapter pending.** The existing application loads `data/research`, not this standalone folder. This PR contains only `andorra` and can be reviewed independently. Merging the data alone does not publish it at `/electiondatabase`.

The next integration must map the records, source states, date precision, original briefings and metric gates into the website schema, then verify public country, office, election and download routes. European uploads remain separate country/territory changes, with Russia excluded.
