# Field mapping — Latin America release → schema v1

Mapping is from the build prompt’s documented export, not from an inspected zip. Confirm against real files before treating this as complete.

| Source location | Normalized target | Notes |
|---|---|---|
| `Data/*.json` `country` | `countries[]` | Skip files claimed by more specific adapters. |
| `coverage` | country + region coverage fields | Overlaps status JSONs; do not add counts. |
| `offices[].id` | `offices[].id` | Preserve. `current: true` → tracked current office, not tenure. |
| `histories[]._key` | `events[].historyKey` | Keep `selected_keys` / `all_keys`; do not pick last three years. |
| history party `share` (0–100) | `resultRows[].share` unit `percent_0_100` | Convert only by contract. |
| office `shares` (0–1) | `resultRows[].share` unit `proportion_0_1` | Convert with `toPercent`. |
| `rosters` | officeholders **or** registers **or** directory snapshots | Classify by structure. |
| `issues` / serialized `detail` JSON | `issues[]` | Parse recognizable JSON into text; keep original in `extensions.raw`. |
| `sources` | `sources[]` | Deduplicate by documented source identity + content. |
| `polling` / `polling_context` | `polls[]` | Overlapping files; do not count twice. |
| `*_Supplementary_Evidence.json` | evidence + optional roster reconcile | Duplicates of roster rows. |
| `Build_Status.json` | reconciliation notes | Stale briefing count — do not hardcode. |
| `South_America_Research_Status.json` / `south_america_release_review.json` | coverage qualifications | Overlapping, not additive. |
| `South_America_Completion_Queue.csv` | `completionQueue[]` | UTF-8 BOM possible. |
| `Country_Screen_Evidence.json` | `countries[].screening` | As-of date required. |
| `release_summary.json` `totals` | **ignore for counters** | Known malformed territory-in-totals defect. |
| `Briefings/**/*.html` | artifacts + office pages | Sanitize; explicit filename→office map from actual files. |
| Unknown files | `unimportedFiles[]` | Must be listed with a reason. |

Unknown upstream fields: `extensions.raw`.
