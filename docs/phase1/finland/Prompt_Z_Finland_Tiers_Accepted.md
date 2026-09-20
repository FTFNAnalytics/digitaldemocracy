# Prompt Z — Finland tiers accepted (full register with holds)

**Justin accepted 2026-09-19 (America/Edmonton):** `schemas/atlas/tiers/finland.json`

| Disposition | Count | Office types | Production import |
| --- | ---: | --- | --- |
| **Accepted current** | **333** | 308 municipal councils (292 mainland + 16 Åland; Helsinki once) + 21 wellbeing-county councils + Åland Lagting + Eduskunta + elected presidency + Finland EP delegation (`human_review_required` retained on FI-EP) | Not in this landing — no importer |
| **Accepted historical** | **170** | historic municipal-council identities retained outside the alert window | Not in this landing — no importer |
| **Register total** | **503** | exact office_id set; 478 municipal / 22 regional / 2 national / 1 other | — |

**Accepted with named holds.** Standing policy: retain offices and historic rows even outside the ~18-month window. Ministry next-date metadata (Eduskunta 18 April 2027, mainland municipal/county 15 April 2029, EP 10 June 2029, presidential 27 January 2030) stays day-precision metadata; **zero dated upcoming events** are authored. Appointed managers, prime minister, and cabinet are not popular offices; **no executive election rows**.

Named holds kept open (do not invent clearances):

- **FI-HISTORIC-MERGERS** — Observed historical municipal councils retained; no successor edges, exact abolition dates, or same-code predecessor splits inferred.
- **FI-ALAND-EARLY-AND-DATES** — ÅSUB table starts 1987 with aggregate-only seats; individual municipal seat vectors begin 1991, votes 1999, Lagting 1979. Exact days, specials, and next Åland dates remain unverified.
- **FI-WELLBEING-TRANSITION** — 21 councils elected in 2022; the 2023 services transition is not a new election. Helsinki and Åland are excluded from county office generation. No inferred Kainuu/HVA20 predecessor.
- **FI-EP-DETAIL** — National party vote/share histories 1996–2024 normalized. Elected-member cube retained without manufacturing seat totals. EP stays `other`.
- **FI-CYCLE-LEGAL-DETAIL** — Year-only statistical histories do not certify exact polling days or exhaustive annulment/repeat chronology.
- **FI-PARTY-CATEGORIES** — Historic StatFin labels combine predecessor parties and technical aggregates. Preserve original statistical categories.
- **FI-MISSING-RESULTS** — Pre-2012 mainland municipal seats, pre-2003 parliamentary seats, and several candidate/round/date details stay NULL. Missing ≠ zero.

Review pack pin: original review ZIP SHA-256 `ffea607223a5da64a148b2c9ff4ae23c391a84bde6107a30ab73166a59dee3d9` (bulky sources omitted from slim attach; do not invent missing source bytes). Draft authored against main `a0c02d0a36ed95cfb593dd7b085b9567d3b171d3`. Draft tier SHA before acceptance metadata: `7c3a4c1c17538d5600a10c655e7fb18b12f977a1ef79c7608f9869d813df2797`. Accepted tier SHA-256 `15edd48df39caae6cfefec9b20b0a20a7bafcfe7e919accbb46d056924083d53`.

Importer / SQLite / VPS / UI remain follow-up work. `import:atlas` is **not** implemented for Finland in this landing. No `/electiondatabase` redirects and no Mexico edits.
