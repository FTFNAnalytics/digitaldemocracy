# Bulgaria — European research import

Preserved research snapshot through **11 September 2026**, packaged **15 September 2026**. Inclusive study window: **8 September 2026–8 March 2028**. This extraction does not claim fresh verification of dates, results or forecasts.

| Coverage | Count |
| --- | ---: |
| Office records | 3,597 |
| Active history entries | 8,661 |
| Calendar cohorts | 1 |
| Detailed-return rows | 25,817 |
| Original office briefings | 3,597 |

**Source status:** Expanded; coverage gaps remain.

Completed history counts exclude unresolved first rounds. The companion contains 7,746 first-round candidate/list rows and 2,591 unresolved-history candidate rows; these are separate datasets, not additional completed election cycles. Missing decisive results and percentage-only vectors retain their original labels. The next ordinary polling date remains pending.

**Remaining gaps, as recorded in the source:** The register names 3,597 offices from all 265 municipalities and the 2023 district/village roster. Archived official CIK pages recover 1,776 usable 2015 village/district histories, including 1,555 exact candidate-vote vectors and 221 percentage-only vectors. First rounds and runoffs are one cycle. Some archived pages, older histories and decisive outcomes remain missing; unresolved first rounds are excluded from completed histories. Original certificates, final 2027 village eligibility and announcements after the 28 August replacement-register snapshot remain unverified.

## Data and provenance

`coverage.json` preserves the original country coverage CSV record. `manifest.json` provides the source archive hash, payload hashes, scope counts, study-window bounds and transformations. `inventory.json` inside the payload retains source-entry checksums and archive locators, plus checksums of every other unpacked file.

All original country and office HTML is preserved byte-for-byte. Populated master and companion sheets are retained as structured table arrays, with original headers, row order and spreadsheet row numbers. Nulls, numeric precision, qualified date strings and source limitations are preserved. Recognized Excel date serials are converted to ISO dates. Original formula text and cached values are stored without recalculation. Original workbooks remain in the existing regional ZIP download and are verified by checksum during extraction.

The CSV history index overlaps master/companion history tables; do not add these counts together. First-round returns, unresolved-history rows and ongoing-election rows remain separately labelled. Regional Parameters and Read me tables are contextual methodology, not country totals.

## Verify and unpack

The payload is an XZ-compressed POSIX tar archive split into pieces of at most 96 KiB. Pieces must be concatenated in manifest order before decompression. The validator performs this assembly, checks all hashes and safely unpacks to a new directory:

```sh
python data/countries/bulgaria/validate.py /tmp/bulgaria-research
```

Omit the destination to validate without writing files. Python's standard library is sufficient. After unpacking:

- `tables/master/` and, where supplied, `tables/companion/` hold the structured research tables.
- `history-index.json` holds the country subset of the regional history CSV.
- `Office_Briefings/` holds original HTML. Country-to-office links retain their original structure; regional-index links require the complete regional export.
- `source-links.json` retains registered and inline-only citations without inventing missing metadata.
- `formula-cache.json` retains source formulas and caches.

## Reproduce

```sh
python data/countries/bulgaria/extract.py /path/to/Europe_Excluding_Russia_Election_Data_2026-09-15.zip
```

Every accessed source entry is checked against the archive manifest before extraction. Validation covers payload integrity, original HTML bytes, office uniqueness and per-office history totals. The upload also reconciles source coverage totals, history keys and row membership in the relevant office register.

**Website ingestion and deployment remain separate.** This PR adds country research files only.
