# SOURCES_NOTE

Slim land bundle for Greece Prompt AM Rebuilt docs+tiers PR.

Included:
- `data/research/greece/` research JSON, CSV, and the slim-pack gzip result tables (`results.jsonl.gz`, `ballot-observations.jsonl.gz`)
- `docs/phase1/greece/` field map, gaps, acceptance examples, coverage notes, `validation.json`, `JUSTIN_REPORT.md`, documentary SQL, and the full-pack `SHA256SUMS`
- `schemas/atlas/tiers/greece.json` (accepted with holds; predecessor draft SHA-256 `57f425425b5bbb646df5dee39a04789e6aa4ed8501c7033867b2327f1aee6c59`)

Omitted from the full Rebuilt pack (do not invent):
- `sources/` (2,807 hashed artifacts; omitted from the slim ZIP)
- `scripts/validate_greece_pack.py` and `scripts/source_parsers.py` (listed in `SHA256SUMS`, not in the slim ZIP)

`SHA256SUMS` is the full-pack manifest. Hashes for omitted `sources/` and `scripts/` paths will not resolve in this checkout. Landed research and docs paths that are present were checked against that manifest. The tier file hash in `SHA256SUMS` is the predecessor draft; the landed file adds the accept-with-holds header and leaves every classification `needs_review`.

`validation.json` is the pre-acceptance documentary receipt (`validation=PASS`, `applied_changes=0`, `all_approvals_unchecked=true`, `historical_numeric_coverage_complete=false`). It was not re-run after this accept-with-holds. There is no npm script for the omitted pack validator.

Full Rebuilt ZIP SHA-256: `356ca5f15f68939eb0acacfc5a9817cba35d03e489ecbd3673069cfc136713eb`
Independent recount matched `counts.json`: 693 current + 10 historical offices, 2,774 events, 14,004 result rows, 8,021 distinct observations, draft tiers 674 / 26 / 2 / 1.
