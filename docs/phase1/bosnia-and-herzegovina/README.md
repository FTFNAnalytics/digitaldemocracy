# Bosnia and Herzegovina — Prompt AW full office register + historic contests

Research/documentation review pack. **`applied_changes=0`**. No importer/SQLite/VPS/UI/repository changes. All Justin approvals remain unchecked.

## Pack counts
- Current offices: **306**
- Historical-only offices: **40**
- Events: **937**
- Result-state rows: **918**
- Prior Prompt O detailed numeric rows preserved by immutable reference: **749**
- Draft tiers: **municipal 327 / regional 15 / national 4**
- Current direct executive/member offices: **148**
- Current councils/chambers/assemblies: **158**
- State/entity/canton/municipal-local: **4 / 5 / 10 / 287**
- European Parliament offices: **0**

Start with `JUSTIN_REPORT.md` and `docs/Bosnia_Full_Register_Report.md`.

### Important result-depth qualification
The pack now closes the **office and contest-register** gap left by Prompt O. Every completed/annulled contest has a result-state record bound to an official result publication. Prompt O also already contained **749 detailed numeric vote/share/seat rows** for 39 entity/canton histories; AW preserves them by immutable blob/table hashes and an old→AW office crosswalk in `data/prompt-o-detailed-results-reference.json`. Exhaustive candidate/list transcription outside that retained set is not claimed; missing numeric cells remain explicit `NULL/not_transcribed`. See BA-AW-G01.

Run `python validate.py` from the pack root. The validator checks the 20-table/223-column contract, office/tier equality, current and historical counts, local-cycle arithmetic, the 2026 called events, zero EP offices, excluded indirect executives, missing-not-zero semantics, approvals and hashes.

### 2024 mayor-count discrepancy
CEC source material is internally inconsistent: the 8 May English call page lists 31 city mayors while also saying 143 total city/municipal mayors; the 4 October basic-information page lists 32 city mayors and 143 total. AW does not manufacture an unidentified direct office to force the aggregate. See BA-AW-G09.
