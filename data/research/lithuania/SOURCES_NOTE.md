# Lithuania AH land bundle — SOURCES_NOTE

Slim ZIP SHA-256: `093cf3ec4e232ea0c45e97cdc3767e64aa991ed564dca25d48ee8a327a1a353a`
Pack README pins research main `b76ee2540e7a8fcaee8f9430f5bbe275f4542c33`.

## Included
Pack README (`docs/phase1/lithuania/Pack_README.md`), `validation.json`, `SHA256SUMS`, `schemas/atlas/tiers/lithuania.json`, `docs/phase1/lithuania/**`, slim `data/research/lithuania/*.json`.

## Omitted
`docs/phase1/lithuania/SHA256SUMS` lists 54 members that are not in the slim zip:

- `data/research/lithuania/sources/` (53 raw HTML/PDF/CSV members)
- `validate.py`

Do not invent those bytes. `validate.py` is the review-pack validator, not an npm script, and was not re-run for this land. `validation.json` is the pre-acceptance PASS receipt.

Importer is not in this land. `applied_changes=0`. No VPS deploy.

Justin accepted with holds left open: LT-HISTORY, LT-TERRITORIAL-ID, LT-MAYOR-LAW, LT-PRESIDENT-DENOMINATOR, LT-SEIMAS-GRAIN, LT-EP-DETAIL, LT-PARTY-PRECISION. `Lithuania_Research_Gaps.md` also leaves LT-NEXT-AND-LEGAL and LT-EXCLUSIONS open. Draft tier SHA-256 is unchanged: `43933567bfa84c95d354e4b1eb9a02d43123b3a802b057eca319a0b6b1fe2e39` (`draft_for_human_review`).
