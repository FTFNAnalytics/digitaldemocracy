# Per-country office tier classification

Checked-in files here will map each package office ID to schema v1 `GovernmentTier`
(`national_context` / `regional` / `municipal` / `council` / `other`).

These files are the Atlas classifiers. Workbook calendar cohort strings such as
Albania `Regional / municipal` are **not** classifiers.

**Albania file is not in this PR.** It is blocked on the ChatGPT tier-file draft
(reviewed like DDL). Expected later path: `albania.json` (or equivalent) covering
the 122 office-register IDs (`AL-01-M` … mayors, `AL-01-C` … municipal councils).
The plan expects those offices to classify as **municipal**, with **no regional-tier
offices** in this package. Do not invent that file until the draft is reviewed.

See [docs/atlas-plan.md](../../../docs/atlas-plan.md) (Regional coverage counting)
and [docs/atlas-phase1.md](../../../docs/atlas-phase1.md).
