# Prompt U — Switzerland tiers accepted (evidenced subset)

**Justin accepted 2026-09-19 (America/Edmonton):** `schemas/atlas/tiers/switzerland.json`

| Disposition | Count | Office types | Production import |
| --- | ---: | --- | --- |
| **Accepted current** | **2,805** | federal chambers + 26 cantonal legislatures + 26 cantonal executives + communal executives/presidents/legislatures as drafted (`human_review_required` retained where flagged) | `ATLAS_IMPORT_SCOPE=switzerland` — see [Switzerland_Import.md](Switzerland_Import.md) |
| **Accepted historical** | **11** | sourced historic communal identities retained outside the alert window | `ATLAS_IMPORT_SCOPE=switzerland` — see [Switzerland_Import.md](Switzerland_Import.md) |
| **Register total** | **2,816** | exact office_id set; 2,402 municipal / 52 regional / 2 national / 360 other | — |

**Accepted-with-holds / approved subset only.** Full-register certification remains **OPEN**. Standing policy: retain offices and historic rows even outside the ~18-month window.

Held open (do not invent clearances):

- **308 communes without executive-body evidence** (especially **VD 284**, **SZ 24**). Enumerated in `data/research/switzerland/commune-coverage-audit.json`. Do not invent missing commune executives.
- **Thin historic/merger office archive** — 586 historical geographies versus 11 historical offices. Do not fabricate merger histories or predecessor office rows.
- **1,938 communes without positive elected-parliament evidence** (citizen-assembly caveat). This is not a claim that 1,938 parliaments are missing. Do not invent legislatures.
- **Mode-variance / disputed result rows** as open research notes (16 disputed result rows). Conflicting scalars stay NULL/unknown; original claims retained.

Review pack pin: slim ZIP SHA-256 `44cc615af90561d8da65fcb74bd72896a1fcab924d3e086a6d79fafd034216db`. Original full ZIP SHA-256 `fa166825db67b6cfab89193e518a68613b80940cc613a17c45a674295127542c` (bulky sources omitted from slim attach; do not invent missing source bytes). Draft authored against main `b4dcf6d891ed83a7db5b7d6eb8808671d6eec000`. Landing base `e64afc3`. Draft tier SHA before acceptance metadata: `0cddfca20fab058ed9f1a712515fdfd1725abda7a2e5a1b7903087135893d4bf`. Accepted tier SHA-256 `d1ebccfd1633aacd9b70732dcfe1f3e01df9549076d4b71efce38d436a2749f1`.

The follow-up importer is `ATLAS_IMPORT_SCOPE=switzerland` — see [Switzerland_Import.md](Switzerland_Import.md). Holds stay open. No `/electiondatabase` redirects and no Mexico edits.
