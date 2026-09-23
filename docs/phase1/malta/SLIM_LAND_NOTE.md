# Slim land note

This PR lands the Malta Prompt AP slim pack. `sources/` and `data/results.json` were already absent from the attached zip. `data/stv-counts.json` was in the zip and is omitted from the repo so the pull request stays small.

Present files were checked against `SHA256SUMS`: 28 members matched. Missing from the slim zip, and therefore from this PR: `data/results.json` and 1,139 `sources/` captures. `data/stv-counts.json` matched the manifest and was still left out of the repo. Those manifest lines stay in `SHA256SUMS` so the omission is visible. The bytes were not reconstructed.

`schemas/atlas/tiers/malta.json` is the accept-with-holds classifier. It is 1:1 with `data/research/malta/office-register.json` (215 office IDs, same order). Draft labels are unchanged. Per-office `review_status` stays `needs_review`.

No `lib/atlas/malta/` importer, no `package.json` script, and no `ATLAS_IMPORT_SCOPE` change.
