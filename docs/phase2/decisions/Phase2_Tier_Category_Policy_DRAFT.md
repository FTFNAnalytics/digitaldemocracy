# Phase 2 tier category policy — DRAFT

**For Justin's acceptance. No policy, tier file or classification row is approved or modified.** Baseline: merged main `9065dcdfc0cbc78171dad35b60742ae232b6dd00` plus Prompt E/PR #19 head `4479c57eccd0d05d48abce2d3407ad3f032a2590`. Use the exact 22 draft hashes in Phase2_Tier_Pack_Report.md; the original report and review queue remain unchanged.

## Proposed common rule

Classify the institution represented by the office, using its named function and supplied geography. Municipal groups municipality-level institutions and general-purpose local council equivalents; regional groups explicit state/province/department institutions and the named autonomous/federal-district executives/chambers. Distinct subordinate/community bodies and special-purpose school bodies are other under this proposed taxonomy. This is an Atlas grouping choice, not a fresh legal classification of each country's powers. Unknown means the institution cannot yet be established, not a synonym for other. Office type, historical/current status, electoral constituency size and direct/indirect election method remain separate.

Do not classify by calendar cohort, region name alone, raw/bridge tier alone, future polling date or a numerical target. Zero regional offices is valid. Europe remains the default landing. Draft LatAm counts never become European coverage. Policy acceptance is separate from pack acceptance, research completeness, data import and publication.

The 6,851 focused flags are not 6,851 independent taxonomy decisions. If Justin accepts the recommendations below, **5,426 human-review flags could clear**, while **1,425 remain**: 315 historical-boundary bindings, 99 unresolved historical institutions, seven island institutions and 1,004 provisional Haiti section IDs. These residual categories are disjoint for this count. Only 106 would still have tier_uncertain=true (99 unknown + seven island); 1,319 remaining flags concern identity/boundary rather than the proposed tier. No clearances are applied here.

All files remain draft_for_human_review. A human_review_required=false row still needs pack acceptance; it does not mean the sources are complete. A known tier can have a remaining non-tier review question. An accepted file may retain explicitly accepted unknown/needs-review states under Prompt D; never hide them to obtain an approved regional count.

## Category decisions

Exemplars are exact supplied IDs with pointers/hashes in the appendix and original tier files. Two categories contain only two records: both are shown, rather than inventing a third example. Category totals overlap; do not add them as unique offices.

### autonomous_city_scope — 2 offices

**Proposed tier:** regional. Keep the supplied CABA executive/legislature with the regional institutions. Their city name does not make these two institutional records municipal.

**Flag handling:** Clear both tier flags after Justin accepts this institution-level rule and the cited executive/chamber identities; retain any independently discovered identity conflict.

**Over-promotion and grouping risks:** Promoting commune boards merely because they are within CABA; interpreting a city label as national authority.

| Country | Existing office ID | Current draft tier | Classification pointer |
| --- | --- | --- | --- |
| argentina | AR-CABA-G | regional | schemas/atlas/tiers/argentina.json /classifications/571 |
| argentina | AR-CABA-D | regional | schemas/atlas/tiers/argentina.json /classifications/572 |

This category has only 2 source records; these are the complete exemplar set.

Justin decision (choose one; none selected):

- [ ] Approve policy as written, including the stated residual flags.
- [ ] Amend policy; specify the rule and affected countries/IDs.
- [ ] Keep all category rows flagged.

Reviewer/date and amendments: ____________________

### corporation_scope — 14 offices

**Proposed tier:** municipal. Treat Trinidad corporation councils as the municipality-equivalent local-government institution. Do not infer Atlas regional tier from the adjective regional.

**Flag handling:** Clear the scope flags after policy acceptance; preserve ward/aggregate overlap and election-method caveats in retained research. Those are not proof of tier uncertainty.

**Over-promotion and grouping risks:** Inflating regional counts; summing corporation and ward votes as disjoint electorates.

| Country | Existing office ID | Current draft tier | Classification pointer |
| --- | --- | --- | --- |
| trinidad-and-tobago | TT-C-ARIMA | municipal | schemas/atlas/tiers/trinidad-and-tobago.json /classifications/0 |
| trinidad-and-tobago | TT-C-CHAGUANAS | municipal | schemas/atlas/tiers/trinidad-and-tobago.json /classifications/1 |
| trinidad-and-tobago | TT-C-COUVA-TABAQUITE-TALPARO | municipal | schemas/atlas/tiers/trinidad-and-tobago.json /classifications/2 |
| trinidad-and-tobago | TT-C-DIEGO-MARTIN | municipal | schemas/atlas/tiers/trinidad-and-tobago.json /classifications/3 |
| trinidad-and-tobago | TT-C-MAYARO-RIO-CLARO | municipal | schemas/atlas/tiers/trinidad-and-tobago.json /classifications/4 |

Justin decision (choose one; none selected):

- [ ] Approve policy as written, including the stated residual flags.
- [ ] Amend policy; specify the rule and affected countries/IDs.
- [ ] Keep all category rows flagged.

Reviewer/date and amendments: ____________________

### district_local_government — 33 offices

**Proposed tier:** municipal. Treat the supplied Bahamas local district councils as municipality-equivalent local-government institutions, retaining direct-election and indirect-formation office types.

**Flag handling:** Clear scope flags after acceptance for the exact 33 councils; do not clear separate boundary or direct-election uncertainty in research. No new town-committee office is created.

**Over-promotion and grouping risks:** Mistaking island size or district nomenclature for regional authority; turning indirect formation into a popular ballot.

| Country | Existing office ID | Current draft tier | Classification pointer |
| --- | --- | --- | --- |
| bahamas | BS-D-NORTH-ABACO | municipal | schemas/atlas/tiers/bahamas.json /classifications/0 |
| bahamas | BS-D-CENTRAL-ABACO | municipal | schemas/atlas/tiers/bahamas.json /classifications/1 |
| bahamas | BS-D-SOUTH-ABACO | municipal | schemas/atlas/tiers/bahamas.json /classifications/2 |
| bahamas | BS-D-NORTH-ANDROS | municipal | schemas/atlas/tiers/bahamas.json /classifications/3 |
| bahamas | BS-D-CENTRAL-ANDROS | municipal | schemas/atlas/tiers/bahamas.json /classifications/4 |

Justin decision (choose one; none selected):

- [ ] Approve policy as written, including the stated residual flags.
- [ ] Amend policy; specify the rule and affected countries/IDs.
- [ ] Keep all category rows flagged.

Reviewer/date and amendments: ____________________

### federal_district_scope — 2 offices

**Proposed tier:** regional. Keep the supplied federal-district governor and legislative chamber together with the regional executive/chamber institutions.

**Flag handling:** Clear both flags after acceptance of the two exact institution bindings; keep ordinary district wards outside this rule.

**Over-promotion and grouping risks:** Promoting every district-named local body; manufacturing a national legislature from a federal-district title.

| Country | Existing office ID | Current draft tier | Classification pointer |
| --- | --- | --- | --- |
| brazil | BR-DF-G | regional | schemas/atlas/tiers/brazil.json /classifications/12 |
| brazil | BR-DF-A | regional | schemas/atlas/tiers/brazil.json /classifications/13 |

This category has only 2 source records; these are the complete exemplar set.

Justin decision (choose one; none selected):

- [ ] Approve policy as written, including the stated residual flags.
- [ ] Amend policy; specify the rule and affected countries/IDs.
- [ ] Keep all category rows flagged.

Reviewer/date and amendments: ____________________

### historical_boundary_binding — 315 offices

**Proposed tier:** existing municipal or other. Keep the existing institution-based proposal: 312 municipal and three other. Historical status does not change the level of a known institution. This category cannot assign a current successor or boundary.

**Flag handling:** Keep human_review_required=true for all 315. tier_uncertain may be false when the institution-level rule is accepted, but the historical binding remains unresolved in its own queue. Do not mark that queue resolved through a tier vote.

**Over-promotion and grouping risks:** Erasing predecessor identities, asserting unchanged boundaries or including archival offices in current regional/municipal coverage.

| Country | Existing office ID | Current draft tier | Classification pointer |
| --- | --- | --- | --- |
| argentina | AR-SF-M-BELGRANO-ARMSTRONG | municipal | schemas/atlas/tiers/argentina.json /classifications/138 |
| costa-rica | CR-I-PUNTARENAS-PUNTARENAS-MONTEVERDE | other | schemas/atlas/tiers/costa-rica.json /classifications/666 |
| ecuador | EC-J-14-590-3830 | other | schemas/atlas/tiers/ecuador.json /classifications/999 |
| el-salvador | SV-OLD-1-1 | municipal | schemas/atlas/tiers/el-salvador.json /classifications/0 |
| guyana | GY-HIST-KITTYPROVIDENCE | municipal | schemas/atlas/tiers/guyana.json /classifications/80 |

Justin decision (choose one; none selected):

- [ ] Approve policy as written, including the stated residual flags.
- [ ] Amend policy; specify the rule and affected countries/IDs.
- [ ] Keep all category rows flagged.

Reviewer/date and amendments: ____________________

### historical_institution_unresolved — 99 offices

**Proposed tier:** unknown. Keep all 99 generic historical institution records unknown. A reviewed unknown maps to SQL NULL/unknown, never other.

**Flag handling:** Keep both flags true until exact institutional evidence resolves the label. A later file may explicitly accept continued unknowns; that does not assert their tier is known.

**Over-promotion and grouping risks:** Guessing municipality from a code prefix or making unknown records other simply to pass a coverage gate.

| Country | Existing office ID | Current draft tier | Classification pointer |
| --- | --- | --- | --- |
| argentina | AR-ER-LEGACY-1-0080C-V | unknown | schemas/atlas/tiers/argentina.json /classifications/1027 |
| costa-rica | CR-D-ALAJUELA-GRECIA-RIO-CUARTO | unknown | schemas/atlas/tiers/costa-rica.json /classifications/667 |
| trinidad-and-tobago | TT-HIST-W-CHAGUANAS-EDINBURGH-LONGDENVILLE | unknown | schemas/atlas/tiers/trinidad-and-tobago.json /classifications/155 |
| argentina | AR-ER-LEGACY-1-0085C-V | unknown | schemas/atlas/tiers/argentina.json /classifications/1028 |
| argentina | AR-ER-LEGACY-1-0086C-V | unknown | schemas/atlas/tiers/argentina.json /classifications/1029 |

Justin decision (choose one; none selected):

- [ ] Approve policy as written, including the stated residual flags.
- [ ] Amend policy; specify the rule and affected countries/IDs.
- [ ] Keep all category rows flagged.

Reviewer/date and amendments: ____________________

### island_institution — 7 offices

**Proposed tier:** other, provisional. Retain the seven supplied island-institution proposals as other while the regional-versus-other institutional question remains open. An island label alone is not a category rule sufficient to clear it.

**Flag handling:** Keep both flags true for all seven. Review Barbuda separately from Nevis; clear only after Justin accepts an evidence-supported institutional disposition. Nevis assembly constituencies follow their assembly, not their geographic size.

**Over-promotion and grouping risks:** Calling a subnational island assembly national; undercounting a regional institution by treating island as proof of other; confusing an aggregate assembly with five additional governments.

| Country | Existing office ID | Current draft tier | Classification pointer |
| --- | --- | --- | --- |
| antigua-and-barbuda | AG-BARBUDA-COUNCIL | other | schemas/atlas/tiers/antigua-and-barbuda.json /classifications/0 |
| saint-kitts-and-nevis | KN-NEVIS-ASSEMBLY | other | schemas/atlas/tiers/saint-kitts-and-nevis.json /classifications/0 |
| saint-kitts-and-nevis | KN-NEVIS-1 | other | schemas/atlas/tiers/saint-kitts-and-nevis.json /classifications/1 |
| saint-kitts-and-nevis | KN-NEVIS-2 | other | schemas/atlas/tiers/saint-kitts-and-nevis.json /classifications/2 |
| saint-kitts-and-nevis | KN-NEVIS-3 | other | schemas/atlas/tiers/saint-kitts-and-nevis.json /classifications/3 |

Justin decision (choose one; none selected):

- [ ] Approve policy as written, including the stated residual flags.
- [ ] Amend policy; specify the rule and affected countries/IDs.
- [ ] Keep all category rows flagged.

Reviewer/date and amendments: ____________________

### local_council_component — 83 offices

**Proposed tier:** municipal. Keep Guyana PR-component records with their local council institutions. A PR component is an office/ballot representation, not another geographic tier.

**Flag handling:** Clear tier_uncertain after acceptance for all 83. Clear human_review_required for the 80 current records; retain it on the three historical-boundary records. Keep component-only and council-size caveats.

**Over-promotion and grouping risks:** Promoting a locality to regional because its containing Region appears in a name; mistaking component seats for whole-council majority or adding overlapping components.

| Country | Existing office ID | Current draft tier | Classification pointer |
| --- | --- | --- | --- |
| guyana | GY-PR-2.06 | municipal | schemas/atlas/tiers/guyana.json /classifications/0 |
| guyana | GY-PR-6.14 | municipal | schemas/atlas/tiers/guyana.json /classifications/1 |
| guyana | GY-PR-2.07 | municipal | schemas/atlas/tiers/guyana.json /classifications/2 |
| guyana | GY-PR-9.02 | municipal | schemas/atlas/tiers/guyana.json /classifications/3 |
| guyana | GY-PR-5.07 | municipal | schemas/atlas/tiers/guyana.json /classifications/4 |

Justin decision (choose one; none selected):

- [ ] Approve policy as written, including the stated residual flags.
- [ ] Amend policy; specify the rule and affected countries/IDs.
- [ ] Keep all category rows flagged.

Reviewer/date and amendments: ____________________

### rural_local_government — 338 offices

**Proposed tier:** municipal. Treat the 338 named rural juntas, communal executives and fomento/development commissions as municipality-equivalent local-government institutions for Atlas grouping. This is a taxonomy proposal, not a declaration that every locality has identical legal powers.

**Flag handling:** Clear the category tier flags after acceptance of the explicit named local institutions. Keep source notes about provisional rosters, proclamation gaps, boundaries, electoral activity and future calls. An office lacking even an institutional binding must return to review.

**Over-promotion and grouping risks:** Calling every rural commission general-purpose government regardless of remit; assuming elected activity/current tenure or promoting to province level.

| Country | Existing office ID | Current draft tier | Classification pointer |
| --- | --- | --- | --- |
| argentina | AR-ER-1-COLONIACELINA-V | municipal | schemas/atlas/tiers/argentina.json /classifications/760 |
| argentina | AR-ER-1-SANTALUISA-V | municipal | schemas/atlas/tiers/argentina.json /classifications/761 |
| argentina | AR-ER-1-QUEBRACHOALDEASANANTONIO-V | municipal | schemas/atlas/tiers/argentina.json /classifications/762 |
| argentina | AR-ER-1-PASODELASPIEDRASPASODELAARENA-V | municipal | schemas/atlas/tiers/argentina.json /classifications/763 |
| argentina | AR-ER-1-DISTRITOTALAARROYOMATURRANGO-V | municipal | schemas/atlas/tiers/argentina.json /classifications/764 |

Justin decision (choose one; none selected):

- [ ] Approve policy as written, including the stated residual flags.
- [ ] Amend policy; specify the rule and affected countries/IDs.
- [ ] Keep all category rows flagged.

Reviewer/date and amendments: ____________________

### school_district — 14 offices

**Proposed tier:** other. Keep the 14 separately named school-district councils in other as special-purpose institutions.

**Flag handling:** Clear the tier flags after acceptance of the stated school purpose. Keep roster/boundary/returns gaps separately; this does not verify them.

**Over-promotion and grouping risks:** Treating education districts as general-purpose municipalities or provincial legislatures; using district count as a regional universe.

| Country | Existing office ID | Current draft tier | Classification pointer |
| --- | --- | --- | --- |
| argentina | AR-NQ-SCHOOL-DISTRICT-01-CE | other | schemas/atlas/tiers/argentina.json /classifications/2139 |
| argentina | AR-NQ-SCHOOL-DISTRICT-02-CE | other | schemas/atlas/tiers/argentina.json /classifications/2140 |
| argentina | AR-NQ-SCHOOL-DISTRICT-03-CE | other | schemas/atlas/tiers/argentina.json /classifications/2141 |
| argentina | AR-NQ-SCHOOL-DISTRICT-04-CE | other | schemas/atlas/tiers/argentina.json /classifications/2142 |
| argentina | AR-NQ-SCHOOL-DISTRICT-05-CE | other | schemas/atlas/tiers/argentina.json /classifications/2143 |

Justin decision (choose one; none selected):

- [ ] Approve policy as written, including the stated residual flags.
- [ ] Amend policy; specify the rule and affected countries/IDs.
- [ ] Keep all category rows flagged.

Reviewer/date and amendments: ____________________

### special_provincial_body — 10 offices

**Proposed tier:** regional. Keep the nine explicitly provincial constitutional-convention delegations and one provincial audit tribunal at the provincial institution level. Office type remains separate from tier.

**Flag handling:** Clear the institutional tier flags after acceptance; retain temporary-body, mandate and special-ballot distinctions. No current tenure or regular renewal is inferred.

**Over-promotion and grouping risks:** Turning conventions into ordinary legislatures; moving provincial seats to municipal because a delegation is geographically small; counting temporary bodies as permanent coverage.

| Country | Existing office ID | Current draft tier | Classification pointer |
| --- | --- | --- | --- |
| argentina | AR-CB-CORDOBA-TP | regional | schemas/atlas/tiers/argentina.json /classifications/3040 |
| argentina | AR-SL-AYACUCHO-CONV | regional | schemas/atlas/tiers/argentina.json /classifications/3492 |
| argentina | AR-SL-BELGRANO-CONV | regional | schemas/atlas/tiers/argentina.json /classifications/3494 |
| argentina | AR-SL-CHACABUCO-CONV | regional | schemas/atlas/tiers/argentina.json /classifications/3495 |
| argentina | AR-SL-CORONEL-PRINGLES-CONV | regional | schemas/atlas/tiers/argentina.json /classifications/3498 |

Justin decision (choose one; none selected):

- [ ] Approve policy as written, including the stated residual flags.
- [ ] Amend policy; specify the rule and affected countries/IDs.
- [ ] Keep all category rows flagged.

Reviewer/date and amendments: ____________________

### submunicipal_scope — 5,940 offices

**Proposed tier:** other. Use other for the distinct subordinate/community/parish/section/district institutions in this exact category. Keep them out of the municipality-level numerator while retaining their named office types. This includes populated-centre municipal slates: other is an Atlas grouping, not a claim that their legal title lacks municipal status.

**Flag handling:** On policy acceptance clear tier_uncertain for all 5,940. Clear human_review_required only where no independent identity/boundary hold remains. Retain it for 1,004 provisional Haiti section IDs and 3 historical members of this category ({'costa-rica': 1, 'ecuador': 2}). Exact IDs and overlapping holds are enumerated in the appendix.

**Over-promotion and grouping risks:** Inflating municipality or regional coverage by treating subordinate bodies as peer governments; conversely hiding genuine local institutions behind an unlabeled other bucket. Keep office_type and an explicit subordinate-body label available; do not manufacture parents.

| Country | Existing office ID | Current draft tier | Classification pointer |
| --- | --- | --- | --- |
| peru | PE-MCP-010106001 | other | schemas/atlas/tiers/peru.json /classifications/1942 |
| haiti | HT-M-ANSEAPITRES-CASEC-01 | other | schemas/atlas/tiers/haiti.json /classifications/149 |
| ecuador | EC-J-1-260-285 | other | schemas/atlas/tiers/ecuador.json /classifications/465 |
| costa-rica | CR-D-ALAJUELA-ALAJUELA-ALAJUELA | other | schemas/atlas/tiers/costa-rica.json /classifications/84 |
| new-zealand | NZ-CLUTHA-LAWRENCE-TUAPEKA-2026 | other | schemas/atlas/tiers/new-zealand.json /classifications/1 |

Justin decision (choose one; none selected):

- [ ] Approve policy as written, including the stated residual flags.
- [ ] Amend policy; specify the rule and affected countries/IDs.
- [ ] Keep all category rows flagged.

Reviewer/date and amendments: ____________________

## Submunicipal scope batches

Do not silently convert all 5,940 rows to municipal. The recommended other policy is a deliberate, consistent conservative grouping; Justin may amend it to a broader municipal umbrella. Such an amendment must enumerate the affected exact IDs and produce a separate proposed tier-value diff. Never treat an unaccepted amendment as applied. The subgroup counts below avoid a global blind approval while permitting institution-level batch review.

| Country | Category rows | Proposed tier | Residual identity/history flags after policy |
| --- | --- | --- | --- |
| argentina | 15 | other | 0 |
| colombia | 37 | other | 0 |
| costa-rica | 499 | other | 1 |
| dominican-republic | 470 | other | 0 |
| ecuador | 828 | other | 2 |
| haiti | 1004 | other | 1004 |
| new-zealand | 1 | other | 0 |
| peru | 3086 | other | 0 |

## PROPOSED patch appendix — never applied

`Tier_Category_PROPOSED_Patch_Appendix.json` enumerates all 6,851 focused IDs with the expected original tier/flags, exact draft-file SHA-256 and classification pointer, proposed flags, required policy decisions and residual questions. **It changes no tier values and no file status.** It is a review appendix, not an executable patch or importer file. All entries have applied=false.

If Justin later accepts a policy, use the appendix to prepare a separate reviewed update: verify file hash and ID binding; apply only the accepted policy scope; preserve overlapping unresolved categories; amend the row rationale to cite the accepted policy rather than leaving “pending policy review” language; reconcile the human-review fragment; recompute hashes and inventories. Do not mark historical/island/provisional identity questions resolved merely because the geographic tier question is resolved. If the baseline changes, regenerate the diff against the new bytes rather than bypass expected-original guards.

No bulk operation may add offices, alter event dates, change frozen office status, claim boundary continuity, normalize scores, rewrite Albania, or set status=approved without a separate explicit Justin pack decision. Proposed approval order is in Phase2_Tier_Approval_Batches.md. Import/publication/citation CI remains unrun and required.
