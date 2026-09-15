# Data dictionary — Subnational Election Observatory (schema v1)

Authoritative TypeScript types live in `schemas/v1/normalized.ts`. This page is the prose companion.

| Entity | Identity | Notes |
|---|---|---|
| Dataset release | `release.id` | Window, snapshot, provenance, recomputed counts. `researchCoverageComplete` stays false until a real reconciled import says otherwise. |
| Region | `regions[].id` | Availability: available / partial / screened_out / not_supplied / fixture_only. |
| Country / territory | `countries[].id` | Sovereign and territory totals stay separate. Screening carries an as-of date. |
| Geographic unit | `geographies[].id` | Parent geography, aliases, source codes. `geometryAvailable` is false unless sourced geometry exists. |
| Office | `offices[].id` | Preserve upstream IDs. `status` current vs historical. `current` ≠ current tenure. |
| Election event | `events[].id` / `historyKey` | Date precision/certainty, event kind, selected-history role, ballot basis, legal outcome. |
| Proceeding | `proceedings[].id` | Round, recount, annulment, supersession. |
| Result row | `resultRows[].id` | Party code is scoped by `partyNamespace`. Votes/shares are `NumericValue`. |
| Party mapping | `partyMappings[].id` | Same code may mean different parties in different namespaces. |
| Officeholder observation | `officeholders[].id` | Dated; `impliesCurrentTenure` is always false in v1. |
| Register observation | `registers[].id` | Not a person. Do not sum across overlapping office types. |
| Poll observation | `polls[].id` | National vs local. Local polls attach only to a named office. |
| Metric observation | `metrics[].id` | Review status, `scoreGate`, inputs, selected cycles. |
| Evidence source | `sources[].id` | Publisher, title, URL, hash/locator, data rights (unknown unless supplied). |
| Research issue | `issues[].id` | Category + resolution state. |
| Completion queue | `completionQueue[].id` | Office-level remaining work. |
| Briefing / artifact | `artifacts[].id` | Path, checksum, availability. |

## Numeric values

`{ status, value }` where missing statuses use `value: null`. Recorded zero uses `status: "zero"` and `value: 0`.

## Dates

`ResearchDate.label` is the display form. Month-precision dates must not carry a `day`.

## Imported release additions (schema 1.1.0)

- `extensions.raw` retains source-specific evidence and qualifications without inventing a universal field mapping. Original country documents and supporting text files remain separately downloadable.
- `ElectionEvent.legalOutcome` adds `unknown` and `not_held`. Statistical completeness and elected flags do not prove legal certification. `EventKind` adds `unknown` when no supported mapping exists.
- `ResultRow.candidate` preserves a candidate name separately from party/list identity. Unknown votes or seats remain null, recorded zero remains zero, and original row fields are preserved in `extensions.raw`.
- `OfficeholderObservation` adds observation type and notes. A dated roster observation never implies current tenure without separate evidence.
- Register observations preserve July/August counts, changes, spending limits, administrative codes and source locators in `extensions.raw`; these are not historical turnout.
- Source IDs are country-namespaced. The original source ID is retained after the `country--` prefix; references absent from a source catalogue are explicit unresolved references, with no invented URL.
- Artifact records add original path and byte size. Compressed server objects decompress to the exact original source checksum. Briefing HTML is sanitized for display; the original archive is a separate artifact.
