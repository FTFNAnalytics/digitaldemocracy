# Belgium — European research import

Preserved research snapshot through **11 September 2026**, packaged on **15 September 2026**. Inclusive study window: **8 September 2026–8 March 2028**. This is an extraction of existing research, not fresh verification of election dates or results.

| Coverage | Count |
| --- | ---: |
| Office records | 0 |
| Active history entries | 0 |
| Calendar cohorts | 0 |
| Detailed-return rows | 0 |
| Office briefings | 0 |

**Source status:** No ordinary local/regional cycle identified; special watch.

This is a screening-only record. Zero imported office records does not establish that no local or replacement contests will occur.

**Remaining gaps, as recorded in the source:** Flanders 2024 municipal/provincial/Antwerp district cycle next 2030; Wallonia, Brussels and regional calendars still need primary reconciliation. Announced replacements have not been exhaustively enumerated.

**Screening source retained from the original research:** https://www.vlaanderen.be/over-de-overheid/verkiezingen-in-vlaanderen/lokale-en-provinciale-verkiezingen

## Data and provenance

`coverage.json` preserves the regional coverage CSV record. `manifest.json` provides archive and payload hashes, counts, study-window bounds and transformations. The original country HTML and all registered office HTML are preserved byte-for-byte.

The payload uses a gzip-compressed POSIX tar archive, split into pieces of at most 96 KiB. Concatenate pieces in manifest order; they are not individually decompressible. `validate.py` performs that assembly, validates SHA-256 checksums and safely unpacks to a new destination:

```sh
python data/countries/belgium/validate.py /tmp/belgium-research
```

Omit the destination to validate without writing files. Python's standard library is sufficient.

After unpacking:

- `tables/master/` contains selected workbook tables with shared columns, row arrays and original spreadsheet row numbers. Regional Parameters/Read me are explicitly regional methodology, not country totals.
- `history-index.json` is the country subset of the regional history CSV. It duplicates the master history table where present; do not add their counts.
- `Office_Briefings/` contains unchanged original HTML. Local country-to-office links preserve their original layout. Regional-index links require the complete regional export.
- `inventory.json` records original archive locators, source-entry hashes and every other payload-file hash.
- `source-links.json` distinguishes URLs matched to the master source register from inline-only citations, without inventing metadata.
- `formula-cache.json` retains original formulas and cached values. Formulas are not recalculated.

Nulls and numeric precision are retained. Recognized Excel dates are converted to ISO dates; qualified date strings remain unchanged. The original master workbook remains in the regional ZIP; its checksum is recorded. Empty imported record sets remain empty.

## Reproduce

```sh
python data/countries/belgium/extract.py /path/to/Europe_Excluding_Russia_Election_Data_2026-09-15.zip
```

The extractor validates each accessed source entry against the regional package manifest before writing the country data. Validation checks file integrity, office uniqueness, per-office history counts and coverage totals.

**Website ingestion is pending.** This PR supplies country research files only. Application ingestion and deployment are handled separately.
