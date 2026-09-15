# Austria — frozen Europe research import

Extracted from `Europe_Excluding_Russia_Election_Data_2026-09-15.zip`, research snapshot through 11 September 2026. The inclusive study window is 8 September 2026–8 March 2028. This import preserves the existing research; it is not a fresh verification of election dates or results.

| Coverage | Count |
| --- | ---: |
| Office records | 2,038 |
| History entries | 5,956 |
| Calendar cohorts | 8 |
| Companion full-result rows | 16,336 |

**Source status:** Expanded; coverage gaps remain.

**Remaining gaps:** Large council/mayor import; Carinthia 2009 mayoral returns and several replacement elections missing. Krems/Waidhofen 2027, Graz timing and current governing arrangements remain to reconcile.

The companion workbook covers 2,034 offices and 5,944 histories; the regional register/history index adds four offices and 12 histories. These extra offices retain their original briefings. Tyrol includes boundary watches that may fall after the window cutoff.

## Read and verify the data

The payload is a XZ-compressed tar archive split into pieces of at most 96 KiB to keep each GitHub upload small. Pieces are not individually decompressible. `manifest.json` specifies their concatenation order and SHA-256 checksums. `coverage.json` is the unchanged country coverage record from the regional CSV.

From the repository root, validate every piece and unpack to a new directory:

```sh
python data/countries/austria/validate.py /tmp/austria-research
```

Omit the destination to validate without writing files. The command verifies all payload files, original briefing bytes, office uniqueness, per-office history counts and coverage totals. No third-party dependencies are required.

Unpacked contents include:

- `tables/master/`: selected regional workbook rows, plus explicitly regional Parameters/Read me context.
- `history-index.json`: every active country history from the regional CSV; strings remain as in the source CSV.
- `Office_Briefings/`: original country and office HTML, byte-for-byte. Country-to-office links retain their original layout; links to the regional index or other country pages require the complete regional export.
- `inventory.json`: source-entry hashes, original archive locators and checksums for all other payload files.
- `source-links.json`: retained URLs with master-register matches; companion and inline citations may supply additional metadata.
- `formula-cache.json`: original formulas and caches, without recalculation.

`tables/companion/` contains every populated sheet from the companion workbook. The original XLSX remains in the existing regional ZIP download; its checksum and archive locator are retained in `inventory.json`. The source workbook is verified against the regional package manifest before extraction. Table JSON uses shared `columns`, `rows` arrays and original `source_rows` locators. Recognized Excel dates are ISO dates; partial dates and null values remain qualified. History-index and companion histories overlap and must not be added together. Empty companion worksheets and workbook presentation remain in the original regional download.

Reproduce from the preserved archive:

```sh
python data/countries/austria/extract.py /path/to/Europe_Excluding_Russia_Election_Data_2026-09-15.zip
```

**Website ingestion is pending.** This folder is a country research handoff; the application's `data/research` loader has not been changed. No website publication or fresh election forecast is implied.
