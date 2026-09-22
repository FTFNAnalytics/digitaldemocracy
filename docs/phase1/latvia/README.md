# Latvia full register — Prompt AG / APPROVED

**45 current + 121 historical offices; 217 events (216 historic + 1 prospective); 2 proceedings; 1,383 result rows.** Draft tiers: 163 municipal, 0 regional, 2 national, 1 other. Main pin `f7b5c81ebd39f1774edea7cde5b4155031d92647`. Research capture recorded in the Prompt AG pack. Justin accepted 2026-09-21 (America/Edmonton) with named holds LV-G01–LV-G09 left open.

Start: [Latvia_Full_Register_Report.md](Latvia_Full_Register_Report.md). Data: `data/research/latvia/`. Tiers: `schemas/atlas/tiers/latvia.json` (**approved**, production_accepted). Receipt: [JUSTIN_ACCEPTANCE.md](JUSTIN_ACCEPTANCE.md).

Current scope is 42 municipal councils (7 state-city + 35 novadi), Saeima, the indirectly elected president, and the Latvia EP delegation. Current direct-executive offices: 0. Historical rows stay separate; no merger edges are guessed. The 121 historical records are identity records, not 121 abolished councils. The 2017 roster of 119 is a dated election snapshot, not the immediately-pre-reform legal count. Post-reform observations are 43; the 2025 roster is 42.

`applied_changes=0` for repo/importer/SQLite/VPS/UI. No importer or executable override. Execution CI **Not run**. Land PR gunzips `results.json`. It omits `Latvia_Identity_Vectors.json` and raw `sources/` (see [SOURCES_NOTE.md](../../../data/research/latvia/SOURCES_NOTE.md)). `docs/phase1/latvia/validation.json` is the pre-acceptance PASS receipt. `docs/phase1/latvia/SHA256SUMS` and `validate.py` are the full review-pack manifest and offline validator; `validate.py` expects the pack root (including omitted identity vectors and sources) and the pre-acceptance draft flags. It is not an npm script and was not re-run after this accept-with-holds. Do not invent omitted bytes. PASS does not mean complete research or permission to publish.

Approved tier bytes: `227f743ab91c6d86f711be2fd5314e3e7c573da233b9a61187c8a3b37abb34f3` (predecessor draft `7d9dd90af38a532a1148848598aaf90cb6ce95ca4edd7b4aa26d1734452498ce`).

- [x] Justin accepts register scope and named holds (2026-09-21, with named holds).
- [x] Justin accepts draft tiers, including EP as `other` (2026-09-21; LV-G05 retained).
- [x] Justin accepts historic identities with no invented successors (2026-09-21). Historical 121 rows remain identity records, not abolished councils.
- [ ] Justin separately authorizes implementation.
