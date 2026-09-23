# SOURCES_NOTE

Slim land bundle for Slovenia Prompt AJ docs+tiers PR.

Included:
- `docs/phase1/slovenia/` field map, inventory, acceptance examples, identity rules, `validation.json`, `SHA256SUMS`, and `validate.py`
- Documentary `contract-reference/` SQL and pinned contract copies (`identity.ts`, `normalize.ts`, `atlas-plan.md`), excluded from `tsconfig.json`
- `schemas/atlas/tiers/slovenia.json` (accepted with holds; predecessor draft SHA-256 `17a836af07d10fa5ec3c0560c8281f67d60e17cd76b727360aa823b40ab201ee`)

Omitted from the full pack (too large or not in the slim tarball — do not invent):
- `docs/phase1/slovenia/Slovenia_Identity_Vectors.json`
- `data/research/slovenia/` including sources, results, events, and other research JSON

`validate.py` is the pre-acceptance documentary validator. It expects the full review-pack layout and draft tier flags. It is not an npm script and was not re-run after accept-with-holds.

Full ZIP SHA-256: `e89b8d39663ee27b1abd7016cb37e4b1ba2b03f8feea46453c60bb9be1118150`
Attached slim ZIP SHA-256: `2e99029132bd6595c42b2dc711e9e7134e64a590161235715083a5b2a54f1e2b`
