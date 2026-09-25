# Serbia full office register report — Prompt AX

# Serbia full-register research handoff — Prompt AX

Research snapshot: **23 September 2026**. **`applied_changes=0`**. No importer, SQLite, VPS, UI or repository changes.

## Current register
- **173 current elected offices**
- **0 historical-only office rows**
- **2 national** — National Assembly; President
- **1 provincial** — Vojvodina Assembly
- **170 local assemblies** — 145 top-level local-self-government assemblies plus 25 separately elected city-municipality assemblies
- **172 councils/chambers/assemblies**
- **1 direct executive** — President
- **0 direct municipal/city executives**
- **0 European Parliament offices**
- **0 Kosovo-scope municipal/parallel offices** in this Serbia pack

## Historic contests/results
- **510 local events**: 170 offices × three official SORS source series.
- **3 National Assembly events**: 2020 / 2022 / 2023.
- **4 presidential events**: 2012 first round, 2012 runoff, 2017, 2022.
- **3 Vojvodina Assembly events**: 2016 / 2020 / 2023.
- **520 events total**.
- **641 result rows**.
- **131 detailed numeric result rows** across national, presidential, Vojvodina and 2024 Belgrade City Assembly returns.
- Remaining local result-state rows carry `null/not_transcribed` numeric fields; missing is never zero.

## Draft tier histogram
- national: **2**
- regional: **1**
- municipal: **170**
- other: **0**

## Named holds
RS-AX-G01 through RS-AX-G10 are retained. G01 is the exhaustive local numeric-vector transcription hold; G05 is the Kosovo scope gate; G06 confirms zero EP offices; G07 prohibits guessed reform/successor edges; G08 keeps untranscribed 2020 per-office dates unknown.


## Current-register reconciliation
The current structure was reconciled to the SORS territorial register, 2024 local-election tables and the 2025 territorial-change publication. No predecessor/successor edge was added without a source-identified legal basis.
