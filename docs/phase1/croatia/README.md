# Croatia full register — Prompt W / APPROVED

**1,234 current and 11 historical office identities; 3,834 events and 15,907 typed aggregate result rows.** Current scope is the complete captured DIP 2025 ordinary local/regional ballot register plus Sabor, President and EP. Historical completeness and legal/seat allocation remain open. Main pinned `785bae49b4b3ac6bc2ef105f33cc826caa948caf`; capture 2026-09-20. The Atlas importer is landed (`ATLAS_IMPORT_SCOPE=croatia`). VPS deploy is out of scope. See [Croatia_Import.md](Croatia_Import.md).

| Office family | Current | Historical | Treatment |
|---|---:|---:|---|
| Local/county assemblies |576|0|555 non-Zagreb local councils +20 counties + one Zagreb dual assembly. |
| Executive tickets |577|0|555 local heads +20 župans + Zagreb mayor + President. Joint deputies remain inside ticket. |
| Independently elected deputies |79|11|Electorate-specific ballots; historical absence is an eligibility/binding hold. |
| Sabor |1|0|135 constituency/electorate events over 8 cycles; one chamber. |
| EP delegation |1|0|4 cycles; preference vectors retained raw. |

Draft tiers across all 1,245 offices: **1,187 municipal /55 regional /2 national /1 other**. National maps to national_context. Every office has one draft tier. No calendar classifiers, invented deputy ballots, seat allocations or successor links.

History: local 2017/2021/2025 (3,689 events); President 2000/2005/2009/2014/2019/2024; Sabor 2000/2003/2007/2011/2015/2016/2020/2024; EP 2013/2014/2019/2024. The 2,418 proceedings distinguish executive rounds without extra cycles. Votes/shares are source supplied. All typed seats/elected flags remain unknown. Seven Serbian-minority vectors have candidate sums above valid ballots; no normalization applied.

The alert window does not remove offices/history. Next dates remain unknown; four-year local cadence is narrative, not a fabricated 2029 called event. Zagreb is represented once and separately from Zagrebačka županija.

Open gates: post-2025 roster changes; pre-2017 territorial reforms;11 deputy bindings; special/supplementary returns; Tar-Vabriga empty deputy return; missing Biskupija 2017 input; seat/legal finality; minority denominators; EP allocation; national/runoff date precision. [Research gaps](Croatia_Research_Gaps.md) lists exact IDs. [Projection contract](Source_Projection_Contract.md) specifies every source layout.

Primary foundation: [DIP archive](https://www.izbori.hr/arhiva-izbora/index.html), [local open data](https://www.izbori.hr/site/UserDocsImages/482), [direct executive mechanism](https://www.izbori.hr/site/izbori-referendumi/lokalni-izbori/izbori-za-opcinske-nacelnike-gradonacelnike-i-zupane-te-njihove-zamjenike/121), [independent deputy mechanism](https://www.izbori.hr/site/izbori-referendumi/lokalni-izbori/izbori-za-zamjenike-opcinskih-nacelnika-gradonacelnika-i-zupana-iz-reda-pripadnika-nacionalnih-manjina-odnosno-iz-reda-pripadnika-hrvatskog-naroda/122). Acquired bytes/hashes are retained; duplicate representations are not summed.

- [x] Justin accepts register scope and named holds (2026-09-20, with named holds).
- [x] Justin accepts draft tiers, including Zagreb and EP (2026-09-20; named holds retained).
- [x] Justin accepts historic identities and projection policy (2026-09-20).
- [ ] Justin separately authorizes implementation.

**Importer:** `ATLAS_IMPORT_SCOPE=croatia` loads the accepted register. VPS deploy and live cutover are not part of this importer. Land-time `applied_changes=0` recorded the research landing only.

## Navigation

Research: data/research/croatia/. Tier: schemas/atlas/tiers/croatia.json (**approved**, production_accepted). Acceptance: docs/phase1/croatia/JUSTIN_ACCEPTANCE.md. Import: [Croatia_Import.md](Croatia_Import.md). Docs/vectors/inventory: docs/phase1/croatia/. Contract references: contracts/. Run python3 validate_pack.py for read-only documentary checks. SHA256SUMS covers every other member; its own hash is in the external receipt.
