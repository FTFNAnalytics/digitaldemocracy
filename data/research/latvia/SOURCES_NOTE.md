# Latvia AG land bundle — SOURCES_NOTE

Original ZIP: Latvia_Full_Register_Review_Pack.zip
ZIP SHA-256: b0e93594584b3feac6da137d879eb523ce9becac8e864c3f81d6fedc6b965964
Pinned main: f7b5c81ebd39f1774edea7cde5b4155031d92647

## Included
README, validation.json, validate.py, SHA256SUMS, schemas/atlas/tiers/latvia.json, docs/phase1/latvia/** (except Identity_Vectors), slim data/research/latvia/*.json(.gz)

## Omitted
- data/research/latvia/sources/ (raw CVK / data.gov.lv XML/HTML/PDF — includes ~174MB electionresults XML)
- docs/phase1/latvia/Latvia_Identity_Vectors.json

Importer not in this land PR. applied_changes=0.

## Land (2026-09-21)
Justin accepted with holds LV-G01 through LV-G09 still open. See `docs/phase1/latvia/JUSTIN_ACCEPTANCE.md`.
Gunzipped to normal JSON (no `.gz` twin): `results.json`.
Do not invent omitted `Latvia_Identity_Vectors.json` or `sources/` bytes.
Historical 121 rows are identity records, not abolished councils.
Predecessor draft tier SHA-256: `7d9dd90af38a532a1148848598aaf90cb6ce95ca4edd7b4aa26d1734452498ce`.
Approved tier SHA-256: `227f743ab91c6d86f711be2fd5314e3e7c573da233b9a61187c8a3b37abb34f3`.
