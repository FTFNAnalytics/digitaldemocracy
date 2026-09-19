# Prompt S2 — Belgium tiers accepted (full register)

**Justin accepted 2026-09-19 (America/Edmonton):** `schemas/atlas/tiers/belgium.json`

| Disposition | Count | Office types | Production import |
| --- | ---: | --- | --- |
| **Accepted current** | **1,179** | 565 municipal council + 565 mayor + 10 district council + 8 social-welfare council + 7 directly elected aldermen + 7 social-welfare standing bureau + 10 provincial council + 7 parliament (`human_review_required: false`) | Not in this landing — no importer |
| **Accepted historical** | **55** | municipality-pair historic councils retained outside the alert window | Not in this landing — no importer |
| **Register total** | **1,234** | exact office_id set; 1,185 municipal / 15 regional / 2 national / 32 other | — |

Standing policy: retain offices and historic rows even outside the ~18-month window. Expected 2030 dates stay year-precision metadata; **zero dated upcoming events** are authored.

Retained open:

- Remaining-universe census of unsourced indirect social-welfare / community-commission organs and executive/individual seats (`remaining_universe`).
- Historic successor / code-change review for the 55 historical IDs (`historic_binding`).
- Bilzen 2018/2019 date conflict; Saint-Josse 2024 repeat hold; 35 unbound IBZ 2000 municipal records.

Review pack pin: ZIP SHA-256 `9f0d9051dfaf6aeb6d2b3a500c258a551d0d49ac99febe5d57bd77263cee58ea`. Draft authored against main `01602ea88de411fd712858e10e3f559d5ceb3ee1`. Landing base `b293da99b97a8ae008d87ee2e57210cde0678004`. Draft tier SHA before acceptance metadata: `8dec06a21c01e0f0aa0228e3d152b795b0fff9522c96b2071fec334f5070ccb6`.

Importer / SQLite / VPS / UI remain follow-up work. `import:atlas` is **not** implemented for Belgium in this landing. Frozen PR #14 screening bytes are not overwritten. No `/electiondatabase` redirects and no Mexico edits.
