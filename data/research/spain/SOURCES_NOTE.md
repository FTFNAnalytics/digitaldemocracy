# Spain AE land slim

Original ZIP: `Spain_Full_Register_Review_Pack.zip`
ZIP SHA-256: `bf735f4e3c3f246bf345faf2b47b6c12717b52bf38eb24696f1fff5d5d8ca1e2`
Pinned main (pack): `f7b5c81ebd39f1774edea7cde5b4155031d92647`

## Included (slim)
- `office-register.json`, `geography.json`, `identity-crosswalk.json` (gunzipped)
- `events.json.gz` only (no uncompressed twin)
- `municipal-source-blocks.jsonl.gz`, `unbound-municipal-blocks.json`
- Docs under `docs/phase1/spain/` except `Spain_Identity_Vectors.json`
- Approved `schemas/atlas/tiers/spain.json` (predecessor draft SHA-256 `f161ea79405505577fe0127d492d346d6e730537ed21e59b34333fb4023a393f`)

## Omitted (size)
- `data/research/spain/results.json` (~127 MB)
- `docs/phase1/spain/Spain_Identity_Vectors.json` (~58 MB)
- `data/research/spain/sources/` (raw JEC PDFs etc.)
- `data/research/spain/register-source-rows.json`

Do not invent omitted bytes. Justin accepted 2026-09-21 America/Edmonton with 12 named holds ES-G01–ES-G12 (see `docs/phase1/spain/JUSTIN_ACCEPTANCE.md`). Importer / SQLite / VPS / UI not in this land PR.
