# Slim land note

This PR lands the France Prompt AR slim pack. `sources/`, `data/results.jsonl`, `data/events.jsonl`, and `data/reporting-units.jsonl` were omitted from the attached zip.

Present files were checked against `SHA256SUMS`: the slim members that the manifest names matched. Missing from the slim zip, and therefore from this PR: `data/results.jsonl`, `data/events.jsonl`, `data/reporting-units.jsonl`, and 87 `sources/` captures. Those manifest lines stay in `SHA256SUMS` so the omission is visible. The bytes were not reconstructed.

`schemas/atlas/tiers/france.json` is the accept-with-holds classifier. It is 1:1 with `data/research/france/office-register.jsonl` (37,850 office IDs, same order). Draft labels are unchanged: T1 4 / T2 45 / T3 96 / T4 37,705. The schema projection does not split a draft bucket. Per-office `review_status` stays `needs_review`.

No `lib/atlas/france/` importer, no `package.json` script, and no `ATLAS_IMPORT_SCOPE` change.
