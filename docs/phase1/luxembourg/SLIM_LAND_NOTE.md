# Slim land note

This PR lands the Luxembourg Prompt AO slim pack. Sources and `data/results.json` were already absent from the attached zip.

Present files were checked against `SHA256SUMS`: 22 members matched. Missing from the slim zip, and therefore from this PR: `data/results.json` and 388 `sources/` captures. Those manifest lines stay in `SHA256SUMS` so the omission is visible. The bytes were not reconstructed.

`schemas/atlas/tiers/luxembourg.json` is the accept-with-holds classifier. It is 1:1 with `data/research/luxembourg/office-register.json` (130 office IDs, same order). Draft labels are unchanged. Per-office `review_status` stays `needs_review`.

No `lib/atlas/luxembourg/` importer, no `package.json` script, and no `ATLAS_IMPORT_SCOPE` change.
