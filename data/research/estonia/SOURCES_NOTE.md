# Estonia AF land bundle — SOURCES_NOTE

Original ZIP: Estonia_Full_Register_Review_Pack.zip
ZIP SHA-256: 0cdc5a188b423aca789d9c2cc0ce206a493d807628865fc429114205e41d467f
Pinned main: f7b5c81ebd39f1774edea7cde5b4155031d92647

## Included
README, validation.json, validate.py, SHA256SUMS, schemas/atlas/tiers/estonia.json(.gz), docs/phase1/estonia/** (except Identity_Vectors), slim data/research/estonia/*.json(.gz)

## Omitted (Cloud Agent attach budget)
- data/research/estonia/results.json (~80 MB)
- docs/phase1/estonia/Estonia_Identity_Vectors.json (~19 MB)
- data/research/estonia/sources/ and unpacked/ raw election XML/zips

Importer not in this land PR. applied_changes=0.

## Land (2026-09-21)
Justin accepted with holds EE-G01 through EE-G09 still open. See `docs/phase1/estonia/JUSTIN_ACCEPTANCE.md`.
Gunzipped to normal JSON (no `.gz` twin): `events.json`, `nonadditive-list-summaries.json`, `docs/phase1/estonia/Estonia_Input_Inventory.json`.
Do not invent omitted `results.json`, `Estonia_Identity_Vectors.json`, or `sources/` bytes.
Predecessor draft tier SHA-256: `ae9f02831902fa9981adf3aa034bc92dd6c7861b66621a1ff66652fd4e0daa25`.
Approved tier SHA-256: `bf86952fe8966a792166064e6505932ce590c3643951a802ba55896a332cfa8d`.
