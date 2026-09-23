# SOURCES_NOTE

Slim land bundle for Slovakia Prompt AI docs+tiers PR.

Included:
- `docs/phase1/slovakia/` field map, inventory, acceptance examples, contract reference, `validation.json`, `SHA256SUMS`, and `validate_pack.py`
- `schemas/atlas/tiers/slovakia.json` (accepted with holds; predecessor draft SHA-256 `ce8c24f7fcc2f41439f16fca0ad428312de913815c542d3c5c46e28275559770`)

Omitted from the full pack (too large or not in the slim zip — do not invent):
- `docs/phase1/slovakia/Slovakia_Identity_Vectors.json`
- `data/research/slovakia/` including `results.json` (115,217 rows remain in the full ZIP), `sources/`, and the other research tables
- Pack-root `README.md` (pre-acceptance draft). This directory's `README.md` is the landing receipt

`validate_pack.py` is the pre-acceptance documentary validator. It expects the full review-pack layout (parent of `data/research/slovakia`, `docs/phase1/slovakia`, and `schemas/atlas/tiers/slovakia.json`) and draft tier flags. It is not an npm script and was not re-run after accept-with-holds.

`SHA256SUMS` lists every other full-pack member, including omitted research and identity-vector bytes. It is not a manifest of this checkout.

Full ZIP SHA-256: `f1fdbec0350399ee0621cb0489a59627b1113f87f7c7f0fe0d5451f12cf25a62`
Slim land ZIP SHA-256: `423d6c6c87ade8991a50f17b54609be2866b054df6f8839576108b2f86721a75`
