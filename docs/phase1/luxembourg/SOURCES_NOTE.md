# SOURCES_NOTE

Slim land bundle for Luxembourg Prompt AO docs+tiers PR.

Included:
- `data/research/luxembourg/` research JSON that was in the slim pack (`office-register.json`, `draft-tiers.json`, `events.json`, `observations.json`, `merger-crosswalk.json`, `source-inventory.json`, `research-gaps.json`, `counts.json`, `field-map-223.json`)
- `docs/phase1/luxembourg/` field map, identity rules, acceptance examples, gap ledger, Justin report, `validation.json`, `validate.py`, and the full-pack `SHA256SUMS`
- `schemas/atlas/tiers/luxembourg.json` (accepted with holds; predecessor draft SHA-256 `9d3692b95e7188841cfbeea6bf4bee8c52e299811a56474d87948cbc3b43f3ad`)

Omitted from the full pack (not in the slim tarball — do not invent):
- `sources/` (388 hashed captures; paths and digests remain in `source-inventory.json` and `SHA256SUMS`)
- `data/results.json` (48,197 result rows; manifest SHA-256 `0f6f5d1fd3b1d3d15518ea367327a2a7520ff0b34bc744975b13ab33c144f329`)

`observations.json` is included. It holds 702 source-statistic envelopes. It does not replace `results.json`.

`validate.py` is the pre-acceptance documentary validator. It expects the full review-pack layout (`data/results.json`, `sources/`, and draft `justin_approved=false`). It is not an npm script and was not re-run after accept-with-holds.

Full ZIP SHA-256: `93439d6982d581f669d8f303b1d27542aff360e8be3f33ee3961c594ed0dc6da`  
Slim attachment SHA-256: `4a2b6c238708d380e1d01fdf53fd46c0aea8ddba76a8b2d25ddd98e701055a3a`  
Independent recount of offices and draft tiers matched `counts.json` (102 current / 28 historical; 128 municipal / 0 regional / 1 national / 1 other).
