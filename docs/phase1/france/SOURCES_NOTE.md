# SOURCES_NOTE

Slim land bundle for France Prompt AR docs+tiers PR.

Included:
- `data/research/france/` research files that were in the slim pack (`office-register.jsonl`, `draft-tiers.jsonl`, `calendar.jsonl`, `office-history-coverage.jsonl`, `territorial-movements.jsonl`, `counts.json`, `field-map-223.json`, `history-coverage.json`, `source-inventory.json`, `research-gaps.json`, `extraction-issues.json`, `source-arithmetic-discrepancies.json`, `acceptance-examples.json`, `territory-exclusions.json`, `successor-crosswalk.json`)
- `docs/phase1/france/` field map, identity rules, acceptance examples, gap ledger, Justin report, `validation-report.json`, `validate.py`, and the full-pack `SHA256SUMS`
- `schemas/atlas/tiers/france.json` (accepted with holds; predecessor draft SHA-256 `8d103d5733f8bcd15dccf167d8e6e7cab2814b124f3a8f20564a05d5ec0ec16a`)

Omitted from the full pack (not in the slim tarball — do not invent):
- `sources/` (87 hashed captures; paths and digests remain in `source-inventory.json` and `SHA256SUMS`)
- `data/results.jsonl` (1,193,657 result rows; manifest SHA-256 `b344a2ec3dcc0a0e9bea00238759df7d8434231acf91980508753862d41640e9`)
- `data/events.jsonl` (119,554 events; manifest SHA-256 `dbe0b194e990f5992766c436fd719d6ed33e573a6bc8bb9dcb2ab8fcbbdebc03`)
- `data/reporting-units.jsonl` (173,409 reporting units; manifest SHA-256 `2a4fedbf8a111719eec65d4ec3bb4261ac2b9c16627adc8f3402d278f7d5b89d`)

`validate.py` is the pre-acceptance documentary validator. It expects the full review-pack layout (`data/results.jsonl`, `data/events.jsonl`, `data/reporting-units.jsonl`, `sources/`, and draft `justin_approved=false`). It is not an npm script and was not re-run after accept-with-holds.

Full ZIP SHA-256: `c18df21fa6233e2b7536a23621d4a8aafcec76316d6d8f3921b3bed92753acf9`
Slim attachment SHA-256: `0cd3af1b55ce18b6d0985fbd5c62fb91988a1037ddfe30e55b0e37ef77265498`
Independent recount of offices and draft tiers matched `counts.json` (35,112 current / 2,738 historical; T1 4 / T2 45 / T3 96 / T4 37,705).
