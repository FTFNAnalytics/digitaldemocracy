# SOURCES_NOTE

Slim land bundle for Cyprus Prompt AQ docs+tiers PR.

Included:
- `data/research/cyprus/` research JSON that was in the slim pack (`office-register.json`, `draft-tiers.json`, `events.json`, `reporting-units.json`, `reconciliation.json`, `calendar.json`, `current-office-coverage.json`, `communities.json`, `municipalities.json`, `municipal-quarters.json`, `quarter-name-aliases.json`, `identity-aliases.json`, `excluded-source-observations.json`, `extraction-issues.json`, `acceptance-examples.json`, `source-inventory.json`, `research-gaps.json`, `territorial-gates.json`, `successor-crosswalk.json`, `counts.json`, `field-map-223.json`)
- `docs/phase1/cyprus/` field map, identity rules, acceptance examples, office register, gap ledger, source inventory, Justin report, `validation.json`, `validate.py`, and the full-pack `SHA256SUMS`
- `schemas/atlas/tiers/cyprus.json` (accepted with holds; predecessor draft SHA-256 `bee8a11e4909bf3b587a31c258ace4214dd510489c185301e4bec491afc2ddde`)

Omitted (do not invent):
- `sources/` (156 hashed captures; paths and digests remain in `source-inventory.json` and `SHA256SUMS`; not in the slim zip)
- `data/results.json` (11,112 result rows; manifest SHA-256 `13abc8a38053bdf44146be63fb15a1673137ed868054ebd4880146c2e44a3b04`; not in the slim zip)

`validate.py` is the pre-acceptance documentary validator. It expects the full review-pack layout (`data/results.json`, `sources/`, and draft `justin_approved=false`). It is not an npm script and was not re-run after accept-with-holds.

Full ZIP SHA-256: `0e6108950460e0a23d0af512959a91957d892c67dc63a21654b450edb9afadad` (validation note MATCH)  
Slim attachment SHA-256: `c0c26e5c63db25fe26b77e2ae4936f5eeef0f77dca2083918e10c2fed51e3df2`  
Independent recount of offices and draft tiers matched `counts.json` (714 current / 174 historical; 877 municipal / 5 regional / 5 national / 1 other). Communities file: 285. Ministry overview: 286 (CY-G01).
