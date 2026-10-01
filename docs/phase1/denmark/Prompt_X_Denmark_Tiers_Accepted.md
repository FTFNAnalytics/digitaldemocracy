# Prompt X — Denmark tiers accepted (full register)

**Justin accepted 2026-09-19 (America/Edmonton):** `schemas/atlas/tiers/denmark.json`

| Disposition | Count | Office types | Production import |
| --- | ---: | --- | --- |
| **Accepted current** | **106** | 98 municipal councils + five operating regional councils + elected preparatory Østdanmark council + Folketinget + Denmark EP delegation (`human_review_required` as drafted) | `ATLAS_IMPORT_SCOPE=denmark` |
| **Accepted historical** | **240** | historic municipal-council and former county-council identities retained outside the alert window | `ATLAS_IMPORT_SCOPE=denmark` |
| **Register total** | **346** | exact office_id set; 324 municipal / 20 regional / 1 national / 1 other | — |

Standing policy: retain offices and historic rows even outside the ~18-month window. Expected 2029 dates stay day-precision metadata; **zero dated upcoming events** are authored. Mayors (borgmester) and regional chairs are council-selected; **no popular mayor rows**.

Retained open:

- Greenland/Faroe Realm coverage gates. Do not invent Inatsisartut, Løgting, settlement-council, or Realm Folketing offices.
- 2007/earlier merger successor bindings (many-to-many successors, splits, same-code boundary changes; Bornholm 2003 / Ærø 2006). Do not fabricate merger clearances.
- KMD/DST detail holes (named local lists inside EJR, losing-candidate slates, list alliances, pre-1989 locals, specials).
- 98 unresolved candidate bindings (`unresolved-candidate-bindings.json`). Do not guess FKs.
- EP detail gaps (party seats / candidate histories / primary certificates). Year-precision 2009/2014/2019/2024 events remain valid.
- Focused-tier review rows (293) — keep drafted tiers; Justin accepted the register universe.

Review pack pin: slim ZIP SHA-256 `92da2e399a687e0096feb6145f5842cbd5e8e598c6126d839aedbcf7a2da09f1`. Original full ZIP SHA-256 `c471d5af6738ae629c6562066819da21ca32c37e09921d5c6d531b80a6cee74a` (bulky sources omitted from slim attach; do not invent missing source bytes). Draft authored against main `e64afc324e34ae07f0760f49870ece64eb2ee645`. Landing base `94b22e8`. Draft tier SHA before acceptance metadata: `ba4626ab06fb811261b9e16972e3708497b63ec5717df046a3fcfaf716f811f5`. Accepted tier SHA-256 `672d8cf0fa57345010eb03ff0cfb905574ff1394f045a60119967d9a6ed8f57e`.

The follow-up importer is `ATLAS_IMPORT_SCOPE=denmark` — see [Denmark_Import.md](Denmark_Import.md). No `/electiondatabase` redirects and no Mexico edits.
