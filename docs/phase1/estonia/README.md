# Estonia full register — Prompt AF / APPROVED

**81 current + 200 historical offices; 464 events; 24 presidential ballot proceedings; 49,504 candidate result rows (review ZIP).** Draft tiers: 278 municipal, 0 regional, 2 national, 1 other. Main pin `f7b5c81ebd39f1774edea7cde5b4155031d92647`. Research capture recorded in the Prompt AF pack. Justin accepted 2026-09-21 (America/Edmonton) with named holds EE-G01–EE-G09 left open.

Start: [Estonia_Full_Register_Report.md](Estonia_Full_Register_Report.md). Data: `data/research/estonia/`. Tiers: `schemas/atlas/tiers/estonia.json` (**approved**, production_accepted). Receipt: [JUSTIN_ACCEPTANCE.md](JUSTIN_ACCEPTANCE.md).

Current scope is 78 municipal councils, Riigikogu, the indirectly elected president, and the Estonia EP delegation. Current direct-executive offices: 0. Historical codes stay separate; no merger edges are guessed. The 2013 roster of 215 is not the immediately-pre-2017 legal count. Jõhvi 0250 is the current merged council name in 2025 metadata; earlier Jõhvi 0251 and Toila 0803 stay historical (EE-G08 open).

`applied_changes=0` for repo/importer/SQLite/VPS/UI. No importer or executable override. Execution CI **Not run**. Land PR gunzips `events.json`, `nonadditive-list-summaries.json`, and `Estonia_Input_Inventory.json`. It omits `results.json`, `Estonia_Identity_Vectors.json`, and raw `sources/` (see [SOURCES_NOTE.md](../../../data/research/estonia/SOURCES_NOTE.md)). `docs/phase1/estonia/validation.json` is the pre-acceptance PASS receipt. `docs/phase1/estonia/SHA256SUMS` and `validate.py` are the full review-pack manifest and offline validator; `validate.py` expects the pack root (including omitted results, identity vectors, and sources) and the pre-acceptance draft flags. It is not an npm script and was not re-run after this accept-with-holds. Do not invent omitted bytes. PASS does not mean complete research or permission to publish.

Approved tier bytes: `bf86952fe8966a792166064e6505932ce590c3643951a802ba55896a332cfa8d` (predecessor draft `ae9f02831902fa9981adf3aa034bc92dd6c7861b66621a1ff66652fd4e0daa25`).

- [x] Justin accepts register scope and named holds (2026-09-21, with named holds).
- [x] Justin accepts draft tiers, including EP as `other` (2026-09-21; EE-G05 retained).
- [x] Justin accepts historic identities with no invented successors (2026-09-21).
- [ ] Justin separately authorizes implementation.
