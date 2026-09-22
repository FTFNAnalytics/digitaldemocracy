# SOURCES_NOTE

Slim land bundle for Hungary Prompt AK docs+tiers PR.

Included:
- `data/research/hungary/` research JSON except the omissions below
- `docs/phase1/hungary/` field map, inventory, gaps, acceptance examples, `validation.json`, and `validate.py`
- `schemas/atlas/tiers/hungary.json` (accepted with holds; predecessor draft SHA-256 `fbd68787b8e89f9373c9da19415f1f153609933a37675396afccd8ebdbb3384a`)

Omitted from the full pack (too large or not in the slim tarball — do not invent):
- `data/research/hungary/sources/` (raw source bytes)
- `data/research/hungary/unpacked/`
- `data/research/hungary/results.json` (101,526 rows; retained in the full ZIP)
- `data/research/hungary/identity-crosswalk.json`
- `docs/phase1/hungary/Hungary_Identity_Vectors.json`
- `docs/phase1/hungary/contract-reference/` (empty in the slim pack; no documentary `*.ts`)

`validate.py` is the pre-acceptance documentary validator. It expects the full review-pack layout and draft tier flags. It is not an npm script and was not re-run after accept-with-holds.

Full ZIP SHA-256: `03b497b92937719a2bf6e58324910aa68cdf2fbdb497203f617482bbec3bd074`
Independent recount of offices/events/tiers matched `counts.json`.
Results row count is 101,526 in the full ZIP; the results blob itself is not in this slim bundle.
