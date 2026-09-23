# Slim land note

This PR lands the Cyprus Prompt AQ slim pack. `sources/` and `data/results.json` were already absent from the attached zip.

Present files were checked against `SHA256SUMS`: every member that is in the slim zip matched. Missing from the slim zip, and therefore from this PR: `data/results.json` and 156 `sources/` captures. Those manifest lines stay in `SHA256SUMS` so the omission is visible. The bytes were not reconstructed.

`schemas/atlas/tiers/cyprus.json` is the accept-with-holds classifier. It is 1:1 with `data/research/cyprus/office-register.json` (888 office IDs, same order). Draft labels are unchanged. Per-office `review_status` stays `needs_review`.

No `lib/atlas/cyprus/` importer, no `package.json` script, and no `ATLAS_IMPORT_SCOPE` change.
