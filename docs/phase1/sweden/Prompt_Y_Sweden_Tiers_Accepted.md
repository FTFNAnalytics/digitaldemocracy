# Prompt Y — Sweden tiers accepted (full register with holds)

**Justin accepted 2026-09-19 (America/Edmonton):** `schemas/atlas/tiers/sweden.json`

| Disposition | Count | Office types | Production import |
| --- | ---: | --- | --- |
| **Accepted current** | **313** | 290 kommunfullmäktige (Gotland once as `SE-K0980-C`) + 20 regionfullmäktige + Riksdagen + EP delegation + elected Sameting (`human_review_required` retained where flagged) | Not in this landing — no importer |
| **Accepted historical** | **7** | pre-1976 Svedala / Bara plus five former landsting identities retained outside the alert window | Not in this landing — no importer |
| **Register total** | **320** | exact office_id set; 292 municipal / 25 regional / 1 national / 2 other | — |

**Accepted with named holds.** Standing policy: retain offices and historic rows even outside the ~18-month window. Expected 2030 / EP 2029 remain year-precision metadata; **zero dated upcoming events** are authored. Kommunalråd, prime minister, and cabinet are not popular offices; **no executive election rows**.

Named holds kept open (do not invent clearances):

- **SE-GOTLAND-TIER** — Gotland is one municipal electoral body with regional responsibilities. Keep `SE-K0980-C` municipal. Do not add a second regional office or duplicate contest.
- **SE-EP-SAM-TIER** — Sweden EP delegation and elected Sameting assembly stay `other`.
- **SE-2026-COUNT-IN-PROGRESS** — 310 local 2026 vectors remain preliminary. Refresh independently of the final Riksdag result.
- **SE-HISTORICAL-BOUNDARIES** — SCB 1973–2022 identities retained; pre-1973 abolished councils are not exhaustive; successor bindings stay open.
- **SE-HISTORIC-PARTY-DETAIL** — SCB ÖVRIGA and incomplete historic party/candidate slates stay open.
- **SE-REPEAT-AND-RECOUNT** — SCB footnotes / mixed repeat totals; Båstad 2015 has an event anchor without a typed vector.
- **SE-FARGELANDA-1973** — hypothetical double-election-adjusted seats withheld from typed seats.

Review pack pin: original full ZIP SHA-256 `4ec82b46cba519381d54228a1560dc0fea33d8190629a08cd355f641a57b4b3e` (bulky sources omitted from slim attach; do not invent missing source bytes). Draft authored against main `94b22e8662b4d304263bef67628765f5377fd9da`. Draft tier SHA before acceptance metadata: `ba95b2671f56b45077e9a4987e54d59438793cdfe053d8486de04dc54c0f2139`. Accepted tier SHA-256 `dc13885023d2d454dae39272a5fe668e384e7606d4f2f89a3df136e9f0170ef7`.

Importer / SQLite / VPS / UI remain follow-up work. `import:atlas` is **not** implemented for Sweden in this landing. No `/electiondatabase` redirects and no Mexico edits.
