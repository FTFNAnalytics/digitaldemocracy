# Prompt M — 95 sibling withholds accepted

**Justin accepted all 95 sibling share-withholds on 2026-09-17 (America/Edmonton).** Disposition is withhold `share` / `share_status` / `evidence_status` for MX-G01–G10 and G12–G27. MX-G11 has no new bundles. No numeric replacements. All 27 event conflicts remain open.

This records a docs-only acceptance of the Prompt M proposal. It does **not** apply the 285 new scalars. The live Mexico override is unchanged. Executable application waits on a separately authorized importer amendment: `lib/atlas/continuity/latam.ts` currently hard-requires exactly 201 applied changes from the original 67-row file.

## Disposition

| Item | Outcome |
| --- | --- |
| Accepted sibling rows / bundles | 95 indivisible three-field withholds |
| New scalar proposals | 285 (`share` NULL, `share_status` unknown, `evidence_status` disputed) |
| Groups with bundles | MX-G01–G10, MX-G12–G27 (26) |
| MX-G11 | Reviewed; no new bundles; existing 7 withholds retained |
| Numeric replacements | 0 |
| Event conflicts remaining open | 27 |
| Live / discoverable override | Original withhold-all-67 only (201 scalars) |

## Hashes

| File | SHA-256 | Notes |
| --- | --- | --- |
| `docs/phase2/decisions/Mexico_Sibling_95_Reconciliation.md` | `91d17e65fec4c7718ac1827eb17ec61694aeb37d6eddb7fe18e9aebdfcdcae47` | Review-pack findings, byte-unchanged |
| `docs/phase2/decisions/Prompt_M_Sibling_Reconciliation_and_CI.md` | `6d1aaa4430a786b071f0049eb1b6a414bd8e49e263be1ee6768a5ef5c23cee28` | Review-pack checklist, byte-unchanged |
| `docs/phase2/decisions/Mexico_Sibling_Inventory.json` | `96d430d10a267fcb75566d74c5dd8015a41e1a69a5e863f122079912d1199c4e` | Review-pack inventory, byte-unchanged |
| `docs/phase2/decisions/Mexico_Sibling_Validation.json` | `80b04112550c4c59f0de2e0192ff486f24c4c4d52d4d3f9bbde51d3c7795d30c` | Review-pack validation, byte-unchanged |
| `docs/phase2/decisions/mexico-sibling-reconciliation-PROPOSED.json` (review pack) | `addda2a4596efcd44a425198f4ddc58d0685eb957a380f373997e07fe4f63496` | Pre-acceptance proposal |
| `docs/phase2/decisions/mexico-sibling-reconciliation-PROPOSED.json` (this landing) | `03deb030bc57f40eaaa18f0cbb26cdd4bbad87f09085592b296735c6f354890d` | Acceptance recorded; `production_accepted=false`; `executable_override=false` |
| `data/overrides/atlas/latin-america-fe5e91689def/mexico-share-domain.json` | `5107ff27900cc449267fa1810ed92e247de85ec44c86b94685d785f62d2daaa9` | Live predecessor; must remain byte-unchanged |

The accepted docs proposal stays under `docs/phase2/decisions/` and outside production override discovery. Importer discovery remains the single accepted file at `data/overrides/atlas/latin-america-fe5e91689def/mexico-share-domain.json`.

## What did not change

- Live Mexico override bytes (67 bundles / 201 scalars; `production_accepted=true`, `executable_override=true`).
- `lib/atlas/continuity/latam.ts`, importer, tiers, frozen research, DDL, UI.
- No composite executable override, VPS deploy, or live share flips.
- No numeric alternate selected for any of the 95 siblings or the original 67.

## Still not done

- Authorized importer amendment for additive overrides (hash-pinned sibling file or a separately reviewed versioned composite). The current exact-201 loop must not be silently relaxed.
- Application of the 285 accepted sibling scalars after that amendment.
- Numeric reconciliation of any of the 27 Jalisco 2018 municipal events.

See [Mexico_Sibling_95_Reconciliation.md](Mexico_Sibling_95_Reconciliation.md), [mexico-sibling-reconciliation-PROPOSED.json](mexico-sibling-reconciliation-PROPOSED.json), and [Prompt_M_Sibling_Reconciliation_and_CI.md](Prompt_M_Sibling_Reconciliation_and_CI.md).
