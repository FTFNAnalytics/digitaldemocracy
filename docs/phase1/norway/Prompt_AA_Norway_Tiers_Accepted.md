# Prompt AA — Norway tiers accepted (full register with holds)

**Justin accepted 2026-09-19 (America/Edmonton):** `schemas/atlas/tiers/norway.json`

| Disposition | Count | Office types | Production import |
| --- | ---: | --- | --- |
| **Accepted current** | **389** | 357 municipal councils + 14 county councils + Stortinget + Sámediggi + 15 Oslo borough committees + Longyearbyen lokalstyre (Oslo bystyre once) | Not in this landing — no importer |
| **Accepted historical** | **537** | historic municipal-council and former county-council identities retained outside the alert window | Not in this landing — no importer |
| **Register total** | **926** | exact office_id set; 876 municipal / 32 regional / 1 national / 17 other | — |

**Accepted with named holds.** Standing policy: retain offices and historic rows even outside the ~18-month window. The called municipal/county date 13 September 2027 stays day-precision metadata; Storting/Sámi 2029 stays an expected cycle year with no invented day. Appointed mayors, prime minister, and cabinet are not popular offices; **no executive or EP election rows**.

Named holds kept open (do not invent clearances):

- **SAMI-2025-ZERO-VOTE-SEAT-98d** — SSB whole-country vote cell is zero while party code 98d has a positive elected-member sum. Preserve both claims.
- **REFORM-2020-2024** — Official Klass change records retained verbatim. Only same-name one-to-one renumberings form aliases. No invented successor links.
- **OSLO-BOROUGH-HISTORY** — 15 directly elected bydelsutvalg stay `other`. Borough election returns and pre-2004 predecessors were not acquired.
- **LONGYEARBYEN-HISTORY** — Current 2023–2027 party composition is retained raw, not promoted to election results without protocol.
- **LEGAL-STATUS-REPEATS** — All event legal_outcome values remain unknown; published statistical returns are not relabelled certified.
- **COUNTY-AGGREGATES** — County votes are disclosed component sums. No source total invented; shares remain NULL.
- **SAMI-OLDER-HISTORY** — Sámediggi 2005–2025 returns supplied; earlier elections and 2009 district transition remain open.
- **MUNICIPAL-HISTORY-DEPTH** — 1945–2023 series retained where observed; missing/all-zero cells are not fabricated contests.
- **PARTY-CATEGORIES** — SSB common/local/other lists remain source categories; no invented party-family mappings.

Review pack pin: original review ZIP SHA-256 `5a38228b0ee2f035f5cf32a0e74914de23a30c1aa9fb15ae26d9075058c1f0ef` (bulky sources omitted from slim attach; do not invent missing source bytes). Draft authored against main `a0c02d0a36ed95cfb593dd7b085b9567d3b171d3`. Draft tier SHA before acceptance metadata: `dba7a879edae7f6ad44c3d3964fe345f375fe933f3549c98cfd99b361328a5f0`. Accepted tier SHA-256 `8ff8fc545ab326b135ac8a116d013c3dbecce377750e26dfc008bcea134db827`.

Importer / SQLite / VPS / UI remain follow-up work. `import:atlas` is **not** implemented for Norway in this landing. No `/electiondatabase` redirects and no Mexico edits.
