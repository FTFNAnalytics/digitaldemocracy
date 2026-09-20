# Norway Prompt AA research tables

Sourced Prompt AA full-register research for Norway. 389 current + 537 historical office rows. Justin accepted the register on 2026-09-19 with named holds. Drafted geographic tiers are retained (876 municipal / 32 regional / 1 national / 17 other), including Oslo bystyre once, 15 borough committees as `other`, Sámediggi as `other`, and Longyearbyen as `other`. This directory is **not** a country-package extract and is **not** loaded by `import:atlas`.

Named holds retained: SAMI-2025-ZERO-VOTE-SEAT-98d; REFORM-2020-2024; OSLO-BOROUGH-HISTORY; LONGYEARBYEN-HISTORY; LEGAL-STATUS-REPEATS; COUNTY-AGGREGATES; SAMI-OLDER-HISTORY; MUNICIPAL-HISTORY-DEPTH; PARTY-CATEGORIES. No popular mayor / prime-minister / cabinet or EP rows. Do not invent merger successors, borough/Longyearbyen result histories, certified legal outcomes, or missing result scalars.

Core tables landed from the slim review pack. SHA256SUMS also lists bulky primary-source members omitted from that attach; do not invent those bytes.

`results.json` is the same 59,033 rows as the slim pack, compacted (no pretty-print whitespace) so the file stays under GitHub’s 100 MB blob limit. Original pretty-print SHA-256 remains `9d8c9eab7f968da3019508e7a0c36ba4409ff6ea9d7517814641b3d0736c8276`. Landed compact SHA-256 `0932c1a41489fdff16d7cb8d252286924e41935191c5cf494a713bee84b02932`. Do not treat the compact landing bytes as a new research extract.

See [docs/phase1/norway/README.md](../../../docs/phase1/norway/README.md).
