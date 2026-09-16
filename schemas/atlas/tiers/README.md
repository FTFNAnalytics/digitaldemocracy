# Per-country office tier classification

Checked-in files here map each package office ID to a proposed Atlas tier and to
schema v1 `GovernmentTier` (`national_context` / `regional` / `municipal` /
`council` / `other`).

These files are the Atlas classifiers. Workbook calendar cohort strings such as
Albania `Regional / municipal` are **not** classifiers.

All files in this folder are **`draft_for_human_review`**. They were rebuilt from
each package’s office register (one row per `office_id`; no invented IDs). See
[docs/phase0/REPORT.md](../../../docs/phase0/REPORT.md).

| File | Register rows | Proposed tier | Human review |
| --- | ---: | --- | --- |
| [`albania.json`](albania.json) | 122 | `municipal` (61 mayors + 61 councils) | Draft only; no regional offices |
| [`andorra.json`](andorra.json) | 7 | `municipal` (communal councils) | Empty regional-calendar demo |
| [`alderney.json`](alderney.json) | 2 | `other` | **Human OK required** before treating `other` as final |
| [`armenia.json`](armenia.json) | 71 | `municipal` (community offices) | Boundary/calendar flags; keep municipal |

Vocabulary uses `national` as a proposed label. `schema_compatibility` maps
`national` → schema v1 `national_context`.

**Alderney:** `GG-ALD-STATES` and `GG-ALD-PLEB` are proposed `other` (territorial
legislature / representation). Seat counts are not extra office IDs. Do not
treat `other` as final until a human signs the
[tier_mapping](../../../docs/phase0/human-review.json) items.

**Armenia** is last among early European targets. Proportional councils elect
the mayor; missing mayor rows were not invented. Prompt token `AM-VEDI` is
register `AM-VEDI-C`.

Phase 1 still needs reviewed entity DDL and Albania import proof. Checking in
these drafts is not Albania storage proof and is not a populated regional
calendar.

See [docs/atlas-plan.md](../../../docs/atlas-plan.md) (Regional coverage counting)
and [docs/atlas-phase1.md](../../../docs/atlas-phase1.md).
