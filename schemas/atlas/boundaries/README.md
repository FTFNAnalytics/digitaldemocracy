# Boundary crosswalk proposals

One JSON file per country. Schema `atlas-boundary-crosswalk/1`.

`npm run boundaries:match` writes `review_status` `draft_for_human_review` on the file and on every row. That is a proposal, the same acceptance step as `schemas/atlas/tiers/`: Justin approves a country file before any shape is built. The approved file hash (`approvedCrosswalkSha256`) is the derive input.

Tier files use their own review vocabulary. These files use `approved`, `draft_for_human_review`, and `rejected` only.

The builder and the SQL loader ignore anything that is not fully approved and keyed. See [docs/boundaries.md](../../../docs/boundaries.md).

| File | Rows | Review |
| --- | ---: | --- |
| [`albania.json`](albania.json) | 61 | **Draft.** Register-fallback proposal: 59 exact folded names, 2 fuzzy spellings (`AL151` Fushë-Arrëz, `AL155` Vau-Dejës). `jurisdiction_key` stays null. A 2026-09-28 rematch against live `derived_jurisdiction` was 0/868 because every municipality name is a mayor/council pair under Albania. Not a shape authorisation. |
