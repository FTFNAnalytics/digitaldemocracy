# Country CSV bundles

`npm run derive:atlas` writes one zip per country into this directory:

- `{slug}.zip` — `jurisdictions.csv`, `seats.csv`, `cycles.csv`, `contests.csv`, `unplaced.csv`, `people.csv`, `LICENSE`, `SHA256SUMS`
- `{slug}.zip.sha256` — SHA-256 of the zip

The LICENSE file copies `data_rights` from the source table. It does not add a licence a source row did not name. Withheld result rows are left out of `contests.csv`. `people.csv` is headers only until a person table is published.

These files are generated. They are not committed.
