# SOURCES_NOTE

Slim land bundle for Malta Prompt AP docs+tiers PR.

Included:
- `data/research/malta/` research JSON that was in the slim pack, except `stv-counts.json` (`office-register.json`, `draft-tiers.json`, `events.json`, `reporting-units.json`, `count-totals.json`, `party-aggregates-derived.json`, `post-election-return-observations.json`, `regional-nominations-not-results.json`, `source-inventory.json`, `calendar.json`, `territorial-gates.json`, `successor-crosswalk.json`, `extraction-issues.json`, `counts.json`, `field-map-223.json`)
- `docs/phase1/malta/` field map, identity rules, acceptance examples, office register, draft-tier table, gap ledger, Justin report, `validation.json`, `validate.py`, and the full-pack `SHA256SUMS`
- `schemas/atlas/tiers/malta.json` (accepted with holds; predecessor draft SHA-256 `5714dde427d288850b4c9c8aa9a5c9000ba803321f9cb6adc66c760b74e06d18`)

Omitted (do not invent):
- `sources/` (1,139 hashed captures; paths and digests remain in `source-inventory.json` and `SHA256SUMS`; not in the slim zip)
- `data/results.json` (4,084 result rows; manifest SHA-256 `4ecb57ee354b0cc5b9787abae57342cc08fb53eb3c430a2d061e00d8a8bd187f`; not in the slim zip)
- `data/stv-counts.json` (64,204 count observations; manifest SHA-256 `3fec21da7cd4461bf548df0fb4d1d7c623b62d551b0ce3d91d09a29a0c51693b`; present in the slim zip, omitted from the repo)

`count-totals.json`, `party-aggregates-derived.json`, and `post-election-return-observations.json` are included. They do not replace `results.json` or `stv-counts.json`.

`validate.py` is the pre-acceptance documentary validator. It expects the full review-pack layout (`data/results.json`, `data/stv-counts.json`, `sources/`, and draft `justin_approved=false`). It is not an npm script and was not re-run after accept-with-holds.

Full ZIP SHA-256: `ad2fa809d572305e9002fb9cae6ede149ecedb9394cf402eec15ae3ca6716ecb`  
Slim attachment SHA-256: `945d54bf8c238e4dee8143d0af82bcd4458f35710edc5d2a32c1149ebe831e7b`  
Independent recount of offices and draft tiers matched `counts.json` (213 current / 2 historical; 204 municipal / 8 regional / 2 national / 1 other).
