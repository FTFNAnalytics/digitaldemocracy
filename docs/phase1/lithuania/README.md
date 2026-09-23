# Lithuania full register — Prompt AH / accepted with holds

**123 current + 0 recovered historical-only offices; 30 historic events; 130 result claims.** Draft tiers landed 1:1: 120 municipal / 0 regional / 2 national / 1 other. Research capture is the Prompt AH slim pack. Justin accepted 2026-09-22 with named holds left open. The tier file stays `draft_for_human_review` (`Justin_accepted` remains false). No hold was closed or rewritten.

Start: [Lithuania_Full_Register_Report.md](Lithuania_Full_Register_Report.md). Pack narrative: [Pack_README.md](Pack_README.md). Data: `data/research/lithuania/`. Tiers: `schemas/atlas/tiers/lithuania.json`. Receipt: [JUSTIN_ACCEPTANCE.md](JUSTIN_ACCEPTANCE.md).

Current scope is 60 municipal councils, 60 directly elected mayors, Seimas, the directly elected president, and the Lithuania EP delegation. Direct executives: 61. Councils and parliamentary bodies: 62. No appointed county governor, deputy mayor, director, prime minister, cabinet, or seniūnija body was added. Zero recovered historical-only offices is not proof that none existed.

Named holds stay open: LT-HISTORY, LT-TERRITORIAL-ID, LT-MAYOR-LAW, LT-PRESIDENT-DENOMINATOR, LT-SEIMAS-GRAIN, LT-EP-DETAIL, and LT-PARTY-PRECISION. `Lithuania_Research_Gaps.md` also leaves LT-NEXT-AND-LEGAL and LT-EXCLUSIONS open. Missing results stay gaps, not zeros. No successor edge was guessed. Eleven 2019 presidential shares stay disputed. Mayor history is 19 winner observations from 2019, not complete returns.

`applied_changes=0` for importer/SQLite/VPS/UI. No importer and no package.json import script. Execution CI **Not run**. The slim land omits raw `sources/` and `validate.py` (see [SOURCES_NOTE.md](../../../data/research/lithuania/SOURCES_NOTE.md)). `docs/phase1/lithuania/validation.json` is the pre-acceptance PASS receipt. `docs/phase1/lithuania/SHA256SUMS` is the review-pack manifest and still names the omitted members. Do not invent omitted bytes. PASS does not mean complete research or permission to publish.

Draft tier bytes: `43933567bfa84c95d354e4b1eb9a02d43123b3a802b057eca319a0b6b1fe2e39`. Slim ZIP SHA-256 `093cf3ec4e232ea0c45e97cdc3767e64aa991ed564dca25d48ee8a327a1a353a`.

- [x] Justin accepts the sourced register with named holds (2026-09-22; holds stay open).
- [x] Justin accepts the draft tiers as supplied (2026-09-22; file not rewritten).
- [x] Justin accepts the recovered historical claims and remaining gaps (2026-09-22).
- [ ] Justin separately authorizes an importer.
