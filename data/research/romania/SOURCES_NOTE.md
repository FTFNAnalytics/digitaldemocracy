# Romania research slim land

Prompt AL review ZIP SHA-256 `4a60f260c4f63102fc7d156ad7038dcc62282839554597aa58ea5ca33706c7bf` (MATCH). The ZIP is already the slim pack. Landed files match `docs/phase1/romania/SHA256SUMS`:

- `events.json.gz` only (19,343 events; no uncompressed twin)
- `geographies.json`, `office-register.json`, `research-gaps.json`, `sources.json`
- `results.json` — the supplied 23 national/EP rows only. Local vectors are absent, not zero
- `siruta_s1_2025.csv` — bundled SIRUTA S1 2025 mirror

Do not invent local result rows, historical-only offices, or successor/merger edges. Holds RO-G01–RO-G07 stay open. Atlas importer waits.
