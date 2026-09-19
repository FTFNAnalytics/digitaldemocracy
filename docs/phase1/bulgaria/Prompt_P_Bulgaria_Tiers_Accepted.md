# Prompt P — Bulgaria tiers accepted (partial)

**Justin accepted 2026-09-19 (America/Edmonton):** `schemas/atlas/tiers/bulgaria.json`

| Disposition | Count | Office types | Production import |
| --- | ---: | --- | --- |
| **Accepted municipal** | **530** | 265 Mayor + 265 Municipal council (`human_review_required: false`) | Yes — future importer loads these |
| **Held submunicipal** | **3,067** | 35 District mayor + 3,032 Village mayor (`human_review_required: true`, `review_category: submunicipal_scope`) | **No** — not production-approved |
| Regional | 0 | none evidenced | Do not invent a regional layer |
| **Register total** | **3,597** | exact office_id set | — |

Retained open:

- Submunicipal category policy (`submunicipal_tier_policy_and_2027_roster`) — 2023 roster is not 2027 eligibility.
- Градец 2015 qualification-change hold (`BG-SLV11-b88d0d4475-V`) — six first-round + two unresolved runoff rows; do not invent withdrawal/correction/decision evidence.
- Country research watch, partial selected history, and unresolved-outcome notes.

Package pin at review: PR #16 `de3541276cd37ca749b740c229cee67475f0d317`. Main contracts pin: `00c2ea7458ad7705aad487c4a7665d9d343b5554`. Draft tier SHA before acceptance metadata: `cff8fcabb12716230a314309162a40c72a3d7d13fe1aa4469cfb1655767c48f0`. Review pack ZIP SHA-256 `d21aac75971647ebdc5b5f64a020c11bb2505a4292502d7c9b5cf6e79b6b03ec`.

Importer / SQLite / VPS / UI remain follow-up work. `import:atlas` is **not** implemented in this landing.
