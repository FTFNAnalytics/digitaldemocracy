# Prompt T — Netherlands tiers accepted (full register)

**Justin accepted 2026-09-19 (America/Edmonton):** `schemas/atlas/tiers/netherlands.json`

| Disposition | Count | Office types | Production import |
| --- | ---: | --- | --- |
| **Accepted current** | **432** | 342 municipal councils + 12 provincial states + 21 waterboard boards + national chambers/EP + islands/colleges + Amsterdam/Rotterdam submunicipal bodies (`human_review_required` as drafted) | `ATLAS_IMPORT_SCOPE=netherlands` |
| **Accepted historical** | **69** | historic municipal-council identities retained outside the alert window | `ATLAS_IMPORT_SCOPE=netherlands` |
| **Register total** | **501** | exact office_id set; 414 municipal / 12 regional / 3 national / 72 other | — |

Standing policy: retain offices and historic rows even outside the ~18-month window. Expected 2030 dates stay year/month-precision metadata; **zero dated upcoming events** are authored. Mayors are appointed; **no mayoral election rows**.

Retained open:

- Hilversum / Wijdemeren 18 November 2026 merger successor binding (`latest_cycle_coverage` on `NL-GM0402-C` / `NL-GM1696-C`). Do not invent a successor office or two future contests.
- Named historic gaps / partial coverage (2014/2018/2022 qualifications; 69 historical codes; Leeuwarderadeel 2014 withheld collapse).
- Focused-tier review rows (~147) — keep drafted tiers; Justin accepted the register universe.
- Appointed-mayor / reserved-executive exclusion (no invented mayor rows).

Review pack pin: slim ZIP SHA-256 `8a0d2c1b33148dc6d614db5402991f3cf621fdd443a18539f036cc2ec1e9dac9`. Original full ZIP SHA-256 `fd9820e4cb89461971e62a8874c0d301ca64a4bdb030ad60842bb75db7cc0031` (bulky sources omitted from slim attach; do not invent missing source bytes). Draft authored against main `b293da99b97a8ae008d87ee2e57210cde0678004`. Draft tier SHA before acceptance metadata: `81dc30e718355573cd15e3c93ff8f75364e4223612efab23cbd3393c5c94ea89`. Accepted tier SHA-256 `faaf7573c678887004bc1f36f00a8496294ae23db5569278280a45642f0631b7`.

The follow-up importer is `ATLAS_IMPORT_SCOPE=netherlands` — see [Netherlands_Import.md](Netherlands_Import.md). No `/electiondatabase` redirects and no Mexico edits.
